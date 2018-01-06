'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerDocumentRequirement = sequelize.define('CustomerDocumentRequirement', {
    document_code:{
      type: DataTypes.STRING
    },

    document_name:{
      type: DataTypes.STRING
    },

    is_required:{
      type: DataTypes.INTEGER
    },
    
  }, {
    tableName: 'customer_document_requirements',
    timestamps: false,
  });

  CustomerDocumentRequirement.associate = function(models) {
      // associations can be defined here
      
  }

  return CustomerDocumentRequirement;
};