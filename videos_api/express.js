const express = require('express');
const bootstrap = require('./bootstrap');
const config = require('config');
const logger = require('./logger');

const init = (port = null) => {
    return new Promise((resolve, reject) => {
        
        if (config.has('server.port') && !port) {
            port = config.get('server.port');
        } else {
            port = port || 1337;
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