const mysql = require("mysql");

exports.sourceConnection = mysql.createConnection({
  // host: "localhost",
  // user: "root",
  // password: "1234",
  // database: "diveroid",
  host: "diveroid.cqp17xuxmhvo.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "diveroid123!",
  database: "diveroid",
});

exports.destinationConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "diveroid_dev",
  // host: "diveroid-staging.cqp17xuxmhvo.us-east-1.rds.amazonaws.com",
  // user: "admin",
  // password: "DiveroidStaging123!",
  // database: "diveroid_staging_v3",
});
