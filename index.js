const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.route("/")
	.get((req, res) => {
		res.send("ok")
		})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))

