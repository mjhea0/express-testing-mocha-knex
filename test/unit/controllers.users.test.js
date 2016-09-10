process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();

const usersController = require('../../src/server/controllers/users');

describe('controllers : users', () => {

  describe('filterByYear()', () => {
    const userArray = [
      {
        id: 1,
        username: 'michael',
        email: 'michael@mherman.org',
        created_at: '2016-09-10T16:44:28.015Z'
      },
      {
        id: 2,
        username: 'mike',
        email: 'mike@mherman.org',
        created_at: '2015-09-10T16:44:28.015Z'
      },
      {
        id: 3,
        username: 'mike',
        email: 'mike@mherman.org',
        created_at: '2014-09-10T16:44:28.015Z'
      }
    ];
    it('should return all users created on or after (>=) specified year',
    (done) => {
      usersController.filterByYear(userArray, 2015, (err, total) => {
        should.not.exist(err);
        total.length.should.eql(2);
        done();
      });
    });
  });

});
