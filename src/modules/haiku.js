const syllable = require('syllable');
const { RichEmbed } = require('discord.js');

module.exports = function(message) {

    if (message.author.bot) return;

    const words = message.content
        .replace(/\n/g, ' ')     // replace newlines with space
        .replace(/\s+/g, ' ')    // replace duplicate spaces with one
        .trim()                  // remove trailing spaces
        .split(' ');

    if (words.length > 17) return;

    let total = 0;
    let haiku = [[''], [''], ['']];

    for (let i=0; i<words.length; i++) {

        if (total < 5) {

            total += syllable(words[i]);
            if (total > 5) return;
            haiku[0].push(words[i]);

        } else if (total < 12) {

            total += syllable(words[i]);
            if (total > 12) return;
            haiku[1].push(words[i]);

        } else if (total < 17) {

            total += syllable(words[i]);
            if (total > 17) return;
            haiku[2].push(words[i]);
        }
    }
    
    if (total != 17) return;

    haiku = haiku[0].join(' ') + '\n' + haiku[1].join(' ') + '\n' + haiku[2].join(' ');
    console.log(`Haiku by ${message.member.displayName}:\n----------\n${haiku}\n----------`);

    const embed = new RichEmbed()
        .setAuthor(`Haiku by ${message.member.displayName}`, message.author.displayAvatarURL)
        .setDescription(haiku)
        .setColor(0x84e184);

    message.channel.send(embed).catch(err => console.error(err));
}