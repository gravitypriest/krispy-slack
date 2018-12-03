const fs = require('fs');

module.exports = {
    loadLatLong: function(zipcode, cb) {
        fs.readFile('US.txt', (err, data) => {
            if (err) {
                console.log('error reading file');
                return cb(err, 'Could not load coordinates file.');
            }
            const zips = data.toString().split('\n');
            for (var z in zips) {
                if (zips[z].startsWith(`US\t${zipcode}`)) {
                    const ziparr = zips[z].split('\t');
                    return cb(null, {lat: ziparr[9], lng: ziparr[10]});
                }
            }
        });
    }
};
