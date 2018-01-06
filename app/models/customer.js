'use strict';

module.exports = (sequelize, DataTypes) => {
  var Customer = sequelize.define('Customer', {
    id_number:{
      type: DataTypes.STRING
    },

    id_type:{
      type: DataTypes.STRING
    },

    first_name:{
      type: DataTypes.STRING
    },

    middle_name:{
      type: DataTypes.STRING
    },

    last_name:{
      type: DataTypes.STRING
    },

    company_name:{
      type: DataTypes.STRING
    },

    email1:{
      type: DataTypes.STRING
    },

    email2:{
      type: DataTypes.STRING
    },

    email3:{
      type: DataTypes.STRING
    },

    mobile1:{
      type: DataTypes.STRING
    },

    mobile2:{
      type: DataTypes.STRING
    },
    
    mobile3:{
      type: DataTypes.STRING
    },

    phone1:{
      type: DataTypes.STRING
    },

    phone2:{
      type: DataTypes.STRING
    },

    phone3:{
      type: DataTypes.STRING
    },

    address_line1:{
      type: DataTypes.STRING
    },

    address_line2:{
      type: DataTypes.STRING
    },

    address_line3:{
      type: DataTypes.STRING
    },

    created_by:{
      type: DataTypes.INTEGER
    },

    created_at:{
      type: DataTypes.DATE
    },

    branch_id:{
      type: DataTypes.INTEGER
    },

    status:{
      type: DataTypes.STRING
    },
    
  }, {
    tableName: 'customers',
    timestamps: false,
  });

  Customer.associate = function(models) {
    Customer.hasMany(models.CustomerDocument, {
      as: 'documents', 
      foreignKey: 'customer_id', 
      sourceKey: 'id'
    });

    Customer.hasMany(models.CustomerLoan, {
      as: 'loans', 
      foreignKey: 'customer_id', 
      sourceKey: 'id'
    });

    Customer.hasMany(models.CustomerLoanInvestment, {
      as: 'investments', 
      foreignKey: 'customer_id', 
      sourceKey: 'id'
    });
      
  }

  return Customer;
};