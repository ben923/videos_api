const App = require('./app');
const init = require('./init');
const initExpress = require('./express');
const logger = require('./logger');


logger.info('initing modules');

init()
    .then(modules => {
        logger.info('charging app');
        initExpress()
        .then(server => {
            new App({
                modules,
                server,
                logger
            });
        })
        .catch(err => {
            logger.error(err);
        })
    })
    .catch(err => {
        logger.error(err);

    })