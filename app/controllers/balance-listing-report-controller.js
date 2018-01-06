
var moment = require('moment');
var helpers = require('../common/helpers');
var json2csv = require('json2csv');
var PDFDocument = require('pdfkit');

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
    index: function(req, res) {
        res.render('balance_listing_report', {
            defaultStartDate: moment().startOf('month').format('DD-MMM-YYYY'),
            defaultEndDate: moment().format('DD-MMM-YYYY'),
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

        req.session.balanceListingReportParams = {
            startDate: startDate,
            endDate: endDate,
        };

        return res.redirect('/reports/balance-listing/search');

    },

    getReportItems: function(req, res) {
        var dataTablePaginator = helpers.dataTablePaginator(req);
        var customerLoans;

        var startDate = moment(req.body.startDate, 'DD-MMM-YYYY', true).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment(req.body.endDate + ' 23:59:59', 'DD-MMM-YYYY HH:mm:ss', true).format('YYYY-MM-DD HH:mm:ss');
        
        var filters = {
            loan_status: {
                [Sequelize.Op.in]:['OPEN']
            },
            opening_date: {
                [Sequelize.Op.between]: [startDate, endDate]
            },
        };

        var includes = [
            {
                model: CustomerLoanInvestment,
                as: 'investments',
                where: {
                    payment_status: 'OPEN'
                }
            },
            {
                model: Customer,
                as: 'customer',
            },
        ];
        
        CustomerLoan.findAll({
            where: filters,
            include: includes,
            offset: dataTablePaginator.limitOffset,
            limit: dataTablePaginator.limit
        })
        .then(function(customerLoansData){
            customerLoans = customerLoansData;

            return CustomerLoan.count({
                where: filters,
                include: includes
            });

            
        }).then(function(count){
            var reportData = [];
            
            customerLoans.forEach(function(customerLoan){
                reportData.push({
                    loan_reference_number: customerLoan.loan_reference_number,
                    customer_name: customerLoan.customer.first_name + ' ' + customerLoan.customer.last_name,
                    customer_id: customerLoan.customer.id_number,
                    investment_amount: helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].investment_amount).toFixed(2)),
                    interest_amount: helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].interest_amount).toFixed(2)),
                    total_amount: helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].total_amount).toFixed(2)),
                });
            });

            res.send({
                //error: 'Debug: ERROR',
                draw: req.body.draw,
                recordsTotal: count,
                recordsFiltered: count,
                data: reportData
            });
        });
    },

    exportToExcel: function(req, res) {
        var customerLoans;

        var startDate = moment(req.session.balanceListingReportParams.startDate).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment(req.session.balanceListingReportParams.endDate + ' 23:59:59').format('YYYY-MM-DD HH:mm:ss');
        
        var filters = {
            loan_status: {
                [Sequelize.Op.in]:['OPEN']
            },
            opening_date: {
                [Sequelize.Op.between]: [startDate, endDate]
            },
        };
        
        CustomerLoan.findAll({
            where: filters,
            include: [
                {
                    model: CustomerLoanInvestment,
                    as: 'investments',
                    where: {
                        payment_status: 'OPEN'
                    }
                },
                {
                    model: Customer,
                    as: 'customer',
                },
            ],
        })
        .then(function(customerLoans){
            var headerFields = ['Loan Number', 'Customer Name', 'Customer ID', 'Principal Amount', 'Interest Amount', 'Total Amount'];
            var reportData = [];

            customerLoans.forEach(function(customerLoan){
                reportData.push({
                    "Loan Number": customerLoan.loan_reference_number,
                    "Customer Name": customerLoan.customer.first_name + ' ' + customerLoan.customer.last_name,
                    "Customer ID": customerLoan.customer.id_number,
                    "Principal Amount": helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].investment_amount).toFixed(2)),
                    "Interest Amount": helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].interest_amount).toFixed(2)),
                    "Total Amount": helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].total_amount).toFixed(2)),
                });
            });
             
            try {
              var csv = json2csv({ fields: headerFields, data: reportData, });

              res.setHeader('Content-disposition', 'attachment; filename=data.csv');
              res.set('Content-Type', 'text/csv');
              res.status(200).send(csv);

            } catch (err) {
              
              res.send('An error occurred: ' + err);
            }

            
        });
    },

    exportToPdf: function(req, res) {
        var customerLoans;

        var startDate = moment(req.session.balanceListingReportParams.startDate).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment(req.session.balanceListingReportParams.endDate + ' 23:59:59').format('YYYY-MM-DD HH:mm:ss');
        
        var filters = {
            loan_status: {
                [Sequelize.Op.in]:['OPEN']
            },
            opening_date: {
                [Sequelize.Op.between]: [startDate, endDate]
            },
        };
        
        CustomerLoan.findAll({
            where: filters,
            include: [
                {
                    model: CustomerLoanInvestment,
                    as: 'investments',
                    where: {
                        payment_status: 'OPEN'
                    }
                },
                {
                    model: Customer,
                    as: 'customer',
                },
            ],
        })
        .then(function(customerLoans){

            var pdfDoc = new PDFDocument();
            
            pdfDoc.pipe(res);

            pdfDoc.font('fonts/PalatinoBold.ttf')
                .fontSize(25)
                .text('Some text with an embedded font!', 100, 100);

            pdfDoc.addPage()
                .fontSize(25)
                .text('Here is some vector graphics...', 100, 100);
            

            pdfDoc.save()
                .moveTo(100, 150)
                .lineTo(100, 250)
                .lineTo(200, 250)
                .fill("#FF3300");

            pdfDoc.scale(0.6)
                .translate(470, -380)
                .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
                .fill('red', 'even-odd')
                .restore();

            pdfDoc.addPage()
                .fillColor("blue")
                .text('Here is a link!', 100, 100)
                .underline(100, 100, 160, 27, {color: "#0000FF"})
                .link(100, 100, 160, 27, 'http://google.com/');

            pdfDoc.end();

            /*var headerFields = ['Loan Number', 'Customer Name', 'Customer ID', 'Principal Amount', 'Interest Amount', 'Total Amount'];
            var reportData = [];

            customerLoans.forEach(function(customerLoan){
                reportData.push({
                    "Loan Number": customerLoan.loan_reference_number,
                    "Customer Name": customerLoan.customer.first_name + ' ' + customerLoan.customer.last_name,
                    "Customer ID": customerLoan.customer.id_number,
                    "Principal Amount": helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].investment_amount).toFixed(2)),
                    "Interest Amount": helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].interest_amount).toFixed(2)),
                    "Total Amount": helpers.addCommaSeperators(Number.parseFloat(customerLoan.investments[0].total_amount).toFixed(2)),
                });
            });
             
            try {
              var csv = json2csv({ fields: headerFields, data: reportData, });

              res.setHeader('Content-disposition', 'attachment; filename=data.csv');
              res.set('Content-Type', 'text/csv');
              res.status(200).send(csv);

            } catch (err) {
              
              res.send('An error occurred: ' + err);
            }*/

            
        });
    },

};
