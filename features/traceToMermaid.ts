import {
	GetTraceGraphCommand,
	GetTraceGraphCommandOutput,
	XRayClient,
} from '@aws-sdk/client-xray'
import { LogLevel, SuiteResult } from '@nordicsemiconductor/bdd-markdown'
import os from 'os'

const traceToMermaid = (trace: GetTraceGraphCommandOutput): string => {
	const mermaid: string[] = ['flowchart TB']
	for (const service of trace.Services ?? []) {
		for (const edge of service.Edges ?? []) {
			const target = trace.Services?.find(
				({ ReferenceId }) => ReferenceId === edge.ReferenceId,
			)
			mermaid.push(
				`    ${service.Name}-${service.Type}(${service.Type})-->${target?.Name}-${target?.Type}(${target?.Type})`,
			)
		}
	}
	return mermaid.join(os.EOL)
}

const xray = new XRayClient({})

const suiteResult = await new Promise<SuiteResult>((resolve) =>
	process.stdin.on('data', (data) => {
		resolve(JSON.parse(data.toString()))
	}),
)

for await (const [f, result] of suiteResult.results) {
	const traceIds = result.logs
		.filter(
			({ level, message }) =>
				level === LogLevel.PROGRESS &&
				message.find((m) => m.startsWith('x-amzn-trace-id')),
		)
		.map(({ message }) => message)
		.flat()
		.map((s) => s.split(' ')[1].split(';')[0].split('=')[1])
	if (traceIds.length === 0) continue

	const trace = await xray.send(
		new GetTraceGraphCommand({
			TraceIds: traceIds,
		}),
	)

	console.log(`# Flowchart for ${f.name}`)
	console.log(``)
	console.log('```mermaid')
	console.log(traceToMermaid(trace))
	console.log('```')
	console.log('')
	traceIds.forEach((traceId) => {
		console.log(
			`[Trace ${traceId}](https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home#xray:traces/${traceId})`,
		)
	})
}
