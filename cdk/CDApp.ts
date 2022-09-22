import * as CDK from 'aws-cdk-lib'
import { CDStack } from './CDStack.js'

export class CDApp extends CDK.App {
	public constructor({
		stackName,
		repoToWatch: { Owner, Repo, Branch },
	}: {
		stackName: string
		repoToWatch: {
			Repo: string
			Owner: string
			Branch: string
		}
	}) {
		super()

		new CDStack(this, stackName, {
			Owner,
			Repo,
			Branch,
		})
	}
}
