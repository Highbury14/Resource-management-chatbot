// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');
var replyText = "";
var domains = ["php", "nodejs", "python", "angular", "java", "outsystems"];

function checkMatch(domainslist, context, item, index) {
    if (item == context.toLowerCase() || (context.toLowerCase().search(item) > -1)) {
        if (!(domainslist[item]) || typeof domainslist[item] == 'undefined') {
            replyText = "No resource is currently available.";
        } else {
            replyText = domainslist[item];                
        }
    }
}

function appendAllResponse(domainslist, item, index) {
    replyText += "\n " + item.replace(item.substr(0, 1), item.substr(0, 1).toUpperCase()) + " : ";
    if (!domainslist[item] || typeof domainslist[item] == 'undefined') {
         replyText += "No resource is currently available.";
    } else {
        replyText += domainslist[item];
    }
}    
    
function processData(response, context) {
	if (typeof response == undefined || typeof response.data == undefined || (typeof response.data != 'string' && typeof response.data != 'object') || (typeof response.data == 'string' && response.data.length == 0)) {
		replyText = "Data not available.";
		return;
	}
    var domainslist = response.data;
   
    replyText = "";
        
    if (typeof domainslist == 'string') {
        domainslist = domainslist.replace(", }", "}");
        domainslist = domainslist.replace(",}", "}");
        domainslist = JSON.parse(domainslist);
     
    }
	if (typeof domainslist != "object") {
		replyText = "Data not available.";
		return;
	}
    Object.keys(domainslist).forEach(function(item, index) {
        checkMatch(domainslist, context, item, index);
    });
    
    if (!replyText) {
        if ('all' == context.toLowerCase()) {
    
            Object.keys(domainslist).forEach(function(item, index) {
                appendAllResponse(domainslist, item, index);
            });
    
        } else if (domains.indexOf(context.toLowerCase()) > -1) {
            replyText = "No resource is currently available.";
        } else {
                // replyText = `Echo: ${ context.activity.text }`;
            replyText = "Invalid command."
        }
    }   
}  

function errorData() {
	replyText = "Data not available.";
}

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
			if ('help' == context.activity.text.toLowerCase() || "hi"  == context.activity.text.toLowerCase() || "hello" == context.activity.text.toLowerCase() || (context.activity.text.toLowerCase().search("hi ") > -1) || (context.activity.text.toLowerCase().search("hello") > -1) ||
				(context.activity.text.toLowerCase().search("help") > -1)) {
				replyText = "Bot-commands: help, php, python, nodejs, angular, java, all, etc.";
			} else {
				var inputCommand = context.activity.text;
				await axios.get('https://reflectionsglobal.com/rs/bot/data.json')
				.then(function (response) {
					processData(response, inputCommand);
					
				}).catch(function (error) {
					//console.log(error);
					errorData();
				});
			}
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome! \n Bot-commands: help, php, python, node.js, angular, java, all';
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
