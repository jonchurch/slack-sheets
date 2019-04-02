const readline = require('readline')

const serviceName = 'console'
module.exports = ({ subscribe, publish }) => {
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
      publish('trigger.', {
        triggerChannel: 'console/readLine',
        triggerEvent,
      })
    })
  }
  // startReadLineInput()

  const log = message => console.log(`:: ${message}`)
  subscribe('console/log', ({ payload: { message } }) => log(message))
}
