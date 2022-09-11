const { MessageEmbed } = require('discord.js')
const prefix = "/"
module.exports = {
  name: "help",
  description: "show help command",
  permission: ["SEND_MESSAGES"],
  permissionbot: ["SEND_MESSAGES"],
  run: async (client,interaction) => {
    const embed = new MessageEmbed()
    .setColor('WHITE')
    .addFields
const { MessageEmbed } = require('discord.js')
const prefix = "/"
module.exports = {
  name: "help",
  description: "show help command",
  permission: ["SEND_MESSAGES"],
  permissionbot: ["SEND_MESSAGES"],
  run: async (client,interaction) => {
    const embed = new MessageEmbed()
    .setColor('WHITE')
    .addFields(
      {
        name: `${prefix}setup`, value: "setup ticket system for the guild"
      },
      {
        name: `${prefix}remove-setup`, value: "remove ticket system from the guild"
      },
      {
        name: `${prefix}open`, value: "open a ticket for a member"
      },
      {
        name: `${prefix}close`, value: "close a ticket for a member"
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
    .setFooter(`TicketPro Help `)
    interaction.reply({embeds: [embed]})
  }
}
(
      {
        name: `${prefix}setup`, value: "setup ticket system for the guild"
      },
      {
        name: `${prefix}remove-setup`, value: "remove ticket system from the guild"
      },
      {
        name: `${prefix}open`, value: "open a ticket for a member"
      },
      {
        name: `${prefix}close`, value: "close a ticket for a member"
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
    .setFooter(`TicketPro Help `)
    interaction.reply({embeds: [embed]})
  }
}