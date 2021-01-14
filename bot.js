// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');
var carslist = "";

var callbacksuccess = function (responsedata) {
    carslist = responsedata;
    // console.log(carslist.Ford);
}
// Make a request for a user with a given ID
axios.get('http://nipmtest.rfldev.com/botdata.json', {
  // Axios looks for the `auth` option, and, if it is set, formats a
  // basic auth header for you automatically.
  auth: {
    username: 'rdev020',
    password: 'd$pakt0'
  }
}).then(function (response) {
    // handle success
    //console.log(response.data);
    callbacksuccess(response.data);
  }).catch(function (error) {
    // handle error
    console.log("Not-working");
  });

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            var replyText = "";
            var domains = ["php", "node.js", "python", "angular", "java"];
			/* if (context.activity.text == "Ford") {
				replyText = "Ikon, Car, Jeep, Truck.";
			} elseif (context.activity.text == "Mercedes") {
				replyText = "Benz, S-Class, Z-Class, F-Class, Sedan.";
			} else {
				replyText = `Echo-message: ${ context.activity.text }`;
            } */
            
            Object.keys(carslist).forEach(checkMatch);
            
            function checkMatch(item, index) {
                // console.log(item);
                if (item == context.activity.text.toLowerCase() || (context.activity.text.toLowerCase().search(item) > -1)) {
                    if (!(carslist[item]) || typeof carslist[item] == 'undefined') {
                        replyText = "No resource is currently available.";
                    } else {
                        
                        replyText = carslist[item];                
                    }
                }
            }
            function appendAllResponse(item, index) {
                replyText += "\n " + item + ": ";
                if (!carslist[item] || typeof carslist[item] == 'undefined') {
                    replyText += "No resource is currently available.";
                } else {
                    replyText += carslist[item];
                }
            }
            if (!replyText) {
                if ('all' == context.activity.text.toLowerCase()) {
                    // replyText = JSON.stringify(carslist);
                    Object.keys(carslist).forEach(appendAllResponse);
                } else if ('help' == context.activity.text.toLowerCase() || "hi"  == context.activity.text.toLowerCase() || "hello" == context.activity.text.toLowerCase()) {
                    replyText = "Bot-commands: help, php , python, node.js, angular, java, all";
                } else if (domains.indexOf(context.activity.text.toLowerCase()) > -1) {
                    replyText = "No resource is currently available.";
                } else {
                    
                
                // replyText = `Echo: ${ context.activity.text }`;
                    replyText = "Invalid command."
                }
            }
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
