# Mixpanel Integration Guide

This project uses a client-only Mixpanel integration with centralized helpers.

## Architecture

- Core helpers: `src/lib/analytics/mixpanel.ts`
- Route/page/error tracking bootstrap: `src/lib/components/analytics/MixpanelProvider.tsx`
- Consent UI: `src/lib/components/analytics/AnalyticsConsentBanner.tsx`
- Provider wiring: `src/lib/providers/root.tsx`

## What Is Implemented

- Safe browser-only initialization (`initMixpanel`)
- Route-level page view tracking for App Router transitions
- Temporary anonymous identify/profile sync (until real auth is added)
- Event wrappers for CTA/course/enroll interactions
- First-touch attribution capture (`utm_*`, initial referrer, initial landing path)
- Super-properties registration (`app_name`, environment, site URL + attribution)
- Consent handling:
  - `getAnalyticsConsentStatus()`
  - `hasAnalyticsConsent()`
  - `grantAnalyticsConsent()`
  - `revokeAnalyticsConsent()`
  - `resetAnalyticsConsentChoice()`
- Pending-event queue before initialization (bounded)
- Client runtime error capture (`window.error`, `unhandledrejection`)

## Event Catalog

Defined in `ANALYTICS_EVENTS`:

- `Page Viewed`
- `CTA Clicked`
- `Course Filter Changed`
- `Course Card Clicked`
- `Enroll Clicked`
- `WhatsApp CTA Clicked`
- `Instructor CTA Clicked`
- `Analytics Consent Updated`
- `Client Error Captured`

All tracked events automatically include current page context:

- `page_path`
- `page_search`
- `page_url`

## Environment Variables

Set these in `.env` and deployment environments:

- `NEXT_PUBLIC_MIXPANEL_TOKEN`
- `NEXT_PUBLIC_MIXPANEL_API_HOST`
- `NEXT_PUBLIC_MIXPANEL_ENABLED`
- `NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST`
- `NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE`
- `NEXT_PUBLIC_MIXPANEL_REPLAY_PERCENT`
- `NEXT_PUBLIC_MIXPANEL_DEBUG`
- `NEXT_PUBLIC_SITE_URL` (recommended for consistent super-properties)

## Consent Behavior

- If consent is unset, banner is shown to capture choice.
- If consent is unset, tracking remains disabled until user opts in.
- If consent is denied, Mixpanel uses opt-out and tracking is disabled.
- If consent is granted, tracking + replay sampling are enabled.
- Users can reopen consent from footer link: `Analytics Preferences`
- Existing denied users also remain denied unless they clear local storage key:
  - `shattak-analytics-consent` (or call `resetAnalyticsConsentChoice()`)

## Temporary Identity (No Auth Yet)

Current behavior identifies anonymous users with Mixpanel distinct IDs and sets a minimal profile once.

When authentication is implemented, migrate to:

1. `mixpanel.identify(realUserId)` after login.
2. `mixpanel.people.set(...)` with user properties.
3. `mixpanel.reset()` on logout.
4. Remove temporary anonymous profile assumptions.

## Verification Checklist

1. Set env vars and restart dev server.
2. Set `NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST=true` for local validation.
3. Open site and confirm consent banner appears for first-time visitor.
4. Click `Allow Analytics`.
5. Validate events in Mixpanel Live View:
   - `Page Viewed`
   - CTA events from header/home/course/about/footer
   - `Course Filter Changed`
   - `Course Card Clicked`
   - `Enroll Clicked`
6. Trigger a controlled client error and confirm `Client Error Captured`.
7. Click `Decline` in a fresh session and verify events stop.
