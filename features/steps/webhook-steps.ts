import {
	codeBlockOrThrow,
	groupMatcher,
	StepRunner,
} from '@nordicsemiconductor/bdd-markdown'
import assert from 'assert/strict'
import { World } from '../run-features.js'
import { WebhookReceiver } from './webhook-receiver.js'
import { Type } from '@sinclair/typebox'

export const steps = (): StepRunner<World>[] => {
	let r: WebhookReceiver

	return [
		{
			match: (title) => /^I have a Webhook Receiver$/.test(title),
			run: async ({ log, context: { webhookQueue } }) => {
				log.progress(`Webhook queue: ${webhookQueue}`)
				r = new WebhookReceiver({ queueUrl: webhookQueue })
				await r.clearQueue()
			},
		},
		groupMatcher(
			{
				regExp:
					/^the Webhook Receiver `(?<MessageGroupId>[^"]+)` should be called$/,
				schema: Type.Object({ MessageGroupId: Type.String() }),
			},
			async ({ match: { MessageGroupId }, log }) => {
				await r.receiveWebhookRequest(MessageGroupId, log)
			},
		),
		{
			match: (title) =>
				/^the webhook request body should equal this JSON$/.test(title),
			run: async ({ step }) => {
				assert.deepEqual(
					JSON.parse(codeBlockOrThrow(step).code),
					r.latestWebhookRequest?.body,
				)
			},
		},
	]
}
