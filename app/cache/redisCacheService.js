const redis = require('redis');
const config = require('config');

const init = () => {

    return new Promise((resolve, reject) => {
        if(config.has('app.redis.port') && config.has('app.redis.host')){
            const host = config.get('app.redis.host'), port = config.get('app.redis.port');
            const client = redis.createClient({
                host: host,
                port: port
            });

            client.on('error', (error) => {
                reject(error);
            })

            client.on('ready', () => {
                resolve(client)
            })

        } else {
            reject(Error('Redis - no valid configuration found'));
        }
    })
}

module.exports = init