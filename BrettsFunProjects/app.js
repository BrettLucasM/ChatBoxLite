const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const app = express();
app.set('view engine', 'ejs');
const model = require("./Models/UserModel")
const AccountModel = require("./Models/UserAccountModel")
app.use('/assets', express.static('assets'));
fs = require('fs');
const { check, validationResult } = require('express-validator');

const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});

//const model = require("../Milestone3/Models/userModel");
app.use(session({secret:'Keep it secret' //creates session secret and parameters.
    ,name:'uniqueSessionID'
    ,saveUninitialized:false}))
const mongoose = require('mongoose');
//const path = require("ejs");
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

    const messageSchema = new mongoose.Schema({
        receiver: String,
        sender: String,
        message: String,
        submittedDate: String
    });

    const userAccountSchema = new mongoose.Schema({
        ID: String,
        Bio: String,
        Work: String,
        Status: String,
        Seeking: String,
        Image: String
    });

    const Users = mongoose.model('Users', userSchema);
    const Message = mongoose.model('Message', messageSchema);
    const UserAccount = mongoose.model('UserAccount', userAccountSchema);
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    app.set('view engine', 'ejs');

    app.use('/assets', express.static('assets'));


    //Message.deleteMany({},
        //function (err, Kitten) {
            //if (err) return (err);
            //console.log("Messages Deleted Every Nine Hours!");
        //});


    app.get('/', function (req, res) {
        let data={
            qs: req.query,
            "r": req.session
        }
        res.render('home', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
    });

    app.get('/newMessage/:id', function (req, res) {
        console.log("Ready to send messages to " + req.params.id+ " from "+ req.session.userID);
        UserAccount.find({ID: req.session.userID}, function(err, result) {
            let data = {
                qs: req.query,
                "r": req.session,
                "id": req.params,
                "p": result
            }
            res.render('sendInitialMessage', {data: data});
            console.log('Request was made: ' + req.url + ' on ' + dateTime);
        })
    });

    app.get('/myMessages', function (req, res) {

        UserAccount.find({ID: req.session.userID}, function(err, result) {
            Users.find({}, function (err, result2) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("All users loaded and sent to page.")
                    console.log("Starting with " + result2[0].userID)
                    let data = {
                        qs: req.query,
                        "r": req.session,
                        "friend": result2,
                        "id": req.params,
                        "p": result
                    }
                    res.render('myMessage', {data: data});
                    console.log('Request was made: ' + req.url + ' on ' + dateTime);
                }
            });
        })
    });

    app.get('/viewMessage/:id', function (req, res) {

        console.log(req.params.id);
        UserAccount.find({ID: req.session.userID}, function(err, result) {
        Message.find({sender: { $in: [req.session.userID, req.params.id]}, receiver: { $in: [req.session.userID, req.params.id]}}).sort({submittedDate: -1}).exec(function(err, result1) {
                console.log(result1);

                let data={
                    qs: req.query,
                    "r": req.session,
                    "result1": result1,
                    "id": req.params,
                    "p": result
                }
                res.render('myMessage', {data: data});
                console.log('Request was made: ' + req.url + ' on ' + dateTime);
            })
        })
    });
    app.get('/sendingMessage/:id', function (req, res) {
        Message.find({}, function (err, result) {
            console.log(result);
        })

        console.log(req.params.id);
        UserAccount.find({ID: req.session.userID}, function(err, result) {
        Message.find({
            sender: {$in: [req.session.userID, req.params.id]},
            receiver: {$in: [req.session.userID, req.params.id]}
        }).sort({'submittedDate': 'asc'}).exec(function (err, result1) {
            console.log(result1);

            let data = {
                qs: req.query,
                "r": req.session,
                "result1": result1,
                "id": req.params,
                "p": result
            }
            res.render('myMessage', {data: data});
            console.log('Request was made: ' + req.url + ' on ' + dateTime);
        })
        })
    });

    app.post('/sendingMessage/:id', urlencodedParser, function (req, res){
        console.log(req.params.id +" "+" "+ req.body.userID+" "+ req.body.message);

        const temp = new Message({
            receiver: req.params.id,
            sender: req.body.userID,
            message: req.body.message,
            submittedDate: dateTime
        });
        temp.save(function (err, temp) {
            if (err) return console.error(err);
            console.log(temp);
        });

        Message.find({},function(err, result) {
            console.log(result);
        })

        console.log(req.params.id);
        UserAccount.find({ID: req.session.userID}, function(err, result) {
        Message.find({sender: { $in: [req.session.userID, req.params.id]}, receiver: { $in: [req.session.userID, req.params.id]}}).sort({submittedDate: -1}).exec(function(err, result1) {
            console.log(result1);

            let data={
                qs: req.query,
                "r": req.session,
                "result1": result1,
                "id": req.params,
                "lastM": temp,
                "p": result
            }
            res.render('myMessage', {data: data});
            console.log('Request was made: ' + req.url + ' on ' + dateTime);
        })
        })
    });

