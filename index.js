
const pa        = require('path');

const fs        = require('fs');

const _stack    = require('./stack');

// const dotenv    = require('dotenv');

// const log       = console.log;

function th(msg) {
    return new Error(`dotenv-up error: ${msg}`);
}

function log (message /*: string */, addnewline = false) {
    // console.log(`[dotenv][DEBUG] ${message}`)
    process.stdout.write((addnewline ? "\n": '') + `[dotenv][DEBUG] ${message}\n`)
}

/**
 * https://github.com/motdotla/dotenv/blob/master/lib/main.js
 *
 * Modified version with flag 'override'
 */
const dotenv = (function () {

    function trim(s) {
        return (s || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/,'$1');
    }

    const tool = {};

    var ranges = list => {

        // const log = console.log;

        let start = false;

        let ranges = [];

        let last = false;

        list.forEach(l => {

            if (last === false) {

                start = last = l;

                // log('start: ', l)
            }
            else {

                if ( (last + 1) === l) {

                    // log('+1 equal (current: '+l+'): ', last, 'equal: ', (last + 1), l);

                    last = l;
                }
                else {

                    // log('+1 NOT equal (current: '+l+') start: ', start, 'last: ', last);

                    ranges.push([start, last]);

                    last = start = l;
                }
            }
        });

        if (start) {

            ranges.push([start, last]);
        }

        return ranges.map(x => {

            if (x[0] === x[1]) {

                return x[0];
            }
            else {

                return x.join('-');
            }
        })
    }

// Parses src into an Object
    function parse (src /*: string | Buffer */, options /*: ?DotenvParseOptions */) /*: DotenvParseOutput */ {
        const debug = Boolean(options && options.debug)
        const obj = {}

        const notMatched    = [];

        const commented     = [];

        // convert Buffers before splitting into lines and processing
        src.toString().split('\n').forEach(function (line, idx) {
            // matching "KEY' and 'VAL' in 'KEY=VAL'

            // https://stackoverflow.com/a/2821201/5560682
            const keyValueArr = line.match(/^\s*([a-zA-Z_]+[a-zA-Z0-9_]*)\s*=\s*(.*)?\s*$/i)
            // matched?
            if (keyValueArr != null) {
                const key = keyValueArr[1]

                // default undefined or missing values to empty string
                let value = keyValueArr[2] || ''

                // expand newlines in quoted values
                const len = value ? value.length : 0;

                if (len > 0) {

                    if (
                        (value.charAt(0) === '"' && value.charAt(len - 1) === '"') ||
                        (value.charAt(0) === "'" && value.charAt(len - 1) === "'")
                    ) {

                        value = value.substring(1, len - 1)

                        value = value.replace(/\\n/gm, '\n')
                    }
                }

                obj[key] = value
            }
            else {

                const t = trim(line);

                if ((t || '')[0] === '#' || t.length === 0) {

                    commented.push(idx + 1);
                }
                else {

                    notMatched.push([idx + 1, line]);
                }
                // log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
            }
        });

        if (debug && commented.length) {

            log(`Commented or empty lines: ` + ranges(commented).join(', '));
        }

        if (notMatched.length) {

            throw th(`Lines with invalid syntax: \n` + notMatched.map(x => {
                return x.join(': >') + '<';
            }).join("\n"));
        }

        return obj
    }

    // Populates process.env from .env file
    function config (options /*: ?DotenvConfigOptions */) /*: DotenvConfigOutput */ {
        let dotenvPath = pa.resolve(process.cwd(), '.env')
        let encoding /*: string */ = 'utf8'
        let debug = false

        if (options) {
            if (options.path != null) {
                dotenvPath = options.path
            }
            if (options.encoding != null) {
                encoding = options.encoding
            }
            if (options.debug != null) {
                debug = true
            }
        }

        try {
            // specifying an encoding returns a string instead of a buffer
            const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug })

            Object.keys(parsed).forEach(function (key) {

                if (process.env.hasOwnProperty(key)) {

                    // if (dotenv.override) {
                    if (options.override) {

                        process.env[key] = parsed[key];

                        debug && log(`"${key}" with value "${parsed[key]}" was OVERWRITTEN in \`process.env\``)

                    } else {

                        debug && log(`"${key}" is already defined in \`process.env\` and will NOT be OVERWRITTEN (to force use flag 'override = true')`)
                    }
                }
                else {

                    process.env[key] = parsed[key];

                    debug && log(`"${key}" with value "${parsed[key]}" in \`process.env\` was created`);
                }

            })

            return { parsed }
        } catch (e) {
            throw th(`[dotenv][DEBUG] error, parsing file '${dotenvPath}', label '${options.name}', error: ` + (e + ''));
        }
    }

    tool.config     = config;
    tool.load       = config;
    tool.parse      = parse;

    return tool;
}());




/**
 * Use like
 *     require('dotenv-up')(2); // 2 - default assigned to 'deep' parameter
 *     require('dotenv-up')(2, false);
 *     require('dotenv-up')(2, false, 'name of load');
 *     require('dotenv-up')({
            path        = process.cwd(),
            envfile     = '.env',
            override    = true, // override values in process.env
            deep        = 1,
            ... other dotenv options https://www.npmjs.com/package/dotenv
 *     });
 *
 * @param opt
 * @param debug (def: true)
 * @param name
 * @returns {} - object with all extracted variables
 */
module.exports = (opt = {}, debug = true, name) => {

    if (typeof opt === 'number') {

        opt = {
            deep: opt,
        };
    }

    // console.log('_stack()', _stack())

    let {
        path            = pa.dirname(_stack()[2]),
        envfile         = '.env',
        override        = true,
        deep            = 1,
        startfromlevel  = 0,
        ...rest
    } = opt;

    if (name) {

        debug && log(`dotenv-up [${deep}]: '${name}'`, true);
    }

    if ( ! Number.isInteger(startfromlevel) || startfromlevel < 0 ) {

        throw th(`startfromlevel should be integer >= 0 but it is: ${startfromlevel}`);
    }

    if ( ! Number.isInteger(deep) || deep < 0 ) {

        throw th(`deep should be integer >= 0 but it is: ${deep}`);
    }

    if ( ! (deep > startfromlevel) ) {

        throw th(`deep(${deep}) should be bigger than startfromlevel(${startfromlevel})`);
    }

    if (debug === false) {

        delete rest.debug;
    }
    else {

        rest.debug = true;
    }

    let p = path;

    const stack = [];

    while (startfromlevel < deep) {

        let pp = p;

        for (let k = 0 ; k < startfromlevel ; k += 1 ) {

            pp = pa.dirname(pp);
        }

        pp = pa.resolve(pp, envfile);

        const found = fs.existsSync(pp);

        if (rest.debug === true) {

            log(`dotenv-up: path '${pp}' found: ` + (found ? 'true' : 'false'));
        }

        stack.push(pp);

        if (found) {

            return dotenv.load({
                ...rest,
                path: pp,
                name,
                override,
            }).parsed
        }

        startfromlevel += 1;
    }

    throw th(`'${name}': didn't found '${envfile}' under any of those paths: ` + JSON.stringify(stack, null, 4));
}