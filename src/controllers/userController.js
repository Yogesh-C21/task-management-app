const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const ResponseHandler = require("../utils/responseHandlers");
const { validationResult } = require("express-validator");
const config = require("../config/config");
const redisClient = require('../database/redis');

class UserController {
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.failure(res, "Validation failed", 403);
    }
    const { username, email } = req.body;
    try {
      let user = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });
      if (user) {
        return ResponseHandler.failure(res, "Already exists", 403);
      }
      user = new User(req.body);
      await user.save();
      if(redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.created(res, "Registered successfully");
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }

  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.failure(res, "Validation failed", 403);
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return ResponseHandler.failure(res, "Invalid credentials", 401);
      }
      const token = jwt.sign(
        { id: user._id, role: user.role },
        config.getJwtSecret(),
        {
          expiresIn: "7d",
        }
      );
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      ResponseHandler.success(res, "Logged in successfully");
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      });

      ResponseHandler.success(res, "Logged out successfully");
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }

  async deleteUser(req, res) {
    try {
      await User.findByIdAndDelete(req.params.id);
      if(redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.success(res, "Deleted successfully");
    } catch (error) {
      ResponseHandler.serverError(res, error);
    }
  }

  async getUserProfile(req, res) {
    try {
      const cacheKey = `user-profile:${req.params.id}`;
      if(redisClient.redis) {
        const cachedUser = await redisClient.get(cacheKey);
        if (cachedUser) {
          ResponseHandler.success(res, "Users Fetched", JSON.parse(cachedUser));
        }
      }
      const user = await User.findById(req.params.id);
      if (!user) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if(redisClient.redis) {
        await redisClient.set(cacheKey, JSON.stringify(user));
      }
      ResponseHandler.success(res, "User fetched", user);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  async getUserProfileList(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const cacheKey = `users-list:${req.user.id}`;
      if(redisClient.redis) {
        const cachedUsers = await redisClient.get(cacheKey);
        if (cachedUsers) {
          ResponseHandler.success(res, "Users Fetched", JSON.parse(cachedUsers));
        }
      }
      const users =
        req.user.role === "admin"
          ? await User.find()
          : req.user.role === "manager"
          ? await User.find({ manager_id: userId })
          : null;
      if (!users) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if(redisClient.redis) {
        await redisClient.set(cacheKey, JSON.stringify(users));
      }
      ResponseHandler.success(res, "User(s) Fetched", users);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  async updateUserProfile(req, res) {
    try {
      const updateData = req.body;
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });
      if (!user) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if(redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.success(res, "User updated", user);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
  async assignUserManager(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.failure(res, "Validation failed", 400, errors);
      }
      const { manager_id, user_id } = req.body;
      const user = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(user_id),
        { manager_id: new mongoose.Types.ObjectId(manager_id) },
        { new: true }
      );
      if (!user) {
        ResponseHandler.failure(res, "Not Found", 404);
      }
      if(redisClient.redis) {
        redisClient.clearRedis();
      }
      ResponseHandler.success(res, "Assigned Manager", user);
    } catch (error) {
      ResponseHandler.serverError(res, error.message, "Server Error");
    }
  }
}

module.exports = new UserController();
