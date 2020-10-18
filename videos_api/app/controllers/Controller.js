class Controller {
    constructor(helper) {
        this.server = helper.server;
        this.config = helper.config;
        this.model = helper.model;
        this.es = helper.modules.esClient;
        this.redis = helper.modules.redisClient;
        this.logger = helper.logger;

        this.init()
    }

    init = () => {
        this.server.get(`/${this.constructor.name.toLowerCase()}`, this.readAll);
        this.server.post(`/${this.constructor.name.toLowerCase()}`, this.create);
        this.server.get(`/${this.constructor.name.toLowerCase()}/:id`, this.read);
        this.server.put(`/${this.constructor.name.toLowerCase()}/:id`, this.update);
        this.server.delete(`/${this.constructor.name.toLowerCase()}/:id`, this.delete);
    }

    readAll = async (req, res) => {
        const limit = 15;

        if (req.query.page) {
            var page = Number(req.query.page);
            if (page <= 0) {
                page = 1;
            }
        } else {
            var page = 1;
        }
        const entries = await this.model.findAll(
            {
                limit: limit,
                offset: (page - 1) * limit
            }
        );

        return res.status(200).json(entries).end()
    }

    read = (req, res) => {
        return this.findOrFailById(req, res)
            .then(modelInstance => {
                return res.status(200).json(modelInstance.toJSON());
            })
            .catch(err => {
                return res.status(500).send(err).end()
            })
    }

    create = (req, res) => {
        const entryToInsert = req.body;

        this.entry = new this.model(entryToInsert);

        return this.entry.validate()
            .then(() => this.entry.save())
            .then((result) => res.status(200).json({ created: 1 }).end())
            .catch(err => res.status(500).send(err.message).end())
    }

    update = (req, res) => {
        return this.findOrFailById(req, res)
            .then(modelInstance => this.applyUpdate(modelInstance, req))
            .then(result => res.status(200).json({ updated: 1 }).end())
            .catch(err => res.status(500).send(err.message).end());
    }

    applyUpdate = (modelInstance, req) => {
        for (const field in req.body) {
            const value = req.body[field];

            modelInstance[field] = value
        }
        return modelInstance.validate().then(() => modelInstance.save())
    }

    delete = (req, res) => {
        return this.findOrFailById(req, res)
            .then(modelInstance => modelInstance.destroy())
            .then(result => res.status(200).json({deleted: 1}).end())
            .catch(err => res.status(500).send(err).end());
    }

    findOrFailById = (req, res) => {
        const id = req.params.id;

        if (id) {
            return this.model.findByPk(id)
                .then(response => {
                    if (null !== response) {
                        return response;
                    } else {
                        return Promise.resolve(Error(`model not found for id ${id}`))
                    }
                })
                .catch(err => {
                    return Promise.reject(Error('unknown error'));
                });
        } else {
            return Promise.reject(Error("missing required parameter id"))
        }
    }
}

module.exports = Controller;