/* Generate rfc3339 from date object */
module.exports.convert = function(date) {

	var year = date.getFullYear();
	var month = fillZero((date.getMonth() + 1), 2);
	var day = fillZero(date.getDate(), 2);
	var hours = fillZero(date.getHours(), 2);
	var minutes = fillZero(date.getMinutes(), 2);
	var seconds = fillZero(date.getSeconds(), 2);

	var offset = date.getTimezoneOffset();
	var offsetSign = offset > 0 ? '-' : '+';
	var offsetHours = fillZero(Math.floor(Math.abs(offset) / 60), 2)
	var offsetMinutes = fillZero(Math.abs(offset) % 60, 2);

	var rfc3339 = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + offsetSign + offsetHours + ':' + offsetMinutes;

	return rfc3339;
};

function fillZero(s, n) {
	var zero = '';
	for (var i = 0; i < n; i++) {
		zero += '0';
	} 
	return (zero + s).slice(-n);
}