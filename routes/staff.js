const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
var multer = require('multer');
var assert = require('assert');
const fs = require('fs');
const Staff = require('../models/staff');
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
var uname = {
  name: ''
};
var rand, mailOptions, host, link;

//=======---------------Multer And Crypto for adding image file-------------============================//

const storage = multer.diskStorage({
  destination: './angular-src/src/assets/img/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage
}).single('photo');
//=========-----------Upload Image--------------======================//

router.post('/upload/:id', (req, res) => {
  let response = {};
  console.log("//=========-----------Upload Image--------------======================//");
  var path = '';
  upload(req, res, function (err) {
    if (err) {
      response.success = false;
      response.msg = "Error while uploading file";
      console.log(err);
      res.status(422).send(response);
    } else {
      if (req.file == undefined) {
        response.msg = "File not found";
        response.success = false;
        console.log("File not found");
        res.send(response);
      } else {
        response.path = req.file.path;
        response.msg = "Successfully uploaded image";
        response.file = `uploads/${req.file.filename}`;
        var filetype = req.file.mimetype;
        if (filetype == "image/png" || filetype == "image/jpg" || filetype == "image/jpeg") {
          Staff.addImage(req.params.id, req.file, (staff) => {
            response.msg = "Successfully added image";
            response.success = true;
            res.send(response);
          });
        }
      }
    }

  });
});
//=====================Profile========================================///
router.get('/profile', passport.authenticate("jwt", {  session: false}), (req, res, next) => {
  let response = {
    success: true
  };
  response.msg = "Profile retrieved successfuly";
  response.staff = req.staff;
  res.json(response);
});
//===============remove Staff Account================================//
router.delete('/removeStaff/:id', passport.authenticate("jwt", { session: false}), function (req, res) {
  response = {
    success: false
  };
  Staff.findByIdAndRemove(req.params.id, (err, staff) => {
    if (err) {
      response.msg = "Error while removing staff";
      console.log(err);
      res.send(response);
    } else {
      if (staff == null) {
        response.msg = "Staff Not Found";
      } else {
        console.log("Removed account", staff);
        response.msg = "Staff is removed";
        response.success = true;
      }
      res.send(response);
    }

  });
});


//=============------Verify Staff--------------==================//
router.get('/verify', function (req, res) {

  if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
    console.log("Domain is matched. Information is from Authentic email");
    if (req.query.id == rand) {
      Staff.updateVerify(mailOptions.to, (err, staff) => {
        if (err) res.status(400).json({
          err: err
        });
        console.log('Staff is successfully verified');
      });
      console.log("email is verified");
      res.sendFile(__dirname + '/index.html');
    } else {
      console.log("email is not verified");
      res.end("<h1>Bad Routing</h1>");
    }
  } else {
    res.end("<h1>Request is from unknown source");
  }
});


//===============================================Staff Registration==============---------------------------

router.post("/staffRegister", (req, res, next) => {
  let response = {
    success: false
  };
  let adminMail = '';
  if (!(req.body.password == req.body.confirmPass)) {
    let err = 'The passwords don\'t match';
    return next(err);
  } else {
    let newStaff = new Staff({
      staffname: req.body.staffname,
      email: req.body.email,
      password: req.body.password,
      companyname: req.body.companyname
    });
    Admin.getAdminByCompanyName(newStaff.companyname, (err, admin) => {
      if (err) {
        response.msg = "Error while getting admin from the company";
        res.send(response);
      } else {
        if (admin) {
          Staff.addStaff(newStaff, (err, staff) => {
            if (err) {
              response.msg = err.msg || "Failed to register staff";
              console.log(err);
              res.json(response);
            } else {
              response.success = true;
              response.msg = "Staff registered successfuly";
              response.staff = {
                id: staff._id,
                staffname: staff.staffname
              }
              console.log("[%s] registered successfuly", staff.staffname);

              rand = Math.floor((Math.random() * 100) + 54);
              host = req.get('host');
              link = "http://" + req.get('host') + "/staffs/verify?id=" + rand;
              console.log('Verification link ', link);
              mailOptions = {
                to: newStaff.email,
                subject: "Please confirm your Email account",
                html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>",
                text: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
              }

              smtpTransport.sendMail(mailOptions, function (error, res, next) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Mail has been sent to "+ newStaff.email);
                }
              });
              res.json(response);
            }
          });

        }
      }
    });
  };
});

//=======================================authStaff==============================================//

router.post("/authenticateStaff", (req, res, next) => {
  let body = req.body;
  let response = {
    success: false
  };

  Staff.authenticate(body.staffname.trim(), body.password.trim(), (err, staff) => {
    if (err) {
      response.msg = err.msg;
      res.json(response);
    } else { // create the unique token for the staff
      let signData = {
        id: staff._id,
        staffname: staff.staffname
      };
      let token = jwt.sign(signData, config.secret, {
        expiresIn: 604800
      });

      response.token = "JWT " + token;
      response.staff = signData;
      response.success = true;
      response.msg = "Staff authenticated successfuly";

      console.log("[%s] authenticated successfuly", staff.staffname);
      res.json(response);
    }
  });
});

//=========staff list=======================================//
router.get('/', (req, res, next) => {
  Staff.getStaffs()
    .then(staffs => {
      let response = {
        success: true,
        staffs: staffs
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get staffs', err.message || err);
      return next(new Error('Failed to get staffs'));
    });
});


//==================================Remove  staff Image=======================================//
router.delete('/removeImage/:id', passport.authenticate("jwt", {session: false}), (req, res) => {
  let response = {
    success: false
  };
  Staff.getStaffById(req.params.id, (err, staff) => {
    if (err) {
      response.msg = "Error in getting staff while deleting his image";
      res.json(response);
    } else {
      if (staff) {
        console.log(staff);
        if (staff.filename !== '') {
          fs.unlink('./angular-src/src/assets/img/' + staff.filename, function (err) {
            if (err)
              console.log(err);
            console.log('File deleted!');
          });
          Staff.removeImage(req.params.id, (doc) => {
            response.path = '';
            response.success = true;
            response.msg = "Image found and deleted";
            res.json(response);

          });

        } else {
          response.msg = "Image isn't uploaded";
          res.json(response);
        }
      } else {
        response.msg = "Staff not found in the database";
        res.json(response);
      }
    }
  })
});

//==================================Get staff Image=======================================//
router.get("/imagepath/:id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  let response= {success:false};
  response.path='';
  Staff.getStaffById(req.params.id,(err,staff)=>{
    if(err){
      response.msg="Error while getting staff from path API";
      res.json(response);
    }
    else{
      if(staff){
        if(staff.filename!==''){
          response.path=staff.filename;
          response.success=true;
          response.msg="Staff image found";
          res.json(response);
        }
        else{
          response.msg="Image isn't uploaded";
          res.json(response);
        }
      }else{
        response.msg="Staff not found in the database";
        res.json(response);
      }
    }
  })
});


module.exports = router;