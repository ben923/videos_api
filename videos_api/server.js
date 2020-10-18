const App = require('./app');
const init = require('./init');
const initExpress = require('./express');
const logger = require('./logger');
const config = require('config');

return Promise.all([
    init(),
    initExpress()
])
    .then(([modules, server]) => {
        console.log(modules)
        return new App({
            modules,
            server,
            logger,
            config
        })
    })
    .catch(err => console.log(err))