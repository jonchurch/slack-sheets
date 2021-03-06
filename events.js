const mustache = require('mustache').render
const cloneDeep = require('clone-deep')

const mockRecipesIds = ['slack/messagePosted', 'console/readLine']
const mockRecipesById = {
  'slack/messagePosted': {
    trigger: {
      service: 'slack',
      triggerType: 'messagePosted',
    },
    action: {
      service: 'console',
      actionType: 'log',
      payload: {
        message: "Slack user:{{payload.user}} said '{{payload.text}}'",
      },
    },
  },
  'console/readLine': {
    trigger: {
      service: 'console',
      triggerType: 'readLine',
    },
    action: {
      service: 'slack',
      actionType: 'postMessage',
      payload: {
        text: 'CONSOLE: {{payload.input}}',
        channel: '#general',
      },
    },
  },
}
// mocked up finding recipes whose conditions are satisfied by the trigger event
function getMatchingRecipes(triggerChannel, triggerEvent) {
  // console.log({triggerChannel})
  if (mockRecipesIds.includes(triggerChannel)) {
    const recipe = cloneDeep(mockRecipesById[triggerChannel]) //{...mockRecipesById[triggerChannel]}
    return [{ ...recipe }]
  } else {
    return []
  }
}

function interpolatePayload(actionPayload, triggerPayload) {
  // const actionPayload = {...actionPayloadOriginal}
  // const triggerPayload = {...triggerPayloadOriginal}
  return Object.keys(actionPayload).reduce((a, key) => {
    const entity = actionPayload[key]
    console.log({ entity, actionPayload, triggerPayload })
    // console.log({entity})
    // I think mustache is mutating our tempalte here? wtf mustache
    const rendered = mustache('' + entity, { payload: triggerPayload })
    console.log({ rendered })
    a[key] = rendered
    return a
  }, {})
}
module.exports = ({ subscribe, publish }) => {
  // controller.emit('slack/action/postMessage', mockRecipesById[mockRecipesIds[0]].action)
  subscribe('trigger.', ({ triggerChannel, triggerEvent }) => {
    console.log('heard trigger', triggerChannel)
    // Respond to triggers
    // Lookup recipes the trigger fulfills
    const recipes = getMatchingRecipes(triggerChannel, triggerEvent)
    recipes.slice().forEach(recipe => {
      const actionPayload = recipe.action.payload
      const triggerPayload = triggerEvent.payload
      const interpolatedPayload = interpolatePayload(
        actionPayload,
        triggerPayload
      )
      // this is just not good practice, is all
      // I don't need deep clone, I just need to not mutate objects like this
      recipe.action.payload = interpolatedPayload
      // then trigger the action
      controller.emit(`${recipe.action.service}/${recipe.action.actionType}`, {
        ...recipe.action,
        payload: interpolatedPayload,
      })
      // controller.emit(
      //   `${recipe.action.service}/${recipe.action.actionType}`,
      //   recipe.action
      // )
    })
  })
  publish('googleSheets/addRowToSheet', {
    payload: {
      rows: [
        [
          'Steve Spaghetti',
          '555-555-555',
          'large',
          'ham, shroom, feta',
          'pizza@pasta.com',
          new Date().toString(),
        ],
      ],
      spreadsheetId: '1AOGTwNGSXkYJiVJVCQvzY3NLq4HOlWQlu4t0rLhFPjY',
    },
  })
}
