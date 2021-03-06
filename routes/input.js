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
      `SELECT bores.id, bores.footage, bores.crew_name, bores.job_name, bores.page_id, bores.position, bores.work_date, pages.page_number FROM bores
      INNER JOIN pages ON bores.job_name=pages.job_name AND bores.page_id=pages.id
      WHERE pages.page_number=${pageId}
      AND bores.job_name='${jobName}';`
      , (err, resp2) => {

        let bores = resp2.rows;
        for (const bore of bores) {
          bore.rock = false;
          bore.hidden = false;
        }
        pool.query(
          `SELECT vaults.id, vaults.crew_name, vaults.vault_size, vaults.job_name, vaults.page_id, vaults.position, vaults.work_date, pages.page_number FROM vaults
          INNER JOIN pages on vaults.job_name=pages.job_name AND vaults.page_id=pages.id
          WHERE pages.page_number=${pageId}
          AND vaults.job_name='${jobName}';`
          , (err, resp3) => {
            let vaults = resp3.rows;
            for (const vault of vaults) {
              vault.hidden = false;
            }
            pool.query(
              `SELECT rocks.id, rocks.footage, rocks.crew_name, rocks.job_name, rocks.page_id, rocks.position, rocks.work_date, pages.page_number FROM rocks
              INNER JOIN pages ON rocks.job_name=pages.job_name AND rocks.page_id=pages.id
              WHERE pages.page_number=${pageId}
              AND rocks.job_name='${jobName}';`
              , (err, resp4) => {
                let rocks = resp4.rows;
                for (const rock of rocks) {
                  rock.rock = true;
                  rock.hidden = false;
                }
                console.log(bores);
                res.render('input',
                  {
                    jobs: jobs,
                    jobName: jobName,
                    pageId: pageId,
                    bores: JSON.stringify(bores),
                    vaults: JSON.stringify(vaults),
                    rocks: JSON.stringify(rocks),
                  });
              });
          });
      });
  })
});


module.exports = router;