const router = require('express').Router();
const userController = require('./userController.js');

router.get('/', userController.getWelcomePage);

module.exports = router;