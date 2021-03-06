console.log('Starting bot..');

//data
const settings = require('./settings.json')
const roles = require('./roles.json')
const inv = require('./inventory.json')
const invPath = 'inventory.json'

//packages
const fs = require('fs')
const discord = require('discord.js')
const rand = require('random-int')

//global vars
const bot = new discord.Client()
const embed = new discord.RichEmbed()

const c_bad = "#E54C4C"
const c_good = "#6DC066"
const c_warning = "#ECBE00"
const c_note = "#006FEC"
const c_special = "#ba00ec"

//global functions
createUser = (message) => {
	// get user id
	let userid = message.author.id
	if (userid.startsWith("!")) {
		userid = userid.slice(1)
	}
	// check if first time user
	if (!inv[userid]) {
		inv[userid] = {"boxes":0,"credits":0}
	}
}

saveInv = () => {
	fs.writeFile(invPath, JSON.stringify(inv))
}

lootboxChance = (message) => {
	let chance = rand(0,200);
	// get user id
	let userid = message.author.id
	if (userid.startsWith("!")) {
		userid = userid.slice(1)
	}

	if (chance === 42 || chance === 69) {
		console.log(message.author.username + "won a lootbox")
		const embed = new discord.RichEmbed().setTitle('📦 Congrats '+message.author.username+' you just got a Lootbox').setColor('#07BEB8')
		message.channel.send({embed})
		createUser(message)
		// write into database
		inv[userid].boxes += 1
		fs.writeFile(invPath, JSON.stringify(inv))
	}
}

// listeners
// add role on guild join
bot.on('guildMemberAdd', member => {
	if (member.guild.roles.has("308864141886619648")) {
		member.addRole("308864141886619648")
	}
})

bot.on('presenceUpdate', (memberOld, member) => {
	if (member.presence.game === null) {
		return
	}
	for (var i in roles) {
		if (member.presence.game.name === roles[i].fullName && member.guild.id === "134436989175988224") {
			if (member.roles.get(roles[i].id)) {
				return
			} else {
				console.log(member.user.username + " got a new role: " + roles[i].fullName)
				member.addRole(roles[i].id)
				bot.channels.get('313659722093821952').send(member.user.username + " got a new role: " + roles[i].fullName)
				return
			}
		}
	}
})

bot.on('message', (message) => {

	// get user id
	let userid = message.author.id
	if (userid.startsWith("!")) {
		userid = userid.slice(1)
	}
	//godmode
	if (userid === "") {
		message.channel.send("Gott hat gesprochen!")
	}

	// dont listen to yourself
	if (message.author.id === bot.user.id)
		return

	// dont listen to other bots
	if (message.author.bot)
		return

	// chance to get lootbox
	lootboxChance(message);


	// Bot only executes command if the right prefix is used
	if (!message.content.startsWith(settings.prefix)) return

	// execute command
	if (message.content.startsWith(settings.prefix) === false) return

	const args = message.content.split(' ')
	const command = args.shift().slice(settings.prefix.length)
	try {
		let cmdFile = require('./commands/' + command)
		cmdFile.run(bot, message, args, discord, settings, inv)
	} catch (err) {}


	// give roles if nothing happend so far
	for (var I in roles) {
		if (roles[I].name === message.content.slice(1) || roles[I].fullName === message.content.slice(1)) {
				const embed = new discord.RichEmbed()
			if (message.member.roles.get(roles[I].id)) {
				message.member.removeRole(roles[I].id)
				embed.setTitle('Role removed').setColor('#E54C4C')
				message.channel.send({ embed });
			} else {
				message.member.addRole(roles[I].id)
				embed.setTitle('Role added').setColor('#6DC066')
				message.channel.send({ embed });
			}
		}
	}

})

// login
bot.login(settings.bottoken)
console.log('Bot Online √');
