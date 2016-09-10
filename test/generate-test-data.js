const faker = require('faker');

function createUserObject(yearOne, yearTwo, amountToCreate) {
  const userArray = [];
  for (var i = 1; i <= amountToCreate; i++) {
    userArray.push({
      id: faker.random.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      created_at: faker.date.between(yearOne, yearTwo)
    });
  }
  return userArray;
}

module.exports = {
  createUserObject
};
