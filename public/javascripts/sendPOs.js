exports.send = function(req, res) {
  var database = req.database;
  var poList_Array =[];
  var polist_query = database.query('SELECT * FROM ucsc_po_tracking')
  polist_query.on('row', function(result){
    poList_Array.push(result);
  });
  polist_query.on('end', function(results){
    res.render('polist',  {title: 'Purchase Orders', polist_rows: poList_Array})
  });
};