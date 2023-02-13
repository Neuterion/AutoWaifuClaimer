const { Client, RichPresence, getUUID } = require("discord.js-selfbot-v13")

const client = new Client()

const fs = require("fs")

// Load likelist
let likelist = []
fs.readFile('likelist.txt', (err, data) => {
  if (err) throw err;

  likelist = data.toString().split('\r\n')
})

// IDs
const TOKEN = 'NTQwOTkzNzc1OTUwODg4OTg1.Go6F01.Ob2DBJipdWBXoIUY7DDGdmD9YgXt-xxR_-7koY'
const CHANNEL_ID = '1069602044119359488'
// const CHANNEL_ID = '803927758605385778'
// const CHANNEL_ID = '1074170526827814932'
// const CHANNEL_ID = '1074172659195199618'
const BOT_ID = '432610292342587392'
const USER_ID = '540993775950888985'

// Global variables: roll & daily interval
const roll = {
  firstDelay: null,
  continuousDelay: null
}
const daily = {
  firstDelay: null,
  continuousDelay: null
}
const dk = {
  firstDelay: null,
  continuousDelay: null
}
let rollTimeouts = []
let claim_info = false
let claim_timer = null

// Rich presence (for trolling)
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
  console.log('We are online.')
  // client.user.setActivity(r)

  const CHANNEL = client.channels.cache.get(CHANNEL_ID)

  // Check $tu info, if Mudae doesn't respond, send again in 10 seconds
  CHANNEL.sendSlash(BOT_ID, 'tu')
})

client.on('messageCreate', async (message) => {
  if (message.channelId === CHANNEL_ID) {
    // Check if Mudae
    if (message.author.id === BOT_ID && message.interaction?.user?.id === USER_ID && message.content) {
      // Check if the message is from my $tu command
      if (message.content.startsWith("**Neuterion**, you")) {
        // Get Mudae message
        const tu_info = message.content.split('\n')

        // Get claim timer & info
        const claim = checkClaim(tu_info)
        claim_info = claim[0]
        claim_timer = claim[1]

        // If claim is available, use rolls
        if (claim_info) {
          runIntervals(tu_info)
        }
        else {
          clearIntervals()

          // Run intervals again after claim is available
          setTimeout(() => {
            console.log('Claim is available (again)! Rerunning intervals...')
            // Set claim_info to true
            claim_info = true

            runIntervals(tu_info)
          }, claim_timer)
        }
      }
    } else if (message.author.id === BOT_ID && !message.content) {
      // Must be from marry commands or the $im command
      const name = message.embeds[0].author.name
      const isLiked = likelist.includes(name)

      // Double check if from $im command or not
      const isFromIMCommand = message.embeds[0].description.includes('Claim')
      if (isFromIMCommand) return

      isLiked ? console.log(`${name} is LIKED!`) : console.log(`${name} is not liked.`)

      if (isLiked && claim_info) {
        if (message.interaction?.user?.id === USER_ID) {
          message.react('💀')
        } else {
          setTimeout(() => {
            message.react('💀')
          }, 5000)
        }
      }
    } else if (message.content.startsWith("💖 **Neuterion**")) {
      console.log()
      // Claim has been used
      // Get claimed name
      const waifu = message.content.match(/💖 \*\*Neuterion\*\* and \*\*([^\*]+)\*\* are now married!/m)
      console.log(`Neuterion has claimed ${waifu[1]}!`)

      // Clear roll timeouts if there were still any
      for (let i = 0; i < rollTimeouts.length; i++) {
        clearTimeout(rollTimeouts[i])
      }
      console.log('Cleared timeouts successfully! Roll timeouts:\n', rollTimeouts)

      const CHANNEL = client.channels.cache.get(CHANNEL_ID)
      await CHANNEL.sendSlash(BOT_ID, 'tu')
      console.log('Rerunning $tu command... Returning...')
      console.log()
    }
  }
})

function toMinutes(timer) {
  // Mudae timer string, e.g. "2h 15", "30", etc.
  if (!timer) {
    return null
  }

  if (timer.includes('h')) {
    let hours = timer.match(/([0-9]{1,2})h/m)[1]

    // If no minutes (e.g '3h'), set to 0
    let minutes = timer.match(/[0-9]{1,2}h ([0-9]{1,2})/m)[1] ?? 0

    timer = Number(hours) * 60 + Number(minutes)

    return timer
  }

  return Number(timer)
}

function rollWaifu(amount) {
  console.log('Amount of rolls: ', amount)
  const CHANNEL = client.channels.cache.get(CHANNEL_ID)

  const timeoutRoll = (id, delay) => {
    const timeout = setTimeout(async () => {
      await CHANNEL.sendSlash(BOT_ID, 'wa')
        .then(() => {
          clearTimeout(rollTimeouts[id])
        })
        .catch((err) => {
          // console.error(err)
          console.log('There was an error while running $wa. Rerunning...')
          timeoutRoll(delay + 5000)
        })
    }, delay)
    rollTimeouts[id] = timeout
  } 

  // Roll
  let delay = 4000
  for (let i = 0; i < amount; i++) {
    timeoutRoll(i, delay)
    delay += 4000
  }
}

