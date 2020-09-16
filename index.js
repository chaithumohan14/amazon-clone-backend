//-------------------------------------Imports----------------------------------
const express = require("express");
const cors = require("cors");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
const User = require("./models/User");
const Sessions = require("./models/Sessions");
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const passportconfig = require("./passportconfig");
const SampleData = require("./models/SampleData");
const app = express();
//-------------------------------------Imports----------------------------------

//-------------------------------------MiddleWare----------------------------------
mongoose.connect(
  "mongodb+srv://chaithu:chaithU123@cluster0-hzpdd.gcp.mongodb.net/mark2?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://clone-mark-1.web.app/",
      "https://clone-mark-1.web.app",
      "http://localhost:5000",
      "http://localhost:3000",
      "https://polar-island-66350.herokuapp.com",
      "https://clone-mark-1.firebaseapp.com/",
      "https://clone-mark-1.firebaseapp.com",
      "*",
    ],
    credentials: true,
  })
);

app.use(
  session({
    secret: "secretDev",
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 24 * 30 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportconfig(passport);

const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send({});
  }
};

//------------------------------------MiddleWare----------------------------------

//-------------------------------------Routes-------------------------------------------
app.listen(process.env.PORT || 5000, () => {
  console.log("Server Started");
});

app.get("/", async (req, res) => {
  // console.log("Getting Req");
  if (req.cookies && (req.cookies.sid !== "" || req.cookies.sid !== null)) {
    await Sessions.findById(req.cookies.sid)
      .then(async (session) => {
        if (session !== null && session.userid !== null) {
          await User.findById(session.userid)
            .then((userGiven) => {
              req.session.user = {
                id: userGiven._id,
                username: userGiven.username,
                cart: userGiven.cart,
                orders: userGiven.orders,
              };
              req.login(userGiven, async (err) => {
                if (err) throw err;
                res.send({
                  id: userGiven._id,
                  username: userGiven.username,
                  cart: userGiven.cart,
                  orders: userGiven.orders,
                });
              });
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
});

app.get("/search", async (req, res) => {
  let result = [];

  await SampleData.find({
    $text: { $search: req.query.name },
    availability: { $in: ["In Stock", "Yes", "TRUE"] },
    amountMax: { $lt: req.query.max || 1000000, $gt: req.query.min || 0 },
  })
    .then((returnedData) => {
      result = returnedData;
    })
    .catch((err) => {
      console.log(err.message);
    });

  if (result.length > 20) {
    result = result.splice(0, 20);
  }
  res.status(200).send(result);
});

app.get("/latest", async (req, res) => {
  let result = [];
  await SampleData.find({ $query: {}, $orderby: { dateAdded: 1 } })
    .then((returnedData) => {
      result = returnedData.slice(0, 39);
    })
    .catch((err) => console.log(err.message));
  res.send(result);
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  await User.findOne({ username: req.body.username }).then(async (user) => {
    if (user) {
      console.log("User Exists");
      res.send({ err: "User Exists" });
    } else {
      let hashed = await bcrypt.hash(req.body.password, 10);
      let newUser = new User({
        _id: uuidv4(),
        username: req.body.username,
        password: hashed,
        emailid: req.body.emailid,
        cart: [],
        orders: [],
      });
      await newUser
        .save()
        .then(async (userReturned) => {
          let newSessionId = uuidv4();
          await Sessions.findOneAndDelete({ userid: userReturned._id })
            .then(() => console.log("deleted"))
            .catch((err) => console.log(err.message));
          let newSession = new Sessions({
            _id: newSessionId,
            userid: userReturned._id,
          });
          await newSession
            .save()
            .then((session) => {
              res.cookie("sid", newSessionId);
            })
            .catch((err) => res.send(err.message));
          res.send({
            username: userReturned.username,
            id: userReturned._id,
            cart: userReturned.cart,
            orders: userReturned.orders,
          });
        })
        .catch((err) => {
          res.send({ err: err.message });
        });
    }
  });
});

app.post("/login", (req, res, next) => {
  console.log("Getting Req login");
  let userG = {};
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send({ err: "No User Exists" });
    else {
      req.login(user, async (err) => {
        userG = user;
        if (err) throw err;
        let newSessionId = uuidv4();
        await Sessions.findOneAndDelete({ userid: user._id })
          .then(() => console.log("deleted"))
          .catch((err) => console.log(err.message));
        req.session.user = { id: user._id, username: user.username };
        let newSession = new Sessions({
          _id: newSessionId,
          userid: user._id,
        });
        await newSession
          .save()
          .then((session) => {
            res.cookie("sid", newSessionId);
          })
          .catch((err) => res.send(err.message));
        res.send({
          username: req.user.username,
          id: req.user._id,
          cart: userG.cart,
          orders: userG.orders,
        });
      });
    }
  })(req, res, next);
});

app.post("/logout", async (req, res) => {
  res.clearCookie("sid");
  if (req.user && req.user._id) {
    await Sessions.findOneAndDelete({ userid: req.user._id })
      .then(() => console.log("deleted"))
      .catch((err) => console.log(err.message));
  }
  req.logout();
  res.send(req.user);
});

app.post("/cart", checkAuth, async (req, res) => {
  console.log(req.session, "session");
  let result = {};
  if (req.body.method === "ADD") {
    if (req.session.user && req.session.user.id) {
      await User.findByIdAndUpdate(req.session.user.id, {
        $push: { cart: req.body.itemId },
      })
        .then(async (userReturned) => {
          result = userReturned;
          await User.findById(req.session.user.id)
            .then((userGiven) => {
              console.log("id", req.session.user.id);
              result = {
                id: userGiven.id,
                username: userGiven.username,
                cart: userGiven.cart,
                orders: userGiven.orders,
              };
            })
            .catch((err) => console.log(err.message));
        })
        .catch((err) => console.log(err.message));
    }
  }
  if (req.body.method === "REMOVE") {
    if (req.session.user && req.session.user.id) {
      await User.findByIdAndUpdate(req.session.user.id, {
        $pull: { cart: req.body.itemId },
      })
        .then(async (userReturned) => {
          result = userReturned;
          await User.findById(req.session.user.id)
            .then((userGiven) => {
              console.log("id", req.session.user.id);
              result = {
                id: userGiven.id,
                username: userGiven.username,
                cart: userGiven.cart,
                orders: userGiven.orders,
              };
            })
            .catch((err) => console.log(err.message));
        })
        .catch((err) => console.log(err.message));
    }
  }
  console.log("res", result);
  res.send(result);
});

app.post("/orders", checkAuth, async (req, res) => {
  console.log(req.session, "session");
  let result = {};
  if (req.body.method === "ADD") {
    if (req.session.user && req.session.user.id) {
      await User.findByIdAndUpdate(req.session.user.id, {
        $push: { orders: req.body.itemId },
      })
        .then(async (userReturned) => {
          result = userReturned;
          await User.findById(req.session.user.id)
            .then((userGiven) => {
              console.log("id", req.session.user.id);
              result = {
                id: userGiven.id,
                username: userGiven.username,
                cart: userGiven.cart,
                orders: userGiven.orders,
              };
            })
            .catch((err) => console.log(err.message));
        })
        .catch((err) => console.log(err.message));
      await User.findByIdAndUpdate(req.session.user.id, {
        $pull: { cart: req.body.itemId },
      })
        .then(async (userReturned) => {
          result = userReturned;
          await User.findById(req.session.user.id)
            .then((userGiven) => {
              console.log("id", req.session.user.id);
              result = {
                id: userGiven.id,
                username: userGiven.username,
                cart: userGiven.cart,
                orders: userGiven.orders,
              };
            })
            .catch((err) => console.log(err.message));
        })
        .catch((err) => console.log(err.message));
    }
  }
  if (req.body.method === "REMOVE") {
    if (req.session.user && req.session.user.id) {
      await User.findByIdAndUpdate(req.session.user.id, {
        $pull: { orders: req.body.itemId },
      })
        .then(async (userReturned) => {
          result = userReturned;
          await User.findById(req.session.user.id)
            .then((userGiven) => {
              console.log("id", req.session.user.id);
              result = {
                id: userGiven.id,
                username: userGiven.username,
                cart: userGiven.cart,
                orders: userGiven.orders,
              };
            })
            .catch((err) => console.log(err.message));
        })
        .catch((err) => console.log(err.message));
    }
  }
  console.log("res", result);
  res.send(result);
});

app.get("/item", checkAuth, async (req, res) => {
  let result = {};
  await SampleData.findById(req.query.itemId)
    .then((dataGiven) => {
      result = dataGiven;
      console.log(dataGiven.id);
    })
    .catch((err) => {
      result = { err: err.message };
    });
  res.send(result);
});
