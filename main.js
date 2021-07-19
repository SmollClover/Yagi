require('dotenv').config();

const { Client } = require('discord.js');
const client = new Client();

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
	} catch (_) {
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

		try {
			guilds[member.guild.id].forEach(m => {
				m.ban({ reason: 'Yagi | Raid erkannt' }).then(() => {
					member.guild.channels.cache.get(member.guild.systemChannelID).messages.fetch({
						limit: 100,
						force: true
					}).then(messages => {
						let msgs = messages.filter(msg => msg.author.id === m.id);
						msgs.forEach(msg => {
							msg.delete();
						});
					});
				});
			});
			delete guilds[member.guild.id];
		} catch (_) {
			delete guilds[member.guild.id];
		}
	}, timeBetweenJoin);
});