const urlShortenerService = require('../services/urlService');
const User = require("../models/userModel");
const cache = require("../utils/cache");
const analyticsService = require('../services/analyticsService');

const shortenUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const data = await User.findOne({ googleId: req.user.id });
    const userId = data._id;
    const shortUrl = await urlShortenerService.createShortUrl({ longUrl, customAlias, topic, userId });
    res.status(201).json(shortUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resolveUrl = async (req, res) => {
  try {
    const alias = req.params.alias;
    const cachedUrl = await cache.get(`alias:${alias}`);
    const userAgentInfo = req.useragent;
    const ip = req.ip;
    if (cachedUrl) {
      await analyticsService.logRedirect(alias, userAgentInfo.source, ip, userAgentInfo);
      return res.redirect(cachedUrl);
    } else {
      const longUrl = await urlShortenerService.resolveShortUrl(alias);
      if (!longUrl) {
        return res.status(404).json({ error: 'URL not found' });
      }
      await analyticsService.logRedirect(alias, userAgentInfo.source, ip, userAgentInfo);
      await cache.set(`alias:${alias}`, longUrl);
      res.redirect(longUrl);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getUrlAnalytics(req, res) {
  try {
    const alias = req.params.alias;
    const analytics = await urlShortenerService.getUrlAnalytics(alias);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getTopicAnalytics(req, res) {
  try {
    const topic = req.params.topic;
    const analytics = await urlShortenerService.getTopicAnalytics(topic);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getOverallAnalytics(req, res) {
  try {
    console.log("innnnn");    
    const data = await User.findOne({ googleId: req.user.id });
    const userId = data._id;
    const analytics = await urlShortenerService.getOverallAnalytics(userId);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { shortenUrl, resolveUrl, getUrlAnalytics, getTopicAnalytics, getOverallAnalytics};
