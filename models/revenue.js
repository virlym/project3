module.exports = function(sequelize, DataTypes) {
    var Revenue = sequelize.define('Revenue', {
        ingredients: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        sales: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        month: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ""
        }
         
    }, {
        timestamps: false
    });

    Revenue.associate = function (models) {
        Revenue.belongsTo(models.User, {
            foreignKey: {
            name : "baker_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
    };

    return Revenue;
};