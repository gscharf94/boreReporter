const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', (req, res, next) => {
  res.render('index', { test: 'hello world' });
});

module.exports = router;