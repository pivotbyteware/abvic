var User = require('../models').User;
var bcrypt = require('bcrypt');

module.exports = {
    index: function(req, res) {
        res.render('login', {
            oldInput: req.oldInput
        });
    },

    login: function(req, res) {
        var user;
        User.findOne({ where: {login_id: req.body.login_id, status: 'ACTIVE'} })
        .then(function(userData){
            if(!userData){
                req.flash('error', 'Authentication failed!');
                return res.redirect('/login');
            }

            user = userData;

            return bcrypt.compare(req.body.login_password, user.login_password);
        }).then(function (result) {
            if (result !== true) {
                req.flash('error', 'Authentication failed!');
                return res.redirect('/login');
            }
            
            req.session.userId = user.id;

            return res.redirect('/');
        });
        
    },

    logout: function(req, res){

        if (req.session) {
            // delete session object
            req.session.destroy(function(err) {
                return res.redirect('/login');
            });
        }

    }
};