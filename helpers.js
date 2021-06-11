

const getUserByEmail = function (email, users) {
  const keys = Object.keys(users);
  for (const key of keys) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

function generateRandomString() {
  let letters = ["a","b", "c", "d", "e", "f", "g", "h", "i", "j", "k","l","m", "n","o","p","q","r","s","t","u","v","w","x","y","z"];
  return (
    `${letters[Math.round(Math.random() * 9)]}` +
    `${Math.round(Math.random() * 9)}` +
    `${letters[Math.round(Math.random() * 9)]}` +
    `${Math.round(Math.random() * 9)}` +
    `${letters[Math.round(Math.random() * 9)]}` +
    `${Math.round(Math.random() * 9)}`
  );
}

const urlsForUser = function (id, database) {
  let userUrls = {};

  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
