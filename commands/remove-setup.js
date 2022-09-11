const config = require('../config.json')
module.exports = {
  name: "remove_setup",
  description: "remove setup ticket pro in a channel",
  permission: ["MANAGE_CHANNELS"],
  permissionbot: ["MANAGE_ROLES"],
  run: async (client,interaction,db) => {
     if(!interaction.member.permissions.has(`ADMINISTRATOR`))return interaction.reply({content: `${config.error}  This command requires \`administrator\` permission`, ephemeral: true})
    const system = await db.get(`ticketsystem_${interaction.guild.id}`)
    if(system !== "on")return interaction.reply({content: `${config.error} Tickets System Is Already Off`, ephemeral: true})
    db.delete(`ticketchannel_${interaction.guild.id}`) 
    db.delete(`ticketsystem_${interaction.guild.id}`)
    interaction.deferReply({ephemeral: false}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.error} Succesfully removed Ticket system `})
      }, 2000)
    })
  }
}