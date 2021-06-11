const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  apple: {
    id: "apple",
    email: "a@example.com",
    password: "purple-monkey-dinosaur",
  },
  banana: {
    id: "banana",
    email: "b@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    let email = "a@example.com";
    const user = getUserByEmail(email, testUsers);
    const expectedOutput = testUsers["apple"];

    assert.equal(user, expectedOutput);
  });

  it("should return undefined when email does not exist", function () {
    let email = "lfc@example.com";
    const user = getUserByEmail(email, testUsers);
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });
});
