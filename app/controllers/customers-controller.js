var moment = require('moment');
var validator = require('validator');
var multer  = require('multer');
var fs = require('fs');
var path = require('path');

var User = require('../models').User;
var Customer = require('../models').Customer;
var CustomerDocumentRequirement = require('../models').CustomerDocumentRequirement;
var CustomerDocument = require('../models').CustomerDocument;
 


module.exports = {
    createCustomerIndex: function(req, res) {

        CustomerDocumentRequirement.findAll()
        .then(function(documentRequirements){
            res.render('new_loan_customer', {
                documentRequirements: documentRequirements,
                idType: req.params.idType,
                idNumber: req.params.idNumber,
                oldInput: req.oldInput,
            });
        });
        
    },

    createCustomer: function(req, res) {
        
        CustomerDocumentRequirement.findAll()
        .then(function(documentRequirements){
            var errors = false;
            
            var idType = req.body.idType + '';
            var idNumber = req.body.idNumber + '';
            var firstName = req.body.firstName + '';
            var middleName = req.body.middleName + '';
            var lastName = req.body.lastName + '';
            var companyName = req.body.companyName + '';
            var email1 = req.body.email1 + '';
            var mobile1 = req.body.mobile1 + '';
            var addressLine1 = req.body.addressLine1 + '';
            var submittedDocumentCodes = {};

            if(req.files){
                req.files.forEach(function(submittedDocument){
                    submittedDocumentCodes[submittedDocument.fieldname] = submittedDocument.fieldname;
                });
            }
    
            ///validations
            if(firstName == ''){
                req.oldInput.setError('firstName', 'This is a required field!');
                errors = true;
            }else if(!validator.isAlphanumeric(firstName)){
                req.oldInput.setError('firstName', 'Only alpha-numberic characters are allowed!');
                errors = true;
            }
    
            if(middleName != ''){
                if(!validator.isAlphanumeric(middleName)){
                    req.oldInput.setError('middleName', 'Only alpha-numberic characters are allowed!');
                    errors = true;
                }
            }
    
            if(lastName == ''){
                req.oldInput.setError('lastName', 'This is a required field!');
                errors = true;
            }else if(!validator.isAlphanumeric(lastName)){
                req.oldInput.setError('lastName', 'Only alpha-numberic characters are allowed!');
                errors = true;
            }
    
            if(mobile1 == ''){
                req.oldInput.setError('mobile1', 'This is a required field!');
                errors = true;
            }else if(!validator.isNumeric(mobile1)){
                req.oldInput.setError('mobile1', 'Invalid number!');
                errors = true;
            }
    
            if(email1 != ''){
                if(!validator.isEmail(email1)){
                    req.oldInput.setError('email1', 'Invalid email address!');
                    errors = true;
                }
            }
    
            if(companyName == ''){
                req.oldInput.setError('companyName', 'This is a required field!');
                errors = true;
            }
    
            if(addressLine1 == ''){
                req.oldInput.setError('addressLine1', 'This is a required field!');
                errors = true;
            }

            documentRequirements.forEach(function(documentRequirement){
                if(Number.parseInt(documentRequirement.is_required) == 1 && !(documentRequirement.document_code in submittedDocumentCodes)){
                    req.oldInput.setError(documentRequirement.document_code, 'This document is mandatory!');
                    errors = true;
                }
            });
    
            if(errors){
                req.flash('error', 'There were some errors with the data that your submitted!');
                return res.redirect('back');
            }
    
            // validate ID Number
            Customer.findOne({
                where: {
                    id_type: idType,
                    id_number: idNumber
                }
            })
            .then(function(existingCustomer){
                if(existingCustomer){
                    req.flash('error', "A customer with ID Number'" + idNumber + "' already exists!");
                    return res.redirect('back');
                }

                // customer data
                var newCustomerData = {
                    id_type: idType,
                    id_number: idNumber,
                    first_name: firstName,
                    middle_name: middleName,
                    last_name: lastName,
                    company_name: companyName,
                    mobile1: mobile1,
                    email1: email1,
                    address_line1: addressLine1,
                    branch_id: res.locals.authUser.branch_id,
                    created_by: res.locals.authUser.id,
                    documents: []
                };

                if(req.files){
                    req.files.forEach(function(documentFile){
                        newCustomerData.documents.push({
                            document_code: documentFile.fieldname,
                            document_file_name: documentFile.filename + path.extname(documentFile.originalname),
                            document_file_extension: path.extname(documentFile.originalname),
                            document_mime_type: documentFile.mimetype,
                            document_file_size: documentFile.size,
                        });
                    });
                }
    
                return Customer.create(newCustomerData, {
                    include:[{
                        model: CustomerDocument,
                        as: 'documents'
                    }]
                });
            })
            //save
            .then(function(createdCustomer){
                
                if(req.files){
                    var customerDir = './public/files/customer-documents/' + createdCustomer.id + '/'
                    if (!fs.existsSync(customerDir)){
                        fs.mkdirSync(customerDir);
                    }

                    req.files.forEach(function(documentFile){
                        fs.copyFile(documentFile.path, customerDir + documentFile.filename + path.extname(documentFile.originalname), function(err){
                            if(err){
                                throw new Error(err);
                            }
                        });
                    });
                }

                res.redirect('/customer-loans/open-new-loan/' + createdCustomer.id);
            }).catch(function(err){
                if(typeof err === 'string' && err === 'PromiseBreak'){
                    return;
                }

                req.flash('error', 'An error occurred while processing your request. [' + err + ']');
                res.redirect('back');
                return;
            });

        });

        
    },

};
