const { MessageEmbed } = require('discord.js')
const prefix = "/"
module.exports = {
  name: "ping",
  description: "show bot ping ",
  permission: ["SEND_MESSAGES"],
  permissionbot: ["SEND_MESSAGES"],
  run: async (client,interaction) => {
    const embed = new MessageEmbed()
    .setColor('WHITE')
    .addFields(
      {
        name: `[API] Ping`, value: `${client.ws.ping}`
      },
      
      
    )
    .setFooter(`Requested by ${interaction.user.username}`, interaction.user.displayAvatarURL())
    .setTimestamp()
    .setFooter(`${client.user.username} ping `)
    interaction.reply({embeds: [embed]})
  }
}