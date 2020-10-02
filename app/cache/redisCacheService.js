const redis = require('redis');
const config = require('../../config.json').app.redis;

const client = redis.createClient({
    host: config.host,
    port: config.port
})

client.on('error', (error) => {
    throw(error);
})

try{
    client.PING()
} catch(err){
    throw(Error("can't connect to redis verify server or config"))
}

module.exports = client