const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Video} = require('../database/database')

class User {
    constructor(helper) {
        this.server = helper.server;
        this.model = helper.model;
        this.config = helper.config;
        this.logger = helper.logger;

        this.init();
    }

    init = () => {
        this.server.use('/user', this.middlewareUser);
        this.server.post('/user/login', this.login);
        this.server.post('/user/register', this.register);
        this.server.get('/user', this.user);
        this.server.get('/user/favorite/:videoId', this.favorite);
        this.server.get('/user/favorites/', this.userFavorites);
        /**
         * Pas de logout avec JWT le browser doit oublier le token pour être deconnecté
         * mais pourquoi pas mise en place d'un fichier d'invalidation de tokens pour invalider la connexion 
         * si le user s'est logout et empecher de future connexion avec ce token
         */
    }

    userFavorites = (req, res) => {
        const {id} = req.token

        this.model.findOne({
            where: {
                id: id
            },
            include: 'Videos'
        })
        .then(user => {
            if(null === user){
                return res.status(400).json({
                    authenticationError: "user not found"
                }).end();
            }

            const {Videos} = user;

            return res.status(200).json({
                Videos
            }).end();

        })
    }


    favorite = (req, res) => {
        const videoId = req.params.videoId;

        Video.findOne({
            where: {
                id: videoId
            }
        }).then(video => {
            if(null !== video){
                this.model.findOne({
                    where: {
                        id: req.token.id
                    },
                    include: 'Videos'
                }).then(currentUser => {

                    if(null === currentUser){
                        return res.status(400).json({
                            authenticationError: "user not found"
                        }).end();
                    }

                    const {id, email, createdAt, updatedAt, Videos} = currentUser;

                    currentUser.addVideo(video);
                    Videos.push(video);

                    return res.status(200).json({
                        id,
                        email,
                        createdAt,
                        updatedAt,
                        Videos
                    }).end();
                })
            } else {
                return res.status(400).json({
                    videoNotFoundError: `Video with id ${videoId} not found`
                })
            }
        })


    }

    user = (req, res) => {
        const user = req.token;

        this.model.findOne({
            where: {
                id: user.id
            },
            include: 'Videos'
        }).then(currentUser => {
            if(null !== currentUser){
                return res.status(200).json({
                    id: currentUser.id,
                    email: currentUser.email,
                    createdAt: currentUser.createdAt,
                    updatedAt: currentUser.updatedAt,
                    videos: currentUser.getVideos()
                }).end()
            }

            return res.status(400).json({
                authenticationError: "user not found"
            }).end()
        })
    }

    login = (req, res) => {
        const body = req.body;

        if (body) {
            if (body.email && body.password && body.email !== "" && body.password !== "") {
                this.model.findOne({
                    where: {
                        email: body.email
                    }
                })
                    .then(user => {
                        if (null !== user) {
                            if (bcrypt.compareSync(body.password, user.password)) {
                                jwt.sign(user.toJSON(), this.config.app.authentication.secret, (err, result) => {
                                    if (!err) {
                                        return res.status(200).json({
                                            token: result
                                        }).end();
                                    }

                                    return res.status(400).json({
                                        authenticationError: "can't authenticate this user for the moment"
                                    }).end();
                                })
                            } else {
                                return res.status(400).json({
                                    credentialsError: "credentials does not match any user in the database"
                                })
                            }
                        } else {
                            return res.status(400).json({
                                credentialsError: "credentials does not match any user in the database"
                            })
                        }
                    })
            }
        }
    }

    register = (req, res) => {
        const body = req.body

        if (body) {
            this.validate(body)
                .then(async () => {
                    const hashedPassword = bcrypt.hashSync(body.password, 10);
                    /**
                     * Champ email a unique: true mais le model s'insert quand meme si le user existe donc workaround
                     */
                    const alreadyExistingUser = await this.model.count({
                        where: {
                            email: body.email
                        }
                    })
                        .catch(err => {
                            console.log(err);
                        });

                    if (alreadyExistingUser > 0) {
                        return res.status(400).json({ emailError: "email already taken" }).end();
                    }

                    const newUser = new this.model({
                        email: body.email,
                        password: hashedPassword
                    });

                    await newUser.save().catch(err => console.log(err));

                    jwt.sign(newUser.toJSON(), this.config.get('app.authentication.secret'), {
                        expiresIn: 600
                    }, (err, result) => {
                        if (err) {
                            return res.status(400).json({ authenticationError: "cannot authanticate this user for the moment" }).end();
                        }

                        return res.status(200).json({
                            token: result
                        }).end();
                    })
                })
                .catch(err => {
                    res.status(400).json(err).end();
                })
        }
    }

    middlewareUser = (req, res, next) => {
        //
        const token = req.headers.authorization;

        if (req.url === '/login' || req.url === '/register') {
            return next();
        }
        else if (token) {
            jwt.verify(token, this.config.app.authentication.secret, (err, decoded) => {
                if (err) {
                    return res.status(401).send('Unauthorized').end()
                } else {
                    req.token = decoded;
                    return next()
                }
            });
        } else {
            return res.status(401).send('Unauthorized').end()
        }
    }

    validate = (body, res) => {
        return new Promise((resolve, reject) => {
            for (const field of ['email', 'password', 'confirm_password']) {
                if (!body[field] || body[field] === "") {
                    return reject({
                        missingFieldError: `missing required field ${field}`
                    });
                }

                switch (field) {
                    case 'password':
                        if (body.password !== body.confirm_password)
                            return reject({ passwordError: 'password & password confirmation are not equals' });
                        break;
                    case 'email':
                        if (!/.+@.+\.[a-z]+/.test(body.email))
                            return reject({ emailError: 'email seems not good' });
                        break;
                    default:
                        break;
                }

            }

            return resolve();
        })
    }
}

module.exports = User;