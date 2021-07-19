require('dotenv').config();

const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

// ~~ Startup ~~
client.login(process.env.TOKEN).then();

try {
	for (let i = 0; i < process.stdout.getWindowSize()[1]; i++) {
		console.log('\r\n');
	}
} catch (_) {}

// ~~ Client Events ~~
client.on('error', (err) => {
	console.log(err);
});

client.on('warn', (info) => {
	console.log(info);
});

client.on('disconnect', () => {
	console.log('Disconnected from Websocket');
});

client.on('reconnecting', () => {
	console.log('Reconnecting to Websocket');
});

client.once('ready', () => {
	console.log('Finished Booting');
});

client.on('rateLimit', (info) => {
	if (!process.env.PROD) {
		console.log(
			'RateLimit: ' + info.timeout + ' ' + info.path + ' ' + info.limit
		);
	}
});

if (!process.env.PROD) console.log('Dev Mode is Active');
