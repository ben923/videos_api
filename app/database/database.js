const config = require('config');
const { afterCreate, afterDestroy, afterUpdate } = require('./hooks/video');

const init = () => {
    return new Promise((resolve, reject) => {
        const userPath = 'app.database.user', hostPath = 'app.database.host', passPath = 'app.database.pass';
        if (config.has(passPath) && config.has(hostPath) && config.has(userPath)) {
            const user = config.get(userPath), host = config.get(passPath), pass = config.get(hostPath);

            const { Sequelize, DataTypes } = require('sequelize');
            const sequelize = new Sequelize(`postgres://${user}:${pass}@${host}:5432/videos`, { logging: false });

            try {
                sequelize.authenticate()
            } catch (err) {
                reject(err);
            }

            const Video = sequelize.define('Video', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                },
                url: {
                    type: DataTypes.STRING,
                    allowNull: false
                }
            }, {
                timestamps: true,
                hooks: {
                    afterCreate,
                    afterUpdate,
                    afterDestroy,
                }
            });

            const Tag = sequelize.define('Tag', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true
                }
            }, { timestamps: false });

            const VideoTag = sequelize.define('VideoTag', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                },
                VideoId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: Video,
                        key: 'id'
                    }
                },
                TagId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: Tag,
                        key: 'id'
                    }
                },
            }, { timestamps: false });

            const User = sequelize.define('User', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
            });

            const UserFavorite = sequelize.define('UserFavorite', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                },
                UserId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: User,
                        key: 'id'
                    }
                },
                VideoId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: Video,
                        key: 'id'
                    }
                },
            });



            Video.sync();
            Tag.sync();
            User.sync();
            UserFavorite.sync();
            VideoTag.sync();

            Video.belongsToMany(Tag, { through: VideoTag });
            Tag.belongsToMany(Video, { through: VideoTag });
            User.belongsToMany(Video, { through: UserFavorite });

            resolve({
                Video,
                Tag,
                VideoTag,
                User,
                UserFavorite
            });
        }
    })
}

module.exports = init;