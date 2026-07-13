import { initBotId } from "botid/client/core";

// Protect the submission endpoint: requests made without the BotID client
// challenge (curl, plain scripts) fail checkBotId() server-side.
initBotId({
  protect: [{ path: "/api/submit", method: "POST" }],
});
