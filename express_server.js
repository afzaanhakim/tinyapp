const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const express = require("express");
const app = express();
app.use(express.json());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const bcrypt = require("bcrypt");

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["KISSY"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

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

// Server Listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//if user is logged in redirects to /urls otherwise takes user to /login page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});
//list of URLs in database// renders urls_index once user logs in, reponds with an error if user is not logged in
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: userUrls, user };

  if (!userId) {
    res.status(401).send("Unauthorized access, please login or register first");
  }
  res.render("urls_index", templateVars);
});

// page for creating a new shortURL only when logged in otherwise redirects to login page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    const templateVars = {
      user,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// if a user owns the url then displays the page to update url, shortURL and long URL, else shows error when user is not logged in/if a different user is trying to access this url update
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const user = users[userId];
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!urlDatabase[shortURL]) {
    res.status(401).send("Unauthorized access, please login first");
  } else if (!userId || !userUrls[shortURL]) {
    res.status(404).send("You don't have access to this shortURL");
  } else {
    const templateVars = {
      user,
      shortURL,
      userUrls,
      urlDatabase,
      longURL,
    };

    res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let longURL = req.body["longURL"];
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };

    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You don't have access to do that");
  }
});

//redirecting to the longURL once clicked on the new generated shortURL if shortURL exists in database else shows a message with a 404 error status
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.status(404).send("This URL does not exist");
  }
});
//redirecting to the urls page once clicked on delete for a specific short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;

  if (urlDatabase[shortURL].userID !== userId) {
    res.status(401).send("You do not have access to do this");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

//if user is logged in and owns url updates url and redirects to /urls else returns no access error page
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const longURL = req.body["longURL"];
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL;

  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId) {
    res.redirect(`/urls`);
  } else {
    res.status(401).send("You dont have access to do this!");
  }
});

//if email and password match this sets a cookie and redirects to /urls  else shows a relevant error message

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Cannot leave fields empty");
  }
  let user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("User Not Found");
  }
  if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).send("Email or Password does not match records");
    }
  }
  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

//deletes the user session and redirects to /login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

//if a user is logged redirecting to /urls page else redirects to /register
app.get("/register", (req, res) => {
  let userId = req.session.user_id;
  const templateVars = { user: users[req.session.user_id] };
  if (userId) {
    res.redirect("/urls");
    return;
  }

  res.render("urls_registration", templateVars);
});
//if user does not exist in database this creates a new user, redirects to /urls, sets cookie, if user exists then returns an error message, if input fields are empty, then returns a warning page
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Cannot leave fields empty");
  }
  let user = getUserByEmail(email, users);
  let id;
  if (user) {
    return res.status(400).send("User already exists");
  }
  id = generateRandomString();
  user = { id, email, password: hashedPassword };
  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

// if user is logged in already this redirects to /urls , if not logged in it will render the login page
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: users[req.session.user_id] };
  if (userId) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", templateVars);
});
