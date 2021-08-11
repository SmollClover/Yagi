require('dotenv').config();

const { Client, Intents } = require('discord.js');
const fs = require('fs-extra');
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_MESSAGES
	]
});

// ~~ Startup ~~
client.login(process.env.TOKEN).then();
const guilds = {};
const lastSize = {};
const timeBetweenJoin = 1000;
const amountOfMembersToJoin = 10;

try {
	for (let i = 0; i < process.stdout.getWindowSize()[1]; i++) {
		console.log('\r\n');
	}
} catch (_) {
}

// ~~ Client Events ~~
client.on('error', err => {
	console.log(err);
});

client.on('warn', info => {
	console.log(info);
});

client.on('disconnect', () => {
	console.log('Disconnected from Websocket');
});

client.on('reconnecting', () => {
	console.log('Reconnecting to Websocket');
});

client.on('rateLimit', info => {
	if (!process.env.PROD) console.log('RateLimit: ' + info.timeout + ' ' + info.path + ' ' + info.limit);
});

client.once('ready', () => {
	console.log('Finished Booting');
});

client.on('guildMemberAdd', member => {
	try {
		guilds[member.guild.id].size;
	} catch {
		guilds[member.guild.id] = new Set();
	}

	guilds[member.guild.id].add(member);
	lastSize[member.id] = guilds[member.guild.id].size;

	setTimeout(() => {
		if (guilds[member.guild.id].size !== lastSize[member.id]) {
			delete lastSize[member.id];
			return;
		}
		delete lastSize[member.id];
		if (guilds[member.guild.id].size <= (amountOfMembersToJoin - 1)) {
			delete guilds[member.guild.id];
			return;
		}

		let blacklist = fs.readJsonSync('blacklist.json');

		guilds[member.guild.id].forEach(m => {
			if (!blacklist.includes(m.id)) blacklist.push(m.id);

			try {
				m.ban({ reason: 'Yagi | Raid erkannt' }).then(() => {
					try {
						member.guild.systemChannel.messages.fetch({
							limit: 100,
							force: true,
							cache: true
						}).then(messages => {
							member.guild.systemChannel.bulkDelete(messages.filter(msg => msg.author.id === m.id));
						}).catch();
					} catch {
					}
				}).catch();
			} catch {
			}
		});

		fs.writeJsonSync('blacklist.json', blacklist);
		delete guilds[member.guild.id];

	}, timeBetweenJoin);
});