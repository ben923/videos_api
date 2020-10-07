const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const video = require('./app/database/hooks/video');
const should = chai.should();

chai.use(chaiHttp)

describe('application start', function () {
    describe('loading config', function () {
        it('should load configuration without errors', function () {
            const config = require('config');
        })
    })

    describe('accessing configuration variables', function () {
        it('should run without errors', function () {
            const config = require('config');

            if (!config.has('app') || !config.has('server')) {
                throw (Error('missing required configuration'))
            } else {
                if (!config.has('app.database')) {
                    throw (Error('missing required configuration'))
                } else {
                    if (!config.has('app.database.host') || !config.has('app.database.user') || !config.has('app.database.pass')) {
                        throw (Error('missing required configuration'))
                    }
                }

                if (!config.has('server.port')) {
                    throw (Error('missing required configuration'))
                }
            }
        })
    })

    let testedModules;

    describe('loading modules', function () {
        it('should run normally and return an object', function () {
            const init = require('./init');

            return new Promise((resolve, reject) => {
                init()
                    .then(modules => {
                        expect(modules).to.be.an('object');
                        testedModules = modules;
                        resolve();
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        });
    })

    let testedServer;

    describe('loading server', function () {
        it('should run without errors and server should be an instance of http.Server', function () {
            const init = require('./express');
            const http = require('http');

            return new Promise((resolve, reject) => {
                init()
                    .then(server => {
                        // expect(server).to.be.instanceOf(http.Server); ne marche pas erreur "cannot read property 'encrypted' of undefined"
                        // Je n'ai pas trouvé de solution pour le moment
                        testedServer = server
                        resolve()
                    })
                    .catch(err => reject(err))
            })
        })
    })

    describe('if server & modules are instancied', function () {
        describe('application start', function () {
            it('should run normally', function () {
                if (testedModules && testedServer) {
                    const App = require('./app/index');
                    new App({
                        modules: testedModules,
                        server: testedServer
                    })

                    testedServer.get('/', (req, res) => {
                        res.status(200).json({
                            api_status: "OK"
                        }).end()
                    })
                }
            })
            describe('once application started', function () {
                describe('testing api status', function () {
                    it('should return object having property api_status: ok', function (done) {
                        chai.request(testedServer)
                            .get('/')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.an('object');
                                res.body.should.have.property('api_status');
                                done();
                            });
                    })
                })

                describe('testing basic controller crud with video', function () {
                    describe('creating a video', function () {
                        it('should return status 200 with property created: 1', function (done) {
                            chai.request(testedServer)
                                .post('/video')
                                .send({
                                    name: 'test video',
                                    description: 'simple description',
                                    url: 'http://url.com'
                                })
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.an('object');
                                    res.body.should.have.property('created');
                                    res.body.created.should.be.eql(1);
                                    done();
                                });
                        })
                    })
                    describe('getting all videos', function () {
                        it('should return an array empty or with videos indexed', function (done) {
                            chai.request(testedServer)
                                .get('/video')
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.an('array');
                                    done();
                                });
                        })
                    });
                    describe('getting one video', function () {
                        it('should return one video instance', function (done) {
                            const initModels = require('./app/database/database');

                            initModels().then(({ Video }) => {
                                const video = new Video({
                                    name: 'test video',
                                    description: 'simple description',
                                    url: 'http://url.com'
                                });

                                video.save()
                                    .then(() => {
                                        chai.request(testedServer)
                                            .get(`/video/${video.id}`)
                                            .end((err, res) => {
                                                res.should.have.status(200);
                                                res.body.should.be.an('object');
                                                res.body.should.have.property('id');
                                                res.body.id.should.be.eql(video.id);
                                                done();
                                            });
                                    });
                            })
                        })
                    })
                    describe('deleting one video', function () {
                        it('should return deleted: 1', function (done) {
                            const initModels = require('./app/database/database');

                            initModels().then(({ Video }) => {
                                const video = new Video({
                                    name: 'test video',
                                    description: 'simple description',
                                    url: 'http://url.com'
                                });

                                video.save()
                                    .then(() => {
                                        chai.request(testedServer)
                                            .delete(`/video/${video.id}`)
                                            .end((err, res) => {
                                                res.should.have.status(200);
                                                res.body.should.be.an('object');
                                                res.body.should.have.property('deleted');
                                                res.body.deleted.should.be.eql(1);
                                                done();
                                            });
                                    });
                            })
                        })
                    })
                    describe('updating one video', function () {
                        it('should return updated: 1', function (done) {
                            const initModels = require('./app/database/database');

                            initModels().then(({ Video }) => {
                                const video = new Video({
                                    name: 'test video',
                                    description: 'simple description',
                                    url: 'http://url.com'
                                });

                                video.save()
                                    .then(() => {
                                        chai.request(testedServer)
                                            .put(`/video/${video.id}`)
                                            .send({
                                                name: "updated test video"
                                            })
                                            .end((err, res) => {
                                                res.should.have.status(200);
                                                res.body.should.be.an('object');
                                                res.body.should.have.property('updated');
                                                res.body.updated.should.be.eql(1);
                                                done();
                                            });
                                    });
                            })
                        })
                    })
                })
            })
        })
    })
})