'use strict'

const init = require('../elasticsearch');
const logger = require('../../../logger');

const toSearchableObject = (video) => {
    return video.getTags()
        .then(tags => {
            const { id, name, description } = video

            tags = tags.map((item) => ({ id: item.id, name: item.name }));

            return({
                id,
                name,
                description,
                tags,
            })
        });
}

const esIndex = async (video) => {
    return toSearchableObject(video).then(searchableVideo => {
        return init().then(es => {

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
                if (err) {
                    console.log(err);
                    return err
                }
                const hits = result.body.hits.hits;

                if (!hits[0]) {
                    es.index({
                        index: 'videos',
                        body: searchableVideo
                    }, (err, res) => {
                        if (!err) {
                            logger.info('successfully indexed video');
                            return searchableVideo
                        } else {
                            logger.error(err);
                            return err
                        }
                    });
                } else {
                    const video = hits[0];
                    es.index({
                        index: 'videos',
                        id: video._id,
                        body: searchableVideo
                    }, (err, res) => {
                        if (!err) {
                            logger.info('successfully indexed video');
                            return searchableVideo
                        } else {
                            logger.error(err);
                            return err
                        }
                    });
                }
            })
        })
    });
}

const esDelete = async (video) => {
    return init().then(es => {
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
            if (!err) {
                const hits = res.body.hits.hits;

                if (hits[0]) {
                    es.delete({
                        index: 'videos',
                        id: hits[0]._id
                    }, (err, res) => {
                        if(!err){
                            return video
                        } else {
                            return err
                        }
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