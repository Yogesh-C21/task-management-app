const { check } = require('express-validator');

class Validation {
  static validateRegister() {
    return [
      check('username', 'Username is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('role')
        .not().isEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'manager', 'user'])
        .withMessage('Role must be one of: admin, manager, user'),
      check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    ];
  }

  static validateLogin() {
    return [
      check('email', 'Valid email is required').isEmail(),
      check('password', 'Password is required').exists(),
    ];
  }

  static validateTaskAssign() {
    return [
      check('task_id', 'task_id required and should be a hash').isLength({ min: 20 }),
      check('user_id', 'user_id required and should be a hash').isLength({ min: 20 }),
    ];
  }

  static validateManagerAssign() {
    return [
      check('manager_id', 'manager_id required and should be a hash').isLength({ min: 20 }),
      check('user_id', 'user_id required and should be a hash').isLength({ min: 20 }),
    ];
  }

}

module.exports = Validation;
