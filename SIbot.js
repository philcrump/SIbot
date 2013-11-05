console.log("SIBot v0.1");
console.log("Loading...");

var config = {
        channels: ["#sibot-test"],
        server: "chat.freenode.net",
        botName: "SIbot"
};

var irc = require("irc");
var bot = new irc.Client(config.server, config.botName, {
        channels: config.channels
});

client.addListener('message', function (from, to, message) {
    if(message.search("/([0-9]+)\s?f[e]{0,2}t\s/") != -1) { // ft/feet
        console.log("Detected feet at "+message.search("/([0-9]+)\s?f[e]{0,2}t/");
        sillyNum=message.substr(message.search("/([0-9]+)\s?f[e]{0,2}t/"),12).match("/([0-9]+)/");
        realNum=parseInt(sillynum)*0.3048;
        console.log(" - Got Number as "+sillyNum);
        bot.say(config.channels[0], "In real units: "+sillyNum+"ft = ");
    }
});

console.log("Loaded.");
