import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { runFolder } from '@nordicsemiconductor/bdd-markdown'
import { stackOutput } from '@nordicsemiconductor/cloudformation-helpers'
import * as path from 'path'
import { stackBaseName } from '../cdk/stackBaseName.js'
import { steps as restSteps } from './steps/rest-steps.js'
import { steps as webHookSteps } from './steps/webhook-steps.js'

/**
 * This file configures the BDD Feature runner
 * by loading the configuration for the test resources
 * (like AWS services) and providing the required
 * step runners and reporters.
 */

const config = await stackOutput(new CloudFormationClient({}))<{
	ApiURL: string
	QueueURL: string
}>(`${stackBaseName()}-test`)

export type World = {
	webhookReceiver: string
	webhookQueue: string
}

const runner = await runFolder<World>({
	folder: path.join(process.cwd(), 'features'),
	name: 'Webhook Example',
})

runner.addStepRunners(...webHookSteps()).addStepRunners(...restSteps())

const res = await runner.run({
	webhookReceiver: config.ApiURL,
	webhookQueue: config.QueueURL,
})

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
