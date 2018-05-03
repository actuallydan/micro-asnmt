const http = require("http");

const app = http.createServer();

app.listen(8080, (err, res) => {
    console.log("Listening on port 8080");
});
