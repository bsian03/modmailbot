const Eris = require("eris");
const superagent = require("superagent");
const utils = require("../utils/utils");

const VALIDATE_IMG = /^http(?:s):\/\/([\w@:%.+~#=-]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-\w()@:%+.~#&/=]*)(?:\?([-\w()@:%+.~#&/=]*))?$/;

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  bot.registerCommand("setavatar", async (msg, args) => {
    let url = args[0];
    if (! VALIDATE_IMG.test(url)) return utils.sendError(msg, "Invalid image URL");
    let response;
    try {
      response = await superagent.get(url).accept("image/*").responseType("arraybuffer");
    } catch (error) {
      utils.handleError(error);
      if (error.response) { // Server responded with error
        return utils.sendError(msg, `Server responded with: ${error.status} ${error.message}\n${error.response.text || ""}`);
      } // Something happened with request
      return utils.sendError(msg, "Unable to send request: " + error.message);
    }
    const newav = `data:${response.headers["content-type"]};base64,${response.body.toString("base64")}`;
    return bot.editSelf({ avatar: newav }).then(
      () => utils.sendSuccess(msg, "Successfully changed avatar"),
      (e) => utils.sendError(msg, "Unable to change avatar: " + e)
    );
  }, {
    requirements: { // TODO Check if promisable void
      custom: (msg) => msg.member.roles.some((r) => ["203040224597508096", "523021576128692239"].includes(r))
    }
  });

  bot.registerCommandAlias("setav", "setavatar");
  bot.registerCommandAlias("av", "setavatar");
};
