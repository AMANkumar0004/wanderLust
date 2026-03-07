const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js")

const userController = require("../controllers/users.js")
router.get("/forgot-password", userController.renderForgotPasswordForm);
router.post("/forgot-password", userController.forgotPassword);

router.get("/reset-password/:token", userController.renderResetPasswordForm);
router.post("/reset-password/:token", userController.resetPassword);
router.route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signUp));

router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);
router.get("/logout", userController.logout)

router.route("/dashboard")
  .get(isLoggedIn, wrapAsync(userController.renderDashboard));
// Render Forgot Password form
module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgotPassword.ejs");
};

// Handle Forgot Password form submission
module.exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "No account with that email exists.");
    return res.redirect("/forgot-password");
  }

  // Generate a reset token and expiry (1 hour)
  const token = user.generateResetToken(); // we’ll define this in User model
  await user.save();

  // Send email to user with reset link
  const resetUrl = `http://${req.headers.host}/reset-password/${token}`;
  console.log("Password reset link:", resetUrl); // replace with email sending logic

  req.flash("success", "Password reset link has been sent to your email!");
  res.redirect("/login");
};

// Render Reset Password form
module.exports.renderResetPasswordForm = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or expired.");
    return res.redirect("/forgot-password");
  }

  res.render("users/resetPassword.ejs", { token });
};

// Handle Reset Password submission
module.exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or expired.");
    return res.redirect("/forgot-password");
  }

  await user.setPassword(password); // passport-local-mongoose helper
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.flash("success", "Password has been reset! You can now log in.");
  res.redirect("/login");
};

module.exports = router;