/**
 * Created by ev on 2/15/17.
 */

/* control settings */

$(document).ready(function(){
	$('#html').click(function(e){
		e.preventDefault();

		$('span#html').addClass('glyphicon glyphicon-ok');
		$('span#js').removeClass('glyphicon glyphicon-ok');
		$('#settings').attr('value', 'html');

	});
	$('#js').click(function(e){
		e.preventDefault();

		$('span#html').removeClass('glyphicon glyphicon-ok');
		$('span#js').addClass('glyphicon glyphicon-ok');
		$('#settings').attr('value', 'js');

	});
});