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

bot.addListener('message', function (from, to, message) {

    ft_regex="[0-9]+[ ]*f[e]{0,2}t";
    if(message.search(ft_regex) != -1) { // ft/feet
        console.log("Detected feet at "+message.search(ft_regex));
        sillyNum=message.substr(message.search(ft_regex),12).match("[0-9]+");
        realNum=parseInt(sillyNum)*0.3048;
        console.log(" - Got Number as "+sillyNum);
        bot.say(config.channels[0], "In real units: "+sillyNum+"ft = "+realNum.toFixed(2)+"m");
    }
});

console.log("Loaded.");
