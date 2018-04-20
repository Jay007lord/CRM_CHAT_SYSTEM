const mongoose = require('mongoose');

// message schema
const MessageSchema = mongoose.Schema({
  
  created: {
    type: Date,
    required: true
  },
  
  from: {
    type: String,
    required: true
  },
  
  text: {
    type: String,
    required: true
  },
  
  conversationId: {
    type: String,
    required: true
  },
                    //Does User inside chat room or not?????
  inChatRoom: {
    type: Boolean,
    required: false
  },
});

MessageSchema.statics.addMessage = (message, callback) => {
  message.save(callback);
};

MessageSchema.statics.getMessages = (callback) => {
  Message.find({}, callback);
};

MessageSchema.statics.getMessagesByConv = (id, callback) => {
  Message.find({conversationId: id}, callback);
};

MessageSchema.statics.deleteMessageByConv = (id,callback)=>{
  Message.findByIdAndRemove(id,(err,message)=>{
    if(err) console.log(err);
    callback(message);
  });
}

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
