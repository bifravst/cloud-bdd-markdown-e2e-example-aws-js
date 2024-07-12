import type { MessageAttributeValue } from '@aws-sdk/client-sqs'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import type {
	APIGatewayEventRequestContextV2,
	APIGatewayProxyEventV2WithRequestContext,
	APIGatewayProxyResultV2,
} from 'aws-lambda'
import { Tracer } from '@aws-lambda-powertools/tracer'

const tracer = new Tracer({})
const sqs = tracer.captureAWSv3Client(new SQSClient({}))

export const handler = async (
	event: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>,
): Promise<APIGatewayProxyResultV2> => {
	console.debug(JSON.stringify({ event }))

	const MessageAttributes = Object.keys(event.headers)
		.filter((key) => !/^(CloudFront-|X-|Host|Via)/.test(key))
		.slice(0, 10) // max number of MessageAttributes is 10
		.reduce(
			(hdrs, key) => ({
				...hdrs,
				[key]: {
					DataType: 'String',
					StringValue: event.headers[key],
				},
			}),
			{} as Record<string, MessageAttributeValue>,
		)

	await sqs.send(
		new SendMessageCommand({
			MessageBody: event.body,
			MessageAttributes,
			QueueUrl: process.env.SQS_QUEUE,
			MessageGroupId: event.rawPath.slice(1),
			MessageDeduplicationId: event.requestContext.requestId,
		}),
	)

	return { statusCode: 202 }
}
