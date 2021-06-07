const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {

let letters = ["a","b", "c", "d", "e", "f", "g", "h", "i", "j", "k","l","m", "n","o","p","q","r","s","t","u","v","w","x","y","z"]

return `${letters[Math.round(Math.random()*9)]}` + `${Math.round(Math.random()*9)}` + `${letters[Math.round(Math.random()*9)]}`+`${Math.round(Math.random()*9)}` + `${letters[Math.round(Math.random()*9)]}` + `${Math.round(Math.random()*9)}`;

};

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  834: "http://www.reddit.com",
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


