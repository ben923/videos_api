try{
    var database = require('../../config.json').app.database;
} catch(err){
    throw(err);
}

const user = database.user;
const host = database.host;
const pass = database.pass;

if(undefined === user || undefined === pass || undefined === host ){
    throw(Error('missing required configuration to start db'))
}

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(`postgres://${database.user}:${database.pass}@${database.host}:5432/videos`, {logging: false});

try{
    sequelize.authenticate()
} catch(err){
    throw(err);
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
}, {timestamps: true});

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
}, {timestamps: false});

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
}, {timestamps: false});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
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


Video.belongsToMany(Tag, { through: VideoTag });
Tag.belongsToMany(Video, { through: VideoTag });
User.belongsToMany(Video, { through: UserFavorite });

Video.sync();
Tag.sync();
User.sync();
UserFavorite.sync();
VideoTag.sync();

module.exports = {
    Video,
    Tag,
    VideoTag,
    User,
    UserFavorite
}
