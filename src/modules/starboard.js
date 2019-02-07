const { MessageReaction, User, RichEmbed } = require('discord.js');
const db = require('../firebase/database.js');
const config = require('../config.js');
const zxc = require('../modules/logger.js'); // winston logger

/**
 * @param {MessageReaction} reaction
 * @param {User} reactor
 */
exports.UpdateStars = function(reaction, reactor) {

    const message = reaction.message;
    // return if it's a DM
    if (!message.guild) return;

    // remove the reaction if the reactor is the author of the message or the message is posted in green zone
    if (reactor.id == message.author.id || message.channel.id == config.PervsChannelID) { 
        return reaction.remove(reactor).then(rea => {
            zxc.info(`Removed ${reactor.username}'s star reaction.`);
        }).catch(err => zxc.error(err));
    }

    const starCount = reaction.count;
    const starboardChannel = message.guild.channels.get(config.StarboardChannelID);
    const docRef = db.collection('starboard').doc(message.id);

    docRef.get().then(snapshot => {

        // if the message has ZERO stars reaction, remove it from database
        if (starCount == 0) {
            zxc.info(`A message by ${message.member.displayName} has no more stars.`);
            if (snapshot.exists) {
                docRef.delete().then(res => {
                    zxc.info(`Deleted document from database.`);
                }).catch(err => zxc.error(err));
            }
            return;
        }

        // if the message already exists in the database
        if (snapshot.exists) {

            docRef.update({ 'stars': starCount }) // only update its star count field

            // if the star count is more than or equal to the minimum
            if (starCount >= config.MinStarboardStars) {

                let content = message.content.length <= 300 ? message.content : message.content.substr(1, 300).concat('...');
                content += `\n\n[Jump to Message](${message.url})`;

                const embed = new RichEmbed()
                    .setAuthor(`${starCount} ⭐`)
                    .addField(`Author:`, `<@${message.author.id}>`, true)
                    .addField(`Channel:`, message.channel, true)
                    .addField(`Message:`, content)
                    .setThumbnail(message.author.displayAvatarURL)
                    .setColor(0xFFFF00)

                // set image if it has one
                if (message.attachments.size >= 1) {
                    let att = message.attachments.first();
                    att.width ? embed.setImage(att.proxyURL) : null;
                }

                // if the document has a starboardMessageID i.e. already posted on starboard
                // edit the starboard message with the new stars count
                if (snapshot.data().starboardMessageID) {
                    starboardChannel.fetchMessage(snapshot.data().starboardMessageID)
                        .then(msg => {
                            msg.edit({embed}).then(msg => {
                                zxc.info(`Edit Starboard Message's stars to ${starCount}.`)
                            }).catch(err => zxc.error(err)); 
                        }).catch(err => {
                            zxc.error(err);
                            // unset the starboardMessageID if the starboard channel failed to fetch it
                            docRef.delete().then(res => {
                                zxc.info(`Deleted document from database.`);
                            }).catch(err => zxc.error(err));
                        });
                } 
                // else post it on starboard and set its starboardMessageID
                else { 
                    starboardChannel.send({embed})
                        .then(sent => {
                            zxc.info(`Posted a message on Starboard channel.`);
                            docRef.update({ 'starboardMessageID': sent.id }).catch(err => zxc.error(err));
                        }).catch(err => zxc.error(err));
                }
            
            // if the starCount goes below the minimum and has a starboardMessageID i.e. already posted on starboard
            // delete the message from the starboard channel and unset its starboardMessageID
            } else if (starCount < config.MinStarboardStars && snapshot.data().starboardMessageID) {
                zxc.info(`${message.author.username}'s message has gone below ${config.MinStarboardStars} stars.`)
                starboardChannel.fetchMessage(snapshot.data().starboardMessageID)
                    .then(msg => {
                        msg.delete().then(msg => {
                            zxc.info(`Deleted ${msg.author}'s message.`);
                        }).catch(err => zxc.error(err)); 
                        docRef.update({ 'starboardMessageID': null }).catch(err => zxc.error(err)); 
                    }).catch(err => zxc.error(err));
            }

        // if the message doesn't exist yet on the database, add it
        } else {
            docRef.set({
                'authorID': message.author.id,
                'content': message.content.length <= 300 ? message.content : message.content.substr(1, 300).concat('...'),
                'hasAttachment': message.attachments.size > 0 ? 1 : 0,
                'url': message.url,
                'stars': starCount,
                'starboardMessageID': null
            }).catch(err => zxc.error(err));
        }
    })
}