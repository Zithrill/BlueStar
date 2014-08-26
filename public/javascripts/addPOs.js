exports.getPOdata = function(res, req) {
// Set our internal DB variable
  var database = req.database;
  //Get the info for drop-down lists
  var purchaser_array = [];
  var vendor_array    = [];
  var pur_query       = database.query('SELECT * FROM purchaser');
  var ven_query       = database.query('SELECT * FROM vendor');
  //For each returned row from the database we want to do this action
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
};