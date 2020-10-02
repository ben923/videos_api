class Controller {
    constructor(helper){
        this.server = helper.server,
        this.config = helper.config,
        this.model = helper.model

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

        if(req.query.page){
            var page = Number(req.query.page);
            if(page <= 0){
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
                console.log(err)
            })
    }

    create = (req, res) => {
        const entryToInsert = req.body;

        this.entry = new this.model(entryToInsert);

        this.entry.validate()
            .then(() => {
                this.entry.save()
                res.status(200).json({created: 1}).end()
            })
            .catch(validator => {
                res.status(400).json(validator.errors).end()
            })
    }

    update = (req, res) => {
        this.findOrFailById(req, res)
            .then(modelInstance => {
                for(const field in req.body){
                    const value = req.body[field];

                    modelInstance[field] = value
                }
                return modelInstance.validate()
                    .then(async () => {
                        console.log('okay')
                        res.status(200).json({updated: 1}).end()
                        await modelInstance.save()
                    })
                    .catch(validator => {
                        return res.status(400).json(validator.errors).end()
                    })
            })
            .catch(err => {
                return res.status(200).json({
                    notFoundError: `model instance not found for id ${id}`
                }).end();
            });
    }

    delete = (req, res) => {
        return this.findOrFailById(req, res)
            .then(modelInstance => {
                modelInstance.destroy();
                return res.status(200).json({
                    deleted: 1
                }).end();
            });
    }

    findOrFailById = (req, res) => {
        const id = req.params.id;

        if(id){
            return new Promise((resolve, reject) => {
                this.model.findByPk(id)
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

module.exports = Controller;