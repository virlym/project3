module.exports = function(sequelize, DataTypes) {
    var PreMade = sequelize.define('PreMade', {
        name: {
            type: DataTypes.STRING,
            allowNull: false    
        },
        price: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
         ingredients: {
            type: DataTypes.STRING,
            allowNull: false
         },
         description: {
            type: DataTypes.STRING,
            allowNull: false
         },
         img: {
             type: DataTypes.STRING,
             allowNull: false
         }
         
    }, {
        timestamps: false
    });

    PreMade.associate = function (models) {
        PreMade.belongsTo(models.User, {
            foreignKey: {
            name : "baker_id",
            type: DataTypes.INTEGER,
            allowNull: false
            }
        });
    };

    return PreMade;
};