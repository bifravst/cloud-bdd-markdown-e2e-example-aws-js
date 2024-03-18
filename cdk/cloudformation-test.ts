import path from 'path'
import { packLambda } from './packLambda.js'
import { stackBaseName } from './stackBaseName.js'
import { TestApp } from './TestApp.js'

const baseDir = path.join(process.cwd(), 'lambda')

new TestApp({
	stackName: `${stackBaseName()}-test`,
	lambdaSource: await packLambda({
		id: 'webhookReceiver',
		baseDir,
	}),
}).synth()
