import { consoleReporter } from '@bifravst/bdd-markdown'

const chunks: string[] = []

process.stdin.on('data', (data) => {
	chunks.push(data.toString())
})

process.stdin.on('end', () => {
	const jsonData = JSON.parse(chunks.join(''))
	consoleReporter(jsonData, console.log)

	if (jsonData.ok !== true) process.exit(1)
})
