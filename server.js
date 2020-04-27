const express = require("express");

var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

const PORT = 3000;

app.use("/", express.static(`${__dirname}/node_modules`));
app.use("/", express.static(`${__dirname}/src`));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.vue.html");
});

require("./socket.js")(io);

http.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
