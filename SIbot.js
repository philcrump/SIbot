console.log("SIBot v0.2");
console.log("Loading...");

var config = {
        channels: ["#highaltitude"],
        server: "chat.freenode.net",
        botName: "theRealSIbot"
};

var irc = require("irc");
var bot = new irc.Client(config.server, config.botName, { channels: config.channels });

bot.addListener('message', function (from, to, message) {
    // remove color codes from the message
    message = message.replace(/[\x02\x1F\x0F\x16]|\x03(\d\d?(,\d\d?)?)?/g,'');
    
    // List of parser functions
    // (more than one conversion can be output per input message)
    
    feet_parse(message, to); // ft / feet
    pounds_parse(message, to); // lb / lbs
    //fahrenheit_parse(message, to); // Fahrenheit
});

function feet_parse(message, to) {
    ft_regex="[0-9]*[,]?[0-9]+[ ]*f[e]{0,2}t";
    if(message.search(ft_regex) != -1) {
        console.log(new Date()+": Detected feet at "+message.search(ft_regex));
        sillyNum=message.substr(message.search(ft_regex),12).match("[0-9]*[,]?[0-9]+");
        realNum=parseFloat(String(sillyNum).replace(",",""))*0.3048;
        console.log(" - Got Number as "+sillyNum);
        if(realNum<10) {
            outStr="In real units: "+sillyNum+" ft = "+realNum.toFixed(2)+" m";
        } else if(realNum>15000) {
            outStr="In real units: "+sillyNum+" ft = "+(Math.round(realNum/100)/10) +" km";
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
        realNum=parseFloat(String(sillyNum).replace(",",""))*0.453592;
        console.log(" - Got Number as "+sillyNum);
        if(realNum<1) {
            outStr="In real units: "+sillyNum+" lbs = "+Math.round(realNum*1000)+" g";
        } else {
            outStr="In real units: "+sillyNum+" lbs = "+realNum.toFixed(1)+" kg";
        }
        bot.say(to, outStr);
    }
}

function fahrenheit_parse(message, to) {
    df_regex="[0-9]*[,]?[.]?[0-9]+([ ]|[°])+F[\W]+";
    if(message.search(df_regex) != -1) {
        console.log(new Date()+": Detected fahrenheit at "+message.search(df_regex));
        sillyNum=message.substr(message.search(df_regex),12).match("[0-9]*[,]?[.]?[0-9]+");
        realNum=(parseFloat(String(sillyNum).replace(",",""))-32)*(5/9);
        console.log(" - Got Number as "+sillyNum);
        outStr="In real units: "+sillyNum+" °F = "+realNum.toFixed(1)+" °C";
        bot.say(to, outStr);
    }
}


console.log("Loaded.");
