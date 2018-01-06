'use strict';
module.exports = (sequelize, DataTypes) => {
  var AuthWorkflow = sequelize.define('AuthWorkflow', {
    category:{
      type: DataTypes.STRING
    },

    auth_item_id:{
      type: DataTypes.STRING
    },

    source_user_id:{
      type: DataTypes.INTEGER
    },

    target_user_id:{
      type: DataTypes.INTEGER
    },

    auth_status	:{
      type: DataTypes.STRING
    },

    auth_action_date	:{
      type: DataTypes.DATE
    },

    auth_action_remarks	:{
      type: DataTypes.STRING
    },

    auth_token	:{
      type: DataTypes.STRING
    },

    date	:{
      type: DataTypes.DATE
    },
    
  }, {
    tableName: 'auth_workflow',
    timestamps: false,
  });

  AuthWorkflow.associate = function(models) {
    AuthWorkflow.belongsTo(models.User, {
      as: 'initiator', 
      foreignKey: 'source_user_id', 
      targetKey: 'id'
    });

    AuthWorkflow.belongsTo(models.User, {
      as: 'authorizer', 
      foreignKey: 'target_user_id', 
      targetKey: 'id'
    });

    AuthWorkflow.belongsTo(models.CustomerLoan, {
      as: 'loan', 
      foreignKey: 'auth_item_id', 
      targetKey: 'id'
    });

    AuthWorkflow.belongsTo(models.CustomerLoanPaymentActivity, {
      as: 'paymentActivity', 
      foreignKey: 'auth_item_id', 
      targetKey: 'id'
    });
  }

  return AuthWorkflow;
};