app.get('/UserProfile/:id', function (req, res) {
        UserAccount.find({ID: req.params.id}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.params.id)  //console information
                Users.findOne({userID: req.params.id}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.params.id+" found");
                        //console.log(results.firstN)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
        console.log(req.params.id);
    });

    app.get('/explore', function (req, res) {

        UserAccount.find({ID: req.session.userID}, function(err, result3) {
        UserAccount.find({}, function (err, result1) {
            console.log(result1);
        Users.find({}, function (err, result) {
          console.log("Found all users. First user is, "+result[0].userID);

            let data={
                qs: req.query,
                "r": req.session,
                "result": result,
                "result1": result1,
                "p": result3
            }
            res.render('findProfile', {data: data});
            console.log('Request was made: ' + req.url + ' on ' + dateTime);
        })
        })
        })

    });

    app.get('/DeleteAccount', function (req, res) {
        UserAccount.find({ID: req.session.userID}, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(req.session.userID+" found");
                console.log(results.Image)
                let data={
                    qs: req.query,
                    "r": req.session,
                    "p": results
                }
                res.render('deleteAccount', {data: data});
                console.log('Request was made: ' + req.url + ' on ' + dateTime);
            }
        });
    });

    app.post('/DeleteUserAccount1', urlencodedParser, function (req, res){
        UserAccount.find({ID: req.session.userID}, function(err, result) {
        var t = 1;
        let data={
            qs: req.query,
            "r": req.session,
            "t": t,
            "p": result
        }
        res.render('deleteAccount', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
        })
    });

    app.post('/DeleteUserAccount2', urlencodedParser, function (req, res){
        UserAccount.find({ID: req.session.userID}, function(err, result) {
        var t = 1;
        var v = 1;
        let data={
            qs: req.query,
            "r": req.session,
            "t": t,
            "v": v,
            "p": result
        }
        res.render('deleteAccount', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
        })
    });

    app.get('/profile', function (req, res) {
        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(results.firstN)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/login', function (req, res) {

        let data = {
            "r": req.session,
            qs: req.query
        }
        res.render('login', {data: data});
        console.log('Request was made: ' + req.url + ' on ' + dateTime);
    });

    app.get('/aboutUs', function (req, res) {

        let data = {
            "r": req.session,
            qs: req.query
        }
        res.render('about', {data: data});
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

    app.get('/UpdateUserAccount', function (req, res) {
        Users.exists({ userID: req.session.userID}, function(err, result) {
            //find username and password as well as check if it exists.
            if (result === false) {
                console.log("Username not found in database")
                res.redirect('/login');//does not exist reroute to /login URL
            }
            if (result === true) {
                console.log("User name found in Database")

                UserAccount.find({ID: req.session.userID}, function(err, result) {
                    //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
                    if (err) { //If there is an error then the console will log it and the website will hang
                        console.log(err);
                    } else { //If there is no error then continue
                        console.log("Profile was found for "+req.session.userID)  //console information
                        Users.findOne({userID: req.session.userID}, function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(req.session.userID+" found");
                                console.log(result[0].Image)
                                let data={
                                    qs: req.query,
                                    "r": req.session,
                                    "p": result,
                                    "result": results
                                }
                                res.render('UpdateUserProfile', {data: data});
                                console.log('Request was made: ' + req.url + ' on ' + dateTime);
                            }
                        });
                    }
                })
            }

        })
    });


    app.get('/Friends', function (req, res){
        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for " + req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        Users.find({}, function (err, result2) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("All users loaded and sent to page.")
                                console.log("Starting with "+result2[0].userID)
                                let data = {
                                    qs: req.query,
                                    "r": req.session,
                                    "p": result,
                                    "result": results,
                                    "friend": result2
                                }
                                res.render('profile', {data: data});
                                console.log('Request was made: ' + req.url + ' on ' + dateTime);
                            }

                        });
                    }
                })
            }
        });
    });

    app.post('/DeleteUserAccount', urlencodedParser, function (req, res){

        Users.exists({userID: req.session.userID}, function(err, result) {
            if (result === false) {
                console.log("Exists?:"+result);
                console.log("Who is logged into this account.....Fraudulent behavior detected");
            }

            if(result === true) {
                console.log("Exists?:"+result)
                var v = 2;

                Users.find({userID: req.session.userID}, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        Users.deleteOne({userID: req.session.userID}, function (err) {
                            if (err) console.log(err);
                            console.log("Successful deletion of "+req.session.userID+"'s account");
                        })
                    }
                })

                UserAccount.find({ID: req.session.userID}, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        UserAccount.deleteOne({ID: req.session.userID}, function (err) {
                            if (err) console.log(err);
                            console.log("Successful deletion of "+req.session.userID);
                        })
                    }
                })
            }

            Users.find(function (err, Users) {
                if (err) return console.error(err);
                console.log(Users);
            });

            res.redirect('logOut');
        });
    });

    app.use(bodyParser.urlencoded({ extended: true}));
    app.post('/c', [
        check('userID')
            .custom(value => !/\s/.test(value))
            .withMessage('No spaces are allowed in the username'),
        //check('email').isEmail().withMessage('EMAIL must be a valid Email'),
        check('password').isStrongPassword().withMessage('PASSWORD must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number'),
    ], function (req, res){
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            //console.log(res.status(422).json({ errors: errors.array() }))
            let data = {
                qs: req.query,
                errors: errors.array(),
                "r": req.session
            }
            res.render('signUp', {data: data});
        } else {

            Users.exists({userID: req.body.userID}, function (err, result) {
                if (result === false) {
                    console.log("Exists?:" + result)

                    const temp1 = new UserAccount({
                        ID: req.body.userID,
                        Bio: "I am a ChatBox user!",
                        Work: "",
                        Status: "",
                        Seeking: "",
                        Image: "DefaultSkin.PNG"
                    });
                    temp1.save(function (err, temp) {
                        if (err) return console.error(err);
                        console.log(temp1);
                    });
                    console.log("Created general user profile");

                    const temp = new Users({
                        userID: req.body.userID,
                        password: req.body.password,
                        firstN: req.body.firstN,
                        lastN: req.body.lastN,
                        //email: req.body.email
                    });
                    temp.save(function (err, temp) {
                        if (err) return console.error(err);
                        console.log(temp);
                    });
                    let data = {
                        qs: req.body,
                        "v": v,
                        "r": req.session
                    }

                    Users.find(function (err, Users) {
                        if (err) return console.error(err);
                        console.log(Users);
                    });

                    res.render('login', {data: data});
                }

                if (result === true) {
                    console.log("Exists?:" + result)
                    var v = 2;
                    let data = {
                        "v": v,
                        qs: req.query
                    }
                    res.render('signUp', {data: data});
                }

            });
        }
    });



