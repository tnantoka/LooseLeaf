function showSocketArea() {
    var body = $(document.body);
    body.removeClass('single');
    body.addClass('double');
    $('#utilities').attr('id', 'utilities_temp');
    $('#utilities2').attr('id', 'utilities');
    
	var width = '400px';
    $('body.double div#main').css('marginLeft', width);
    $('body.double div#content p.return').css('marginLeft', width);
    $('body.double div#utilities').css('width', width);
}
function hideSocketArea() {
    var body = $(document.body);
    body.addClass('single');
    body.removeClass('double');
    $('#utilities').attr('id', 'utilities2');
    $('#utilities_temp').attr('id', 'utilities');

	var width = '228px';
    $('body.double div#main').css('marginLeft', width);
    $('body.double div#content p.return').css('marginLeft', width);
    $('body.double div#utilities').css('width', width);
}
showSocketArea();

//images/interface/bg_div-utilities.png
//http://localhost:3000/css/style-future/images/interface/bg_div-content.png