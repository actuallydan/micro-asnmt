// const http = require("http");

// const app = http.createServer();

// app.listen(process.env.PORT || 8080, (err, res) => {
//  console.log(`Listening on port ${process.env.PORT || 8080}`);
//  res.write("Yeah! You're doin it!");
//  res.end();
// });
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send(`<h1>Yeah!</h1>
     <p>You're doin' it!</p>
     <br/>
     <img src="https://pixel.nymag.com/imgs/daily/vulture/2017/06/09/recaps/09-silicon-valley-season-4-episode-8.w710.h473.jpg"/>`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT || 8080}`);
});
