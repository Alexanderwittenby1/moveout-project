"use strict";

const port = 8080;
const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const routeIndex = require('./route/index');
const authRouter = require('./route/authRoute.js');
const middleware  = require('./middleware/index.js');
const flash = require('connect-flash');




app.use(middleware.logger);


// Session middleware
app.use(session({
    secret: "some secret",
    cookie: { maxAge: 3600000 }, // 1 timme
    saveUninitialized: false,
    resave: false,
}));
app.use(flash());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware for logging
app.use(middleware.logger);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));



// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(middleware.checkAuth);

// Routes
app.use("/", authRouter);
app.use("/", routeIndex);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { errorMessage: 'Ett internt serverfel inträffade.' });
});

// Start the server
app.listen(port, logStartUpDetailsToConsole);

/**
 * Log app details to console when starting up.
 *
 * @return {void}
 */
function logStartUpDetailsToConsole() {
    let routes = [];

    // Find what routes are supported
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly on the app
            routes.push(middleware.route);
        } else if (middleware.name === "router") {
            // Routes added as router middleware
            middleware.handle.stack.forEach((handler) => {
                let route;

                route = handler.route;
                route && routes.push(route);
            });
        }
    });

    console.info(`Server is listening on port ${port}.`);
    console.info("Available routes are:");
    console.info(routes);
}
