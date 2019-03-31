const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

module.exports = (app, controller) => {
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

  const log = message => console.log(`:: ${message}`)
  controller.on('console/log', ({ payload: { message } }) => log(message))
}
