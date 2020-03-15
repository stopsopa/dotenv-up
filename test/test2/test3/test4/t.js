
// require('../../index')(3, true, 'test.js');

require('../../../../index')({
    override        : false, // don't override existing parameters in process.env by those from .env file
    deep            : 4,
    // startfromlevel  : 3,
}, true, 'sandbox/server.js');

console.log(JSON.stringify(process.env, null, 4));