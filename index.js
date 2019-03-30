const express = require('express')
const bodyParser = require('body-parser')
const { EventEmitter } = require('events')

const mockRecipesIds = ['slack/messagePosted']
const mockRecipesById = {
	'slack/messagePosted': {
		trigger: {

			},
		action: {
			service: "googleSheets",
			actionType: "addRow",
			payload: {
				formattedRow: "{{payload.user}}||{{payload.channel}}||{{payload.text}}"
				}
			}
		}
}

const app = express()
const controller = new EventEmitter()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// this is a slack specific endpoint for ingesting slack events
app.route("/services/slack")
	.post((req, res) => {
		const {challenge} = req.body
	if (challenge) {
		res.send(challenge)
		} else {
			// console.log(req.body)
			res.sendStatus(200)
		handleSlackEvent(req.body)
			}
		})
// slack service specific webhook event handler
function handleSlackEvent(payload) {
	console.log({payload})
	const {event, team_id } = payload

	// Format the webhook event into standard trigger event
	const triggerEvent = {
		// eventType: "trigger",
		service: "slack",
		triggerType: "messagePosted",
		payload: {
			team: team_id,
			user: event.user,
			// type: "message",
			text: event.text,
			channel: event.channel
			}
		}

	// publishTriggerEvent(triggerEvent)
	const  triggerChannel = `${triggerEvent.service}/${triggerEvent.triggerType}`//?team=${triggerEvent.payload.team}`

	// find recipes that are put into motion by the trigger event
	const recipes = getMatchingRecipes(triggerChannel, triggerEvent)
	console.log({recipes})

	// once we have the recipes, hand them off to whatever worker/queue/etc handles firing the action
	//
	controller.emit(triggerChannel, triggerEvent)
}
// mocked up finding recipes whose conditions are satisfied by the trigger event
function getMatchingRecipes(triggerChannel, triggerEvent) {
	console.log({triggerChannel})
	if (mockRecipesIds.includes(triggerChannel)) {
		return [mockRecipesById[triggerChannel]]
		} else {
			return []
			}
}
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
