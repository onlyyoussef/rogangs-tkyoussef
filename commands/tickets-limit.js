const config = require('../config.json')
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: "ticket-limits",
  description: "show ticket limits for you",
  permission:["ADMINISTRATOR"],
  run: async (client,interaction,db) => {
     if(!interaction.member.permissions.has(`ADMINISTRATOR`))return interaction.reply({content: `${config.error}  This command requires \`administrator\` permission`, ephemeral: true})
   const count =  await db.get(`counttickets_${interaction.guild.id}`)
   if(!count)return interaction.reply({content: `${config.error} No Tickets Has Been Opened yet`, ephemeral: true})
      interaction.deferReply({ephemeral: true}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.vaild} **${count}** Tickets has been opened`})
      }, 2000)
    })
      
    
  }
}