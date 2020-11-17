module.exports = function(sequelize, DataTypes) {
    var InvChanges = sequelize.define('InvChanges', {
        ingredients: {
            type: DataTypes.STRING,
            allowNull: false
        },
        handled: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        origin: {
            type: DataTypes.STRING,
            allowNull: false
        }
         
    });

    InvChanges.associate = function (models) {
        InvChanges.belongsTo(models.User, {
            foreignKey: {
            name : "baker_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
    };

    return InvChanges;
};