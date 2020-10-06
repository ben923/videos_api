const {Client} = require('@elastic/elasticsearch');
const init = require('./database');
const config = require('config');

try{
    var client = new Client({node: `http://${config.host}`});
} catch(err){
    throw(Error("unable to start es client, check configuration"))
}

const init = () => {
    return new Promise((resolve, reject) => {
        const hostPath = 'app.elastic.host'
        if(config.has(hostPath)){
            const host = config.get(hostPath);
            var client = new Client({node: `http://${host}`});
            resolve(client)
        } else {
            reject(Error('missing configuration'));
        }
    })
}

module.exports = init