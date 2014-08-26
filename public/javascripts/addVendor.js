exports.addVender = function (req, res) {

//Getting Date
  var date = new Date();
  // Set our internal DB variable
  var database = req.database;
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
};

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
submitQuery(req, res);
};

//Submitting to the database
var submitQuery = function(req, res){
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