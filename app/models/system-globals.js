'use strict';
module.exports = (sequelize, DataTypes) => {
  var SystemGlobals = sequelize.define('SystemGlobals', {
    code:{
      type: DataTypes.STRING,
      primaryKey: true
    },

    value:{
      type: DataTypes.STRING
    },
    
  }, {
    tableName: 'system_globals',
    timestamps: false,
  });

  SystemGlobals.associate = function(models) {
      // associations can be defined here
      
  }

  return SystemGlobals;
};