const threadUtils = require('../threadUtils');
const { inspect } = require('util');

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('eval', async (msg, args, thread) => {
    if (! msg.member.roles.includes('525441307037007902')) return;  
    //msg.channel.createMessage('peeposmug')
    
    let evaled;

    try {
        evaled = await eval(args.join(' ').trim());

        switch (typeof evaled) {
            case 'object':
                evaled = inspect(evaled, {
                    depth: 0
                })
                break;
            default:
        };
        
    } catch (err) {
        return msg.channel.createMessage(err.stack);
    };

    if(typeof evaled === 'string') {
        evaled = evaled.replace(bot.token, 'no');
    };
    if(evaled == undefined) {
        evaled = 'undefined';
    };
    if(evaled.length > 1900) {
        evaled = 'Response too large'
    };

    return msg.channel.createMessage(`\`\`\`js\n${evaled}\`\`\``);
  });
}