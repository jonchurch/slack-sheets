const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
module.exports = (app, controller) => {
	const log = message => console.log(`:: ${message}`)
	rl.on('line', input => {
		console.log('emitting..')
		const triggerEvent = {
		service: "console",
		triggerType: "readLine",
		payload: {
			input
			}
			}
		controller.emit('trigger.', {triggerChannel: 'console/readLine', triggerEvent})
		})
		

}
