## Event Driven Programming

### Overview

We talked before about creating an IFTTT type clone, to let users create their own "recipes" which integrate data and events from different services. I've revisited this idea and have some thoughts about it.

The problem this solves is translating events from one system, into actions that occur in another system. If slack message w/ payload of X, then add a row to a google spreadsheet w/ data from slack message payload.

The solution would be to create loosely coupled services which can publish and subscribe to events that concern them. On webhook request received from 3rd party service, publish trigger event with the payload, any interested subscribers can run as a result, and publish an action event which will be picked up by the appropriate service. 

Concepts we would teach would be:
* Event Driven Programming
	- Using EventEmitter in Node for an in-memory event system
		- Upgrade to MQTT, or Redis, for persistent pub/sub service queue
	- Subscribe to events
	- Publish events
* Modular Service design
	- Create Services as a self contained module
	- Dependency Injection, inject the pub/sub and server deps into each service module
	- Register a service with the app by requiring it and passing in its deps
* Integrate w/ third party APIs
	- Create API client ourselves
	- Import existing API client library from npm
* Ingest Webhook events from 3rd party services
	- Setup express route for each service to receive and process webhooks at
	- Use ngrok to expose local ports for receiving webhooks in development
	- Verify webhook request comes from authentic origin
* Setup oAuth token generation w/ 3rd Party services


### Existing Projects
I found several projects as inspiration, OSS projects that let users create recipes like IFTTT:

* [Node Red](https://nodered.org/) - JS foundation + IBM project, IOT and IFTTT style workflows. Has lots of integrations (called "nodes"). 
* [Huginn](https://github.com/huginn/huginn) - Ruby application, one of the most popular projects in this niche. Frontend is much more developer focused, inputting JSON payloads and all.
* [Datafire](https://github.com/DataFire/DataFire) - Node applicaton, limited triggers (mostly cron, no triggers created by 3rd party APIs webhooks)
* [Serverless Event Gateway](https://github.com/serverless/event-gateway) - More of a framework than a project, connects a serverless mesh of services, which can publish and subscribe to Events. Everything is a handler for an event, and events are propogated through the whole system. Functions are registed as services, and can subscribe to any event in the system.

## Current Setup

Main pieces are the `index.js` server file, the `services` directory, and the `events.js` file (which currently listens for trigger events and finds their recipes). Services will be a module of code that deals with the Services API, publishing any triggers the service implements, and define the actions the service exposes. A service subscribes to its own topic, to respond to action events that are emitted by running the action.

IFTTT uses polling to generate some actions, e.g. poll the given api until results we haven't seen before are returned. Instead of polling, I'm focusing on APIs that provide a webhook to receive events at.

IFTTT and similar services are full webapps, with a your recipes living as records in a DB somewhere, and your personal auth tokens for a service stored as well. Recipes can easily be hard coded using the EventEmitter pattern and our modular design. 

Introducing a multi-user environment, and also storing recipes in a DB would introduce more complexity to the application. A multi-user environment would either involve specifying different config options for hard coded recipes, or having a full web app with User accounts, oath token generation on a per-user per-service basis (user "connects" the service by 3rd party oAuth), and storing recipes in a DB.
