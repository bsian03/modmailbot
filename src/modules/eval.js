const threadUtils = require('../threadUtils');
const { inspect } = require('util');
const config = require('../config');
const utils = require('../utils');
const superagent = require('superagent');

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('eval', async (msg, args, thread) => {
    if (! msg.member.roles.includes('525441307037007902')) return;  
    //msg.channel.createMessage('peeposmug')
    
    const evalMessage = msg.content.slice(config.prefix.length).trim().split(' ').slice(1);
    let evalString = evalMessage.join(' ').trim();
    let evaled;
    let depth = 0;

    if (args[0] && args[0].startsWith('-d')) {
      depth = Number(args[0].replace('-d', ''));
      if (! depth || depth < 0) depth = 0;
      const index = evalMessage.findIndex((v) => v.startsWith('-d')) + 1;
      evalString = evalMessage.slice(index).join(' ').trim();
    }
    if (args[0] === '-a') {
      const index = evalMessage.findIndex((v) => v === '-a') + 1;
      evalString = `(async () => { ${evalMessage.slice(index).join(' ').trim()} })()`;
    }

    try {
      evaled = await eval(evalString);
      if (typeof evaled !== 'string') {
        evaled = inspect(evaled, { depth });
      }
      if (evaled === undefined) {
        evaled = 'undefined';
      }
    } catch (error) {
      evaled = error.stack;
    }

    evaled = evaled.replace(new RegExp(config.token, 'gi'), 'no');

    const display = utils.splitString(evaled, 1975);
    if (display[5]) {
      try {
        const { data } = await superagent.post('https://snippets.cloud.libraryofcode.org/documents').send(display.join(''));
        return msg.channel.createMessage(`Your evaluation evaled can be found on https://snippets.cloud.libraryofcode.org/${data.key}`);
      } catch (error) {
        return msg.channel.createMessage(`ERROR: ${error}`);
      }
    }

    return display.forEach((m) => msg.channel.createMessage(`\`\`\`js\n${m}\n\`\`\``));
  });
}