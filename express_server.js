const express = require("express");
const app = express();
app.use(express.json())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {

let letters = ["a","b", "c", "d", "e", "f", "g", "h", "i", "j", "k","l","m", "n","o","p","q","r","s","t","u","v","w","x","y","z"]

return `${letters[Math.round(Math.random()*9)]}` + `${Math.round(Math.random()*9)}` + `${letters[Math.round(Math.random()*9)]}`+`${Math.round(Math.random()*9)}` + `${letters[Math.round(Math.random()*9)]}` + `${Math.round(Math.random()*9)}`;

};

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "www.lighthouselabs.ca",
  "9sm5xK": "www.google.com",
  834: "www.reddit.com",
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
  let longURL = req.body["longURL"]
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);         
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params.shortURL)
  console.log(urlDatabase[req.params.shortURL])
  
let longURL = `http://${urlDatabase[req.params.shortURL]}`
  res.redirect(longURL);
});