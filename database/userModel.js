// User model
module.exports = (sequelize, Sequelize) => {
    return (
        sequelize.define(
            "User",
            {
                id: {
                    type: Sequelize.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                },
                first_name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                last_name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                username: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        isEmail: true,
                    }
                },
            },
            {
                timestamps: true,
                createdAt: 'account_created',       // Alias
                updatedAt: 'account_updated',
            }
        )
    );
};