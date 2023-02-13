const { Client, RichPresence, getUUID } = require('discord.js-selfbot-v13');
const dotenv = require('dotenv')
require('dotenv').config()
const client = new Client()

const r = new RichPresence()
	.setApplicationId('817229550684471297')
	.setType('WATCHING')
	.setURL('https://youtube.com/watch?v=dQw4w9WgXcQ')
	.setState('XI')
	.setName('YouTube')
	.setDetails('Speedrunning Genshin Impact 😱')
	.setParty({
		max: 4,
		current: 3,
		id: getUUID(),
	})
	.setStartTimestamp(Date.now() - 4924800000)
  .setEndTimestamp(Date.now() + 4924800000)
	.setAssetsLargeImage('929325841350000660')
	.setAssetsLargeText('Youtube')
	.setAssetsSmallImage('895316294222635008')
	.setAssetsSmallText('Neuterion')
	.addButton('Watch', 'https://youtube.com/watch?v=dQw4w9WgXcQ')

client.on('ready', async () => {
  client.user.setActivity(r);
})

client.login(process.env.TOKEN)