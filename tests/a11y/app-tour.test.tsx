import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AppTourProvider, TourLaunchButton, readTourProgress } from '@/components/tour/AppTour';
import { TOUR_STEPS } from '@/components/tour/steps';
import { TourChatExample } from '@/components/tour/TourChatExample';

const mocks = vi.hoisted(() => ({ path: '/', push: vi.fn(), replace: vi.fn(), get: vi.fn(), post: vi.fn(), remove: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => mocks.path, useRouter: () => ({ push: mocks.push, replace: mocks.replace }), Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock('@/lib/api/client', () => ({ api: { get: mocks.get, post: mocks.post, delete: mocks.remove } }));

function savedStep(id: string, extra = {}) {
  const index = TOUR_STEPS.findIndex((step) => step.id === id);
  mocks.path = TOUR_STEPS[index]!.path;
  sessionStorage.setItem('accessai-app-tour-v1', JSON.stringify({ index, paused: false, role: 'citizen', sampleChat: false, planReady: false, ...extra }));
}
function setup(example = false) {
  return render(<NextIntlClientProvider locale="en" messages={{}}><AppTourProvider><main><header>Page</header>{example ? <TourChatExample /> : null}</main><TourLaunchButton /></AppTourProvider></NextIntlClientProvider>);
}

describe('guided app tour', () => {
  beforeEach(() => { sessionStorage.clear(); mocks.path = '/'; vi.clearAllMocks(); mocks.remove.mockResolvedValue({}); mocks.post.mockResolvedValue({}); mocks.get.mockResolvedValue({ opportunity: { id: 'programme-demo' } }); });

  it('ignores corrupted or out-of-range resume state', () => {
    expect(readTourProgress('{broken')).toBeNull();
    expect(readTourProgress(JSON.stringify({ index: 999, paused: false, role: 'admin', sampleChat: true, planReady: true }))).toBeNull();
    setup(); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts only on request and pauses with Escape, preserving progress', async () => {
    setup(); fireEvent.click(screen.getAllByRole('button', { name: 'App tour' })[0]!);
    expect(await screen.findByRole('heading', { name: 'Welcome to Nagorik Shathi' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(readTourProgress(sessionStorage.getItem('accessai-app-tour-v1'))?.paused).toBe(true);
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('resumes the saved step without restarting or performing authentication', async () => {
    savedStep('login', { paused: true, role: null }); setup();
    fireEvent.click(screen.getAllByRole('button', { name: 'Resume tour' })[0]!);
    expect(await screen.findByRole('heading', { name: 'Simulated citizen sign-in' })).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('uses normal seeded authentication, never OTP or a bypass, and keeps failures recoverable', async () => {
    savedStep('login', { role: null }); mocks.post.mockRejectedValueOnce(new Error('Account unavailable')); setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Demo sign in' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/auth/login', { phone: '01712345678', pin: '1234' }, { retryOnUnauthenticated: false }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not prepare the demo');
    expect(readTourProgress(sessionStorage.getItem('accessai-app-tour-v1'))?.index).toBe(TOUR_STEPS.findIndex((step) => step.id === 'login'));
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('prepares the example only through existing saved and plan APIs', async () => {
    savedStep('evidence'); setup(); fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/saved', { opportunityId: 'programme-demo' }));
    expect(mocks.post).toHaveBeenCalledWith('/action-plans', { opportunityId: 'programme-demo' });
    expect(mocks.push).toHaveBeenCalledWith('/saved');
    expect(readTourProgress(sessionStorage.getItem('accessai-app-tour-v1'))?.planReady).toBe(true);
  });

  it('shows a local sample response without sending chat to AI or changing a profile', async () => {
    savedStep('sample-question'); mocks.get.mockRejectedValueOnce(new Error('Example unavailable')); setup(true);
    fireEvent.click(await screen.findByRole('button', { name: 'Show example' }));
    expect(await screen.findByText('App tour · Local simulated response')).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.get).toHaveBeenCalledWith('/opportunities/widow-allowance');
  });

  it('does not advance into staff pages when the normal admin sign-in fails', async () => {
    savedStep('settings'); mocks.post.mockRejectedValueOnce(new Error('Admin unavailable')); setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Admin demo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not prepare the demo');
    expect(mocks.post).toHaveBeenCalledWith('/auth/login', { phone: '01512345678', pin: '4321' }, { retryOnUnauthenticated: false });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('repairs a stalled registration screen when Next is clicked', async () => {
    savedStep('registration'); mocks.path = '/'; setup();
    const next = await screen.findByRole('button', { name: 'Next' });
    const assign = vi.fn();
    const originalWindow = window;
    vi.stubGlobal('window', new Proxy(originalWindow, { get(target, key) {
      if (key === 'location') return { assign };
      const value = Reflect.get(target, key);
      return typeof value === 'function' ? value.bind(target) : value;
    } }));
    try {
      fireEvent.click(next);
      expect(assign).toHaveBeenCalledWith('/en/register');
      expect(mocks.post).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });
});
