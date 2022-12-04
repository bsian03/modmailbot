const Eris = require("eris");
const threadUtils = require("../utils/threadUtils");
const utils = require("../utils/utils");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "role", async (msg, args, thread) => {
    if (! thread) return;
    if (! args[0] || ! utils.isAdmin(msg.member)) {
      const currentRole = thread.getMainRole(msg.member, msg.channel.parentID);
      return utils.postInfo(thread, `Your current role for this thread is **${currentRole.name}**!`, null, msg);
    }

    const hasOverride = thread.getStaffRoleOverride(msg.member.id);

    if (args[0].toLowerCase() == "reset") {
      if (! hasOverride) {
        return utils.postError(thread, "You haven't got a custom role in this thread.", null, msg);
      }

      await thread.deleteStaffRoleOverride(msg.member.id);
      return utils.postSuccess(thread, "Your role in this thread has been reset to default.", null, msg);
    }

    const search = args.join(" ").toLowerCase();
    const role = msg.channel.guild.roles.find(r => r.id == search || r.name.toLowerCase().startsWith(search));

    if (! role) return utils.postError(thread, "Please provide a role name or ID!", null, msg);
    if (! hasOverride) {
      await thread.setStaffRoleOverride(msg.member.id, role.id);
      return utils.postSuccess(thread, `Your role in this thread will now appear as **${role.name}**.`, null, msg);
    } else {
      await thread.deleteStaffRoleOverride(msg.member.id);
      return utils.postSuccess(thread, "Your role in this thread has been reset to default.", null, msg);
    }
  });
};
