const router = require('express').Router();
const userController = require('./userController.js');

router.get('/', userController.getWelcomePage);
router.get('/login', userController.getLoginPage);
router.get('/register', userController.getRegisterPage);
router.get('/home', userController.getHomePage);
router.post('/register', userController.registerUser);

module.exports = router;