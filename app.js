var express      = require('express');
var path         = require('path');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var multer       = require('multer');
var bodyParser   = require('body-parser');
var routes       = require('./routes/index');
var users        = require('./routes/users');
var app          = express();
var fs           = require('fs');
var csv          = require('csv');
var pg           = require('pg');
var async        = require('async');
var database;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
module.exports = app;
// Make accessible to our router
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(multer({ dest: './uploads/'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
  req.database = database;
  next();
});
app.use('/', routes);
app.use('/users', users);
// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
//Connecting to the database
console.log("connecting...");
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  if (err) {
    console.log("ERROR: " + err.message);
    //throw err;
  }
  console.log("connected.");
  database = client;
  //tableHasData();
});
//Give some basic data about our tables
var tableHasData = function()
{
  database.query(
    'SELECT * FROM ucsc_po_tracking',
    function selectCb(err, results, fields) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("Got "+ results.rows.length + " Rows:");
    });
  database.query(
    'SELECT * FROM purchaser',
    function selectCb(err, results, fields) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("Got "+ results.rows.length + " Rows:");
    });
  database.query(
    'SELECT * FROM vendor',
    function selectCb(err, results, fields) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("Got "+ results.rows.length + " Rows:");
    });
};