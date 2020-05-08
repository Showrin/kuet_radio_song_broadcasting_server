const express = require("express");
const app = express();
const path = require("path");
const port = 5000;

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/public/index.html"))
);

app.listen(port, () => console.log("Server has been started"));
