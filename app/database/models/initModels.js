const { Sequelize, DataTypes } = require('sequelize');
const { afterCreate, afterDestroy, afterUpdate } = require('../hooks/video');

const init = (sequelize) => {
    return new Promise((resolve, reject) => {
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
    })
}

module.exports = init;