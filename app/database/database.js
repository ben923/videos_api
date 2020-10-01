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
});

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
          model: Video, // 'Movies' would also work
          key: 'id'
        }
    },
    TagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Tag, // 'Movies' would also work
          key: 'id'
        }
    },
});


Video.belongsToMany(Tag, { through: VideoTag });
Tag.belongsToMany(Video, { through: VideoTag });

Video.sync()
Tag.sync()
VideoTag.sync()

module.exports = {
    Video,
    Tag,
    VideoTag
}
