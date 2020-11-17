module.exports = function(sequelize, DataTypes) {
    var Order = sequelize.define('Order', {
        sale: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        ingredients: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
         
    });

    Order.associate = function (models) {
        Order.belongsTo(models.User, {
            foreignKey: {
            name : "baker_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
        Order.belongsTo(models.User, {
            foreignKey: {
            name : "buyer_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
    };

    return Order;
};