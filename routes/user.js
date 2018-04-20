const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose=require('mongoose');
const nodemailer = require("nodemailer");
var multer = require('multer');
var assert = require('assert');
const fs=require('fs');
const User = require('../models/user');
const Staff= require('../models/staff');
const config = require('../config/database');
const log = require('../log');
const Admin = require('../models/admin');

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: 'YOUR EMAIL ID',
      pass: 'YOUR PASSWORD'
    }
});
var uname={name:''};
var rand,mailOptions,host,link;

//=======---------------Multer And Crypto for adding image file-------------============================//

const storage = multer.diskStorage({
  destination: './angular-src/src/assets/img/',
  filename: function(req, file, cb){
    cb(null,  Date.now()+'-'+file.originalname );
  }
});

const upload = multer({
  storage: storage
}).single('photo');
//=========-----------Upload Image--------------======================//

router.post('/upload/:id',(req, res,next)=> {
  let response={};
  var path = '';
     upload(req, res, function (err) {
        
      console.log('5');  
      if (err) {
        console.log('12');
          response.success=false;
          response.msg="Error while uploading file";
          console.log(err);
          res.status(422).send(response);
        } 
        else{
          console.log('1');
          if(req.file==undefined){
            response.msg="File not found";
            response.success=false;
            console.log("File not found");  
            res.send(response);
          }
            else{
              console.log('2');
              response.path = req.file.path;
              response.msg="Successfully uploaded image";
              response.file= `uploads/${req.file.filename}`;
              var filetype=req.file.mimetype;
              if(filetype == "image/png" || filetype=="image/jpg" || filetype=="image/JPG" || filetype=="image/jpeg"){
                
              console.log('3');
                User.addImage(req.params.id,req.file,(user)=>{
                    response.msg="Successfully added image";
                    response.success=true;
                    res.send(response);
                });
              }
            }
        } 
         
  });     
});

//===============remove User Account================================//
router.delete('/removeUser/:id',passport.authenticate("jwt", {session: false}), function(req, res){
  response={success:false};
  User.findByIdAndRemove(req.params.id,(err,user)=>{
    if(err){
      response.msg="Error while removing user";
      console.log(err);
      res.send(response);
    }
    else{
    if(user==null){
       response.msg="User Not Found";
      }
    else{
      console.log("Removed account", user);  
      response.msg="User is removed";
      response.success=true;
    }
    res.send(response);
    }
  
  });
});


//=============------Verify Customer--------------==================//
router.get('/verify',function(req,res){

  if((req.protocol+"://"+req.get('host'))==("http://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    if(req.query.id == rand)
    {
      User.updateVerify(mailOptions.to,(err, user) => {
        if(err)	res.status(400).json({err:err});
        console.log('User is successfully verified');	
      });
      console.log("email is verified");
      console.log(__dirname);
      res.sendfile(__dirname + '/index.html');

    }
    else
    {
        console.log("email is not verified");
        res.end("<h1>Bad Routing</h1>");
    }
}
else
{
    res.end("<h1>Request is from unknown source");
}
});



//===================================register-------------------- 
router.post('/register', (req, res, next) => {
  let response = {success: false};
  if (!(req.body.password == req.body.confirmPass)) {
     response.msg = 'The passwords don\'t match';
  
    res.json(response);
  }
  else {
    let newUser = new User({
      username: req.body.username,
      email:req.body.email,
      password: req.body.password,
    });
    User.addUser(newUser, (err, user) => {
      if (err) {
        response.msg = err.msg || "Failed to register user";
        res.json(response);
      } else {
        response.success = true;
        response.msg = "User registered successfuly";
        response.user = {
          id: user._id,
          username: user.username
      }
        console.log("[%s] registered successfuly", user.username);
        
        rand = Math.floor((Math.random() * 100) + 54);
        host=req.get('host');
        link="http://"+req.get('host')+"/users/verify?id="+rand;
        console.log('Verification link ',link);

      
        mailOptions={
            to : newUser.email,
            subject : "Please confirm your Email account",
            html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>",
            text: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"  
        }
      
        smtpTransport.sendMail(mailOptions, function(error,res,next){
          if(error){
            console.log(error);
            }else{
          console.log("Mail has been sent"); 
          }
        });
       
        
        res.json(response);
      }
    });
   };
});


//===============================================Verification==============---------------------------//

router.post("/authenticate", (req, res, next) => {
  let body = req.body;
  let response = {success: false};
  User.authenticate(body.username.trim(), body.password.trim(), (err, user) => {
    if (err) {
      response.msg = err.msg;
      console.log(err);
      res.json(response);
    } else { // create the unique token for the user

      let signData = {
          id: user._id,
          username: user.username
        };
       let token = jwt.sign(signData, config.secret, {
          expiresIn: 604800
        });

        response.token = "JWT " + token;
        response.user = signData;
        response.success = true;
        response.msg = "User authenticated successfuly";

        console.log("[%s] authenticated successfuly", user.username);
        res.json(response);
    }
  });
});

//============================================= profile============================================////
router.get('/profile',passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  response.msg = "Profile retrieved successfuly";
  response.user = req.user;
  res.json(response);
});

//========================================Image Path of User==========================///
router.get("/imagepath/:id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  let response= {success:false};
  response.path='';
  User.getUserById(req.params.id,(err,user)=>{
    if(err){
      response.msg="Error while getting user from path API";
      res.json(response);
    }
    else{
      if(user){
        if(user.filename!==''){
          response.path=user.filename;
          response.success=true;
          response.msg="User image found";
          res.json(response);
        }
        else{
          response.msg="Image isn't uploaded";
          res.json(response);
        }
      }else{
        response.msg="User not found in the database";
        res.json(response);
      }
    }
  })
});

//======================================Image path of User by his name==================//

router.get("/imgpath/:username",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  let response= {success:false};
  response.path='';
  User.getUserByUsername(req.params.username,(err,user)=>{
    if(err){
      response.msg="Error while getting user from path API";
      res.json(response);
    }
    else{
      if(user){
        if(user.filename!==''){
          response.path=user.filename;
          response.success=true;
          response.msg="User image found";
          res.json(response);
        }
        else{
          response.msg="Image isn't uploaded";
          res.json(response);
        }
      }else{
        response.msg="User not found in the database";
        res.json(response);
      }
    }
  })
});

//======================================= user list======================================//
router.get('/',  (req, res, next) => {
  User.getUsers()
    .then(users => {
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});



router.delete('/removeImage/:id',passport.authenticate("jwt",{session:false}),(req,res)=>{
  let response={success:false};
  User.getUserById(req.params.id,(err,user)=>{
    if(err){
      response.msg="Error in getting user while deleting his image";
      res.json(response);
    }
    else{
      if(user){
        console.log(user);
        if(user.filename!==''){
          fs.unlink('./angular-src/src/assets/img/'+user.filename, function (err) {
           if (err)
            console.log(err);
            console.log('File deleted!');
        });
        User.removeImage(req.params.id,(doc)=>{
            response.path='';
            response.success=true;
            response.msg="Image found and deleted";
            res.json(response); 
          
        }); 
          
        }
        else{
          response.msg="Image isn't uploaded";
          res.json(response);
        }
      }else{
        response.msg="User not found in the database";
        res.json(response);
      }
    }
  })
});

module.exports = router;
