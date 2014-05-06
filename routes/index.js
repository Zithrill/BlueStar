var express = require('express');
var fs      = require('fs');
var csv     = require('csv');
var router  = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome to Purchase Order Managment' });
});
/* GET batch add. */
router.get('/batchadd', function(req, res) {
  res.render('batchadd', { title: 'Batch Add' });
});
/* GET Add vendor. */
router.get('/addvendor', function(req, res) {
  res.render('addvendor', { title: 'Welcome to Vendor Input' });
});
/* GET admin page. */
router.get('/admin', function(req, res) {
  res.render('admin', { title: 'Welcome to The Admin Panel' });
});
/* GET addPO page. */
router.get('/addpo', function(req, res) {
  // Set our internal DB variable
  var database = req.database;
  //Get the info for dropdown lists
  var purchaser_array = [];
  var vendor_array    = [];
  var pur_query       = database.query('SELECT * FROM purchaser');
  var ven_query       = database.query('SELECT * FROM vendor');
  pur_query.on('row', function(pur_result) {
    purchaser_array.push(pur_result.last_name + ', ' + pur_result.first_name);
  });
  ven_query.on('row', function(ven_result){
    vendor_array.push(ven_result.business_name);
  });
  ven_query.on('end', function(results){
    vendor_array =vendor_array.sort();
    purchaser_array = purchaser_array.sort();
    res.render('addpo', { title: 'Add Purchase Order', purchaser_array: purchaser_array, vendor_array: vendor_array});
  });
});
/* GET polist page. */
router.get('/polist', function(req, res) {
  var database = req.database;
  var poList_Array =[];
  var polist_query = database.query('SELECT * FROM ucsc_po_tracking')
  polist_query.on('row', function(result){
    poList_Array.push(result);
  });
  polist_query.on('end', function(results){
    res.render('polist',  {title: 'Purchase Orders', polist_rows: poList_Array})
  });
});
/* POST batch add page. */
router.post("/batchadd", function (req, res) {
  //get the file name
  var database         = req.database;
  var filename         = req.files.fileToUpload.name;
  var extensionAllowed = [".csv"];
  var maxSizeOfFile    = 10240;
  var msg              = "";
  var i                = filename.lastIndexOf('.');
  var sqlQuery         = "";
  var sqlHeader        = "";
  // get the temporary location of the file
  var tmp_path = req.files.fileToUpload.path;
  // set where the file should actually exists - in this case it is in the "images" directory
  var target_path    = __dirname +'./upload/' + req.files.fileToUpload.name;
  if(true){
    csv()
    .from.path(tmp_path, { delimiter: ',', escape: '"' })
    .to.stream(fs.createWriteStream(__dirname + filename))
    .transform( function(row){
      row.unshift(row.pop());
      return row;
    })
    .on('record', function(row,index){
      if(index == 0){
        sqlHeader = JSON.stringify(row).replace(/(\[)/g,'').replace(/(\])/g,'').replace(/(\")/g, "\'").replace(/(\s)/g,"_").replace(/(Purchase_Order)/g,"po").toLowerCase();
        console.log( "Header:" + sqlHeader);
      }
      else{
        if(row.fiscal_year == ""){
          var sqlFiscalYearQuery = ('SELECT id FROM ucsc_po_tracking WHERE fiscal_year = ' + fiscal_year);
          var number_of_entrys = database.query(sqlFiscalYearQuery);
          number_of_entrys.on('end', function(results) {
            console.log("Run during the generation " + (results.rowCount + 1));
            row.fiscal_year =(getFiscalYear() + '-' + (results.rowCount + 1));
          });
        }
        sqlQuery = 'DO; BEGIN IF NOT EXISTS (SELECT * FROM ucsc_po_tracking WHERE ' +
                   '\'vendor\'' +         ' = \"' + row[9] +'\" AND ' +
                   '\'requestor\'' +      ' = \"' + row[6] +'\" AND ' +
                   '\'purchaser\'' +      ' = \"' + row[5] +'\" AND ' +
                   '\'date_purchased\'' + ' = \"' + row[6] +'\" AND ' +
                   '\'date_required' +    ' = \"' + row[7] +'\" AND ' +
                   '\'task_number\'' +    ' = \"' + row[11] +'\" AND ' +
                   '\'discription\'' +    ' = \"' + row[10] +'\" AND ' +
                   '\'cost\'' +           ' = \"' + row[16] +'\") ' +
                   '--THEN ' +
                   'INSERT INTO ucsc_po_tracking (' + sqlHeader + ') ' +
                   'VALUES (' + JSON.stringify(row).replace('[','').replace(']','') + ' )' +
                   'END';
        console.log(sqlQuery); 
        database.query(sqlQuery.toString() ,function (err, doc) {
          if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
          console.log("ERROR: " + err.message);
          }
        });
      }
    })
    .on('close', function(count){
      // when writing to a file, use the 'close' event
      // the 'end' event may fire before the file has been written
      console.log('Number of lines: '+count);
    })
    .on('error', function(error){
      console.log(error.message);
    });
    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    fs.unlink(tmp_path, function(err) {
      if (err){
        throw err;
      }
    });
    msg="File uploaded sucessfully"
  }
  else{
    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    fs.unlink(tmp_path, function(err) {
      if (err){
        throw err;
      }
    });
    msg="File upload failed.File extension not allowed and size must be less than "+maxSizeOfFile;
  }
});
function oc(a){
  var o = {};
  for(var i=0;i<a.length;i++) {
    o[a[i]]='';
  }
  return o;
}
/* POST admin page. */
router.post('/admin', function(req, res) {
  // If it worked, set the header so the address bar doesn't still say /adduser
  res.location("/");
  // And forward to success page
  res.redirect("/");
  res.send("Access Denied.");
});
/* POST to Add User Service */
router.post('/addpo', function(req, res) {
  //Getting Date
  var date = new Date();
  // Set our internal DB variable
  var database = req.database;
  //correcting for empty dates
  dateCorrection = function(){
    if (userdate_requested == '') {
      userdate_requested ='-infinity'
    };
    if (userdate_required == '') {
      userdate_required = '-infinity'
    };
    if (userdate_recived == '') {
      userdate_recived = '-infinity'
    };
    if (userpo_date == '') {
      userpo_date = '-infinity'
    };
  }
  //Finding the fiscal year
  getFiscalYear = function(){
    if (date.getMonth() < 9){
      return date.getFullYear();
    }
    return (date.getFullYear() + 1);
  };
  //Finding next avalible po number for this fiscal year
  generatePONumberAndSQLQuery = function(){
    var sqlFiscalYearQuery = ('SELECT id FROM ucsc_po_tracking WHERE fiscal_year = ' + fiscal_year);
    var number_of_entrys = database.query(sqlFiscalYearQuery);
    number_of_entrys.on('end', function(results) {
      console.log("Run during the generation " + (results.rowCount + 1));
      setQueryString(getFiscalYear() + '-' + (results.rowCount + 1))
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
      + 'VALUES ( \'now\', '
      +'\''+ fiscal_year +'\''+ ', '
      +'\''+ generated_po_number +'\''+ ', '
      +'\''+ userdate_requested +'\''+ ', '
      +'\''+ userdate_required +'\''+ ', '
      +'\''+ userdate_recived +'\''+ ', '
      +'\''+ userpurchaser +'\''+ ', '
      +'\''+ userrequestor +'\''+ ', '
      +'\''+ uservendor +'\''+ ', '
      +'\''+ userdiscription +'\''+ ', '
      +'\''+ usertask_number +'\''+ ', '
      +'\''+ userprogram +'\''+ ', '
      +'\''+ userpo_issued +'\''+ ', '
      +'\''+ userpo_date +'\''+ ', '
      +'\''+ userpo_number +'\''+ ', '
      +'\''+ usercost +'\''+ ', '
      +'\''+ usernotes+'\' )';
    console.log(sqlInsert);
    submitQuery();
    };
  //Submitting to the database
  var submitQuery = function(){
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
  var fiscal_year        = getFiscalYear();
  var time_submitted     = date.toLocaleString();
  var userdate_requested = req.body.userdate_requested;
  var userdate_required  = req.body.userdate_required;
  var userdate_recived   = req.body.userdate_recived;
  var userpurchaser      = req.body.purchaser;
  var userrequestor      = req.body.userrequestor;
  var uservendor         = req.body.uservendor;
  var userdiscription    = req.body.userdiscription;
  var usertask_number    = req.body.usertask_number;
  var userprogram        = req.body.userprogram;
  var userpo_issued      = req.body.userpo_issued;
  var userpo_date        = req.body.userpo_date;
  var userpo_number      = req.body.userpo_number;
  var usercost           = req.body.usercost;
  var useractual_cost    = req.body.useractual_cost;
  var usernotes          = req.body.usernotes;
  var sqlInsert;
  dateCorrection();
  generatePONumberAndSQLQuery();
});
/* POST to Add vendor */
router.post('/addvendor', function(req, res) {
  //Getting Date
  var date = new Date();
  // Set our internal DB variable
  var database = req.database;
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
      'VALUES ( \''+
      userbusiness_name +'\', \''+
      userstreet_address +'\', \''+
      usercity +'\', \''+
      userstate +'\', \''+
      userzipcode +'\', \''+
      userphone +'\', \''+
      userfax +'\', \''+
      usercontact_name +'\', \''+
      userwebsite +'\', \''+
      useremail +'\', \''+
      usernotes +'\' )';
  console.log(sqlInsert);
  submitQuery();
  };
  //Submitting to the database
  var submitQuery = function(){
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
  var userbusiness_name  = req.body.userbusiness_name;
  var userstreet_address = req.body.userstreet_address;
  var usercity           = req.body.usercity;
  var userstate          = req.body.userstate;
  var userzipcode        = req.body.userzipcode;
  var userphone          = req.body.userphone;
  var userfax            = req.body.userfax;
  var usercontact_name   = req.body.usercontact_name;
  var userwebsite        = req.body.userwebsite;
  var useremail          = req.body.useremail;
  var usernotes          = req.body.usernotes;
  var sqlInsert;
  setQueryString();
});
module.exports = router;