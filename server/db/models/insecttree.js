'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InsectTree extends Model {
    
    static associate(models) {
      this.belongsTo(models.Insect, {
        foreignKey: 'insectId',
        onDelete: 'CASCADE'
      });
      this.belongsTo(models.Tree, {
        foreignKey: 'treeId',
        onDelete: 'CASCADE'
      });
    }
  }
  InsectTree.init({
    insectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Insect', key: 'id'},
    },
    treeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tree', key: 'id'},
    }
  }, {
    sequelize,
    modelName: 'InsectTree',
  });
  return InsectTree;
};