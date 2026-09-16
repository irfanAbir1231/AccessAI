'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api/client';
import { Card } from '@/components/primitives/Card';
import { OpportunityCard, type OpportunityCardData } from '@/components/opportunity/OpportunityCard';
import type { LocalisedText } from '@/lib/domain/rules';
import { useAppTour } from './AppTour';

interface DemoDetail {
  opportunity: Omit<OpportunityCardData, 'organization' | 'eligibility' | 'confidence' | 'saved'>;
  organization: OpportunityCardData['organization'];
  eligibility: { outcome: OpportunityCardData['eligibility']['outcome']; matched: { reason: LocalisedText }[]; failed: { reason: LocalisedText }[]; missingFields: string[] };
  confidence: OpportunityCardData['confidence'];
  saved: OpportunityCardData['saved'];
  citations: { chunkId: string; excerpt: string; sourceUrl: string | null }[];
}

export function TourChatExample() {
  const tour = useAppTour();
  const bn = useLocale() === 'bn';
  const show = Boolean(tour?.progress?.sampleChat);
  const [detail, setDetail] = useState<DemoDetail | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    setError(false);
    void api.get<DemoDetail>('/opportunities/widow-allowance').then((result) => { if (!cancelled) setDetail(result); }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [show, retry]);
  if (!show) return null;
  const item: OpportunityCardData | null = detail ? { ...detail.opportunity, organization: detail.organization, eligibility: { outcome: detail.eligibility.outcome, topReason: detail.eligibility.matched[0]?.reason ?? null, topBlocker: detail.eligibility.failed[0]?.reason ?? null, missingFields: detail.eligibility.missingFields }, confidence: detail.confidence, saved: detail.saved } : null;
  return <div className="flex flex-col gap-4" data-tour="chat-example">
    <div className="ms-auto max-w-text rounded-lg bg-surface-brand px-5 py-4 type-body-lg text-white">{bn ? 'আমার স্বামী মারা গেছেন; আমি কী সহায়তা পেতে পারি?' : 'My husband has died; what support can I get?'}</div>
    <Card className="flex flex-col gap-3">
      <p className="type-label-md text-text-brand">{bn ? 'অ্যাপ ট্যুর · স্থানীয় ডেমো উত্তর' : 'App tour · Local simulated response'}</p>
      <p className="type-body-lg">{bn ? 'আপনার পরিস্থিতিতে বিধবা ভাতা একটি সম্ভাব্য সহায়তা। নিচের কার্ডে নমুনা অ্যাকাউন্টের নিয়মভিত্তিক যাচাই দেখুন। পরবর্তী পদক্ষেপ: প্রয়োজনীয় কাগজ সংগ্রহ করে কর্মপরিকল্পনা তৈরি করুন।' : 'The Widow Allowance is one possible source of support in this situation. The card below shows the rule-based assessment for the sample account. Next, review the required documents and create an action plan.'}</p>
      <p className="type-caption text-text-secondary">{bn ? 'এই উদাহরণ সংরক্ষণ করা হয় না এবং AI provider-কে পাঠানো হয় না। কার্ডের তথ্য বিদ্যমান নমুনা কর্মসূচি থেকে আসে।' : 'This example is not saved or sent to an AI provider. The card uses the existing sample programme data.'}</p>
      {error ? <div role="alert"><p className="type-body-md text-text-error">{bn ? 'কর্মসূচি লোড হয়নি।' : 'Programme could not be loaded.'}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="min-h-12 type-label-md text-text-brand">{bn ? 'আবার চেষ্টা করুন' : 'Try again'}</button></div> : item ? <OpportunityCard item={item} /> : <p role="status" className="type-body-md">{bn ? 'উদাহরণ লোড হচ্ছে…' : 'Loading example…'}</p>}
      {detail?.citations.length ? <details><summary className="inline-flex min-h-12 cursor-pointer items-center type-label-md text-text-link">{bn ? 'উৎস' : 'Sources'} ({detail.citations.length})</summary><ul className="flex flex-col gap-3 rounded-md bg-surface-sunken p-3">{detail.citations.map((source) => <li key={source.chunkId} className="type-body-md"><p>{source.excerpt}</p>{source.sourceUrl ? <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center text-text-link underline">{bn ? 'উৎস দেখুন' : 'View source'}</a> : null}</li>)}</ul></details> : null}
    </Card>
  </div>;
}
