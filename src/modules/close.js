const humanizeDuration = require('humanize-duration');
const moment = require('moment');
const Eris = require('eris');
const config = require('../config');
const threadUtils = require('../threadUtils');
const utils = require("../utils");
const threads = require("../data/threads");

module.exports = (bot, sse) => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);
  const humanizeDelay = (delay, opts = {}) => humanizeDuration(delay, Object.assign({conjunction: ' and '}, opts));

  // Check for threads that are scheduled to be closed and close them
  async function applyScheduledCloses() {
    const threadsToBeClosed = await threads.getThreadsThatShouldBeClosed();
    for (const thread of threadsToBeClosed) {
      await thread.close(null, false, sse);

      const logUrl = await thread.getLogUrl();
      utils.postLog(utils.trimAll(`
        Modmail thread with ${thread.user_name} (${thread.user_id}) was closed as scheduled by ${thread.scheduled_close_name}
        Logs: <${logUrl}>
      `));
    }
  }

  async function scheduledCloseLoop() {
    try {
      await applyScheduledCloses();
    } catch (e) {
      console.error(e);
    }

    setTimeout(scheduledCloseLoop, 2000);
  }

  scheduledCloseLoop();

  // Close a thread. Closing a thread saves a log of the channel's contents and then deletes the channel.
  addInboxServerCommand('close', async (msg, args, thread) => {
    if (! thread) return;

    // Timed close
    if (args.length) {
      if (args[0] === 'cancel') {
        // Cancel timed close
        if (thread.scheduled_close_at) {
          await thread.cancelScheduledClose();
          thread.postSystemMessage(`Cancelled scheduled closing`);
        }

        return;
      }

      // Set a timed close
      const delay = utils.convertDelayStringToMS(args.join(' '));
      if (delay === 0 || delay === null) {
        thread.postSystemMessage(`Invalid delay specified. Format: "1h30m"`);
        return;
      }

      const closeAt = moment.utc().add(delay, 'ms');
      await thread.scheduleClose(closeAt.format('YYYY-MM-DD HH:mm:ss'), msg.author);
      thread.postSystemMessage(`Thread is now scheduled to be closed in ${humanizeDelay(delay)}. Use \`${config.prefix}close cancel\` to cancel.`);

      return;
    }

    // Regular close
    await thread.close(msg.author, false, sse);

    const logUrl = await thread.getLogUrl();
    utils.postLog(utils.trimAll(`
      Modmail thread with ${thread.user_name} (${thread.user_id}) was closed by ${msg.author.username}#${msg.author.discriminator}
      Logs: <${logUrl}>
    `));
  });

  // Auto-close threads if their channel is deleted
  bot.on('channelDelete', async (channel) => {
    if (! (channel instanceof Eris.TextChannel)) return;
    if (channel.guild.id !== utils.getInboxGuild().id) return;
    const thread = await threads.findOpenThreadByChannelId(channel.id);
    if (! thread) return;

    console.log(`[INFO] Auto-closing thread with ${thread.user_name} because the channel was deleted`);
    let auditLogs = await channel.guild.getAuditLogs(50, null, 12);
    let entry = auditLogs.entries.find(e => e.targetID === channel.id);
    await thread.close(entry ? entry.user : null, true, sse);

    const logUrl = await thread.getLogUrl();
    utils.postLog(utils.trimAll(`
      Modmail thread with ${thread.user_name} (${thread.user_id}) was closed automatically because the channel was deleted
      Logs: ${logUrl}
    `));
  });
};
