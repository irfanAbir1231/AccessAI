import { getTranslations, setRequestLocale } from 'next-intl/server';
import { asc } from 'drizzle-orm';
import {
  GraduationCap, HeartPulse, Landmark, HandHeart, Sprout, Store, Scale, Briefcase,
  ShieldCheck, FileSearch, MessageSquareQuote, HelpCircle, ArrowRight,
} from 'lucide-react';
import { db } from '@/lib/db/client';
import { lifeEventCatalog } from '@/lib/db/schema';
import { countByCategory } from '@/modules/opportunities/opportunity.service';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Card, Section } from '@/components/primitives/Card';
import { Num } from '@/components/primitives/Money';
import { getSession } from '@/lib/http/session';
import type { AppLocale } from '@/i18n/routing';
import { CitizenPortalVisual } from '@/components/layout/CitizenPortalVisual';
import { BrandLogo } from '@/components/layout/BrandLogo';

/**
 * Landing page — PRD §58.
 *
 * Structured around PRD §1.6: instead of asking which department the citizen
 * wants, it asks what happened in their life. The life-event grid is therefore
 * the primary call to action, placed above the feature list, and each chip
 * carries a live count so a citizen never taps into an empty result.
 */

const CATEGORY_ICONS: Record<string, typeof GraduationCap> = {
  scholarship: GraduationCap,
  healthcare: HeartPulse,
  social_welfare: HandHeart,
  agriculture: Sprout,
  business: Store,
  legal_aid: Scale,
  employment: Briefcase,
  financial: Landmark,
  training: FileSearch,
  disaster: ShieldCheck,
  research: MessageSquareQuote,
};

