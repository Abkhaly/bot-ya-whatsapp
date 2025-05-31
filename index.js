const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
});

const groupWarnings = {};

const greetings = ['hi', 'hello', 'hey', 'salamu', 'salaam', 'mambo', 'habari'];

const bannedKeywords = ['http', 'https', 'www.', '.com', '.net', '.biz', 'instagram.com', 'facebook.com', 'tiktok.com', 'mazao', 'biashara', 'auctions', 'promo', 'advertisement', 'matangazo'];

client.on('qr', (qr) => {
  console.log('QR CODE, scan with WhatsApp app:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Bot imeanza kazi!');
  scheduleMorningMessages();
});

client.on('group_join', async (notification) => {
  const chat = await notification.getChat();
  const newUserId = notification.id.participant;
  const newUserContact = await client.getContactById(newUserId);
  chat.sendMessage(`Karibu sana ${newUserContact.pushname || 'mgeni'} kwenye group! Furahia mapishi ya Zanzibar 🍲🌴`);
});

client.on('message', async message => {
  const chat = await message.getChat();
  const contact = await message.getContact();

  // Jibu salamu
  if (greetings.includes(message.body.toLowerCase())) {
    message.reply(`Habari ${contact.pushname || ''}! Karibu. 😊`);
    return;
  }

  if (chat.isGroup) {
    const isLink = bannedKeywords.some(keyword => message.body.toLowerCase().includes(keyword));
    const isMediaImage = message.hasMedia && message.type === 'image';

    if (isLink || isMediaImage) {
      if (groupWarnings[message.author] >= 1) {
        chat.sendMessage(`@${message.author.split('@')[0]} Umepata onyo la mwisho kwa kutuma matangazo au picha zisizofaa. Unaondolewa sasa!`, { mentions: [contact] });
        await chat.removeParticipants([message.author]);
        delete groupWarnings[message.author];
      } else {
        chat.sendMessage(`@${message.author.split('@')[0]} Tafadhali usitumie matangazo au picha hapa. Hii ni onyo lako la kwanza!`, { mentions: [contact] });
        groupWarnings[message.author] = 1;
      }
      await message.delete(true);
      return;
    }
  }
});

function sendMorningMessage() {
  client.getChats().then(chats => {
    chats.forEach(chat => {
      if (chat.isGroup) {
        chat.sendMessage('Asubuhi njema wote! 🌅 Leo tuko na moyo wa kuandaa mapishi mazuri ya Zanzibar! 🍲✨');
      }
    });
  });
}

function scheduleMorningMessages() {
  const now = new Date();
  const next8am = new Date();
  next8am.setHours(8, 0, 0, 0);
  if (now > next8am) next8am.setDate(next8am.getDate() + 1);

  const msToNext8am = next8am - now;

  setTimeout(() => {
    sendMorningMessage();
    setInterval(sendMorningMessage, 24 * 60 * 60 * 1000);
  }, msToNext8am);
}

client.initialize();
