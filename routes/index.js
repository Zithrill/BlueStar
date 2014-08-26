//One of the overall goals of this file is to
// separate out all of the extra code into it's
// own js files so that our index is cleaner

var express = require('express');
var fs      = require('fs');
var csv     = require('csv');
var async   = require('async');
var router  = express.Router();
var vendor  = require('../public/javascripts/addVendor.js');
var purchaseOrder = require('../public/javascripts/addPurchaseOrder');
var batch   = require('../public/javascripts/batchAdd');
var poList  = require('../public/javascripts/sendPOs');
var addPO   = require('../public/javascripts/addPOs');
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome to Purchase Order Management' });
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
  addPO.getPOdata(req, res);
});
/* GET polist page. */
router.get('/polist', function(req, res) {
  poList.send(req, res);
});
/* POST batch add page. */
router.post("/batchadd", function (req, res) {
  batch.addRecords(req, res);
});
/* POST admin page. */
router.post('/admin', function(req, res) {
  admin.modify(req, res);
});
/* POST to Add User Service */
router.post('/addpo', function(req, res) {
  purchaseOrder.insertPO(req, res);
});
/* POST to Add vendor */
router.post('/addvendor', function(req, res) {
  vendor.addvendor(req, res);
});
module.exports = router;