const Controller = require('./Controller');
const {Tag} = require('../database/database');

class Video  extends Controller{
    constructor(props){
        super(props);
        this.addRoutes();
    }

    addRoutes = () => {
        this.server.get('/video/:id/tag/:tagId', this.addTagToVideo);
        this.server.delete('/video/:id/tag/:tagId', this.removeTagToVideo);
        this.server.get(`/${this.constructor.name.toLowerCase()}/:id`, this.read);
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
                                const freshModel = await this.model.findByPk(modelInstance.id, {include: 'Tags'});
                                return res.status(200).json(freshModel).end();
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

                                const freshModel = await this.model.findByPk(videoInstance.id, {
                                    include: 'Tags'
                                });

                                return res.status(200).json(freshModel).end();
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
        return this.findOrFailById(req, res)
            .then(modelInstance => {
                return res.status(200).json(modelInstance.toJSON());
            })
            .catch(err => {
                console.log(err)
            })
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