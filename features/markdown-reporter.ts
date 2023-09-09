import { markdownReporter } from '@nordicsemiconductor/bdd-markdown'

process.stdin.on('data', async (data) => {
	console.log(await markdownReporter(JSON.parse(data.toString())))
})
