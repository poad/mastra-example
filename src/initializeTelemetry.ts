// Reference: ./mastra/output/instrumentation.mjs
import {
  NodeSDK,
  getNodeAutoInstrumentations,
  ATTR_SERVICE_NAME,
  Resource,
  AlwaysOnSampler,
} from '@mastra/core/telemetry/otel-vendor';
import { LangfuseExporter } from 'langfuse-vercel';

export function initializeTelemetry() {
  // for Langfuse
  const sampler = new AlwaysOnSampler();
  const exporter = new LangfuseExporter({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_HOST
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'ai',
    }),
    sampler,
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk.shutdown().catch(() => {
      // do nothing
    });
  });
}
