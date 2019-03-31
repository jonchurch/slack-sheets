const readline = require('readline')


module.exports = (app, controller) => {
	function startReadLineInput() {
		const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		})
		rl.on('line', input => {
			const triggerEvent = {
				service: 'console',
				triggerType: 'readLine',
				payload: {
					input,
					},
				}
			controller.emit('trigger.', {
				triggerChannel: 'console/readLine',
				triggerEvent,
			})
		})
		}
	// startReadLineInput()

  const log = message => console.log(`:: ${message}`)
  controller.on('console/log', ({ payload: { message } }) => log(message))
}
