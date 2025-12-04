require('dotenv').config();
const mysql = require('mysql2');

// Build DB connection string
const urlDB =
  `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}` +
  `@${process.env.MYSQLHOST}:${process.env.MYSQLPORT}` +
  `/${process.env.MYSQLDATABASE}`;

// Create MySQL connection
const connection = mysql.createConnection(urlDB);

// Connect
connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to Railway MySQL Database!');
  }
});

module.exports = connection;
