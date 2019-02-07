const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'neko',
            group: 'images',
            memberName: 'neko',
            description: 'Sends an image of a cat',
            guildOnly: true
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}