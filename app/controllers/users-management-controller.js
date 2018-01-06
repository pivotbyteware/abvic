
var moment = require('moment');
var validator = require('validator');
var bcrypt = require('bcrypt');

var Sequelize = require('../models').Sequelize;
var sequelize = require('../models').sequelize;

var User = require('../models').User;
var Branch = require('../models').Branch;

module.exports = {
    index: function(req, res) {

        //req.originalUrl

        var users;

        var usersFilter = {
            status: {
                [Sequelize.Op.ne]: 'DELETED'
            }
        };

        if(req.query.branch && req.query.branch.trim() != '' && req.query.branch.trim().toUpperCase() != 'ALL'){
            usersFilter.branch_id = req.query.branch.trim();
        }

        if(req.query.userRole && req.query.userRole.trim() != '' && req.query.userRole.trim().toUpperCase() != 'ALL'){
            usersFilter.user_role = req.query.userRole.trim();
        }

        if(req.query.searchKeyword && req.query.searchKeyword.trim() != ''){
            usersFilter[Sequelize.Op.or] = [
                {login_id: 
                    {[Sequelize.Op.like]: '%' + req.query.searchKeyword + '%'}
                },
                {first_name: 
                    {[Sequelize.Op.like]: '%' + req.query.searchKeyword + '%'}
                },
                {last_name: {[Sequelize.Op.like]: '%' + req.query.searchKeyword + '%'}}
            ]
        }

        User.findAll({
            where: usersFilter,
            include: [
                {
                    model: Branch,
                    as: 'branch',
                    required: false
                }
            ],
            order: [
                ['first_name', 'ASC'],
                ['last_name', 'ASC']
            ]
        }).then(function(usersData){
            users = usersData;

            return Branch.findAll({
                where: {

                }
            });
            
        })
        .then(function(branches){
            res.render('all_users', {
                userRolesDescs: {
                    SYSTEM_ADMIN: 'Administrator',
                    BRANCH_SUPERVISOR: 'Branch Supervisor',
                    BRANCH_TELLER: 'Branch Teller',
                    
                },
                userRolesCodes: {
                    'Administrator': 'SYSTEM_ADMIN',
                    'Branch Supervisor': 'BRANCH_SUPERVISOR',
                    'Branch Teller': 'BRANCH_TELLER',
                },
                users: users,
                branches: branches,
                query: req.query
            });
        });
        
    },

    newUser: function(req, res) {
        Branch.findAll({
            where: {
                status: 'ACTIVE'
            }
        }).then(function(branches){
            res.render('new_user', {
                userRolesDescs: {
                    BRANCH_TELLER: 'Branch Teller',
                    BRANCH_SUPERVISOR: 'Branch Supervisor',
                    SYSTEM_ADMIN: 'Administrator',
                    
                },
                userRolesCodes: {
                    'Administrator': 'SYSTEM_ADMIN',
                    'Branch Supervisor': 'BRANCH_SUPERVISOR',
                    'Branch Teller': 'BRANCH_TELLER',
                },
                branches: branches,
                oldInput: req.oldInput
            });
        });
    },

    createUser: function(req, res) {
        var errors = false;
        
        var loginId = req.body.loginId + '';
        var firstName = req.body.firstName + '';
        var lastName = req.body.lastName + '';
        var userRole = req.body.userRole + '';
        var branch = req.body.branch + '';
        var password = req.body.password + '';
        var confirmPassword = req.body.confirmPassword + '';
        var changePasswordAtLogon = req.body.changePasswordAtLogon ? Number.parseInt(req.body.changePasswordAtLogon) + '' : 0;

        ///validations
        if(loginId == ''){
            req.oldInput.setError('loginId', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(loginId)){
            req.oldInput.setError('loginId', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(firstName == ''){
            req.oldInput.setError('firstName', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(firstName)){
            req.oldInput.setError('firstName', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(lastName == ''){
            req.oldInput.setError('lastName', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(lastName)){
            req.oldInput.setError('lastName', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(password == ''){
            req.oldInput.setError('password', 'This is a required field!');
            errors = true;
        }else if(password.length < 6){
            req.oldInput.setError('password', 'Password must be at least 6 characters long!');
            errors = true;
        }

        if(confirmPassword == ''){
            req.oldInput.setError('confirmPassword', 'This is a required field!');
            errors = true;
        }else if(password != confirmPassword){
            req.oldInput.setError('confirmPassword', 'Passwords do not match!');
            errors = true;
        }

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        // validate login id
        User.findOne({
            where: {
                login_id: loginId
            }
        })
        .then(function(user){
            if(user){
                req.flash('error', 'The user ID ' + loginId + ' has been used before. Please use a different one!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            return bcrypt.hash(password, 10);
        })
        .then(function(hash){
            return User.create({
                login_password: hash,
                branch_id: userRole != 'SYSTEM_ADMIN' ? branch : '',
                user_role: userRole,
                login_id: loginId,
                screen_name: firstName + ' ' + lastName,
                first_name: firstName,
                last_name: lastName,
                changed_one_time_password: (changePasswordAtLogon == 1 ? 0 : 1),
                created_by: res.locals.authUser.id,
                status: 'ACTIVE'
            });
        })
        .then(function(newUser){
            req.flash('success', 'The user ' + newUser.screen_name + ' has been created successfully!');
            res.redirect('/users');
        });

    },

    disableUser: function(req, res){
        var user;
        User.findById(req.params.userId)
        .then(function(userData){
            user = userData;
            return User.findOne({
                where: {
                    status: 'ACTIVE',
                    user_role: 'SYSTEM_ADMIN',
                    id: {
                        [Sequelize.Op.ne]: req.params.userId
                    }
                }
            });
        })
        .then(function(foundSysAdmin){
            if(!foundSysAdmin && user.user_role == 'SYSTEM_ADMIN'){
                req.flash('error', 'This user account cannot be disabled because it\'s the only active administrator account on the system');
                res.redirect('/users');
                return Promise.reject('PromiseBreak');
            }

            user.status = 'DISABLED';
            return user.save();
        })
        .then(function(updatedUser){
            req.flash('success', 'The user ' + updatedUser.screen_name + ' has been disabled successfully!');
            res.redirect('/users');
        });
    },

    enableUser: function(req, res){
        User.findById(req.params.userId)
        .then(function(user){
            user.status = 'ACTIVE';
            return user.save();
        })
        .then(function(updatedUser){
            req.flash('success', 'The user ' + updatedUser.screen_name + ' has been enabled successfully!');
            res.redirect('/users');
        });
    },

    confirmUserDelete: function(req, res){
        User.findById(req.params.userId)
        .then(function(user){
            if(!user){
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            if(user.id == res.locals.authUser.id){
                var confirmationMessage = 'You are about to delete your own account. Your access to the system will be revoked, ' + 
                    'and you cannot use this account or the user ID ever again.';
            }else{
                var confirmationMessage = 'By delete this account, the user "' + user.screen_name + '" will lose access to the system,' + 
                    ' and they cannot use this account or the user ID ever again.';
            }

            res.render('user_deletion_confirm', {
                userId: req.params.userId,
                confirmationMessage: confirmationMessage
            });
        });
    },

    deleteUser: function(req, res){
        var user;
        User.findById(req.params.userId)
        .then(function(userData){
            user = userData;
            return User.findOne({
                where: {
                    status: 'ACTIVE',
                    user_role: 'SYSTEM_ADMIN',
                    id: {
                        [Sequelize.Op.ne]: req.params.userId
                    }
                }
            });
        })
        .then(function(foundSysAdmin){
            if(!foundSysAdmin && user.user_role == 'SYSTEM_ADMIN'){
                req.flash('error', 'This user account cannot be deleted because it\'s the only active administrator account on the system');
                res.redirect('/users');
                return Promise.reject('PromiseBreak');
            }

            user.status = 'DELETED';
            return user.save();
        })
        .then(function(updatedUser){
            if(updatedUser.id == res.locals.authUser.id){
                res.redirect('/logout');
            }else{
                req.flash('success', 'The user ' + updatedUser.screen_name + ' has been deleted successfully!');
                res.redirect('/users');
            }
        });
    },

    changeUserPassword: function(req, res){
        User.findById(req.params.userId)
        .then(function(user){
            if(!user){

            }

            res.render('change_user_password', {
                user: user,
                oldInput: req.oldInput
            });


        });
    },

    updateUserPassword: function(req, res){
        var errors = false;

        var password = req.body.password + '';
        var confirmPassword = req.body.confirmPassword + '';
        var changePasswordAtLogon = req.body.changePasswordAtLogon ? Number.parseInt(req.body.changePasswordAtLogon) + '' : 0;

        if(password == ''){
            req.oldInput.setError('password', 'This is a required field!');
            errors = true;
        }else if(password.length < 6){
            req.oldInput.setError('password', 'Password must be at least 6 characters long!');
            errors = true;
        }

        if(confirmPassword == ''){
            req.oldInput.setError('confirmPassword', 'This is a required field!');
            errors = true;
        }else if(password != confirmPassword){
            req.oldInput.setError('confirmPassword', 'Passwords do not match!');
            errors = true;
        }

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        var userInEdit;

        User.findById(req.params.userId)
        .then(function(userDetails){
            if(!userDetails){
                req.flash('error', 'Data error, could not find user!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            userInEdit = userDetails;

            return bcrypt.hash(password, 10);
        })
        .then(function(hash){
            userInEdit.login_password = hash;
            userInEdit.changed_one_time_password = (changePasswordAtLogon == 1 ? 0 : 1);

            return userInEdit.save();
        })
        .then(function(updatedUser){
            req.flash('success', 'Password for ' + updatedUser.screen_name + ' has been updated successfully!');
            res.redirect('/users');
        });
    },

    changeMyPassword: function(req, res){
        res.render('change_my_password', {
            oldInput: req.oldInput
        });
    },

    updateMyPassword: function(req, res){
        var errors = false;

        var currentPassword = req.body.currentPassword + '';
        var password = req.body.password + '';
        var confirmPassword = req.body.confirmPassword + '';

        if(currentPassword == ''){
            req.oldInput.setError('currentPassword', 'This is a required field!');
            errors = true;
        }

        if(password == ''){
            req.oldInput.setError('password', 'This is a required field!');
            errors = true;
        }else if(password.length < 6){
            req.oldInput.setError('password', 'Password must be at least 6 characters long!');
            errors = true;
        }

        if(confirmPassword == ''){
            req.oldInput.setError('confirmPassword', 'This is a required field!');
            errors = true;
        }else if(password != confirmPassword){
            req.oldInput.setError('confirmPassword', 'Passwords do not match!');
            errors = true;
        }

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        bcrypt.compare(currentPassword, res.locals.authUser.login_password)
        .then(function(result){
            if (result !== true) {
                req.flash('error', 'There were some errors with the data that your submitted!');
                req.oldInput.setError('currentPassword', 'Incorrect password!');
                res.redirect('back');

                return Promise.reject('PromiseBreak');
            }

            return bcrypt.hash(password, 10);
        })
        .then(function(hash){
            res.locals.authUser.login_password = hash;
            res.locals.authUser.changed_one_time_password = 1;

            return res.locals.authUser.save();
        })
        .then(function(updatedUser){
            req.flash('myPasswordChangeSuccess', 'Your password has been updated successfully!');
            res.redirect('back');
        });
    },

    editUser: function(req, res){
        var userInEdit;

        User.findById(req.params.userId)
        .then(function(userDetails){
            if(!userDetails){
                req.flash('error', 'Data error. Could not find user!');
                res.redirect('/users');
                return Promise.reject('PromiseBreak');
            }

            userInEdit = userDetails;

            return Branch.findAll({
                where: {
                    status: 'ACTIVE'
                }
            });
        })
        .then(function(branches){
            var activeUserFirstName = req.oldInput.value('firstName') ? req.oldInput.value('firstName') : userInEdit.first_name;
            var activeUserLastName = req.oldInput.value('lastName') ? req.oldInput.value('lastName') : userInEdit.last_name;
            var activeUserRole = req.oldInput.value('userRole') ? req.oldInput.value('userRole') : userInEdit.user_role;
            var activeUserBranch = req.oldInput.value('branch') ? req.oldInput.value('branch') : userInEdit.branch_id;

            res.render('edit_user', {
                userRolesDescs: {
                    BRANCH_TELLER: 'Branch Teller',
                    BRANCH_SUPERVISOR: 'Branch Supervisor',
                    SYSTEM_ADMIN: 'Administrator',
                },
                userRolesCodes: {
                    'Administrator': 'SYSTEM_ADMIN',
                    'Branch Supervisor': 'BRANCH_SUPERVISOR',
                    'Branch Teller': 'BRANCH_TELLER',
                },
                branches: branches,
                user: userInEdit,
                oldInput: req.oldInput,
                activeUserFirstName: activeUserFirstName,
                activeUserLastName: activeUserLastName,
                activeUserRole: activeUserRole,
                activeUserBranch: activeUserBranch
            });
        });
    },

    updateUser: function(req, res){
        var errors = false;
        
        var firstName = req.body.firstName + '';
        var lastName = req.body.lastName + '';
        var userRole = req.body.userRole + '';
        var branch = req.body.branch + '';

        ///validations

        if(firstName == ''){
            req.oldInput.setError('firstName', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(firstName)){
            req.oldInput.setError('firstName', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(lastName == ''){
            req.oldInput.setError('lastName', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(lastName)){
            req.oldInput.setError('lastName', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }
        
        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        // validate login id
        User.findById(req.params.userId)
        .then(function(userInEdit){
            if(!userInEdit){
                req.flash('error', 'Data error. Could not find user!');
                res.redirect('/users');
                return Promise.reject('PromiseBreak');
            }

            userInEdit.branch_id = userRole != 'SYSTEM_ADMIN' ? branch : '';
            userInEdit.user_role = userRole;
            userInEdit.screen_name = firstName + ' ' + lastName;
            userInEdit.first_name = firstName;
            userInEdit.last_name = lastName;

            return userInEdit.save();
        })
        .then(function(updatedUser){
            req.flash('success', 'The user ' + updatedUser.screen_name + ' has been updated successfully!');
            res.redirect('/users');
        });
    },

};
