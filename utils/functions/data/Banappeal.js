const banappealModel = require('../../../src/db/Models/tables/banappeal.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const BanappealLogic = require('./BanappealLogic');
const { GuildConfig } = require('./Config');

module.exports = class Banappeal extends BanappealLogic {
    constructor(bot) {
        super();
        this.bot = bot;
    }

    getSettings(guild_id) {
        return new Promise(async (resolve, reject) => {
            const settings = await GuildConfig.get(guild_id).catch((err) => {
                reject(false);
            });
            return resolve(settings.banappeal);
        });
    }

    getBanappeal(guild_id = null, user_id = null, appealId = null) {
        return new Promise(async (resolve, reject) => {
            const searchQuery = {
                where: {},
            };

            if (guild_id && user_id) {
                searchQuery.where = {
                    guild_id: guild_id,
                    user_id: user_id,
                };
            } else {
                searchQuery.where = {
                    id: appealId,
                };
            }

            await banappealModel
                .findOne(searchQuery)
                .then((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        resolve({});
                    }
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(false);
                });
        });
    }

    updateBanappealSettings(guild_id, settings) {
        return new Promise(async (resolve, reject) => {
            GuildConfig.update({
                guild_id: guild_id,
                value: settings,
                valueName: 'banappeal',
            })
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    reject(false);
                });
        });
    }

    createBanappeal(guild_id, user_id) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.getSettings(guild_id).catch((err) => {
                reject(false);
            });

            if (!settings) {
                return reject(false);
            }

            const date = new Date();
            date.setDate(date.getDate() + 1 + settings.cooldown);
            date.setHours(date.getHours() + 1);

            await banappealModel
                .create({
                    guild_id: guild_id,
                    user_id: user_id,
                    cooldown: date,
                })
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(false);
                });
        });
    }

    updateBanappeal(guild_id, user_id, value, valueName) {
        return new Promise(async (resolve, reject) => {
            await banappealModel
                .update(
                    {
                        [valueName]: value,
                    },
                    {
                        where: {
                            guild_id: guild_id,
                            user_id: user_id,
                        },
                    }
                )
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(false);
                });
        });
    }
};
