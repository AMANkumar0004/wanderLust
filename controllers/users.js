const User =require("../models/user")

module.exports.renderSignUpForm =(req,res)=>{
    res.render("users/signup.ejs")
    }

module.exports.signUp =async(req,res,next)=>{
    try{
        let {username,email,password}=req.body;
        const newUSer = new User({email,username})
      const registeredUser =  await User.register(newUSer,password);
    
      req.login(registeredUser,(err)=>{
        if (err) {
          return next(err);
        }
        req.flash("success","Welcome to WanderLust ");
        res.redirect("/listings");
      })
     
    }
    catch(err){
     req.flash("error",err.message)
     res.redirect("/signup")
    }
}

module.exports.renderLoginForm =(req,res)=>{
    res.render("users/login.ejs")
  }

module.exports.login =async(req,res)=>{
    req.flash("success","welcome back to WanderLust ! ")
    let redirectUrl = res.locals.redirectUrl ||"/listings"
    res.redirect(redirectUrl);
  }

module.exports.logout=(req,res,next)=>{
    req.logOut((err=>{
      if(err){
        next(err);
      }
      req.flash("success","You are logged Out!");
      res.redirect("/listings");
    }))
  }