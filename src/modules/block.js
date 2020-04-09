const threadUtils = require('../threadUtils');
const blocked = require("../data/blocked");
const config = require('../config');
const utils = require("../utils");

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('block', async (msg, args, thread) => {
    async function block(userId) {
      const user = bot.users.get(userId);
      await blocked.block(userId, (user ? `${user.username}#${user.discriminator}` : ''), msg.author.id);
      msg.channel.createMessage(`Blocked <@${userId}> (id ${userId}) from modmail`);
    }

    let logText = `**Blocked: ** ${thread.user_name} (${thread.user_id}) was blocked.`;

    if (! thread && args.length > 0) {
      // User mention/id as argument
      const userId = utils.getUserMention(args.join(' '));
      if (! userId) return;

      const reason = args.slice(1).join(' ').trim();

      if (reason && reason.length) {
        logText = `**Blocked: ** ${thread.user_name} (${thread.user_id}) was blocked for ${reason}`;
      }

      utils.postLog(logText);

      block(userId);
    } else if (thread) {
      const reason = args.join(' ').trim();
      let isAnonymous = false;

      if (config.replyAnonDefault === true) {
        isAnonymous = true;
      }

      let text = `You have been blocked.`;

      if (reason && reason.length) {
        text = `You have been blocked for ${reason}`;
        logText = `**Blocked: ** ${thread.user_name} (${thread.user_id}) was blocked for ${reason}`;
      }

      if (msg.attachments.length) await attachments.saveAttachmentsInMessage(msg);
      await thread.replyToUser(msg.member, text, msg.attachments, isAnonymous);

      utils.postLog(logText);

      // Calling !block without args in a modmail thread blocks the user of that thread
      block(thread.user_id);
    }
  });

  addInboxServerCommand('unblock', (msg, args, thread) => {
    async function unblock(userId) {
      await blocked.unblock(userId);
      msg.channel.createMessage(`Unblocked <@${userId}> (id ${userId}) from modmail`);
    }

    let logText = `**Unblocked: ** ${thread.user_name} (${thread.user_id}) was unblocked.`;

    if (! thread && args.length > 0) {
      // User mention/id as argument
      const userId = utils.getUserMention(args.join(' '));
      if (! userId) return;

      const reason = args.slice(1).join(' ').trim();

      if (reason && reason.length) {
        logText = `**Unblocked: ** ${thread.user_name} (${thread.user_id}) was unblocked for ${reason}`;
      }

      utils.postLog(logText);

      unblock(userId);
    } else if (thread) {
      const reason = args.join(' ').trim();

      if (reason && reason.length) {
        logText = `**Unblocked: ** ${thread.user_name} (${thread.user_id}) was unblocked for ${reason}`;
      }

      utils.postLog(logText);

      // Calling !unblock without args in a modmail thread unblocks the user of that thread
      unblock(thread.user_id);
    }
  });
};
