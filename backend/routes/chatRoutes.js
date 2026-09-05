const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getChatContacts, getMessages, sendMessage } = require('../controllers/chatController');

const router = express.Router();

router.use(protect);

router.get('/contacts', getChatContacts);
router.get('/messages', getMessages);
router.post('/messages', sendMessage);

module.exports = router;
