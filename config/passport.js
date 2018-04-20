const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('./database');
const Admin=require('../models/admin');
const Staff=require('../models/staff');

module.exports = (passport) => {
  
  let options = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };

  
  passport.use(new JwtStrategy(options, (jwt_payload, done) => {
  if(jwt_payload.username !== undefined){
      User.getUserById(jwt_payload.id, (err, user) => {
        if (err) {
          return done(err, false);
        }
  
        if (user) {
          let signData = {
            id: user._id,
            username: user.username
          }
          return done(null, signData);
        } else {
          return done(null,false);
        }  
    });
  }
  else if(jwt_payload.adminname !== undefined){
    Admin.getAdminById(jwt_payload.id, (err, admin) => {
      if (err) {
        return done(err, false);
      }

      if (admin) {
        let signData = {
          id: admin._id,
          adminname: admin.adminname
        }
        return done(null, signData);
      } else {
        return done(null,false);
      }  
  });
  }  
  
  else if(jwt_payload.staffname !== undefined){
    Staff.getStaffById(jwt_payload.id, (err,staff) => {
      if (err) {
        return done(err, false);
      }

      if (staff) {
        let signData = {
          id: staff._id,
          staffname: staff.staffname
        }
        return done(null, signData);
      } else {
        return done(null,false);
      }  
  });
  }  
  }));
}