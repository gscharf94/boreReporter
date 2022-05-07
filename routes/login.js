const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', (req, res, next) => {
  pool.query('SELECT * FROM crews;', (err, resp) => {
    let crews = resp.rows;
    let crewsJSON = JSON.stringify(crews);

    res.render('login', { crews: crews, crewsJSON: crewsJSON });
  });
});

module.exports = router;