const TelegramApi = require('node-telegram-bot-api');

const token = '6943654166:AAFDXaTzJb7_a4FB7wy259SSj1oklf0hvh0';

const bot = new TelegramApi(token, {polling: true});

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Greeting'},
        {command: '/info', description: 'Get information about user'},

    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        bot.sendMessage(chatId, `You text me ${text}`);
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/9e9/6dc/9e96dc9a-90ed-3994-9c2f-d2a269f548d4/192/2.webp');
            await bot.sendMessage(chatId, "Hello! It's my first bot");
        }
        if (text === '/info') {
            await bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}`);
        }
    })
}

start();