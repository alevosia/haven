const Giveaway = require('./giveaway.js');
const zxc = require('../modules/logger.js'); // winston logger

class GiveawaysManager {
    constructor() {
        this.database = require('../firebase/database.js');
        console.log('Giveaways Manager instantiated.');
        zxc.info('Giveaways Manager instantiated.');
    }

    /**
     * @param {Giveaway} giveaway 
     */
    createGiveaway(giveaway) {
        return new Promise((resolve, reject) => {
            const docRef = this.database.collection('giveaways').doc(giveaway.messageId);

            docRef.set({
                'messageId': giveaway.messageId,
                'hostId': giveaway.hostId,
                'prize': giveaway.prize,
                'winnersCount': giveaway.winnersCount,
                'imageURL': giveaway.imageURL,
                'endDate': giveaway.endDate,
                'ended': 0
            }).then(writeResult => {
                docRef.get()
                    .then(snapshot => { 
                        zxc.info(`Added ${snapshot.data().prize} giveaway to database.`); 
                        resolve(true)
                    })
                    .catch(err => zxc.error(err));
            }).catch(err => {
                zxc.error(err);
                resolve(false);
            });
        })
    }

    getGiveaway(messageId) {
        return new Promise((resolve, reject) => {
            this.database.collection('giveaways').where('messageId', '==', messageId).get().then(snapshot => {
                if (snapshot.size == 0) return resolve(null);
                const data = snapshot.docs[0].data();
                resolve(new Giveaway(data.messageId, data.hostId, data.prize, 
                    data.winnersCount, data.imageURL, data.endDate, data.ended));
            })
        })
    }

    getOngoingGiveaways() {
        return new Promise((resolve, reject) => {
            const giveawaysArray = [];
            this.database.collection('giveaways').where('ended', '==', 0).get().then(snapshot => {
                snapshot.forEach(giveaway => {
                    const data = giveaway.data();
                    giveawaysArray.push(new Giveaway(data.messageId, data.hostId, data.prize, 
                        data.winnersCount, data.imageURL, data.endDate, data.ended)
                    );
                })
                resolve(giveawaysArray);
            })
        })
    }

    endGiveaway(messageId) {
        const query = this.database.collection('giveaways').where('messageId', '==', messageId);

        this.database.runTransaction((transaction) => {
            return transaction.get(query).then(snapshot => {
                snapshot.forEach(giveaway => {
                    transaction.update(giveaway.ref, {'ended': 1});
                    zxc.info(`Ended ${giveaway.data().prize} giveaway.`);
                })
            });
        }).catch(err => zxc.error(err));
    }
}

module.exports = GiveawaysManager;