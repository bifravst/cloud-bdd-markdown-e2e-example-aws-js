import {
	codeBlockOrThrow,
	noMatch,
	StepRunner,
	StepRunnerArgs,
	StepRunResult,
} from '@nordicsemiconductor/bdd-markdown'
import assert from 'assert/strict'
import { World } from '../run-features.js'
import { WebhookReceiver } from './webhook-receiver.js'

export const steps = (): StepRunner<World>[] => {
	let r: WebhookReceiver

	return [
		async ({
			step,
			log: { step: log },
			context: { webhookQueue },
		}: StepRunnerArgs<World>): Promise<StepRunResult> => {
			if (!/^I have a Webhook Receiver$/.test(step.title)) return noMatch
			log.progress(`Webhook queue: ${webhookQueue}`)
			r = new WebhookReceiver({ queueUrl: webhookQueue })
			await r.clearQueue()
		},
		async ({
			step,
			log: { scenario: log },
		}: StepRunnerArgs<World>): Promise<StepRunResult> => {
			const match =
				/^the Webhook Receiver `(?<MessageGroupId>[^"]+)` should be called$/.exec(
					step.title,
				)
			if (match === null) return noMatch

			const request = await r.receiveWebhookRequest(
				match.groups?.MessageGroupId as string,
				log,
			)

			return { result: request.body }
		},
		async ({ step }: StepRunnerArgs<World>): Promise<StepRunResult> => {
			if (!/^the webhook request body should equal this JSON$/.test(step.title))
				return noMatch

			assert.deepEqual(
				JSON.parse(codeBlockOrThrow(step).code),
				r.latestWebhookRequest?.body,
			)
		},
	]
}
