var express = require('express');
var app = express();
var db;

app.use( require('body-parser')())

app.disable('x-powered-by')
var handlebars=require( 'express3-handlebars'  ).create( {  defaultLayout: 'main'  }   );
app.engine(  'handlebars', handlebars.engine  );

app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});



app.post('/chat', function(req,res){

console.log(req.body)
var username= req.body.username;

res.render('chat', {currentUser: username} );

}
 );






app.get('/', function(req,res){
res.render('home' );
}
 );


app.get('/registration', function(req,res){

res.render('registration' );

}
 );

app.post('/registration', function(req, res){
 

console.log(req.body)
var username= req.body.username;
var email=req.body.email;
var password= req.body.password;
var confirmPassword= req.body.confirm-password;
// registration process here

var res_html='Many thanks for registration, ' + username + '.<br>';

res.send(res_html);
});



app.get('/quote', function(req,res){

res.render('quote' );

}
);


app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
});


app.get('/showQuotes', function(req,res){

  var cursor = db.collection('quotes').find().toArray(
function(err, results){


console.log(results)
	res.send(results)
}


  	)

}
	)



// custom 404 page
app.use(function(req, res){
res.status(404);
res.render('404');

});
// custom 500 page
app.use(function(err, req, res, next){
console.error(err.stack);
res.status(500);
res.render('500');
});





//const MongoClient = require('mongodb').MongoClient
//var linkToMongodb='';

//MongoClient.connect(linkToMongodb, (err, database) => {

// if(err) return console.log(err)
// db= database
// app.listen(app.get('port'), function(){
// console.log( 'Express started on http://localhost:' +
// app.get('port') + '; press Ctrl-C to terminate.' );
// });
 
// })


