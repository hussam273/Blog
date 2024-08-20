const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host : "localhost",
  database : "blog",
  user : "root",
  password : "Soufan_244399"
});

module.exports = pool ;