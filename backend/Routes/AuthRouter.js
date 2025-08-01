const router = require('express').Router();
const {signup,login} = require('../Controllers/AuthController');
const {signupValidation,loginValidation} = require('../Middlewares/AuthValidation');



// router.post('/login', (req,res) => {
//     console.log('/auth/login Post rout hit');
//     res.send('Login Succes');
// });

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/test', (req, res) => {
    console.log("🧪 Test Hit ✅ Body:", req.body);
    res.status(200).json({ received: req.body });
  });

module.exports = router;
