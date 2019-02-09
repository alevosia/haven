const { Command } = require('discord.js-commando');
const config  = require('../../config.js');
const util    = require('../../modules/utility.js');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class MuteCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'mute',
            group: 'utility',
            memberName: 'mute',
            description: 'Mute a member',
            guildOnly: true
        });
    }

    run(message) {
        if (!util.IsOfficer(message.member)) {
            return message.reply("you don't have the authority to mute members.").catch(err => zxc.error(err));
        }

        // checks if a member is mentioned and retrieves that member
        if (message.mentions.members.size <= 0) {
            return message.reply("you have to tag someone to mute.").catch(err => zxc.error(err));
        }

        const member = message.mentions.members.first();

        // checks if the mentioned member isn't muted
        if (!member.roles.has(config.MutedRoleID)) {

            // asks for a reason
            message.reply("please provide a reason. Mute " + member.displayName + " for: ").catch(err => zxc.error(err));

            // the filter which checks if the responder is the author of the command
            const filter = response => response.author == message.author;
            // waits for a respone containing the reason from the author
            message.channel.awaitMessages(filter, {maxMatches: 1, time: 30000, errors: ['time']}).then(response => {

                const reason = response.first().content;

                // removes all the roles of the mentioned member then adds the Muted role
                member.setRoles([config.MutedRoleID], reason).then(mutedMember => {

                    message.channel.send(mutedMember + " has been muted by " 
                        + message.member + " for " + reason + ".").catch(err => zxc.error(err));

                }).catch(err =>  {
                    message.reply(err).catch(err => zxc.error(err))
                });

            }).catch(err => message.reply("your time to provide a reason has run out."));

        } else {
            message.reply(member.displayName + " is already muted.").catch(err => zxc.error(err));
        }
    }
}