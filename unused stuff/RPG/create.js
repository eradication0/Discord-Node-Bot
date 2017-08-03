exports.run = function(bot, message, args) {
	var req = require('../bot.js');
        if (!req.db[message.author.id]) {
            req.db[message.author.id] = req.newuser
            req.fs.writeFile(req.dbpath, JSON.stringify(req.db))
            message.channel.send("New profile created!")
            console.log('new profile created!')
        } else {
            message.channel.send('You already have a profile.')
        }
}
