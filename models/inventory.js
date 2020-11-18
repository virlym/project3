module.exports = function(sequelize, DataTypes) {
    var Inventory = sequelize.define('Inventory', {
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
        }
         
    });

    Inventory.associate = function (models) {
        Inventory.belongsTo(models.User, {
            foreignKey: {
            name : "baker_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
    };

    return Inventory;
};