'use strict';

var require$$0$3 = require('path');
var require$$0$1 = require('assert');
var require$$2 = require('events');
var require$$3$1 = require('child_process');
var require$$0 = require('stream');
var require$$1 = require('string_decoder');
var require$$0$2 = require('tty');
var require$$1$1 = require('util');
var require$$3 = require('fs');
var require$$4 = require('net');
var require$$7 = require('os');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var through$1 = {exports: {}};

(function (module, exports) {
	var Stream = require$$0;

	// through
	//
	// a stream that does nothing but re-emit the input.
	// useful for aggregating a series of changing but not ending streams into one stream)

	module.exports = through;
	through.through = through;

	//create a readable writable stream.

	function through (write, end, opts) {
	  write = write || function (data) { this.queue(data); };
	  end = end || function () { this.queue(null); };

	  var ended = false, destroyed = false, buffer = [], _ended = false;
	  var stream = new Stream();
	  stream.readable = stream.writable = true;
	  stream.paused = false;

	//  stream.autoPause   = !(opts && opts.autoPause   === false)
	  stream.autoDestroy = !(opts && opts.autoDestroy === false);

	  stream.write = function (data) {
	    write.call(this, data);
	    return !stream.paused
	  };

	  function drain() {
	    while(buffer.length && !stream.paused) {
	      var data = buffer.shift();
	      if(null === data)
	        return stream.emit('end')
	      else
	        stream.emit('data', data);
	    }
	  }

	  stream.queue = stream.push = function (data) {
	//    console.error(ended)
	    if(_ended) return stream
	    if(data === null) _ended = true;
	    buffer.push(data);
	    drain();
	    return stream
	  };

	  //this will be registered as the first 'end' listener
	  //must call destroy next tick, to make sure we're after any
	  //stream piped from here.
	  //this is only a problem if end is not emitted synchronously.
	  //a nicer way to do this is to make sure this is the last listener for 'end'

	  stream.on('end', function () {
	    stream.readable = false;
	    if(!stream.writable && stream.autoDestroy)
	      process.nextTick(function () {
	        stream.destroy();
	      });
	  });

	  function _end () {
	    stream.writable = false;
	    end.call(stream);
	    if(!stream.readable && stream.autoDestroy)
	      stream.destroy();
	  }

	  stream.end = function (data) {
	    if(ended) return
	    ended = true;
	    if(arguments.length) stream.write(data);
	    _end(); // will emit or queue
	    return stream
	  };

	  stream.destroy = function () {
	    if(destroyed) return
	    destroyed = true;
	    ended = true;
	    buffer.length = 0;
	    stream.writable = stream.readable = false;
	    stream.emit('close');
	    return stream
	  };

	  stream.pause = function () {
	    if(stream.paused) return
	    stream.paused = true;
	    return stream
	  };

	  stream.resume = function () {
	    if(stream.paused) {
	      stream.paused = false;
	      stream.emit('resume');
	    }
	    drain();
	    //may have become paused again,
	    //as drain emits 'data'.
	    if(!stream.paused)
	      stream.emit('drain');
	    return stream
	  };
	  return stream
	} 
} (through$1));

var throughExports = through$1.exports;

//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'


var through = throughExports;
var Decoder = require$$1.StringDecoder;

var split_1 = split$1;

//TODO pass in a function to map across the lines.

function split$1 (matcher, mapper, options) {
  var decoder = new Decoder();
  var soFar = '';
  var maxLength = options && options.maxLength;
  var trailing = options && options.trailing === false ? false : true;
  if('function' === typeof matcher)
    mapper = matcher, matcher = null;
  if (!matcher)
    matcher = /\r?\n/;

  function emit(stream, piece) {
    if(mapper) {
      try {
        piece = mapper(piece);
      }
      catch (err) {
        return stream.emit('error', err)
      }
      if('undefined' !== typeof piece)
        stream.queue(piece);
    }
    else
      stream.queue(piece);
  }

  function next (stream, buffer) {
    var pieces = ((soFar != null ? soFar : '') + buffer).split(matcher);
    soFar = pieces.pop();

    if (maxLength && soFar.length > maxLength)
      return stream.emit('error', new Error('maximum buffer reached'))

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      emit(stream, piece);
    }
  }

  return through(function (b) {
    next(this, decoder.write(b));
  },
  function () {
    if(decoder.end)
      next(this, decoder.end());
    if(trailing && soFar != null)
      emit(this, soFar);
    this.queue(null);
  })
}

