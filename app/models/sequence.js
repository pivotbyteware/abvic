'use strict';

module.exports = (sequelize, DataTypes) => {
  var Sequence = sequelize.define('Sequence', {
    sequence_code:{
      type: DataTypes.STRING,
      primaryKey: true
    },

    namespace:{
      type: DataTypes.STRING
    },

    sequence_number:{
      type: DataTypes.BIGINT
    }

  }, {
    tableName: 'sequences',
    timestamps: false,
  });

  return Sequence;
};