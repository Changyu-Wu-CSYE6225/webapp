// Product model
module.exports = (sequelize, Sequelize) => {
    return (
        sequelize.define(
            "Product",
            {
                id: {
                    type: Sequelize.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                sku: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
                },
                manufacturer: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                quantity: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                    validate: {
                        max: 100,
                        min: 0,
                    },
                },
                // owner_user_id: {     // Set in the foreign key
                //     type: Sequelize.BIGINT,
                // },
            },
            {
                timestamps: true,
                createdAt: 'date_added',    // Alias
                updatedAt: 'date_last_updated',
            },
        )
    );
};