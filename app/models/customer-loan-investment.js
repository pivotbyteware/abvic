'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerLoanInvestment = sequelize.define('CustomerLoanInvestment', {
    customer_id:{
      type: DataTypes.INTEGER
    },
    
    loan_id:{
      type: DataTypes.BIGINT
    },

    investment_reference_number: {
      type: DataTypes.STRING
    },

    investment_date: {
      type: DataTypes.DATE
    },

    investment_amount:{
      type: DataTypes.DOUBLE
    },

    interest_rate:{
      type: DataTypes.DOUBLE
    },

    interest_amount	:{
      type: DataTypes.DOUBLE
    },

    total_amount:{
      type: DataTypes.DOUBLE
    },

    interest_maturity_date:{
      type: DataTypes.DATEONLY
    },

    investment_duration:{
      type: DataTypes.INTEGER
    },

    repayment_date:{
      type: DataTypes.DATEONLY
    },

    is_opening_investment:{
      type: DataTypes.INTEGER
    },

    is_closing_investment:{
      type: DataTypes.INTEGER
    },

    investment_status:{
      type: DataTypes.ENUM('ACTIVE', 'PROCESSED')
    },

    payment_status:{
      type: DataTypes.ENUM('OPEN', 'PAID')
    },

    payment_date:{
      type: DataTypes.DATE
    },

    payment_mode:{
      type: DataTypes.ENUM('DDACC', 'CASH')
    },

    payment_amount:{
      type: DataTypes.DOUBLE
    },

    payment_user_id:{
      type: DataTypes.INTEGER
    },

    is_full_payment:{
      type: DataTypes.ENUM('Y', 'N')
    },


  }, {
    tableName: 'customer_loan_investments',
    timestamps: false,
  });

  CustomerLoanInvestment.associate = function(models) {
      // associations can be defined here
      CustomerLoanInvestment.belongsTo(models.CustomerLoan, {
        as: 'loan', 
        foreignKey: 'loan_id', 
        targetKey: 'id',
      });
  }

  return CustomerLoanInvestment;
};