console.log("SIBot v0.1");
console.log("Loading...");

var config = {
        channels: ["#sibot-test"],
        server: "chat.freenode.net",
        botName: "SIbot"
};

var irc = require("irc");
var bot = new irc.Client(config.server, config.botName, { channels: config.channels });

bot.addListener('message', function (from, to, message) {
    // List of parser functions
    // (more than one conversion can be output per input message)
    
    feet_parse(message, to); // ft / feet
    pounds_parse(message, to); // lb / lbs
});

function feet_parse(message, to) {
    ft_regex="[0-9]*[,]?[0-9]+[ ]*f[e]{0,2}t";
    if(message.search(ft_regex) != -1) {
        console.log(new Date()+": Detected feet at "+message.search(ft_regex));
        sillyNum=message.substr(message.search(ft_regex),12).match("[0-9]*[,]?[0-9]+");
        realNum=parseInt(String(sillyNum).replace(",",""))*0.3048;
        console.log(" - Got Number as "+sillyNum);
        if(realNum<10) {
            outStr="In real units: "+sillyNum+" ft = "+realNum.toFixed(2)+" m";
        } else if(realNum>5000) {
            outStr="In real units: "+sillyNum+" ft = "+Math.round(realNum/1000)+" km";
        } else {
            outStr="In real units: "+sillyNum+" ft = "+Math.round(realNum)+" m";
        }
        bot.say(to, outStr);
    }
}

function pounds_parse(message, to) {
    lb_regex="[0-9]*[,]?[.]?[0-9]+[ ]*lb";
    if(message.search(lb_regex) != -1) {
        console.log(new Date()+": Detected pounds at "+message.search(lb_regex));
        sillyNum=message.substr(message.search(lb_regex),12).match("[0-9]*[,]?[.]?[0-9]+");
        realNum=parseInt(String(sillyNum).replace(",",""))*0.453592;
        console.log(" - Got Number as "+sillyNum);
        if(realNum<1) {
            outStr="In real units: "+sillyNum+" lbs = "+Math.round(realNum*1000)+" g";
        } else {
            outStr="In real units: "+sillyNum+" lbs = "+realNum.toFixed(1)+" kg";
        }
        bot.say(to, outStr);
    }
}


console.log("Loaded.");
