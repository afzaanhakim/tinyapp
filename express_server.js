const express = require("express");
const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
let cookieParser = require('cookie-parser');
app.use(cookieParser())


function generateRandomString() {

let letters = ["a","b", "c", "d", "e", "f", "g", "h", "i", "j", "k","l","m", "n","o","p","q","r","s","t","u","v","w","x","y","z"]

return `${letters[Math.round(Math.random()*9)]}` + `${Math.round(Math.random()*9)}` + `${letters[Math.round(Math.random()*9)]}`+`${Math.round(Math.random()*9)}` + `${letters[Math.round(Math.random()*9)]}` + `${Math.round(Math.random()*9)}`;

}; //  function to generate random string

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {

};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 
//test page
app.get("/", (req, res) => {
  res.redirect(`/urls`);
}); 
//list of URLs in database// homepage
app.get("/urls", (req, res) => {
  console.log(req.cookies)
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// page for creating a new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
username: req.cookies["username"],
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  console.log(templateVars.username)
  res.render("urls_show", templateVars);
});
// page for the newly generated short URL 
app.post("/urls", (req, res) => {
  let longURL = req.body["longURL"]
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);         
});
//redirecting to the website once clicked on the new generated shortURL
app.get("/u/:shortURL", (req, res) => {
let longURL = `${urlDatabase[req.params.shortURL]}`
  res.redirect(longURL);
});

//redirecting to the urls page once clicked on delete for a specific short url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  });

//redirects to the existing shortURL page where user can edit the short URL to correspond to a new Long URL
  app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body["longURL"]
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
   res.redirect(`/urls`);
  });
  

  //adding an endpoint to handle a POST to /login

  app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
     res.redirect(`/urls`);
    });
    
  //adding an endpoint to handle a POST to /logout
  app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
    res.redirect(`/urls`);
        });
        


  
