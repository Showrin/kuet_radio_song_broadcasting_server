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
let playingSong = {
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

  // for (let i = 0; ; i++) {
  //   setTimeout(() => {
  //     playingSong.id = songlist[i].id;
  //     playingSong.played = 0;

  //     console.log(playingSong);

  //     if (i === songlist.length - 1) {
  //       i = -1;
  //       console.log("Reset i: ", i);
  //     }
  //   }, 1000);
  // }

  function songLoop(i = 0) {
    console.log(playingSong);
    setTimeout(() => {
      playingSong.id = songlist[i].id;
      playingSong.played = 0;

      if (i === songlist.length - 1) {
        i = 0;
      } else {
        i++;
      }

      songLoop(i);
    }, 1000);
  }

  songLoop();
}

getSongList();
