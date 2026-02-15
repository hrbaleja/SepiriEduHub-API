const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const certificateRoutes = require('./certificateRoutes');
const instituteRoutes = require('./instituteRoutes');

router.use('/auth', authRoutes);
router.use('/certificates', certificateRoutes);
router.use('/institutes', instituteRoutes);


module.exports = router;
