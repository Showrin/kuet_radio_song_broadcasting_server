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
const playingSong = {
  id: 0,
  played: 0,
};

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/public/index.html"))
);

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

  playingSong.id = songlist[songIndex].id;
  playingSong.played = 0;

  function songLoop(songIndex) {
    let fullSongInterval = setInterval(() => {
      if (songIndex === songlist.length - 1) {
        songIndex = 0;
      } else {
        songIndex++;
      }

      console.log(playingSong.id + " has ended......");

      playingSong.id = songlist[songIndex].id;
      playingSong.played = 0;

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
