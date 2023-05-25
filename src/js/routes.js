const router = require('express').Router();
const userController = require('./userController.js');

router.get('/', userController.getWelcomePage);
router.get('/login', userController.getLoginPage);
router.get('/register', userController.getRegisterPage);

module.exports = router;