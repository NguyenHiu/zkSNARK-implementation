
const app = require("./app.js");
const http = require('http');

app.set('port', 3000);

const server = http.createServer(app);
server.listen(3000);