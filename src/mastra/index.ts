
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from "@mastra/duckdb";
import { MastraCompositeStore } from '@mastra/core/storage';
import { Observability, SensitiveDataFilter } from '@mastra/observability';
import { OtelExporter } from '@mastra/otel-exporter'
import { awsAgent } from './agents/aws-agent.js';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/aws-scorer.js';

export const mastra = new Mastra({
  agents: { awsAgent },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: new LibSQLStore({
      id: "mastra-storage",
      url: "file:./mastra.db",
    }),
    domains: {
      observability: await new DuckDBStore().getStore('observability'),
    }
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new OtelExporter({
            provider: {
              custom: {
                endpoint: `${process.env.MLFLOW_TRACKING_URI ?? 'http://127.0.0.1:5000'}/v1/traces`,
                protocol: 'http/protobuf',
                headers: {
                  'x-mlflow-experiment-id': process.env.MLFLOW_EXPERIMENT_ID ?? '0',
                },
              },
            },
          })
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
