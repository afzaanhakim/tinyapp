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


const urlsForUser = function(id, database){
let userUrls = {};

for (let shortURL in database){
  if (database[shortURL].userID === id){
    userUrls[shortURL] = database[shortURL]
  }
} return userUrls;
}
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//homepage page
app.get("/", (req, res) => {
  res.redirect(`/login`);
});
//list of URLs in database// homepage once user logs in
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const userUrls = urlsForUser(userId, urlDatabase)
  const templateVars = { urls: userUrls, user };

  if (!userId){
    res.status(401).send("Unauthorized access, please login first")
  }
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
  console.log("HERE IS THE GET REQ")
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
   const longURL = urlDatabase[req.params.shortURL].longURL
  const user = users[userId];
  const userUrls = urlsForUser(userId, urlDatabase)
  if (!urlDatabase[shortURL]){
    res.status(401).send("Unauthorized access, please login first")
  }
  else if (!userId || !userUrls[shortURL]) {

    res.status(404).send("This shortURL does not exist")
  } else{
  const templateVars = {
    user,
    shortURL,
    userUrls,
    urlDatabase,
    longURL
  };

  res.render("urls_show", templateVars);
}});
// page for the newly generated short URL
app.post("/urls", (req, res) => {
  console.log(req.cookies["user_id"]);
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies.user_id };
 
  res.redirect(`/urls/${shortURL}`);}
 
);
//redirecting to the website once clicked on the new generated shortURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = `${urlDatabase[req.params.shortURL]}`;
  res.redirect(`/urls/${shortURL}`);
});
//redirecting to the urls page once clicked on delete for a specific short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies["user_id"]
  console.log('THIS IS USER ID ' + userId)
console.log('THIS IS :'+ shortURL)
console.log(urlDatabase[shortURL])

  if (urlDatabase[shortURL].userID !== userId) {
    res.status(401).send("You do not have access to do this")
  } 
  else {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);}
});

//redirects to the existing shortURL page where user can edit the short URL to correspond to a new Long URL
app.post("/urls/:shortURL", (req, res) => {

  console.log("ACCESSING POST EDIT ROUTE")
  const userId = req.cookies["user_id"];
  const longURL = req.body["longURL"];
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL;
 // urlDatabase[shortURL].longURL.userID = userId;

  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId) {
  res.redirect(`/urls`); }
  else {
    res.status(401).send("You dont have access to do this!")
  }
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
  if (user) {
    return res.status(400).send("User already exists");
  }
  id = generateRandomString();
  user = { id, email, password };

  users[id] = user;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// created get /login as endpoint for the new login form template
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});
