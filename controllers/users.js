const User =require("../models/user")
const Listing = require("../models/listing")

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

module.exports.getWishlist = async (req,res)=>{
  const user = await User.findById(req.user._id).populate({
    path:"wishlist",
    populate:{
      path:"owner",
      select:"username",
    }
  });

  if(!user){
    req.flash("error","User not found");
    return res.redirect("/listings");
  }

  res.render("users/wishlist.ejs",{
    wishlist:user.wishlist || [],
    points:user.points || 0,
  });
}

module.exports.addToWishlist = async (req,res)=>{
  const {id}=req.params;
  const listing = await Listing.findById(id);

  if(!listing){
    req.flash("error","Listing not found");
    return res.redirect("/listings");
  }

  const user = await User.findById(req.user._id);

  if(!user){
    req.flash("error","User not found");
    return res.redirect("/listings");
  }

  const alreadySaved = user.wishlist.some((wishId)=> wishId.equals(listing._id));

  if(alreadySaved){
    req.flash("error","Listing already in your wishlist");
    return res.redirect(`/listings/${id}`);
  }

  user.wishlist.push(listing._id);
  user.points = (user.points || 0) + 5;
  await user.save();

  req.flash("success","Added to wishlist. +5 points!");
  res.redirect(`/listings/${id}`);
}

module.exports.removeFromWishlist = async (req,res)=>{
  const {id}=req.params;
  const user = await User.findById(req.user._id);

  if(!user){
    req.flash("error","User not found");
    return res.redirect("/listings");
  }

  const itemIndex = user.wishlist.findIndex((wishId)=> wishId.equals(id));

  if(itemIndex === -1){
    req.flash("error","Listing not in your wishlist");
    return res.redirect("/wishlist");
  }

  user.wishlist.splice(itemIndex,1);
  user.points = Math.max(0,(user.points || 0) - 5);
  await user.save();

  req.flash("success","Removed from wishlist");
  const redirectUrl = req.get("Referer") || "/wishlist";
  res.redirect(redirectUrl);
}