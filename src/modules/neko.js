const config = require('../config.js');
const { RichEmbed, Attachment } = require('discord.js');
const client = require('nekos.life');
const neko  = new client();
const zxc = require('../modules/logger.js'); // winston logger

exports.SFW = async function(message) {

    let category;

    if (message.content.startsWith(config.prefix)) {
        category = message.content.substring(config.prefix.length).toLowerCase()
    } else {
        const args = message.content.split(' ');
        category = args[1];
    }

    let url = '';

    switch(category)
    {
        case 'baka'     : await neko.sfw.baka().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'cuddle'   : await neko.sfw.cuddle().then(neko => url = neko.url).catch(err => zxc.error(err));    break;
        case 'doggo'    : await neko.sfw.woof().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'hug'      : await neko.sfw.hug().then(neko => url = neko.url).catch(err => zxc.error(err));       break;
        case 'kiss'     : await neko.sfw.kiss().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'neko'     : await neko.sfw.meow().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'pat'      : await neko.sfw.pat().then(neko => url = neko.url).catch(err => zxc.error(err));       break;
        case 'poke'     : await neko.sfw.poke().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'slap'     : await neko.sfw.slap().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'smug'     : await neko.sfw.smug().then(neko => url = neko.url).catch(err => zxc.error(err));      break;
        case 'tickle'   : await neko.sfw.tickle().then(neko => url = neko.url).catch(err => zxc.error(err));    break;

    }

    if (url.length > 0) {
        const att = new Attachment(url);
        message.channel.send(att)
            .then(sent=> {
                zxc.info("Sent " + category + " at " + sent.channel.name)
            }).catch(err => zxc.error(err));
    }

}

function SendNSFWCategories(message) {
    const categories = "anal • boobs • bj • bjgif • classic • ero • feet • feetgif • futanari • hentai • kemonomimi"
        + " • keta • kitsune • neko • nekogif • pussy • pussygif • random • trap • yuri • yurigif";

    const embed = new RichEmbed()
    .setAuthor(`NSFW Categories [${config.prefix}nsfw]`)
    .setDescription(categories)
    .setColor(0xFF0080);

    message.channel.send({embed}).then(sent => zxc.info("Sent: " + sent.embeds[0].author.name))
        .catch(err => zxc.error(err))
}

exports.NSFW = async function(message, text) {
    const category = text.toLowerCase();
    let url;

    switch(category)
    {
        case 'help':
            SendNSFWCategories(message); break;

        case 'anal'         : await neko.nsfw.anal().then(neko => url = neko.url).catch(err => zxc.error(err));             break;
        case 'boobs'        : await neko.nsfw.boobs().then(neko => url = neko.url).catch(err => zxc.error(err));            break;
        case 'bj'           : await neko.nsfw.blowJob().then(neko => url = neko.url).catch(err => zxc.error(err));          break;
        case 'bjgif'        : await neko.nsfw.bJ().then(neko => url = neko.url).catch(err => zxc.error(err));               break;
        case 'classic'      : await neko.nsfw.classic().then(neko => url = neko.url).catch(err => zxc.error(err));          break;
        case 'ero'          : await neko.nsfw.ero().then(neko => url = neko.url).catch(err => zxc.error(err));              break;
        case 'feet'         : await neko.nsfw.feet().then(neko => url = neko.url).catch(err => zxc.error(err));             break;
        case 'feetgif'      : await neko.nsfw.feetGif().then(neko => url = neko.url).catch(err => zxc.error(err));          break;
        case 'futanari'     : await neko.nsfw.futanari().then(neko => url = neko.url).catch(err => zxc.error(err));         break;
        case 'hentai'       : await neko.nsfw.hentai().then(neko => url = neko.url).catch(err => zxc.error(err));           break;
        case 'kemonomimi'   : await neko.nsfw.kemonomimi().then(neko => url = neko.url).catch(err => zxc.error(err));       break;
        case 'keta'         : await neko.nsfw.keta().then(neko => url = neko.url).catch(err => zxc.error(err));             break;
        case 'kitsune'      : await neko.nsfw.kitsune().then(neko => url = neko.url).catch(err => zxc.error(err));          break;
        case 'neko'         : await neko.nsfw.neko().then(neko => url = neko.url).catch(err => zxc.error(err));             break;
        case 'nekogif'      : await neko.nsfw.nekoGif().then(neko => url = neko.url).catch(err => zxc.error(err));          break;
        case 'pussy'        : await neko.nsfw.pussy().then(neko => url = neko.url).catch(err => zxc.error(err));            break;
        case 'pussygif'     : await neko.nsfw.pussyGif().then(neko => url = neko.url).catch(err => zxc.error(err));         break;
        case 'random'       : await neko.nsfw.randomHentaiGif().then(neko => url = neko.url).catch(err => zxc.error(err));  break;
        case 'trap'         : await neko.nsfw.trap().then(neko => url = neko.url).catch(err => zxc.error(err));             break;
        case 'yuri'         : await neko.nsfw.yuri().then(neko => url = neko.url).catch(err => zxc.error(err));             break;
        case 'yurigif'      : await neko.nsfw.lesbian().then(neko => url = neko.url).catch(err => zxc.error(err));          break;
        default:
            message.react('❌').catch(err => zxc.error(err));
            message.reply('invalid category.').catch(err => zxc.error(err));
            SendNSFWCategories(message);
            return;
    }

    if (url.length > 0) {
        const embed = new RichEmbed()
            .setImage(url)
            .setColor(0xFF0080)
            .setFooter(category + " as requested by " + message.member.displayName, message.author.avatarURL);

        message.channel.send({embed})
        .then(sent => zxc.info("Sent " + category + " at " + sent.channel.name + " as requested by " + message.member.displayName))
        .catch(err => {
            zxc.error(err)
            message.reply("Woops! Image size's exceeded Discord's 8MB limit, sorry.")
                .then(sent => zxc.info("Sent: " + sent.content))
                .catch(err => zxc.error(err));
        });
    }
}