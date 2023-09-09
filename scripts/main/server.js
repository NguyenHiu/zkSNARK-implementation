
const appPromise = require("./app.js").appPromise;
const http = require('http');

// ref: https://stackoverflow.com/questions/41364072/running-an-async-function-before-express-js-start
appPromise.then(function (app) {
    app.set('port', 3000);
    const server = http.createServer(app);
    server.listen(3000);
})