var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config =  require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session),
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	port = 3002,
	rooms = [];


app.set('views', path.join(__dirname,'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());


var env = process.env.NODE_ENV || 'development';

if(env === 'development') {
	console.log('Works till here');
	app.use(session({secret:'ABCSSSSSSSS'}));
} else {
	app.use(session({
		secret:config.sessionSecret,
		store: new ConnectMongo({
			//url:config.dbURL,
			mongoose_connection:mongoose.connections[0],
			stringify:true,
		})
	}));
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport,FacebookStrategy,config,mongoose);

//Hiving out the routing functionality to routes.js file
require('./routes/routes.js')(express, app, passport,config,rooms);

/*app.listen(port, function(){
	console.log('PalTask up on server port' + port);
	console.log('Running Mode' + env);
});*/
app.set('port', process.env.PORT || 3002);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

require('./socket/socket.js')(io,rooms);

server.listen(app.get('port'), function(){
	console.log('PalTask up on server port' + app.get('port'));
});