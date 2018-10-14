import { IBotContext } from 'botTypings';
import { config } from 'dotenv';
import { startExtra } from 'menuExtra';
import { join } from 'path';
import Telegraf from 'telegraf';
import I18n from 'telegraf-i18n';
import RedisSession from 'telegraf-session-redis';
import { IncomingMessage } from 'telegraf/typings/telegram-types';
import { getSessionKey } from 'telegrafRedis';

config();

export const userSessionLimit = 60;

const bot = new Telegraf(<string> process.env.BOT_KEY);
const redisStorage = new RedisSession({
    getSessionKey,
    property: 'redis',
    ttl: userSessionLimit,
    store: {
        port: null,
        host: null,
        url: process.env.REDIS_URL
    }
});
export const internationalization = new I18n({
    useSession: true,
    allowMissing: true,
    defaultLanguage: 'en',
    sessionName: 'session',
    directory: join(__dirname, '../others/locales')
});

redisStorage.client.on('connect', console.log).on('error', console.error);

bot.startPolling();

bot.use(Telegraf.log());
bot.use(redisStorage.middleware());
bot.use(internationalization.middleware());

bot.catch(console.error);

bot.help(async ({ i18n, replyWithMarkdown }: IBotContext) => replyWithMarkdown(i18n.t('helpMessage'), startExtra(i18n)));

bot.start(async ({ i18n, replyWithMarkdown }: IBotContext) => replyWithMarkdown(i18n.t('startMessage'), startExtra(i18n)));

bot.on('text', async ({ i18n, message, replyWithMarkdown }: IBotContext) => {
    const { text } = <IncomingMessage> message;

    if (i18n.t('menuButton') === (<string> text).toLowerCase()) {
        // return scene.enter('Menu');
    } if (i18n.t('helpButton') === (<string> text).toLowerCase()) {
        return replyWithMarkdown(i18n.t('helpMessage'), startExtra(i18n));
    }

    return i18n.t('notAvailable');
});
