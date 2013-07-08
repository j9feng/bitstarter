#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    var content="";
    if(fs.existsSync(htmlfile)){

            content = fs.readFileSync(htmlfile);

    }
    return cheerio.load(content);

};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};
var buildfn = function(checksfile) {
//    console.log(checksfile);
    var response2console = function(result) {
        if (result instanceof Error) {
            console.error('Error: ');
        } else {
//	    console.log(result);
	    $ = cheerio.load(result);
	    var checks = loadChecks(checksfile).sort();
	    var out = {};
	    for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
		}
	    var outJson = JSON.stringify(out, null, 4);
	    console.log(outJson);
        }
    };
    return response2console;
};


if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html')
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('--url <url>', 'url to a webpage')
        .parse(process.argv);
    var fileOrUrl=program.file;
    if(program.file) {
        fileOrUrl = program.url;
        var checkJson = checkHtmlFile(fileOrUrl, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    }else{
	handleUrl = buildfn(program.checks);
        restler.get(program.url).on('complete', handleUrl);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

