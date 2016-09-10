const knex = require('./knex');

function getAllUsers(callback) {
  return knex('users').select('*')
  .then((users) => {
    callback(null, users);
  })
  .catch((err) => {
    callback(err);
  });
}

function getSingleUser(userID, callback) {
  return knex('users')
  .select('*')
  .where({
    id: parseInt(userID)
  })
  .then((user) => {
    callback(null, user);
  })
  .catch((err) => {
    callback(err);
  });
}

function addUser(userObject, callback) {
  return knex('users')
  .insert(userObject)
  .returning('*')
  .then((user) => {
    callback(null, user);
  })
  .catch((err) => {
    callback(err);
  });
}

function updateUser(
  userID, userObject, callback) {
  return knex('users')
  .update(userObject)
  .where({
    id: userID
  })
  .returning('*')
  .then((user) => {
    callback(null, user);
  })
  .catch((err) => {
    callback(err);
  });
}

function deleteUser(userID, callback) {
  return knex('users')
  .del()
  .where({
    id: userID
  })
  .returning('*')
  .then((user) => {
    callback(null, user);
  })
  .catch((err) => {
    callback(err);
  });
}

module.exports = {
  getAllUsers,
  getSingleUser,
  addUser,
  updateUser,
  deleteUser
};
