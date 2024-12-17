const mongoose = require('mongoose');

const urlShortenerSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  alias: { type: String, required: true, unique: true },
  shortUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String },
  totalClicks: { type: Number, default: 0 },
  uniqueClicks: { type: Number, default: 0 },
  clickHistory: [{ timestamp: Date, userAgent: String, ip: String, geolocation: Object }],
}, { timestamps: true });

module.exports = mongoose.model('URLShortener', urlShortenerSchema);
