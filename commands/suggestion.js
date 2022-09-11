const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
module.exports = {
  name: "suggest",
  description: "قول هنا حاجه لل سيرفر و هنشوفها قريب ",
  options: [
    {
      name: "message",
      description: "محتوي بتاع ال sugeest",
      required: true,
      type: 3
    }
    ],
  run: async (client,interaction,db) => {
    const message = interaction.options.getString('message')
    db.set(`m`, `${message}`)
  let channel = "1012130626440265859"
  const row = new MessageActionRow()
  .addComponents(
    new MessageButton()
    .setStyle(`SUCCESS`)
    .setLabel(`Accept`)
    .setCustomId(`accept`),
   new MessageButton()
    .setStyle(`DANGER`)
    .setLabel(`Declind`)
    .setCustomId(`declind`)
  )
  interaction.guild.channels.cache.get(channel).send({embeds: [
    new MessageEmbed()
    .setColor(`RANDOM`)
    .setTitle(`New Suggestion`)
    .setFooter(interaction.user.username,interaction.user.displayAvatarURL())
    .setDescription(`
    **تم وصول محتوي جديد من ${interaction.user.tag}**
    محتوي رساله: 
    ${message}
    
    `)
  ]}).then(n => {
   n.react("✅")
   n.react("❌")
  })
    await interaction.reply({content: `
    \`\`\`fix
    سوف يتم عرض محتواك في قريبا\`\`\`
    
    
    `, ephemeral: true})
  
  }
}