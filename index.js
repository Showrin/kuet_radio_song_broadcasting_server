const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql");
const port = process.env.PORT || "5000";
const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "kuetradi_admin",
  password: "]r1TvU(tXHd6",
  database: "kuetradi_kuet_radio_database",
  port: 3306,
});

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/public/index.html"))
);

app.listen(port, () => console.log("Server has been started"));

dbConnection.connect(function (err) {
  console.log("requesting!");
  if (err) throw err;
  else {
    console.log("Connected!");
    let sql = "SELECT * FROM users WHERE id = 20";
    dbConnection.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
    });
  }
});
