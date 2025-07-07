// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://ba11e73dff01deee43964fa07c11f575@o4509623316119552.ingest.us.sentry.io/4509623322083328",
  integrations: [
    Sentry.mongooseIntegration()
  ],

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});