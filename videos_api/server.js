const App = require('./app');
const init = require('./init');
const initExpress = require('./express');
const logger = require('./logger');
const config = require('config');

/**
 * Sur la doc mdn ils ne disent pas d'appeler la function avec les parenthèse mais bizarrement si je ne le fais pas ça me retourne les promises
 */
return Promise.all([
    init(),
    initExpress()
])
    .then(([modules, server]) => {
        console.log(modules, server)
        return new App({
            modules,
            server,
            logger,
            config
        })
    })
    .catch(err => console.log(err))