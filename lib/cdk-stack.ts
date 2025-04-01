import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as awslogs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';

interface CdkStackProps extends cdk.StackProps {
  environment?: string;
  langfuse?: {
    sk: string;
    pk: string;
    endpoint: string;
  };
}

export class CdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: CdkStackProps,
  ) {
    super(scope, id, props);

    const {
      environment,
      langfuse,
    } = props;

    const functionName = `${environment ? `${environment}-` : ''}mastra-example-api`;
    new awslogs.LogGroup(this, 'LambdaFunctionLogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: awslogs.RetentionDays.ONE_DAY,
    });

    const devOptions = {
      applicationLogLevelV2: lambda.ApplicationLogLevel.TRACE,
    };

    const langfuseEnv = langfuse ? {
      LANGFUSE_SECRET_KEY: langfuse.sk,
      LANGFUSE_PUBLIC_KEY: langfuse.pk,
      ...(langfuse.endpoint ? {
        LANGFUSE_BASEURL: langfuse.endpoint,
      } : {}),
    } : {};

    // buildMastra();

    const fn = new nodejs.NodejsFunction(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './src/index.ts',
      functionName,
      retryAttempts: 0,
      environment: {
        ...langfuseEnv,
      },
      bundling: {
        target: 'node22',
        minify: true,
        externalModules: [
          '@aws-sdk/*',
        ],
        format: nodejs.OutputFormat.ESM,
        banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);',
      },
      memorySize: 128,
      timeout: cdk.Duration.minutes(1),
      role: new iam.Role(this, 'LambdaFunctionExecutionRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudFrontReadOnlyAccess'),
        ],
        inlinePolicies: {
          'bedrock-policy': new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'bedrock:InvokeModel*',
                  'logs:PutLogEvents',
                ],
                resources: ['*'],
              }),
            ],
          }),
        },
      }),
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: devOptions.applicationLogLevelV2,
    });

    new lambda.FunctionUrl(this, 'LambdaUrl', {
      function: fn,
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.BUFFERED,
    });

    // const cf = new cloudfront.Distribution(this, 'CloudFront', {
    //   comment: `Mastra example API`,
    //   defaultBehavior: {
    //     origin: origins.FunctionUrlOrigin.withOriginAccessControl(
    //       fn.addFunctionUrl({
    //         authType: cdk.aws_lambda.FunctionUrlAuthType.AWS_IAM,
    //         invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
    //       }),
    //       {
    //         originAccessControl: new cloudfront.FunctionUrlOriginAccessControl(this, 'OAC', {
    //           originAccessControlName: `${environment ? `${environment}-` : ''}mastra-example-api`,
    //           signing: cloudfront.Signing.SIGV4_ALWAYS,
    //         }),
    //         originId: 'lambda',
    //         readTimeout: cdk.Duration.minutes(1),
    //       },
    //     ),
    //     cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
    //     viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //   },
    //   httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    // });

    // // Add permission Lambda Function URLs
    // fn.addPermission('AllowCloudFrontServicePrincipal', {
    //   principal: new iam.ServicePrincipal('cloudfront.amazonaws.com'),
    //   action: 'lambda:InvokeFunctionUrl',
    //   sourceArn: `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${cf.distributionId}`,
    // });

    // new cdk.CfnOutput(this, 'AccessURLOutput', {
    //   value: `https://${cf.distributionDomainName}`,
    // });
  }
}
