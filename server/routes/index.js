var express = require('express');
var router = express.Router();
var mainController=require('../controllers/userController.js');

router.post('/register',function (req,res) {
    mainController.registerController(req,res);
});
router.post('/login',function (req,res) {
    mainController.logincontroller(req,res);
});

module.exports = router;
