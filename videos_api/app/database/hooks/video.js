'use strict'

const init = require('../elasticsearch');
const logger = require('../../../logger');

const toSearchableObject = (video) => {
    return new Promise((resolve, reject) => {
        video.getTags()
        .then(tags => {
            const {id, name, description} = video

            tags = tags.map((item) => ({id: item.id, name: item.name}));
        
            resolve({
                id,
                name,
                description,
                tags,
            })
        });
    })
}

const esIndex = (video) => {
    toSearchableObject(video).then(searchableVideo => {
        init().then(es => {

            logger.info('indexing video')
        
            es.search({
                index: 'videos',
                size: 1,
                body: {
                    query: {
                        match: {
                            id: searchableVideo.id
                        }
                    }
                }
            }, (err, result) => {
                if(err){
                    console.log(err);
                }
                const hits = result.body.hits.hits;
        
                if(!hits[0]){
                    es.index({
                        index: 'videos',
                        body: searchableVideo
                    }, (err, res) => {
                        if(!err){
                            logger.info('successfully indexed video');
                        } else {
                            logger.error(err);
                        }
                    });
                } else {
                    const video = hits[0];
                    es.index({
                        index: 'videos',
                        id: video._id,
                        body: searchableVideo
                    }, (err, res) => {
                        if(!err){
                            logger.info('successfully indexed video');
                        } else {
                            logger.error(err);
                        }
                    });
                }
            })
        })
    });
}

const esDelete = (video) => {
    init().then(es => {
        es.search({
            size: 1,
            body: {
                query: {
                    match: {
                        id: video.id
                    }
                }
            }
        }, (err, res) => {
            if(!err){
                const hits = res.body.hits.hits;
    
                if(hits[0]){
                    es.delete({
                        index: 'videos',
                        id: hits[0]._id
                    });
                }
    
            }
        })
    })
}

const afterUpdate = esIndex;
const afterCreate = esIndex;
const afterSave = esIndex;
const afterDestroy = esDelete;

module.exports = {
    afterCreate,
    afterUpdate,
    afterSave,
    afterDestroy
}