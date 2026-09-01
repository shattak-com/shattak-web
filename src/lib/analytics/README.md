# Analytics Integration Guide

This project uses client-only analytics integrations with centralized helpers for Mixpanel and Meta Pixel.

Custom properties follow the `#property_name` convention.

Event names follow the `[Page Name] - [Section Name] - [Event Name]` convention.

## Architecture

- Core helpers: `src/lib/analytics/mixpanel.ts`
- Core helpers: `src/lib/analytics/meta-pixel.ts`
- Route/page/error tracking bootstrap: `src/lib/components/analytics/MixpanelProvider.tsx`
- Route-aware Meta Pixel bootstrap: `src/lib/components/analytics/MetaPixelProvider.tsx`
- Provider wiring: `src/lib/providers/root.tsx`

## What Is Implemented

- Safe browser-only initialization (`initMixpanel`)
- Mixpanel auto page view tracking via autocapture
- Meta Pixel initialization and `PageView` tracking across App Router transitions
- Analytics collection for all users
- Session replay ensured across all pages and App Router transitions
- Temporary anonymous identify/profile sync (until real auth is added)
- Event wrappers for CTA/course/enroll interactions
- Event wrappers for free-course enrollment and enrolled-course access
- Event wrappers for unlocked course dashboard, streak, progress, community, and certificate milestones
- Event wrappers for Google auth, onboarding, and learning-profile interactions
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
- `Login - Student Login - Google Login Succeeded`
- `Home - Google One Tap - Google Login Succeeded`
- `Onboarding - Mobile Onboarding - Mobile Number Submitted`
- `Onboarding - Education Onboarding - Education Profile Submitted`
- `Profile - Learning Profile - Learning Profile Update Succeeded`
- `Course - Hero - Free Course Enroll Button Clicked`
- `Course - Hero - Logged Out User Attempted Enrollment`
- `Course - Hero - Free Course Enrollment Successful`
- `Course - Hero - Go To Course Clicked`
- `Profile - Enrolled Courses - Enrolled Courses Section Viewed`
- `Profile - Enrolled Courses - View All Courses Clicked`
- `My Courses - Enrolled Courses - All Enrolled Courses Viewed`
- `My Courses - Enrolled Courses - Go To Course Clicked`
- `Admin - Admin Enrollments - Course Enrollment Counts Viewed`
- `Admin - Admin Enrollments - Course Enrollment Details Viewed`
- `course_whatsapp_join_verified`
- `course_overview_unlocked`
- `course_opened`
- `course_streak_updated`
- `course_progress_clicked`
- `course_whatsapp_opened`
- `course_certificate_earned`
- `course_feedback_submitted`
- `course_lesson_opened`
- `course_lesson_next_clicked`
- `course_lesson_completed`
- `course_doubt_clicked`
- `course_content_width_toggled`
- `course_pdf_viewer_toggled`

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
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_META_PIXEL_ENABLED`
- `NEXT_PUBLIC_META_PIXEL_TRACK_LOCALHOST`

For QA or full capture across pages, set `NEXT_PUBLIC_MIXPANEL_REPLAY_PERCENT=100`.

## Tracking Behavior

- Analytics is collected for all users when Mixpanel is enabled.
- Tracking is controlled only by environment configuration such as:
  - `NEXT_PUBLIC_MIXPANEL_ENABLED`
  - `NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST`

## Identity

Current behavior identifies anonymous users with Mixpanel distinct IDs and sets a minimal profile once.

After Google authentication, the app identifies the Mixpanel user with the internal user id and sets Mixpanel profile identity fields:

- `$email`
- `$name`

Auth events should still avoid duplicating email or name in event properties. Event payloads should use product state such as role keys, account status, onboarding stage, redirect path, completion booleans, and counts. Do not send phone numbers, college names, department names, selected interest values, or other unnecessary personal data in analytics events.

On logout, the app resets the Mixpanel identity and returns to anonymous tracking.

## Enrollment Tracking

Free-course enrollment events use the existing Mixpanel helpers and include course state where available:

- `#course_id`
- `#course_title`
- `#is_free_course`
- `#enrollment_status`
- `#source_page`
- `#destination`

Admin enrollment events are limited to aggregate/count viewing and selected course inspection. Do not track internal course upload/edit operations, invitation management, or other admin-only workflow actions unless they directly affect a student-facing experience.

## Course Dashboard Tracking

Unlocked course workspace events use exact snake_case event names so product funnel reports can query these milestones directly:

- `course_whatsapp_join_verified`
- `course_overview_unlocked`
- `course_opened`
- `course_streak_updated`
- `course_progress_clicked`
- `course_whatsapp_opened`
- `course_certificate_earned`
- `course_feedback_submitted`

These events should include the available course/user state without sending extra PII:

- `#course_id`
- `#course_title`
- `#user_id`
- `#streak_day`
- `#previous_streak`
- `#current_streak`
- `#completion_percentage`
- `#enrollment_status`
- `#destination`
- `#lesson_id`
- `#lesson_title`
- `#module_id`
- `#module_title`
- `#source_page`

## Lesson Tracking

Student lesson consumption is tracked from the course workspace only. These events should stay aligned with the lesson engine and should not be duplicated in generic navigation handlers:

- `course_lesson_opened`: fired when a learner opens an unlocked lesson.
- `course_lesson_next_clicked`: fired when the learner uses the lesson Next action.
- `course_lesson_completed`: fired after the backend marks the lesson complete.
- `course_doubt_clicked`: fired when the learner uses Ask Doubt to open the course WhatsApp community.
- `course_content_width_toggled`: fired when a learner switches between the reading and expanded lesson widths.
- `course_pdf_viewer_toggled`: fired when a learner expands or restores the inline PDF viewer.

Lesson events can include:

- `#course_id`
- `#course_title`
- `#user_id`
- `#module_id`
- `#module_title`
- `#lesson_id`
- `#lesson_title`
- `#destination`
- `#completion_percentage`
- `#enrollment_status`
- `#source_page`
- `#display_mode`
- `#expanded`
- `#interaction`
- `#resource_type`

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
5. Open Meta Pixel Helper or Events Manager Test Events and confirm `PageView` on the landing page plus route transitions such as `/about` and `/course/[id]`.
