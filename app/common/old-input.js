
const sanitizer = require('sanitizer');


function initOldInputInSession(req, name) {
	if ( !req.session.oldInput.hasOwnProperty(name) ) {
		req.session.oldInput[name] = {
			value : '',
			error : '',
			hasError: false
		};
	}
}


module.exports = function(req, res, next)
{
	if ( !req.session ) {
		return;
	}

	if ( req.method === 'POST' )
	{
		req.session.oldInput = {};

		for ( var name in req.body ) {
			
			if (req.body[name] != undefined ) {
				initOldInputInSession(req, name);
				req.session.oldInput[name].value = sanitizer.sanitize(req.body[name]);
			}
		}

		req.oldInput = {
			setError: function(name, error) {
				if ( name ) {
					initOldInputInSession(req, name);
					req.session.oldInput[name].error = error;
					req.session.oldInput[name].hasError = true;
				}
			}
		};
	}
	else if ( req.method === 'GET' )
	{
		req.oldInput = {
			value : function(name) {
				if ( req.oldInput.hasOwnProperty(name) ) {
					return req.oldInput[name].value || '';
				}

				return null;
			},

			error : function(name) {
				if ( req.oldInput.hasOwnProperty(name) ) {
					return req.oldInput[name].error || '';
				}
			},

			hasError : function(name) {
				if ( req.oldInput.hasOwnProperty(name) ) {
					return req.oldInput[name].hasError;
				}
			}
		};

		if ( req.session.oldInput ) {
			for ( var name in req.session.oldInput ) {
				req.oldInput[name] = {
					value : req.session.oldInput[name].value,	
					error : req.session.oldInput[name].error,
					hasError : req.session.oldInput[name].hasError,
				}
			}
		}

		req.session.oldInput = {};
	}

	next();
}
