const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    `csye6225`,
    // 'csye6225webapp',
    `${process.env.DB_USERNAME}`,
    // 'root',
    `${process.env.DB_PASSWORD}`,
    {
        host: `${process.env.DB_HOSTNAME}`,
        port: 3306,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./userModel')(sequelize, Sequelize);
db.products = require('./productModel')(sequelize, Sequelize);
db.images = require('./imageModel')(sequelize, Sequelize);

db.users.hasMany(db.products, {
    foreignKey: 'owner_user_id',
});
db.products.hasMany(db.images, {
    foreignKey: 'product_id',
});
// db.products.belongsTo(db.users);

module.exports = db;