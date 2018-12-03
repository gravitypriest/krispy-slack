'use strict';
function testMessage(event, cb) {
	if (event.text === '!test') {
		cb('test');
		return;
	}
}

module.exports = testMessage;