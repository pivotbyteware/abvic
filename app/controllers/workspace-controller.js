
var qman = require('../integrations/qman');
var moment = require('moment');
var randomColor = require('randomcolor');

module.exports = {
    index: function(req, res) {
        res.render('workspace');
    },

};
