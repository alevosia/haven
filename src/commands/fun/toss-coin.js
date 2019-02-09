const { Command } = require('discord.js-commando');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class TossCoinCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'toss',
            aliases: ['tosscoin', 'coin', 'flip', 'flipcoin'],
            group: 'fun',
            memberName: 'toss',
            description: 'Toss a coin',
            guildOnly: true
        });
    }

    run(message) {
        const coin = Math.floor((Math.random() * 2) + 1);
        
        if (coin == 1) {
            message.channel.send("Heads!").catch(err => zxc.error(err));
        } else if (coin == 2) {
            message.channel.send("Tails!").catch(err => zxc.error(err));
        }
    }
}