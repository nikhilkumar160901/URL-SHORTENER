const express = require("express");
const { googleSign } = require("../controllers/authController");
const { validateGoogleToken } = require("../validations/authValidation");
const router = express.Router();

router.post("/google-signin", validateGoogleToken, googleSign);

module.exports = router;
