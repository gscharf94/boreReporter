const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', (req, res, next) => {
  pool.query('SELECT * FROM pages', (err, resp) => {
    if (err) {
      console.log('error pulling pages');
    }

    let pages = resp.rows;
    let jobs = {};

    for (const page of pages) {
      if (!jobs[page.job_name]) {
        jobs[page.job_name] = [page.page_number]
      } else {
        jobs[page.job_name].push(page.page_number);
      }
    }

    let parsedJobs = [];
    for (const job in jobs) {
      let obj = {
        job_name: job,
        pages: jobs[job],
      };
      parsedJobs.push(obj);
    }

    res.render('viewJobs', { jobs: parsedJobs });
  });
});


module.exports = router;