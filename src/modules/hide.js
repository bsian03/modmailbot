const Eris = require("eris");
const threads = require("../data/threads");
const threadUtils = require("../utils/threadUtils");
const utils = require("../utils/utils");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "hide", async (msg, args, thread) => {
    if (! utils.isAdmin(msg.member)) return;
    if (! args[0]) return utils.postError(thread, "Please provide a thread ID!", null, msg);

    thread = await threads.findById(args[0]);

    if (! thread) return utils.postError(thread, "Thread not found!", null, msg);

    const suffix = msg.channel.id == thread.channel_id ? "this" : "that";
    const text = `Made ${suffix} thread`;

    if (! thread.isPrivate) {
      thread.makePrivate();
      utils.postSuccess(thread, text + " private!", null, msg);
    } else {
      thread.makePublic();
      utils.postSuccess(thread, text + " public!", null, msg);
    }
  });
};
