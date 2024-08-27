const express = require("express");
const AuthMiddleware = require("../middleware/authMiddleware");
const TaskController = require("../controllers/taskController");
const Validation = require('../utils/validationHandlers');
const AccessControl = require("../middleware/rbacMiddleware")
const router = express.Router();

router.post("/create", AuthMiddleware.isLogin, AccessControl.taskCreateDeleteRestriction, TaskController.createTask); // manager/admin
router.delete("/:id", AuthMiddleware.isLogin, AccessControl.taskCreateDeleteRestriction, TaskController.deleteTask); // manager/admin


router.get("/:id", AuthMiddleware.isLogin, AccessControl.getOneTaskRestrictAccess, TaskController.getTask); // for all
router.get("/task/list", AuthMiddleware.isLogin, TaskController.getAllTask);
router.get("/task/analytics", AuthMiddleware.isLogin, TaskController.getTaskAnalytics);
router.put("/:id", AuthMiddleware.isLogin, AccessControl.updateTaskRestrictAccess,TaskController.updateTask); // for all
router.put("/task/assign", Validation.validateTaskAssign(), AuthMiddleware.isLogin, AccessControl.assignTaskRestrictAccess, TaskController.assignTask); // for managers/admin


module.exports = router;
