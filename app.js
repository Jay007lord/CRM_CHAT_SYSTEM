const express = require('express'); //express framwork
const path = require('path'); 
const bodyParser = require('body-parser'); 
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const errorMiddleware = require('./middleware/error');
const config = require('./config');

// import routes
const userRoutes = require('./routes/user');
const adminRoutes=require('./routes/admin');
const staffRoutes=require('./routes/staff');
const messageRoutes = require('./routes/message');


// initialize the app
const app = express();

// middleware
app.use(cors()); //OR
/*
app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
*/ 
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize()); //passport depedency
require('./config/passport')(passport);
//require('./config/adminPassport')(passport);

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// set routes
app.use(`${config.root}/users`, userRoutes);
app.use(`${config.root}/admins`,adminRoutes);
app.use(`${config.root}/staffs`,staffRoutes);
app.use(`${config.root}/messages`, messageRoutes);

// set error handling middleware
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send("Invalid Endpoint");
});


module.exports = app;
