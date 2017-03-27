var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ini = require('ini');
var fs = require('fs');
var rhn = require('./reflectorHostNames');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var index = require('./routes/index');
var users = require('./routes/users');
var udrc = require('./routes/udrc');
var login = require('./routes/login');
var ircddbgateway = require('./routes/ircddbgateway');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/jquery-ui', express.static(__dirname + '/node_modules/jquery-ui-dist/'));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use('/', index);
app.use('/udrc', udrc);
app.use('/ircddbgateway', ircddbgateway);
app.use('/users', users);

app.get('/config', 
	passport.authenticate('local', { failureRedirect: '/login' }),
	function (req,res) {
	var curConf = {};
	var uri = "/etc/opendv/dstarrepeater_1";
	switch (req.query.modFile) {
		case "bcr220":
			uri="./resources/bcr220.mod"
			break;
		case "dr1x-uhf":
			uri="./resources/dr1x-uhf.mod"
			break;
		case "dr1x-vhf":
			uri="./resources/dr1x-vhf.mod"
			break;
		case "other":
			uri="./resources/other.mod"
			break;
		case "Reset":
			uri="./resources/reset.mod"
			break;
	}
	var curConfStr = fs.readFileSync(uri, { encoding : "UTF-8" });
	curConf = ini.parse(curConfStr);
	res.send(curConf);
});

app.get('/ircconfig', 
	passport.authenticate('local', { failureRedirect: '/login' }),
	function (req,res) {
	var curConf = {};
	var uri = "/etc/opendv/ircddbgateway";
	switch (req.query.modFile) {
		case "Reset":
			uri="./resources/ircreset.mod"
			break;
	}
	var curConfStr = fs.readFileSync(uri, { encoding : "UTF-8" });
	curConf = ini.parse(curConfStr);
	res.send(curConf);
});

app.get('/reflector-list', function(req, res, next) {
	res.send(rhn());
});

app.get('/login', function(req, res, next){
	res.render('login');
});

app.post('/login',
	passport.authenticate('local', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
});

app.get('/logout',
	function(req, res){
		req.logout();
		res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
