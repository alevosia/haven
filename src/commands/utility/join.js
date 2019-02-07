const { Command }   = require('discord.js-commando');
const { RichEmbed, Message } = require('discord.js')
const config        = require('../../config.js');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class JoinRoleCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'join',
            group: 'utility',
            memberName: 'join',
            description: 'Lets you join a role',
            guildOnly: true,
            throttling: {
                usages: 3,
                duration: 15
            },
            args: [
                {
                    key: 'role',
                    prompt: 'what role do you want to join?',
                    type: 'string'
                }
            ]
        });
    }

    /**
     * @param {Message} message 
     * @param {string} param1 
     */
    async run(message, { role }) {

        if (message.channel.id != config.BotsSpamChannelID) {
            const channel = message.guild.channels.get(config.BotsSpamChannelID);
            const msg = `Please use bot commands at ${channel} channel. Thank you!`;
            return message.reply(msg).catch(err => zxc.error(err));
        }

        const member = message.member;

        switch(role)
        {
        case 'cetus night':
            // checks if the member doesn't have the role yet
            if (!member.roles.has(config.CetusNightRoleID)) {

                member.addRole(config.CetusNightRoleID).then(member => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("you will now be pinged whenever it's nighttime in Cetus.").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you already have that role.").catch(err => zxc.error(err));
            }
            break;

        case 'forma':
            // checks if the member doesn't have the role yet
            if (!member.roles.has(config.FormaRoleID)) {

                member.addRole(config.FormaRoleID).then(member => {

                    message.react('✅').catch(err => zxc.error(err));
                    const channel = message.guild.channels.get(config.AlertsChannelID);
                    message.reply("you will now be pinged whenever a Forma alert appears in " + channel + ".").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("no duplicates allowed.").catch(err => zxc.error(err));
            }
            break;

        case 'giveaways':
            // checks if the author doesn't have the role yet
            if (!member.roles.has(config.LooterRoleID)) {

                member.addRole(config.LooterRoleID).then(giver => {

                    message.react('✅').catch(err => zxc.error(err));
                    const channel = message.guild.channels.get(config.GiveawaysChannelID)
                    message.reply("you will now be pinged whenever a new giveaway comes up on "
                        + channel + " channel.").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("greed is not good.").catch(err => zxc.error(err));
            }
            break;

        case 'giveaways master':
        // checks if the author doesn't have the role yet
        if (!member.roles.has(config.GiveawaysMasterRoleID)) {

            member.addRole(config.GiveawaysMasterRoleID).then(giver => {

                message.react('✅').catch(err => zxc.error(err));
                const channel = message.guild.channels.get(config.GiveawaysSpamChannelID)
                message.reply("you may now host giveaways at " + channel + "!").catch(err => zxc.error(err));

            }).catch(err => {
                message.react('❌').catch(err => zxc.error(err));
                message.reply(err).catch(err => zxc.error(err));
            });
        } else {
            message.react('❌').catch(err => zxc.error(err));
            message.reply("you are already a Santa.").catch(err => zxc.error(err));
        }
        break;

        case 'movie nights':
            // checks if the author doesn't have the role yet
            if (!member.roles.has(config.MovieNightRoleID)) {

                member.addRole(config.MovieNightRoleID).then(movieNightMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("you may now join the movie nights!").catch(err => zxc.error(err));
                    message.guild.channels.get(config.MovieNightChannelID).send(movieNightMember + " has joined the club!").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you are already part of the elite club.").catch(err => zxc.error(err));
            }
            break;

        case 'nitains':
            // checks if the member doesn't have the role yet
            if (!member.roles.has(config.NitainsRoleID)) {

                member.addRole(config.NitainsRoleID).then(member => {

                    message.react('✅').catch(err => zxc.error(err));
                    const channel = message.guild.channels.get(config.AlertsChannelID);
                    message.reply("you will now be pinged whenever a Nitain alert appears in " + channel + ".").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("one Nitain at a time.").catch(err => zxc.error(err));
            }
            break;

        case 'pervs':
            // checks if the author doesn't have the role yet
            if (!member.roles.has(config.PervRoleID)) {

                message.reply('by joining this role, you hereby declare that you are over 18 of age. [Yes/No]');
                const filter = res => res.author.id == message.author.id && (res.content.toLowerCase() == 'yes' || res.content.toLowerCase() == 'no');
                message.channel.awaitMessages(filter, {maxMatches: 1, time: 15000, errors: ['time']}).then(msgs => {
                    const response = msgs.first();
                    if (response.content.toLowerCase() == 'yes') {
                        member.addRole(config.PervRoleID).then(pervMember => {
                    
                            message.react('✅').catch(err => zxc.error(err));
                            const channel = message.guild.channels.get(config.PervsChannelID);
                            message.reply("you are now a perv.").catch(err => zxc.error(err));
        
                            pervMember.send("You have been given the Perv role and access to the " + channel + " channel."
                                + "\nPosting of illegal content is strictly not allowed. Be a responsible user. Thank you.").catch(err => zxc.error(err));
                            channel.send(pervMember + " has joined the naughty club.").catch(err => zxc.error(err));
        
                        }).catch(err => {
                            message.react('❌').catch(err => zxc.error(err));
                            message.reply(err).catch(err => zxc.error(err));
                        });
                    } else {
                        message.reply('alright.');
                    }
                }).catch(err => {
                    zxc.error(err);
                    message.reply('good, good.');
                })
                
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you are already a perv.").catch(err => zxc.error(err));
            }
            break;

        case 'potatoes':
            // checks if the member doesn't have the role yet
            if (!member.roles.has(config.PotatoesRoleID)) {

                member.addRole(config.PotatoesRoleID).then(member => {

                    message.react('✅').catch(err => zxc.error(err));
                    const channel = message.guild.channels.get(config.AlertsChannelID);
                    message.reply("you will now be pinged whenever an Orokin Catalyst/Reactor alert appears in "
                        + channel + ".").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you can't have 2 potatoes.").catch(err => zxc.error(err));
            }
            break;

        case 'thot police':
            // checks if the member doesn't have the role yet
            if (!member.roles.has(config.ThotPoliceRoleID)) {

                member.addRole(config.ThotPoliceRoleID).then(member => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("pinging whenever a thot needs policing.").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you are already part of the crusade.").catch(err => zxc.error(err));
            }
            break;
        
        default:
            message.reply('invalid role.').catch(err => zxc.error(err));

            const embed = new RichEmbed()
                .setAuthor(`Joinable Roles [${config.prefix}join]`)
                .setDescription('potatoes • forma • nitains • cetus night • giveaways\ngiveaways master • movie nights • pervs • thot police')
                .setColor(0xebe56c);
            
            message.channel.send({embed}).catch(err => zxc.error(err));
        }
    }

}