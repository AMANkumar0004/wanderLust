if (process.env.Node_ENV != "production") {
  require('dotenv').config();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");
const plannerRouter = require("./routes/planner.js");
const { log } = require('console');






const { MongoMemoryServer } = require('mongodb-memory-server');

// ================== DATABASE CONNECTION ==================

let dbUrl = process.env.DB_URL || process.env.ATLASDB_URL;

async function main() {
  if (!dbUrl) {
    console.error("DB_URL is not defined in .env file");
    process.exit(1);
  }

  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB!");
}

main().catch((err) => console.log(err));


// ================== EXPRESS SETUP ==================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// ================== SESSION STORE ==================

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
})


store.on("error", () => {
  console.log("Error in MONGO SESSION STORE");

})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}

// app.get("/", (req, res) => {
//   res.send("hi i am root");
// });


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
})

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});


// ================== ROUTES ==================

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/planner", plannerRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) => {
  let { statusCode = 400, message = "something went wrong" } = err;
  //  res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
// ================== ERROR HANDLING ==================

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});
app.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.send("Token invalid or expired");
  try {
    if (dbUrl && !dbUrl.includes("127.0.0.1")) {
      await mongoose.connect(dbUrl);
      console.log("connected to external DB");
    } else {
      const mongoServer = await MongoMemoryServer.create();
      dbUrl = mongoServer.getUri();
      await mongoose.connect(dbUrl);
      console.log("Connected to in-memory DB at", dbUrl);

      const Listing = require("./models/listing.js");
      if (await Listing.countDocuments() === 0) {
        let dummyUser = new User({ email: "student@gmail.com", username: "student" });
        let registeredUser = await User.register(dummyUser, "password123");

        let initData = require("./init/data.js");
        initData.data = initData.data.map((obj) => ({ ...obj, owner: registeredUser._id }));
        await Listing.insertMany(initData.data);
        console.log("Seeded in-memory DB with starting listings and user (student / password123)!");
      }
    }

    // ================== EXPRESS SETUP ==================

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.engine("ejs", ejsMate);

    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "/public")));

    // ================== SESSION STORE ==================

    const secret = process.env.SESSION_SECRET || process.env.SECRET || "thisshouldbeabettersecret";

    const store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: {
        secret: secret,
      },
      touchAfter: 24 * 3600,
    });

    store.on("error", function (e) {
      console.log("SESSION STORE ERROR", e);
    });

    const sessionOptions = {
      store,
      secret: secret,
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

    app.get("/reset-password/:token", async (req, res) => {
      const { token } = req.params;

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.send("Token invalid or expired");
      }

      res.render("reset-password", { token });
    });

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
  } catch (err) {
    console.log(err);
  }
}

main();
