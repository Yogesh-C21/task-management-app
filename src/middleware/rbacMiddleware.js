const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("../config/config");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const ResponseHandler = require("../utils/responseHandlers")

class AccessControl {
  static async isAdmin(req, res, next) {
    const token = req.cookies.accessToken;
    let decoded;
    if (token) {
      decoded = jwt.verify(token, config.getJwtSecret());
      if(decoded && decoded.role == "admin") {
        return next();
      } else {
        ResponseHandler.authError(res, "Unauthorized Access", 403);
      }
    } else if(req.body && req.body.role === "admin") {
      return next();
    } else {
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    }
  }
  static async userGetRestrictAccess(req, res, next) {
    try {
      const userId = req.params.id;
      const loggedInUser = req.user;
      const user = await User.findById(req.params.id);
      let managerId;
      if (user && user.manager_id) {
        managerId = user.manager_id.toString();
      }
      if (
        loggedInUser.role === "admin" ||
        loggedInUser.id === userId ||
        loggedInUser.id === managerId
      ) {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async userListRestrictAccess(req, res, next) {
    try {
      const loggedInUser = req.user;
      if (loggedInUser.role === "admin" || loggedInUser.role === "manager") {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async userUpdateRestrictAccess(req, res, next) {
    try {
      const userId = req.params.id;
      const loggedInUser = req.user;
      if (loggedInUser.role !== "admin" && (req.body.role || req.body.manager_id)) {
        ResponseHandler.authError(res, "Changing role is restricted to admin only", 403);
      }
      if (req.body.manager_id) {
        let manager = await User.findById(req.body.manager_id);
        if (manager.role !== "manager") {
          ResponseHandler.authError(res, "Only manager can be assigned as a manager", 403);
        }
      }
      if (loggedInUser.role === "admin" || loggedInUser.id === userId) {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async taskCreateDeleteRestriction(req, res, next) {
    const allowedAccess = ["admin", "manager"];
    try {
      if (!allowedAccess.includes(req.user.role)) {
        ResponseHandler.authError(res, "Unauthorized Access", 403);
      }
      return next();
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async getOneTaskRestrictAccess(req, res, next) {
    try {
      const loggedInUser = req.user;
      const taskId = req.params.id;
      const task = await Task.findById(taskId);
      const managerId =
        task && task.created_by ? task.created_by.toString() : null;
      const userId =
        task && task.assigned_to ? task.assigned_to.toString() : null;
      if (
        loggedInUser.role === "admin" ||
        loggedInUser.id === userId ||
        loggedInUser.id === managerId
      ) {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async updateTaskRestrictAccess(req, res, next) {
    try {
      const loggedInUser = req.user;
      const taskId = req.params.id;
      const task = await Task.findById(taskId);
      const managerId =
        task && task.created_by ? task.created_by.toString() : null;
      const userId =
        task && task.assigned_to ? task.assigned_to.toString() : null;
      if (
        loggedInUser.role === "user" &&
        (req.body.assigned_to || req.body.created_by)
      ) {
        ResponseHandler.authError(res, "User cannot change assignee or reporter.", 403);
      }
      if (loggedInUser.role === "manager" && req.body.created_by) {
        ResponseHandler.authError(res, "Manager cannot change reporter.", 403);
      }
      if (
        loggedInUser.role === "admin" ||
        loggedInUser.id === userId ||
        loggedInUser.id === managerId
      ) {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async assignTaskRestrictAccess(req, res, next) {
    try {
      const loggedInUser = req.user;
      const task = await Task.findById(new mongoose.Types.ObjectId(req.body.task_id));
      const user = await User.findById(new mongoose.Types.ObjectId(req.body.user_id));
      const taskManagerId =
        task && task.created_by ? task.created_by.toString() : null;
      const userManagerId = user && user.manager_id ? user.manager_id.toString() : null;
      if (loggedInUser.role === "admin" || (loggedInUser.id === taskManagerId && loggedInUser.id === userManagerId)) {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  static async assignManagerRestrictAccess(req, res, next) {
    try {
      const loggedInUser = req.user;
      if (loggedInUser.role === "admin") {
        return next();
      }
      ResponseHandler.authError(res, "Unauthorized Access", 403);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
}

module.exports = AccessControl;
