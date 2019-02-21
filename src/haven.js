require('dotenv').config();
const Bot = require('./bot.js');
const zxc = require('./modules/logger.js');

Bot.login(process.env.TOKEN).catch(err => {
    console.error(err);
    zxc.error(err);
});