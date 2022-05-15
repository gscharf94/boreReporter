const express = require('express');
const router = express.Router();
const { pool } = require('../db');

function formatDate(dateStr) {
  dateStr = dateStr.slice(0, 10)
  let date = new Date(`${dateStr}T00:00:00`);
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let year = date.getFullYear();

  let formattedStr = `${year}-${month}-${day}`;
  return `${year}-${month}-${day}`;
}

function insertBore(points, footage, crew, job, pageId, boreType, workDate) {
  let tableName = "";
  if (boreType == "rock") {
    tableName = "rocks";
  } else if (boreType == "regular") {
    tableName = "bores";
  } else {
    console.log('problemo');
    return;
  }
  let query = `INSERT INTO ${tableName}(footage, crew_name, job_name, page_id, work_date, position) VALUES `;
  query += `(${footage}, '${crew}', '${job}', ${pageId}, '${formatDate(workDate)}', '{`;
  for (const point of points) {
    query += `{${point[0]}, ${point[1]}},`;
  }
  query = query.slice(0, -1);
  query += `}');`;

  pool.query(query);
}


function insertVault(size, crew, job, pageId, position, workDate) {
  let query = `INSERT INTO vaults(vault_size, crew_name, job_name, page_id, work_date, position) VALUES `;
  let trans = {
    "DT20": 0,
    "DT30": 1,
    "DT36": 2,
  };

  query += `(${trans[size]}, '${crew}', '${job}', ${pageId}, '${formatDate(workDate)}', '{${position.lat}, ${position.lng}}');`

  pool.query(query);
}

router.post('/', (req, res, next) => {
  console.log(`input request`);
  let data = req.body;
  console.log('---------------------');
  console.log(data);
  pool.query(`SELECT * FROM pages WHERE job_name='${data.jobName}' AND page_number=${data.pageNumber}`, (err, resp) => {
    let pageId = resp.rows[0].id;
    if (data.objType == "bore") {
      insertBore(data.points, data.footage, data.crew, data.jobName, pageId, data.boreType, data.workDate);
    } else if (data.objType == "vault") {
      insertVault(data.size, data.crew, data.jobName, pageId, data.position, data.workDate);
    }
    res.redirect('localhost:3000/viewJobs');
  });
});

module.exports = router;