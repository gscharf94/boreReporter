const express = require('express');
const router = express.Router();
const { pool } = require('../db');

function formatDate(dateStr) {
  let date = new Date(dateStr);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function deleteVaultId(id) {
  let query = `DELETE FROM vaults WHERE id=${id};`;
  pool.query(query, (err, resp) => {
    if (err) {
      console.log(`error deleting vault id: ${id}`);
    }

    console.log(`deleted vault id: ${id}`);
  });
}

function deleteVaultNoId(data) {
  let query = `SELECT * FROM pages WHERE job_name='${data.jobName}' AND page_number=${data.pageNumber};`;
  console.log('query1');
  console.log(query);
  let resp = pool.query(query, (err, resp) => {
    if (err) {
      console.log(`problem searching page for vault: ${data.jobName} - SH${data.pageNumber}`);
    }

    let pageId = resp.rows[0].id;
    query = `
      SELECT * FROM vaults
      WHERE page_id=${pageId}
      AND job_name='${data.jobName}'
      AND crew_name='${data.crewName}'
      AND work_date='${formatDate(data.workDate)}'
      AND vault_size=${data.vaultSize}
      AND position='{${data.position[0]},${data.position[1]}}';
    `

    console.log('query2');
    console.log(query);
    let resp2 = pool.query(query, (err, resp2) => {
      if (err) {
        console.log(`problem searching vault for page`);
      }

      if (resp2.rows.length !== 1) {
        console.log(`number of results for vault != 1.. weird. printing results and returning early`);
        console.log(resp2.rows);
        return;
      }

      deleteVaultId(resp2.rows[0].id);
    });
  });
}

router.post('/', (req, res, next) => {
  let data = req.body;
  console.log(`delete command`);
  console.log(data);

  if (data.type == "vault") {
    (data.id == -1) ? deleteVaultNoId(data) : deleteVaultId(data.id);
  }
});

module.exports = router;