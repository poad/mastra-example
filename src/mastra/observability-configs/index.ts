import * as mlflow from './mlflow.js';
import * as databricks from './databricks.js';
import type { CustomConfig } from '@mastra/otel-exporter';

export const ObservabilityConfig = {
  MLFLOW: 'mlflow',
  DATABRICKS: 'databricks',
};

type ObservabilityConfigType = typeof ObservabilityConfig.MLFLOW | typeof ObservabilityConfig.DATABRICKS;

export const createConfig = async (configType: ObservabilityConfigType): Promise<CustomConfig> => {
  if (configType === ObservabilityConfig.MLFLOW) {
    return mlflow.config;
  }
  if (configType === ObservabilityConfig.DATABRICKS) {
    return await databricks.initialize();
  }
  throw new Error();
};
