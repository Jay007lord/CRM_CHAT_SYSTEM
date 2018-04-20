const mongoose = require('mongoose');
const User = require('./user');
const Staff = require('./staff');
const Message = require('./message');
const extend = require('util')._extend;

// conversation schema
const ConversationSchema = mongoose.Schema({
  participants: {
    type: [],
    required: false,
    unique: false
  },
  name: {
    type: String,
    required: true
  }
});

ConversationSchema.statics.addConversation = (conversation, callback) => {
  conversation.save(callback);
};

ConversationSchema.statics.getConversations = (callback) => {
  Conversation.find({}, callback);
};

ConversationSchema.statics.getChatRoom = (callback) => {
  Conversation.findOne({name: "chat-room"}, (err, conversation) => {
    if (err || conversation == null) {
      let chatRoom = new Conversation({name: "chat-room"});
      Conversation.addConversation(chatRoom, (err, conv) => {
        if (err) return callback("There was an error on getting the conversation");
        return callback(null, conv);
      });
    } else {
      Message.getMessagesByConv(conversation._id , (err, messages) => {
        if (err) {
          let error = "There was an error on getting messages";
          return callback(error);
        } else {
          let conversationObj = extend({}, conversation);
          conversationObj.messages = messages;
          return callback(null, conversationObj);
        }
      });
    }
  });
};

ConversationSchema.statics.getConversationByName = (participant1, participant2, callback) => {
  console.log(participant1+" "+participant2);
  let combo1 = "" + participant1 + "-" + participant2;
  let combo2 = "" + participant2 + "-" + participant1;
  let part1 = {
    username: '',
     id: ''
  };
  let part2 = {
    username: '',
    id: ''
  };
  Conversation.findOne({name: combo1}, (err, conversation1) => {
    if (err || conversation1 == null) {
      Conversation.findOne({name: combo2}, (err, conversation2) => {
        if (err || conversation2 == null) {
          User.getUserByUsername(participant1, (err1, user1) => {
              if (err1) {
                console.log("The user could not be found");
              }
              if(user1 === null){
                Staff.getStaffByStaffname(participant1,(err2,staff1)=>{
                  if(err2!=null || staff1 == null){
                    console.log("staff isn't found so wrong query");
                    console.log(err);

                    return callback("The staff or Customer could not be found");
                  }
                  part1.username=staff1.staffname;
                  part1.id=staff1._id;

                });
              }else{
                part1.username=user1.username;
                part1.id=user1._id;
              }
            User.getUserByUsername(participant2, (err2, user2) => {
              if (err2) {
              console.log("The user could not be found");
              }
              if(user2===null){
                Staff.getStaffByStaffname(participant2,(err3,staff3)=>{
                  if(err2 || staff3 == null){
                    return callback("The staff could not be found");
                  }

                  part2.username=staff3.staffname;
                  part2.id=staff3._id;
                });
              }
              else{

                part2.username=user2.username;
                part2.id=user2._id;
              }
              let participants = [part1, part2];
                let newConv = new Conversation({
                  participants: participants,
                  name: "" + part1.username + "-" + part2.username
              });
              Conversation.addConversation(newConv, (err, addedConv) => {
                if (err) {
                  console.log(err);
                  let error = "There was an error on getting the conversation";
                  return callback(error);
                } else {
                  return callback(null, addedConv);
                }
              });
            });
          });
        } else {
          Message.getMessagesByConv(conversation2._id, (err, messages) => {
            if (err) {
              let error = "There was an error on getting messages";
              return callback(error);
            } else {
              let conversationObj = extend({}, conversation2);
              conversationObj.messages = messages;
              return callback(null, conversationObj);
            }
          });
        }
      });
    }

    else {
      Message.getMessagesByConv(conversation1._id, (err, messages) => {
        if (err) {
          let error = "There was an error on getting messages";
          return callback(error);
        } else {
          let conversationObj = extend({}, conversation1);
          conversationObj.messages = messages;
          return callback(null, conversationObj);
        }
      });
    }
  });
};


const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;
