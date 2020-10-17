const { Sequelize, DataTypes } = require('sequelize');
const { afterCreate, afterDestroy, afterUpdate } = require('../hooks/video');

const init = (sequelize) => {
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

    /**
     * Promise.all ici car si j'ai bien compris les promise s'executent en paralelle les unes des autres avec cette methode
     */

    return Promise.all([
        Video.sync(),
        Tag.sync(),
        User.sync(),
        UserFavorite.sync(),
        VideoTag.sync()
    ])
        .then((/**Pas besoin des valeur de retour dans mon use case */) => {
            /**
             * A priori d'apres la doc les association ne retourne pas de promises
             */
            Video.belongsToMany(Tag, { through: VideoTag });
            Tag.belongsToMany(Video, { through: VideoTag });
            User.belongsToMany(Video, { through: UserFavorite });

            return({
                Video,
                Tag,
                VideoTag,
                User,
                UserFavorite
            });
        })
        .catch(err => {
            return(err)
        })

}

module.exports = init;