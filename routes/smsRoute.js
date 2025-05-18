const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {sendSms} = require('../controller/smsCtrl')

router.post('/send', authMiddleware, sendSms);

module.exports = router;