module.exports = function(sequelize, DataTypes) {
    var Pricing = sequelize.define('Pricing', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        }
         
    }, {
        timestamps: false
    });

    Pricing.associate = function (models) {
        Pricing.belongsTo(models.User, {
            foreignKey: {
            name : "baker_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
    };

    return Pricing;
};