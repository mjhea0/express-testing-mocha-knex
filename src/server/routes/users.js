const express = require('express');
const router = express.Router();

const knex = require('../db/knex');

// *** GET ALL users *** //
router.get('/', (req, res, next) => {
  knex('users').select('*')
  .then((users) => {
    res.status(200).json({
      status: 'success',
      data: users
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});

// *** GET SINGLE user *** //
router.get('/:id', (req, res, next) => {
  const userID = parseInt(req.params.id);
  knex('users')
  .select('*')
  .where({
    id: userID
  })
  .then((users) => {
    res.status(200).json({
      status: 'success',
      data: users
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});

// *** add a user *** //
router.post('/', (req, res, next) => {
  const newUsername = req.body.username;
  const newEmail = req.body.email;
  knex('users')
  .insert({
    username: newUsername,
    email: newEmail
  })
  .returning('*')
  .then((user) => {
    res.status(201).json({
      status: 'success',
      data: user
    });
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({
      status: 'error',
      data: err
    });
  });
});

module.exports = router;
