#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

const env = app.node.tryGetContext('env');

const langfusePk: string | undefined = app.node.tryGetContext('langfuse-public-key');
const langfuseSk: string | undefined = app.node.tryGetContext('langfuse-secret-key');
const langfuseEndpoint: string = app.node.tryGetContext('langfuse-endpoint') ?? 'https://us.cloud.langfuse.com';

const langfuse = langfuseSk && langfusePk ? {
  sk: langfuseSk,
  pk: langfusePk,
  endpoint: langfuseEndpoint,
} : undefined;

const stackNamePrefix = env ? `${env}-` : '';
const stackName = `${stackNamePrefix}mastra-example`;
new CdkStack(app, stackName, {
  langfuse,
});
