const { Command }   = require('discord.js-commando');
const { RichEmbed } = require('discord.js')
const config = require('../../config.js');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class JoinRoleCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'leave',
            group: 'utility',
            memberName: 'leave',
            description: 'Removes a joinable role from you',
            guildOnly: true,
            throttling: {
                usages: 3,
                duration: 15
            },
            args: [
                {
                    key: 'role',
                    prompt: 'wich role do you want to remove?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { role }) {

        if (message.channel.id != config.BotsSpamChannelID) {
            const channel = message.guild.channels.get(config.BotsSpamChannelID);
            const msg = `Please use bot commands at ${channel} channel. Thank you!`;
            return message.reply(msg).catch(err => zxc.error(err));
        }

        const member = message.member;

        switch(role)
        {
        case 'cetus night':
            // checks if the author doesn't have the cetus night role yet
            if (member.roles.has(config.CetusNightRoleID)) {

                member.removeRole(config.CetusNightRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("Terry will miss you.").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you don't have that role.").catch(err => zxc.error(err));
            }
            break;

        case 'forma':
            // checks if the member doesn't have the forma role yet
            if (member.roles.has(config.FormaRoleID)) {

                member.removeRole(config.FormaRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("forma, forma... no more forma.").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("get the role first then leave.").catch(err => zxc.error(err));
            }
            break;

        case 'giveaways':
            // checks if the author doesn't have the looter role yet
            if (member.roles.has(config.LooterRoleID)) {

                member.removeRole(config.LooterRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("had enough?").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you don't have that role.").catch(err => zxc.error(err));
            }
            break;

        case 'giveaways master':
            // checks if the author doesn't have the giveaways master role yet
            if (member.roles.has(config.GiveawaysMasterRoleID)) {

                member.removeRole(config.GiveawaysMasterRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("bye.").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you don't have that role.").catch(err => zxc.error(err));
            }
            break;

        case 'movie nights':
            // checks if the author doesn't have the movie nights role yet
            if (member.roles.has(config.MovieNightRoleID)) {

                member.removeRole(config.MovieNightRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("you will be missed.").catch(err => zxc.error(err));
                    message.guild.channels.get(config.MovieNightChannelID).send(removedMember + " has left the club.").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you are not even part of the cool kids.").catch(err => zxc.error(err));
            }
            break;

        case 'nitains':
            // checks if the member doesn't have the nitains role yet
            if (member.roles.has(config.NitainsRoleID)) {

                member.removeRole(config.NitainsRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("you will now run out nitains.").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("you don't have that role.").catch(err => zxc.error(err));
            }
            break;

        case 'pervs':
            // checks if the author doesn't have the pervs role yet
            if (member.roles.has(config.PervRoleID)) {

                member.removeRole(config.PervRoleID).then(removedMember => {
                    
                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("you'll be back.").catch(err => zxc.error(err));
                    message.guild.channels.get(config.PervsChannelID).send(removedMember + " has left the naughty club.").catch(err => zxc.error(err));

                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("perv yet, you are not.").catch(err => zxc.error(err));
            }
            break;

        case 'potatoes':
            // checks if the member doesn't have the potatoes role yet
            if (member.roles.has(config.PotatoesRoleID)) {

                member.removeRole(config.PotatoesRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("don't come crying if you missed a tato.").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("zero potatoes found.").catch(err => zxc.error(err));
            }
            break;

        case 'thot police':
            // checks if the member doesn't have the thot police role yet
            if (member.roles.has(config.ThotPoliceRoleID)) {

                member.removeRole(config.ThotPoliceRoleID).then(removedMember => {

                    message.react('✅').catch(err => zxc.error(err));
                    message.reply("deserter of the noble cause.").catch(err => zxc.error(err))
                        
                }).catch(err => {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply(err).catch(err => zxc.error(err));
                });
            } else {
                message.react('❌').catch(err => zxc.error(err));
                message.reply("gotta join the ranks first.").catch(err => zxc.error(err));
            }
            break;
        
        default:
            message.reply('invalid role.').catch(err => zxc.error(err));

            const embed = new RichEmbed()
                .setAuthor(`Leavable Roles [${config.prefix}leave]`)
                .setDescription('potatoes • forma • nitains • cetus night • giveaways\ngiveaways master • movie nights • pervs • thot police')
                .setColor(0xebe56c);
            
            message.channel.send({embed}).catch(err => zxc.error(err));
        }
    }
}