
var moment = require('moment');
var randomColor = require('randomcolor');
var uuidv1 = require('uuid/v1');
var uuidv5 = require('uuid/v5');
var validator = require('validator');
var helpers = require('../common/helpers');

var Sequelize = require('../models').Sequelize;
var sequelize = require('../models').sequelize;

var User = require('../models').User;
var Customer = require('../models').Customer;
var CustomerDocument = require('../models').CustomerDocument; 
var CustomerDocumentRequirement = require('../models').CustomerDocumentRequirement;
var CustomerLoan = require('../models').CustomerLoan;
var CustomerLoanInvestment = require('../models').CustomerLoanInvestment;
var AuthWorkflow = require('../models').AuthWorkflow;

module.exports = {
    newLoanIndex: function(req, res) {
        res.render('new_loan_customer_id', {
            oldInput: req.oldInput
        });
    },

    validateNewLoanCustomerIdNumber: function(req, res) {
        var errors = false;

        var idNumber = req.body.idNumber.trim();
        var idType = req.body.idType.trim();

        if(idNumber == ''){
            req.oldInput.setError('idNumber', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(idNumber)){
            req.oldInput.setError('idNumber', 'Only alpha-numberic characters are allowed!');
            errors = true;
        }

        if(idType == ''){
            req.oldInput.setError('idType', 'This is a required field!');
            errors = true;
        }

        //validate if the customer has an active/pending loan already
        

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        //
        var customer = null;

        User.findAll({
            where: {
                user_role: 'BRANCH_SUPERVISOR',
                status: 'ACTIVE',
            }
        })
        .then(function(authorizers){
            
            if(authorizers.length == 0){
                req.flash('warning', 'Unfortunately, there are currently no authorizers existing on the system!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            return Customer.findOne({
                where: {
                    id_number: idNumber,
                    id_type: idType
                }
            });
        })
        .then(function(customerDetails){
            if(!customerDetails){
                res.redirect('/customers/' + idType + '-' + idNumber + '/create-customer');
                return Promise.reject('PromiseBreak');
            }

            customer = customerDetails;
            
            return customer.getLoans({
                where: { 
                    loan_status: {
                        [Sequelize.Op.ne]: 'CLOSED'
                    }
                }
            });
            
        })
        .then(function(customerLoans){
            if(customerLoans && customerLoans.length > 0){
                res.redirect('/customer-loans/open-new-loan/' + customer.id + '/active-loan');
                return Promise.reject('PromiseBreak');
            }

            res.redirect('/customer-loans/open-new-loan/' + customer.id);
            return Promise.reject('PromiseBreak');
        })
        .catch(function(err){
            if(typeof err === 'string' && err === 'PromiseBreak'){
                return;
            }

            req.flash('error', 'An internal error occurred while processing your request. [' + err + ']');
            res.redirect('back');
        });
    },

    activeCustomerLoan: function(req, res) {
        var customer;
        var activeLoan;
        var loanInvestments = [];
        Customer.findById(req.params.customerId, {
            include: [{
                model: CustomerLoan,
                as: 'loans',
                where: { 
                    loan_status: {
                        [Sequelize.Op.ne]: 'CLOSED'
                    }
                },
                include: [{
                    model: User,
                    as: 'creator',
                }]
            },
            {
                model: CustomerDocument,
                as: 'documents'
            }]
        })
        .then(function(customerDetails){
            customer = customerDetails;

            if(customerDetails.loans.length == 0){
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            activeLoan = customerDetails.loans[0];

            return activeLoan.getInvestments({
                order: [
                    ['investment_date', 'DESC']
                ]
            });

        })
        .then(function(investments){

            investments.forEach(function(investment){
                loanInvestments.push({
                    investment_date: moment(investment.investment_date).format('DD-MMM-YYYY'),
                    investment_amount: helpers.addCommaSeperators(Number.parseFloat(investment.investment_amount).toFixed(2)),
                    interest_rate: Number.parseFloat(investment.interest_rate).toFixed(2),
                    interest_amount: helpers.addCommaSeperators(Number.parseFloat(investment.interest_amount).toFixed(2)),
                    total_amount: helpers.addCommaSeperators(Number.parseFloat(investment.total_amount).toFixed(2)),
                    payment_amount: helpers.addCommaSeperators(Number.parseFloat(investment.payment_amount).toFixed(2)),
                    investment_duration: investment.investment_duration,
                    repayment_date: moment(investment.repayment_date).format('DD-MMM-YYYY'),
                    payment_status: investment.payment_status,
                });
            });

            var documentPromises = [];
            
            customer.documents.forEach(function(customerDocument){
                var promise = customerDocument.getDocument()
                .then(function(document){
                    return new Promise(function(resolve, reject){
                        return resolve({
                            document_file_name: customerDocument.document_file_name,
                            document_file_extension: customerDocument.document_file_extension,
                            document_mime_type: customerDocument.document_mime_type,
                            document_file_size: customerDocument.document_file_size,
                            document_code: document.document_code,
                            document_name: document.document_name,
                        });
                    });
                });

                documentPromises.push(promise);
            });

            return Promise.all(documentPromises);
        })
        .then(function(documents){
            
            res.render('active_customer_loan', {
                customer: customer,
                documents: documents,
                loanStatuses: {
                    PENDING_AUTH: 'Pending Authorization',
                    DECLINED: 'Declined',
                    OPEN: 'Open',
                    CLOSED: 'Closed',
                },
                activeLoan: {
                    id: activeLoan.id,
                    loan_reference_number: activeLoan.loan_reference_number,
                    loan_type: activeLoan.loan_type,
                    customer_id: activeLoan.customer_id,
                    customer_bank_account_number: activeLoan.customer_bank_account_number,
                    customer_bank_account_sort_code: activeLoan.customer_bank_account_sort_code,
                    opening_date: moment(activeLoan.opening_date).format('DD-MMM-YYYY HH:mm:ss'),
                    creator: activeLoan.creator,
                    loan_status: activeLoan.loan_status,
                    
                },
                loanInvestments: loanInvestments
            });
        })
        .catch(function(err){
            console.log(err);
            return res.send(err.message);
        });
        
    },

    newLoanDetailsIndex: function(req, res) {
        Customer.findById(req.params.customerId)
        .then(function(customer){
            if(!customer){
                res.redirect('/customer-loans/open-new-loan');
                return Promise.reject('PromiseBreak');
            }

            res.render('new_loan_details', {
                customer: customer,
                idTypes: {
                    NATIONAL_ID: 'National ID',
                    PASSPORT: 'Passport',
                    DRIVERS_LICENSE: 'Drivers License'
                },
                currentDate: moment().format('DD-MMM-YYYY'),
                oldInput: req.oldInput
            });
        });
    },

    newLoanInitForAuth: function(req, res) {
        var errors = false;
        
        var bankAccountSortCode = req.body.bankAccountSortCode + '' .trim();
        var bankAccountNumber = req.body.bankAccountNumber + '' .trim();
        var loanType = req.body.loanType + '' .trim();
        var loanAmount = req.body.loanAmount + '' .trim();
        var loanDuration = req.body.loanDuration + '' .trim();
        var interestRate = req.body.interestRate + '' .trim();
        var repaymentDate = req.body.repaymentDate + '' .trim();

        if(bankAccountSortCode == ''){
            req.oldInput.setError('bankAccountSortCode', 'This is a required field!');
            errors = true;
        }else if(!validator.isNumeric(bankAccountSortCode)){
            req.oldInput.setError('bankAccountSortCode', 'Only numeric characters allowed!');
            errors = true;
        }

        if(bankAccountNumber == ''){
            req.oldInput.setError('bankAccountNumber', 'This is a required field!');
            errors = true;
        }else if(!validator.isAlphanumeric(bankAccountNumber)){
            req.oldInput.setError('bankAccountNumber', 'Only alpha-numeric characters allowed!');
            errors = true;
        }

        if(loanType == ''){
            req.oldInput.setError('loanType', 'This is a required field!');
            errors = true;
        }
        
        if(loanAmount == ''){
            req.oldInput.setError('loanAmount', 'This is a required field!');
            errors = true;
        }else if(!validator.isFloat(loanAmount)){
            req.oldInput.setError('loanAmount', 'Invalid amount!');
            errors = true;
        }

        if(loanDuration == ''){
            req.oldInput.setError('loanDuration', 'This is a required field!');
            errors = true;
        }else if(!validator.isInt(loanDuration)){
            req.oldInput.setError('loanDuration', 'Invalid value!');
            errors = true;
        }

        if(interestRate == ''){
            req.oldInput.setError('interestRate', 'This is a required field!');
            errors = true;
        }else if(!validator.isFloat(interestRate)){
            req.oldInput.setError('interestRate', 'Invalid rate!');
            errors = true;
        }

        if(repaymentDate == ''){
            req.oldInput.setError('repaymentDate', 'This is a required field!');
            errors = true;
        }else if(!/^[0-9]{2}\-[A-Z]{1}[a-z]{2}\-[0-9]{4}$/.test(repaymentDate)){
            req.oldInput.setError('repaymentDate', 'Invalid date!');
            errors = true;
        }else{
            try{
                var repaymentDateMoment = moment(repaymentDate, 'DD-MMM-YYYY', true).format('YYYY-MM-DD');

                if(moment(repaymentDateMoment).isBefore(moment().format('YYYY-MM-DD'), 'day') || 
                    moment(repaymentDateMoment).isSame(moment().format('YYYY-MM-DD'), 'day')){
                    req.oldInput.setError('repaymentDate', 'Date can\'t be same or before today\'s date!');
                    errors = true;
                }else {
                    console.log('DEBUG:');
                    console.log(repaymentDateMoment);
                }
            }catch(e){
                req.oldInput.setError('repaymentDate', 'Date error [' + e.message + ']');
                errors = true;
            }
        }

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            res.redirect('back');
            return;
        }

        Customer.findById(req.params.customerId)
        .then(function(customer){
            if(!customer){
                req.flash('error', 'A data error occurred. Could not find customer!');
                res.redirect('/customer-loans/open-new-loan');
                return Promise.reject('PromiseBreak');
            }

            req.session.newCustomerLoan = req.body;
    
            res.redirect("/customer-loans/open-new-loan/" + req.params.customerId + "/select-authorizer");
        });
        
    },

    newLoanAuthSelectIndex: function(req, res) {
        var customer;
        Customer.findById(req.params.customerId)
        .then(function(foundCustomer){
            if(!foundCustomer){
                res.redirect('/customer-loans/open-new-loan');
                return Promise.reject('PromiseBreak');
            }

            customer = foundCustomer;

            return User.findAll({
                where: {
                    user_role: 'BRANCH_SUPERVISOR',
                    status: 'ACTIVE',
                    branch_id: res.locals.authUser.branch_id
                }
            });
        })
        .then(function(authorizers){
            if(authorizers.length == 0){
                req.flash('error', 'There are currently no authorizers in your branch!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            res.render('new_loan_authorizer_selection', {
                customer: customer,
                authorizers: authorizers,
                oldInput: req.oldInput
            });
        });
        
        
        
    },

    newLoanSendForAuth: function(req, res) {
        if(!req.body.authorizer || req.body.authorizer.trim() == ''){
            req.flash('error', 'No authorizer selected!');
            return res.redirect('back');
        }

        var customer;
        Customer.findById(req.params.customerId)
        .then(function(customerDetails){
            if(!customerDetails){
                res.redirect('/customer-loans/open-new-loan');
                return Promise.reject('PromiseBreak');
            }

            customer = customerDetails;

            return helpers.generateLoanNumber(res.locals.authUser.branch_id);

        })
        .then(function(loanNumber){
            sequelize.transaction(function (t) {
                
                var idNumber = customer.id_number + '' .trim();
                var bankAccountSortCode = req.session.newCustomerLoan.bankAccountSortCode + '' .trim();
                var bankAccountNumber = req.session.newCustomerLoan.bankAccountNumber + '' .trim();
                var loanType = req.session.newCustomerLoan.loanType + '' .trim();
                var loanAmount = req.session.newCustomerLoan.loanAmount + '' .trim();
                var loanDuration = req.session.newCustomerLoan.loanDuration + '' .trim();
                var interestRate = req.session.newCustomerLoan.interestRate + '' .trim();
                var repaymentDate = moment(req.session.newCustomerLoan.repaymentDate + '' .trim(), 'DD-MMM-YYYY', true).format('YYYY-MM-DD');
                
                return CustomerLoan.create({
                    loan_reference_number: loanNumber,
                    loan_type: loanType,
                    customer_id: customer.id,
                    customer_bank_account_number: bankAccountNumber,
                    customer_bank_account_sort_code: bankAccountSortCode,
                    opening_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    customer_bank_account_sort_code: bankAccountSortCode,
                    opening_user_id: res.locals.authUser.id,
                    branch_id: res.locals.authUser.branch_id,
                    loan_status: 'PENDING_AUTH',
                    investments: [
                        {
                            customer_id: customer.id,
                            investment_reference_number: uuidv5(idNumber, uuidv1()),
                            investment_amount: loanAmount,
                            interest_rate: interestRate,
                            interest_amount: Number.parseFloat(loanAmount) * Number.parseFloat((interestRate/100)),
                            total_amount: Number.parseFloat(loanAmount) + (Number.parseFloat(loanAmount) * Number.parseFloat(interestRate/100)),
                            interest_maturity_date: moment().format('YYYY-MM-DD'),
                            investment_duration: loanDuration,
                            repayment_date: repaymentDate,
                            is_opening_investment: 'Y',
                            is_closing_investment: 'N',
                            investment_status: 'ACTIVE',
                            payment_status: 'OPEN'
                        }
                    ],
                    authorizationRequests: [
                        {
                            category: 'NEW_LOAN_OPENING',
                            source_user_id: res.locals.authUser.id,
                            target_user_id: req.body.authorizer,
                            auth_status: 'PENDING',
                        }
                    ]
                }, {
                    transaction: t,
                    include:[{
                        model: CustomerLoanInvestment,
                        as: 'investments'
                    },{
                        model: AuthWorkflow,
                        as: 'authorizationRequests'
                    }]
                });
            
            })
            .then(function (result) {
                req.flash('success', 'Your request was successful, and has been submitted for authorization!');
                res.redirect('/customer-loans/open-new-loan');
                return Promise.reject('PromiseBreak');
            })
            .catch(function (err) {
                if(typeof err === 'string' && err === 'PromiseBreak'){
                    return;
                }

                req.flash('error', 'An error occurred while processing your request. [' + err + ']');
                res.redirect('back');
            });
        })
        .catch(function (err) {
            if(typeof err === 'string' && err === 'PromiseBreak'){
                return;
            }

            req.flash('error', 'An error occurred while processing your request. [' + err + ']');
            res.redirect('back');
        });;
    },

    loanAuthorizationsIndex: function(req, res) {
        
        AuthWorkflow.findAll({
            where: {
                category: 'NEW_LOAN_OPENING',
                auth_status: 'PENDING',
                target_user_id: res.locals.authUser.id
            },
            include: [{
                model: CustomerLoan,
                as: 'loan',
                where: {
                    loan_status: 'PENDING_AUTH'
                },
                include: [{
                    model: CustomerLoanInvestment,
                    as: 'investments',
                    where: {
                        payment_status: 'OPEN'
                    }
                },{
                    model: Customer,
                    as: 'customer',
                },{
                    model: User,
                    as: 'creator',
                }]
            }],
            order: [
                ['date', 'DESC']
            ]
        }).then(function(authorizationRequests){
            var authTray = [];

            authorizationRequests.forEach(function(authorizationRequest){
                var activeInvestment = authorizationRequest.loan.investments[0];
                authTray.push({
                    customerLoan: {
                        id: authorizationRequest.loan.id,
                        loan_reference_number: authorizationRequest.loan.loan_reference_number,
                        loan_type: authorizationRequest.loan.loan_type,
                        customer_id: authorizationRequest.loan.customer_id,
                        customer_bank_account_number: authorizationRequest.loan.customer_bank_account_number,
                        customer_bank_account_sort_code: authorizationRequest.loan.customer_bank_account_sort_code,
                        opening_date: moment(authorizationRequest.loan.opening_date).format('DD-MMM-YYYY HH:mm:ss'),
                        opening_user_id: authorizationRequest.loan.opening_user_id,
                        loan_status: authorizationRequest.loan.loan_status,
                    },
                    customer: authorizationRequest.loan.customer,
                    loanCreator: authorizationRequest.loan.creator,
                    activeInvestment: {
                        investment_reference_number: activeInvestment.investment_reference_number,
                        investment_amount: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.investment_amount).toFixed(2)),
                        interest_rate: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.interest_rate).toFixed(2)),
                        interest_amount: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.interest_amount).toFixed(2)),
                        total_amount: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.total_amount).toFixed(2)),
                        interest_maturity_date: activeInvestment.interest_maturity_date,
                        investment_duration: activeInvestment.investment_duration,
                        repayment_date: activeInvestment.repayment_date,
                    },
                    authWorkflow: authorizationRequest
                });
            });

            res.render('loan_authorizations', {
                loanAuthorizationRequests: authTray,
                oldInput: req.oldInput
            });
        });
        
    },

    loanDetailsIndex: function(req, res) {

        AuthWorkflow.findById(req.params.authRequestId, {
            include: [{
                model: CustomerLoan,
                as: 'loan',
                where: {
                    loan_status: 'PENDING_AUTH'
                },
                include: [{
                    model: CustomerLoanInvestment,
                    as: 'investments',
                    where: {
                        payment_status: 'OPEN'
                    }
                },{
                    model: Customer,
                    as: 'customer',
                    include: [{
                        model: CustomerDocument,
                        as: 'documents',
                        include: [{
                            model: CustomerDocumentRequirement,
                            as: 'document',
                        }]
                    }]
                },{
                    model: User,
                    as: 'creator',
                }]
            }],
            order: [
                ['date', 'DESC']
            ]
        }).then(function(authorizationRequest){
            var activeInvestment = authorizationRequest.loan.investments[0];

            var customerDocuments = [];

            authorizationRequest.loan.customer.documents.forEach(function(customerDocument){
                customerDocuments.push({
                    document_file_name: customerDocument.document_file_name,
                    document_file_extension: customerDocument.document_file_extension,
                    document_mime_type: customerDocument.document_mime_type,
                    document_file_size: customerDocument.document_file_size,
                    document_code: customerDocument.document.document_code,
                    document_name: customerDocument.document.document_name,
                });
            });

            res.render('loan_authorization_details', {
                authorizationRequest: authorizationRequest,
                customer: authorizationRequest.loan.customer,
                customerLoan: {
                    id: authorizationRequest.loan.id,
                    loan_reference_number: authorizationRequest.loan.loan_reference_number,
                    loan_type: authorizationRequest.loan.loan_type,
                    customer_id: authorizationRequest.loan.customer_id,
                    customer_bank_account_number: authorizationRequest.loan.customer_bank_account_number,
                    customer_bank_account_sort_code: authorizationRequest.loan.customer_bank_account_sort_code,
                    opening_date: moment(authorizationRequest.loan.opening_date).format('DD-MMM-YYYY HH:mm:ss'),
                    opening_user_id: authorizationRequest.loan.opening_user_id,
                    loan_status: authorizationRequest.loan.loan_status,
                },
                activeInvestment: {
                    investment_reference_number: activeInvestment.investment_reference_number,
                    investment_amount: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.investment_amount).toFixed(2)),
                    interest_rate: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.interest_rate).toFixed(2)),
                    interest_amount: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.interest_amount).toFixed(2)),
                    total_amount: helpers.addCommaSeperators(Number.parseFloat(activeInvestment.total_amount).toFixed(2)),
                    interest_maturity_date: activeInvestment.interest_maturity_date,
                    investment_duration: activeInvestment.investment_duration,
                    repayment_date: moment(activeInvestment.repayment_date).format('DD-MMM-YYYY'),
                },
                loanCreator: authorizationRequest.loan.creator,
                documents: customerDocuments
            });
        });

        
        
    },

    loanAuthConfirmIndex: function(req, res) {
        res.render('loan_authorization_confirm', {
            authRequestId: req.params.authRequestId
        });
        
    },

    loanAuth: function(req, res) {
        var authorizationRequest;
        AuthWorkflow.findById(req.params.authRequestId, {
            include: [{
                model: CustomerLoan,
                as: 'loan',
                where: {
                    loan_status: 'PENDING_AUTH'
                },
                include: [{
                    model: CustomerLoanInvestment,
                    as: 'investments',
                    where: {
                        payment_status: 'OPEN'
                    }
                },{
                    model: Customer,
                    as: 'customer',
                    include: [{
                        model: CustomerDocument,
                        as: 'documents',
                        include: [{
                            model: CustomerDocumentRequirement,
                            as: 'document',
                        }]
                    }]
                },{
                    model: User,
                    as: 'creator',
                }]
            }],
            order: [
                ['date', 'DESC']
            ]
        }).then(function(authorizationRequestDetails){
            authorizationRequest = authorizationRequestDetails;

            return sequelize.transaction(function (transaction) {
                authorizationRequest.auth_status = 'AUTHORIZED';
                authorizationRequest.auth_action_date = moment().format('YYYY-MM-DD HH:mm:ss');
                
                return authorizationRequest.save({
                    transaction: transaction
                }).then(function(updatedAuthorizationRequest){
                    authorizationRequest.loan.loan_status = 'OPEN';
                    
                    return authorizationRequest.loan.save({
                        transaction: transaction
                    });
                });
            });
        }).then(function(result){
            req.flash('success', 'You have successfully authorized loan number ' + authorizationRequest.loan.loan_reference_number + '!');
            res.redirect('/customer-loans/loan-authorizations');
        }).catch(function(err){
            if(typeof err === 'string' && err === 'PromiseBreak'){
                return;
            }

            if(!authorizationRequest){
                return res.send('ERROR: ' + err);
            }

            req.flash('error', 'Sorry an error occurred. [' + err + ']');
            res.redirect('/customer-loans/loan-authorizations/' + authorizationRequest.id + '/details');
        });

        
        
    },

    loanDeclineCofirmIndex: function(req, res) {
        res.render('loan_authorization_decline', {
            authRequestId: req.params.authRequestId,
            oldInput: req.oldInput
        });
        
    },

    loanDecline: function(req, res) {
        if(validator.isEmpty(req.body.remarks + ''.trim())){
            req.flash('error', 'Your remarks for this action are required!');
            return res.redirect('back');
        }

        var authorizationRequest;
        
        AuthWorkflow.findById(req.params.authRequestId, {
            include: [{
                model: CustomerLoan,
                as: 'loan',
            }]
        })
        .then(function(authorizationRequestDetails){
            authorizationRequest = authorizationRequestDetails;

            if(!authorizationRequest){
                throw new Error('Data error. Authorization request not found!');
            }

            if(!authorizationRequest.loan){
                throw new Error('Data error. Authorization item not found!');
            }
            
            return sequelize.transaction(function (transaction) {

                authorizationRequest.auth_status = 'DECLINED';
                authorizationRequest.auth_action_remarks = req.body.remarks;
                authorizationRequest.auth_action_date = moment().format('YYYY-MM-DD HH:mm:ss');
                
                return authorizationRequest.save({
                    transaction: transaction
                })
                .then(function(updatedAuthorizationRequest){
                    authorizationRequest.loan.loan_status = 'DECLINED';
                    
                    return authorizationRequest.loan.save({
                        transaction: transaction
                    });
                });
                
            });
        }).then(function(result){
            req.flash('success', 'You have successfully declined loan number ' + authorizationRequest.loan.loan_reference_number + '!');
            res.redirect('/customer-loans/loan-authorizations');
        }).catch(function(err){
            if(typeof err === 'string' && err === 'PromiseBreak'){
                return;
            }

            if(!authorizationRequest){
                req.flash('error', 'Sorry an error occurred. [' + err + ']');
                return res.redirect('back');
            }

            req.flash('error', 'Sorry an error occurred. [' + err + ']');
            res.redirect('/customer-loans/loan-authorizations/' + authorizationRequest.id + '/details');
        });
        
    },
};
