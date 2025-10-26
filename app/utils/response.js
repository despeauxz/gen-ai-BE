export const success = (res, message, code, data = []) => {
    return res.status(code).json({
        success: true,
        statusCode: code,
        message,
        data,
    });
}

export const error = (res, message = '', code = 500) => {
  res.status(code).json({
    success: false,
    statusCode: code,
    message,
  });
};
