const express = require('express');
const router = express.Router();

const userQueries = require('../db/queries.users');
const validate = require('./validation');

// *** GET ALL users *** //
router.get('/', (req, res, next) => {
  userQueries.getAllUsers((err, users) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        data: err
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: users
      });
    }
  });
});

// *** GET SINGLE user *** //
router.get('/:id',
  validate.validateUserResources,
  (req, res, next) => {
  const userID = parseInt(req.params.id);
  userQueries.getSingleUser(userID, (err, users) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        data: err
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: users
      });
    }
  });
});

// *** add a user *** //
router.post('/',
  validate.validateUserResources,
  (req, res, next) => {
  const userObject = {
    username: req.body.username,
    email: req.body.email
  };
  userQueries.addUser(userObject, (err, users) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        data: err
      });
    } else {
      res.status(201).json({
        status: 'success',
        data: users
      });
    }
  });
});

// *** update a user *** //
router.put('/:id',
  validate.validateUserResources,
  (req, res, next) => {
  const userID = parseInt(req.params.id);
  const userObject = {
    username: req.body.username,
    email: req.body.email
  };
  userQueries.updateUser(userID, userObject, (err, users) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        data: err
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: users
      });
    }
  });
});

// *** delete a user *** //
router.delete('/:id',
  validate.validateUserResources,
  (req, res, next) => {
  const userID = parseInt(req.params.id);
  userQueries.deleteUser(userID, (err, users) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        data: err
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: users
      });
    }
  });
});

module.exports = router;
