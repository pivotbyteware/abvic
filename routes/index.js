var express = require('express');
var os =  require('os');
var multer  = require('multer');
var oldInput = require('../app/common/old-input');

var isUserAuthenticatedMiddleware = require('../app/middleware/is-user-authenticated');
var hasUserChangedPasswordMiddleware = require('../app/middleware/has-user-changed-password');

var authController = require('../app/controllers/auth-controller');
var workspaceController = require('../app/controllers/workspace-controller');
var customerLoansController = require('../app/controllers/customer-loans-controller');
var customerLoanPaymentsController = require('../app/controllers/customer-loan-payments-controller');
var customersManagementController = require('../app/controllers/customers-controller');
var usersManagementController = require('../app/controllers/users-management-controller');
var branchesManagementController = require('../app/controllers/branches-management-controller');
var calloverReportController = require('../app/controllers/callover-report-controller');
var balanceListingReportController = require('../app/controllers/balance-listing-report-controller');

var customerDocumentsUploads = multer({ dest: os.tmpdir() });

var sysAdminsRouteGroup = express.Router();
var tellersRouteGroup = express.Router();
var supervisorsRouteGroup = express.Router();

module.exports = function(app){
    app.use(isUserAuthenticatedMiddleware);
    app.use(hasUserChangedPasswordMiddleware);

    // user auth
    app.get('/login', authController.index);
    app.post('/login', authController.login);
    app.get('/logout', authController.logout);

    // workspace
    app.get('/', workspaceController.index);

    // creating a new customer
    app.get('/customers/:idType-:idNumber/create-customer', customersManagementController.createCustomerIndex);
    app.post('/customers/:idType-:idNumber/create-customer', customerDocumentsUploads.any(), oldInput, customersManagementController.createCustomer);

    // opening a loan
    app.get('/customer-loans/open-new-loan', customerLoansController.newLoanIndex);
    app.post('/customer-loans/open-new-loan/validate-id-number', customerLoansController.validateNewLoanCustomerIdNumber);
    app.get('/customer-loans/open-new-loan/:customerId', customerLoansController.newLoanDetailsIndex);
    app.get('/customer-loans/open-new-loan/:customerId/active-loan', customerLoansController.activeCustomerLoan);
    app.post('/customer-loans/open-new-loan/:customerId/init-loan-for-auth', customerLoansController.newLoanInitForAuth);
    app.get('/customer-loans/open-new-loan/:customerId/select-authorizer', customerLoansController.newLoanAuthSelectIndex);
    app.post('/customer-loans/open-new-loan/:customerId/send-for-auth', customerLoansController.newLoanSendForAuth);

    // making a loan payment
    app.get('/customer-loans/new-payment', customerLoanPaymentsController.newPaymentIndex);
    app.post('/customer-loans/new-payment/validate-id-number', customerLoanPaymentsController.validateNewLoanPaymentCustomerIdNumber);
    app.get('/customer-loans/new-payment/:customerId', customerLoanPaymentsController.paymentDetailsIndex);
    app.post('/customer-loans/new-payment/:customerId/init-payment-for-auth', customerLoanPaymentsController.newPaymentInitForAuth);
    app.get('/customer-loans/new-payment/:customerId/select-authorizer', customerLoanPaymentsController.newPaymentAuthSelectIndex);
    app.post('/customer-loans/new-payment/:customerId/send-for-auth', customerLoanPaymentsController.newPaymentSendForAuth);

    // loan authorizations
    app.get('/customer-loans/loan-authorizations', customerLoansController.loanAuthorizationsIndex);
    app.get('/customer-loans/loan-authorizations/:authRequestId/details', customerLoansController.loanDetailsIndex);
    app.get('/customer-loans/loan-authorizations/:authRequestId/confirm-authorization', customerLoansController.loanAuthConfirmIndex);
    app.get('/customer-loans/loan-authorizations/:authRequestId/authorize', customerLoansController.loanAuth);
    app.get('/customer-loans/loan-authorizations/:authRequestId/decline-authorization', customerLoansController.loanDeclineCofirmIndex);
    app.post('/customer-loans/loan-authorizations/:authRequestId/decline', customerLoansController.loanDecline);

    // payment authorizations
    app.get('/customer-loans/payment-authorizations', customerLoanPaymentsController.paymentAuthorizationsIndex);
    app.get('/customer-loans/payment-authorizations/:authRequestId/details', customerLoanPaymentsController.loanPaymentDetailsIndex);
    app.get('/customer-loans/payment-authorizations/:authRequestId/confirm-authorization', customerLoanPaymentsController.loanPaymentAuthConfirmIndex);
    app.get('/customer-loans/payment-authorizations/:authRequestId/authorize', customerLoanPaymentsController.loanPaymentAuth);
    app.get('/customer-loans/payment-authorizations/:authRequestId/decline-authorization', customerLoanPaymentsController.loanPaymentDeclineCofirmIndex);
    app.post('/customer-loans/payment-authorizations/:authRequestId/decline', customerLoanPaymentsController.loanPaymentDecline);


    // users management
    app.get('/users', usersManagementController.index);
    app.get('/users/new', usersManagementController.newUser);
    app.post('/users/new', usersManagementController.createUser);
    app.get('/users/:userId/edit', usersManagementController.editUser);
    app.post('/users/:userId/edit', usersManagementController.updateUser);
    app.get('/users/:userId/disable', usersManagementController.disableUser);
    app.get('/users/:userId/enable', usersManagementController.enableUser);
    app.get('/users/:userId/delete-confirm', usersManagementController.confirmUserDelete);
    app.get('/users/:userId/delete', usersManagementController.deleteUser);
    app.get('/users/:userId/change-password', usersManagementController.changeUserPassword);
    app.post('/users/:userId/change-password', usersManagementController.updateUserPassword);

    app.get('/my-profile/change-password', usersManagementController.changeMyPassword);
    app.post('/my-profile/change-password', usersManagementController.updateMyPassword);

    // branches management
    app.get('/branches', branchesManagementController.index);
    app.get('/branches/new', branchesManagementController.newBranch);
    app.post('/branches/new', branchesManagementController.createBranch);
    app.get('/branches/:branchId/edit', branchesManagementController.editBranch);
    app.post('/branches/:branchId/edit', branchesManagementController.updateBranch);


    // reports
    // callover reports
    app.get('/reports/callover', calloverReportController.index);
    app.post('/reports/callover/init-params', calloverReportController.initParams);
    app.get('/reports/callover/search', calloverReportController.search);

    // balance listing reports
    app.get('/reports/balance-listing', balanceListingReportController.index);
    //app.post('/reports/balance-listing/init-params', balanceListingReportController.initParams);
    app.post('/reports/balance-listing/search', balanceListingReportController.getReportItems);
    app.get('/reports/balance-listing/export-to-excel', balanceListingReportController.exportToExcel);
    app.get('/reports/balance-listing/export-to-pdf', balanceListingReportController.exportToPdf);
    
    
};