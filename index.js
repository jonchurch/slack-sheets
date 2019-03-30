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

function handleSlackEvent(payload) {
	console.log({payload})
	const {event, team_id } = payload
	// need to format the payload into a standard event
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

	const recipes = getMatchingRecipes(triggerChannel, triggerEvent)
	console.log({recipes})
	// once we have the recipes, hand them off to whatever worker/queue/etc handles firing the action
	controller.emit(triggerChannel, triggerEvent)
}
function getMatchingRecipes(triggerChannel, triggerEvent) {
	console.log({triggerChannel})
	if (mockRecipesIds.includes(triggerChannel)) {
		return [mockRecipesById[triggerChannel]]
		} else {
			return []
			}
}
controller.on('slack/messagePosted', payload => {
	// update spreadsheet?
	// well, I need a way to lookup recipe triggers really, the goal isn't to do all this in code
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))

