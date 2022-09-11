
const express = require('express');
const chalk = require('chalk')
const app = express();
const fs = require('fs')
app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(3000, () => {
  console.log('server started');
});
const { Discord, MessageEmbed , MessageSelectMenu, MessageButton, Intents, Client, MessageCollector , Collection, MessageActionRow} = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB()
const client = new Client({intents: 3276799})
client.login(process.env.TOKEN)
const dotenv = require('dotenv');
dotenv.config();
client.setMaxListeners(0)
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.ID_BOT
const config = require('./config.json')
const token2 = process.env.TOKEN
const prefix = config.prefix;
client.commands = new Collection();
const data = ["1012365910847266966", "1012371759007289385"]
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const wait = require('node:timers/promises').setTimeout;
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
const commands = client.commands.map(({ execute, ...data }) => data);

// Register slash commands
const rest = new REST({ version: '9' }).setToken(token2);
console.log(chalk.bgBlue('Started refreshing slash commands...'));
// rest.put(
//     Routes.applicationCommands(config.clientId), { body: commands },
// );
 rest.put(
	Routes.applicationCommands(clientId),
	{ body: commands },
);
console.log(chalk.magenta.bold(`Successfully reloaded ${commands.length} slash commands!`));

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(chalk.bgCyanBright(`[API] Logged in as ${client.user.tag} \n ID : ${client.user.id}`))
  
  client.user.setStatus('idle')
  console.log(client.guilds.cache.size)
});
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()){
      if(!interaction.channel.guild)return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(client,interaction,db);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: `${client.user.username} Got an error please contact us in support server or wait until the developer fix it`, ephemeral: true });
    }
    }
  if(interaction.isButton()){
    if(interaction.customId === "open-ticket"){
         if(!interaction.guild.me.permissions.has(`MANAGE_CHANNELS` || `MANAGE_ROLES`))return interaction.reply({content: `:x: Missing \`managechannels or manageroles\` permission`, ephemeral: true})
     const count =  await db.add(`counttickets_${interaction.guild.id}`, 1)
     
      const system = await db.get(`ticketsystem_${interaction.guild.id}`)
      
       if(system !== "on")return interaction.reply({content: `${config.error} Tickets System Is Off Cant open a ticket for you`, ephemeral: true})
    
     const channel = await interaction.guild.channels.create(`ticket-${count}`,{reason: 'TICKET CHANNEL', permissionOverwrites: [
        {
          id: interaction.user.id,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
        },
        {
          id: interaction.guild.roles.everyone.id,
          deny: ["VIEW_CHANNEL"]
        },
    {
      id: client.user.id,
      allow: ["VIEW_CHANNEL","SEND_MESSAGES"]
    },
       {
         id: "1015998078613995602",
         allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
       }
      ]}).then((channel2) => {
         const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setLabel(`🔒 Close `)
      .setCustomId(`close-ticket`)
      .setStyle(`SECONDARY`),
      new MessageButton()
      .setLabel(`📣 Mention  `)
      .setCustomId(`mention-ticket`)
      .setStyle(`SECONDARY`)

      )
    channel2.send({content: `<@${interaction.user.id}>`, embeds: [
      new MessageEmbed()
      .setColor(`GREEN`)
      .setTimestamp()
      .setDescription(`${interaction.user} **Here is your ticket please wait until a support  contact you here**`)
      .setFooter(`Ticket by ${interaction.user.username}`, interaction.user.displayAvatarURL())
     
    ], components: [row]})
    db.push("tickets", channel2.id) 
      interaction.deferReply({ephemeral: true}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.vaild} Succesfully opened ticket with name ${channel2} `})
      }, 2000)
    })
      })
    
    }else if(interaction.customId === "close-ticket"){
       if(!interaction.guild.me.permissions.has(`MANAGE_CHANNELS`))return interaction.reply({content: `:x: Missing \`managechannels\` permission`, ephemeral: true})
    
       const data = await db.get(`tickets`)
  if(!data.includes(interaction.channel.id))return interaction.reply({content: `${config.error} This isn't a ticket channel`, ephemeral: true})
      await db.pull(`tickets`,interaction.channel.id)
      setTimeout(async () => {
        
        interaction.channel.delete()
      },10000)
      interaction.deferReply({ephemeral: true}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.vaild} **Process on work This can take 10 seconds** `})
      }, 1000)
    })
    interaction.channel.send({embeds:[
      new MessageEmbed()
      .setDescription(`${config.error} Closing ticket this can take up to 10 seconds`)
      .setColor(`RED`)
    ] })
    }else if(interaction.customId === "mention-ticket"){
     
     
      let roles = ["1012200596180320347", "958074278803284008", "965998865662763130"]
      interaction.reply({content: `:white_check_mark: Succesfully mentioned admins`, ephemeral: true})
      interaction.channel.send({content: `<@&1015998078613995602> ${interaction.user.username} عايزكم`})
    }
        }else  if (interaction.isContextMenu()) {
        const command = client.commands.get(interaction.commandName);
        if (command) command.execute(client, interaction);
    }
    
  
    
});
client.on('messageCreate', async msg => {
  if(msg.content === prefix + "delete"){
     if(!msg.guild.me.permissions.has(`MANAGE_CHANNELS`))return msg.reply({content: `:x: Missing \`managechannels\` permission`})
    
     const data = await db.get(`tickets`)
  if(!data.includes(msg.channel.id))return msg.reply({content: `${config.error} This isn't a ticket channel`}).then((message) => {
    setTimeout(() => {
      message.delete()
    },5000)
  })
    msg.delete()
     await db.pull(`tickets`,msg.channel.id)
      setTimeout(async () => {
        
        msg.channel.delete()
      },10000)
      msg.channel.send({embeds:[
      new MessageEmbed()
      .setDescription(`${config.error} Closing ticket this can take up to 10 seconds`)
      .setColor(`RED`)
    ] })
    
  }else if(msg.content.startsWith(prefix + "rename")){
    if(!msg.guild.me.permissions.has(`MANAGE_CHANNELS`))return msg.reply({content: `:x: Missing \`managechannels\` permission`})
    if(!msg.member.permissions.has(`MANAGE_CHANNELS`))return msg.reply({content: `:x: This command required \`managechannels\` permission`})
      const data = await db.get(`tickets`)
  if(!data.includes(msg.channel.id))return msg.reply({content: `${config.error} This isn't a ticket channel`}).then((message) => {
    setTimeout(() => {
      message.delete()
    },5000)
  })
    const args = msg.content.split(' ').slice(1).join(' ')
    if(!args)return msg.reply({content: `:x: Please type the new name`}).then((message) => {
      setTimeout(() => {
        message.delete()
      }, 4000)
    })
    msg.delete()
    msg.channel.setName(args)
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(prefix + "mute")){
    if(!msg.member.permissions.has(`MODERATE_MEMBERS`))return;
    
    let user = msg.mentions.members.first()
    if(!user)return msg.reply({content: `:x: منشن حد`})
    
      if(!user.moderatable)return msg.reply({content: `:x: استنا طيب ابيع لباسي و اجرب اديله`})
     if(user.id == client.id)return msg.reply({content: `منيوك انت ؟`})
    if(user.id == msg.author.id)return msg.reply({content: `انتم بتخلوني لو معايا خنجرين واحد هحطه في قلبي و التاني فطيزي`})
    user.timeout(3.6e+6)
   
    
    await msg.reply({content: `:white_check_mark: تم اسكات هاذا الشخص لمده ساعه`})
  }
})

