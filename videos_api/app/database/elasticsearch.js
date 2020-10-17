const { Client } = require('@elastic/elasticsearch');
const config = require('config');

const init = () => {
    const hostPath = 'app.elastic.host'
    if (config.has(hostPath)) {
        const host = config.get(hostPath);
        var client = new Client({ node: `http://${host}` });

        return client.indices.create({
            index: 'videos'
        })
            .catch(err => {
                if (err.message != 'resource_already_exists_exception')
                    return reject(console.log(err.message))
            })
            .then(() => resolve(client));
    } else {
        return Promise.reject(Error('missing configuration'));
    }
}

module.exports = init