import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://f46f5209f67744e7e4c0e8f2d07361fc@o4509432444747776.ingest.de.sentry.io/4509432449400912",
  sendDefaultPii: true,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
