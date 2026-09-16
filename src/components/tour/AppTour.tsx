'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Compass, ChevronLeft, ArrowRight, Pause, X, RotateCcw, Play, LoaderCircle } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { api } from '@/lib/api/client';
import { TOUR_STEPS, type TourAction } from './steps';

const STORAGE_KEY = 'accessai-app-tour-v1';
interface Progress { index: number; paused: boolean; role: 'citizen' | 'admin' | null; sampleChat: boolean; planReady: boolean }
interface TourContextValue { start: () => void; resume: () => void; progress: Progress | null; active: boolean }
const TourContext = createContext<TourContextValue | null>(null);
export const useAppTour = () => useContext(TourContext);

export function readTourProgress(raw: string | null): Progress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Progress;
    if (!Number.isInteger(value.index) || value.index < 0 || value.index >= TOUR_STEPS.length || typeof value.paused !== 'boolean' || ![null, 'citizen', 'admin'].includes(value.role) || typeof value.sampleChat !== 'boolean' || typeof value.planReady !== 'boolean') return null;
    return value;
  } catch { return null; }
}

export function TourLaunchButton({ className = '' }: { readonly className?: string }) {
  const tour = useAppTour();
  const bn = useLocale() === 'bn';
  if (!tour) return null;
  return <button type="button" onClick={tour.progress ? tour.resume : tour.start} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-stroke-brand bg-surface px-4 type-label-md text-text-brand hover:bg-surface-brand-subtle ${className}`}><Compass size={20} aria-hidden="true" />{tour.progress ? (bn ? 'ট্যুর চালিয়ে যান' : 'Resume tour') : (bn ? 'অ্যাপ ট্যুর' : 'App tour')}</button>;
}

export function AppTourProvider({ children }: { readonly children: ReactNode }) {
  const locale = useLocale();
  const bn = locale === 'bn';
  const language = bn ? 1 : 0;
  const router = useRouter();
  const pathname = usePathname();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = progress ? TOUR_STEPS[progress.index] : null;
  const active = Boolean(progress && !progress.paused);

  // A stalled client transition must not leave the tour on the wrong screen.
  // Session storage preserves the current step across this navigation fallback.
  const openStep = () => {
    if (step) window.location.assign(`/${locale}${step.path === '/' ? '' : step.path}`);
  };
  useEffect(() => {
    if (!ready || !active || !step || pathname === step.path || busy) return;
    const timeout = setTimeout(() => {
      window.location.assign(`/${locale}${step.path === '/' ? '' : step.path}`);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [ready, active, step, pathname, locale, busy]);

  useEffect(() => {
    try { setProgress(readTourProgress(sessionStorage.getItem(STORAGE_KEY))); } catch { /* Storage can be disabled; the tour still works in this tab. */ }
    setReady(true);
  }, []);

  const persist = (next: Progress | null) => {
    setProgress(next);
    try { if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); else sessionStorage.removeItem(STORAGE_KEY); } catch { /* Best-effort resume. */ }
  };

  const login = async (role: 'citizen' | 'admin') => {
    // Uses the documented seeded accounts through normal authentication. No demo bypass.
    await api.delete('/auth/session');
    await api.post('/auth/login', { phone: role === 'citizen' ? '01712345678' : '01512345678', pin: role === 'citizen' ? '1234' : '4321' }, { retryOnUnauthenticated: false });
  };

  const preparePlan = async () => {
    const detail = await api.get<{ opportunity: { id: string } }>('/opportunities/widow-allowance');
    await api.post('/saved', { opportunityId: detail.opportunity.id });
    // Existing plan generation is idempotent; repeated presentations reuse the plan.
    await api.post('/action-plans', { opportunityId: detail.opportunity.id });
  };

  const go = async (index: number, action?: TourAction) => {
    if (!progress || busy || index < 0 || index >= TOUR_STEPS.length) return;
    if (pathname !== TOUR_STEPS[progress.index]!.path) {
      // Recover the current screen instead of silently ignoring Next/Back.
      openStep();
      return;
    }
    const nextStep = TOUR_STEPS[index]!;
    const next = { ...progress, index, paused: false };
    setBusy(true); setError('');
    let authenticationChanged = false;
    try {
      const requiredRole = nextStep.chapter === 'Admin' ? 'admin' : nextStep.chapter === 'Citizen' || nextStep.chapter === 'Opportunities' ? 'citizen' : null;
      const targetRole = action === 'citizen-login' ? 'citizen' : action === 'admin-login' ? 'admin' : requiredRole;
      if (targetRole && (targetRole !== next.role || action === 'citizen-login' || action === 'admin-login')) {
        await login(targetRole); next.role = targetRole; authenticationChanged = true;
        // Persist ownership immediately, including if preparation subsequently fails.
        persist({ ...progress, role: targetRole });
      }
      if (action === 'sample-chat') next.sampleChat = true;
      if (action === 'prepare-plan' || (['saved', 'plan'].includes(nextStep.id) && !next.planReady)) {
        await preparePlan(); next.planReady = true;
      }
      persist(next);
      if (authenticationChanged) window.location.assign(`/${locale}${nextStep.path === '/' ? '' : nextStep.path}`);
      else if (pathname !== nextStep.path) router.push(nextStep.path);
    } catch (reason) {
      setError(`${bn ? 'ডেমো প্রস্তুত হয়নি। আবার চেষ্টা করুন। নমুনা অ্যাকাউন্ট ও কর্মসূচি seed করা থাকতে হবে।' : 'Could not prepare the demo. Try again; the sample accounts and programme must be seeded.'} ${reason instanceof Error ? reason.message : ''}`);
    } finally { setBusy(false); }
  };

  const pause = () => { if (progress) persist({ ...progress, paused: true }); setRect(null); };
  const finish = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (progress?.role) {
        const session = await api.get<{ authenticated: boolean; user?: { phone: string } }>('/auth/session');
        // Never sign out an unrelated account opened while the tour was paused.
        if (session.authenticated && ['01712345678', '01512345678'].includes(session.user?.phone ?? '')) await api.delete('/auth/session');
      }
      persist(null); window.location.assign(`/${locale}`);
    } catch { setError(bn ? 'ডেমো লগআউট হয়নি। আবার চেষ্টা করুন।' : 'Demo sign-out failed. Please try again.'); }
    finally { setBusy(false); }
  };

  const start = () => {
    const initial: Progress = { index: 0, paused: false, role: null, sampleChat: false, planReady: false };
    persist(initial); setError(''); if (pathname !== '/') router.push('/');
  };
  const resume = () => { if (progress) { persist({ ...progress, paused: false }); if (step && pathname !== step.path) router.push(step.path); } };

  useEffect(() => {
    if (!active || !step || pathname !== step.path) { setRect(null); return; }
    let target: HTMLElement | null = null;
    let frame = 0;
    const update = () => {
      if (!target?.isConnected) return;
      const bounds = target.getBoundingClientRect();
      setRect({ top: Math.max(4, bounds.top - 8), left: Math.max(4, bounds.left - 8), width: Math.min(window.innerWidth - 16, bounds.width + 16), height: Math.min(window.innerHeight - 12, bounds.height + 16) });
    };
    const locate = () => {
      target = [...document.querySelectorAll<HTMLElement>(step.id === 'sample-answer' ? '[data-tour="chat-example"]' : step.target)].find((element) => element.getClientRects().length > 0 && element.offsetHeight > 0) ?? null;
      if (target?.tagName === 'MAIN') target = target.querySelector<HTMLElement>('header, form') ?? target.firstElementChild as HTMLElement | null;
      if (!target) return;
      observer.disconnect();
      target.scrollIntoView({ behavior: 'instant', block: 'center' }); update();
      headingRef.current?.focus({ preventScroll: true });
    };
    const observer = new MutationObserver(locate);
    observer.observe(document.querySelector('main') ?? document.body, { childList: true, subtree: true });
    locate();
    const onMove = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener('resize', onMove); window.addEventListener('scroll', onMove, true);
    const timeout = setTimeout(() => { observer.disconnect(); if (!target) headingRef.current?.focus({ preventScroll: true }); }, 12000);
    return () => { observer.disconnect(); clearTimeout(timeout); cancelAnimationFrame(frame); window.removeEventListener('resize', onMove); window.removeEventListener('scroll', onMove, true); };
  }, [active, step, pathname]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) { event.preventDefault(); pause(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const chapterStarts = [...new Set(TOUR_STEPS.map((entry) => entry.chapter))].map((chapter) => ({ chapter, index: TOUR_STEPS.findIndex((entry) => entry.chapter === chapter) }));

  return <TourContext.Provider value={{ start, resume, progress, active }}>
    {children}
    {ready && !progress ? <div className={`tour-floating-launch ${pathname === '/' ? '' : 'hidden xl:block'}`}><TourLaunchButton /></div> : null}
    {ready && active && step && progress ? <>
      {rect ? <div className="tour-spotlight" aria-hidden="true" style={rect} /> : <div className="tour-soft-scrim" aria-hidden="true" />}
      <div ref={panelRef} className="tour-panel" role="dialog" aria-modal="false" aria-labelledby="tour-heading" aria-describedby="tour-body" onKeyDown={(event) => {
        if (event.target instanceof HTMLSelectElement) return;
        if (event.key === 'ArrowRight' && !busy && progress.index < TOUR_STEPS.length - 1) { event.preventDefault(); void go(progress.index + 1, step.action); }
        if (event.key === 'ArrowLeft' && !busy && progress.index > 0) { event.preventDefault(); void go(progress.index - 1); }
      }}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 type-label-md text-text-brand"><Compass size={20} aria-hidden="true" />{bn ? 'গাইডেড ডেমো' : 'Guided demo'}</span>
          <div className="flex gap-1"><button type="button" disabled={busy} onClick={pause} className="tour-icon-button" aria-label={bn ? 'ট্যুর বিরতি দিন' : 'Pause tour'}><Pause size={18} /></button><button type="button" disabled={busy} onClick={() => void finish()} className="tour-icon-button" aria-label={bn ? 'ট্যুর শেষ করুন' : 'Exit tour'}><X size={20} /></button></div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="sr-only" htmlFor="tour-chapter">{bn ? 'ট্যুরের অংশ' : 'Tour chapter'}</label>
          <select id="tour-chapter" value={step.chapter} disabled={busy} onChange={(event) => { const chapter = chapterStarts.find((entry) => entry.chapter === event.target.value); if (chapter) void go(chapter.index); }} className="min-h-12 rounded-md border border-stroke bg-surface px-3 type-label-md text-text-primary">
            {chapterStarts.map(({ chapter }) => <option key={chapter} value={chapter}>{bn ? ({ Start: 'পরিচিতি', Citizen: 'নাগরিক', Opportunities: 'সুযোগ ও পরিকল্পনা', Admin: 'প্রশাসন' }[chapter]) : chapter}</option>)}
          </select>
          <span className="type-caption tabular text-text-secondary" aria-live="polite">{progress.index + 1} / {TOUR_STEPS.length}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-pill bg-surface-sunken" role="progressbar" aria-label={bn ? 'ট্যুরের অগ্রগতি' : 'Tour progress'} aria-valuemin={0} aria-valuemax={TOUR_STEPS.length} aria-valuenow={progress.index + 1}><div className="h-full bg-ramp-green-600" style={{ width: `${(progress.index + 1) / TOUR_STEPS.length * 100}%` }} /></div>
        <h2 id="tour-heading" ref={headingRef} tabIndex={-1} className="type-heading-md text-text-primary">{step.title[language]}</h2>
        <p id="tour-body" className="type-body-md text-text-secondary">{step.body[language]}</p>
        <p className="rounded-md border border-stroke-subtle bg-surface-brand-subtle p-3 type-body-md text-text-brand">{step.cue[language]}</p>
        {step.id === 'login' ? <div className="rounded-md border border-stroke-subtle p-3 type-body-md"><p>{bn ? 'নমুনা মোবাইল' : 'Sample phone'}: 01712345678</p><p>PIN: ••••</p></div> : null}
        {error ? <p role="alert" className="type-body-md text-text-error">{error}</p> : null}
        {pathname !== step.path ? <button type="button" onClick={openStep} className="min-h-12 type-label-md text-text-brand">{bn ? 'স্ক্রিন খুলছে… আবার খুলুন' : 'Opening screen… Retry navigation'}</button> : null}
        <div className="flex items-center justify-between gap-3">
          <button type="button" disabled={progress.index === 0 || busy} onClick={() => void go(progress.index - 1)} className="inline-flex min-h-12 items-center gap-1 rounded-md border border-stroke px-3 type-label-md text-text-primary disabled:opacity-40"><ChevronLeft size={18} aria-hidden="true" />{bn ? 'পেছনে' : 'Back'}</button>
          <button type="button" disabled={busy} onClick={() => progress.index === TOUR_STEPS.length - 1 ? void finish() : void go(progress.index + 1, step.action)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ramp-green-600 px-4 type-label-md text-white hover:bg-ramp-green-700 disabled:opacity-60">{busy ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}{busy ? (bn ? 'প্রস্তুত হচ্ছে…' : 'Preparing…') : progress.index === TOUR_STEPS.length - 1 ? (bn ? 'শেষ করুন' : 'Finish') : step.action === 'citizen-login' ? (bn ? 'ডেমো লগইন' : 'Demo sign in') : step.action === 'admin-login' ? (bn ? 'প্রশাসকের ডেমো' : 'Admin demo') : step.action === 'sample-chat' ? (bn ? 'উদাহরণ দেখুন' : 'Show example') : (bn ? 'পরবর্তী' : 'Next')}<ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-stroke-subtle pt-2 type-caption text-text-secondary"><span>{bn ? 'Esc: বিরতি · ← →: ধাপ' : 'Esc: pause · ← →: steps'}</span><button type="button" disabled={busy} onClick={() => void go(0)} className="inline-flex min-h-12 items-center gap-1 px-2 text-text-brand"><RotateCcw size={14} aria-hidden="true" />{bn ? 'আবার শুরু' : 'Restart'}</button></div>
      </div>
    </> : null}
    {ready && progress?.paused ? <div className="tour-resume-bar"><button type="button" onClick={resume} className="inline-flex min-h-12 items-center gap-2 px-3 type-label-md text-text-brand"><Play size={18} aria-hidden="true" />{bn ? 'ট্যুর চালিয়ে যান' : 'Resume tour'} · {progress.index + 1}/{TOUR_STEPS.length}</button><button type="button" onClick={() => void finish()} disabled={busy} className="tour-icon-button" aria-label={bn ? 'ট্যুর শেষ করুন' : 'Exit tour'}><X size={18} /></button>{error ? <p role="alert" className="type-caption text-text-error">{error}</p> : null}</div> : null}
  </TourContext.Provider>;
}
