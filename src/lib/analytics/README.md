# Mixpanel Integration Guide

This project uses a client-only Mixpanel integration with centralized helpers.

Custom properties follow the `#property_name` convention.

Event names follow the `[Page Name] - [Section Name] - [Event Name]` convention.

## Architecture

- Core helpers: `src/lib/analytics/mixpanel.ts`
- Route/page/error tracking bootstrap: `src/lib/components/analytics/MixpanelProvider.tsx`
- Provider wiring: `src/lib/providers/root.tsx`

## What Is Implemented

- Safe browser-only initialization (`initMixpanel`)
- Mixpanel auto page view tracking via autocapture
- Analytics collection for all users
- Session replay ensured across all pages and App Router transitions
- Temporary anonymous identify/profile sync (until real auth is added)
- Event wrappers for CTA/course/enroll interactions
- First-touch attribution capture (`utm_*`, initial referrer, initial landing path)
- Super-properties registration for first-touch attribution only
- Pending-event queue before initialization (bounded)
- Client runtime error capture (`window.error`, `unhandledrejection`)

## Event Naming

Event names are composed dynamically from the current page and the tracked section/action.

Examples:

- `Home - Hero - Become Instructor Clicked`
- `Home - Courses - Category Filter Changed`
- `Course - Hero - Enroll Clicked`
- `About - Final CTA - Join Now Clicked`
- `Course - App - Client Error Captured`

All tracked events automatically include current page context:

- `#page_path`
- `#page_search`

## Environment Variables

Set these in `.env` and deployment environments:

- `NEXT_PUBLIC_MIXPANEL_TOKEN`
- `NEXT_PUBLIC_MIXPANEL_API_HOST`
- `NEXT_PUBLIC_MIXPANEL_ENABLED`
- `NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST`
- `NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE`
- `NEXT_PUBLIC_MIXPANEL_REPLAY_PERCENT`
- `NEXT_PUBLIC_MIXPANEL_DEBUG`

For QA or full capture across pages, set `NEXT_PUBLIC_MIXPANEL_REPLAY_PERCENT=100`.

## Tracking Behavior

- Analytics is collected for all users when Mixpanel is enabled.
- Tracking is controlled only by environment configuration such as:
  - `NEXT_PUBLIC_MIXPANEL_ENABLED`
  - `NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST`

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
3. Open site and validate events in Mixpanel Live View:
   - `[Auto] Page View`
   - page/section/action events such as `Home - Hero - Become Instructor Clicked`
   - `Home - Courses - Category Filter Changed`
   - `Home - Courses - Course Card Clicked`
   - `Course - Hero - Enroll Clicked`
4. Trigger a controlled client error and confirm an event like `Course - App - Client Error Captured`.
