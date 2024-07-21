// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const {SUB_API_ENDPOINTS} = require('../constants/apiEndpoints');


router.post(SUB_API_ENDPOINTS.CHATS, chatController.getChatResponse);

module.exports = router;
