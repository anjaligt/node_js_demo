'use strict';
var express       = require('express');
var flash         = require('express-flash');
var session       = require('cookie-session');
var path          = require('path');
// var favicon = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var reqstore      = require('reqstore');
var response      = require('./lib/response');
var routes        = require('./routes/index');
var users         = require('./routes/users');
var v1            = require('./routes/v1');

 var cron = require('./lib/cron');

var version = require('./package').version;

var http   = require( 'http' );
var app    = express();
var server = http.createServer(app);
app.set('port', process.env.PORT || 8086);

server.listen(app.get('port'), function () {
  console.log( "Express server listening on port " + app.get( 'port' ) );
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('version', version);

// app.use(favicon());
if (app.get('env') === 'development') {
    app.use(logger('dev'));
}
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    name: 'flash',
    secret: 'uJ3)6o/!693U;>s402sXqB3f:k]wZ='
}));
app.use(flash());
app.use(response);
app.use(reqstore());
//app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// app.use('/login', routes);
app.use('/users', users);

//all api routes.
app.use('/v1', v1);


app.use('/v1/*', function send(req, res) {
  res.json(res.response);
});


//app.use("assets/*", express.static(__dirname + "/../app/js"));
//app.use("/partials", express.static(__dirname + "/../app/partials"));

// app.all('/*',function(req, res){
//   res.sendfile('index.html',{root:path.join(__dirname,'public')});
// });

 cron();

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  /* jshint -W098 */
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
/* jshint -W098 */
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
