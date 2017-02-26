/**
 * Script: index.js
 * Description: server code that interfaces with client and scrapers
 * Author: Christiano Vannelli and Chris Kirchner
 * Email: vannellc@oregonstate.edu and kirchnch@oregonstate.edu
 */


var express = require('express');
var app = express();
var http = require('http').Server(app);
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;
var pythonShell = require('python-shell');
var session = require('express-session');

//setup handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8080);

//setup bod parser
var bodyParser = require('body-parser');
/*needed for post request */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
//setup session secret
app.use(session({secret:'SuperSecretPassword'}));

session.url_history = [];

//home page resource
app.get('/',function(req,res){

  context = {};
  context.url_history = session.url_history;

  for (var c in context.url_history)
  {
    if (context.url_history[c].crawl_type == '0') {
      context.url_history[c].crawl_type = "Depth-First";
    }

    else if(context.url_history[c].crawl_type == '1') {
      context.url_history[c].crawl_type = "Breadth-First";
    }
  }
  
  res.render('home', context);

});

//get ajax request from client with url, etc
app.post('/', function(req, res, next){

  if (req.body.action === 'reset'){
    session.url_history = [];

  }
});

//setup python shell options for child_process
var shellOptions = {
    mode: 'json',
    pythonPath: './venv/bin/python3',
    pythonOptions: ['-u'],
    // scriptPath: './scrapys/scrapys/spiders'
    scriptPath: './scraper/'
};

//function called when user connects to server
io.on('connect', function(socket){
  console.log('socket: user connected to socket.io');
  var shell = null;

  //function called when user issues a crawl from client
  socket.on('reap urls', function(start_node){

    console.log('reaping urls...');
    //crawl input is pushed to url history
    session.url_history.push(start_node);

    //arguments for child process
    shellOptions.args = [
        start_node.url, start_node.max_levels, start_node.keyword, start_node.crawl_type
    ];

    //create python shell for python bfs scraper
    // shell = new pythonShell('bfs_wrapper.py', shellOptions);
    shell = new pythonShell('bfs.py', shellOptions);

      //function called when node is received from scraper
    //uploads node to client
    // var i = 0;
    shell.on('message', function(message){
      //kill scraper when keyword is found
      // if (i++ > 400){
      //     shell.childProcess.kill('SIGINT');
      // }
      if (message.keyword){
        shell.childProcess.kill('SIGINT');
      }
      // console.log(message);
      //send node to client
      console.log(message);
      socket.emit('node send', message);
    });
    //function called when error received from scraper
    shell.on('error', function(err){
      console.log(err);
    });
  });

  //function called on client disconnect
  socket.on('disconnect', function(){
    //kills scraper on disconnect
    if (shell){
      shell.childProcess.kill('SIGINT');
    }
  	console.log('user disconnected');
  });

});

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

 process.on('SIGINT', function() {
  process.exit();
});

//finally, setup server
http.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
