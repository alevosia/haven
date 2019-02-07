const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config         = require('../../config.js');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class PostAvatarCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'avatar',
            aliases: ['postavatar'],
            group: 'utility',
            memberName: 'avatar',
            description: 'Posts your avatar or a mentioned user\'s',
            guildOnly: true
        });
    }
    
    run(message) {
        // checks if a user is mentioned then gets their avatar
        if (message.mentions.users.size > 0) {
            const user    = message.mentions.users.first();
            const member  = message.mentions.members.first();
            
            if (user.id != config.BotID && user.id != config.OwnerID) {
                const embed = new RichEmbed()
                    .setAuthor(member.displayName + "'s avatar as requested by " + message.member.displayName, message.author.avatarURL)
                    .setImage(user.avatarURL)
                    .setColor(0xFF0080);
                message.channel.send({embed}).then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.embeds[0].author.name);
                }).catch(err => zxc.error(err));
            } else {
                message.reply("nice try.").then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
                }).catch(err => zxc.error(err));
            }
            
        } else { // if no user is mentioned, send the avatar of the author instead
            const embed = new RichEmbed()
                    .setAuthor(message.member.displayName + "'s avatar")
                    .setImage(message.author.avatarURL)
                    .setColor(0xFF0080);
                message.channel.send({embed}).then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.embeds[0].author.name);
                }).catch(err => zxc.error(err));
        }  
    }
}