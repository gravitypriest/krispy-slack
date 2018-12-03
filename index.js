'use strict';
const fs = require('fs');
const plugins = require('./plugins');
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const request = require('request');

const bot_token = require('./slack-token.json').token || process.env.SLACK_TOKEN || '';
const rtm = new RtmClient(bot_token);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    console.log(`Connected to channel.`);
    request.post('https://slack.com/api/files.list', {form:{token:bot_token}},  function(err,httpResponse,body) {
        if (err) {
            console.log(err)
            return;
        }
        console.log(body);
    });
});

rtm.on('message', function (event) {
    plugins.forEach(p => {
        p(event, msg => {
            rtm.sendMessage(msg, event.channel)
        });
    });
});

rtm.start();
