'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerLoan = sequelize.define('CustomerLoan', {
    customer_id: {
      type: DataTypes.BIGINT
    },

    loan_reference_number:{
      type: DataTypes.STRING
    },

    loan_type:{
      type: DataTypes.STRING
    },

    customer_id:{
      type: DataTypes.STRING
    },

    customer_bank_account_number:{
      type: DataTypes.STRING
    },

    customer_bank_account_sort_code	:{
      type: DataTypes.STRING
    },

    opening_date:{
      type: DataTypes.DATE
    },

    opening_user_id:{
      type: DataTypes.BIGINT
    },

    loan_status: {
      type: DataTypes.STRING
    },

    branch_id: {
      type: DataTypes.INTEGER
    },
    
  }, {
    tableName: 'customer_loans',
    timestamps: false,
  });

  CustomerLoan.associate = function(models) {
      // associations can be defined here
      CustomerLoan.belongsTo(models.Customer, {
        as: 'customer', 
        foreignKey: 'customer_id', 
        targetKey: 'id'
      });

      CustomerLoan.belongsTo(models.User, {
        as: 'creator', 
        foreignKey: 'opening_user_id', 
        targetKey: 'id'
      });

      CustomerLoan.hasMany(models.CustomerLoanInvestment, {
        as: 'investments', 
        foreignKey: 'loan_id', 
        sourceKey: 'id'
      });

      CustomerLoan.hasMany(models.AuthWorkflow, {
        as: 'authorizationRequests', 
        foreignKey: 'auth_item_id', 
        sourceKey: 'id'
      });
  }

  return CustomerLoan;
};