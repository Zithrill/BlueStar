var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome to Purchase Order Managment' });
});
/* GET home page. */
router.get('/addvendor', function(req, res) {
  res.render('addvendor', { title: 'Welcome to vendors' });
});
/* GET admin page. */
router.get('/admin', function(req, res) {
  res.render('admin', { title: 'Welcome to The Admin Panel' });
});

/* POST admin page. */
router.post('/admin', function(req, res) {
        // If it worked, set the header so the address bar doesn't still say /adduser
      res.location("/");
      // And forward to success page
      res.redirect("/");
      res.send("Access Denied.");
});

/* GET add PO page page. */
router.get('/addpo', function(req, res) {
  
  // Set our internal DB variable
  var database = req.database;
  
  //Get the info for dropdown lists
  database.query(
    'SELECT * FROM purchaser',
    function selectCb(err, purchaser_rows, purchaser_fields) {
      if (err) {
	console.log("ERROR: " + err.message );
	throw err;
      }
      database.query(
	'SELECT * FROM vendor',
	function selectCb(err, vendor_rows, vendor_fields) {
	  if (err) {
	    console.log("ERROR: " + err.message);
	    throw err;
	  }
	  res.render('addpo', { title: 'Add Purchase Order', addpo_purchaser_rows: purchaser_rows, addpo_purchaser_fields: purchaser_fields, addpo_vendor_rows: vendor_rows, addpo_vendor_fields: vendor_fields })
	});
    });
  
});

// /* GET Batch Add PO page. */
// router.get('/batchadd', function(req, res) {
//   function fileSelected() {
//   var file = req.getElementById('fileToUpload').files[0];
//   if (file) {
//     var fileSize = 0;
//     if (file.size > 1024 * 1024)
//       fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
//     else
//       fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
//           
//     req.getElementById('fileName').innerHTML = 'Name: ' + file.name;
//     req.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
//     req.getElementById('fileType').innerHTML = 'Type: ' + file.type;
//   }
// }
//   res.render('batchadd', { title: 'Batch Add Purchase Orders', fileSelected():fileSelected(), })
// });
// 
// /* POST to batchadd Page*/
// router.get('/batchadd', function(req, res){
//   function uploadFile() {
//   var xhr = new XMLHttpRequest();
//   var fd = req.getElementById('form1').getFormData();
// 
//   /* event listners */
//   xhr.upload.addEventListener("progress", uploadProgress, false);
//   xhr.addEventListener("load", uploadComplete, false);
//   xhr.addEventListener("error", uploadFailed, false);
//   xhr.addEventListener("abort", uploadCanceled, false);
//   /* Be sure to change the url below to the url of your upload server side script */
//   xhr.open("POST", "UploadMinimal.aspx");
//   xhr.send(fd);
// }
// });

/* GET polist page. */
router.get('/polist', function(req, res) {
  var database = req.database;
  
  database.query('SELECT * FROM ucsc_po_tracking',
		 function selectCb(err, rows, fields) {
		   if (err) {
		     console.log("ERROR: " + err.message);
		     throw err;
		   }
		   res.render('polist',  {title: 'Purchase Orders',polist_rows: rows, polist_fields: fields})
		 });
});

