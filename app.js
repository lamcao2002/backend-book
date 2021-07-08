const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
var cors = require('cors')

import apiRoute from './server/routers/index';
import acl from './acl/index';

import { handleValidateError, handleNotFoundError } from './server/middleware/handlerError';
import { db_url } from './constant';

const connetMongoDB = async () => {
    try {
        await mongoose.connect(db_url,  {useNewUrlParser: true, useUnifiedTopology: true});
    } catch (error) {
        console.error('connect MongoDb has error: ' + error);
    }
};

connetMongoDB();

const app = express();

app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/')));

app.use('/apis', apiRoute);

// Handle case incorrect API
app.use(handleValidateError);
app.use(handleNotFoundError);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

global.acl = acl;

module.exports = app;