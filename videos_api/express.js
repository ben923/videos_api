const express = require('express');
const bootstrap = require('./bootstrap');
const config = require('config');
const logger = require('./logger');

const init = () => {
    return new Promise((resolve, reject) => {
        let port = 1337;
        
        if (config.has('server.port')) {
            port = config.get('server.port');
        }
        
        const server = express();
        
        for (const service in bootstrap) {
            const serviceExecutor = bootstrap[service];
        
            server.use(serviceExecutor);
        
            logger.info(`loaded bootstrap script ${service}`);
        }
    
        server.listen(port, (err) => {
            if(err){
                reject(err)
            }
            logger.info(`listening on port ${port}`);
            resolve(server);
        });
    });
}

module.exports = init;