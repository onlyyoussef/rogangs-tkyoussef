module.exports = {
  name: "bc",
  description:"send a brodcast to everyone",
  options: [
    {
      name: "message",
      type: 3,
      description: "send the message",
      required: true
    }
  ],
  run: async (client,interaction) => {
    if(!interaction.member.permissions.has(`ADMINISTRATOR`))return interaction.reply({content:`:x: You can't use this command`})
    let msg = interaction.options.getString('message');
    interaction.guild.members.cache.forEach((member) => {
      member.send({content: `${member}
      تم وصول رساله جديده من قبل **${interaction.user.username}**
      محتوي رساله:
      \`${msg}\`
      
      `}).catch(err => {
        console.log(`Can't send message to ${member.user.username}`)
      })
    })
    interaction.reply({content: `:white_check_mark: Succesfully launched brodcast`})
  }
}