// controllers/taskController.js
const Task = require("../models/taskModel");
const mongoose = require("mongoose");
const ResponseHandler = require("../utils/responseHandlers");
const { validationResult } = require("express-validator");
const redisClient = require("../database/redis");
const transporter = require("../services/mailService");
const config = require("../config/config");
const User = require("../models/userModel");

class TaskController {
  async createTask(req, res) {
    try {
      req.body.created_by = req.user.id;
      const task = new Task(req.body);
      await task.save();
      if (redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.created(res, "Task created", task);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  async deleteTask(req, res) {
    try {
      const resp = await Task.findByIdAndDelete(req.params.id);
      if (!resp) {
        return ResponseHandler.failure(res, "Not Found", 404);
      }
      if (redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.success(res, "Deleted successfully", resp);
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }
  async getTask(req, res) {
    try {
      const cacheKey = `task-detail:${req.params.id}`;
      if (redisClient.redis) {
        const task = await redisClient.get(cacheKey);
        if (task) {
          ResponseHandler.success(res, "Task Fetched", JSON.parse(task));
        }
      }
      const task = await Task.findById(req.params.id);
      if (!task) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if (redisClient.redis) {
        await redisClient.set(cacheKey, JSON.stringify(task));
      }
      ResponseHandler.success(res, "Fetched successfully", task);
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }
  async getAllTask(req, res) {
    try {
      const cacheKey = `tasks-list:${req.user.id}`;
      if (redisClient.redis) {
        const tasks = await redisClient.get(cacheKey);
        if (tasks) {
          ResponseHandler.success(res, "Tasks Fetched", JSON.parse(tasks));
        }
      }
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const tasks =
        req.user.role === "admin"
          ? await Task.find()
          : await Task.find({
              $or: [{ created_by: userId }, { assigned_to: userId }],
            });
      if (!tasks) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if (redisClient.redis) {
        await redisClient.set(cacheKey, JSON.stringify(tasks));
      }
      ResponseHandler.success(res, "Task(s) Fetched", tasks);
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }
  async updateTask(req, res) {
    try {
      let updateData = req.body;
      if (updateData.assigned_to) {
        updateData.assigned_to = new mongoose.Types.ObjectId(
          updateData.assigned_to
        );
      }
      if (updateData.created_by) {
        updateData.created_by = new mongoose.Types.ObjectId(
          updateData.created_by
        );
      }
      const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });
      if (!task) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if (config.getEmailEnabled() && updateData.assigned_to) {
        const user = await User.findById(new mongoose.Types.ObjectId(updateData.assigned_to));
        let mailOptions = {
          from: `"Sender" ${config.getMailId()}`,
          to: "serviceproduct6@gmail.com",
          subject: "Task Update",
          text: `Hey ${user.username}!! You have been an update for the task ${task.title} : ${task._id}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
        });
      }
      if (redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.success(res, "Task Updated", task);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  async assignTask(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.failure(res, "Validation failed", 400, errors);
    }
    try {
      let { user_id, task_id } = req.body;
      const task = await Task.findByIdAndUpdate(
        new mongoose.Types.ObjectId(task_id),
        { assigned_to: new mongoose.Types.ObjectId(user_id) },
        { new: true }
      );
      if (config.getEmailEnabled()) {
        const user = await User.findById(new mongoose.Types.ObjectId(user_id));
        let mailOptions = {
          from: `"Sender" ${config.getMailId()}`,
          to: "serviceproduct6@gmail.com",
          subject: "Task Update",
          text: `Hey ${user.username}!! You have been assigned the task ${task.title} : ${task._id}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
        });
      }
      if (!task) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if (redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.success(res, "Task Assigned", task);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  async getTaskAnalytics(req, res) {
    try {
      const cacheKey = `tasks-analytics:${req.user.id}`;
      if (redisClient.redis) {
        const analytics = await redisClient.get(cacheKey);
        if (analytics) {
          ResponseHandler.success(
            res,
            "Analytics Fetched",
            JSON.parse(analytics)
          );
        }
      }
      const now = new Date();
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const queryPending = {
        $and: [
          {
            $or: [{ created_by: userId }, { assigned_to: userId }],
          },
          { task_status: "pending" },
        ],
      };
      const queryCompleted = {
        $and: [
          {
            $or: [{ created_by: userId }, { assigned_to: userId }],
          },
          { task_status: "completed" },
        ],
      };
      const pendingCount =
        req.user.role === "admin"
          ? await Task.countDocuments({ task_status: "pending" })
          : await Task.countDocuments(queryPending);
      const completedCount =
        req.user.role === "admin"
          ? await Task.countDocuments({ task_status: "completed" })
          : await Task.countDocuments(queryCompleted);
      const overdueCount =
        req.user.role === "admin"
          ? await Task.countDocuments({
              task_status: "pending",
              due_date: { $lt: now },
            })
          : await Task.countDocuments({
              $and: [
                {
                  $or: [{ created_by: userId }, { assigned_to: userId }],
                },
                { task_status: "pending" },
                { due_date: { $lt: now } },
              ],
            });
      const data = {
        pending: pendingCount,
        completed: completedCount,
        overdue: overdueCount,
      };
      if (redisClient.redis && data) {
        await redisClient.set(cacheKey, JSON.stringify(data));
      }
      ResponseHandler.success(res, "Fetched Analytics", data);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
}

module.exports = new TaskController();