process.on('unhandledRejection', err => {
  console.log(err)
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`كسمك`)|| msg.content.endsWith(`كسمك`)){
    if(data.includes(msg.channel.id))return;
    let member = msg.mentions.members.first();
    if(member.id === msg.author.id)return;     
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
   if(data.includes(msg.channel.id))return;
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`ق امك`)|| msg.content.endsWith(`ق امك`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`قسمك`)|| msg.content.endsWith(`قسمك`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`قص امك`)|| msg.content.endsWith(`قص امك`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن الاحبه`)|| msg.content.endsWith(`يبن الاحبه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن قحبه`)|| msg.content.endsWith(`يبن قحبه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبت الوثخه`)|| msg.content.endsWith(`يبت الوثخه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن الوسخه`)|| msg.content.endsWith(`يبن الوسخه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن شرموطه`)|| msg.content.endsWith(`يبن شرموطه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن متناكه`)|| msg.content.endsWith(`يبن المتناكه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن المتناكه`)|| msg.content.endsWith(`يبن المتناكه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن عرص`)|| msg.content.endsWith(`يبن عرص`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن المعرصه`)|| msg.content.endsWith(`يبن المعرصه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن العرص`)|| msg.content.endsWith(`يبن العرص`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبنت المنيوكه`)|| msg.content.endsWith(`يبنت المنيوكه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن المنيوكه`)|| msg.content.endsWith(`يبن المنيوكه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبنت شرموطه`)|| msg.content.endsWith(`يبنت شرموطه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبنت القحاب`)|| msg.content.endsWith(`يبنت القحاب`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`صمك`)|| msg.content.endsWith(`صمك`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبنت الاحبه`)|| msg.content.endsWith(`يبنت الاحبه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبنت المرا`)|| msg.content.endsWith(`يبنت المرا`)){
    if(data.includes(msg.channel.id))return;
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`كسم البطن الي جابتك `)|| msg.content.endsWith(`كسم البطن الي جابتك`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن المرا`)|| msg.content.endsWith(`يبن المرا`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبنت الوسخه`)|| msg.content.endsWith(`يبنت الوسخه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     if(member.id === msg.author.id)return;
    if(member){
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(`يبن وسخه`)|| msg.content.endsWith(`يبن وسخه`)){
        let member = msg.mentions.members.first();     if(member.id === msg.author.id)return;     
   
    if(member){
      
      let embed = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(`
${member}, **${msg.author.username}** شتمك و قالك ${msg.content} \n 
تحب نديله ميوت ساعه ولا قابل الهزار ؟
      `)
      let row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('SUCCESS')
        .setLabel(`اديله`)
        .setCustomId(`adelh`),
        new MessageButton()
        .setStyle('DANGER')
        .setLabel(`لا مسامحه`)
        .setCustomId(`ladont`),
        
      )
     msg.channel.send({content: `${member}`, embeds:[embed], components:[row]}).then((m) => {
      db.pull(`messages_`, m.id)
    })
    const collector = msg.channel.createMessageComponentCollector({type: "BUTTON", time: 40000})
    collector.on('collect', async b => {
    if(b.user.id !== member.id)if(b.user.id !== member.id)return b.reply({content: `:x: This Action is not for you `, ephemeral: true})
    if(b.customId === "adelh"){
      if(!msg.member.moderatable)return msg.reply({content: `:x: رتبت الشخص ده اعلي من رتبتي او معاه ادمن ستريتور`})
      msg.member.timeout(3.6e+6)
      b.channel.send({content: `${member.user.username} اخذ ميوت ل سب ${msg.author.username}`})
      collector.stop()
    }else if(b.customId === "ladont"){
     collector.stop()
     b.reply({content: `:x: Action has Stopped Succesfully`})
      
      
    }
    })
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content.startsWith(prefix + "mshkabel")){
    
    let member = msg.mentions.members.first() 
    if(!member)return msg.reply({content: `:x: منشن ال سبك و انت مش قابل هزاره`})
    const args = msg.content.slice(prefix.length).trim().split(/\s+/)
  
    if(!args[2])return msg.reply({content: `:x: مفروض بقا اني اخمن هوا شتمك قالك ايه صح ؟`})
    let channelspi = msg.guild.channels.cache.get('1015929958658490388')
    channelspi.send({embeds: [
      new MessageEmbed()
      .setTitle(`ابلاغ من ${msg.author.username}`)
      .setDescription(`
      تم سب ${msg.author.username} من قبل : \n ${member.user.tag} (${member.id})
      السب : ${args[2]}
      `)
      .setTimestamp()
      .setFooter(msg.author.username,msg.author.displayAvatarURL())
    ]})
    await msg.reply({content: `:white_check_mark: تم وصول بلاغ لل ادمنز `})
  }
})
client.on('messageCreate', msg => {
  if(msg.content === prefix + "help"){
    let embed = new MessageEmbed()
    .setColor("WHITE")
    .setTitle(`قايمه الهيلب`)
    .setDescription(`**
    علشان تشوف الاوامر كلها روح علي ال منيو ال قدامك و اختار ال قايمه ال تحبها علشان تعرف 
    **`)
    let row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
      .setPlaceholder(`Click here for help command`)
      .setCustomId(`selectmenu`)
      .addOptions(
        {
          label: "Chat commands",
          value: "chat_menu",
          emoji: "💬",
          description: "اظهار اوامر الشات"
        },
         {
          label: "Ticket commands",
          value: "Ticket_menu",
          emoji: "📩",
          description: "اظهار اوامر التكت"
        },
        {
          label: "Admins commands",
          value: "Admin_menu",
          emoji: "🛠️",
          description: "اظهار اوامر الادمن"
        }
      )
      );
      msg.reply({embeds: [embed], components: [row]})
   
    
    
  }
})
client.on("interactionCreate", async interaction => {
  if(interaction.isSelectMenu()){
    if(interaction.values == "Admin_menu"){
        if(!interaction.member.permissions.has(`ADMINISTRATOR`))return interaction.reply({content: `:x: للاسف انت مش معاك صلاحيات لل قايمه دي`, ephemeral :true})
        let embed = new MessageEmbed()
        .setColor("WHITE")
        .setDescription(`
          **${prefix}mute:** \`اعطاء ميوت لشخص ساعه\` \n
          **/role_add:** \`لاضافه رتبه للشخص \` \n
          **/role_remove:** \`لسحب رتبه للشخص \` \n
          **ازا توريدون المزيد كلمو العرص صاحب السيرفر و خلي يكلمني و انا هعمل**
        
        `)
      interaction.reply({embeds: [embed], ephemeral: true})
    }else if(interaction.values == "Ticket_menu"){
        const embed = new MessageEmbed()
    .setColor('WHITE')
    .setDescription(`ل فتح التكت روح هنا 
    <#1014954191384485988>`)
    .addFields(
      {
        name: `${prefix}setup`, value: "setup ticket system for the guild"
      },
      {
        name: `${prefix}remove-setup`, value: "remove ticket system from the guild"
      },
      {
        name: `${prefix}rename`, value: "rename a ticket  for member"
      },
      {
        name: `${prefix}ticket-limit`, value: "setup ticket system for the guild"
      },
      {
        name: `${prefix}delete-limit`, value: "setup ticket system for the guild"
      },
            
    )
    .setFooter(`Requested by ${interaction.user.username}`, interaction.user.displayAvatarURL())
    .setTimestamp()
    .setFooter(`RoGang Help `)
      interaction.reply({embeds: [embed], ephemeral: true})
    }else if(interaction.values == "chat_menu"){
        let embed = new MessageEmbed()
        .setColor("WHITE")
        .setDescription(`
        **${prefix}mshkabel:** \`لو مش قابل هزار حد بل شتايم اكتب الامر ده و هيوصل ابلاغ لل ادمنز\` \n
        **/suggest:** \`عندك اقتراح لل سيرفر او ل حاجه فل سيرفر استعمل الامر ده\` \n
        **__More Soon__**
        
        `)
        interaction.reply({embeds:[embed], ephemeral: true})
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content === prefix + "select_menu"){
    if(!msg.member.permissions.has(`ADMINISTRATOR`))return;
    let embed = new MessageEmbed()
    .setColor(`WHITE`)
    .setDescription(`دوس علي المنيو ال قدامك و اختار الرول ال تعجبك`)
    .setFooter(`لو بنت اخدت رتبه ولد او ولد اخد رتبه بنت هياخد باند لمده 3 ايام`)
    let row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
      .setPlaceholder(`Choose a role `)
      .setCustomId('select_2')
      .addOptions(
        {
          label: "✨𝐁𝐎𝐘𝐒✨",
          description: 'Give you Boys role',
          value: "boys",
          emoji: "👦"
        },
        {
          label: "✨𝐐𝐔𝐄𝐄𝐍𝐒✨",
          description: 'Give you Girl role',
          value: "girl",
          emoji: "👧"
        },
        {
          label: "mm2",
          description: 'Give you mm2 role',
          value: "mm2",
          emoji: "1012178276925591562"
        },
        {
          label: "BedWars",
          description: 'Give you bedwars role',
          value: "bw",
          emoji: "1012176308744245258"
        },
        {
          label: "Valorant",
          description: 'Give you Valorant role',
          value: "vt",
          emoji: "1012175810582560818"
        },
        {
          label: "-16",
          description: 'Give you a -16 role',
          value: "-16",
          emoji: "977901170305687552"
        },
        {
           label: "+16",
          description: 'Give you a +16 role',
          value: "+16",
          emoji: "977901081659056158"
        },
        {
          label: "demon slayer",
          description: 'Give you a demonslayer role',
          value: "ds",
          emoji: "⚔️"
        },
        {
          label: "bloxfruit",
          description: 'Give you a  Blox Fruit role',
          value: "bf",
          emoji: "🍒"
        },
        {
          label:"streetcorner",
          description: 'Give you a street corner role',
          value: "sc",
          emoji: "⚽"
          
        }
      )
    )
    msg.channel.send({embeds: [embed], components: [row]})
  }
})
client.on("interactionCreate", interaction => {
  if(interaction.isSelectMenu()){
    if(interaction.values == "boys"){
      interaction.member.roles.add("958076479323918426")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه الاولاد `, ephemeral: true})
    }else
       if(interaction.values == "girl"){
      interaction.member.roles.add("958076708945281054")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه البنات `, ephemeral: true})
    }else
       if(interaction.values == "mm2"){
      interaction.member.roles.add("987782200340672512")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه ام ام تو `, ephemeral: true})
    }else
       if(interaction.values == "vt"){
      interaction.member.roles.add("1012171615523590294")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه فالورانت `, ephemeral: true})
    }else
       if(interaction.values == "-16"){
      interaction.member.roles.add("1012172507232612382")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه -16 `, ephemeral: true})
    }else
       if(interaction.values == "+16"){
      interaction.member.roles.add("1012172546369667203")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه +16 `, ephemeral: true})
    }else
       if(interaction.values == "ds"){
      interaction.member.roles.add("1012319970073514027")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه ديمون ستلاير `, ephemeral: true})
    }else
       if(interaction.values == "bf"){
      interaction.member.roles.add("1012320271149056031")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه بلوكس فروت `, ephemeral: true})
  }else
       if(interaction.values == "sc"){
      interaction.member.roles.add("1012319982685782166")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه ستريت كورنل `, ephemeral: true})
    }else 
           if(interaction.values == "bw"){
      interaction.member.roles.add("1012171582841561149")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه بيد ورز `, ephemeral: true})
    }
  }
})
client.on('messageCreate', async msg => {
  if(msg.content === prefix + "select_menu2"){
    if(!msg.member.permissions.has(`ADMINISTRATOR`))return;
    let embed = new MessageEmbed()
    .setColor(`WHITE`)
    .setDescription(`دوس علي المنيو ال قدامك و اختار الون ال تعجبك`)
    .setFooter(`لو البوت مشتغلش معاك اصبر شويه و خلي بالك من بوت لو لقيته اون لاين روح و اختار الون بتاعك`)
    let row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
      .setPlaceholder(`Choose a color `)
      .setCustomId('select_2')
      .addOptions(
        {
          label: "red",
          description: 'Give you red Color',
          value: "red",
          emoji: "♥️"
        },
        {
          label: "light coral",
          description: 'Give you light coral Color',
          value: "lc",
          emoji: "🦑"
        },
        {
          label: "Light pink",
          description: 'Give you light pink color',
          value: "lp",
          emoji: "💗"
        },
        {
          label: "deep pink",
          description: 'Give you deep pink color',
          value: "dp",
          emoji: "1012221780288618506"
        },
        {
          label: "Orange",
          description: 'Give you orange color',
          value: "orange",
          emoji: "🧡"
        },
        {
          label: "Yellow",
          description: 'Give you a yellow color',
          value: "yellow",
          emoji: "💛"
        },
        {
           label: "Violet",
          description: 'Give you a violet color',
          value: "vtc",
          emoji: "💜"
        },
        {
          label: "Lavender",
          description: 'Give you a lavender color',
          value: "lr",
          emoji: "1012222384658468894"
        },
        {
          label: "Lime",
          description: 'Give you a  lime  color',
          value: "lime",
          emoji: "1012222690335129650"
        },
        {
          label:"green",
          description: 'Give you a green color',
          value: "green",
          emoji: "💚"
          
        },
        {
          label:"brown",
          description: 'Give you a brown color',
          value: "brown",
          emoji: "🤎"
        },
        {
          label:"gray",
          description: 'Give you a gray color',
          value: "gray",
          emoji: "1012222883050823700"
        },
        {
          label:"black",
          description: 'Give you a black color',
          value: "black",
          emoji: "⚫"
        },
        {
          label:"mint",
          description: 'Give you a mint color',
          value: "mint",
          emoji: "1012223491648536606"
        },
        {
          label:"cyan",
          description: 'Give you a cyan color',
          value: "cyan",
          emoji: "🌀"
        }
      )
    )
    msg.channel.send({embeds: [embed], components: [row]})
  }
})
client.on("interactionCreate", interaction => {
  if(interaction.isSelectMenu()){
    if(interaction.values == "red"){
      if(interaction.member.roles.cache.has(`1012215083818029096`))return interaction.member.roles.remove("1012215083818029096")
      interaction.member.roles.add("1012215083818029096")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون احمر `, ephemeral: true})
    }else
       if(interaction.values == "lc"){
         if(interaction.member.roles.cache.has(`1012215996918005800`))return interaction.member.roles.remove("1012215996918005800")
      interaction.member.roles.add("1012215996918005800")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون لايت كورال `, ephemeral: true})
    }else
       if(interaction.values == "lp"){
         if(interaction.member.roles.cache.has(`1012216001863090207`))return interaction.member.roles.remove("1012216001863090207")
         interaction.member.roles.add("1012216001863090207")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون لايت بنك `, ephemeral: true})
    }else
       if(interaction.values == "dp"){
          if(interaction.member.roles.cache.has(`1012216002592907264`))return interaction.member.roles.remove("1012216002592907264")
      interaction.member.roles.add("1012216002592907264")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون ديب بينك `, ephemeral: true})
    }else
       if(interaction.values == "orange"){
          if(interaction.member.roles.cache.has(`1012216003175915581`))return interaction.member.roles.remove("1012216003175915581")
      interaction.member.roles.add("1012216003175915581")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون برتقالي - `, ephemeral: true})
    }else
       if(interaction.values == "yellow"){
          if(interaction.member.roles.cache.has(`1012216003951861770`))return interaction.member.roles.remove("1012216003951861770")
      interaction.member.roles.add("1012216003951861770")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون اصفر `, ephemeral: true})
    }else
       if(interaction.values == "vtc"){
         if(interaction.member.roles.cache.has(`1012216005294034955`))return interaction.member.roles.remove("1012216005294034955")
      interaction.member.roles.add("1012216005294034955")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون فايولنت `, ephemeral: true})
    }else
       if(interaction.values == "lr"){
         if(interaction.member.roles.cache.has(`1012216005323391098`))return interaction.member.roles.remove("1012216005323391098")
      interaction.member.roles.add("1012216005323391098")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون لافيندر `, ephemeral: true})
  }else
       if(interaction.values == "lime"){
         if(interaction.member.roles.cache.has(`1012216006162255943`))return interaction.member.roles.remove("1012216006162255943")
      interaction.member.roles.add("1012216006162255943")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون لايم `, ephemeral: true})
    }else 
           if(interaction.values == "green"){
             if(interaction.member.roles.cache.has(`1012216006904655872`))return interaction.member.roles.remove("1012216006904655872")
      interaction.member.roles.add("1012216006904655872")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون اخضر  `, ephemeral: true})
    }else 
             if(interaction.values == "brown"){
               if(interaction.member.roles.cache.has(`1012216034054385724`))return interaction.member.roles.remove("1012216034054385724")
      interaction.member.roles.add("1012216034054385724")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون بني    `, ephemeral: true})
    }else 
               if(interaction.values == "gray"){
                 if(interaction.member.roles.cache.has(`1012216007437320282`))return interaction.member.roles.remove("1012216007437320282")
      interaction.member.roles.add("1012216007437320282")
      interaction.reply({content: `:white_check_mark: تم اعطائك رتبه بيد ورز `, ephemeral: true})
    }else 
                 if(interaction.values == "black"){
                   if(interaction.member.roles.cache.has(`1012216008309735475`))return interaction.member.roles.remove("1012216008309735475")
      interaction.member.roles.add("1012216008309735475")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون رمادي  `, ephemeral: true})
    }else 
                   if(interaction.values == "mint"){
                     if(interaction.member.roles.cache.has(`1012216733278408744`))return interaction.member.roles.remove("1012216733278408744")
      interaction.member.roles.add("1012216733278408744")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون مينت  `, ephemeral: true})
    }else 
                     if(interaction.values == "cyan"){
                       if(interaction.member.roles.cache.has(`1012217606935166977`))return interaction.member.roles.remove("1012217606935166977")
      interaction.member.roles.add("1012217606935166977")
      interaction.reply({content: `:white_check_mark: تم اعطائك لون لبني  `, ephemeral: true})
    }
  }
})
client.on(`messageCreate`, msg => {
  if(msg.content.includes(`<@867845182695014411>`)){
    msg.reply({content: `<:a7e:977297116936421426> منتا متمنشنش و خلاص حضرتك عايز حاجه استعمل ${prefix}help `}).then((message) => {
      setTimeout(() => {
        message.delete()
      }, 3000)
    })
  }
})
