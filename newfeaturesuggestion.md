# AccessAI — Suggested Features for Hackathon Success

This document contains suggested next-step features. These are roadmap ideas and are not claims
that every item is already implemented in the current prototype.


## Priority 0: strengthen the core demo

### AI Opportunity Navigator

- Understand Bangla, Banglish, and English descriptions.
- Extract life event, district, income, household information, and other entities.
- Ask only the most important missing questions.
- Run the deterministic eligibility engine.
- Explain the result with citations, confidence, and a next step.
- Generate a practical action plan.

### Source-grounded AI answers

Every answer should show the source title, organisation, URL, last-verified date, verification
status, and the eligibility condition supported by the source. Sample or outdated information must
remain visibly labelled.

### AI Form Assistant

For a selected programme, guide the citizen through the application process:

- required form and document checklist;
- plain-Bangla explanation of difficult fields;
- missing profile information;
- common application mistakes;
- final readiness checklist.

OCR for NID cards and certificates can be added later with explicit consent and privacy controls.

### Trust demonstration

An administrator verifies a programme, the citizen asks the same question again, confidence rises,
and the audit log records the verification. This should be the primary hackathon demo.

## Priority 1: differentiation

### Bangla and Banglish voice assistant

Support commands such as:

- “আমার কাছের সমাজসেবা অফিস দেখাও”
- “আমার আজকের কাজ দেখাও”
- “আমি কোন ভাতা পেতে পারি?”
- “Show my saved programmes.”

Typed input must remain available when microphone permission, browser speech support, or a speech
provider is unavailable.

### Proactive support

- Upcoming-deadline reminders
- Missing-document reminders
- Application follow-up reminders
- Renewal reminders
- Daily “today’s tasks” view

### Privacy-safe impact dashboard

- Citizens helped
- Common life events
- District-wise demand
- Eligible opportunities found
- Action plans started and completed
- Unknown/unanswered questions
- Citation coverage and response latency

## Admin panel: Trust & Operations Centre

The existing admin panel should be expanded as the platform’s trust layer:

- Programme create, edit, archive, and version history
- Source document and URL management
- Verification queue with reviewer comments
- Eligibility rule builder and rule preview
- Pending, verified, outdated, and disputed states
- Source freshness and dead-link alerts
- Feedback and incorrect-information moderation
- AI request logs and grounding failures
- User and role management
- Audit log for sensitive actions
- Background-job monitoring
- District and programme analytics

Recommended roles:

- **Moderator** — triage feedback and review submissions
- **Reviewer** — validate sources and rules
- **Administrator** — approve verification and manage access
- **Citizen** — use recommendations and action plans

## Frontend improvement plan

### Information hierarchy

- Keep one clear primary action per screen.
- Show eligibility verdict, confidence, and next step above long descriptions.
- Use progressive disclosure for sources, rules, and technical details.
- Separate “What you supplied”, “What the programme requires”, and “What to do next”.
- Add loading, empty, error, and retry states to every data-driven screen.

### Responsive design

Test every important journey at 320px, 375px, 768px, 1024px, and 1440px widths.

- No horizontal scrolling on supported widths.
- Use compact or bottom navigation on mobile.
- Convert cards to one column on narrow screens.
- Convert tables to stacked cards or safe horizontal scroll regions.
- Let admin filters wrap without covering content.
- Keep dialogs inside the viewport and keyboard accessible.
- Wrap long Bangla labels instead of clipping them.
- Keep touch targets at least 48dp.
- Use one-column forms on mobile and grouped columns on desktop.
- Keep nearby-service actions easy to tap.

### Visual polish

- Add a compact result summary at the top of chat responses.
- Use consistent status icons for eligible, partially eligible, unknown, and not eligible.
- Add a confidence explanation drawer instead of showing only a percentage.
- Add skeleton loading states for lists, dashboard cards, and nearby services.
- Add confirmation feedback after save, task completion, profile update, and verification.
- Keep the unverified-sample notice visible but calm and readable.

### Accessibility and low-bandwidth behaviour

- Preserve keyboard navigation and visible focus.
- Test Bangla labels with TalkBack and Narrator.
- Respect reduced-motion and text-scale settings.
- Avoid autoplay audio and large decorative assets.
- Lazy-load non-critical content.
- Keep the first meaningful screen lightweight on slow connections.
- Provide text alternatives whenever voice or map features are unavailable.

## Priority 2: optional extensions

- OCR-assisted document capture
- Offline/PWA support for saved plans and checklists
- Map tiles after the location dataset is verified
- Live SMS, email, and push notifications
- Languages beyond Bangla and English
- Labelled retrieval-quality evaluation using verified citizen queries

