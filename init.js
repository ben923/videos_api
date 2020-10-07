const initRedis = require('./app/cache/redisCacheService');
const initDB = require('./app/database/database');
const initEs = require('./app/database/elasticsearch');

const init = () => {
    return new Promise((resolve, reject) => {
        initRedis()
            .then(redisClient => {
                initDB()
                    .then(models => {
                        initEs()
                            .then(esClient => {
                                resolve({
                                    redisClient,
                                    models,
                                    esClient
                                });
                            })
                            .catch(err => {
                                reject(err);
                            })
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            })
    })
}

module.exports = init;