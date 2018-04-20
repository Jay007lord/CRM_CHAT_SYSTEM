const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose=require('mongoose');
const nodemailer = require("nodemailer");
var multer = require('multer');
var assert = require('assert');
const fs=require('fs');
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
router.post('/upload/:id',passport.authenticate("jwt",{session: false}), (req, res)=> {
  let response={};

  var path = '';
     upload(req, res, function (err) {
        if (err) {
          response.success=false;
          response.msg="Error while uploading file";
          console.log(err);
          res.status(422).send(response);
        } 
        else{
          if(req.file==undefined){
            response.msg="File not found";
            response.success=false;
            console.log("File not found");  
            res.send(response);
          }
            else{
              response.path = req.file.path;
              response.msg="Successfully uploaded image";
              response.file= `uploads/${req.file.filename}`;
              var filetype=req.file.mimetype;
              if(filetype == "image/png" || filetype=="image/jpg" || filetype=="image/jpeg"){
                Admin.addImage(req.params.id,req.file,(admin)=>{
                    response.msg="Successfully added image";
                    response.success=true;
                    res.send(response);
                });
              }
            }
        } 
         
  });     
});

//===============================================Admin Registration==============---------------------------
router.post("/adminRegister",(req,res,next)=>{
    let response = {success: false};
   
    if (!(req.body.password == req.body.confirmPass)) {
      let err = 'The passwords don\'t match';
      return next(err);
    }
    else {
      let newAdmin = new Admin({
        adminname: req.body.adminname,
        email:req.body.email,
        password: req.body.password,
        companyname:req.body.companyname
      });
      Admin.addAdmin(newAdmin, (err,admin) => {
        if (err) {
          response.msg = err.msg || "Failed to register Admin";
          console.log(err);
          res.json(response);
        } else {
          response.success = true;
          response.msg = "Admin registered successfuly";
          response.admin = {
            id: admin._id,
            adminname: admin.adminname
        }
          console.log("[%s] registered successfuly", admin.adminname);
          
          rand = Math.floor((Math.random() * 100) + 54);
          host=req.get('host');
          link="http://"+req.get('host')+"/admins/verify?id="+rand;
          console.log('Verification link ',link);
  
          
          mailOptions={
              to : "jayoo7patel1996@gmail.com",
              subject : "Please confirm your Email account",
              html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>",
              text: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"  
          }
        
          smtpTransport.sendMail(mailOptions, function(error,res,next){
            if(error){
              console.log(error);
              }else{
            console.log("Mail has been sent to "+newAdmin.email); 
            }
          });
          res.json(response);
        }
      });
     };
});
  
  

//=============------Verify Admin--------------==================//
router.get('/verify',function(req,res){

    if((req.protocol+"://"+req.get('host'))==("http://"+host))
      {
      console.log("Domain is matched. Information is from Authentic email");
      if(req.query.id == rand)
      {
        Admin.updateVerify(mailOptions.to,(err, admin) => {
          if(err)	res.status(400).json({err:err});
          console.log('Admin is successfully verified');	
        });
        console.log("email is verified");
        res.sendFile(__dirname + '/index.html');
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
  
//====================-------------Authentication---------================//
  
  router.post("/authenticateAdmin", (req, res, next) => {
    let body = req.body;
    let response = {success: false};
    Admin.authenticate(body.adminname.trim(), body.password.trim(), (err, admin) => {
          if (err) {
        response.msg = err.msg;
        console.log(err);
        res.json(response);
      } else { // create the unique token for the admin
          let signData = {
            id: admin._id,
            adminname: admin.adminname
          };
          let token = jwt.sign(signData, config.secret, {
            expiresIn: 604800
          });
          response.token = "JWT " + token;
          response.admin = signData;
          response.success = true;
          response.msg = "Admin authenticated successfuly";
  
          console.log("[%s] authenticated successfuly", admin.adminname);
          res.json(response);
      }
    });
});

//==============================-Remove Admin--=======================//

router.delete('/removeAdmin/:id',passport.authenticate("jwt", {session: false}), function(req, res){
    response={success:false};
    Admin.findByIdAndRemove(req.params.id,(err,admin)=>{
      if(err){
        response.msg="Error while removing admin";
        console.log(err);
        res.send(response);
      }
      else{
      if(admin==null){
         response.msg="Admin isn't found";
        }
      else{
        console.log("Removed account", admin);  
        response.msg="Admin is removed";
        response.success=true;
      }
      res.send(response);
      }
    
    });
});
  
//==================================Remove  admin Image=======================================//
  router.delete('/removeImage/:id',passport.authenticate("jwt",{session:false}),(req,res)=>{
    let response={success:false};
    Admin.getStaffById(req.params.id,(err,admin)=>{
      if(err){
        response.msg="Error in getting admin while deleting his image";
        res.json(response);
      }
      else{
        if(admin){
          console.log(admin);
          if(admin.filename!==''){
            fs.unlink('./angular-src/src/assets/img/'+admin.filename, function (err) {
             if (err)
              console.log(err);
              console.log('File deleted!');
          });
          Admin.removeImage(req.params.id,(doc)=>{
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
          response.msg="Admin not found in the database";
          res.json(response);
        }
      }
    })
});

//============================================= profile============================================////
router.get('/profile', passport.authenticate("jwt", {session: false}), (req, res, next) => {
    let response = {success: true};
    response.msg = "Profile retrieved successfuly";
    response.admin = req.admin;
    res.json(response);
  });
  
  //========================================Image Path of Admin==========================///
  router.get("/imagepath/:id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
    let response= {success:false};
    response.path='';
    Admin.getAdminById(req.params.id,(err,admin)=>{
      if(err){
        response.msg="Error while getting admin from path API";
        res.json(response);
      }
      else{
        if(admin){
          if(admin.filename!==''){
            response.path=admin.filename;
            response.success=true;
            response.msg="Admin image found";
            res.json(response);
          }
          else{
            response.msg="Image isn't uploaded";
            res.json(response);
          }
        }else{
          response.msg="Admin not found in the database";
          res.json(response);
        }
      }
    })
  });
   

module.exports = router;
  