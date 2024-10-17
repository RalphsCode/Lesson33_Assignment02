/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
    DB_URI = "postgresql://postgres:2024@localhost:5432/biztime_test";
} else {
  DB_URI = "postgresql://postgres:2024@localhost:5432/biztime";
}

let db = new Client({
  connectionString: DB_URI
});

db.connect()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
    process.exit(1);
  });

module.exports = db;