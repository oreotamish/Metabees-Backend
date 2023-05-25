const authController = require('../controllers/authController')
const passport = require('passport')
const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const router = express.Router()

//routes for handling google oauth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

//redirecting when auth fails or succeeds
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/app/fail',
  }),
  (req, res) => {
    req.session.google_user = req.user
    res.redirect('/auth/google/user')
  }
)

//route for sending google oauth user details to frontend
router.get('/google/user', (req, res) => {
  const aToken = jwt.sign(
    { id: req.session.google_user._id },
    process.env.SECRET_KEY,
    { expiresIn: '1d' }
  )
  res.cookie('aToken', aToken, { domain: 'localhost' })
  res.redirect('http://localhost:3001/')
})

//route for email signup
router.post('/signup', authController.signup)

//route for email login
router.post('/login', authController.login)

//route for checking email and sending email with token
router.post('/forgot-password', authController.forgot_password_email)

//route for resetting password
router.post('/reset-password/:id/:token', authController.reset_password)

module.exports = router