/* POST to Add User Service */
router.post('/addpo', function(req, res) {
  //Getting Date
  var date = new Date();
  
  // Set our internal DB variable
  var database = req.database;
  
  // Set our collection
  database.query('USE po_list'); 
  
  //FInding the fiscal year
  getFiscalYear = function(){
    if (date.getMonth() < 9){
      return date.getFullYear(); 
    }
    return (date.getFullYear() + 1);
  };
  //Finding next avalible po number for this fiscal year
  generatePONumberAndSQLQuery = function(){
    var sqlFiscalYearQuery = ('SELECT id FROM ucsc_po_tracking WHERE fiscal_year = ' + fiscal_year);
    console.log(sqlFiscalYearQuery);
    database.query(sqlFiscalYearQuery, function selectCb(err, rows, fields) {
      if (err) {
	console.log("PO # Generation ERROR: " + err.message);
	res.send("There was a problem .");
      }
      console.log("Run during the generation " + (rows.length + 1));
      setQueryString(getFiscalYear() + "-" + (rows.length + 1))
    });
  };
   // Creating a sql query string
  setQueryString= function(generated_po_number){
    sqlInsert = 'INSERT INTO ucsc_po_tracking ('
    + ' submitted,' 
    + ' fiscal_year,' 
    + ' ames_po_number,' 
    + ' date_requested,' 
    + ' date_required,' 
    + ' date_recived,' 
    + ' purchaser,' 
    + ' requestor,' 
    + ' vendor,' 
    + ' discription,' 
    + ' task_number,' 
    + ' program,' 
    + ' po_issued,' 
    + ' po_date,' 
    + ' po_number,' 
    + ' cost,' 
    + ' notes ) ' 
    + 'VALUES ( CURRENT_TIMESTAMP, '
    +'"'+ fiscal_year +'"'+ ', ' 
    +'"'+ generated_po_number +'"'+ ', ' 
    +'"'+ userdate_requested +'"'+ ', ' 
    +'"'+ userdate_required +'"'+ ', ' 
    +'"'+ userdate_recived +'"'+ ', ' 
    +'"'+ userpurchaser +'"'+ ', ' 
    +'"'+ userrequestor +'"'+ ', ' 
    +'"'+ uservendor +'"'+ ', ' 
    +'"'+ userdiscription +'"'+ ', ' 
    +'"'+ usertask_number +'"'+ ', ' 
    +'"'+ userprogram +'"'+ ', ' 
    +'"'+ userpo_issued +'"'+ ', ' 
    +'"'+ userpo_date +'"'+ ', ' 
    +'"'+ userpo_number +'"'+ ', ' 
    +'"'+ usercost +'"'+ ', ' 
    +'"'+ usernotes+'"' + ' )';
    console.log(sqlInsert);
    submitQuery();
    };
    //Submitting to the database
  submitQuery = function(){
  database.query(sqlInsert.toString() ,function (err, doc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem adding the information to the database.");
      console.log("ERROR: " + err.message);
    }
    else {
      // If it worked, set the header so the address bar doesn't still say /adduser
      res.location("polist");
      // And forward to success page
      res.redirect("polist");
    }
  });
  };
  
  // Get our form values. These rely on the "name" attributes
  var fiscal_year = getFiscalYear();
  var time_submitted = date.toLocaleString();
  var userdate_requested = req.body.userdate_requested;
  var userdate_required = req.body.userdate_required;
  var userdate_recived = req.body.userdate_recived;
  var userpurchaser = req.body.purchaser;
  var userrequestor = req.body.userrequestor;
  var uservendor = req.body.uservendor;
  var userdiscription = req.body.userdiscription;
  var usertask_number = req.body.usertask_number;
  var userprogram = req.body.userprogram;
  var userpo_issued = req.body.userpo_issued;
  var userpo_date = req.body.userpo_date;
  var userpo_number = req.body.userpo_number;
  var usercost = req.body.usercost;
  var useractual_cost = req.body.useractual_cost;
  var usernotes = req.body.usernotes;
  var sqlInsert;
  generatePONumberAndSQLQuery();

});

/* POST to Add vendor */
router.post('/addvendor', function(req, res) {
  //Getting Date
  var date = new Date();

  // Set our internal DB variable
  var database = req.database;

  // Set our collection
  database.query('USE po_list'); 

   // Creating a sql query string
  setQueryString= function(){
    sqlInsert = 'INSERT INTO vendor (' +
    'business_name, '+
    'street_address, '+
    'city, '+
    'state, '+
    'zipcode, '+
    'phone, '+
    'fax_number, '+
    'contact_name, '+
    'website, '+
    'email, '+
    'notes) '+ 
    'VALUES ( '
    +'"'+ userbusiness_name +'"'+ ', ' 
    +'"'+ userstreet_address +'"'+ ', ' 
    +'"'+ usercity +'"'+ ', ' 
    +'"'+ userstate +'"'+ ', ' 
    +'"'+ userzipcode +'"'+ ', ' 
    +'"'+ userphone +'"'+ ', '
    +'"'+ userfax +'"'+ ', '
    +'"'+ usercontact_name +'"'+ ', '
    +'"'+ userwebsite +'"'+ ', '
    +'"'+ useremail +'"'+ ', '
    +'"'+ usernotes +'"' + ' )';
    console.log(sqlInsert);
    submitQuery();
    };
    //Submitting to the database
  submitQuery = function(){
  database.query(sqlInsert.toString() ,function (err, doc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem adding the information to the database.");
      console.log("ERROR: " + err.message);
    }
    else {
      // If it worked, set the header so the address bar doesn't still say /adduser
      res.location("Add Purchase Request");
      // And forward to success page
      res.redirect("addpo");
    }
  });
  };

  // Get our form values. These rely on the "name" attributes
    var userbusiness_name = req.body.userbusiness_name;
    var userstreet_address = req.body.userstreet_address;
    var usercity = req.body.usercity;
    var userstate = req.body.userstate;
    var userzipcode = req.body.userzipcode;
    var userphone = req.body.userphone;
    var userfax = req.body.userfax;
    var usercontact_name = req.body.usercontact_name;
    var userwebsite = req.body.userwebsite;
    var useremail = req.body.useremail;
    var usernotes  = req.body.usernotes;
    var sqlInsert;
  setQueryString();

});
  module.exports = router;
  