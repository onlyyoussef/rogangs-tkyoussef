const config = require('../config.json')
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: "rename",
  description: "rename a ticket for you",
  permissionbot: ["MANAGE_ROLES"],
  permission: ["MANAGE_CHANNELS"],
  options: [
    {
      name: "new_name",
      description: "new name for the ticket",
      required: true,
      type: 3
    }
  ],
  run: async (client,interaction,db) => {
     if(!interaction.member.permissions.has(`MANAGE_CHANNELS`))return interaction.reply({content: `${config.error}  This command requires \`managechannels\` permission`, ephemeral: true})
    if(!interaction.guild.me.permissions.has(`MANAGE_CHANNELS`))return interaction.reply({content: `${config.error}  Missing \`managechannels\` permission`, ephemeral: true})
    const newname = interaction.options.getString('new_name')
    const system = await db.get(`ticketsystem_${interaction.guild.id}`)
    if(system !== "on")return interaction.reply({content: `${config.error} Tickets System Is Off Cant rename a ticket for you`, ephemeral: true})
    const data = await db.get(`tickets`)
  if(!data.includes(interaction.channel.id))return interaction.reply({content: `${config.error} This isn't a ticket channel`, ephemeral: true})
      interaction.channel.setName(newname)
      interaction.deferReply({ephemeral: false}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.vaild} Succesfully renamed ticket with name **${newname}** `})
      }, 1000)
    })
    
    
  }
}