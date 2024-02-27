const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');

const token = '6943654166:AAFDXaTzJb7_a4FB7wy259SSj1oklf0hvh0';

const bot = new TelegramApi(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Now I will make a number from 0 to 9, and you have to guess it');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Guess', gameOptions);
}

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (e) {
        console.log(e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'Greeting'},
        {command: '/info', description: 'Get information about user'},
        {command: '/game', description: 'Guess game'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {

            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId,
                    'https://tlgrm.eu/_/stickers/9e9/6dc/9e96dc9a-90ed-3994-9c2f-d2a269f548d4/192/2.webp');
                return bot.sendMessage(chatId,
                    "Hello! It's my first bot");
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId,
                    `Your name is ${msg.from.first_name} ${msg.from.last_name}, your have ${user.right} correct answers and ${user.wrong} incorrect`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'I dont understand you');
        } catch (e) {
            return bot.sendMessage(chatId, 'Something get wrong')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId);
        }
        const user = await UserModel.findOne({chatId});
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId,
                `Congratulation! You guess number ${chats[chatId]}`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId,
                `Unfortunately, you didn't guess, bot make a number ${chats[chatId]}`, againOptions);
        }
        await user.save();
    })
}

start();