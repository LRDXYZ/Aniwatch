// db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',          
  password: '1tdhblkfcdhx2a', 
  database: 'aniwatch',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;