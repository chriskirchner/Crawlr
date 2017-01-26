var express = require('express');
var app = express();
var http = require('http').Server(app);
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var io = require('socket.io')(http);

//reaper is the scraper nightmare
var reaper = require('./scraper/nightmare');


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8080);


var bodyParser = require('body-parser');
/*needed for post request */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));


//home page resource
app.get('/',function(req,res){
  res.render('home');
});

/*Handles the inserting and deleting rows in the mySQL table*/
app.post('/', function(req, res, next){
  
  if (req.body.action === 'insert'){
    var data = req.body.formInfo;
    console.log(data);
    
  }
});


// io.on('connection', function(socket){
//   socket.on('reap urls', function(socket){
//       console.log('starting to reap');
//       reaper(io);
//   });
// });


/*route handler for 404 errors */
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

/*route handler for 500 errors */
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// app.listen(app.get('port'), function(){
//   console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });

http.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});