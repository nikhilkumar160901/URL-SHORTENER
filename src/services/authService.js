const User  = require('../models/userModel');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleSignIn = async (tokenId) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();    
    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      { googleId: payload.sub, email: payload.email },
      { new: true, upsert: true }
    );

    return user;
  } catch (err) {
    console.log(err);    
    throw new Error('Google Sign-In failed: ' + err.message);
  }
};

module.exports = { googleSignIn };
