require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { EventEmitter } = require('events')
const router = express.Router()

const app = express()
const controller = new EventEmitter()
// needed to bind 'this' in order to pass the emitter methods down and have them keep working
// Either way below is valid
const publish = (...rest) => controller.emit(...rest)
const subscribe = controller.on.bind(controller)
// or I could just pass in the controller, so we don't lose the reference to this?
// const subscribe = (...rest) => controller.on(...rest)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// load services
require('./services/console')({ router, subscribe, publish })
require('./services/slack')({ router, subscribe, publish })
require('./services/googleSheets')({ router, subscribe, publish })

// load events service
require('./events')({publish, subscribe})

app.use('/services', router)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))

/*
 * Services
 * Triggers
 * Actions
 * Webhooks
 * Events
 * Recipes
 * */
