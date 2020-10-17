const config = require('config');
const initModels = require('./models/initModels');
const { Sequelize } = require('sequelize');

const init = () => {
    const userPath = 'app.database.user', hostPath = 'app.database.host', passPath = 'app.database.pass';
    if (config.has(passPath) && config.has(hostPath) && config.has(userPath)) {
        const user = config.get(userPath), host = config.get(hostPath), pass = config.get(passPath);
        const sequelize = new Sequelize(`postgres://${user}:${pass}@${host}:5432/videos`, { logging: false });

        return sequelize.authenticate()
            .then(() => initModels(sequelize))
            .then(models => resolve(models))
            .catch(err => reject(err))
    }
}

module.exports = init;