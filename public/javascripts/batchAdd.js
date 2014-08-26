  exports.addRecords = function (req, res) {
  //get the file name
  var database         = req.database;
  var filename         = req.files.fileToUpload.name;
  var extensionAllowed = [".csv"];
  var maxSizeOfFile    = 10240;
  var msg              = "";
  var i                = filename.lastIndexOf('.');
  var sqlQuery         = "";
  var sqlHeader        = "";
  var arrayCleanPo     = [];
  // get the temporary location of the file
  var tmp_path = req.files.fileToUpload.path;
  // set where the file should actually exists - in this case it is in the "images" directory
  var target_path    = __dirname +'./upload/' + req.files.fileToUpload.name;
  //need to add validation HERE to make sure that we have a CSV file uploaded
  if(true){
    csv()
    .from.path(tmp_path, { delimiter: ';', escape: '"' })
    .to.stream(fs.createWriteStream(__dirname + filename))
    /*
    //
    //Big problem here the records are being added as fast as the server can read
    //unfortunately this is causing the ames_po_generation to be faulty as we currently
    //query the database of the number of records and add one to that number
    //but with the batch add we are to fast and need to use a callback to fix this or
    //implement a call before the file is uploaded and store the values in a var
    //
    */
    .on('record', function(row,index){
      if(index == 0){
        sqlHeader = row.toString().replace(/(\")/g, "").replace(/(\s)/g,"_").replace(/(Purchase_Order)/g,"po").toLowerCase();
        console.log( "Header:" + sqlHeader);
      }
      //We skip entry if we already have an assigned id number indicating that the file has been submitted
      else if(row[0] == ""){
        setTimes(arrayCleanPo, row);
      }
    })
    .on('end', function(data){
      // Square each number in the array [1, 2, 3, 4]
      async.eachSeries(arrayCleanPo, getNumberOfPo, function (eachErr, eachResults) {
        // Square has been called on each of the numbers
        // so we're now done!
        if (eachErr) {
          res.send("There was a problem adding the information to the database.");
          console.log("ERROR: " + eachErr);
        };
        
      });
    })
        //sqlQuery = 'DO IF NOT EXISTS (SELECT * FROM ucsc_po_tracking WHERE ' +
        //            '\'vendor\'' +         ' = \"' + row[9] +'\" AND ' +
        //            '\'requestor\'' +      ' = \"' + row[6] +'\" AND ' +
        //            '\'purchaser\'' +      ' = \"' + row[5] +'\" AND ' +
        //            '\'date_purchased\'' + ' = \"' + row[6] +'\" AND ' +
        //            '\'date_required' +    ' = \"' + row[7] +'\" AND ' +
        //            '\'task_number\'' +    ' = \"' + row[11] +'\" AND ' +
        //            '\'discription\'' +    ' = \"' + row[10] +'\" AND ' +
        //            '\'cost\'' +           ' = \"' + row[16] +'\") ' +

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
};

var setTimes = function(arrayCleanPo, row){
          //Check and generate a fiscal year
        var date = new Date(row[4]);
        
        if (date.getMonth() < 9){
          row[0] = date.getFullYear();
        }
        else{
          row[0] = (date.getFullYear() + 1);
        };
        //Cleaning dates for database entry
        if (row[5] == '') {
          row[5] = '-infinity'
        };
        if (row[6] == '') {
          row[6] = '-infinity'
        };
        if (row[12] == '') {
          row[12] = '-infinity'
        };
        //adding the cleaned results to an array that we will check against the DB and eventually add
        arrayCleanPo.push(row);
}

var getNumberOfPo = function (num, doneCallback) {
        var sqlFiscalYearQuery = ('SELECT id FROM ucsc_po_tracking WHERE fiscal_year = \'' + num[0] +'\'');
        var number_of_entrys   = database.query(sqlFiscalYearQuery);
        number_of_entrys.on('end', function(queryData){
          num[1] =(num[0] + '-' + (queryData.rowCount + 1));
          sqlQuery = 'INSERT INTO ucsc_po_tracking ( submitted,' + sqlHeader + ') ' +
                     'VALUES ( \'now\',\'' + num.join("\',\'") + '\' )';
          database.query(sqlQuery.toString() ,function (err, doc){
            if (err) {
              // If it failed, return error
              console.log("ERROR: " + err);
              return doneCallback(err);
            }
            else{
              return doneCallback(null, sqlQuery);
            }
          });
        })
        number_of_entrys.on('error', function(queryError){
          return doneCallback(queryError);
        })
      };