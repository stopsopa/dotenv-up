const { fileURLToPath } = require("url");

function fix(line) {
  if (/file:\/\/\//.test(line)) {
    return fileURLToPath(String(line));
  }
  return line;
}

global.__stack ||
  Object.defineProperty(global, "__stack", {
    get: function tmp() {
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function (_, stack) {
        return stack;
      };
      var err = new Error();
      Error.captureStackTrace(err, tmp);
      // Error.captureStackTrace(err, arguments.callee); // without 'use strict'
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    },
  });

global.__line = (function () {
  function rpad(s, n) {
    typeof n === "undefined" && (n = 5);

    try {
      if (s && s.length && s.length >= n) {
        return s;
      }
    } catch (e) {
      console.log("exception", typeof s, s, e);
    }

    return String(s + " ".repeat(n)).slice(0, n);
  }

  var tool = function (n) {
    if (typeof n === "undefined") {
      let tmp = [];

      for (let i in __stack) {
        if (__stack.hasOwnProperty(i)) {
          // tmp.push('stack: ' + rpad(i) + ' file:' + __stack[i].getFileName() + ':' + rpad(__stack[i].getLineNumber()) + ' ');
          tmp.push(fix(__stack[i].getFileName()));
        }
      }

      return tmp;
    }

    typeof n === "undefined" && (n = 1);

    if (!__stack[n]) {
      return `${n} not in stack: ` + tool(n - 1);
    }

    const file = fix(__stack[n].getFileName());

    if (file === null) {
      return "corrected:" + tool(n - 1);
    }

    return (
      new Date().toISOString().substring(0, 19).replace("T", " ") + " " + file + ":" + rpad(__stack[n].getLineNumber())
    );
  };

  return tool;
})();

module.exports = __line;
