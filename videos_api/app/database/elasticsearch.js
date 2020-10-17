const {Client} = require('@elastic/elasticsearch');
const config = require('config');

const init = () => {
    return new Promise(async (resolve, reject) => {
        const hostPath = 'app.elastic.host'
        if(config.has(hostPath)){
            const host = config.get(hostPath);
            var client = new Client({node: `http://${host}`});

            await client.indices.create({
                index: 'videos'
            })
            .catch(err => console.log(err));

            resolve(client)
        } else {
            reject(Error('missing configuration'));
        }
    })
}

module.exports = init