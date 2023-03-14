import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'

describe('console-reporter', () => {
	it('should exit with code 0 if the previous process runs successfully', (done) => {
		const consoleReporter = spawn(
			'npx',
			['tsx', 'features/console-reporter.ts'],
			{
				cwd: process.cwd(),
			},
		)

		const data = createReadStream(
			join(process.cwd(), 'features/fixtures/report-success.json'),
		)
		data
			.on('data', (data) => {
				consoleReporter.stdin.write(data)
			})
			.on('end', () => {
				consoleReporter.stdin.end()
			})

		consoleReporter.on('close', (code) => {
			expect(code).toBe(0)
			done()
		})
	})

	it('should exit with code 1 if the previous process is failed', (done) => {
		const consoleReporter = spawn(
			'npx',
			['tsx', 'features/console-reporter.ts'],
			{
				cwd: process.cwd(),
			},
		)

		const data = createReadStream(
			join(process.cwd(), 'features/fixtures/report-fail.json'),
		)
		data
			.on('data', (data) => {
				consoleReporter.stdin.write(data)
			})
			.on('end', () => {
				consoleReporter.stdin.end()
			})

		consoleReporter.on('close', (code) => {
			expect(code).toBe(1)
			done()
		})
	})
})
