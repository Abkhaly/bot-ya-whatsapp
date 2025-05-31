const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code received, scan please.');
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();

    // Jibu salamu
    if (msg.body.toLowerCase().includes("hello") || msg.body.toLowerCase().includes("hi") || msg.body.toLowerCase().includes("asalaam")) {
        msg.reply('Waalaikum salaam! Karibu 😊');
    }

    // Angalia kama ni group na ujumbe una link au media
    if (chat.isGroup) {
        if (msg.body.includes("http") || msg.hasMedia) {
            await msg.reply("⚠️ Tafadhali usitume link au media zisizoruhusiwa hapa.");
            const authorId = msg.author || msg.from;
            await chat.removeParticipants([authorId]);
        }
    }
});

client.on('group_join', async (notification) => {
    const chat = await notification.getChat();
    await chat.sendMessage(`Karibu sana @${notification.id.participant.replace('@c.us', '')}!`, {
        mentions: [await client.getContactById(notification.id.participant)]
    });
});

client.initialize();