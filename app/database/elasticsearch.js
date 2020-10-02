const {Client} = require('@elastic/elasticsearch');

try{
    const config = require('../../config.json').app.elastic
    
    var client = new Client({node: `http://${config.host}`});
} catch(err){
    throw(Error("unable to start es client, check configuration"))
}

module.exports = client