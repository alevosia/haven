const { Command } = require('discord.js-commando');
const { Attachment } = require('discord.js');
const fs = require('fs');
const zxc = require('../../modules/logger.js'); // winston logger

class GetLogFilesCommand extends Command {
    constructor(Bot) {
        super(Bot, {
            name: 'logs',
            group: 'utility',
            memberName: 'logs',
            description: 'Send the log files.',
            ownerOnly: true,
            throttling: { // 1 per minute
                usages: 1,
                duration: 60
            }
        })
    }

    async run(message) {
        fs.readdir('./logs', (err, files) => {
            if (err) {
                zxc.error(err);
                return message.reply(err.message);
            }

            this.asyncForEach(files, (fileName) => {
                message.channel.send(new Attachment(`./logs/${fileName}`, fileName))
                    .catch(err => zxc.error(err));
            })
            zxc.info(`Sent log files to ${message.author.username}`);
        })
    }

    asyncForEach(filesArray, callback) {
        filesArray.forEach((fileName) => {
            setTimeout(() => {
                callback(fileName);
            }, 0);
        })
    }
}

module.exports = GetLogFilesCommand;