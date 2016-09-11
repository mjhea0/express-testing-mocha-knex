function validateUserResources(req, res, next) {
  if (req.method === 'GET') {
    req.checkParams('id', 'Must be valid').notEmpty().isInt();
  } else if (req.method === 'POST') {
    req.checkBody('username', 'Username cannot be empty').notEmpty();
    req.checkBody('email', 'Must be a valid email').isEmail();
  } else if (req.method === 'PUT') {
    req.checkParams('id', 'Must be valid').notEmpty().isInt();
    req.checkBody('username', 'Username cannot be empty').notEmpty();
    req.checkBody('email', 'Must be a valid email').isEmail();
  } else if (req.method === 'DELETE') {
    req.checkParams('id', 'Must be valid').notEmpty().isInt();
  }
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({
      message: 'Validation failed',
      failures: errors
    });
  } else {
    return next();
  }
}

module.exports = {
  validateUserResources
};
