
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

        var filters = {
            status: {
                [Sequelize.Op.ne]: 'DELETED'
            }
        };

        Branch.findAll({
            where: filters,
            order: [
                ['branch_name', 'ASC'],
            ]
        }).then(function(branches){
            res.render('all_branches', {
                branches: branches
            });
        });
        
    },

    newBranch: function(req, res) {
        res.render('new_branch', {
            oldInput: req.oldInput
        });
    },

    createBranch: function(req, res) {
        var errors = false;
        
        var branchCode = req.body.branchCode + '';
        var branchName = req.body.branchName + '';

        ///validations
        if(branchCode == ''){
            req.oldInput.setError('branchCode', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(branchCode)){
            req.oldInput.setError('branchCode', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(branchName == ''){
            req.oldInput.setError('branchName', 'This is a required field!');
            errors = true;
        }


        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        // validate branch code
        Branch.findOne({
            where: {
                branch_code: branchCode
            }
        })
        .then(function(branch){
            if(branch){
                req.flash('error', 'The branch code ' + branchCode + ' already exists!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            return Branch.create({
                branch_code: branchCode,
                branch_name: branchName,
                status: 'ACTIVE'
            });
        })
        .then(function(newBranch){
            req.flash('success', 'Branch \'(' + newBranch.branch_code + ')\' ' + newBranch.branch_name + ' has been created successfully!');
            res.redirect('/branches');
        });

    },

    editBranch: function(req, res){
        Branch.findById(req.params.branchId)
        .then(function(branch){
            res.render('edit_branch', {
                branch: branch,
                oldInput: req.oldInput
            });
        });
    },

    updateBranch: function(req, res){
        var errors = false;
        
        var branchCode = req.body.branchCode + '';
        var branchName = req.body.branchName + '';

        ///validations
        if(branchCode == ''){
            req.oldInput.setError('branchCode', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(branchCode)){
            req.oldInput.setError('branchCode', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(branchName == ''){
            req.oldInput.setError('branchName', 'This is a required field!');
            errors = true;
        }


        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        var branchInEdit;

        // validate branch code
        Branch.findById(req.params.branchId)
        .then(function(branchDetails){
            if(!branchDetails){
                req.flash('error', 'Data error, could not find branch!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            branchInEdit = branchDetails;

            return Branch.findOne({
                where: {
                    branch_code: branchCode,
                    id: {
                        [Sequelize.Op.ne]: branchInEdit.id
                    }
                }
            });
        })
        .then(function(existingBranch){
            if(existingBranch){
                req.flash('error', 'The branch code ' + branchCode + ' already exists!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            branchInEdit.branch_code = branchCode;
            branchInEdit.branch_name = branchName;

            return branchInEdit.save();
        })
        .then(function(updatedBranch){
            req.flash('success', 'Branch \'(' + updatedBranch.branch_code + ')\' ' + updatedBranch.branch_name + ' has been created successfully!');
            res.redirect('/branches');
        });
    },

};
