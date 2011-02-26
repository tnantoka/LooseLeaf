/* Global functions */

// Fill zero for string
function fillZero(s, n) {
	var zero = '';
	for (var i = 0; i < n; i++) {
		zero += '0';
	} 
	return (zero + s).slice(-n);
}

// Date to readable string
function toReadableDate(s) {
	
	if (!s) { 
		return;
	}
	
	var date = new Date(s);
	
	var year = date.getFullYear();
	var month = fillZero((date.getMonth() + 1), 2);
	var day = fillZero(date.getDate(), 2);
	var hours = fillZero(date.getHours(), 2);
	var minutes = fillZero(date.getMinutes(), 2);
	var seconds = fillZero(date.getSeconds(), 2);

	var offset = date.getTimezoneOffset();
	var offsetSign = offset > 0 ? '-' : '+';
	var offsetHours = fillZero(Math.floor(Math.abs(offset) / 60), 2);
	var offsetMinutes = fillZero(Math.abs(offset) % 60, 2);

	var dateString = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + offsetSign + offsetHours + ':' + offsetMinutes;

	return dateString;
}

// Make opening contents
function makeOpening(body) {
	// Remove tag
	body = body.replace(/<[^>]+?>/g, '');
	var limit = 100;
	return body.slice(0, limit) + (body.length > limit ? "..." : '');
}

// Make excerpt contents for TrackBack
function makeExcerpt(body) {
	// Remove tag
	body = body.replace(/<[^>]+?>/g, '');
	return body.slice(0, 254);
}

exports.toReadableDate = toReadableDate;
exports.makeOpening = makeOpening;
exports.makeExcerpt = makeExcerpt;

