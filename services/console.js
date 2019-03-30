
module.exports = (app, controller) => {
	const log = message => console.log(`:: ${message}`)
	controller.on('console/log', ({payload: {message}}) => log(message))
}
