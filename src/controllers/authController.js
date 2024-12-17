const { googleSignIn } = require('../services/authService');

const googleSign = async (req, res) => {
  try {
    const user = await googleSignIn(req.body.tokenId);
    res.status(200).json({
      success: true,
      message: 'Google Sign-In successful.',
      data: user,
    });
  } catch (error) {
    const statusCode = error.message.includes('Invalid token') ? 401 : 500;
    const message =
      error.message.includes('Invalid token') ? 'Unauthorized access. Invalid token provided.' : 'Google Sign-In failed. Please try again.';

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message,
    });
  }
};

module.exports = { googleSign };
