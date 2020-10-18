const Controller = require('./Controller');
const initModels = require('../database/database');
const { afterUpdate } = require('../database/hooks/video');
const promisify = require('util');

class Video extends Controller {
    constructor(props) {
        super(props);
        this.addConfiguration();
    }

    addConfiguration = () => {
        return initModels()
            .then(models => {
                this.models = models;

                this.server.get('/video/_/search', this.search);
                this.server.get('/video/:id/tag/:tagId', this.addTagToVideo);
                this.server.delete('/video/:id/tag/:tagId', this.removeTagToVideo);
                this.server.get(`/${this.constructor.name.toLowerCase()}/:id`, this.read);

                return true;
            })
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

        if (query.term) {
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

        return this.es.search({
            index: 'videos',
            size: 15,
            from: (page - 1) * 15,
            body: body
        })
            .then(response => this.getIdsFromElasticPayload(response))
            .then(videos => res.status(200).json(videos).end())
            .catch(err => res.status(500).send(err.message).end())

    }

    getIdsFromElasticPayload = (response) => {
        const hits = response.body.hits.hits;
        const ids = hits.map(item => item._source.id);

        return this.model.findAll({
            where: {
                id: ids
            },
            include: 'Tags'
        })
    }

    removeTagToVideo = (req, res) => {
        return this.findOrFailById(req, res)
            .then(modelInstance => {
                const tagId = req.params.tagId;

                if (tagId) {
                    return this.models.Tag.findByPk(tagId)
                        .then(tagToRemove => modelInstance.removeTag(tagToRemove))
                        .then(modelInstance.reload())
                        .then(() => res.status(200).json(modelInstance).end())
                        .catch(err => res.status(500).send(err.message).end())
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
        return this.findOrFailById(req, res)
            .then(videoInstance => {
                if (tagId) {
                    return this.models.Tag.findByPk(req.params.tagId)
                        .then(async tagModelInstance => {

                            if (null === tagModelInstance) {
                                return res.status(400).json({
                                    modelNotFoundError: `no tag model found for id ${tagId}`
                                })
                            }

                            return videoInstance.getTags({
                                where: {
                                    id: tagId
                                }
                            })
                                .then(async currentVideoTags => {
                                    if (currentVideoTags.length === 0) {
                                        return videoInstance.addTag(tagModelInstance)
                                            .then(() => videoInstance.reload())
                                            .then(() => res.status(200).json(videoInstance).end())
                                            .catch((err) => res.status(500).send(err.message).end());

                                    } else {
                                        return res.status(400).json({
                                            associationError: "this model is already associated with this tag"
                                        }).end()
                                    }
                                })
                                .catch(err => {
                                    return res.status(500).send(err).end()
                                });
                        })
                        .catch(err => {
                            return res.status(500).send(err).end()
                        })
                }
            })
    }

    read = (req, res) => {

        const redisGet = promisify(this.redis.GET).bind(this.redis)
        const redisSet = promisify(this.redis.setex).bind(this.redis)

        return redisGet(`_video_/${req.query.id}`)
            .then((cached) => res.status(200).json(cached).end())
            .catch(err => {
                return this.findOrFailById(req, res)
                    .then(modelInstance => {
                        redisSet(`_video_/${modelInstance / id}`, 300, modelInstance)
                            .then(() => res.status(200).json(modelInstance.toJSON()))
                            .catch(err => res.status(500).send(err.message).end())
                    })
                    .catch(err => {
                        return res.status(500).send(err).end()
                    });
            });
    }

    findOrFailById = (req, res) => {
        const id = req.params.id;

        if (id) {
            return this.model.findByPk(id, { include: 'Tags' })
                .then(response => {
                    if (null !== response) {
                        return response;
                    } else {
                        return Error(`model not found for id ${id}`)
                    }
                })
                .catch(err => {
                    return Error('unknown error');
                });
        } else {
            return Error("missing required parameter id")
        }
    }
}

module.exports = Video;