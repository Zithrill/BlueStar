var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
var csvFile = "/home/zithrill/Documents/node/sqlnode/database.csv"
var mysql = require('mysql');
var database = mysql.createConnection({
  host: 'localhost',
  user: 'nasa',
  password: 'nasa'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
module.exports = app;
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
  req.database = database;
  //    clientConnected(database);
  next();
});

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

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

//Connecting to the mysql database
console.log("connecting...");
database.connect(function(err, results) {
  if (err) {
    console.log("ERROR: " + err.message);
    throw err;
  }
  console.log("connected.");
  clientConnected(database);
});

//creating the database if it dosen't exist
clientConnected = function(database)
{
  database.query('CREATE DATABASE po_list', function(err, results) {
    if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
      console.log("ERROR: " + err.message);
      throw err;
    }
    console.log("Database ready");
    dbCreated(database);
  });
};

//Verifying that the database is accessable
dbCreated = function(database)
{
  database.query('USE po_list', function(err, results) {
    if (err) {
      console.log("ERROR: " + err.message);
      throw err;
    }
    useOk(database);
  });
};

//Checking that the table is accessable
//if not create it
useOk = function(database)
{
  database.query(
    'CREATE TABLE ucsc_po_tracking'+
    '(id INT(8) AUTO_INCREMENT, '+
    'submitted TINYTEXT, '+
    'fiscal_year INT(8), '+
    'ames_po_number TINYTEXT, '+
    'date_requested DATE, '+
    'date_required DATE, '+
    'date_recived DATE, '+
    'purchaser TINYTEXT, '+
    'requestor TINYTEXT, '+
    'vendor TINYTEXT, '+
    'discription TINYTEXT, '+
    'task_number TINYTEXT, '+
    'program TINYTEXT, '+
    'po_issued TINYTEXT, '+
    'po_date DATE, '+
    'po_number TINYTEXT, '+
    'cost INT(12), '+
    'actual_cost INT(12), '+
    'notes MEDIUMTEXT, '+
    'PRIMARY KEY (id));', function(err, results) {
      if (err && err.number != mysql.ERROR_TABLE_EXISTS_ERROR) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("prinary table ready");
    }
  );
  database.query(
    'CREATE TABLE purchaser'+
    '(id INT(8) AUTO_INCREMENT, '+
    'first_name TINYTEXT, '+
    'last_name TINYTEXT, '+
    'PRIMARY KEY (id));', function(err, results) {
      if (err && err.number != mysql.ERROR_TABLE_EXISTS_ERROR) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("purchaser table ready");
    }
  );
    database.query(
    'CREATE TABLE vendor'+
    '(id INT(8) AUTO_INCREMENT, '+
    'business_name TINYTEXT, '+
    'street_address TINYTEXT, '+
    'city TINYTEXT, '+
    'state TINYTEXT, '+
    'zipcode TINYTEXT, '+
    'phone TINYTEXT, '+
    'fax_number TINYTEXT, '+
    'contact_name TINYTEXT, '+
    'website TINYTEXT, '+
    'email TINYTEXT, '+
    'notes TINYTEXT, '+
    'PRIMARY KEY (id));', function(err, results) {
      if (err && err.number != mysql.ERROR_TABLE_EXISTS_ERROR) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("vendor table ready");
    }
  );
    tableHasData(database);
};

//This will upload a CSV file into the database
//Error handoling needs to be implimented
batchCommit = function(database)
{
  database.query(
    "LOAD DATA INFILE \'" + csvFile + "\' INTO TABLE ucsc_po_tracking FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';",
    function(err, results) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.dir(results);
      console.log("Inserted "+results.affectedRows+" row.");
      console.log("The unique id was " + results.insertId);
      tableHasData(database);
    }
  );
};

tableHasData = function(database)
{
  database.query(
    'SELECT * FROM ucsc_po_tracking',
    function selectCb(err, results, fields) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("Got "+results.length+" Rows:");
    });
  database.query(
    'SELECT * FROM purchaser',
    function selectCb(err, results, fields) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("Got "+results.length+" Rows:");
    });
  database.query(
    'SELECT * FROM vendor',
    function selectCb(err, results, fields) {
      if (err) {
        console.log("ERROR: " + err.message);
        throw err;
      }
      console.log("Got "+results.length+" Rows:");
    });
};
