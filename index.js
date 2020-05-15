const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const fs = require("fs");
const port = process.env.PORT || "5000";

let songlist;
let playingSong = {};
let newSongAdded = 0;
let songIndex = 0;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.post("/upload", function (req, res) {
  let newSong = JSON.parse(req.body.newSong)[0];
  songlist.push(newSong);
  newSongAdded++;

  let lastPlayedSongIndex = newSongAdded + songIndex;
  axios
    .post("http://www.kuetradio.org/api/sendLastPlayedSongIndex.php", null, {
      params: {
        lastPlayedSongIndex,
      },
    })
    .then((response) => {
      console.log("Song Index Changed ---------->");
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });

  res.send("true");
  console.log("Total new songs: " + newSongAdded);
  console.log(newSong);
  console.log(songlist);
  console.log("post at " + playingSong.played);
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

  function songLoop(songIndex) {
    let fullSongInterval = setInterval(() => {
      if (songIndex === songlist.length - 1) {
        songIndex = 0;
      } else {
        songIndex++;
      }

      let lastPlayedSongIndex = newSongAdded + songIndex;
      axios
        .post(
          "http://www.kuetradio.org/api/sendLastPlayedSongIndex.php",
          null,
          {
            params: {
              lastPlayedSongIndex,
            },
          }
        )
        .then((response) => {
          console.log("Song Index Changed ---------->");
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

      console.log(playingSong.name + " has ended......");

      playingSong = { songIndex, ...songlist[songIndex], played: 0 };

      console.log(playingSong.name + " has started......");

      clearInterval(fullSongInterval);
      clearInterval(secondsInterval);
      songLoop(songIndex);
    }, songlist[songIndex].duration * 1000);

    let secondsInterval = setInterval(() => {
      console.log(
        playingSong.name +
          " has been playing for " +
          playingSong.played / 1000 +
          " second"
      );
      playingSong.played += 1000;
    }, 1000);
  }

  songIndex = await axios
    .get("http://www.kuetradio.org/api/sendLastPlayedSongIndex.php")
    .then((response) => {
      return parseInt(response.data[0].song_index, 10);
    })
    .catch((error) => {
      console.log(error);
    });
  playingSong = { songIndex, ...songlist[songIndex], played: 0 };

  songLoop(songIndex);
  console.log("Last played Index " + songIndex);
}

getSongList();
