'use strict';
function getNextPayday(curday) {
    var payday = new Date('1/12/2018');

    function dateString(date) {
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return month + '/' + day;
    }

    var msg = 'Next payday is ';
    var today = false;
    var paydayStr;
    while (payday < curday) {
        payday.setDate(payday.getDate()+14)
        if (dateString(payday) === dateString(curday)) {
            today = true;
            paydayStr = 'TODAY!!'
            break;
        }
    }
    if (!today) {
        paydayStr = dateString(payday);
    }
    return paydayStr;
}


function paydayMessage(event, cb) {
    if (event.text === '!payday') {
            cb('Next payday is *' + getNextPayday(new Date()) + '*');
            return;
        }
        if (event.text === '!bonus') {
            var quarters = ['5/31/2018', '8/31/2018', '11/30/2018', '2/28/2019']
            var today = new Date();
            var nextBonus;
            for (var q in quarters) {
                var qEnd = new Date(quarters[q]);
                qEnd.setMonth(qEnd.getMonth()+2);
                if (today < qEnd) {
                    nextBonus = getNextPayday(qEnd);
                    if (nextBonus !== 'TODAY!!') {
                        nextBonus = 'on approximately ' + nextBonus;
                    } 
                    break;
                }
            }
            cb('Next bonuses *' + nextBonus + '*');
            return;
        }
}

module.exports = paydayMessage;