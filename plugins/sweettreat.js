'use strict';
function sweetTreatMessage(event, cb) {
    if (event.text === '!sweettreat') {
        // for unknown reasons doing this GET in JS wasn't working so I'm curling it
        require('child_process').exec('curl https://redhatmain.southernfoodservice.com/Menu/Weekly/', function(err, stdout, stderr) {
            var block = stdout.substring(stdout.indexOf('var weekly_data = '), stdout.indexOf('var day_data'));
            var blocktrim = block.substring('var weekly_data = '.length).trim();
            blocktrim = blocktrim.substring(0, blocktrim.lastIndexOf(';'));
            var data = JSON.parse(blocktrim);
            var snack = data[0].station_arr.find(obj => {
                    return obj.station === 'SNACK';
            }).item_arr[0].name;
            cb('This week\'s sweet treat is *'+snack+'*.');
            return;
        });
    }
}

module.exports = sweetTreatMessage;