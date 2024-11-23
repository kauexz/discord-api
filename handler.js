import { pathToFileURL } from "url";
import "colors";
import fs from "fs";
import path from "path";

const getDirname = (metaUrl) => {
 const __filename = new URL(metaUrl).pathname;
 const platformAdjustedFilename = process.platform === "win32" ? __filename.substring(1) : __filename;
 return path.dirname(platformAdjustedFilename);
};

async function registerRoutes(app) {
 const __dirname = getDirname(import.meta.url);

 const routesPath = path.join(decodeURI(__dirname), "routes");
 const routesFiles = fs.readdirSync(routesPath);

 console.clear();
 console.log("[🏹 API Routes]".bgYellow, `${routesFiles.length} Loaded Routes`.yellow);

 for (const file of routesFiles) {
  const routeFilePath = path.join(routesPath, file);
  const routeFileURL = pathToFileURL(routeFilePath).href;
  const routeModule = await import(routeFileURL);
  const method = routeModule.method;
  const name = routeModule.name;
  const execute = routeModule.execute;
  app[method](name, execute);
 }

 app.use((req, res) => {
  res.status(404).json({ status: 404, message: "Rota inválida." });
 });
}

export default registerRoutes;