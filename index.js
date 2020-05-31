require("dotenv").config();
const Discord = require("discord.js");
let warns = require("./warnings.json");
let rr = require('./reactionRoles.json');
const fs = require('fs');
const ms = require('ms');

const bot = new Discord.Client();

bot.mutedUsers = new Set();

bot.login(process.env.TOKEN);

bot.on('ready', () => {
    console.log('Ready for playing with my friends :)');
});

bot.on('message', async message => {

    if(message.author.bot || !message.content.startsWith(process.env.PREFIX)) return;

    const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();


    if(command === "uptime"){
        const moment = require('moment');
        require('moment-duration-format');
        let uptime = moment.duration(bot.uptime).format('y [years], M [months], w [weeks], d [days], h [hours], m [minutes], s [seconds]');
        message.channel.send("I was online for " + uptime);
    }
    if(command === "ban"){
        if(!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("Sorry, but you don't have permission to ban members.");

        if(!message.guild.me.hasPermission('BAN_MEMBERS')) return message.channel.send("Sorry, but I don't have permission to ban members.");

        let user = args[0];
        if(!user) return message.channel.send("Please, write someone's name to ban!");

        let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.find(m => m.user.username === user) || message.guild.members.cache.get(user));

        if(!member) return message.channel.send("The user was not found!");

        if(member.hasPermission('BAN_MEMBERS')) return message.channel.send("The user have ban perms, cancelling the ban.");

        let memberRole = member.roles.highest.position;

        let botRole = message.guild.me.roles.highest.position;

        if(botRole < memberRole) return message.channel.send("I cannot ban the member due to role hierarchy");

        let reason = args.join(' ').slice(args[0].length + 1);
        if(!reason){
            member.ban({
                reason: "no reason written"
            }).then(() => {
                message.channel.send(`${member.user.username} got banned by ${message.author.username} without a reason.`);
                member.send(`You got banned in **${message.guild.name}** by **${message.author.username}** without a reason.`).catch(err => {});
            });
        }else{
            member.ban({
                reason: reason
            }).then(() => {
                message.channel.send(`${member.user.username} got banned by **${message.author.username}** with a reason: \`${reason}\`.`);
                member.send(`You got banned in **${message.guild.name}** by **${message.author.username}** with a reason: \`${reason}\`.`).catch(err => {});
            });
        }
    }
    if(command === "kick"){
        if(!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('You don\'t have permission to use this command.');

        if(!message.guild.me.hasPermission('KICK_MEMBERS')) return message.channel.send('I don\'t have permission to ban members.');

        let user = args[0];
        if(!user) return message.channel.send("Please write someone's name!");

        let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(user) || message.guild.members.cache.find(m => m.user.username === user));

        if(!member) return message.channel.send('The user was not found.');

        if(member.hasPermission('KICK_MEMBERS')) return message.channel.send('The user have ban perms, cancelling the command.');

        let memberRole = member.roles.highest.position;
        let botRole = message.guild.me.roles.highest.position;

        if(botRole < memberRole) return message.channel.send("I cannot kick the member due to role hierarchy");

        let reason = args.join(' ').slice(args[0].length + 1);

        if(!reason){
            member.kick("no reason written").then(() => {
                message.channel.send(`${member.user.username} got kicked by **${message.author.username}** without a reason.`);
                member.send(`You got kicked from **${message.guild.name}** by **${message.author.username}** without a reason.`).catch(err => {});
            });
        }else{
            member.kick(reason).then(() => {
                message.channel.send(`${member.user.username} got kicked by **${message.author.username}** with a reason: \`${reason}\`.`);
                member.send(`You got kicked from **${message.guild.name}** by **${message.author.username}** with a reason: \`${reason}\`.`).catch(err => {});
            });
        }
    }
    if(command === "warn"){
        if(!message.member.hasPermission(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_GUILD'])) return message.channel.send('You can\'t warn users!.');

        if(!message.guild.me.hasPermission(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_GUILD'])) return message.channel.send('I can\'t warn users!');

        let user = args[0];
        if(!user) return message.channel.send('Please write someone\'s name!');

        let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(user) || message.guild.members.cache.find(m => m.user.username === user));

        if(!member) return message.channel.send('The user was not found.');

        if(member.hasPermission(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_GUILD'])) return message.channel.send('The user is a moderator, cancelling the command.');

        let memberRole = member.roles.highest.position;
        let botRole = message.guild.me.roles.highest.position;

        if(botRole < memberRole) return message.channel.send("I cannot warn the member due to role hierarchy");

        if(!warns[member.user.username]){
            warns[member.user.username] = 1;
            fs.writeFileSync('./warnings.json', JSON.stringify(warns), err => {});
        }else{
            warns[member.user.username] = warns[member.user.username] + 1;
            fs.writeFileSync('./warnings.json', JSON.stringify(warns), err => {});
        }
        if(warns[member.user.username] === 1){
            message.channel.send(`${member.user.username} got warned by **${message.author.username}**. This is his first warning! Be careful.`);
            member.send(`You got warned in **${message.guild.name}** by **${message.author.username}**. This is your first warning! Be careful.`).catch(err => {});
        }else if(warns[member.user.username] === 2){
            message.channel.send(`${member.user.username} got warned by **${message.author.username}**. This is his second warning! Be careful.`);
            member.send(`You got warned in **${message.guild.name}** by **${message.author.username}**. This is your second warning! Be careful.`).catch(err => {});
        }else if(warns[member.user.username] === 3){
            message.channel.send(`${member.user.username} got warned by **${message.author.username}**. This is his third warning! Be careful.`);
            member.send(`You got warned in **${message.guild.name}** by **${message.author.username}**. This is your third warning! Be careful.`).catch(err => {});
        }else if(warns[member.user.username] === 4){
            message.channel.send(`${member.user.username} got warned by **${message.author.username}**. This is his fourth warning! Be careful.`);
            member.send(`You got warned in **${message.guild.name}** by **${message.author.username}**. This is your fourth warning! Be careful.`).catch(err => {});
        }else if(warns[member.user.username] === 5){
            message.channel.send(`${member.user.username} got warned by **${message.author.username}**. This is his fifth warning! Be careful.`);
            member.send(`You got warned in **${message.guild.name}** by **${message.author.username}**. This is your fifth warning! Be careful.`).catch(err => {});
        }else if(warns[member.user.username] === 6){
            message.channel.send(`${member.user.username} got warned by **${message.author.username}**. This is his sixth warning! Be careful.`);
            member.send(`You got warned in **${message.guild.name}** by **${message.author.username}**. This is your sixth warning! Be careful.`).catch(err => {});
        }else if(warns[member.user.username] === 7){
            member.kick("got 7 warnings!").then(() => {
                message.channel.send(`${member.user.username} got kicked because had 7 warnings!`);
                member.send(`You got kicked in **${message.guild.name}** because you got 7 warnings.`).catch(err => {});
            });
        }
    }
    if(command === "clear" || command === "purge" || command === "delete"){
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('You can\'t delete messages!');

        if(!message.guild.me.hasPermission('MANAGE_MESSAGES')) return message.channel.send('I can\'t clear messages!');

        if(!args[0]) return message.channel.send('Please write the amount of messages.');

        if(isNaN(args[0])) return message.channel.send('Please, the amount need to be a number');

        await message.channel.messages.fetch({ limit: args[0] }).then(messages => { // Fetches the messages
            message.channel.bulkDelete(messages); // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
            message.channel.send(`I have deleted \`${messages.size}\` messages!`);
        });
    }
    if(command === "reactionrole"){
        if(!message.member.hasPermission('ADMINISTRATOR')) return;

        if(!args[0]) return message.channel.send("Please write a channel id.");

        if(isNaN(args[0])) return message.channel.send("The id need to be number.");

        let channel = message.guild.channels.cache.find(c => c.id === args[0]);
        if(!channel) return message.channel.send("The channel doesn't exist.");

        channel.send({
            embed: {
                title: "Verify",
                color: "ORANGE",
                footer: {
                    text: "React to get verify role",
                    iconURL: message.guild.iconURL()
                },
                description: "After you will react to the emoji, you will be verified to see other channels.",
                timestamp: new Date()
            }
        }).then(msg => {
            msg.react("🍕");
            rr[message.guild.id] = {
                [msg.id]: true
            };
            fs.writeFileSync('./reactionRoles.json', JSON.stringify(rr), err => {});
        });
    }
    if(command === "mute"){
        if(!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.send("Sorry, but you don't have permission to mute members.");

        if(!message.guild.me.hasPermission('MUTE_MEMBERS')) return message.channel.send("Sorry, but I don't have permission to mute members.");

        let user = args[0];
        if(!user) return message.channel.send("Please, write someone's name to ban!");

        let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.find(m => m.user.username === user) || message.guild.members.cache.get(user));

        if(!member) return message.channel.send("The user was not found!");

        if(member.hasPermission('MUTE_MEMBERS')) return message.channel.send("The user have mute perms, cancelling the mute.");

        let memberRole = member.roles.highest.position;

        let botRole = message.guild.me.roles.highest.position;

        if(botRole < memberRole) return message.channel.send("I cannot mute the member due to role hierarchy");

        let muteRole = message.guild.roles.cache.find(r => r.name === "Muted");

        if (!muteRole) {
            try {
              muteRole = await message.guild.roles.create({
                name: "Muted",
                color: "GREY",
                permissions: []
              })
              message.guild.channels.cache.forEach(async(channel, id) => {
                channel.overwritePermission(muteRole, {
                  SEND_MESSAGES: false,
                  ADD_REACTIONS: false,
                  SEND_TTS_MESSAGES: false,
                  ATTACH_FILES: false,
                  SPEAK: false
                });
              });
            } catch (e) {
              console.log(e);
            }
          }
        if(bot.mutedUsers.has(member.user.id)){
            return message.channel.send('The user is already muted!');
        }

        let reason = args.join(' ').slice(args[0].length + 1);
        if(!reason){
            member.roles.add(muteRole).then(() => {
                bot.mutedUsers.add(member.user.id);
                message.channel.send(`${member.user.username} got muted without a reason!`);
                member.send(`You got muted in **${message.guild.name}** by **${message.author.username}** without a reason`);
            });
        }else{
            member.roles.add(muteRole).then(() => {
                bot.mutedUsers.add(member.user.id);
                message.channel.send(`${member.user.username} got muted without a reason!`);
                member.send(`You got muted in **${message.guild.name}** by **${message.author.username}** without a reason`);
            });
        }
    }
    if(command === "unmute"){
        if(!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.send("Sorry, but you don't have permission to mute members.");

        if(!message.guild.me.hasPermission('MUTE_MEMBERS')) return message.channel.send("Sorry, but I don't have permission to mute members.");

        let user = args[0];
        if(!user) return message.channel.send("Please, write someone's name to ban!");

        let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.find(m => m.user.username === user) || message.guild.members.cache.get(user));

        if(!member) return message.channel.send("The user was not found!");

        if(member.hasPermission('MUTE_MEMBERS')) return message.channel.send("The user have mute perms, cancelling the mute.");

        let memberRole = member.roles.highest.position;

        let botRole = message.guild.me.roles.highest.position;

        if(botRole < memberRole) return message.channel.send("I cannot mute the member due to role hierarchy");

        let muteRole = message.guild.roles.cache.find(r => r.name === "Muted");

        if (!muteRole) {
            try {
              muteRole = await message.guild.roles.create({
                name: "Muted",
                color: "GREY",
                permissions: []
              })
              message.guild.channels.cache.forEach(async(channel, id) => {
                channel.overwritePermission(muteRole, {
                  SEND_MESSAGES: false,
                  ADD_REACTIONS: false,
                  SEND_TTS_MESSAGES: false,
                  ATTACH_FILES: false,
                  SPEAK: false
                });
              });
            } catch (e) {
              console.log(e);
            }
          }

        if(!bot.mutedUsers.has(member.user.id)){
            return message.channel.send("The user is already unmuted!");
        }

        let reason = args.join(' ').slice(args[0].length + 1);
        if(!reason){
            member.roles.remove(muteRole).then(() => {
                bot.mutedUsers.delete(member.user.id);
                message.channel.send(`${member.user.username} got unmuted without a reason!`);
                member.send(`You got unmuted in **${message.guild.name}** by **${message.author.username}** without a reason.`);
            });
        }else{
            member.roles.remove(muteRole).then(() => {
                bot.mutedUsers.delete(member.user.id);
                message.channel.send(`${member.user.username} got unmuted with a reason: \`${reason}\`!`);
                member.send(`You got unmuted in **${message.guild.name}** by **${message.author.username}** with a reason: \`${reason}\``);
            });
        }
    }
    if(command === "tempmute"){
        if(!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.send("Sorry, but you don't have permission to mute members.");

        if(!message.guild.me.hasPermission('MUTE_MEMBERS')) return message.channel.send("Sorry, but I don't have permission to mute members.");

        let user = args[0];
        if(!user) return message.channel.send("Please, write someone's name to ban!");
        let time = args[1];
        if(!time) return message.channel.send('Please write the time.');

        let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.find(m => m.user.username === user) || message.guild.members.cache.get(user));

        if(!member) return message.channel.send("The user was not found!");

        if(member.hasPermission('MUTE_MEMBERS')) return message.channel.send("The user have mute perms, cancelling the mute.");

        let memberRole = member.roles.highest.position;

        let botRole = message.guild.me.roles.highest.position;

        if(botRole < memberRole) return message.channel.send("I cannot mute the member due to role hierarchy");

        let muteRole = message.guild.roles.cache.find(r => r.name === "Muted");

        if (!muteRole) {
            try {
              muteRole = await message.guild.roles.create({
                name: "Muted",
                color: "GREY",
                permissions: []
              })
              message.guild.channels.cache.forEach(async(channel, id) => {
                channel.overwritePermissions(muteRole, {
                  SEND_MESSAGES: false,
                  ADD_REACTIONS: false,
                  SEND_TTS_MESSAGES: false,
                  ATTACH_FILES: false,
                  SPEAK: false
                });
              });
            } catch (e) {
              console.log(e);
            }
          }

        if(bot.mutedUsers.has(member.user.id)){
            return message.channel.send("The user is already muted!");
        }

        let reason = args.join(' ').slice(args[0].length + args[1].length + 1);

        setTimeout(() => {
            member.roles.remove(muteRole);
        }, ms(time));
        if(!reason){
            member.roles.add(muteRole).then(() => {
                bot.mutedUsers.add(member.user.id);
                message.channel.send(`${member.user.username} got temporary muted with a reason: \`${reason}\`!`);
                member.send(`You got temporary muted in **${message.guild.name}** by **${message.author.username}** with a reason: \`${reason}\``);
            });
        }else{
            member.roles.add(muteRole).then(() => {
                bot.mutedUsers.add(member.user.id);
                message.channel.send(`${member.user.username} got temporary muted with a reason: \`${reason}\`!`);
                member.send(`You got temporary muted in **${message.guild.name}** by **${message.author.username}** with a reason: \`${reason}\``);
            });
        }
    }

});

bot.on('guildMemberRemove', async member => {
    if(warns[member.user.username] === 7){
        delete warns[member.user.username];
        fs.writeFileSync('./warnings.json', JSON.stringify(warns), err => {});
    }
    let goodbyeChannel = member.guild.channels.cache.find(c => c.id === "715184165296930909");
    if(!goodbyeChannel) return;
    goodbyeChannel.send(`**${member.user.tag}** just left the server have fun in ur dreams :smiling_imp:`);
});

bot.on('guildMemberAdd', async member => {
    
    let welcomeChannel = member.guild.channels.cache.find(c => c.id === "715184165296930909");
    if(!welcomeChannel) return;
    welcomeChannel.send(`Hey **${member}**, welcome to **Snipez Lounge**!`);
});

bot.on('messageReactionAdd', async (reaction, user) => {
    let msg = await reaction.message.fetch();
    if(rr[msg.guild.id][msg.id] === true){
        let role = msg.guild.roles.cache.find(role => role.id === "715172576951009410");
        let member = msg.guild.members.cache.find(member => member.id === user.id);
        member.roles.add(role);
    }
});