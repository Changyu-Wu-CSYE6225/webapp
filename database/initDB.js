const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'csye6225webapp',
    'root',
    'Vandark-1999',
    {
        host: 'localhost',
        dialect: 'mysql',
        operatorsAliases: false,
        // pool: {
        //     max: 5,
        //     min: 0,
        //     acquire: 30000,
        //     idle: 10000,
        // },
    },
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./userModel')(sequelize, Sequelize);
db.products = require('./productModel')(sequelize, Sequelize);

db.users.hasMany(db.products, {
    foreignKey: 'owner_user_id',
});
// db.products.belongsTo(db.users);

module.exports = db;