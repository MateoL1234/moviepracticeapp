module.exports = (sequelize, dataTypes) => {
    let alias = "Profile";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        users_id: {
            type: dataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        name: {
            type: dataTypes.STRING,
        },
        image: {
            type: dataTypes.STRING,
        }
    };
    let config = {
        tableName: "profiles",
        timestamps: false
    };
    const Profiles = sequelize.define(alias, cols, config);

    Profiles.associate = (models) => {
        Profiles.belongsTo(models.User, {
            as: 'users',
            foreignKey: 'users_id'
        });
    }

    return Profiles
};