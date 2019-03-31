require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { EventEmitter } = require('events')

const app = express()
const controller = new EventEmitter()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// load events service
require('./events')(controller)

// load slack service
require('./services/slack')(app, controller)
require('./services/console')(app, controller)

// this is a slack specific endpoint for ingesting slack events

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))

// controller.emit('slack/action/postMessage', mockRecipesById[mockRecipesIds[0]].action)

/*
 * Services
 * Triggers
 * Actions
 * Webhooks
 * Events
 * Recipes
 * */
