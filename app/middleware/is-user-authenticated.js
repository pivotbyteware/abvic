var User = require('../models').User;

module.exports = function(req, res, next){
    

    var _ = require('underscore')
    var nonSecurePaths = ['/login', '/logout'];

    if ( _.contains(nonSecurePaths, req.path) ) {
        return next();
    }

    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }

    User.findById(req.session.userId)
    .then(function(user){
        res.locals.authUser = user;
        return next();
    })
    .catch(function(err){
        return res.send(err);
    });
}