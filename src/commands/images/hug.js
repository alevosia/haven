const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'hug',
            group: 'images',
            memberName: 'hug',
            description: 'Sends a hug GIF',
            guildOnly: true
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}