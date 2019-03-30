const slack = require('slack')

module.exports = (app, controller) => {


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
	// console.log({payload})
	const {event, team_id } = payload
	if (event.bot_id) {
		return
		}

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
	// find recipes that are put into motion by the trigger event
	// const recipes = getMatchingRecipes(triggerChannel, triggerEvent)
	const  triggerChannel = `${triggerEvent.service}/${triggerEvent.triggerType}`//?team=${triggerEvent.payload.team}`

	controller.emit('trigger.', {triggerChannel, triggerEvent})
}

const actions = {
	postMessage: action => {
		console.log({action})
		// use slack API to send the message w/ the data provided by the recipe?
		const {text} = action.payload
		slack.chat.postMessage({token: process.env.SLACK_TOKEN, channel: "#general", text})
		}
}

controller.on('slack/postMessage', action => actions.postMessage(action))

}
