const express = require('express');
const bootstrap = require('./bootstrap');
const App = require('./app');
const init = require('./init');
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

console.log('initing modules');

init()
    .then(modules => {
        console.log('charging app');
        new App({
            modules,
            server
        });

        server.get('/', (req, res) => {
            res.status(200).json({
                api_status: "OK"
            }).end()
        })
    })
    .catch(err => {
        console.log(err);

    })

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});