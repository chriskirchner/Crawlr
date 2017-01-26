/**
 * Created by ev on 1/24/17.
 */

$('h1.section-heading').css({'color':'yellow'});
var io = io();
$('button.btn.btn-default').click(function(){
    io.emit('reap urls');

});
io.on('node', function(node){
    var item = $('<li>').text(node).css({'color':'white'});
    $('#scraper-content').append(item);
});