const { Command } = require('discord.js-commando');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class RollDiceCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'roll',
            aliases: ['dice', 'rolldice'],
            group: 'fun',
            memberName: 'roll',
            description: 'Rolls a dice with a given number of sides',
            guildOnly: true,
            args: [
                {
                    key: 'sides',
                    prompt: 'how many sides does the dice have?',
                    type: 'integer',
                }
            ]
        });
    }

    run(message, { sides }) {
        const number = Math.floor((Math.random() * sides) + 1);
        message.channel.send(message.member.displayName + " rolled a " + number + "! :game_die:").then(sentMessage => {
            zxc.info("Sent: " + sentMessage.content);
        }).catch(err => zxc.error(err));
    }
}