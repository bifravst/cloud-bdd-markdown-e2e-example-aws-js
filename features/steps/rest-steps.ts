import type { StepRunner } from '@bifravst/bdd-markdown'
import { codeBlockOrThrow, regExpMatchedStep } from '@bifravst/bdd-markdown'
import assert from 'assert/strict'
import type { Response } from 'node-fetch'
import fetch from 'node-fetch'
import type { World } from '../run-features.js'
import { Type } from '@sinclair/typebox'

export const steps = (): StepRunner<World>[] => {
	let baseUrl: URL | undefined = undefined
	let res: Response | undefined = undefined
	return [
		regExpMatchedStep(
			{
				regExp: /^the endpoint is `(?<endpoint>[^`]+)`$/,
				schema: Type.Object({ endpoint: Type.String() }),
			},
			async ({ match: { endpoint } }) => {
				baseUrl = new URL(endpoint)
			},
		),
		regExpMatchedStep(
			{
				regExp: /^I (?<method>POST) to `(?<resource>[^`]+)` with this JSON$/,
				schema: Type.Object({ method: Type.String(), resource: Type.String() }),
			},
			async ({ match: { method, resource }, log: { progress }, step }) => {
				const url = new URL(resource, baseUrl).toString()
				progress(`${method} ${url}`)
				const body = codeBlockOrThrow(step).code
				progress(body)

				res = await fetch(url, {
					method,
					body,
				})

				progress(`${res.status} ${res.statusText}`)
				progress(`x-amzn-trace-id: ${res.headers.get('x-amzn-trace-id')}`)
			},
		),
		regExpMatchedStep(
			{
				regExp: /^the response status code should be (?<code>[0-9]+)$/,
				schema: Type.Object({ code: Type.Integer() }),
				converters: {
					code: (s) => parseInt(s, 10),
				},
			},
			async ({ match: { code } }) => {
				assert.equal(res?.status, code)
			},
		),
	]
}
