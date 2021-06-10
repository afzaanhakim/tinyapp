const express = require("express");
const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
let cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = { 
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// function to check if user email is already there in the database
const userExistsByEmail = function (email) {
  const keys = Object.keys(users);
  for (const key of keys) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};
//  function to generate random string
function generateRandomString() {
  let letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  return (
    `${letters[Math.round(Math.random() * 9)]}` +
    `${Math.round(Math.random() * 9)}` +
    `${letters[Math.round(Math.random() * 9)]}` +
    `${Math.round(Math.random() * 9)}` +
    `${letters[Math.round(Math.random() * 9)]}` +
    `${Math.round(Math.random() * 9)}`
  );
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//homepage page
app.get("/", (req, res) => {
  res.redirect(`/urls`);
});
//list of URLs in database// homepage once user logs in
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];

  const user = users[userId];
  // console.log(mainUser.id);
  console.log(urlDatabase);
  const templateVars = { user: user, urls: urlDatabase };

  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// page for creating a new shortURL only when logged in
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (user) {
    const templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user:user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };

  res.render("urls_show", templateVars);
});
// page for the newly generated short URL
app.post("/urls", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${shortURL}`);
});
//redirecting to the website once clicked on the new generated shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = `${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});

//redirecting to the urls page once clicked on delete for a specific short url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//redirects to the existing shortURL page where user can edit the short URL to correspond to a new Long URL
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body["longURL"];
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

//adding an endpoint to handle a POST to /login

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Cannot leave fields empty");
  }
  let user = userExistsByEmail(email);

  if (!user) {
    return res.status(403).send("User Not Found");
  }
  if (user) {
    if (user.password !== password) {
      return res.status(403).send("Email or Password does not match records");
    }
  }
  res.cookie("user_id", user.id);
  res.redirect(`/urls`);
});

//adding an endpoint to handle a POST to /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
});

//created get for /register to render the regesrations template
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("urls_registration", templateVars);
});
//register post for new users, checking if user already exists or empty fields and providing a response accordingly
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Cannot leave fields empty");
  }
  let user = userExistsByEmail(email);
  let id;
  console.log(user);
  if (user) {
    return res.status(400).send("User already exists");
  }
  id = generateRandomString();
  // console.log(newUserID);
  user = { id, email, password };

  users[id] = user;
  res.cookie("user_id", id);
  // console.log(users[id])
  res.redirect("/urls");
});

// created get /login as endpoint for the new login form template
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});
