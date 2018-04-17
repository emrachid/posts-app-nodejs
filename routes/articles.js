const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// Bring in Models
const Article = require('../models/article');
const User = require('../models/user');

// Access control
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

// Add articles route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article');
});

const addArticleValidator = [
  check('title').isLength({ min: 1 }).withMessage('Title is required'),
  check('body').isLength({ min: 1 }).withMessage('Body is required'),
];

// Add Submit POST Route
router.post('/add', ensureAuthenticated, addArticleValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((error) => {
      req.flash('danger', error.msg);
    });
    res.redirect('/articles/add');
  } else {
    const article = new Article({
      title: req.body.title,     // "req.user" is the current user logged in.
      author: req.user.username, // "username" or "email" can be used here because they are uniques in DB.
      body: req.body.body,       // "author" will be used in 'Get a single article route'
    });

    article.save((err) => {
      if (err) {
        console.log(err);
        req.flash('danger', err.errmsg);
        res.redirect('/articles/add');
      } else {
        req.flash('success', 'Article Added');
        res.redirect('/');
      }
    });
  }
});

// Load edit form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (err) {
      console.log(err);
      req.flash('danger', err.errmsg);
      res.redirect('/');
    } else if (req.user.username !== article.author) {
      req.flash('danger', 'Access denied');
      res.redirect('/');
    } else {
      res.render('edit_article', {
        article,
      });
    }
  });
});

// Updade post route - called by submit form
router.post('/edit/:id', ensureAuthenticated, (req, res) => {
  const updateData = {
    title: req.body.title,
    body: req.body.body,
  };

  // only author can update post
  Article.findById(req.params.id, (err, article) => {
    if (err) {
      console.log(err);
      req.flash('danger', err.errmsg);
      res.redirect('/');
    } else if (req.user.username !== article.author) {
      req.flash('danger', 'Access denied');
      res.redirect('/');
    } else {
      // using set only listed fields will be updated. So, it will not change the author
      Article.update({ _id: req.params.id }, { $set: updateData }, (err) => {
        if (err) {
          console.log(err);
          req.flash('danger', err.errmsg);
          res.redirect('/articles/edit/' + req.params.id);
        } else {
          req.flash('success', 'Article Updated');
          res.redirect('/');
        }
      });
    }
  });
});

// Get a single article route
router.get('/:id', (req, res) => {
  // fetch article
  Article.findById(req.params.id, (err, article) => {
    if (err) {
      console.log(err);
      req.flash('danger', err.errmsg);
      res.redirect('/');
    } else {
      // fetch author data
      User.findOne({ username: article.author }, (err, user) => {
        if (err) {
          console.log(err);
          req.flash('danger', err.errmsg);
          res.redirect('/');
        } else {
          res.render('article', {
            article,
            author: user,
          });
        }
      });
    }
  });
});

// Delete article route - called by Ajax
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (err) {
      res.status(500).send();
    } else if (article.author !== req.user.username) {
      res.status(403).send();
    } else {
      Article.remove({ _id: req.params.id }, (err) => {
        if (err) {
          console.log(err)
          req.flash('danger', err.errmsg);
          res.redirect('/articles/' + req.params.id);
        } else {
          req.flash('success', 'Article Deleted');
          res.send('Success');
        }
      });
    }
  });
});

module.exports = router;
