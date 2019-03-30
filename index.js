require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { EventEmitter } = require('events')
const mustache = require('mustache').render


const mockRecipesIds = ['slack/messagePosted', 'console/readLine']
const mockRecipesById = {
	'slack/messagePosted': {
		trigger: {
			service: "slack",
			triggerType: "messagePosted",
		action: {
			service: "console",
			actionType: "log",
			payload: {
				message: "Slack user:{{payload.user}} said '{{payload.text}}'"
				}
			}
		}
	},
	'console/readLine': {
		trigger: {
			service: "console",
			triggerType: "readLine",
			},
		action: {
			service: "slack",
			actionType: "postMessage",
			payload: {
				text: "CONSOLE: {{payload.input}}",
				channel: "#general"
				}
			}
		}
	}

const app = express()
const controller = new EventEmitter()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// load slack service
require('./services/slack')(app, controller)
require('./services/console')(app, controller)

// this is a slack specific endpoint for ingesting slack events
// mocked up finding recipes whose conditions are satisfied by the trigger event
function getMatchingRecipes(triggerChannel, triggerEvent) {
	console.log({triggerChannel})
	if (mockRecipesIds.includes(triggerChannel)) {
		return [mockRecipesById[triggerChannel]]
		} else {
			return []
			}
}

function interpolatePayload(actionPayload, triggerPayload) {
	return Object.keys(actionPayload)
		.reduce((a, key) => {
			const entity = actionPayload[key]
			// console.log({entity, triggerPayload})
			const rendered = mustache(entity, {payload: triggerPayload})
			console.log({rendered})
			a[key] = rendered
			return a
			}, {})
}
controller.on('trigger.', ({triggerChannel, triggerEvent})=> {
	console.log('heard trigger', triggerEvent)
	// Respond to triggers
	// Lookup recipes the trigger fulfills
	const recipes = getMatchingRecipes(triggerChannel, triggerEvent)
	console.log({recipes})
	recipes.forEach(recipe => {
		const actionPayload = recipe.action.payload
		const triggerPayload = triggerEvent.payload
		const interpolatedPayload = interpolatePayload(actionPayload, triggerPayload)
		recipe.action.payload = interpolatedPayload
		// then trigger the action
		controller.emit(`${recipe.action.service}/${recipe.action.actionType}`, recipe.action)
		})
	})
controller.on('slack/messagePosted', event => {
	// update spreadsheet?
	// well, I need a way to lookup recipe triggers really, the goal isn't to do all this in code
	console.log("heard that slack message", event.payload.text)
})
controller.on("googleSheets@actions/addRowToSheet", recipe => {
	// sheetsService.addRowToSheet({payload: action.payload, userDetails: recipe.user)
	// then the action has occurred?
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))

// controller.emit('slack/action/postMessage', mockRecipesById[mockRecipesIds[0]].action)

/* 
 * Services
 * Webhooks
 * Recipes
 * Triggers
 * Actions
 * Events
 * */