//Fixed!
app.post('/Updating', urlencodedParser, function (req, res){

        UserAccount.exists({ID: req.session.userID}, function(err, result2) {
            if (result2 === false) {//Something Wrong Here
                console.log("Exists?:"+ result2)

                const temp = new UserAccount({
                    ID: req.session.userID,
                    Bio: req.body.Bio,
                    Work: req.body.Work,
                    Status: req.body.Status,
                    Seeking: req.body.Seeking,
                    Image: 'MaleImage1.PNG'
                });
                temp.save(function (err, temp) {
                    if (err) return console.error(err);
                    console.log(temp);
                });
                                let data={
                                    qs: req.query,
                                    "r": req.session,
                                    "s": req.body
                                }
                                res.render('profile', {data: data});
                                console.log('Request was made: ' + req.url + ' on ' + dateTime);
                var v = 1;
            }

            if(result2 === true) {
                console.log("Profile was found and Updated")
                    console.log("Exists?:" + result2)
                    console.log(req.session.userID);

                const doc = UserAccount.findOne({
                    ID: req.session.userID
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {

                    }
                });
                const update = {ID: req.session.userID};
                doc.updateOne(update);

                    const doc1 = UserAccount.findOne({
                        ID: req.session.userID
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {

                        }
                    });
                    const update1 = {Bio: req.body.Bio};
                    doc1.updateOne(update1);

                    const doc2 = UserAccount.findOne({
                        ID: req.session.userID
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            //res.send(result);
                        }
                    });
                    const update2 = {Work: req.body.Work};
                    doc2.updateOne(update2);

                    const doc3 = UserAccount.findOne({
                        ID: req.session.userID
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            //res.send(result);
                        }
                    });
                    const update3 = {Status: req.body.Status};
                    doc3.updateOne(update3);

                    const doc4 = UserAccount.findOne({
                        ID: req.session.userID
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            //res.send(result);
                        }
                    });
                    const update4 = {Seeking: req.body.Seeking};
                    doc4.updateOne(update4);
                    var t = 2



                UserAccount.find({ID: req.session.userID}, function(err, result) {
                    //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
                    if (err) { //If there is an error then the console will log it and the website will hang
                        console.log(err);
                    } else { //If there is no error then continue
                        console.log("Profile was found for "+req.session.userID)  //console information

                        Users.findOne({userID: req.session.userID}, function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(req.session.userID+" found");
                                console.log(results.firstN)
                                let data={
                                    qs: req.query,
                                    "r": req.session,
                                    "p": result,
                                    "result": results
                                }
                                res.render('profile', {data: data});
                                console.log('Request was made: ' + req.url + ' on ' + dateTime);
                            }
                        });
                    }
                })
            }

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
                    res.locals.userID = req.body.userID
                    //save the username as a local username
                    next()
                }

            })
        }
        ,(req,res)=>
        {
            req.session.loggedIn = true  //logged in now equals true
            req.session.userID = res.locals.userID
            //req.session.firstN = res.locals.firstN//save username as session
            //console.log(req.session.firstN +"test")
            res.redirect('/authenticate')
        })

