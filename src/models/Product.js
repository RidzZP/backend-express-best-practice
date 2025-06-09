"use strict";

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define(
        "Product",
        {
            id_product: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            category_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            foto: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            date_added: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            date_updated: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: "product",
            timestamps: false,
            underscored: false,
            freezeTableName: true,
        }
    );

    return Product;
};
