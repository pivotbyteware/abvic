'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerLoanPaymentActivity = sequelize.define('CustomerLoanPaymentActivity', {
    investment_id: {
      type: DataTypes.BIGINT
    },

    payment_reference_number:{
      type: DataTypes.STRING
    },

    status:{
      type: DataTypes.STRING
    },

    payment_initiation_date:{
      type: DataTypes.DATE
    },

    payment_mode:{
      type: DataTypes.STRING
    },

    payment_amount:{
      type: DataTypes.DOUBLE
    },

    payment_initiator_user_id	:{
      type: DataTypes.BIGINT
    },

    payment_auth_user_id:{
      type: DataTypes.BIGINT
    },

    payment_auth_date:{
      type: DataTypes.DATE
    },
    
  }, {
    tableName: 'customer_loan_payments_activity',
    timestamps: false,
  });

  CustomerLoanPaymentActivity.associate = function(models) {
      // associations can be defined here
      CustomerLoanPaymentActivity.belongsTo(models.CustomerLoanInvestment, {
        as: 'investment', 
        foreignKey: 'investment_id', 
        targetKey: 'id'
      });

      CustomerLoanPaymentActivity.belongsTo(models.User, {
        as: 'initiator', 
        foreignKey: 'payment_initiator_user_id', 
        targetKey: 'id'
      });

      CustomerLoanPaymentActivity.hasMany(models.AuthWorkflow, {
        as: 'authorizationRequests', 
        foreignKey: 'auth_item_id', 
        sourceKey: 'id'
      });
  }

  return CustomerLoanPaymentActivity;
};