import type { CustomConfig } from '@mastra/otel-exporter';

export const config: CustomConfig = {
  endpoint: `${process.env.MLFLOW_TRACKING_URI ?? 'http://127.0.0.1:5000'}/v1/traces`,
  protocol: 'http/protobuf',
  headers: {
    'x-mlflow-experiment-id': process.env.MLFLOW_EXPERIMENT_ID ?? '0',
  },
}; 