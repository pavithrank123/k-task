var express = require('express');
var router = express.Router();
var mainController=require('../controllers/userController.js');

router.post('/register',function (req,res) {
    mainController.registerController(req,res);
});
router.post('/login',function (req,res) {
    mainController.loginController(req,res);
});
router.post('/verifyotp',function (req,res) {
    mainController.verifyotp(req,res);
});
router.post('/verifyfotp',function (req,res) {
    mainController.verifyfotp(req,res);
});
router.post('/gverify',function (req,res) {
    mainController.gverify(req,res);
});
router.get('/qr',function (req,res) {
    mainController.qrcode(req,res);
});
router.post('/image',function (req,res) {
    mainController.image(req,res);
});
router.post('/forgot',function (req,res) {
    mainController.forgot(req,res);
});
router.post('/logout',function (req,res) {
    mainController.logoutcontroller(req,res);
});


module.exports = router;
