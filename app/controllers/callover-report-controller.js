
var moment = require('moment');

var User = require('../models').User;
var Customer = require('../models').Customer;
var CustomerDocument = require('../models').CustomerDocument; 
var CustomerDocumentRequirement = require('../models').CustomerDocumentRequirement;
var CustomerLoan = require('../models').CustomerLoan;
var CustomerLoanInvestment = require('../models').CustomerLoanInvestment;
var AuthWorkflow = require('../models').AuthWorkflow;

module.exports = {
    index: function(req, res) {
        res.render('callover_report_params', {
            oldInput: req.oldInput
        });
    },

    initParams: function(req, res) {
        var errors = false;
        
        var startDate = req.body.startDate + '';
        var endDate = req.body.endDate + '';

        ///validations
        if(startDate == ''){
            req.oldInput.setError('startDate', 'This is a required field!');
            errors = true;
        }

        if(endDate == ''){
            req.oldInput.setError('endDate', 'This is a required field!');
            errors = true;
        }

        if(errors){
            req.flash('error', 'There were some errors with the data that your submitted!');
            return res.redirect('back');
        }

        req.session.calloverReportParams = {
            startDate: startDate,
            endDate: endDate,
        };

        return res.redirect('/reports/callover/search');

    },

    search: function(req, res) {
        var customerLoans;

        var startDate = moment(req.session.calloverReportParams.startDate).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment(req.session.calloverReportParams.endDate + ' 23:59:59').format('YYYY-MM-DD HH:mm:ss');

        return res.send(startDate + ' ' + endDate);
        
        var filters = {
            loan_status: {
                [Sequelize.Op.in]:['OPEN', 'PENDING_AUTH']
            },
            opening_date: {
                [Sequelize.Op.between]: [startDate, endDate]
            },
        };
        
        CustomerLoan.findAll({
            where: filters
        })
        .then()
    }

};
