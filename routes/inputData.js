const express = require('express');
const router = express.Router();
const { pool } = require('../db');

function insertBore(points, footage, crew, job, pageId, boreType) {
  let tableName = "";
  if (boreType == "rock") {
    tableName = "rocks";
  } else if (boreType == "regular") {
    tableName = "bores";
  } else {
    console.log('problemo');
    return;
  }
  let query = `INSERT INTO ${tableName}(footage, crew_name, job_name, page_id, position) VALUES `;
  query += `(${footage}, '${crew}', '${job}', ${pageId}, '{`;
  for (const point of points) {
    query += `{${point.lat}, ${point.lng}},`;
  }
  query = query.slice(0, -1);
  query += `}');`;

  pool.query(query);
}


function insertVault(size, crew, job, pageId, position) {
  let query = `INSERT INTO vaults(vault_size, crew_name, job_name, page_id, position) VALUES `;
  let trans = {
    "DT20": 0,
    "DT30": 1,
    "DT36": 2,
  };

  query += `(${trans[size]}, '${crew}', '${job}', ${pageId}, '{${position.lat}, ${position.lng}}');`

  pool.query(query);
}

router.post('/', (req, res, next) => {
  let data = req.body;
  pool.query(`SELECT * FROM pages WHERE job_name='${data.jobName}' AND page_number=${data.pageNumber}`, (err, resp) => {
    let pageId = resp.rows[0].id;
    if (data.objType == "bore") {
      insertBore(data.points, data.footage, data.crew, data.jobName, pageId, data.boreType);
    } else if (data.objType == "vault") {
      insertVault(data.size, data.crew, data.jobName, pageId, data.position);
    }
    res.redirect('localhost:3000/viewJobs');
  });
});

module.exports = router;