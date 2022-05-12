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

function deleteBoreId(id, rock) {
  console.log('this happens');
  let query = `DELETE FROM ${(rock) ? "rocks" : "bores"} WHERE id=${id}`;
  pool.query(query, (err, resp) => {
    if (err) {
      console.log(`error deleting ${(rock) ? "rock" : "bore"} id: ${id}`);
    }
    console.log(`deleted ${(rock) ? "rock" : "bore"} id: ${id}`);
  });
}

function deleteBoreNoId(data) {
  // let query = `SELECT * FROM pages WHERE job_name='${data.jobName}' AND page_number=${data.pageNumber};`;
  // let resp = pool.query(query, (err, resp) => {
  //   if (err) {
  //     console.log(`problem searching page for bore: ${data.jobName} - SH${data.pageNumber}`);
  //   }

  //   let pageId = resp.rows[0].id;
  //   query = `
  //     SELECT * FROM 
  //   `
  // })
  console.log(`DELETEBORENOID NOT WRITTEN. THIS NEEDS TO BE DONE BUT I HAVE TO CREATE FORMATTING CODE FOR POSITION COLUMN`);
}

router.post('/', (req, res, next) => {
  let data = req.body;
  console.log(`delete request`);
  console.log(data);
  if (data.type == "vault") {
    (data.id == -1) ? deleteVaultNoId(data) : deleteVaultId(data.id);
  } else if (data.type == "bore") {
    (data.id == -1) ? deleteBoreNoId(data) : deleteBoreId(data.id, data.rock);
  }
});

module.exports = router;