const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "app.log");

const log = (message) => {
  const time = new Date().toISOString();
  fs.appendFileSync(logFile, `[${time}] ${message}\n`);
};

module.exports = log;