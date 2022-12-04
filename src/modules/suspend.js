const Eris = require("eris");
const threads = require("../data/threads");
const { cancelSuspend } = require("../utils/components");
const threadUtils = require("../utils/threadUtils");
const utils = require("../utils/utils");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "suspend", async (msg, args, thread) => {
    if (! thread) return;
    await thread.suspend();
    utils.postSuccess(thread, "***Thread suspended*** | This thread will act as closed until unsuspended.", cancelSuspend);
  });

  threadUtils.addInboxServerCommand(bot, "unsuspend", async msg => {
    const thread = await threads.findSuspendedThreadByChannelId(msg.channel.id);
    if (! thread) return;

    const otherOpenThread = await threads.findOpenThreadByUserId(thread.user_id);
    if (otherOpenThread) {
      utils.postError(thread, `Cannot unsuspend; there is another open thread with this user: <#${otherOpenThread.channel_id}>`);
      return;
    }

    await thread.unsuspend();
    utils.postSuccess(thread, "***Thread unsuspended***");
  });
};
