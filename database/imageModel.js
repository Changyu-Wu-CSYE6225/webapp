// Image model
module.exports = (sequelize, Sequelize) => {
    return (
        sequelize.define(
            "Image",
            {
                image_id: {
                    type: Sequelize.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                },
                file_name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                s3_bucket_path: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
            },
            {
                timestamps: true,
                createdAt: 'date_created',
                updatedAt: false,
            }
        )
    );
};