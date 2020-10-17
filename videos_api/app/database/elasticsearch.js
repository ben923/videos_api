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
            .catch(err => {
                if(err.message != 'resource_already_exists_exception')
                    return console.log(err.message)
            });

            resolve(client)
        } else {
            reject(Error('missing configuration'));
        }
    })
}

module.exports = init