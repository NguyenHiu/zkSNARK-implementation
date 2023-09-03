
const appPromise = require("./app.js").appPromise;
const http = require('http');

appPromise.then(function (app) {
    app.set('port', 3000);
    const server = http.createServer(app);
    server.listen(3000);
})