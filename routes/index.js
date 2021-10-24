var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
res.end('hello world we finished task 3') 
});

module.exports = router;
