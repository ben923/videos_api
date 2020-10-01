const express = require('express');
const bootstrap = require('./bootstrap');
const App = require('./app');
const config = require('./config.json');

try {
    var port = config.server.port;
} catch (error) {
    var port = 1337;
}

const server = express();

for(const service in bootstrap){
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

new App({
    server,
    config
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});