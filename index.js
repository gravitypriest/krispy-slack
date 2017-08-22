const fs = require('fs');
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const request = require('request');
const geocode = require('./geocode');
const krispy = require('./krispy');

const bot_token = require('./slack-token.json').token || process.env.SLACK_TOKEN || '';
const rtm = new RtmClient(bot_token);

let channel;
let conf = {configure: false};

function saveConfig() {
    const strippedConf = {
        lat: conf.lat,
        lng: conf.lng,
        idx: conf.idx
    };
    fs.writeFile('config.json', JSON.stringify(strippedConf), (err) => {
        if (err) {
            console.log('Error saving config!');
            rtm.sendMessage('Error saving config!' , channel);
        }
    });
}

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name ==='general') { channel = c.id; }
    }
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    console.log(`Connected to channel.`);
});

rtm.on('message', function (event) {
    if (conf && conf.configure) {
        if (event.text === '!hotlight configure cancel') {
            rtm.sendMessage('Configuration canceled.', channel);
            conf = {configure: false};
        }
        if (conf.zip === -1 && event.text.startsWith('!hotlight zip')) {
            let zip;
            try {
                zip = parseInt(event.text.substring('!hotlight zip '.length));
            } catch (e) {
                rtm.sendMessage('Could not parse ZIP code.', channel);
            }
            if (isNaN(zip)) {
                rtm.sendMessage('Could not parse ZIP code.', channel);
            } else {
                conf.zip = zip;
                geocode.loadLatLong(zip, (err, data) => {
                    if (err) {
                        rtm.sendMessage(data, channel);
                        conf = {};
                        return;
                    }
                    conf.lat = data.lat;
                    conf.lng = data.lng;

                    krispy.getKremes(conf.lat, conf.lng, null, (err, kremes) => {
                        let kremeStr = '';
                        let count = 1;

                        conf.results = kremes;
                        kremes.forEach(k => {
                            kremeStr += count + '. ' + 
                                k.Location.Address1 + ', ' + 
                                k.Location.City + ', ' + 
                                k.Location.Province + '\n';
                            count++;
                        });
                        rtm.sendMessage('Type `!hotlight select <number>` to select a preferred ' +
                                        'Krispy Kreme from the following:\n' +
                                        kremeStr, channel);
                    });
                });
            }
        }

        if (conf.results && event.text.startsWith('!hotlight select')) {
            let idx;
            try {
                idx = parseInt(event.text.substring('!hotlight select '.length)) - 1;
            } catch (e) {
                rtm.sendMessage('Could not parse selection.', channel);
            }
            conf.idx = idx;
            const selectedKreme = conf.results[idx];
            rtm.sendMessage('Got it! Preferred Krispy Kreme set to ' +                                 
                selectedKreme.Location.Address1 + ', ' + 
                selectedKreme.Location.City + ', ' + 
                selectedKreme.Location.Province + '.', channel);
            saveConfig();
            conf = {configure: false};
        }
    }
    if (!conf.configure && event.text === '!hotlight') {
        let config;
        try {
            config = require('./config.json');
        } catch (e) {
            rtm.sendMessage('Configuration not found. Type `!hotlight configure` to create it.', channel);
            return;
        }
        console.log(config);
        krispy.getKremes(config.lat, config.lng, config.idx, (err, kremes) => {
            const hot = kremes[0].Location.Hotlight;
            if (hot) {
                rtm.sendMessage('Hot Light is *on*!', channel);
            } else {
                rtm.sendMessage('Hot Light is *off*.', channel);
            }
        });

    } else if (event.text === '!hotlight configure') {
        conf = {
            configure: true,
            zip: -1,
            lat: 0,
            lng: 0,
            radius: 0,
            results: [],
            idx: -1
        };
        rtm.sendMessage('Please enter a zipcode, e.g. `!hotlight zip XXXXX`', channel);
    }
});

rtm.start();