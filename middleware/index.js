"use strict";

/**
 * Log incoming requests and check for user session.
 *
 * @param {Request}  req  The incoming request.
 * @param {Response} res  The outgoing response.
 * @param {Function} next Next to call in chain of middleware.
 *
 * @returns {void}
 */
function logger(req, res, next) {
    console.info(`Got request on ${req.path} (${req.method}).`);
    next();
}

/**
 * Middleware för att kontrollera om användaren är autentiserad.
 * Använd detta på rutter som kräver inloggning.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // Om användaren är inloggad, fortsätt
    } else {
        return res.redirect('/login'); // Annars, omdirigera till inloggningssidan
    }
}


const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isAuthenticated = true;
        
        res.locals.user = req.session.user;
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
};

module.exports = {
    logger: logger,
    requireLogin: requireLogin,
    checkAuth: checkAuth,
};
