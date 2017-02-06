var express = require('express');
var app = express();
var http = require('http').Server(app);
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;
var pythonShell = require('python-shell');

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


//home page resource
app.get('/',function(req,res){
  res.render('home');
});

//get ajax request from client with url, etc
// app.post('/', function(req, res, next){
//
//   if (req.body.action === 'insert'){
//     var data = req.body.formInfo;
//     console.log(data);
//
//   }
// });


//reaper is the scraper nightmare
var reaper = require('./scraper/nightmare');

//scrapman?
var scrapman = require('./scraper/scrapman');

io.on('connect', function(socket){
  console.log('socket: user connected to socket.io');
  var shell = null;
  socket.on('reap urls', function(start_node){
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
  });
  socket.on('disconnect', function(){
    if (shell){
      shell.end();
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

// app.listen(app.get('port'), function(){
//   console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });

http.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});