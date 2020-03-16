
// require('../../index')(3, true, 'test.js');

const dotenv = require('../../../../index');

const first = dotenv({
    override        : false, // don't override existing parameters in process.env by those from .env file
    deep            : 4,
    // startfromlevel  : 3,
    // justreturn: true
}, true, 'first')

const second = dotenv({
    override        : false, // don't override existing parameters in process.env by those from .env file
    deep            : 5,
    startfromlevel  : 4,
    // justreturn: true
}, true, 'second')

console.log(JSON.stringify({
    first,
    second,
    'process.env': process.env
}, null, 4));