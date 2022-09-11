module.exports = {
  name: "role_remove",
  description: "add a role ",
  options: [
    {
      name: "role_name",
      description: "1",
      type: 8,
      required: true
    },
    {
      name: "member",
      description: "2",
      type: 6,
      required: true
    }
  ],
  run: async (client,interaction) => {
    let role = interaction.options.getRole('role_name')
    let member = interaction.options.getMember(`member`)
    if(!interaction.member.permissions.has(`MANAGE_ROLES`))return interaction.reply({content: `:x: ليس لديك الصلاحيات الكافيه`, ephemeral: true})
    if(!interaction.guild.me.permissions.has(`MANAGE_ROLES`))return interaction.reply({content: `:x: انا ليس لدي manageroles`, ephemeral: true})
    let authorrole = interaction.member.roles.highest.position;
    let userole = member.roles.highest.position;
    let clientrole = interaction.guild.me.roles.highest.position;
    const currentrole = role.position;
    if(clientrole < currentrole)return interaction.reply({content: `:x: Can't change role for this user please check my permission and role position`})
    if(currentrole > authorrole)return interaction.reply({content: `:x: This role is higher than you`})
    if(currentrole == userole)return interaction.reply({content: `:x: This role is the maxium role you can give`})
    if(authorrole < currentrole)return interaction.reply({content: `:x: you can't update roles for ${member}`})
    member.roles.remove(role)
    interaction.reply({content: `:white_check_mark: تم ازاله ${role.name} الي ${member}`})
  }
}