var express = require('express');
var app = express();
var http = require('http').Server(app);
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var io = require('socket.io')(http);
<<<<<<< HEAD
var spawn = require('child_process').spawn;
var pythonShell = require('python-shell');
=======
var session = require('express-session');
>>>>>>> bfs2

var shellOptions = {
  mode: 'json',
  pythonPath: './virtualenv/bin/python',
  pythonOptions: ['-u'],
  scriptPath: './scraper'
};

//setup handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8080);


var bodyParser = require('body-parser');
/*needed for post request */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.use(session({secret:'SuperSecretPassword'}));

session.url_history = [];

//home page resource
app.get('/',function(req,res){

  context = {};
  context.url_history = session.url_history;

  for (var c in context.url_history)
  {
    if (context.url_history[c].crawl_type == '0')
    {
      
      context.url_history[c].crawl_type = "Depth-First";
    }

    else if(context.url_history[c].crawl_type == '1')
    {
      context.url_history[c].crawl_type = "Breadth-First";
    }
  }
  
  // console.log(context.url_history);
  res.render('home', context);

});

//get ajax request from client with url, etc
app.post('/', function(req, res, next){

  if (req.body.action === 'reset'){
    session.url_history = [];

  }
});


//reaper is the scraper nightmare
var reaper = require('./scraper/nightmare');

//scrapman?
var scrapman = require('./scraper/scrapman');

io.on('connect', function(socket){
  console.log('socket: user connected to socket.io');
  var shell = null;
  socket.on('reap urls', function(start_node){
<<<<<<< HEAD
    console.log('reaping...');
    shellOptions.args = [start_node.url];
    shell = new pythonShell('multithreaded.py', shellOptions);
    // pythonShell.run('multithreaded.py', shellOptions, function(err, results){
    //   if (err) throw err;
    //   var j = JSON.parse(results.toString());
    //   console.log(j);
    // });

    shell.on('message', function(message){
      socket.emit('node send', message);
    });

    // var scraper = spawn('./virtualenv/bin/python',
    //     ['./scraper/multithreaded.py', start_node.url]);
    // var json_string = '';
    // scraper.stdout.on('data', function(d){
    //   json_string += d.toString();
    //   //socket.emit('node send',JSON.parse(JSON.stringify(d.toString())));
    // });
    // scraper.stdout.on('end', function(){
    //   var j = JSON.parse(JSON.stringify(json_string));
    //   for (var k in j){
    //     console.log(k);
    //   }
    //   json = '';
    // });
=======
    // console.log('reaping...');
    
    session.url_history.push(start_node);
    
    // scrapman(socket, start_node, 2);
>>>>>>> bfs2
  });
  socket.on('disconnect', function(){
    if (shell){
      shell.end();
    }
  	console.log('user disconnected');
  });
  process.on('SIGINT', function() {
  socket.close();
  process.exit();
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

// app.listen(app.get('port'), function(){
//   console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });

http.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});