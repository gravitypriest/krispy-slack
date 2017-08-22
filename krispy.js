const request = require('request');
const krispyEndpoint = 'http://services.krispykreme.com/api/locationsearchresult/?responseType=Full&search=%7B%22Where%22%3A%7B%22LocationTypes%22%3A%5B%22Store%22%2C%22Commissary%22%2C%22Franchise%22%5D%2C%22OpeningDate%22%3A%7B%22ComparisonType%22%3A0%7D%7D%2C%22Take%22%3A%7B%22Min%22%3A3%2C%22DistanceRadius%22%3A25%7D%2C%22PropertyFilters%22%3A%7B%22Attributes%22%3A%5B%22FoursquareVenueId%22%2C%22OpeningType%22%5D%7D%7D';

module.exports = {
    getKremes: function(lat, lng, idx, cb) {
        const fullQuery = krispyEndpoint + '&lat=' + lat + '&lng=' + lng;
        request.get(fullQuery, function(err, res, body) {
            if (err) {
                return cb(err);
            }
            if (res.statusCode !== 200) {
                return cb('HTTP Error: ' + res.statusCode);
            }

            const kremes = JSON.parse(body);
            if (kremes.length === 0) {
                cb('No Krispy Kremes found within 25 miles. :(');
            }
            if (idx) {
                return cb(null, [kremes[idx]]);
            }
            return cb(null, kremes);
        });
    }
};