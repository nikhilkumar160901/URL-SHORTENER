const crypto = require('crypto');
const UrlModel = require("../models/urlModel");
const mongoose = require('mongoose');
const analyticsService = require('./analyticsService');

const generateShortUrl = (longUrl) => {
  const randomComponent = crypto.randomBytes(4).toString('hex'); 
  const input = `${longUrl}-${randomComponent}`;
  const hash = crypto.createHash('sha256').update(input).digest('base64');
  const shortUrlAlias = hash.replace(/\//g, '-').substr(0, 7);

  return shortUrlAlias;
};

async function createShortUrl({ longUrl, customAlias, topic, userId }) {
  const alias = customAlias || generateShortUrl(longUrl);
  const existingUrl = await UrlModel.findOne({ alias });
  if (existingUrl) {
    throw new Error("Alias already in use.");
  }
  const shortUrl = `${process.env.BASE_URL}/api/shorten/${alias}`;
  let newUrl = new UrlModel({
    longUrl: longUrl,
    alias: alias,
    shortUrl: shortUrl,
    topic: topic,
    userId: userId,
  });
  await newUrl.save();
  return { shortUrl, createdAt: newUrl.createdAt };
}

async function resolveShortUrl(alias) {
  const url = await UrlModel.findOne({ alias });
  if (!url) return null;
  return url.longUrl;
}

async function getAnalytics(alias) {
  const url = await UrlModel.findOne({ alias });
  if (!url) return null;
  return {
    totalClicks: url.clicks,
    createdAt: url.createdAt,
    topic: url.topic,
  };
};

async function getUrlAnalytics(alias) {
  return await analyticsService.getAnalyticsByAlias(alias);
}

async function getTopicAnalytics(topic) {
  return await analyticsService.getAnalyticsByTopic(topic);
}

async function getOverallAnalytics(userId) {
  console.log(userId, "milliiii");  
  return await analyticsService.getOverallAnalytics(userId);
}

module.exports = { createShortUrl, resolveShortUrl, getUrlAnalytics, getTopicAnalytics, getOverallAnalytics };
