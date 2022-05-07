const express = require('express');
const router = express.Router();
const { pool } = require('../db');


router.get('/:jobName/:pageId', (req, res, next) => {
  const jobName = req.params.jobName;
  const pageId = req.params.pageId;
  pool.query('SELECT * FROM jobs', (err, resp) => {
    if (err) {
      console.log('error pulling jobs');
    }
    let jobs = resp.rows;

    pool.query(
      `SELECT * FROM bores
      INNER JOIN pages ON bores.job_name=pages.job_name
      WHERE pages.page_number=${pageId}
      AND bores.job_name='${jobName}';`
      , (err, resp2) => {

        let bores = resp2.rows;
        console.log(bores);

        res.render('input', { jobs: jobs, jobName: jobName, pageId: pageId, bores: JSON.stringify(bores) });
      });
  })
});


module.exports = router;