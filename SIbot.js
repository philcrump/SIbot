var exec = require('child_process').exec;
var irc = require("irc");

console.log("SIBot v0.3");
console.log("Loading...");

var config = {
        channels: ["#highaltitude"],
        server: "chat.freenode.net",
        botName: "SIbot"
};

var units_to_SI = {};

// length
units_to_SI['thou']				= 'mm';
units_to_SI['inches']			= 'mm';
units_to_SI['inch']				= 'mm';
units_to_SI['in']				= 'mm';
units_to_SI['"']				= 'mm';
units_to_SI['foot']				= 'metre';
units_to_SI['feet']				= 'metre';
units_to_SI['ft']				= 'metre';
units_to_SI['\'']				= 'metre';
units_to_SI['yards']			= 'metre';
units_to_SI['yard']				= 'metre';
units_to_SI['yd']				= 'metre';
units_to_SI['chains']			= 'metre';
units_to_SI['chain']			= 'metre';
units_to_SI['ch']				= 'metre';
units_to_SI['furlongs']			= 'metre';
units_to_SI['furlong']			= 'metre';
units_to_SI['fur']				= 'metre';
units_to_SI['miles']			= 'kilometre';
units_to_SI['mile']				= 'kilometre';
units_to_SI['mi']				= 'kilometre';
units_to_SI['leagues']			= 'kilometre';
units_to_SI['league']			= 'kilometre';
units_to_SI['lea']				= 'kilometre';
units_to_SI['fathoms']			= 'metre';
units_to_SI['fathom']			= 'metre';
units_to_SI['ftm']				= 'metre';
units_to_SI['cables']			= 'metre';
units_to_SI['cable']			= 'metre';
units_to_SI['nautical mile']	= 'kilometre';
units_to_SI['links']			= 'metre';
units_to_SI['link']				= 'metre';
units_to_SI['rods']				= 'metre';
units_to_SI['rod']				= 'metre';
units_to_SI['furlogs']			= 'metre';
units_to_SI['furlog']			= 'metre';
units_to_SI['ly']		    	= 'metre';

// time
units_to_SI['fortnights']		= 'week';
units_to_SI['fortnight']		= 'week';

// volume
units_to_SI['fluid ounce']      = 'ml';
units_to_SI['fl oz']            = 'ml';
units_to_SI['floz']             = 'ml';
units_to_SI['gills']            = 'ml';
units_to_SI['gill']             = 'ml';
units_to_SI['gi']               = 'ml';
units_to_SI['pints']            = 'ml';
units_to_SI['pint']             = 'ml';
units_to_SI['pt']               = 'ml';
units_to_SI['quarts']           = 'ml';
units_to_SI['quart']            = 'ml';
units_to_SI['qt']               = 'ml';
units_to_SI['gallons']          = 'ml';
units_to_SI['gallon']           = 'ml';
units_to_SI['gal']              = 'ml';

// mass & weight

units_to_SI['grains']           = 'gram';
units_to_SI['grain']            = 'gram';
units_to_SI['gr']               = 'gram';
units_to_SI['drams']            = 'gram';
units_to_SI['dram']             = 'gram';
units_to_SI['dr']               = 'gram';
units_to_SI['ounces']           = 'gram';
units_to_SI['ounce']            = 'gram';
units_to_SI['oz']               = 'gram';
units_to_SI['pounds']           = 'kg';
units_to_SI['pound']            = 'kg';
units_to_SI['lb']               = 'kg';
units_to_SI['stones']           = 'kg';
units_to_SI['stone']            = 'kg';
units_to_SI['st']               = 'kg';
units_to_SI['quarters']         = 'kg';
units_to_SI['quarter']          = 'kg';
units_to_SI['qr']               = 'kg';
units_to_SI['hundredweight']    = 'kg';
units_to_SI['cwt']              = 'kg';
units_to_SI['tons']             = 'kg';
units_to_SI['ton']              = 'kg';
units_to_SI['firkins']          = 'kg';
units_to_SI['firkin']           = 'kg';
units_to_SI['fir']              = 'kg';


var baseRegex = '([0-9,]+(\\.[0-9]+)?) ?(({UNITS})( ?/ ?([a-z]+))?)';
var rudeRegex = new RegExp(baseRegex.replace(/\{UNITS\}/g, Object.keys(units_to_SI).join("|")), 'gi');

function escapeShellArg(arg) {
    return "'" + arg.replace(/\'/g, "'\\''") + "'";
}

var bot = new irc.Client(config.server, config.botName, { channels: config.channels, debug: true});

var response_step =  function (from, to, message, step) {
    if(to[0] != '#') return;
    step = (typeof step != 'number') ? 0 : step;

    // if we are doing a 5th conversion, just point a finger at the guy
    if(step >= 3) {
        bot.say(to, "good god man!");
        return;
    }

    // test the message to see if we can be rude to this person
    var result = rudeRegex.exec(message);

    if(result == null) return;

    // reset string start index
    rudeRegex.lastIndex = 0

    // lets prepare to be rude with maximum percision
    if(step == 0) {
        console.log(to, '<' + from + '>', message);
        logged = true;
    }


    // deny the pleasure of clever people typing nonsense
    var inputVal = result[1].replace(/,/g,'');
    if(inputVal.length == 0 || isNaN(parseFloat(inputVal)) || parseFloat(inputVal) <= 0) return;

    var input = result[0].replace(/,/g,'');
    var unit = result[4].toLowerCase();

    // convert ' " shorthand into a word
    if(unit == '"') input = input.replace('"','inch');
    if(unit == "'") input = input.replace("'",'foot');

    var output = units_to_SI[unit];
    var per = null;

    // handle m/s etc
    if(result[6] != undefined) {
        per = units_to_SI[result[6].toLowerCase()];
        if(per == undefined) per = result[6];
        output += "/" + per;
    }

    // remove the already matched silly unit from the message, so we don't repeat ourself
    while(message.indexOf(result[0]) > -1) message = message.replace(result[0],'xxx');

    // conversion is done via `units` program
    var cmd = 'units ' + escapeShellArg(input) + ' ' + escapeShellArg(output);

    exec(cmd, function(error, stdout, stderr) {
        var lines = stdout.split("\n");

        // if we encounter error, make a record and don't respond
        if(lines.length < 2 || lines[0].indexOf("error") > -1) {
            console.error("[ERROR] Input: " + message);
            console.error("[ERROR] Unable to convert. See output of `units`:");
            console.error(stdout);
        }
        else {
            // pluralize the output unit in certain sutations
            var valueStr = (lines[0].indexOf("*") > -1) ? lines[0] : lines[1];
            valueStr = valueStr.trim().replace(/^\* /,'');

            if(parseFloat(valueStr) >= 2 && per == null && output.length > 2) output += 's';

            // finally be rude by responding
            var msg = [ "In real units:",
                        input,
                        "=",
                        valueStr,
                        output
                      ].join(" ");

            console.log(to, '<' + config.botName + '>', msg);
            bot.say(to, msg);
        }

        response_step(from, to, message, ++step);
    });
}

bot.addListener('message', response_step);

console.log("Loaded.");
