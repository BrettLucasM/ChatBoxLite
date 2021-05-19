const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
fs = require('fs');
//const model = require("../Milestone3/Models/userModel");
app.use(session({secret:'Keep it secret' //creates session secret and parameters.
    ,name:'uniqueSessionID'
    ,saveUninitialized:false}))

    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    app.use('/assets', express.static('assets'));


    app.get('/', function (req, res) {
        let data={
            qs: req.query,
            "r": req.session
        }
        res.render('home.ejs', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
    });

    app.get('/login', function (req, res) {

        let data = {
            "r": req.session,
            qs: req.query
        }
        res.render('login.ejs', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
    });

    app.get('/signUp', function (req, res) {
        let data = {
            "r": req.session,
            qs: req.query
        }
        res.render('signUp', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
    });


    app.listen(process.env.PORT || 5000)
//console.log("Listening for Port..")



