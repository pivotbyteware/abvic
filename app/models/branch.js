'use strict';
module.exports = (sequelize, DataTypes) => {
  var Branch = sequelize.define('Branch', {
    branch_code:{
      type: DataTypes.STRING
    },

    branch_name:{
      type: DataTypes.STRING
    },
  }, {
    tableName: 'branches',
    timestamps: false,
  });

  Branch.associate = function(models) {
      // associations can be defined here
      
  }

  return Branch;
};