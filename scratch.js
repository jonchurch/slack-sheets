const mustache = require('mustache').render

const template = "Hello there {{user.name}}!"

const rendered = mustache(template, {user: {name: "Fred"}})
const secondTime = mustache(template, {user: {name: "Hola"}})

console.log({template, rendered})
