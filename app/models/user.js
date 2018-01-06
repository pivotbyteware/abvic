'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    branch_id:{
      type: DataTypes.INTEGER
    },

    first_name:{
      type: DataTypes.STRING
    },

    last_name:{
      type: DataTypes.STRING
    },

    screen_name:{
      type: DataTypes.STRING
    },

    login_id:{
      type: DataTypes.STRING
    },

    login_password:{
      type: DataTypes.STRING
    },

    user_role:{
      type: DataTypes.STRING
    },

    status: {
      type: DataTypes.STRING
    },

    changed_one_time_password: {
      type: DataTypes.INTEGER
    },

    created_at: {
      type: DataTypes.DATE
    },

    created_by: {
      type: DataTypes.INTEGER
    },
    
  }, {
    tableName: 'users',
    timestamps: false,
  });

  User.associate = function(models) {
    User.belongsTo(models.Branch, {
      as: 'branch', 
      foreignKey: 'branch_id', 
      targetKey: 'id'
    });

  }

  return User;
};