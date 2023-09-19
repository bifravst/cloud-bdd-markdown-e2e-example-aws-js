import {
	codeBlockOrThrow,
	StepRunner,
	groupMatcher,
} from '@nordicsemiconductor/bdd-markdown'
import assert from 'assert/strict'
import fetch, { Response } from 'node-fetch'
import { World } from '../run-features.js'
import { Type } from '@sinclair/typebox'

export const steps = (): StepRunner<World>[] => {
	let baseUrl: URL | undefined = undefined
	let res: Response | undefined = undefined
	return [
		groupMatcher(
			{
				regExp: /^the endpoint is `(?<endpoint>[^`]+)`$/,
				schema: Type.Object({ endpoint: Type.String() }),
			},
			async ({ match: { endpoint } }) => {
				baseUrl = new URL(endpoint)
			},
		),
		groupMatcher(
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
		groupMatcher(
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