function runIntervals(tu_info) {
  // Run $dk
  const dkInterval = runDk(tu_info)
  dk.firstDelay = dkInterval[0]
  dk.continuousDelay = dkInterval[1]

  // Roll until found liked character
  const rollIntervals = runRolls(tu_info)
  roll.firstDelay = rollIntervals[0]
  roll.continuousDelay = rollIntervals[1]

  // Set $daily interval
  const dailyInterval = runDaily(tu_info)
  daily.firstDelay = dailyInterval[0]
  daily.continuousDelay = dailyInterval[1]
}

function clearIntervals() {
  console.log('Clearing intervals now...')

  clearTimeout(roll.firstDelay)
  clearInterval(roll.continuousDelay)
  clearTimeout(daily.firstDelay)
  clearInterval(daily.continuousDelay)
  clearTimeout(dk.firstDelay)
  clearInterval(dk.continuousDelay)

  console.log('Roll intervals: ', roll)
  console.log('Daily intervals: ', daily)
  console.log('$dk intervals: ', dk)

  console.log('Successfully cleared intervals!')
}

function checkClaim(info) {
  // Claim info
  const claim_regex = /\*\*Neuterion\*\*, you _*(can|can't)_* claim [^\*]+\*\*([^\*]+)\*\* min./m
  const claim = info[0].match(claim_regex)

  // Check if claim is available
  const claim_info = claim[1] === 'can' ? true : false
  claim_info ? console.log('Claim is available!') : console.log('Claim is not available!')

  // Get next claim time
  const claim_timer = toMinutes(claim[2]) * 60000 ?? 0
  const nextClaim = new Date(Date.now() + claim_timer).toTimeString()
  console.log('Next claim is available at: ', nextClaim)

  return [claim_info, claim_timer]
}

function runRolls(info) {
  // console.log("runRolls function has been called")
  // Rolls info
  const roll_regex = /You have \*\*([0-9]{1,2})\*\* rolls? left\. Next rolls reset in \*\*([0-9]{1,2})\*\* min./m
  const rolls = info[1].match(roll_regex)
  const roll_amount = Number(rolls[1])
  const roll_timer = roll_amount > 0 ? 0 : Number(rolls[2]) * 60000

  // console.log('Roll timer: ', roll_timer)
  if (roll_timer === 0) {
    console.log('Rolls are available! Running...')
  } else {
    const nextRolls = new Date(Date.now() + roll_timer).toTimeString()
    console.log('Next rolls available at: ', nextRolls)
  }

  const firstDelay = setTimeout(async () => {
    console.log("Running hourly rolls...")
    roll_amount === 0 ? rollWaifu(10) : rollWaifu(roll_amount)
  }, roll_timer)

  const continuousDelay = setInterval(() => {
    setTimeout(async () => {
      console.log("Running hourly rolls...")
      rollWaifu(10)
    }, roll_timer)
  }, 3600000)

  return [firstDelay, continuousDelay]
}

function runDaily(info) {
  // $daily info
  const daily_regex = /\$daily [^\*]*\**([^\*]*)\**/m
  const daily = info[2].match(daily_regex)
  
  // If there is a daily timer, that means $daily is not available.
  const daily_timer = toMinutes(daily[1]) * 60000 ?? 0

  // Log next $daily time
  if (daily_timer === 0) {
    console.log('$daily is available! Running...')
  } else {
    const nextDaily = new Date(Date.now() + daily_timer).toTimeString()
    console.log('Next $daily available at: ', nextDaily)
  }

  const CHANNEL = client.channels.cache.get(CHANNEL_ID)

  const firstDelay = setTimeout(async () => {
    await CHANNEL.sendSlash(BOT_ID, 'daily')
    await CHANNEL.sendSlash(BOT_ID, 'rolls')

    // Daily rolls = 10
    console.log("Running daily rolls...")
    await rollWaifu(10)
  }, daily_timer)

  const continuousDelay = setInterval(() => {
    setTimeout(async () => {
      await CHANNEL.sendSlash(BOT_ID, 'daily')
      await CHANNEL.sendSlash(BOT_ID, 'rolls')

      // Daily rolls = 10
      console.log("Running daily rolls...")
      await rollWaifu(10)
    }, daily_timer)
  }, 72000000)

  return [firstDelay, continuousDelay]
}

function runDk(info) {
  // Check $dk info
  const dk_regex = /\$dk [^\*]*\**([^\*]*)\**/m
  const dk = info[10].match(dk_regex)
  const dk_timer = toMinutes(dk[1]) * 60000 ?? 0

  if (dk_timer === 0) {
    console.log('$dk is available! Running...')
  } else {
    const nextDk = new Date(Date.now() + dk_timer).toTimeString()
    console.log('Next $dk available at: ', nextDk)
  }

  const CHANNEL = client.channels.cache.get(CHANNEL_ID)

  const firstDelay = setTimeout(async () => {
    await CHANNEL.sendSlash(BOT_ID, 'dk')
  }, dk_timer)

  const continuousDelay = setInterval(() => {
    setTimeout(async () => {
      await CHANNEL.sendSlash(BOT_ID, 'dk')
    }, dk_timer)
  }, 86400000)

  return [firstDelay, continuousDelay]
}

client.login(TOKEN)
