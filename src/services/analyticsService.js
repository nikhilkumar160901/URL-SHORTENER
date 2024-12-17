const URLShortener = require('../models/urlModel');

exports.logRedirect = async (alias, userAgent, ip, geolocation) => {
    const url = await URLShortener.findOne({ alias });

    if (!url) throw new Error('Short URL not found');

    const redirectLog = {
        timestamp: Date.now(),
        userAgent,
        ip,
        geolocation,
    };

    await URLShortener.updateOne(
        { alias },
        { $inc: { totalClicks: 1 }, $push: { clickHistory: redirectLog } }
    );

    const hasClickedBefore = url.clickHistory.some(history => history.ip === ip);

    if (!hasClickedBefore) {
        await URLShortener.updateOne(
            { alias },
            { $inc: { uniqueClicks: 1 } }
        );
    }
};

exports.getAnalyticsByAlias = async (alias) => {
    const url = await URLShortener.findOne({ alias });
    if (!url) throw new Error('Short URL not found');
    const recentDates = getLast7Days();
    const clicksByDate = [];
    const osType = [];
    const deviceType = [];
    recentDates.forEach(date => {
        const clickCount = url.clickHistory.filter(click => {
            try {
                return isSameDay(new Date(click.timestamp), date);
            } catch (error) {
                console.error(error.message);
                return false;
            }
        }).length;
        clicksByDate.push({ date: date.toISOString().split('T')[0], clickCount });
    });

    const osMap = {};
    const deviceMap = {};

    url.clickHistory.forEach(click => {
        const osName = click.geolocation.os || 'unknown';
        if (osMap[osName]) {
            osMap[osName].uniqueClicks += 1;
        } else {
            osMap[osName] = { uniqueClicks: 1, uniqueUsers: 1 };
        }

        const deviceName = click.geolocation.deviceType || 'unknown';
        if (deviceMap[deviceName]) {
            deviceMap[deviceName].uniqueClicks += 1;
        } else {
            deviceMap[deviceName] = { uniqueClicks: 1, uniqueUsers: 1 };
        }
    });

    for (const osName in osMap) {
        osType.push({
            osName,
            uniqueClicks: osMap[osName].uniqueClicks,
            uniqueUsers: osMap[osName].uniqueUsers,
        });
    }

    for (const deviceName in deviceMap) {
        deviceType.push({
            deviceName,
            uniqueClicks: deviceMap[deviceName].uniqueClicks,
            uniqueUsers: deviceMap[deviceName].uniqueUsers,
        });
    }

    return {
        totalClicks: url.totalClicks,
        uniqueClicks: url.uniqueClicks,
        clicksByDate,
        osType,
        deviceType,
    };
};

function getLast7Days() {
    const dates = [];
    const currentDate = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }
    return dates.reverse(); 
}

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

exports.getAnalyticsByTopic = async (topic) => {
    const urls = await URLShortener.find({ topic });

    const analytics = {
        topic,
        totalUrls: urls.length,
        totalClicks: 0,
        uniqueClicks: 0,
        clicksByDate: [],
        urls: [],
    };
    const clicksByDateMap = {};

    for (const url of urls) {
        const logs = url.clickHistory || [];

        analytics.totalClicks += logs.length;
        const uniqueUsers = new Set(logs.map((log) => log.userId));
        analytics.uniqueClicks += uniqueUsers.size;
        logs.forEach((log) => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];
            clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;
        });
        analytics.urls.push({
            shortUrl: url.shortUrl,
            totalClicks: logs.length,
            uniqueClicks: uniqueUsers.size,
        });
    }
    analytics.clicksByDate = Object.keys(clicksByDateMap).map((date) => ({
        date,
        clickCount: clicksByDateMap[date],
    }));

    return analytics;
};

exports.getOverallAnalytics = async (userId) => {
    const urls = await URLShortener.find({ userId });
    if (!urls.length) {
        return {
            totalUrls: 0,
            totalClicks: 0,
            uniqueClicks: 0,
            clicksByDate: [],
            osType: [],
            deviceType: [],
        };
    }

    let totalClicks = 0;
    const uniqueUserSet = new Set();
    const clicksByDateMap = {};
    const osTypeMap = {};
    const deviceTypeMap = {};
    for (const url of urls) {
        const logs = url.clickHistory || [];

        totalClicks += logs.length;

        logs.forEach((log) => {
            uniqueUserSet.add(log.userId);
            const logDate = log.timestamp.toISOString().split("T")[0]; 
            if (!clicksByDateMap[logDate]) clicksByDateMap[logDate] = 0;
            clicksByDateMap[logDate]++;

            const os = log.os || "Unknown";
            if (!osTypeMap[os]) osTypeMap[os] = { uniqueUsers: new Set(), logEntries: new Set() };
            osTypeMap[os].uniqueUsers.add(log.userId);
            osTypeMap[os].logEntries.add(log._id);

            const device = log.device || "Unknown";
            if (!deviceTypeMap[device]) deviceTypeMap[device] = { uniqueUsers: new Set(), logEntries: new Set() };
            deviceTypeMap[device].uniqueUsers.add(log.userId);
            deviceTypeMap[device].logEntries.add(log._id);
        });
    }
    const clicksByDate = Object.keys(clicksByDateMap).map((date) => ({
        date,
        clickCount: clicksByDateMap[date],
    }));
    const osType = Object.keys(osTypeMap).map((osName) => ({
        osName,
        uniqueClicks: osTypeMap[osName].logEntries.size,
        uniqueUsers: osTypeMap[osName].uniqueUsers.size,
    }));
    const deviceType = Object.keys(deviceTypeMap).map((deviceName) => ({
        deviceName,
        uniqueClicks: deviceTypeMap[deviceName].logEntries.size,
        uniqueUsers: deviceTypeMap[deviceName].uniqueUsers.size,
    }));

    return {
        totalUrls: urls.length,
        totalClicks,
        uniqueClicks: uniqueUserSet.size,
        clicksByDate,
        osType,
        deviceType,
    };
};

