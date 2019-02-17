const { Guild, RichEmbed } = require('discord.js');
const request     = require('request-promise');
const WorldState  = require('warframe-worldstate-parser');
const config      = require('../config.js');
const zxc         = require('../modules/logger.js'); // winston logger

exports.IsOfficer = function(member) {
    return member.roles.has(config.OfficerRoleID);
}

exports.GetRoles = function(member) {
    const rolesCollection = member.roles;
    const iterable        = rolesCollection.values()
    const roles           = []

    iterable.next(); // skips the @everyone role

    for (let i=1; i<rolesCollection.size; i++) {
        roles.push(iterable.next().value["name"]);
    }

    return roles.join(" | ");
}

let activity = 0;
exports.UpdateActivity = function(Bot) {

    switch(activity)
    {
    case 0:
        const worldStateURL = "http://content.warframe.com/dynamic/worldState.php";
        request.get(worldStateURL, { family: 4, simple: true })
            .then(worldstateData => {
                const cetus = new WorldState(worldstateData).cetusCycle;
                Bot.user.setActivity(`Cetus: ${cetus.shortString}`, {type: 'WATCHING'}).catch(err => zxc.error(err));
            }).catch((err) => zxc.error(err));
        activity++;
        break;

    case 1:
        Bot.user.setActivity(`Uptime: ${GetUptime()}`, { type: 'WATCHING' }).catch(err => zxc.error(err));
        activity = 0;
        break;
    }
}

function GetUptime() {
    const seconds = process.uptime();
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    let string = '';

    if (hours >= 1) string += `${hours}:`
    else string += `00:`
    
    if (minutes >= 1) string += `0${minutes}`.slice(-2)
    else string += `00`;

    string += `:${`0${Math.floor(seconds % 60)}`.slice(-2)}`

    return string;
}

/**
 * @param {Guild} guild
 */
exports.SendUpdate = function(guild, update) {
    const channel = guild.channels.get(config.UpdatesChannelID);

    const embed = new RichEmbed()
        .setTitle('Warframe')
        .setDescription(`[${update.title}](${update.link})\n${update.desc}`)
        .setThumbnail(update.image)
        .setColor(0x38aaff)
        .setTimestamp();

    channel.send({embed}).then(sent => {
        zxc.info(`Sent New Update: ${update.title}`);
    }).catch(err => zxc.error(err));
}

/**
 * @param {Guild} guild
 * @param {string} msg
 */
exports.MentionCetusNight = async function(guild, msg) {
    const role = guild.roles.get(config.CetusNightRoleID);
    await role.setMentionable(true, 'Nighttime').catch(err => zxc.error(err));

    await guild.channels.get(config.BotsSpamChannelID).send(`<@&${role.id}>\n${msg}.`)
        .then(sent => {
            // deletes after 150 minutes (one day/night cycle)
            setTimeout(() => { sent.delete().catch(err => zxc.error(err)) }, 9000000); 
        }).catch(err => zxc.error(err));

    await role.setMentionable(false, 'Mentioned').catch(err => zxc.error(err));
}

/**
 * @typedef {Object} Alert
 * @property {String} rewardName
 * @property {String} rewardType
 * @property {String} missionType
 * @property {String} missionFaction
 * @property {String} missionNode
 * @property {String} eta
 * @property {String} image
 * @property {String} color
 */

/**
 * @param {Guild} guild
 * @param {Alert} alert
 */
exports.SendAlert = async function(guild, alert) {

    const channel = guild.channels.get(config.AlertsChannelID);

    let roleId;

    switch (alert.rewardType)
    {
        case 'reactor' : roleId = config.PotatoesRoleID; break;
        case 'catalyst': roleId = config.PotatoesRoleID; break;
        case 'nitain'  : roleId = config.NitainsRoleID;  break;
        case 'forma'   : roleId = config.FormaRoleID;    break;
    }

    if (roleId) {
        const role = guild.roles.get(roleId);

        // sets the role to mentionable before pinging
        await role.setMentionable(true, 'Alert').catch((err) => zxc.error(err));

        // pings the role
        await channel.send(`<@&${roleId}>`).catch((err) => zxc.error(err));

        // sends the embed containing the detials of the potato alert
        await channel.send(GetAlertsEmbed(alert)).catch((err) => zxc.error(err));

        // sets it back to unmentionable after pinging
        role.setMentionable(false, 'Already pinged').catch((err) => zxc.error(err));

    } else {
        channel.send(GetAlertsEmbed(alert)).catch((err) => zxc.error(err));
    }
}

/**
 * @param {Alert} alert
 */
function GetAlertsEmbed(alert) {

    const embed = new RichEmbed()
        .setTitle(alert.rewardName)
        .addField(`Mission:`,  `${alert.missionFaction} ${alert.missionType}`, true)
        .addField(`Location:`, alert.missionNode, true)
        .setThumbnail(alert.image)
        .setColor(alert.color)
        .setTimestamp()
        .setFooter("Expires in " + alert.eta);

    return embed;
}