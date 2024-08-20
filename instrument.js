const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const dotenv = require('dotenv');
dotenv.config();
console.log('process.env.SENTRY_DSN', process.env.SENTRY_DSN);
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

module.exports = Sentry;