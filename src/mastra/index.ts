import '@grpc/grpc-js';
import '@opentelemetry/exporter-trace-otlp-grpc';
import { awsAgent } from './agents/aws-agent.js';
// import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/aws-scorer.js';
import { createConfig } from './observability-configs/index.js';
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { MastraCompositeStore } from '@mastra/core/storage';
import { DefaultExporter, Observability, SamplingStrategyType, SensitiveDataFilter } from '@mastra/observability';
import { OtelExporter } from '@mastra/otel-exporter';
// import { OtelBridge } from '@mastra/otel-bridge';
// import { DuckDBStore } from '@mastra/duckdb';

export const mastra = new Mastra({
  bundler: {
    externals: [
      '@grpc/grpc-js',
      '@duckdb/node-bindings',
    ],
  },
  agents: { awsAgent },
  // scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: new LibSQLStore({
      id: 'mastra-storage',
      url: 'file:./mastra.db',
    }),
    // domains: {
    //   observability: await new DuckDBStore().getStore('observability'),
    // },
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        sampling: { type: SamplingStrategyType.ALWAYS }, // すべてのトレースをサンプリング
        // bridge: new OtelBridge(),
        exporters: [
          new DefaultExporter(),
          new OtelExporter({
            provider: {
              custom: await createConfig(process.env.OBSERVABILITY_PROVIDER ?? 'mlflow'),
            },
          }),
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
        logging: {
          enabled: true, // set to false to disable log forwarding
          level: 'info', // minimum level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
        },
      },
    },
  }),
});
