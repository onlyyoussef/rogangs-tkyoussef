const config = require('../config.json')
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton} = require('discord.js')
module.exports = {
  name: "setup",
  description: "setuping ticket pro in a channel",
  permission: ["MANAGE_CHANNELS"],
  permissionbot: ["MANAGE_ROLES"],
  options: [
    {
      name: "channel",
      description: "mention a channel to setup",
      type: 7,
      required: true
    }
  ],
  run: async (client,interaction,db) => {
     if(!interaction.member.permissions.has(`ADMINISTRATOR`))return interaction.reply({content: `${config.error}  This command requires \`administrator\` permission`, ephemeral: true})
    const channelspi = interaction.options.getChannel(`channel`)
    if(!channelspi)return interaction.reply({content: `${config.error} Can't find this channel to setup` , ephemeral: true})
    const embed = new MessageEmbed()
    .setColor('GREEN')
    .setTitle(`Ticket`)
    .setFooter(`A ticket With A lot of Futures`, client.user.displayAvatarURL())
    .setDescription(`To create a ticket react with 📩`)
    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setLabel(`📩 Create Ticket`)
      .setCustomId(`open-ticket`)
      .setStyle(`SECONDARY`)

      )
    channelspi.send({embeds: [embed], components: [row]})
    db.set(`ticketsystem_${interaction.guild.id}`, "on")
    interaction.deferReply({ephemeral: false}).then(() => {
      setTimeout(() => {
        interaction.editReply({content: `${config.vaild} Succesfully setuped Ticket system in ${channelspi}`})
      }, 2000)
    })
  }
}