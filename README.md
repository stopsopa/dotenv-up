[![npm version](https://badge.fury.io/js/dotenv-up.svg)](https://badge.fury.io/js/dotenv-up)
[![NpmLicense](https://img.shields.io/npm/l/dotenv-up.svg)](https://github.com/stopsopa/dotenv-up/blob/master/LICENSE)

# Reference

    yarn add @stopsopa/dotenv-up
    
    require('@stopsopa/dotenv-up')(3, true, 'sandbox/server.js');
    
    /**
     * Use like
     *     require('@stopsopa/dotenv-up')(2); // 2 - default assigned to 'deep' parameter
     *     require('@stopsopa/dotenv-up')(2, false);
     *     require('@stopsopa/dotenv-up')(2, false, 'name of load');
     *     require('@stopsopa/dotenv-up')({
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
     
# Tip

If you need to include other file that use internally again dotenv-up tool in override mode but you don't want those changes of process.env affect proce.env in you'r scope, do:

    const ttt = {...process.env};
    require('./lib/lib.js') // with its own require('@stopsopa/dotenv-up')(1);
    process.env = ttt;     