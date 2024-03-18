import * as CDK from 'aws-cdk-lib'
import * as IAM from 'aws-cdk-lib/aws-iam'
import * as Lambda from 'aws-cdk-lib/aws-lambda'
import * as Logs from 'aws-cdk-lib/aws-logs'
import * as SQS from 'aws-cdk-lib/aws-sqs'
import { PackedLambda } from './packLambda.js'

/**
 * This is the CloudFormation stack which contains the webhook receiver resources.
 */
export class WebhookReceiverStack extends CDK.Stack {
	public constructor(
		parent: CDK.App,
		id: string,
		{
			lambdaSource,
		}: {
			lambdaSource: PackedLambda
		},
	) {
		super(parent, id)

		// This queue will store all the requests made to the API Gateway
		const queue = new SQS.Queue(this, 'queue', {
			fifo: true,
			visibilityTimeout: CDK.Duration.seconds(5),
			queueName: `${id}.fifo`,
		})

		// This lambda will publish all requests made to the API Gateway in the queue
		const lambda = new Lambda.Function(this, 'Lambda', {
			description: 'Publishes webhook requests into SQS',
			code: Lambda.Code.fromAsset(lambdaSource.lambdaZipFile),
			handler: lambdaSource.handler,
			runtime: Lambda.Runtime.NODEJS_20_X,
			architecture: Lambda.Architecture.ARM_64,
			timeout: CDK.Duration.seconds(15),
			initialPolicy: [
				new IAM.PolicyStatement({
					resources: ['arn:aws:logs:*:*:*'],
					actions: [
						'logs:CreateLogGroup',
						'logs:CreateLogStream',
						'logs:PutLogEvents',
					],
				}),
				new IAM.PolicyStatement({
					resources: [queue.queueArn],
					actions: ['sqs:SendMessage'],
				}),
			],
			environment: {
				SQS_QUEUE: queue.queueUrl,
			},
		})

		// Create the log group here, so we can control the retention
		new Logs.LogGroup(this, `LambdaLogGroup`, {
			removalPolicy: CDK.RemovalPolicy.DESTROY,
			logGroupName: `/cdk/lambda/${lambda.functionName}`,
			retention: Logs.RetentionDays.ONE_DAY,
		})

		const fnUrl = lambda.addFunctionUrl({
			authType: Lambda.FunctionUrlAuthType.NONE,
		})

		// Export these so the test runner can use them
		new CDK.CfnOutput(this, 'ApiURL', {
			value: fnUrl.url,
			exportName: `${this.stackName}:ApiURL`,
		})
		new CDK.CfnOutput(this, 'QueueURL', {
			value: queue.queueUrl,
			exportName: `${this.stackName}:QueueURL`,
		})
	}
}