/*  Copyright (c) 2014, Torbjörn Lager
    All rights reserved.
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:
    1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
    FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
    COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
    INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
    BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
    LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
    ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
*/

const assert$2 = require$$0$1;

const dec2unicode = (i) => {
    if (i >= 0 && i <= 15) {
        return "\\u000" + i.toString(16);
    } else if (i >= 16 && i <= 255) {
        return "\\u00" + i.toString(16);
    } else if (i >= 256  && i <= 4095) {
        return "\\u0" + i.toString(16);
    } else if (i >= 4096 && i <= 65535) {
        return "\\u" + i.toString(16);
    }
};

var serialize_string = (s, q) => {
    assert$2.equal(typeof s, 'string');
    assert$2.equal(typeof q, 'string');
    let result = q;
    for (let i = 0; i < s.length; i++) {
        let c = s.charAt(i);
        if (c >= ' ') {
            if (c == '\\') {
                result += "\\\\";
            } else if (c == q) {
                result += "\\" + q;
            } else {
                result += c;
            }        } else {
            if (c == '\n') {
                result += "\\n";
            } else if (c == '\r') {
                result += "\\r";
            } else if (c == '\t') {
                result += "\\t";
            } else if (c == '\b') {
                result += "\\b";
            } else if (c == '\f') {
                result += "\\f";
            } else {
                result += dec2unicode(c.charCodeAt(0));
            }
        }
    }
    return result + q;
};

const assert$1 = require$$0$1;
const serializeString = serialize_string;

const QUOTE = "'";

// Helper to convert term object into
// a string representation.

const serialize = (term) => {
    if (typeof term.toProlog === 'function') {
        return term.toProlog();
    } else if (typeof term === 'string') {
        return serializeString(term, QUOTE);
    } else if (typeof term === 'number') {
        return term.toString();
    } else if (typeof term === 'undefined') {
        return 'undefined';
    } else if (term === null) {
        return 'null';
    } else {
        throw new Error(`Invalid term: ${term}`);
    }
};

// Helpers to construct and escape query values.

class List {

    constructor(items) {
        assert$1.ok(Array.isArray(items),
            'List items must be an array.');
        this.items = items;
    }

    toProlog() {
        return '[' + this.items.map(serialize).join(',') + ']';
    }
}
class Variable {

    constructor(name) {
        assert$1.equal(typeof name, 'string',
            'Compound name must be a string.');
        assert$1.ok(name.match(/^[A-Z_][A-Za-z0-9]*$/),
            'Variable name must match the pattern ^[A-Z_][A-Za-z0-9]*$.');
        this.name = name;
    }

    toProlog() {
        return this.name;
    }
}
class Compound {

    constructor(name, args) {
        assert$1.equal(typeof name, 'string',
            'Compound name must be a string.');
        assert$1.ok(Array.isArray(args),
            'Compound arguments must be an array.');
        this.name = name;
        this.args = args;
    }

    toProlog() {
        return serializeString(this.name, QUOTE) + '(' + this.args.map(serialize).join(',') + ')';
    }
}
class Dict {

    constructor(tag, content) {
        assert$1.ok(typeof tag === 'string' || tag instanceof Variable,
            'Dict tag must be a string or a variable.');
        assert$1.ok(typeof content === 'object' && content !== null,
            'Dict content must be an object.');
        this.tag = tag;
        this.content = content;
    }

    toProlog() {
        const entries = Object.keys(this.content).map((key) => {
            return serializeString(key, QUOTE) + ':' + serialize(this.content[key]);
        });
        return serialize(this.tag) + '{' + entries.join(',') + '}';
    }
}

const list = (items) => {
    return new List(items);
};

const variable = (name) => {
    return new Variable(name);
};

const compound = (name, args) => {
    return new Compound(name, args);
};

const dict = (tag, content) => {
    return new Dict(tag, content);
};

var term$1 = {
    list,
    variable,
    compound,
    dict,
    serialize
};

var src = {exports: {}};

var browser = {exports: {}};

var debug$1 = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (ms >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (ms >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (ms >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  return plural(ms, d, 'day') ||
	    plural(ms, h, 'hour') ||
	    plural(ms, m, 'minute') ||
	    plural(ms, s, 'second') ||
	    ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) {
	    return;
	  }
	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name;
	  }
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}
	return ms;
}

