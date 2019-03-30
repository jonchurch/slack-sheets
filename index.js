require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { EventEmitter } = require('events')
const mustache = require('mustache').render


const mockRecipesIds = ['slack/messagePosted']
const mockRecipesById = {
	'slack/messagePosted': {
		trigger: {
			service: "slack",
			triggerType: "messagePosted",
			entities: {
				channel: "#general",
				text: "hello"
				}
			},
		action: {
			service: "console",
			actionType: "log",
			payload: {
				text: "Slack user:{{payload.user}} said '{{payload.text}}'"
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
controller.emit('slack/action/postMessage', mockRecipesById[mockRecipesIds[0]])
controller.on('trigger.', ({triggerChannel, triggerEvent})=> {
	// Respond to triggers
	// Lookup recipes the trigger fulfills
	const recipes = getMatchingRecipes(triggerChannel, triggerEvent)
	recipes.map(recipe => {
		const triggerPayload = triggerEvent.payload
		const actionPayload = recipe.action.payload
		Object.keys(actionPayload).forEach(key => {
			const entity = actionPayload[key]
			console.log({entity, triggerPayload})
			// check if entity needs interpolating?
			const rendered = mustache(entity, {payload: triggerPayload})
			console.log({rendered})
			})
		})
	// then trigger the action
	console.log({recipes})
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


/* 
 * Services
 * Webhooks
 * Recipes
 * Triggers
 * Actions
 * Events
 * */
