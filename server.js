const express = require('express');
const bootstrap = require('./bootstrap');
const App = require('./app');
const config = require('config');

let port = 1337;

if (config.has('server.port')) {
    port = config.get('server.port');
}

const server = express();

for (const service in bootstrap) {
    const serviceExecutor = bootstrap[service];

    server.use(serviceExecutor);

    console.log(`loaded bootstrap script ${service}`);
}

server.get('/', (req, res) => {
    res.status(200).json({
        api_status: "OK"
    }).end()
})

console.log('charging app');

new App({ server });

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});