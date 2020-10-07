const App = require('./app');
const init = require('./init');
const initExpress = require('./express');


console.log('initing modules');

init()
    .then(modules => {
        console.log('charging app');
        initExpress()
        .then(server => {
            new App({
                modules,
                server
            });
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);

    })