'use strict';
const geocode = require('./hotlight-utils/geocode');
const krispy = require('./hotlight-utils/krispy');

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
            return 'Error saving config!';
        }
    });
}

function hotlightMessage(event, cb) {
    if (conf && conf.configure) {
        if (event.text === '!hotlight configure cancel') {
            conf = {configure: false};
            cb('Configuration canceled.');
            return;
        }

        if (conf.zip === -1 && event.text.startsWith('!hotlight zip')) {
            let zip;
            try {
                zip = parseInt(event.text.substring('!hotlight zip '.length));
            } catch (e) {
                cb('Could not parse ZIP code.');
                return;
            }
            if (isNaN(zip)) {
                cb('Could not parse ZIP code.');
                return;
            } else if (zip < 10000 || zip > 99999) {
                cb('ZIP code must be 5 digits.');
                return;
            } else {
                conf.zip = zip;
                geocode.loadLatLong(zip, (err, data) => {
                    if (err) {
                        cb(data);
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
                        cb('Type `!hotlight select <number>` to select a preferred ' +
                           'Krispy Kreme from the following:\n' +
                           kremeStr);
                        return;
                    });
                });
            }
        }

        if (conf.results && event.text.startsWith('!hotlight select')) {
            let idx;
            try {
                idx = parseInt(event.text.substring('!hotlight select '.length)) - 1;
            } catch (e) {
                cb('Could not parse selection.');
                return;
            }
            conf.idx = idx;
            const selectedKreme = conf.results[idx];
            cb('Got it! Preferred Krispy Kreme set to ' +
                selectedKreme.Location.Address1 + ', ' + 
                selectedKreme.Location.City + ', ' + 
                selectedKreme.Location.Province + '.');
            saveConfig();
            conf = {configure: false};
            return;
        }
    }
    if (!conf.configure && event.text === '!hotlight') {
        let config;
        try {
            config = require('./config.json');
        } catch (e) {
            cb('Configuration not found. Type `!hotlight configure` to create it.');
            return;
        }
        console.log(config);
        krispy.getKremes(config.lat, config.lng, config.idx, (err, kremes) => {
            const hot = kremes[0].Location.Hotlight;
            if (hot) {
                cb('Hot Light is *on*!');
                return;
            } else {
                cb('Hot Light is *off*.');
                return;
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
        cb('Please enter a zipcode, e.g. `!hotlight zip XXXXX`');
        return;
    }
}

module.exports = hotlightMessage;