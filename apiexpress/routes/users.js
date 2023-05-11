var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/all', (req, res, next) => {
  res.send('respond with a resource');
});

router.get('/teste', (req, res, next) => {
  res.send('Meu novo método');
});

module.exports = router;
