const express = require("express");
const cors = require("cors");
 
const userService = require("./data/userService.js");
const app = express();
app.use(express.json());
 
app.use(cors());

require('dotenv').config();
const HTTP_PORT = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');


// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: '&0y7$noP#5rt99&GB%Pz7j2b1vkzaB0RKs%^N^0zOP89NT04mPuaM!&G8cbNZOtH',
};

// IMPORTANT - this secret should be a long, unguessable string
// (ideally stored in a "protected storage" area on the web server).
// We suggest that you generate a random 50-character string
// using the following online tool:
// https://lastpass.com/generatepassword.php

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    if (jwt_payload) {
        // The following will ensure that all routes using
        // passport.authenticate have a req.user._id, req.user.userName, req.user.fullName & req.user.role values
        // that matches the request payload data
        next(null, {
            _id: jwt_payload._id,
            userName: jwt_payload.userName,

        });
    } else {
        next(null, false);
    }
});

 
app.use(passport.initialize());
//post request to handle request to register the new user


// tell passport to use our "strategy"
passport.use(strategy);

// add passport as application-level middleware
app.use(passport.initialize());
app.post('/signUp', (req, res) => {
 
    userService.registerUser(req.body).then((msg)=>
    {
        res.send("Success");
    })
        .catch((err)=>
        {
           res.send(err);
          });
});
 

passport.use(strategy);
app.get("/newRoute", passport.authenticate('jwt', { session: false }),(req,res)=>
{
res.send("Hi this is sign in get route:");
})

//post request to handle the request to sign in the user
app.post("/signIn",(req,res) =>
{

    //check the user credentials
    userService.checkUser(req.body).then((user)=>
    {
        let payload = {
            _id: user._id,
            userName: user.userName,
          
        };

        let token = jwt.sign(payload, jwtOptions.secretOrKey);
      
        // res.send("Success");
       /* res.json({ message: 'login successful', token: token });*/
        res.status(200).send({ token: token });
    }).catch((err)=>
    {
        console.log(err);
        res.send(err);
    })
})



app.use('/', (req, res) => {
    // Redirect to the React server running at http://localhost:3000
    res.send("Hi this is from backend");
});
 
userService.connect().then(() => {
    app.listen(HTTP_PORT, () => { console.log("API listening on: " + HTTP_PORT) });
})
    .catch((err) => {
        console.log("unable to start the server: " + err);
        process.exit();
    });