const CATEGORY_LABELS: Record<string, { bn: string; en: string }> = {
  scholarship: { bn: 'বৃত্তি ও শিক্ষা', en: 'Scholarships and education' },
  healthcare: { bn: 'চিকিৎসা', en: 'Healthcare' },
  social_welfare: { bn: 'ভাতা ও সামাজিক সহায়তা', en: 'Allowances and social support' },
  agriculture: { bn: 'কৃষি', en: 'Agriculture' },
  business: { bn: 'ব্যবসা ও উদ্যোগ', en: 'Business and enterprise' },
  legal_aid: { bn: 'আইনি সহায়তা', en: 'Legal aid' },
  employment: { bn: 'কাজ ও প্রশিক্ষণ', en: 'Work and training' },
  financial: { bn: 'ব্যাংক ও ঋণ', en: 'Banking and loans' },
  training: { bn: 'দক্ষতা প্রশিক্ষণ', en: 'Skills training' },
  disaster: { bn: 'দুর্যোগ সহায়তা', en: 'Disaster support' },
  research: { bn: 'গবেষণা', en: 'Research' },
};

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const bn = locale === 'bn';

  const t = await getTranslations('landing');
  const tc = await getTranslations('common');

  const [events, categoryCounts, session] = await Promise.all([
    db
      .select({
        code: lifeEventCatalog.code,
        label: lifeEventCatalog.label,
        labelBn: lifeEventCatalog.labelBn,
        description: lifeEventCatalog.description,
        descriptionBn: lifeEventCatalog.descriptionBn,
      })
      .from(lifeEventCatalog)
      .orderBy(asc(lifeEventCatalog.sortOrder)),
    countByCategory(),
    getSession(),
  ]);

  const totalProgrammes = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="portal-landing min-h-screen bg-canvas">
      {/* ---------------------------------------------------------- header */}
      <header className="portal-public-header sticky top-0 z-appbar border-b border-stroke-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-content items-center justify-between gap-3 px-4 md:px-5">
          <span className="flex min-w-0 items-center gap-2">
            <BrandLogo />
            <span className="type-heading-sm min-w-0 truncate text-text-primary">{tc('appName')}</span>
          </span>
          <nav className="hidden items-center gap-6 xl:flex" aria-label={bn ? 'প্রধান নেভিগেশন' : 'Main navigation'}>
            <a href="#life-events" className="portal-nav-link">{bn ? 'জীবনের পরিবর্তন' : 'Life events'}</a>
            <Link href="/opportunities" className="portal-nav-link">{t('browseProgrammes')}</Link>
            <a href="#how-it-works" className="portal-nav-link">{t('howItWorks')}</a>
            <a href="#citizen-support" className="portal-nav-link">{bn ? 'সহায়তা' : 'Support'}</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher compact />
            <Link
              href={session ? '/dashboard' : '/login'}
              className="inline-flex min-h-12 items-center rounded-md bg-ramp-green-600 px-4 type-label-lg text-white hover:bg-ramp-green-700 focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-2"
            >
              {session ? tc('viewAll') : tc('signIn')}
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ------------------------------------------------------- hero */}
        <section className="portal-hero px-4 py-10 md:px-5 xl:py-16">
          <CitizenPortalVisual bn={bn} />
          <div className="portal-hero-content mx-auto grid max-w-content items-center gap-8 xl:grid-cols-2">
            <div className="max-w-text">
              <p className="portal-eyebrow"><span className="h-2 w-2 rounded-pill bg-ramp-green-600" />{tc('tagline')}</p>
              <h1 className="portal-hero-title mt-5 text-text-primary">{t('heroTitle')}</h1>
              <p className="type-body-lg mt-5 max-w-form text-text-secondary">{t('heroBody')}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={session ? '/chat' : '/register'}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-ramp-green-600 px-6 type-label-lg text-white shadow-elev-2 hover:bg-ramp-green-700 focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-2"
                >
                  {t('startConversation')}
                  <ArrowRight size={24} className="icon" aria-hidden="true" />
                </Link>
                <Link
                  href="/opportunities"
                  className="inline-flex min-h-14 items-center justify-center rounded-md border-1.5 border-stroke bg-surface px-6 type-label-lg text-text-brand hover:bg-surface-brand-subtle focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-2"
                >
                  {t('browseProgrammes')}
                </Link>
              </div>

              <p className="type-body-md mt-6 text-text-secondary">
                <Num value={totalProgrammes} />{' '}
                {bn ? 'কর্মসূচি, ৬৪ জেলা, ২ ভাষা।' : 'programmes · 64 districts · 2 languages.'}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ life events */}
        <section id="life-events" className="portal-service-section mx-auto max-w-content px-4 py-10 md:px-5">
          <p className="portal-kicker">{bn ? 'সঠিক সহায়তা খুঁজে নিন' : 'Find the support you need'}</p>
          <h2 className="type-heading-lg text-text-primary">{t('lifeEventsTitle')}</h2>
          <p className="type-body-lg mt-2 text-text-secondary measure">{t('lifeEventsBody')}</p>

          <ul className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <li key={event.code}>
                <Link
                  href={{ pathname: '/opportunities', query: { lifeEvent: event.code } }}
                  className="portal-service-card group flex min-h-20 items-start gap-3 rounded-lg border border-stroke-subtle bg-surface p-5 shadow-elev-1 transition-colors duration-fast hover:border-stroke-brand hover:bg-surface-brand-subtle focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-2"
                >
                  <span className="portal-icon shrink-0" aria-hidden="true"><HandHeart size={23} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="type-body-lg block text-text-primary">
                      {bn ? event.labelBn : event.label}
                    </span>
                    <span className="type-body-md mt-1 block text-text-secondary">
                      {bn ? event.descriptionBn : event.description}
                    </span>
                  </span>
                  <ArrowRight
                    size={20}
                    className="icon mt-1 shrink-0 text-text-secondary transition-transform duration-fast group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ how it works */}
        <section id="how-it-works" className="portal-process bg-surface px-4 py-10 md:px-5">
          <div className="mx-auto max-w-content">
            <h2 className="type-heading-lg text-text-primary">{t('howItWorks')}</h2>
            <ol className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((step) => (
                <li key={step} className="portal-step flex flex-col gap-3 rounded-lg border border-stroke-subtle bg-canvas p-5">
                  {/* Numbered circles, not abstract dots — BDS §9.5 maps this
                      onto the USSD menu model citizens already have. */}
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-pill bg-ramp-green-600 type-label-lg tabular text-white"
                  >
                    {step}
                  </span>
                  <span className="type-heading-sm text-text-primary">{t(`step${step}Title`)}</span>
                  <span className="type-body-md text-text-secondary">{t(`step${step}Body`)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------- categories */}
        <Section
          title={t('categoriesTitle')}
          className="portal-categories mx-auto max-w-content px-4 py-10 md:px-5"
          headingLevel="h2"
        >
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([category, n]) => {
                const Icon = CATEGORY_ICONS[category] ?? Landmark;
                const label = CATEGORY_LABELS[category];
                return (
                  <li key={category}>
                    <Link
                      href={{ pathname: '/opportunities', query: { category } }}
                      className="portal-service-card flex min-h-20 items-center gap-3 rounded-lg border border-stroke-subtle bg-surface p-5 shadow-elev-1 transition-colors duration-fast hover:border-stroke-brand focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-2"
                    >
                      <span aria-hidden="true" className="shrink-0 text-ramp-green-600">
                        <Icon size={28} className="icon" />
                      </span>
                      <span className="type-body-lg min-w-0 flex-1 text-text-primary">
                        {label ? (bn ? label.bn : label.en) : category}
                      </span>
                      <span className="type-label-md shrink-0 tabular text-text-secondary">
                        <Num value={n} />
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </Section>

        {/* ------------------------------------------------------- trust */}
        <section className="bg-surface px-4 py-10 md:px-5">
          <div className="mx-auto max-w-content">
            <h2 className="type-heading-lg text-text-primary">{t('trustTitle')}</h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {(['trustRules', 'trustEvidence', 'trustHonesty', 'trustNoGuess'] as const).map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <ShieldCheck size={24} className="icon mt-0.5 shrink-0 text-ramp-success-600" aria-hidden="true" />
                  <span className="type-body-lg text-text-primary measure">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --------------------------------------------------------- FAQ */}
        <Section title={t('faqTitle')} className="mx-auto max-w-content px-4 py-10 md:px-5" headingLevel="h2">
          <div id="citizen-support" className="grid gap-3 xl:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} padding="default">
                <details className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 type-label-lg text-text-primary focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-2">
                    <HelpCircle size={20} className="icon shrink-0 text-text-secondary" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{t(`faq${n}Q`)}</span>
                    <span aria-hidden="true" className="type-body-lg text-text-secondary group-open:hidden">
                      +
                    </span>
                    <span aria-hidden="true" className="type-body-lg hidden text-text-secondary group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className="type-body-lg mt-3 text-text-secondary">{t(`faq${n}A`)}</p>
                </details>
              </Card>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------- final CTA */}
        <section className="bg-surface-brand px-4 py-12 md:px-5">
          <div className="mx-auto flex max-w-content flex-col items-start gap-5">
            <h2 className="type-heading-lg text-white measure">{t('heroTitle')}</h2>
            <Link
              href={session ? '/chat' : '/register'}
              className="inline-flex min-h-16 items-center justify-center gap-2 rounded-md bg-white px-6 type-label-lg text-text-brand hover:bg-ramp-green-50 focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {t('startConversation')}
              <ArrowRight size={24} className="icon" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------- footer */}
      <footer className="portal-footer border-t border-stroke-subtle bg-surface-brand px-4 py-8 md:px-5">
        <div className="mx-auto flex max-w-content flex-col gap-5">
          <details className="type-caption text-ramp-green-100">
            <summary className="inline-flex min-h-12 cursor-pointer items-center">{bn ? 'ছবির ক্রেডিট' : 'Photo credits'}</summary>
            <p><a href="https://commons.wikimedia.org/wiki/File:National_Parliament_of_Bangladesh_17.jpg" className="underline">Asivechowdhury / Wikimedia Commons</a>{' · '}<a href="https://creativecommons.org/licenses/by-sa/4.0/" className="underline">CC BY-SA 4.0</a>{' · '}{bn ? 'ক্রপ, ব্লার ও ফেড করা হয়েছে' : 'Cropped with blur and fade for display'}</p>
          </details>
          <div className="flex items-center gap-3 text-white"><BrandLogo size={48} /><div><p className="type-heading-sm">{tc('appName')}</p><p className="type-body-md text-ramp-green-100">{tc('tagline')}</p></div></div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {(['footerAbout', 'footerContact', 'footerPrivacy', 'footerTerms', 'footerSupport'] as const).map((key) => (
              <Link
                key={key}
                href="/about"
                className="type-body-md inline-flex min-h-12 items-center text-ramp-green-100 underline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: 'landing' });
  return { title: t('heroTitle') };
}
