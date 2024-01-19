const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});


function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const books = await getAllBooks();
    res.send(JSON.stringify(books));
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[parseInt(isbn)]) {
      resolve(books[parseInt(isbn)]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} value is not found` });
    }
  }).then(
    result => res.send(result),
    error => res.status(error.status).json({ message: error.message })
  );
});

// Get all books by author name
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author;
  getAllBooks()
    .then((booksdb) => Object.values(booksdb))
    .then((books) => books.filter((book) => book.author === author))
    .then((Fbooks) => res.send(Fbooks));
});

// Get all books by book title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;
  getAllBooks()
    .then((booksdb) => Object.values(booksdb))
    .then((books) => books.filter((book) => book.title === title))
    .then((Fbooks) => res.send(Fbooks));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  let filteredBook = books[isbn];
  if (filteredBook) {
    return res.send(filteredBook.reviews);
  }
  else {
    return res.send("No available reviews under isbn " + isbn)
  }
});

module.exports.general = public_users;
