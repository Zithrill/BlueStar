exports.insertPO = function (req, res){
//Getting Date
  var date = new Date();
  // Set our internal DB variable
  var database = req.database;
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
  generatePONumberAndSQLQuery(res);
};

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
  generatePONumberAndSQLQuery = function(res){
    var sqlFiscalYearQuery = ('SELECT id FROM ucsc_po_tracking WHERE fiscal_year = ' + fiscal_year);
    var number_of_entrys = database.query(sqlFiscalYearQuery);
    number_of_entrys.on('end', function(results) {
      console.log("Run during the generation " + (results.rowCount + 1));
      setQueryString(getFiscalYear() + '-' + (results.rowCount + 1), res)
    });
  };

  // Creating a sql query string
  setQueryString = function (generated_po_number, res) {
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
    submitQuery(res);
    };

  //Submitting to the database
  var submitQuery = function(res){
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