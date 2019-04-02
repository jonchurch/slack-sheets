const fs = require('fs')
const { google } = require('googleapis')
const sheets = google.sheets({ version: 'v4' })

const serviceName = 'googleSheets'

const configClient = async () => {
  const {
    installed: { client_id, client_secret, redirect_uris },
  } = JSON.parse(fs.readFileSync('./credentials.json'))
  console.log({ client_id, client_secret, redirect_uris })
  const token = JSON.parse(fs.readFileSync('./token.json'))
  const oauthClient = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )
  oauthClient.setCredentials(token)
  return oauthClient
  // return new Promise((resolve, reject) => {

  // fs.readFile(TOKEN_PATH, (err, token) => {
  // const {client_secret, client_id, redirect_uris} = credentials.installed;
  // const oAuth2Client = new google.auth.OAuth2(
  // client_id, client_secret, redirect_uris[0]);
  //   // if (err) return getNewToken(oAuth2Client);
  //   if (err) return console.log(err)
  // oAuth2Client.setCredentials(JSON.parse(token));
  // callback(oAuth2Client);
  // });

  // 	})
}

module.exports = ({ router, subscribe, publish }) => {
  const actions = {
    addRowToSheet: async event => {
      const auth = await configClient()
      const { payload } = event
      console.log({ event })
      sheets.spreadsheets.values.append(
        {
          auth,
          spreadsheetId: '1AOGTwNGSXkYJiVJVCQvzY3NLq4HOlWQlu4t0rLhFPjY',
          range: 'Sheet1',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [
              [
                'Jon Pizza',
                '555-555-555',
                'large',
                'ham, shroom, feta',
                new Date().toString(),
              ],
            ],
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

  publish('googleSheets/addRowToSheet', {})
}
