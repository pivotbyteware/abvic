'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerDocument = sequelize.define('CustomerDocument', {
    customer_id:{
      type: DataTypes.INTEGER
    },

    document_code:{
      type: DataTypes.STRING
    },

    document_file_name:{
      type: DataTypes.STRING
    },

    document_file_extension:{
      type: DataTypes.STRING
    },

    document_mime_type:{
      type: DataTypes.STRING
    },

    document_file_size:{
      type: DataTypes.INTEGER
    },
    
  }, {
    tableName: 'customer_documents',
    timestamps: false,
  });

  CustomerDocument.associate = function(models) {
    CustomerDocument.belongsTo(models.CustomerDocumentRequirement, {
      as: 'document', 
      foreignKey: 'document_code', 
      targetKey: 'document_code',
    });
  }

  return CustomerDocument;
};