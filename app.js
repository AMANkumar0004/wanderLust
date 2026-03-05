if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Fix for MongoDB Atlas DNS resolution issues
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.log("Could not set custom DNS servers:", e.message);
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// ================== DATABASE CONNECTION ==================

const dbUrl = process.env.DB_URL;

async function main() {
  if (!dbUrl) {
    console.error("DB_URL is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    // Don't exit here, let the server try to stay alive (though DB dependent features will fail)
  }
}

main();

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});


// ================== EXPRESS SETUP ==================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// ================== SESSION STORE ==================

let store;
try {
  if (dbUrl) {
    store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: {
        secret: process.env.SESSION_SECRET,
      },
      touchAfter: 24 * 3600,
    });

    store.on("error", function (e) {
      console.log("SESSION STORE ERROR", e);
    });
  }
} catch (err) {
  console.log("Failed to create MongoStore, falling back to memory store");
}

const sessionOptions = {
  store: store, // will be undefined if MongoStore fails/is skipped, using default MemoryStore
  secret: process.env.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());


// ================== PASSPORT ==================

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ================== LOCALS ==================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// ================== ROUTES ==================

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// ================== ERROR HANDLING ==================

app.get("/reset-password/:token", wrapAsync(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Token invalid or expired");
    return res.redirect("/forgot-password");
  }

  res.render("users/resetPassword", { token });
}));

// ================== ERROR HANDLING ==================

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ================== SERVER ==================

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});