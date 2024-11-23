import { Client, GatewayIntentBits, Partials } from "discord.js";
import "colors";
import cors from "cors";
import express from "express";
import requestIp from "request-ip";
import { config } from "dotenv";
import registerRoutes from "./handler.js";

const client = new Client({
 intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
 partials: [Partials.User, Partials.GuildMember],
});

const app = express();

app.use(requestIp.mw());
app.use(cors({ origin: "*", methods: ["GET"] }));

config();
registerRoutes(app);

app.listen(80, () => {
 console.log("[📡 EXPRESS SERVER]".bgMagenta, "Online: Port 80".magenta);
 client.login(process.env?.bot_token).then(() => {
   console.log("[🤖 DISCORD BOT]".bgCyan, `Connected: ${client.user.tag}`.cyan);
  }).catch(console.error);
});

export { client };

process.on("unhandledRejection", (r) => {
 console.error(r);
});
process.on("uncaughtException", (e) => {
 console.error(e);
});
process.on("uncaughtExceptionMonitor", (e) => {
 console.error(e);
});