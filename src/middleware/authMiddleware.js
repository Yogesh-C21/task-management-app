const jwt = require("jsonwebtoken");
const config = require("../config/config");
const ResponseHandler = require("../utils/responseHandlers");

class AuthMiddleware {
  static isLogin(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
      return ResponseHandler.failure(res, "Unauthorized Request", 401);
    }
    try {
      jwt.verify(token, config.getJwtSecret(), (err, user) => {
        if (err) return res.sendStatus(403);
        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExp = user.exp;
        const ttl = tokenExp - currentTime;
        if (ttl < 3600) {
          const newAccessToken = jwt.sign(
            { id: user.id, role: user.role },
            config.getJwtSecret(),
            { expiresIn: "7d" }
          );
          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict", // Helps prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
        }
        req.user = user; 
        next();
      });
    } catch (error) {
      return ResponseHandler.authError(res, "Token is not valid", 500);
    }
  }
}

module.exports = AuthMiddleware;
