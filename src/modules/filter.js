const config  = require('../config.js');
const util = require('./utility.js');
const zxc = require('./logger.js'); // winston logger

module.exports = function(message) {

    if (util.IsOfficer(message.member)) return;

    const text = message.content.toLowerCase();

    // loops through each profanities listed
    for (let i=0; i<config.Profanities.length; i++) {

        // if the message contains a profanity
        if (text.includes(config.Profanities[i])) {

            message.reply("watch your mouth.").catch((err) => zxc.error(err));
            return true
        }
    }

    return false
}


