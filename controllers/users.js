const User = require("../models/user");

// --- Signup ---
module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signUp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to WanderLust");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

// --- Login ---
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// --- Logout ---
module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

// --- Forgot Password Form ---
module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgotPassword.ejs");
};

// --- Handle Forgot Password ---
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "No account with that email exists.");
    return res.redirect("/forgot-password");
  }

  const token = user.generateResetToken();
  await user.save();

  const resetUrl = `http://${req.headers.host}/reset-password/${token}`;
  console.log("Password reset link:", resetUrl); // replace with actual email sending logic

  req.flash("success", "Password reset link has been sent to your email!");
  res.redirect("/login");
};

// --- Reset Password Form ---
module.exports.renderResetPasswordForm = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or expired.");
    return res.redirect("/forgot-password");
  }

  res.render("users/resetPassword.ejs", { token });
};

// --- Handle Reset Password ---
module.exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or expired.");
    return res.redirect("/forgot-password");
  }

  await user.setPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.flash("success", "Password has been reset! You can now log in.");
  res.redirect("/login");
};