const Koa = require('koa');
const { Telegraf } = require('telegraf');
const safeCompare = require('safe-compare')
const sample = require('lodash/sample');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Send mе any sticker'));

bot.on('sticker', (ctx) => {
    const { sticker } = ctx.update.message;

    bot.telegram.getStickerSet(sticker.set_name)
        .then(set => ctx.replyWithSticker(sample(set.stickers).file_id))
        .catch((err) => {
            console.error(err);
            return ctx.reply('👍');
        });
});

bot.on('message', (ctx) => {
    ctx.reply('Send mе any sticker');
});

const secretPath = `/telegraf/${bot.secretPathComponent()}`;

bot.telegram.setWebhook(`${process.env.URL}${secretPath}`);

const app = new Koa();

app.use(require('koa-bodyparser')());
app.use(async (ctx, next) => {
    if (safeCompare(secretPath, ctx.url)) {
        await bot.handleUpdate(ctx.request.body)
        ctx.body = 'ok';
        return;
    }
    return next();
})
app.listen(process.env.PORT);
