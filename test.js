const axios = require('axios');
describe('application start', function(){
    describe('loading config', function(){
        it('should load configuration without errors', function(){
            const config = require('./config.json');
        })
    })

    describe('accessing configuration variables', function(){
        it('should run without errors', function() {
            const config = require('./config.json');

            if(!config.app || !config.server){
                throw(Error('missing required configuration'))
            } else {
                if(!config.app.database){
                    throw(Error('missing required configuration'))
                } else {
                    if(!config.app.database.host || !config.app.database.user || !config.app.database.pass){
                        throw(Error('missing required configuration'))
                    }
                }

                if(!config.server.port){
                    throw(Error('missing required configuration'))
                }
            }
        })
    })
    
    describe('loading models and connecting to the db', function(){
        it('should run normally', function(){
            const models = require('./app/database/database');
        })
    })
})