const fs = require('fs')
const { google } = require('googleapis')

const serviceName = 'googleSheets'

const { 
	installed: {client_id, client_secret, redirect_uris}
} = JSON.parse(fs.readFileSync('./credentials.json'))
const token = JSON.parse(fs.readFileSync('./token.json'))

const OAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
OAuth2Client.setCredentials(token)

const sheets = google.sheets({ version: 'v4', auth: OAuth2Client})

// const configClient = async () => {
//   const {
//     installed: { client_id, client_secret, redirect_uris },
//   } = JSON.parse(fs.readFileSync('./credentials.json'))

//   const token = JSON.parse(fs.readFileSync('./token.json'))
//   const oauthClient = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     redirect_uris[0]
//   )
//   oauthClient.setCredentials(token)
//   return oauthClient
// }

module.exports = ({ router, subscribe, publish }) => {
  const actions = {
    addRowToSheet: async event => {
      // const auth = await configClient()
      const { payload } = event
      console.log({ event })
      sheets.spreadsheets.values.append(
        {
          // auth,
          spreadsheetId: payload.spreadsheetId,
          range: 'Sheet1',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: payload.rows,
          },
        },
        (err, res) => {
          if (err) return console.log('The API returned an error: ' + err)
          console.log(res.data)
        }
      )
    },
  }

  Object.keys(actions).forEach(method =>
    subscribe(`${serviceName}/${method}`, event => actions[method](event))
  )

}
