const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validateGoogleToken = async (req, res, next) => {
  const { tokenId } = req.body;
  if (!tokenId) {
    return res.status(400).json({ success: false, error: 'Token ID is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid token' });
  }
};

module.exports = { validateGoogleToken };
