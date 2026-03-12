const mysql = require('mysql2/promise');
const env = require('../config/env');

const pool = mysql.createPool(env.mysql);

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  pool,
  query
};
