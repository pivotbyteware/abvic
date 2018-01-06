
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
var CustomerLoan = require('../models').CustomerLoan;
var CustomerLoanInvestment = require('../models').CustomerLoanInvestment;
var CustomerLoanPaymentActivity = require('../models').CustomerLoanPaymentActivity;
var AuthWorkflow = require('../models').AuthWorkflow;
var SystemGlobals = require('../models').SystemGlobals; 

module.exports = {
    newPaymentIndex: function(req, res) {
        res.render('new_loan_payment_customer_id', {
            oldInput: req.oldInput
        });
    },

    validateNewLoanPaymentCustomerIdNumber: function(req, res) {
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

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        var customer;

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
                req.flash('error', 'We could not find any customer with the provided ID number!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            customer = customerDetails;

            return customer.getLoans({
                where: {
                    loan_status: 'OPEN'
                }
            });
        })
        .then(function(loans){
            if(!loans || loans.length == 0){
                req.flash('warning', 'This customer, ' + customer.first_name + ' ' + customer.middle_name + ' ' 
                    + customer.last_name + ', has no loan(s) that are unsettled or ready for payment!');
                res.redirect('back');
                return Promise.reject('PromiseBreak');
            }

            res.redirect('/customer-loans/new-payment/' + customer.id);
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

    paymentDetailsIndex: function(req, res) {
        var customer;
        var activeLoan;
        var activeLoanInvestment;
        Customer.findById(req.params.customerId)
        .then(function(customerDetails){
            if(!customerDetails){
                return res.redirect('/customer-loans/new-payment');
            }

            customer = customerDetails;

            return customer.getLoans({
                where: {
                    loan_status: 'OPEN'
                }
            });
        })
        .then(function(customerLoans){
            if(!customerLoans || customerLoans.length == 0){

            }

            activeLoan = customerLoans[0];

            return activeLoan.getInvestments({
                where: {
                    payment_status: 'OPEN'
                }
            });
        })
        .then(function(investments){
            if(!investments || investments.length == 0){

            }

            activeLoanInvestment = investments[0];

            res.render('new_loan_payment_details', {
                customer: customer,
                activeLoan: activeLoan,
                activeLoanInvestment: {
                    investment_reference_number: activeLoanInvestment.investment_reference_number,
                    investment_amount: helpers.addCommaSeperators(Number.parseFloat(activeLoanInvestment.investment_amount).toFixed(2)),
                    interest_rate: helpers.addCommaSeperators(Number.parseFloat(activeLoanInvestment.interest_rate).toFixed(2)),
                    interest_amount: helpers.addCommaSeperators(Number.parseFloat(activeLoanInvestment.interest_amount).toFixed(2)),
                    total_amount: helpers.addCommaSeperators(Number.parseFloat(activeLoanInvestment.total_amount).toFixed(2)),
                    interest_maturity_date: activeLoanInvestment.interest_maturity_date,
                    investment_duration: activeLoanInvestment.investment_duration,
                    repayment_date: moment(activeLoanInvestment.repayment_date).format('DD-MMM-YYYY'),
                },
                idTypes: {
                    NRC: 'NRC',
                    PASSPORT: 'Passport',
                    DRIVERS_LICENSE: 'Drivers License'
                },
                currentDate: moment().format('DD/MM/YYYY'),
                oldInput: req.oldInput
            });
        });
    },

    newPaymentInitForAuth: function(req, res) {
        var errors = false;
        
        var paymentType = req.body.paymentType + '' .trim();
        var paymentAmount = req.body.paymentAmount + '' .trim();

        if(paymentType == ''){
            req.oldInput.setError('paymentType', 'This is a required field!');
            errors = true;
        }
        
        if(paymentAmount == ''){
            req.oldInput.setError('paymentAmount', 'This is a required field!');
            errors = true;
        }else if(!validator.isFloat(paymentAmount)){
            req.oldInput.setError('paymentAmount', 'Invalid amount!');
            errors = true;
        }else if(Number.parseFloat(paymentAmount) == 0){
            req.oldInput.setError('paymentAmount', 'Amount cannot be zero(0)!');
            errors = true;
        }

        if(paymentType != 'CASH' && paymentType != 'DDACC'){
            req.oldInput.setError('paymentType', 'Unknown payment type!');
            errors = true;
        }

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            res.redirect('back');
            return;
        }

        ///
        paymentAmount = Number.parseFloat(paymentAmount);

        /// 
        var customer;
        var activeLoan;
        var activeLoanInvestment;

        Customer.findById(req.params.customerId)
        .then(function(customerDetails){
            if(!customerDetails){
                req.flash('error', 'A data error occurred. Could not find customer!');
                return res.redirect('/customer-loans/new-payment');
            }

            customer = customerDetails;
            
            return customer.getLoans({
                where: {
                    loan_status: 'OPEN'
                }
            });
        })
        .then(function(customerLoans){
            if(!customerLoans || customerLoans.length == 0){

            }

            activeLoan = customerLoans[0];

            return activeLoan.getInvestments({
                where: {
                    payment_status: 'OPEN'
                }
            });
        })
        .then(function(investments){
            if(!investments || investments.length == 0){

            }

            activeLoanInvestment = investments[0];

            if(Number.parseFloat(paymentAmount) > Number.parseFloat(activeLoanInvestment.total_amount)){
                req.flash('error', 'Payment amount cannot be greater than the outstanding amount of ' + 
                    Number.parseFloat(activeLoanInvestment.total_amount).toFixed(2));
                res.redirect('back');
                return;
            }

            if(paymentType == 'DDACC'){
                if(Number.parseFloat(paymentAmount) < Number.parseFloat(activeLoanInvestment.total_amount)){
                    req.flash('error', 'For DDACC payments, the outstanding amount has to be settled in full!');
                    res.redirect('back');
                    return;
                }
            }

            req.session.newLoanPayment = req.body;
            return res.redirect("/customer-loans/new-payment/" + req.params.customerId + "/select-authorizer");
        });
    },

    newPaymentAuthSelectIndex: function(req, res) {
        var customer;
        Customer.findById(req.params.customerId)
        .then(function(foundCustomer){
            if(!foundCustomer){
                return res.redirect('/customer-loans/new-payment');
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
            res.render('new_payment_authorizer_selection', {
                customer: customer,
                authorizers: authorizers,
                oldInput: req.oldInput
            });
        });
    },

    newPaymentSendForAuth: function(req, res) {
        var customer;
        var activeLoan;
        var activeLoanInvestment;
        Customer.findById(req.params.customerId)
        .then(function(customerDetails){
            if(!customerDetails){
                res.redirect('/customer-loans/new-payment');
                return Promise.reject('PromiseBreak');
            }

            customer = customerDetails;

            return customer.getLoans({
                where: {
                    loan_status: 'OPEN'
                }
            });
        })
        .then(function(customerLoans){
            if(!customerLoans || customerLoans.length == 0){

            }

            activeLoan = customerLoans[0];

            return activeLoan.getInvestments({
                where: {
                    payment_status: 'OPEN'
                }
            });
        })
        .then(function(investments){
            if(!investments || investments.length == 0){

            }

            activeLoanInvestment = investments[0];

            var paymentType = req.session.newLoanPayment.paymentType;
            var paymentAmount = Number.parseFloat(req.session.newLoanPayment.paymentAmount).toFixed(2);

            sequelize.transaction(function (t) {
                return CustomerLoanPaymentActivity.create({
                    investment_id: activeLoanInvestment.id,
                    investment_reference_number: uuidv5(activeLoanInvestment.customer_id + 
                        '-' + activeLoanInvestment.id, uuidv1()),
                    status: 'PENDING_AUTH',
                    payment_initiation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    payment_mode: paymentType,
                    payment_amount: paymentAmount,
                    payment_initiator_user_id: res.locals.authUser.id,
                    authorizationRequests: [
                        {
                            category: 'LOAN_PAYMENT',
                            source_user_id: res.locals.authUser.id,
                            target_user_id: req.body.authorizer,
                            auth_status: 'PENDING',
                        }
                    ]
                }, {
                    transaction: t,
                    include:[{
                        model: AuthWorkflow,
                        as: 'authorizationRequests'
                    }]
                });
            }).then(function (result) {
                req.flash('success', 'Your request was successful, and has been submitted for authorization!');
                res.redirect('/customer-loans/new-payment');
                return Promise.reject('PromiseBreak');
            }).catch(function (err) {
                if(typeof err === 'string' && err === 'PromiseBreak'){
                    return;
                }

                req.flash('error', 'An error occurred while processing your request. [' + err + ']');
                res.redirect('back');
            });
            

        });
    },

    paymentAuthorizationsIndex: function(req, res) {
        AuthWorkflow.findAll({
            where: {
                category: 'LOAN_PAYMENT',
                auth_status: 'PENDING',
                target_user_id: res.locals.authUser.id
            },
            include: [{
                model: CustomerLoanPaymentActivity,
                as: 'paymentActivity',
                where: {
                    status: 'PENDING_AUTH'
                },
                include: [{
                    model: CustomerLoanInvestment,
                    as: 'investment',
                    include: [{
                        model: CustomerLoan,
                        as: 'loan',
                        include: [{
                            model: Customer,
                            as: 'customer',
                        }]
                    }]
                },{
                    model: User,
                    as: 'initiator'
                }]
                
            }],
            order: [
                ['date', 'DESC']
            ]
        })
        .then(function(authorizationRequests){
            var authTray = [];

            authorizationRequests.forEach(function(authorizationRequest){
                authTray.push({
                    auth_request_id: authorizationRequest.id,
                    loan_reference_number: authorizationRequest.paymentActivity.investment.loan.loan_reference_number,
                    customer_name: authorizationRequest.paymentActivity.investment.loan.customer.first_name + ' ' + 
                        authorizationRequest.paymentActivity.investment.loan.customer.middle_name + ' ' + 
                        authorizationRequest.paymentActivity.investment.loan.customer.last_name,
                    investment_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.investment_amount).toFixed(2)),
                    interest_rate: Number.parseFloat(authorizationRequest.paymentActivity.investment.interest_rate).toFixed(2),
                    interest_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.interest_amount).toFixed(2)),
                    total_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.total_amount).toFixed(2)),
                    payment_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.payment_amount).toFixed(2)),
                    payment_initiation_date: moment(authorizationRequest.paymentActivity.payment_initiation_date).format('DD-MMM-YYYY HH:mm:ss'),
                    initiator: authorizationRequest.paymentActivity.initiator.first_name + ' ' + authorizationRequest.paymentActivity.initiator.last_name,
                    payment_mode: authorizationRequest.paymentActivity.payment_mode
                });
            });
            
            res.render('loan_payments_authorizations', {
                authorizationRequests: authTray,
                oldInput: req.oldInput
            });
        });
    },

    loanPaymentDetailsIndex: function(req, res) {
        var defaultInterestRate;
        var defaultReinvestmentMonthsCount;
        var defaultReinvestmentInterestMaturityDays;

        SystemGlobals.findById('DEFAULT_INTEREST_RATE')
        .then(function(interestRate){
            defaultInterestRate = Number.parseInt(interestRate.value);

            return SystemGlobals.findById('DEFAULT_REINVESTMENT_INTEREST_MATURITY_DAYS');
        })
        .then(function(reinvestmentInterestMaturityDays){
            defaultReinvestmentInterestMaturityDays = Number.parseInt(reinvestmentInterestMaturityDays.value);

            return SystemGlobals.findById('DEFAULT_REINVESTMENT_MONTHS_COUNTS');
        }).then(function(reinvestmentMonthsCount){
            defaultReinvestmentMonthsCount = Number.parseInt(reinvestmentMonthsCount.value);

            return AuthWorkflow.findById(req.params.authRequestId, {
                include: [{
                    model: CustomerLoanPaymentActivity,
                    as: 'paymentActivity',
                    include: [{
                        model: CustomerLoanInvestment,
                        as: 'investment',
                        include: [{
                            model: CustomerLoan,
                            as: 'loan',
                            include: [{
                                model: Customer,
                                as: 'customer',
                            },{
                                model: User,
                                as: 'creator',
                            }]
                        }]
                    },{
                        model: User,
                        as: 'initiator'
                    }]
                    
                }]
            });
        })
        .then(function(authorizationRequest){

            var balanceAmount = Number.parseFloat(authorizationRequest.paymentActivity.investment.total_amount) - Number.parseFloat(authorizationRequest.paymentActivity.payment_amount);
            var paymentRequestDetails = {
                authorizationRequest: authorizationRequest,
                paymentActivity: authorizationRequest.paymentActivity,
                customer: authorizationRequest.paymentActivity.investment.loan.customer,
                customerLoan: {
                    id: authorizationRequest.paymentActivity.investment.loan.id,
                    loan_reference_number: authorizationRequest.paymentActivity.investment.loan.loan_reference_number,
                    loan_type: authorizationRequest.paymentActivity.investment.loan.loan_type,
                    customer_id: authorizationRequest.paymentActivity.investment.loan.customer_id,
                    customer_bank_account_number: authorizationRequest.paymentActivity.investment.loan.customer_bank_account_number,
                    customer_bank_account_sort_code: authorizationRequest.paymentActivity.investment.loan.customer_bank_account_sort_code,
                    opening_date: moment(authorizationRequest.paymentActivity.investment.loan.opening_date).format('DD-MMM-YYYY HH:mm:ss'),
                    creator: authorizationRequest.paymentActivity.investment.loan.creator,
                    loan_status: authorizationRequest.paymentActivity.investment.loan.loan_status,
                },
                loanInvestment: {
                    investment_reference_number: authorizationRequest.paymentActivity.investment.investment_reference_number,
                    investment_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.investment_amount).toFixed(2)),
                    interest_rate: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.interest_rate).toFixed(2)),
                    interest_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.interest_amount).toFixed(2)),
                    total_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.investment.total_amount).toFixed(2)),
                    interest_maturity_date: authorizationRequest.paymentActivity.investment.interest_maturity_date,
                    investment_duration: authorizationRequest.paymentActivity.investment.investment_duration,
                    repayment_date: moment(authorizationRequest.paymentActivity.investment.repayment_date).format('DD-MMM-YYYY'),
                },
                payment: {
                    payment_amount: helpers.addCommaSeperators(Number.parseFloat(authorizationRequest.paymentActivity.payment_amount).toFixed(2)),
                    payment_mode: authorizationRequest.paymentActivity.payment_mode,
                    payment_initiation_date: moment(authorizationRequest.paymentActivity.payment_initiation_date).format('DD-MMM-YYYY HH:mm:ss'),
                    creator: authorizationRequest.paymentActivity.initiator,
                },

                balance: {
                    amount: helpers.addCommaSeperators(balanceAmount.toFixed(2)),
                    interest_rate: Number.parseFloat(defaultInterestRate).toFixed(2),
                    interest_amount: helpers.addCommaSeperators((Number.parseFloat(balanceAmount) * Number.parseFloat((defaultInterestRate/100))).toFixed(2)),
                    total_amount: helpers.addCommaSeperators((Number.parseFloat(balanceAmount) + (Number.parseFloat(balanceAmount) * Number.parseFloat(defaultInterestRate/100))).toFixed(2)),
                    interest_maturity_date: moment().add(defaultReinvestmentInterestMaturityDays, 'days').format('DD-MMM-YYYY'),
                    duration: defaultReinvestmentMonthsCount,
                    repayment_date: moment().add(defaultReinvestmentInterestMaturityDays, 'months').format('DD-MMM-YYYY')
                }
            };

            res.render('loan_payment_authorization_details', paymentRequestDetails);
        })
        .catch(function(err){
            res.send('ERROR: ' + err);
        });
    },
    
    loanPaymentAuthConfirmIndex: function(req, res) {
        res.render('loan_payment_authorization_confirm', {
            authRequestId: req.params.authRequestId
        });
        
    },

    loanPaymentAuth: function(req, res) {
        var authorizationRequest;
        var defaultInterestRate;
        var defaultReinvestmentMonthsCount;
        var defaultReinvestmentInterestMaturityDays;

        SystemGlobals.findById('DEFAULT_INTEREST_RATE')
        .then(function(interestRate){
            defaultInterestRate = Number.parseInt(interestRate.value);

            return SystemGlobals.findById('DEFAULT_REINVESTMENT_INTEREST_MATURITY_DAYS');
        })
        .then(function(reinvestmentInterestMaturityDays){
            defaultReinvestmentInterestMaturityDays = Number.parseInt(reinvestmentInterestMaturityDays.value);

            return SystemGlobals.findById('DEFAULT_REINVESTMENT_MONTHS_COUNTS');
        }).then(function(reinvestmentMonthsCount){
            defaultReinvestmentMonthsCount = Number.parseInt(reinvestmentMonthsCount.value);

            return AuthWorkflow.findById(req.params.authRequestId, {
                include: [{
                    model: CustomerLoanPaymentActivity,
                    as: 'paymentActivity',
                    include: [{
                        model: CustomerLoanInvestment,
                        as: 'investment',
                        include: [{
                            model: CustomerLoan,
                            as: 'loan',
                            include: [{
                                model: Customer,
                                as: 'customer',
                            },{
                                model: User,
                                as: 'creator',
                            }]
                        }]
                    },{
                        model: User,
                        as: 'initiator'
                    }]
                    
                }]
            });
        })
        .then(function(authorizationRequestDetails){
            authorizationRequest = authorizationRequestDetails;

            var balanceAmount = Number.parseFloat(authorizationRequest.paymentActivity.investment.total_amount) - Number.parseFloat(authorizationRequest.paymentActivity.payment_amount);
            
            return sequelize.transaction(function (transaction) {

                authorizationRequest.auth_status = 'AUTHORIZED';
                authorizationRequest.auth_action_date = moment().format('YYYY-MM-DD HH:mm:ss');
                
                return authorizationRequest.save({
                    transaction: transaction
                })
                .then(function(updatedAuthorizationRequest){
                    authorizationRequest.paymentActivity.status = 'AUTHORIZED';
                    authorizationRequest.paymentActivity.payment_auth_date = moment().format('YYYY-MM-DD HH:mm:ss');
                    
                    return authorizationRequest.paymentActivity.save({
                        transaction: transaction
                    });
                })
                .then(function(updatedPaymentActivity){
                    authorizationRequest.paymentActivity.investment.investment_status = 'PROCESSED';
                    authorizationRequest.paymentActivity.investment.payment_status = 'PAID';
                    authorizationRequest.paymentActivity.investment.payment_amount = authorizationRequest.paymentActivity.payment_amount;
                    authorizationRequest.paymentActivity.investment.payment_mode = authorizationRequest.paymentActivity.payment_mode;
                    authorizationRequest.paymentActivity.investment.payment_date = authorizationRequest.paymentActivity.payment_initiation_date;
                    authorizationRequest.paymentActivity.investment.payment_user_id = authorizationRequest.paymentActivity.payment_initiator_user_id;
                    authorizationRequest.paymentActivity.investment.investment_reference_number = authorizationRequest.paymentActivity.investment_reference_number;

                    if(balanceAmount <= 0){
                        authorizationRequest.paymentActivity.investment.is_full_payment = 'Y';
                        authorizationRequest.paymentActivity.investment.is_closing_investment = 'Y';
                    }else{
                        authorizationRequest.paymentActivity.investment.is_full_payment = 'N';
                        authorizationRequest.paymentActivity.investment.is_closing_investment = 'N';
                    }

                    return authorizationRequest.paymentActivity.investment.save({
                        transaction: transaction
                    });
                })
                .then(function(updatedLoanInvestment){
                    if(updatedLoanInvestment.is_full_payment == 'Y'){
                        authorizationRequest.paymentActivity.investment.loan.loan_status = 'CLOSED';

                        return authorizationRequest.paymentActivity.investment.loan.save({
                            transaction: transaction
                        });
                    }

                    return CustomerLoanInvestment.create({
                        loan_id: authorizationRequest.paymentActivity.investment.loan.id,
                        customer_id: authorizationRequest.paymentActivity.investment.loan.customer.id,
                        investment_reference_number: uuidv5(authorizationRequest.paymentActivity.investment.loan.customer.id + 
                            '-' + authorizationRequest.paymentActivity.investment.id, uuidv1()),
                        investment_amount: balanceAmount,
                        interest_rate: defaultInterestRate,
                        interest_amount: Number.parseFloat(balanceAmount) * Number.parseFloat((defaultInterestRate/100)),
                        total_amount: Number.parseFloat(balanceAmount) + (Number.parseFloat(balanceAmount) * Number.parseFloat(defaultInterestRate/100)),
                        interest_maturity_date: moment().add(defaultReinvestmentInterestMaturityDays, 'days').format('YYYY-MM-DD'),
                        investment_duration: defaultReinvestmentMonthsCount,
                        repayment_date: moment().add(defaultReinvestmentMonthsCount, 'months').format('YYYY-MM-DD'),
                        is_opening_investment: 'N',
                        is_closing_investment: 'N',
                        investment_status: 'ACTIVE',
                        payment_status: 'OPEN'
                    });

                }); 
                
            });

            
        })
        .then(function(result){
            console.log(result);
            req.flash('success', 'You have successfully authorized payment ref: ' + authorizationRequest.paymentActivity.payment_reference_number + '!');
            res.redirect('/customer-loans/payment-authorizations');
        })
        .catch(function(err){
            if(typeof err === 'string' && err === 'PromiseBreak'){
                return;
            }

            req.flash('error', 'An error occurred while processing your request. [' + err + ']');
            res.redirect('/customer-loans/payment-authorizations/' + req.params.authRequestId + '/details');
        });
    },
    
    loanPaymentDeclineCofirmIndex: function(req, res) {
        res.render('loan_payment_authorization_decline', {
            authRequestId: req.params.authRequestId,
            oldInput: req.oldInput
        });
        
    },

    loanPaymentDecline: function(req, res) {
        if(validator.isEmpty(req.body.remarks + ''.trim())){
            req.flash('error', 'Your remarks for this action are required!');
            return res.redirect('back');
        }

        var authorizationRequest;

        AuthWorkflow.findById(req.params.authRequestId, {
            include: [{
                model: CustomerLoanPaymentActivity,
                as: 'paymentActivity',
            }]
        })
        .then(function(authorizationRequestDetails){
            authorizationRequest = authorizationRequestDetails;
            
            return sequelize.transaction(function (transaction) {

                authorizationRequest.auth_status = 'DECLINED';
                authorizationRequest.auth_action_remarks = req.body.remarks;
                authorizationRequest.auth_action_date = moment().format('YYYY-MM-DD HH:mm:ss');
                
                return authorizationRequest.save({
                    transaction: transaction
                })
                .then(function(updatedAuthorizationRequest){
                    authorizationRequest.paymentActivity.status = 'DECLINED';
                    authorizationRequest.paymentActivity.payment_auth_date = moment().format('YYYY-MM-DD HH:mm:ss');
                    
                    return authorizationRequest.paymentActivity.save({
                        transaction: transaction
                    });
                });
                
            });
        }).then(function(result){
            req.flash('success', 'You have successfully declined payment ref: ' + authorizationRequest.paymentActivity.payment_reference_number + '!');
            res.redirect('/customer-loans/payment-authorizations');
        }).catch(function(err){
            if(typeof err === 'string' && err === 'PromiseBreak'){
                return;
            }

            req.flash('error', 'Sorry an error occurred. [' + err + ']');
            res.redirect('/customer-loans/payments-authorizations/' + req.params.authRequestId + '/details');
        });
    }
}
