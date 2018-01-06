var moment = require('moment');

var Sequelize = require('../models').Sequelize;
var sequelize = require('../models').sequelize;

var Branch = require('../models').Branch;
var Sequence = require('../models').Sequence;

var sequenceCodes = {
    loanNumberSequenceCode: 'LOAN_NUM_SEQ',
    loanInvestmentNumberSequenceCode: 'LOAN_INV_NUM_SEQ',
};

var helpers = {
    addCommaSeperators: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    dataTablePaginator: function(req){
        var params;
        if(req.method === 'GET'){
            params = req.query;
        }else{
            params = req.body;
        }

        limitOffset = Number.parseInt(params.start);
        itemsPerPage = Number.parseInt(params.length);
        searchKeyWord = params['search[value]'];
        limit = itemsPerPage;
        pageNumber = Math.floor((limitOffset + itemsPerPage) / itemsPerPage);
        
        return {
            pageNumber: pageNumber,
            itemsPerPage: itemsPerPage,
            searchKeyWord: searchKeyWord,
            limitOffset: limitOffset,
            limit: limit,
        };
    },

    padstring: function(value, width, padstring){
        padstring = padstring || '0';
        value = value + '';
        return value.length >= width ? value : new Array(width - value.length + 1).join(padstring) + value;
    },

    generateLoanNumber: function(branchId){
        var branch;
        var sequenceNamespace = moment().format('YYMMDD');

        return Branch.findById(branchId)
        .then(function(branchDetails){
            if(!branchDetails){
                return Promise.reject('Could not find branch for loan number generation');
            }

            branch = branchDetails;

            return Sequence.findOne({
                where: {
                    sequence_code: sequenceCodes.loanNumberSequenceCode,
                    namespace: sequenceNamespace
                }
            })
        })
        .then(function(sequence){
            if(!sequence){
                return Sequence.create({
                    sequence_code: sequenceCodes.loanNumberSequenceCode,
                    namespace: sequenceNamespace,
                    sequence_number: 1
                });
            }

            sequence.sequence_number = Number.parseInt(sequence.sequence_number) + 1;

            return sequence.save();
        }).then(function(sequence){
            return Promise.resolve(branch.branch_code + sequence.namespace + helpers.padstring(sequence.sequence_number, 4));
        });
    },

    generateLoanInvestmentNumber: function(branchId){
        var branch;
        var sequenceNamespace = moment().format('YYMMDD');

        return Branch.findById(branchId)
        .then(function(branchDetails){
            if(!branchDetails){
                return Promise.reject('Could not find branch for loan number generation');
            }

            branch = branchDetails;

            return Sequence.findOne({
                where: {
                    sequence_code: sequenceCodes.loanInvestmentNumberSequenceCode,
                    namespace: sequenceNamespace
                }
            })
        })
        .then(function(sequence){
            if(!sequence){
                return Sequence.create({
                    sequence_code: sequenceCodes.loanInvestmentNumberSequenceCode,
                    namespace: sequenceNamespace,
                    sequence_number: 1
                });
            }

            sequence.sequence_number = Number.parseInt(sequence.sequence_number) + 1;

            return sequence.save();
        }).then(function(sequence){
            return Promise.resolve(branch.branch_code + sequence.namespace + helpers.padstring(sequence.sequence_number, 4));
        });
    }
}

module.exports = helpers;