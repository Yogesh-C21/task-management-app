const express = require('express');
const UserController = require('../controllers/userController');
const Validation = require('../utils/validationHandlers');
const AuthMiddleware = require('../middleware/authMiddleware');
const AccessControl = require("../middleware/rbacMiddleware")
const router = express.Router();

// Admin Specific Routes (Only admin can add/delete users/managers)
router.post('/register', AccessControl.isAdmin, Validation.validateRegister(), UserController.register);
router.delete('/:id', AccessControl.isAdmin, AuthMiddleware.isLogin, UserController.deleteUser);

// Common routes for all
router.post('/login', Validation.validateLogin(), UserController.login);
router.post('/logout', AuthMiddleware.isLogin, UserController.logout);
router.get('/:id', AuthMiddleware.isLogin, AccessControl.userGetRestrictAccess, UserController.getUserProfile);
router.get('/user/list', AuthMiddleware.isLogin, AccessControl.userListRestrictAccess, UserController.getUserProfileList);
router.put('/:id', AuthMiddleware.isLogin, AccessControl.userUpdateRestrictAccess, UserController.updateUserProfile);
router.put('/manager/assign', Validation.validateManagerAssign(), AuthMiddleware.isLogin, AccessControl.assignManagerRestrictAccess, UserController.assignUserManager);

module.exports = router;
