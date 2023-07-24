module.exports = (sequelize, dataTypes) => {
    let alias = "Favourites";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        profile_id: {
            type: dataTypes.INTEGER,
            references: {
                model: 'profiles',
                key: 'id'
            }
        },
        users_id: {
            type: dataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        movie_id: {
            type: dataTypes.INTEGER,
        },
        type: {
            type: dataTypes.STRING,
        }
    };
    let config = {
        tableName: "favourites",
        timestamps: false
    };
    const Favourites = sequelize.define(alias, cols, config);

    Favourites.associate = (models) => {
        Favourites.belongsTo(models.Profile, {
            as: 'profiles',
            foreignKey: 'profile_id'
        });
        Favourites.belongsTo(models.User, {
            as: 'users',
            foreignKey: 'users_id'
        });
    }

    return Favourites
};