const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// staff schema
const StaffSchema = mongoose.Schema({
  staffname: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  companyname: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  filename: {
    type: String,
    default: ''
  },

  confirmed: {
    type: Boolean,
    default: false
  }
});

StaffSchema.statics.getStaffById = function (id, callback) {
  Staff.findById(id, callback);
}

StaffSchema.statics.getStaffByStaffname = function (staffname, callback) {
  let query = {
    staffname: staffname
  };
  Staff.findOne(query, callback);
}

StaffSchema.statics.getStaffs = () => {
  return Staff.find({}, {
    password: 0
  } /*'-password'*/ );
}

StaffSchema.statics.addStaff = function (newStaff, callback) {
  Staff.getStaffByStaffname(newStaff.staffname, (err, staff) => {
    if (err) return callback({
      msg: "There was an error on getting the Staff"
    });
    else if (staff) {
      let error = {
        msg: "Staffname is already in use"
      };
      return callback(error);
    } else {
      Staff.checkEmail(newStaff.email, (err, staff) => {
        if (err) return callback({
          msg: "There was an error on getting the email"
        });
        if (staff) {
          error = {
            msg: "Email is already in use"
          };
          return callback(error);
        } else {
          bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(newStaff.password, salt, (err, hash) => {
              if (err) {
                return callback({
                  msg: "There was an error registering the new Staff"
                });
              }
              newStaff.password = hash;
              console.log(newStaff);
              newStaff.save(callback);

            });
          });


        }

      });
    }
  });
}

StaffSchema.statics.checkEmail = (email, callback) => {
  let query = {
    email: email
  };
  Staff.findOne(query, callback);
}

StaffSchema.statics.authenticate = function (staffname, password, callback) {
  Staff.getStaffByStaffname(staffname, (err, staff) => {
    if (err) return callback({
      msg: "There was an error on getting the Staff"
    });


    if (!staff) {
      let error = {
        msg: "Staff not found in database"
      };
      return callback(error);
    } else {
      if (staff.confirmed === false)
        return callback({
          msg: "Staff hasn't confirmed yet, Please Open your Email and confiremed your account"
        });

      bcryptjs.compare(password, staff.password, (err, result) => {
        if (result == true) {
          return callback(null, staff);
        } else {
          let error = {
            msg: "Wrong Staffname or password"
          };
          return callback(error);
        }
      });
    }
  });
};

StaffSchema.statics.updateVerify = (email, callback) => {
  Staff.findOneAndUpdate({
    email: email
  }, {
    $set: {
      confirmed: true
    }
  }, {
    new: true
  }, function (err, doc) {
    if (err) {
      console.log("Something wrong when updating data!");
    }

    console.log(doc);
  });
}

StaffSchema.statics.removeImage=(id,callback)=>{
  Staff.findByIdAndUpdate(id, {$set:{filename:''}}, {new: true} , function(err, doc){
    if(err) console.log(err);
   
    callback(doc);
  });
}



StaffSchema.statics.addImage=(id,file,callback)=>{

  Staff.findByIdAndUpdate(id, {$set:{filename:file.filename}}, {new: true} , function(err, doc){
    if(err) console.log(err);
   
    callback(doc);
  });
}


const Staff = mongoose.model('Staff', StaffSchema);
module.exports = Staff;