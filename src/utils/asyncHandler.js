// const asyncHandler = () => {}
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    req.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};
export { asyncHandler };
