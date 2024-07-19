const Eris = require("eris");
const config = require("../config");
const utils = require("../utils/utils");
const snippets = require("../data/snippets");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {

  /**
   * @returns {Promise<void>}
   */
  async function disableModmail() {
    await snippets.del("isDisabled");
    return await snippets.add("isDisabled", "disabled", true, bot.user.id);
  }

  /**
   * @returns {Promise<void>}
   */
  async function enableModmail() {
    await snippets.del("isDisabled");
    return await snippets.add("isDisabled", "enabled", true, bot.user.id);
  }

  bot.registerCommand("modmail", async (msg, args) => {
    if (! utils.isAdmin(msg.member) && ! msg.member.roles.includes("987377218927861760")) return;
    const snippet = await snippets.get("isDisabled");
    if (! snippet) await snippets.add("isDisabled", "enabled", true, bot.user.id);
    if (! args[0]) return utils.sendInfo(msg, `Modmail is currently: ${snippet.body}`);
    const toggle = args[0].toLowerCase();

    if (toggle === "enable") {
      try {
        await enableModmail();
        bot.editStatus("online", {
          name: "customname",
          state: "📬" + config.status ?? "DM me to contact staff!",
          type: 4
        });
        return utils.sendSuccess(msg, "Enabled Modmail");
      } catch (err) {
        return utils.sendError(msg, err.message);
      }
    } else if (toggle === "disable") {
      try {
        await disableModmail();
        bot.editStatus("dnd", {
          name: "customname",
          state: "📪Currently Unavailable",
          type: 4
        });
        return utils.sendSuccess(msg, "Disabled Modmail\n  *I will notify users attempting to message me using the \"disabled\" snippet.*");
      } catch (err) {
        return utils.sendError(msg, err.message);
      }
    }
    else {
      return utils.sendError(msg, "Allowed options are `enable` or `disable`");
    }
  }, {
    requirements: {
      custom: (msg) => msg.member.roles.some((r) => ["203040224597508096", "987377218927861760", "523021576128692239"].includes(r)) // limited to Council, Senior Moderators or Developers
    }
  });
  bot.registerCommandAlias("ignoremodmail", "modmail");
};
