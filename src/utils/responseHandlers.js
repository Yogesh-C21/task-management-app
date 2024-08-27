class ResponseHandler {
  static success(res, message, data = null) {
    let responsePayload = {
      success: true,
      statusCode: 200,
      message: message,
    };
    if (data) {
      responsePayload["data"] = data;
    }
    return res.status(200).json(responsePayload);
  }

  static created(res, message, data = null) {
    let responsePayload = {
      success: true,
      message: message,
    };
    if (data) {
      responsePayload["data"] = data;
    }
    return res.status(201).json(responsePayload);
  }

  static failure(res, message, statusCode = 400, errors) {
    return res.status(statusCode).json({
      statusCode,
      message,
      errors,
    });
  }

  static authError(res, message, statusCode = 400, errors) {
    return res.status(statusCode).json({
      statusCode,
      message,
      errors,
    });
  }

  static serverError(res, error, message) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      statusCode: 500,
      error: error.message || "Internal Server Error",
    });
  }
}

module.exports = ResponseHandler;
