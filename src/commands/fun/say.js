const { Command } = require('discord.js-commando');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class SayCommand extends Command {
    constructor(Bot) {
        super(Bot, {
            name: 'say',
            aliases: ['speak'],
            group: 'fun',
            memberName: 'say',
            description: 'Replies with the text you provide',
            ownerOnly: true,
            args: [
                {
                    key: 'text',
                    prompt: 'what would you like me to say?',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(message, { text }) {
        await message.delete();
        return message.channel.send(text).then().catch(err => zxc.error(err));
    }
}