const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// admin schema
const AdminSchema = mongoose.Schema({
    adminname: {
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

    confirmed: {
        type: Boolean,
        default: false
    }
});


AdminSchema.statics.getAdminByCompanyName = (company, callback) => {
    let query = {
        companyname: company
    };
    Admin.findOne(query, callback);
}

AdminSchema.statics.getAdminById = function (id, callback) {
    Admin.findById(id, callback);
}

AdminSchema.statics.getAdminByAdminname = function (adminname, callback) {
    let query = {
        adminname: adminname
    };
    Admin.findOne(query, callback);
}

AdminSchema.statics.getAdmins = () => {
    return Admin.find({}, {
        password: 0
    } /*'-password'*/ );
}

AdminSchema.statics.addAdmin = function (newAdmin, callback) {
    Admin.getAdminByCompanyName(newAdmin.companyname, (err, admin) => {
        if (err) return callback({
            msg: "Error on getting admin using companyname"
        });
        else if (admin) {
            let error = {
                msg: "Admin is already exist for this given company "+newAdmin.companyname
            };
            return callback(error);
        } else {
            Admin.getAdminByAdminname(newAdmin.adminname, (err, admin) => {
                if (err) return callback({
                    msg: "There was an error on getting the Admin"
                });
                else if (admin) {
                    let error = {
                        msg: "Adminname is already exist for this company"
                    };
                    return callback(error);
                } else {
                    Admin.checkEmail(newAdmin.email, (err, admin) => {
                        if (err) return callback({
                            msg: "There was an error on getting the email"
                        });
                        if (admin) {
                            error = {
                                msg: "Email is already in use"
                            };
                            return callback(error);
                        } else {
                            bcryptjs.genSalt(10, (err, salt) => {
                                bcryptjs.hash(newAdmin.password, salt, (err, hash) => {
                                    if (err) {
                                        return callback({
                                            msg: "There was an error registering the new Admin"
                                        });
                                    }
                                    newAdmin.password = hash;
                                    console.log(newAdmin);
                                    newAdmin.save(callback);
                                });
                            });
                        }

                    });
                }
            });
        }

    });

}

AdminSchema.statics.checkEmail = (email, callback) => {
    let query = {
        email: email
    };
    Admin.findOne(query, callback);
}

AdminSchema.statics.authenticate = function (adminname, password, callback) {
    Admin.getAdminByAdminname(adminname, (err, admin) => {
        if (err) return callback({
            msg: "There was an error on getting the Admin"
        });
        if (!admin) {
            let error = {
                msg: "Admin not found in database"
            };
            return callback(error);
        } else {
            if (admin.confirmed === false)
                return callback({
                    msg: "Admin hasn't confirmed yet, Please Open your Email and confiremed your account"
                });
            bcryptjs.compare(password, admin.password, (err, result) => {
                if (result == true) {
                    return callback(null, admin);
                } else {
                    let error = {
                        msg: "Wrong Admin Name or Password"
                    };
                    return callback(error);
                }
            });
        }
    });
};

AdminSchema.statics.updateVerify = (email, callback) => {
    Admin.findOneAndUpdate({
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
    });
}

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;