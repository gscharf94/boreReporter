const express = require('express');
const router = express.Router();
const { pool } = require('../db');

function formatDate(dateStr) {
  let date = new Date(dateStr);
  let weekday = date.getDay();
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let year = date.getFullYear();

  let dayTrans = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return `${dayTrans[weekday]} ${month}/${day}/${year}`;
}

function isAdmin(crewName, res) {
  pool.query(`SELECT bores.id, bores.footage, bores.job_name, bores.crew_name, bores.page_id, bores.work_date, pages.page_number FROM bores INNER JOIN pages on bores.page_id=pages.id`, (err, resp) => {
    if (err) {
      console.log(`error pulling bores for viewProduction crew: ${crewName}`);
    }

    let bores = resp.rows;
    for (const bore of bores) {
      bore.work_date_formatted = formatDate(bore.work_date);
    }

    pool.query(`SELECT vaults.id, vaults.vault_size, vaults.crew_name, vaults.job_name, vaults.work_date, vaults.page_id, pages.page_number FROM vaults INNER JOIN pages ON vaults.page_id=pages.id`, (err, resp2) => {
      if (err) {
        console.log(`error pulling vaults for viewProduction crew: ${crewName}`);
      }
      let vaults = resp2.rows;
      let vaultTrans = {
        0: "DT20",
        1: "DT30",
        2: "DT36",
      };

      for (const vault of vaults) {
        vault.work_date_formatted = formatDate(vault.work_date);
        vault.vault_size_formatted = vaultTrans[vault.vault_size];
      }

      pool.query(`SELECT rocks.id, rocks.footage, rocks.job_name, rocks.crew_name, rocks.page_id, rocks.work_date, pages.page_number FROM rocks INNER JOIN pages on rocks.page_id=pages.id`, (err, resp3) => {
        if (err) {
          console.log(`error pulling rocks for viewProduction crew: ${crewName}`);
        }

        let rocks = resp3.rows;
        for (const rock of rocks) {
          rock.work_date_formatted = formatDate(rock.work_date);
        }

        res.render('viewProduction', {
          crewName: 'ADMIN',
          bores: bores,
          vaults: vaults,
          rocks: rocks,
        });
      });
    });
  });
}

function notAdmin(crewName, res) {
  pool.query(`SELECT bores.id, bores.footage, bores.job_name, bores.crew_name, bores.page_id, bores.work_date, pages.page_number FROM bores INNER JOIN pages on bores.page_id=pages.id WHERE crew_name='${crewName}'`, (err, resp) => {
    if (err) {
      console.log(`error pulling bores for viewProduction crew: ${crewName}`);
    }
    let bores = resp.rows;
    for (const bore of bores) {
      bore.work_date_formatted = formatDate(bore.work_date);
    }

    pool.query(`SELECT vaults.id, vaults.vault_size, vaults.crew_name, vaults.job_name, vaults.work_date, vaults.page_id, pages.page_number FROM vaults INNER JOIN pages ON vaults.page_id=pages.id WHERE crew_name='${crewName}'`, (err, resp2) => {
      if (err) {
        console.log(`error pulling vaults for viewProduction crew: ${crewName}`);
      }

      let vaults = resp2.rows;
      let vaultTrans = {
        0: "DT20",
        1: "DT30",
        2: "DT36",
      };

      for (const vault of vaults) {
        vault.work_date_formatted = formatDate(vault.work_date);
        vault.vault_size_formatted = vaultTrans[vault.vault_size];
      }
      pool.query(`SELECT rocks.id, rocks.footage, rocks.job_name, rocks.crew_name, rocks.page_id, rocks.work_date, pages.page_number FROM rocks INNER JOIN pages on rocks.page_id=pages.id WHERE crew_name='${crewName}'`, (err, resp3) => {
        if (err) {
          console.log(`error pulling rocks for viewProduction`);
        }
        let rocks = resp3.rows;
        for (const rock of rocks) {
          rock.work_date_formatted = formatDate(rock.work_date);
        }

        res.render('viewProduction', {
          crewName: crewName,
          bores: bores,
          vaults: vaults,
          rocks: rocks,
        });
      });
    });
  });
}

router.get('/:crewName', (req, res, next) => {
  const crewName = req.params.crewName;
  pool.query(`SELECT * FROM crews WHERE crew_name='${crewName}'`, (err, resp) => {
    if (err) {
      console.log(`error pulling crews for viewProduction`);
    }

    let crew = resp.rows[0];
    if (crew.admin == true) {
      isAdmin(crewName, res);
    } else {
      notAdmin(crewName, res);
    }
  });
});

module.exports = router;