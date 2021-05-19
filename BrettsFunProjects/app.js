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
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CBusers', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to Mongoose!");
    const userSchema = new mongoose.Schema({
        userID: String,
        password: String,
        firstN: String,
        lastN: String,
        email: String
    });
    const Users = mongoose.model('Users', userSchema);
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    app.set('view engine', 'ejs');

    app.use('/assets', express.static('assets'));


    app.get('/', function (req, res) {
        let data={
            qs: req.query,
            "r": req.session
        }
        res.render('home', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
    });

    app.get('/login', function (req, res) {

        let data = {
            "r": req.session,
            qs: req.query
        }
        res.render('login', {data: data});
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

app.post('/c', urlencodedParser, function (req, res){

        Users.exists({ userID: req.body.userID }, function(err, result) {
            if (result === false) {
                console.log("Exists?:"+result)

                const temp = new Users({ userID : req.body.userID, password: req.body.password, firstN: req.body.firstN, lastN: req.body.firstN, email: req.body.email});
                temp.save(function (err, temp) {
                    if (err) return console.error(err);
                    console.log(temp);
                });
                var v = 1;
            }

            if(result === true) {
                console.log("Exists?:"+result)
                var v = 2;
            }
            let data = {
                "u": req.body,
                "v": v,
                "r": req.session
            }

            Users.find(function (err, Users) {
                if (err) return console.error(err);
                console.log(Users);
            });

            res.render('login', {data: data});
        });
    });

app.get('/login', function (req, res){

        let data = {
            qs: req.query,
            'r': req.session
        }
            res.render('login', {data: data}); //if any other answer redirect to /login URL
    });

    app.get('/logOut', function (req, res){//services logout page

        req.session.destroy()  ///destroys session
        let data = {
            "r": req.session
        }
        res.render('home', {data: data}) //sends lack of session data to index
    });

app.post('/authenticate'
        ,bodyParser.urlencoded()
        ,(req,res,next)=>
        { //services login page, but is used to authenticate the user exists
// Actual implementation would check values in a database
            Users.exists({ userID: req.body.userID, password: req.body.password}, function(err, result) {
                //find username and password as well as check if it exists.
                if (result === false) {
                    console.log("Username not found in database")
                    res.redirect('/login');//does not exist reroute to /login URL
                }
                if (result === true) {
                    console.log("User name found in Database")
                    Users.find(function (err, password) { //username and password exist find the document.
                        if (err) return console.error(err);
                        console.log(password);

                    });
                    res.locals.userID = req.body.userID //save the username as a local username
                    next()
                }

            })
        }
        ,(req,res)=>
        {
            req.session.loggedIn = true  //logged in now equals true
            req.session.userID = res.locals.userID   //save username as session
            console.log(req.session)
            res.redirect('/authenticate')
        })

app.get('/authenticate', function (req, res){

        if(req.session.loggedIn)
        {
            res.redirect('/');  //if logged in then go to /connect URL where the nav.ejs will have logged in functionality
        }
        else
            res.redirect('/login'); //if any other answer redirect to /login URL
    });

})
    app.listen(8082, function(){

        console.log("Listening to Port 8082..")
    });



