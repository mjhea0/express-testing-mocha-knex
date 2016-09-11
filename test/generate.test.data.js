const faker = require('faker');
const fs = require('fs');
const path = require('path');

function createUserObject(
  yearOne, yearTwo, amountToCreate, callback) {
  const userArray = [];
  for (var i = 1; i <= amountToCreate; i++) {
    userArray.push({
      id: faker.random.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      created_at: faker.date.between(yearOne, yearTwo)
    });
  }
  callback(null, userArray);
}

createUserObject(2010, 2014, 10, (err, beforeDates) => {
  if (!err) {
    createUserObject(2015, 2016, 5, (err, onOrAfterDates) => {
      const userArray = beforeDates.concat(onOrAfterDates);
      fs.writeFile(
        path.join(__dirname, 'test.data.json'),
        JSON.stringify(userArray, null, 2),
        (err) => {
        if (!err) {
          return true;
        }
      });
    });
  }
  return false;
});
