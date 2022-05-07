const { Pool } = require('pg');

const pool = new Pool({
  user: 'gustavo',
  database: 'maps',
  password: 'program25056',
  port: 5432,
  host: 'localhost',
});

module.exports = { pool };