const Controller = require('./Controller');
const {Tag} = require('../database/database');
const {afterSave} = require('../database/hooks/video')
const es = require('../database/elasticsearch');
const redis = require('../cache/redisCacheService');

class Video  extends Controller{
    constructor(props){
        super(props);
        this.addRoutes();
    }

    addRoutes = () => {
        this.server.get('/video/_/search', this.search);
        this.server.get('/video/:id/tag/:tagId', this.addTagToVideo);
        this.server.delete('/video/:id/tag/:tagId', this.removeTagToVideo);
        this.server.get(`/${this.constructor.name.toLowerCase()}/:id`, this.read);
    }

    search = (req, res) => {
        const query = req.query;
        const body = {
            query: {
                bool: {
                    // must: []
                }
            }
        }

        if(query.term){
            // body.query.bool.must.push({
            //     match: {
            //         name: query.term
            //     }
            // });

            body.query.bool.should = [
                {
                    match: {
                        'tags.name': query.term
                    }
                },
                {
                    match: {
                        'name': query.term
                    }
                }
            ];
        }

        var page = query.page && query.page > 0 ? page : 1;

        console.log(JSON.stringify(body));

        this.es.search({
            index: 'videos',
            size: 15,
            from: (page -1) * 15,
            body: body
        }, (err, response) => {

            if(!err){

                const hits = response.body.hits.hits;
                const ids = hits.map(item => item._source.id);

                console.log(ids);
    
                this.model.findAll({
                    where: {
                        id: ids
                    },
                    include: 'Tags'
                })
                .then(videos => {
                    res.status(200).json(videos).end();
                })
            } else {
                res.status(500).send('unknown error').end()
            }
        })

    }

    removeTagToVideo = (req, res) => {
        this.findOrFailById(req, res)
            .then(modelInstance => {
                const tagId = req.params.tagId;

                if(tagId){
                    Tag.findByPk(tagId)
                        .then(tagToRemove => {
                            modelInstance.removeTag(tagToRemove)
                            .then(async () => {
                                await modelInstance.reload();

                                afterSave(modelInstance);
                                
                                return res.status(200).json(modelInstance).end();
                            })
                            .catch(err => console.log(err))
                        })
                } else {
                    return res.status(400).json({
                        missingParamsError: "missing required parameter tagId"
                    }).end();
                }
            })
            .catch(err => {
                return res.status(500).json(err).end()
            })
    }

    addTagToVideo = (req, res) => {
        const tagId = req.params.tagId;
        this.findOrFailById(req, res)
            .then(videoInstance => {
                if(tagId){
                    Tag.findByPk(req.params.tagId)
                    .then(async tagModelInstance => {

                        if(null === tagModelInstance){
                            return res.status(400).json({
                                modelNotFoundError: `no tag model found for id ${tagId}` 
                            })
                        }

                        videoInstance.getTags({where: {
                            id: tagId
                        }})
                        .then(async currentVideoTags => {
                            if(currentVideoTags.length === 0){
                                videoInstance.addTag(tagModelInstance);

                                await videoInstance.reload();

                                afterSave(videoInstance);
                                return res.status(200).json(videoInstance).end();

                            } else {
                                return res.status(400).json({
                                    associationError: "this model is already associated with this tag"
                                }).end()
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        });
                    })
                    .catch(err => {
                        return res.status(500).json(err).end()
                    }) 
                }
            })
    }

    read = (req, res) => {

        this.redis.GET(`_video_/${req.query.id}`, (err, cached) => {
            if(cached){
                return res.status(200).json(cached).end()
            } else {
                this.findOrFailById(req, res)
                .then(modelInstance => {
                    this.redis.setex(`_video_/${modelInstance/id}`, 300, modelInstance);
                    return res.status(200).json(modelInstance.toJSON());
                })
                .catch(err => {
                    console.log(err)
                })
            }
        });
    }

    findOrFailById = (req, res) => {
        const id = req.params.id;

        if(id){
            return new Promise((resolve, reject) => {
                this.model.findByPk(id, {include: 'Tags'})
                .then(response => {
                    if(null !== response){
                        return resolve(response);
                    } else {
                        return reject(res.status(400).json({
                            modelNotFoundError: `model not found for id ${id}`
                        }).end());
                    }
                })
                .catch(err => {
                    return reject(res.status(200).json([]).end());
                });
            })
        } else {
            return res.status(400).json({
                missingParamsError: "missing required parameter id"
            }).end();
        }
    }
}

module.exports = Video;