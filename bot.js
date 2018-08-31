const Discord = require('discord.js');
const config = require("./config.json");
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Bot started. Logged in as ${client.user.tag}.`);
console.log(`Monitoring ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guild(s).`);
});

client.on("guildCreate", guild => {
	// This triggers when our boyo joins a new party
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
	// This event is what happens when boyo get kicked out of said party
  console.log(`User has been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

	//listen for idiots joining the server, assign roles n shit
client.on('guildMemberAdd', member => {
	console.log('User ' + member.user.username + ' has joined the server!')
	var role = member.guild.roles.find('name', 'Member');
	member.addRole(role);
	member.channel.send('Welcome to the server, ' + member.user.username + '!');
});

client.on('message', async message => {
	//Don't reply to bots
	if(message.author.bot) return;
	
	//Tells bot how to read text
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	//whatsmylatency.notavirus
	if (command === 'ping') {
		const m = await message.channel.send("Ping?");
		m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
	}
	
	//Tell the bot to say something
	if(command === "say") {
		const sayMessage = args.join(" ");
		message.delete().catch(O_o=>{}); 
		message.channel.send(sayMessage);
	}
	
	//invite people
	if(command === "invite") {
		message.guild.channels.get('446022598174965784').createInvite()
		.then(invite => message.channel.send(`Invite: ${invite.url}`))
		.catch(error => message.reply(`Unable to generate invite, error: ${error}`))
	}
	
	//rules are rules after all
	if(message.content === "frickin frick") {
		message.reply("not on MY CHRISTIAN SERVER!!!");
		message.guild.fetchMember(message.author)
		.then(async member => {
			if(!member.kickable)
				return message.reply("I'll let you go this time...");
		
			let reason = "Uttering a swear";
			if(!reason) reason = "No reason provided";

			await member.kick(reason)
				.catch(error => message.reply(`Error: ${error}`));
			message.channel.send(`${member.user.tag} was kicked for: ${reason}`);
		});
	}
	
	//Here's the start of all the fun tools
	if(command === "kick") {
		
    if(!message.member.roles.some(r=>["Admin", "Moderator"].includes(r.name)) )
      return message.reply("You can't use this command.");
  
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("That member does not exist.");
    if(!member.kickable) 
      return message.reply("You do not have permission to kick this user.");
  
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
	
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} was kicked by ${message.author.tag} because: ${reason}`);
	}
	
	//For when someone's being a reaaaal problem
	if(command === "ban") {
		
    if(!message.member.roles.some(r=>["Admin", "Moderator"].includes(r.name)) )
      return message.reply("You can't use this command.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("That member does not exist.");
    if(!member.bannable) 
      return message.reply("You do not have permission to ban this user.");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} was banned by ${message.author.tag} because: ${reason}`);
  }
  
  //house keeeeping!
  if(command === "purge") {
	  
    const deleteCount = parseInt(args[0], 10);
    
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    const fetched = await message.channel.fetchMessages({count: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
	}
	
});

client.login(config.token);
