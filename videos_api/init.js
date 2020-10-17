const initRedis = require('./app/cache/redisCacheService');
const initDB = require('./app/database/database');
const initEs = require('./app/database/elasticsearch');

const init = () => {

    return Promise.all([
        initRedis(),
        initDB(),
        initEs()
    ])
    .then(([redisClient, models, esClient]) => ({redisClient, models, esClient}))
    .catch(err => err)
}

module.exports = init;