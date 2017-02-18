/**
 * Created by ev on 2/15/17.
 */

/* control settings */

var SETTING_HTMLONLY = true;

$(document).ready(function(){
	$('#html').click(function(e){
		e.preventDefault();

		$('span#html').addClass('glyphicon glyphicon-ok');
		$('span#js').removeClass('glyphicon glyphicon-ok');
		SETTING_HTMLONLY = true;

	});
	$('#js').click(function(e){
		e.preventDefault();

		$('span#html').removeClass('glyphicon glyphicon-ok');
		$('span#js').addClass('glyphicon glyphicon-ok');
		SETTING_HTMLONLY = false;

	});
});