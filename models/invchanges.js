module.exports = function(sequelize, DataTypes) {
    var InvChanges = sequelize.define('InvChanges', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        metric: {
            type: DataTypes.STRING,
            allowNull: false
        },
        handled: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        type: {
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