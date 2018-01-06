var User = require('../models').User;

module.exports = function(req, res, next){
    

    var _ = require('underscore')
    var nonSecurePaths = ['/login', '/logout', '/my-profile/change-password'];

    if ( _.contains(nonSecurePaths, req.path) ) {
        return next();
    }

    if(Number.parseInt(res.locals.authUser.changed_one_time_password) != 1){
        return res.redirect('/my-profile/change-password');
    }

    return next();
}