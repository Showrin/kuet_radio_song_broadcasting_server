const https = require("https");
const axios = require("axios");
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || "5000";
const getSonglistOptions = {
  hostname: "www.kuetradio.org",
  path: "/api/get_songlist.php",
  method: "GET",
};

let songlist;
let playingSong = {};

app.use(express.static("public"));

app.use(function (req, res, next) {
  let allowedDomain = [
    "http://www.kuetradio.org",
    "https://www.kuetradio.org",
    "kuetradio.org",
    "www.kuetradio.org",
    "http://kuetradio.org",
    "https://kuetradio.org",
  ];
  let origin = req.headers.origin;

  console.log(origin);
  console.log(allowedDomain);

  if (allowedDomain.indexOf(origin) > -1) {
    console.log("Got Origin");
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/public/index.html"))
);

app.get("/playing", (req, res) => {
  let response = {
    songlist,
    playingSong,
  };
  res.send(response);
  console.log("Knocked at " + playingSong.played);
});

app.listen(port, () => console.log("Server has been started"));

async function getSongList() {
  songlist = await axios
    .get("http://www.kuetradio.org/api/get_songlist.php")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });

  console.log(songlist.length);

  let songIndex = 0;

  playingSong = { songIndex, ...songlist[songIndex], played: 0 };

  function songLoop(songIndex) {
    let fullSongInterval = setInterval(() => {
      if (songIndex === songlist.length - 1) {
        songIndex = 0;
      } else {
        songIndex++;
      }

      console.log(playingSong.id + " has ended......");

      playingSong = { songIndex, ...songlist[songIndex], played: 0 };

      console.log(playingSong.id + " has started......");

      clearInterval(fullSongInterval);
      clearInterval(secondsInterval);
      songLoop(songIndex);
    }, songlist[songIndex].duration * 1000);

    let secondsInterval = setInterval(() => {
      console.log(
        playingSong.id +
          " has been playing for " +
          playingSong.played / 1000 +
          " second"
      );
      playingSong.played += 1000;
    }, 1000);
  }

  songLoop(songIndex);
}

getSongList();
