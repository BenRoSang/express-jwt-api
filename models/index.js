const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config')

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        min: dbConfig.pool.min,
        max: dbConfig.pool.max,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
)

const db = {};
db.user = require('./user.model')(sequelize, Sequelize)
db.role = require('./role.model')(sequelize, Sequelize)

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.ROLE = ['admin', 'moderator', 'user']

// db.user.belongsToMany(db.role, {
//     through: 'user_roles'
// })
// db.role.belongsToMany(db.user, {
//     through: 'user_roles'
// })
db.role.belongsToMany(db.user, {
    through: "user_roles"
});
db.user.belongsToMany(db.role, {
    through: "user_roles"
});


module.exports = db
