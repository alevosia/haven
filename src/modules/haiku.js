const syllable = require('syllable');
const spellChecker = require('spellchecker');
const { RichEmbed, Message } = require('discord.js');

function valid(str) {
    let regexp = /^[a-zA-Z\s\n.,?!]*$/;
    return regexp.test(str);
}

function count(str) {
    return syllable(str.replace(/[.,?!]/g, ''));
}

/**
 * @param {Message} message
 */
module.exports = function(message) {

    if (message.author.bot || message.content.length > 80 || !valid(message.content)) return;

    const words = message.content
        .replace(/\n|\s{2,}/g, ' ')  // replace newlines and duplicate spaces with  single space
        .trim() // remove trailing spaces
        .split(' ');

    if (words.length > 17) return;

    let total = 0;
    let haiku = [[''], [''], ['']];

    // loop for each word in the message
    for (let i=0; i<words.length; i++) {
        
        // check if the word is misspelled and return if true
        if (spellChecker.isMisspelled(words[i].replace(/[.,?!]/g, ''))) return;

        // if the total is less than 5 (first line)
        if (total < 5) {

            total += count(words[i]);    // add the number of syllables of the word to the total
            if (total > 5) return;       // return if the total is now greater than 5
            haiku[0].push(words[i]);     // else add the word to the first line of the haiku

        } else if (total < 12) {

            total += count(words[i]);
            if (total > 12) return;
            haiku[1].push(words[i]);

        } else {

            total += count(words[i]);
            if (total > 17) return;
            haiku[2].push(words[i]);
        }
    }
    
    if (total != 17) return;

    // join all words in the arrays into a string separated by spaces
    haiku = haiku[0].join(' ') + '\n' + haiku[1].join(' ') + '\n' + haiku[2].join(' ');

    const embed = new RichEmbed()
        .setAuthor(`Haiku by ${message.member.displayName}`, message.author.displayAvatarURL)
        .setDescription(haiku)
        .setColor(0x84e184);

    message.channel.send(embed).catch(err => console.error(err));
}