var hasRequiredDebug;

function requireDebug () {
	if (hasRequiredDebug) return debug$1.exports;
	hasRequiredDebug = 1;
	(function (module, exports) {
		/**
		 * This is the common logic for both the Node.js and web browser
		 * implementations of `debug()`.
		 *
		 * Expose `debug()` as the module.
		 */

		exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
		exports.coerce = coerce;
		exports.disable = disable;
		exports.enable = enable;
		exports.enabled = enabled;
		exports.humanize = requireMs();

		/**
		 * The currently active debug mode names, and names to skip.
		 */

		exports.names = [];
		exports.skips = [];

		/**
		 * Map of special "%n" handling functions, for the debug "format" argument.
		 *
		 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		 */

		exports.formatters = {};

		/**
		 * Previous log timestamp.
		 */

		var prevTime;

		/**
		 * Select a color.
		 * @param {String} namespace
		 * @return {Number}
		 * @api private
		 */

		function selectColor(namespace) {
		  var hash = 0, i;

		  for (i in namespace) {
		    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
		    hash |= 0; // Convert to 32bit integer
		  }

		  return exports.colors[Math.abs(hash) % exports.colors.length];
		}

		/**
		 * Create a debugger with the given `namespace`.
		 *
		 * @param {String} namespace
		 * @return {Function}
		 * @api public
		 */

		function createDebug(namespace) {

		  function debug() {
		    // disabled?
		    if (!debug.enabled) return;

		    var self = debug;

		    // set `diff` timestamp
		    var curr = +new Date();
		    var ms = curr - (prevTime || curr);
		    self.diff = ms;
		    self.prev = prevTime;
		    self.curr = curr;
		    prevTime = curr;

		    // turn the `arguments` into a proper Array
		    var args = new Array(arguments.length);
		    for (var i = 0; i < args.length; i++) {
		      args[i] = arguments[i];
		    }

		    args[0] = exports.coerce(args[0]);

		    if ('string' !== typeof args[0]) {
		      // anything else let's inspect with %O
		      args.unshift('%O');
		    }

		    // apply any `formatters` transformations
		    var index = 0;
		    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
		      // if we encounter an escaped % then don't increase the array index
		      if (match === '%%') return match;
		      index++;
		      var formatter = exports.formatters[format];
		      if ('function' === typeof formatter) {
		        var val = args[index];
		        match = formatter.call(self, val);

		        // now we need to remove `args[index]` since it's inlined in the `format`
		        args.splice(index, 1);
		        index--;
		      }
		      return match;
		    });

		    // apply env-specific formatting (colors, etc.)
		    exports.formatArgs.call(self, args);

		    var logFn = debug.log || exports.log || console.log.bind(console);
		    logFn.apply(self, args);
		  }

		  debug.namespace = namespace;
		  debug.enabled = exports.enabled(namespace);
		  debug.useColors = exports.useColors();
		  debug.color = selectColor(namespace);

		  // env-specific initialization logic for debug instances
		  if ('function' === typeof exports.init) {
		    exports.init(debug);
		  }

		  return debug;
		}

		/**
		 * Enables a debug mode by namespaces. This can include modes
		 * separated by a colon and wildcards.
		 *
		 * @param {String} namespaces
		 * @api public
		 */

		function enable(namespaces) {
		  exports.save(namespaces);

		  exports.names = [];
		  exports.skips = [];

		  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		  var len = split.length;

		  for (var i = 0; i < len; i++) {
		    if (!split[i]) continue; // ignore empty strings
		    namespaces = split[i].replace(/\*/g, '.*?');
		    if (namespaces[0] === '-') {
		      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
		    } else {
		      exports.names.push(new RegExp('^' + namespaces + '$'));
		    }
		  }
		}

		/**
		 * Disable debug output.
		 *
		 * @api public
		 */

		function disable() {
		  exports.enable('');
		}

		/**
		 * Returns true if the given mode name is enabled, false otherwise.
		 *
		 * @param {String} name
		 * @return {Boolean}
		 * @api public
		 */

		function enabled(name) {
		  var i, len;
		  for (i = 0, len = exports.skips.length; i < len; i++) {
		    if (exports.skips[i].test(name)) {
		      return false;
		    }
		  }
		  for (i = 0, len = exports.names.length; i < len; i++) {
		    if (exports.names[i].test(name)) {
		      return true;
		    }
		  }
		  return false;
		}

		/**
		 * Coerce `val`.
		 *
		 * @param {Mixed} val
		 * @return {Mixed}
		 * @api private
		 */

		function coerce(val) {
		  if (val instanceof Error) return val.stack || val.message;
		  return val;
		} 
	} (debug$1, debug$1.exports));
	return debug$1.exports;
}

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		exports = module.exports = requireDebug();
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = 'undefined' != typeof chrome
		               && 'undefined' != typeof chrome.storage
		                  ? chrome.storage.local
		                  : localstorage();

		/**
		 * Colors.
		 */

		exports.colors = [
		  'lightseagreen',
		  'forestgreen',
		  'goldenrod',
		  'dodgerblue',
		  'darkorchid',
		  'crimson'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		function useColors() {
		  // NB: In an Electron preload script, document will be defined but not fully
		  // initialized. Since we know we're in Chrome, we'll just detect this case
		  // explicitly
		  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
		    return true;
		  }

		  // is webkit? http://stackoverflow.com/a/16459606/376773
		  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		    // is firebug? http://stackoverflow.com/a/398120/376773
		    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		    // is firefox >= v31?
		    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		    // double check webkit in userAgent just in case we are in a worker
		    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		exports.formatters.j = function(v) {
		  try {
		    return JSON.stringify(v);
		  } catch (err) {
		    return '[UnexpectedJSONParseError]: ' + err.message;
		  }
		};


		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
		  var useColors = this.useColors;

		  args[0] = (useColors ? '%c' : '')
		    + this.namespace
		    + (useColors ? ' %c' : ' ')
		    + args[0]
		    + (useColors ? '%c ' : ' ')
		    + '+' + exports.humanize(this.diff);

		  if (!useColors) return;

		  var c = 'color: ' + this.color;
		  args.splice(1, 0, c, 'color: inherit');

		  // the final "%c" is somewhat tricky, because there could be other
		  // arguments passed either before or after the %c, so we need to
		  // figure out the correct index to insert the CSS into
		  var index = 0;
		  var lastC = 0;
		  args[0].replace(/%[a-zA-Z%]/g, function(match) {
		    if ('%%' === match) return;
		    index++;
		    if ('%c' === match) {
		      // we only are interested in the *last* %c
		      // (the user may have provided their own)
		      lastC = index;
		    }
		  });

		  args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.log()` when available.
		 * No-op when `console.log` is not a "function".
		 *
		 * @api public
		 */

		function log() {
		  // this hackery is required for IE8/9, where
		  // the `console.log` function doesn't have 'apply'
		  return 'object' === typeof console
		    && console.log
		    && Function.prototype.apply.call(console.log, console, arguments);
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */

		function save(namespaces) {
		  try {
		    if (null == namespaces) {
		      exports.storage.removeItem('debug');
		    } else {
		      exports.storage.debug = namespaces;
		    }
		  } catch(e) {}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
		  var r;
		  try {
		    r = exports.storage.debug;
		  } catch(e) {}

		  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		  if (!r && typeof process !== 'undefined' && 'env' in process) {
		    r = process.env.DEBUG;
		  }

		  return r;
		}

		/**
		 * Enable namespaces listed in `localStorage.debug` initially.
		 */

		exports.enable(load());

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
		  try {
		    return window.localStorage;
		  } catch (e) {}
		} 
	} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		var tty = require$$0$2;
		var util = require$$1$1;

		/**
		 * This is the Node.js implementation of `debug()`.
		 *
		 * Expose `debug()` as the module.
		 */

		exports = module.exports = requireDebug();
		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(function (key) {
		  return /^debug_/i.test(key);
		}).reduce(function (obj, key) {
		  // camel-case
		  var prop = key
		    .substring(6)
		    .toLowerCase()
		    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

		  // coerce string value into JS value
		  var val = process.env[key];
		  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		  else if (val === 'null') val = null;
		  else val = Number(val);

		  obj[prop] = val;
		  return obj;
		}, {});

		/**
		 * The file descriptor to write the `debug()` calls to.
		 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
		 *
		 *   $ DEBUG_FD=3 node script.js 3>debug.log
		 */

		var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

		if (1 !== fd && 2 !== fd) {
		  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
		}

		var stream = 1 === fd ? process.stdout :
		             2 === fd ? process.stderr :
		             createWritableStdioStream(fd);

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
		  return 'colors' in exports.inspectOpts
		    ? Boolean(exports.inspectOpts.colors)
		    : tty.isatty(fd);
		}

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		exports.formatters.o = function(v) {
		  this.inspectOpts.colors = this.useColors;
		  return util.inspect(v, this.inspectOpts)
		    .split('\n').map(function(str) {
		      return str.trim()
		    }).join(' ');
		};

		/**
		 * Map %o to `util.inspect()`, allowing multiple lines if needed.
		 */

		exports.formatters.O = function(v) {
		  this.inspectOpts.colors = this.useColors;
		  return util.inspect(v, this.inspectOpts);
		};

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
		  var name = this.namespace;
		  var useColors = this.useColors;

		  if (useColors) {
		    var c = this.color;
		    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

		    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
		  } else {
		    args[0] = new Date().toUTCString()
		      + ' ' + name + ' ' + args[0];
		  }
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to `stream`.
		 */

		function log() {
		  return stream.write(util.format.apply(util, arguments) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */

		function save(namespaces) {
		  if (null == namespaces) {
		    // If you set a process.env field to null or undefined, it gets cast to the
		    // string 'null' or 'undefined'. Just delete instead.
		    delete process.env.DEBUG;
		  } else {
		    process.env.DEBUG = namespaces;
		  }
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
		  return process.env.DEBUG;
		}

		/**
		 * Copied from `node/src/node.js`.
		 *
		 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
		 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
		 */

		function createWritableStdioStream (fd) {
		  var stream;
		  var tty_wrap = process.binding('tty_wrap');

		  // Note stream._type is used for test-module-load-list.js

		  switch (tty_wrap.guessHandleType(fd)) {
		    case 'TTY':
		      stream = new tty.WriteStream(fd);
		      stream._type = 'tty';

		      // Hack to have stream not keep the event loop alive.
		      // See https://github.com/joyent/node/issues/1726
		      if (stream._handle && stream._handle.unref) {
		        stream._handle.unref();
		      }
		      break;

		    case 'FILE':
		      var fs = require$$3;
		      stream = new fs.SyncWriteStream(fd, { autoClose: false });
		      stream._type = 'fs';
		      break;

		    case 'PIPE':
		    case 'TCP':
		      var net = require$$4;
		      stream = new net.Socket({
		        fd: fd,
		        readable: false,
		        writable: true
		      });

		      // FIXME Should probably have an option in net.Socket to create a
		      // stream from an existing fd which is writable only. But for now
		      // we'll just add this hack and set the `readable` member to false.
		      // Test: ./node test/fixtures/echo.js < /etc/passwd
		      stream.readable = false;
		      stream.read = null;
		      stream._type = 'pipe';

		      // FIXME Hack to have stream not keep the event loop alive.
		      // See https://github.com/joyent/node/issues/1726
		      if (stream._handle && stream._handle.unref) {
		        stream._handle.unref();
		      }
		      break;

		    default:
		      // Probably an error on in uv_guess_handle()
		      throw new Error('Implement me. Unknown stream file type!');
		  }

		  // For supporting legacy API we put the FD here.
		  stream.fd = fd;

		  stream._isStdio = true;

		  return stream;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init (debug) {
		  debug.inspectOpts = {};

		  var keys = Object.keys(exports.inspectOpts);
		  for (var i = 0; i < keys.length; i++) {
		    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
		  }
		}

		/**
		 * Enable namespaces listed in `process.env.DEBUG` initially.
		 */

		exports.enable(load()); 
	} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}

var srcExports = src.exports;

const path = require$$0$3;
const assert = require$$0$1;
const { EventEmitter } = require$$2;
const spawn = require$$3$1.spawn;
const split = split_1;
const term = term$1;
const debug = srcExports('swipl');
const os = require$$7;

// Helper class to track the engine state and
// detect error conditions.

class EngineState extends EventEmitter {

    constructor() {
        super();
        this.setState(EngineState.ACCEPTING);
    }

    isClosed() { return this.state === EngineState.CLOSED; }
    isAccepting() { return this.state === EngineState.ACCEPTING; }
    isQuery() { return this.state === EngineState.QUERY; }

    setAccepting() { this.setState(EngineState.ACCEPTING); }
    setClosed() { this.setState(EngineState.CLOSED); }
    setQuery() { this.setState(EngineState.QUERY); }
    setWaiting() { this.setState(EngineState.WAITING); }

    setState(state) {
        this.state = state;
        debug(`Engine state set to ${state}.`);
        this.emit('change', state);
    }
}

EngineState.ACCEPTING = 'accepting'; // Accepting new queries.
EngineState.QUERY = 'query'; // Has a fresh query instance.
EngineState.WAITING = 'waiting'; // Waiting output from Prolog.
EngineState.CLOSED = 'closed'; // Engine is closed.

// Query waiting for another query to finish.

class QueuedQuery {
    constructor(string, deferred) {
        this.string = string;
        this.deferred = deferred;
    }
}

// Prolog engine. Representing one external
// SWI-Prolog process.

class Engine {
    constructor(swiplPath = 'swipl', homePath = undefined) {
        let top;
        // If we run inside a vercel/pkg package (like with ad4m-host)
        // all our files got packed and re-routed to vercel's snapshot
        // filesystem.
        // The problem with that is that the swipl binary doesn't have access
        // to /snapshot, so we need to get access to top.pl some other way.
        // ad4m-host copies over top.pl to the swipl home directory.
        // (https://github.com/perspect3vism/ad4m-host/pull/29/files)
        // To have swipl work in other (dev-cycle) uses we need to
        // check if we are in a vercel/pkg snapshot filesystem like so:
        if(__dirname.startsWith("/snapshot") || __dirname.startsWith('C:\\snapshot'))
            top = path.join(homePath, 'top.pl');
        else
            top = path.join(__dirname, 'top.pl');
        
        let params = [
            '-f', top,
            '--no-tty',
            '-q',
            '-t', 'loop',
            '--nodebug',
            '-O',
        ];
        if(homePath) {
            params.push(`--home=${homePath}`);
        }
        this.swipl = spawn(swiplPath, params, {cwd: path.dirname(swiplPath)});
        this.state = new EngineState();
        this.status = 0;
        this.query = null;
        this.queue = [];
        this.swipl.on('close', (code) => {
            this.status = code;
            this.state.setClosed();
        });
        this.state.on('change', () => {     
            if (this.state.isAccepting()) {                
                // If there was queued query then
                // start working on it.
                const queued = this.queue.shift();
                if (queued) {
                    debug('Working on a queued query.');
                    this.query = new Query(this, queued.string);
                    this.state.setQuery();
                    queued.deferred.resolve(this.query);
                }
            }
        });
        this.swipl.stdout.pipe(split()).on('data', (line) => {
            line = line.trim();
            if (line.length === 0) {
                // Last line, empty, do nothing.
                return;
            }
            debug(`Received from Prolog: ${line}.`);
            if (this.state.isClosed()) {
                // Engine is closed. Do nothing.
                return;
            }
            try {
                const obj = JSON.parse(line);       
                if (this.query) {
                    // Pass the response to the query instance.
                    // It will apply changes to the engine state
                    // as well.
                    this.query._response(obj);
                }                
            } catch (err) {
                // Received invalid output from Prolog.
                this.state.setClosed();
                if (this.query && this.query.deferred) {
                    this.query.deferred.reject(err);
                }
                // Reject all queued queries as well.
                for (const queued of this.queue) {
                    queued.reject(new Error('The engine was closed: ' + err));
                }
            }
        });
        // Stderr of SWI-Prolog is just redirected
        // to the main stderr.
        this.swipl.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    }

    // Creates a new Query instance on this engine.

    async createQuery(string) {
        assert.equal(typeof string, 'string',
            'Query must be a string.');
        assert.ok(!this.state.isClosed(),
            'Engine must not be closed.');        
        if (this.state.isAccepting()) {
            // Query can be executed right now.
            this.query = new Query(this, string);
            this.state.setQuery();
            return this.query;
        } else {
            debug('Engine busy, putting query into a queue.');
            // Query cannot be executed now. It is put into
            // a queue waiting until the query can be worked on.
            const deferred = new Deferred();
            this.queue.push(new QueuedQuery(string, deferred));
            return deferred.promise;
        }
    }

    // Helper around createQuery to extract single
    // solution.
    
    async call(string) {
        const query = await this.createQuery(string);
        try {
            // Wait until respone comes in
            // before closing the query.
            const q = await query.next();
            return q;
        } finally {
            await query.close();
        }
    }

    // Closes the engine. Stops the Prolog process.
    
    close() {
        this.swipl.kill();
        this.state.setClosed();
    }

    _sendQuery(string) {
        assert.ok(this.state.isQuery(),
            'Engine has query.');
        this._sendObject({ query: string });
    }

    _sendNext() {
        debug('Requesting next solution.');
        assert.ok(this.state.isQuery(),
            'Engine has query.');
        this._sendObject({ action: 'next' });
    }

    _sendClose() {
        assert.ok(this.state.isQuery(),
            'Engine has query.');
        this._sendObject({ action: 'close' });
    }

    _sendObject(obj) {        
        let json = JSON.stringify(obj);
        

        if (os.platform() === 'win32') {
            const re = /([a-zA-Z]:)?(\\[a-zA-Z0-9_-]+)+\\?/;

            if (re.test(obj.query)) {
                json = json.replace(/\\/g, "\\\\");
            }
        }

        debug(`Sending to Prolog: ${json}.`);
        this.swipl.stdin.write(`${json}\n`, 'ascii');
        this.state.setWaiting();
    }
}

// Helper class to track the query state and
// detect error conditions.

class QueryState {

    constructor() { this.setState(QueryState.FRESH); }

    setWaiting() { this.setState(QueryState.WAITING); }
    setOpen() { this.setState(QueryState.OPEN); }
    setClosed() { this.setState(QueryState.CLOSED); }

    isFresh() { return this.state === QueryState.FRESH; }
    isOpen() { return this.state === QueryState.OPEN; }
    isWaiting() { return this.state === QueryState.WAITING; }
    isClosed() { return this.state === QueryState.CLOSED; }

    setState(state) {
        this.state = state;
        debug(`Query state set to ${state}.`);
    }
}

QueryState.FRESH = 'fresh'; // No query sent to Prolog yet.
QueryState.OPEN = 'open'; // Query sent to Prolog. Not waiting.
QueryState.WAITING = 'waiting'; // Waiting for input from Prolog.
QueryState.CLOSED = 'closed'; // No more answers/error.

class Query {

    constructor(engine, string) {
        this.query = string;
        this.engine = engine;
        this.deferred = null;
        this.state = new QueryState();
    }

    // Finds next solution. Returns a promise that
    // resolves to the bindings object or false.
    // In case of an error, the promise is rejected.

    async next() {
        if (this.state.isFresh()) {
            this.engine._sendQuery(this.query);
            this.deferred = new Deferred();
            this.state.setWaiting();
            return this.deferred.promise;
        } else if (this.state.isOpen()) {
            this.engine._sendNext();
            this.deferred = new Deferred();
            this.state.setWaiting();
            return this.deferred.promise;
        } else {
            throw new Error(`Invalid query state ${this.state.state}.`);
        }        
    }

    // Closes the query.

    async close() {
        if (this.state.isClosed()) {
            return Promise.resolve();
        } else if (this.state.isOpen()) {
            this.deferred = new Deferred();
            this.engine._sendClose();
            this.state.setWaiting();
            return this.deferred.promise;
        } else if (this.state.isFresh()) {
            this.state.setClosed();
            this.engine.state.setAccepting();
            return Promise.resolve();
        } else {
            throw new Error(`Invalid query state ${this.state.state}.`);
        }
    }

    // Receives response from Prolog.

    _response(obj) {
        assert(this.state.isWaiting(),
            'Query is waiting for response.');
        if (obj.status === 'success') {
            this.state.setOpen();
            this.deferred.resolve(obj.bindings);
            this.engine.state.setQuery();
        } else if (obj.status === 'fail') {
            this.state.setClosed();
            this.deferred.resolve(false);
            this.engine.query = null;
            this.engine.state.setAccepting();
        } else if (obj.status === 'error') {
            this.state.setClosed();
            this.deferred.reject(new Error(obj.error));
            this.engine.query = null;
            this.engine.state.setAccepting();
        }
    }
}

// Helper class to create a deferred promise.

class Deferred {

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

var nodeSwiplStdio = { Engine, term };

var index = /*@__PURE__*/getDefaultExportFromCjs(nodeSwiplStdio);

module.exports = index;
