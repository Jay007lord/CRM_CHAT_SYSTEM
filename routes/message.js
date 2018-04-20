const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');
const Conversation = require('../models/conversation');

// get chat-room conversation
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Conversation.getChatRoom((err, chatRoom) => {
    if (err || chatRoom == null) {
      response.success = false;
      response.msg = "There was an error on getting the conversation";
      res.json(response);
    } else {
      response.msg = "Conversation retrieved successfuly";
      response.conversation = chatRoom;
      res.json(response);
    }
  });
});

// get Private Conversation conversation
router.get('/:name1/:name2', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Conversation.getConversationByName(req.params.name1, req.params.name2, (err, conversation) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting the conversation";
      console.log("0 for error");
      res.json(response);
    } else {
      response.msg = "Conversation retrieved successfuly";
      response.conversation = conversation;
     console.log("1"); 
      res.json(response);
    }
  });
});

module.exports = router;