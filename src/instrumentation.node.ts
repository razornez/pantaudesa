import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Don't log errors in development — use console instead
  enabled: !!process.env.SENTRY_DSN,
  beforeSend(event) {
    // Strip sensitive fields before sending to Sentry
    if (event.request?.cookies) event.request.cookies = {};
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
