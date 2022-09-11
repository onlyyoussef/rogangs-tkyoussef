const config = require('../config.json')
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: "delete-limits",
  description: "delete ticket limits for you",
  permission:["ADMINISTRATOR"],
  run: async (client,interaction,db) => {
     if(!interaction.member.permissions.has(`ADMINISTRATOR`))return interaction.reply({content: `${config.error}  This command requires \`administrator\` permission`, ephemeral: true})
   const count =  await db.delete(`counttickets_${interaction.guild.id}`)
   if(count === null)return interaction.reply({content: `${config.error} Ticket limit is already **0**`, ephemeral: true})
      interaction.deferReply({ephemeral: true}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.vaild} Ticket limit has been set to **0**`})
      }, 2000)
    })
      
    
  }
}