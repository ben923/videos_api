const chai = require('chai');
const chaiHttp = require('chai-http');

const initModules = require('./init');
const initServer = require('./express');
const App = require('./app');
const logger = require('./logger');
const config = require('config');

chai.should();
chai.use(chaiHttp)

describe('application start', function () {

    describe('initing modules', function () {
        it('should resolve object containing redis, models & elasticsearch client', function (done) {
            initModules()
                .then(modules => {
                    modules.should.be.an('object');
                    modules.should.have.property('models');
                    modules.should.have.property('redisClient');
                    modules.should.have.property('esClient');
                    done();
                    return modules;
                })
                .catch(err => {
                    err.should.have.property('message');
                    return done(err);
                });
        });
    });

    describe('initing server', function () {
        it('should run without error', function (done) {
            initServer().then(() => done()).catch(done)
        });
    });

    describe('once server & modules inited', function () {

        Promise.all([
            initServer(8080),
            initModules()
        ]).then(([server, modules]) => {

            describe('loading app', () => {
                it('should never return error', () => {
                    new App({
                        modules,
                        server,
                        logger,
                        config
                    });
                })
            })

            describe('api created', function () {
                const request = chai.request(server).keepOpen();
                let video;

                beforeEach((done) => {
                    video = new modules.models.Video({
                        name: 'toUpdateVideo',
                        description: 'this video will be deleted',
                        url: '/'
                    });
                    video.save();
                    done()
                })

                describe('testing entity video', function () {

                    describe('insert a video', function () {
                        describe('with lacking field name', function () {
                            it('should return "Video.name cannot be null and have status 500"', function (done) {
                                request.post('/video').send({
                                    description: 'this is a video without name',
                                    url: '/'
                                })
                                    .end((err, res) => {
                                        if (err)
                                            return done(err);

                                        res.should.have.status(500);
                                        res.text.should.eql('notNull Violation: Video.name cannot be null');
                                        return done();
                                    })
                            })
                        })

                        describe('fullfilled', function () {
                            it('should return object with property "created" with value "1" and have status 200', function () {
                                request.post('/video').send({
                                    name: 'video',
                                    description: 'this is a video',
                                    url: '/'
                                })
                                    .end((err, res, body) => {
                                        if (err)
                                            return done(err);

                                        res.should.have.status(200);
                                        body.should.have.param('created');
                                        return done()
                                    })
                            })
                        })
                    })
                })
            })
        })
            .catch(console.log)
    })
})

function randomString(length) {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function randomEmail() {
    return `${randomString(10)}@${randomString(5)}.fr`
}