app.get('/authenticate', function (req, res){

        if(req.session.loggedIn)
        {
            res.redirect('/profile');  //if logged in then go to /connect URL where the nav.ejs will have logged in functionality
        }
        else
            res.redirect('/login'); //if any other answer redirect to /login URL
    });

    app.get('/newAvatar1', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'glassesAndTie.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

app.get('/newAvatar2', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'AfroGuy.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });


    app.get('/newAvatar3', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'GenericFemale.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar4', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'GenericMale.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar5', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'girlWithGlasses.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar6', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'MaleImage1.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });


    app.get('/newAvatar7', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'FemaleL.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar8', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'FemaleL2.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar9', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'PinkRobo.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });


    app.get('/newAvatar10', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'RedRobo.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar11', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'YellowRobo.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar12', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'BlueRobo.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar13', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'Pride.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    app.get('/newAvatar14', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'Chicken.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });


    app.get('/newAvatar15', function (req, res){

        const doc1 = UserAccount.findOne({
            ID: req.session.userID
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('This is the image:' + result.Image)
            }
        });
        const update1 = {Image: 'Rawr.PNG'};
        doc1.updateOne(update1);


        UserAccount.find({ID: req.session.userID}, function(err, result) {
            //finds a document in the UserInfo model with specific parameters, connectionID and ConnectionType
            if (err) { //If there is an error then the console will log it and the website will hang
                console.log(err);
            } else { //If there is no error then continue
                console.log("Profile was found for "+req.session.userID)  //console information
                Users.findOne({userID: req.session.userID}, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.session.userID+" found");
                        console.log(result[0].Image)
                        let data={
                            qs: req.query,
                            "r": req.session,
                            "p": result,
                            "result": results
                        }
                        res.render('profile', {data: data});
                        console.log('Request was made: ' + req.url + ' on ' + dateTime);
                    }
                });
            }
        })
    });

    setInterval(function(){
        Message.deleteMany({},
            function (err, Kitten) {
                if (err) return (err);
                console.log("Messages Deleted Every Nine Hours!");
            });
    }, 32400000);

})

    app.listen(8082, function(){

        console.log("Listening to Port 8082..")
    });



