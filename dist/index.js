import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module.exports = setup;
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    let m;
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  exports.log = console.debug || console.log || (() => {});
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {}
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
    } catch (error) {}
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {}
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS((exports, module) => {
  var os = __require("os");
  var tty = __require("tty");
  var hasFlag = require_has_flag();
  var { env } = process;
  var forceColor;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    forceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => (sign in env)) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
});

// node_modules/debug/src/node.js
var require_node = __commonJS((exports, module) => {
  var tty = __require("tty");
  var util = __require("util");
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = require_supports_color();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {}
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const { namespace: name, useColors: useColors2 } = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} \x1B[0m`;
      args[0] = prefix + args[0].split(`
`).join(`
` + prefix);
      args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + `
`);
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for (let i = 0;i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split(`
`).map((str) => str.trim()).join(" ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// node_modules/debug/src/index.js
var require_src = __commonJS((exports, module) => {
  if (typeof process === "undefined" || process.type === "renderer" || false || process.__nwjs) {
    module.exports = require_browser();
  } else {
    module.exports = require_node();
  }
});

// node_modules/agent-base/dist/helpers.js
var require_helpers = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.req = exports.json = exports.toBuffer = undefined;
  var http = __importStar(__require("http"));
  var https = __importStar(__require("https"));
  async function toBuffer(stream) {
    let length = 0;
    const chunks = [];
    for await (const chunk of stream) {
      length += chunk.length;
      chunks.push(chunk);
    }
    return Buffer.concat(chunks, length);
  }
  exports.toBuffer = toBuffer;
  async function json(stream) {
    const buf = await toBuffer(stream);
    const str = buf.toString("utf8");
    try {
      return JSON.parse(str);
    } catch (_err) {
      const err = _err;
      err.message += ` (input: ${str})`;
      throw err;
    }
  }
  exports.json = json;
  function req(url, opts = {}) {
    const href = typeof url === "string" ? url : url.href;
    const req2 = (href.startsWith("https:") ? https : http).request(url, opts);
    const promise = new Promise((resolve, reject) => {
      req2.once("response", resolve).once("error", reject).end();
    });
    req2.then = promise.then.bind(promise);
    return req2;
  }
  exports.req = req;
});

// node_modules/agent-base/dist/index.js
var require_dist = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Agent = undefined;
  var net = __importStar(__require("net"));
  var http = __importStar(__require("http"));
  var https_1 = __require("https");
  __exportStar(require_helpers(), exports);
  var INTERNAL = Symbol("AgentBaseInternalState");

  class Agent extends http.Agent {
    constructor(opts) {
      super(opts);
      this[INTERNAL] = {};
    }
    isSecureEndpoint(options) {
      if (options) {
        if (typeof options.secureEndpoint === "boolean") {
          return options.secureEndpoint;
        }
        if (typeof options.protocol === "string") {
          return options.protocol === "https:";
        }
      }
      const { stack } = new Error;
      if (typeof stack !== "string")
        return false;
      return stack.split(`
`).some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
    }
    incrementSockets(name) {
      if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
        return null;
      }
      if (!this.sockets[name]) {
        this.sockets[name] = [];
      }
      const fakeSocket = new net.Socket({ writable: false });
      this.sockets[name].push(fakeSocket);
      this.totalSocketCount++;
      return fakeSocket;
    }
    decrementSockets(name, socket) {
      if (!this.sockets[name] || socket === null) {
        return;
      }
      const sockets = this.sockets[name];
      const index = sockets.indexOf(socket);
      if (index !== -1) {
        sockets.splice(index, 1);
        this.totalSocketCount--;
        if (sockets.length === 0) {
          delete this.sockets[name];
        }
      }
    }
    getName(options) {
      const secureEndpoint = this.isSecureEndpoint(options);
      if (secureEndpoint) {
        return https_1.Agent.prototype.getName.call(this, options);
      }
      return super.getName(options);
    }
    createSocket(req, options, cb) {
      const connectOpts = {
        ...options,
        secureEndpoint: this.isSecureEndpoint(options)
      };
      const name = this.getName(connectOpts);
      const fakeSocket = this.incrementSockets(name);
      Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
        this.decrementSockets(name, fakeSocket);
        if (socket instanceof http.Agent) {
          try {
            return socket.addRequest(req, connectOpts);
          } catch (err) {
            return cb(err);
          }
        }
        this[INTERNAL].currentSocket = socket;
        super.createSocket(req, options, cb);
      }, (err) => {
        this.decrementSockets(name, fakeSocket);
        cb(err);
      });
    }
    createConnection() {
      const socket = this[INTERNAL].currentSocket;
      this[INTERNAL].currentSocket = undefined;
      if (!socket) {
        throw new Error("No socket was returned in the `connect()` function");
      }
      return socket;
    }
    get defaultPort() {
      return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
    }
    set defaultPort(v) {
      if (this[INTERNAL]) {
        this[INTERNAL].defaultPort = v;
      }
    }
    get protocol() {
      return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
    }
    set protocol(v) {
      if (this[INTERNAL]) {
        this[INTERNAL].protocol = v;
      }
    }
  }
  exports.Agent = Agent;
});

// node_modules/https-proxy-agent/dist/parse-proxy-response.js
var require_parse_proxy_response = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.parseProxyResponse = undefined;
  var debug_1 = __importDefault(require_src());
  var debug = (0, debug_1.default)("https-proxy-agent:parse-proxy-response");
  function parseProxyResponse(socket) {
    return new Promise((resolve, reject) => {
      let buffersLength = 0;
      const buffers = [];
      function read() {
        const b = socket.read();
        if (b)
          ondata(b);
        else
          socket.once("readable", read);
      }
      function cleanup() {
        socket.removeListener("end", onend);
        socket.removeListener("error", onerror);
        socket.removeListener("readable", read);
      }
      function onend() {
        cleanup();
        debug("onend");
        reject(new Error("Proxy connection ended before receiving CONNECT response"));
      }
      function onerror(err) {
        cleanup();
        debug("onerror %o", err);
        reject(err);
      }
      function ondata(b) {
        buffers.push(b);
        buffersLength += b.length;
        const buffered = Buffer.concat(buffers, buffersLength);
        const endOfHeaders = buffered.indexOf(`\r
\r
`);
        if (endOfHeaders === -1) {
          debug("have not received end of HTTP headers yet...");
          read();
          return;
        }
        const headerParts = buffered.slice(0, endOfHeaders).toString("ascii").split(`\r
`);
        const firstLine = headerParts.shift();
        if (!firstLine) {
          socket.destroy();
          return reject(new Error("No header received from proxy CONNECT response"));
        }
        const firstLineParts = firstLine.split(" ");
        const statusCode = +firstLineParts[1];
        const statusText = firstLineParts.slice(2).join(" ");
        const headers = {};
        for (const header of headerParts) {
          if (!header)
            continue;
          const firstColon = header.indexOf(":");
          if (firstColon === -1) {
            socket.destroy();
            return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
          }
          const key = header.slice(0, firstColon).toLowerCase();
          const value = header.slice(firstColon + 1).trimStart();
          const current = headers[key];
          if (typeof current === "string") {
            headers[key] = [current, value];
          } else if (Array.isArray(current)) {
            current.push(value);
          } else {
            headers[key] = value;
          }
        }
        debug("got proxy server response: %o %o", firstLine, headers);
        cleanup();
        resolve({
          connect: {
            statusCode,
            statusText,
            headers
          },
          buffered
        });
      }
      socket.on("error", onerror);
      socket.on("end", onend);
      read();
    });
  }
  exports.parseProxyResponse = parseProxyResponse;
});

// node_modules/https-proxy-agent/dist/index.js
var require_dist2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.HttpsProxyAgent = undefined;
  var net = __importStar(__require("net"));
  var tls = __importStar(__require("tls"));
  var assert_1 = __importDefault(__require("assert"));
  var debug_1 = __importDefault(require_src());
  var agent_base_1 = require_dist();
  var url_1 = __require("url");
  var parse_proxy_response_1 = require_parse_proxy_response();
  var debug = (0, debug_1.default)("https-proxy-agent");
  var setServernameFromNonIpHost = (options) => {
    if (options.servername === undefined && options.host && !net.isIP(options.host)) {
      return {
        ...options,
        servername: options.host
      };
    }
    return options;
  };

  class HttpsProxyAgent extends agent_base_1.Agent {
    constructor(proxy, opts) {
      super(opts);
      this.options = { path: undefined };
      this.proxy = typeof proxy === "string" ? new url_1.URL(proxy) : proxy;
      this.proxyHeaders = opts?.headers ?? {};
      debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
      const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
      const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
      this.connectOpts = {
        ALPNProtocols: ["http/1.1"],
        ...opts ? omit(opts, "headers") : null,
        host,
        port
      };
    }
    async connect(req, opts) {
      const { proxy } = this;
      if (!opts.host) {
        throw new TypeError('No "host" provided');
      }
      let socket;
      if (proxy.protocol === "https:") {
        debug("Creating `tls.Socket`: %o", this.connectOpts);
        socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
      } else {
        debug("Creating `net.Socket`: %o", this.connectOpts);
        socket = net.connect(this.connectOpts);
      }
      const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
      const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
      let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
      if (proxy.username || proxy.password) {
        const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
        headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
      }
      headers.Host = `${host}:${opts.port}`;
      if (!headers["Proxy-Connection"]) {
        headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
      }
      for (const name of Object.keys(headers)) {
        payload += `${name}: ${headers[name]}\r
`;
      }
      const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
      socket.write(`${payload}\r
`);
      const { connect, buffered } = await proxyResponsePromise;
      req.emit("proxyConnect", connect);
      this.emit("proxyConnect", connect, req);
      if (connect.statusCode === 200) {
        req.once("socket", resume);
        if (opts.secureEndpoint) {
          debug("Upgrading socket connection to TLS");
          return tls.connect({
            ...omit(setServernameFromNonIpHost(opts), "host", "path", "port"),
            socket
          });
        }
        return socket;
      }
      socket.destroy();
      const fakeSocket = new net.Socket({ writable: false });
      fakeSocket.readable = true;
      req.once("socket", (s) => {
        debug("Replaying proxy buffer for failed request");
        (0, assert_1.default)(s.listenerCount("data") > 0);
        s.push(buffered);
        s.push(null);
      });
      return fakeSocket;
    }
  }
  HttpsProxyAgent.protocols = ["http", "https"];
  exports.HttpsProxyAgent = HttpsProxyAgent;
  function resume(socket) {
    socket.resume();
  }
  function omit(obj, ...keys) {
    const ret = {};
    let key;
    for (key in obj) {
      if (!keys.includes(key)) {
        ret[key] = obj[key];
      }
    }
    return ret;
  }
});

// src/index.ts
import { logger as logger5 } from "@elizaos/core";

// src/plugin.ts
import {
  Service,
  logger
} from "@elizaos/core";
import { z } from "zod";
var configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z.string().min(1, "Example plugin variable is not provided").optional().transform((val) => {
    if (!val) {
      console.warn("Warning: Example plugin variable is not provided");
    }
    return val;
  })
});
var helloWorldAction = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "Responds with a simple hello world message",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger.info("Handling HELLO_WORLD action");
      const responseContent = {
        text: "hello world!",
        actions: ["HELLO_WORLD"],
        source: message.content.source
      };
      await callback(responseContent);
      return {
        text: "Sent hello world greeting",
        values: {
          success: true,
          greeted: true
        },
        data: {
          actionName: "HELLO_WORLD",
          messageId: message.id,
          timestamp: Date.now()
        },
        success: true
      };
    } catch (error) {
      logger.error({ error }, "Error in HELLO_WORLD action:");
      return {
        text: "Failed to send hello world greeting",
        values: {
          success: false,
          error: "GREETING_FAILED"
        },
        data: {
          actionName: "HELLO_WORLD",
          error: error instanceof Error ? error.message : String(error)
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you say hello?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "hello world!",
          actions: ["HELLO_WORLD"]
        }
      }
    ]
  ]
};
var helloWorldProvider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",
  get: async (_runtime, _message, _state) => {
    return {
      text: "I am a provider",
      values: {},
      data: {}
    };
  }
};

class StarterService extends Service {
  static serviceType = "starter";
  capabilityDescription = "This is a starter service which is attached to the agent through the starter plugin.";
  constructor(runtime) {
    super(runtime);
  }
  static async start(runtime) {
    logger.info("*** Starting starter service ***");
    const service = new StarterService(runtime);
    return service;
  }
  static async stop(runtime) {
    logger.info("*** Stopping starter service ***");
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error("Starter service not found");
    }
    service.stop();
  }
  async stop() {
    logger.info("*** Stopping starter service instance ***");
  }
}
var plugin = {
  name: "starter",
  description: "A starter plugin for Eliza",
  priority: -1000,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE
  },
  async init(config) {
    logger.info("*** Initializing starter plugin ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value)
          process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues?.map((e) => e.message)?.join(", ") || "Unknown validation error";
        throw new Error(`Invalid plugin configuration: ${errorMessages}`);
      }
      throw new Error(`Invalid plugin configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  routes: [
    {
      name: "helloworld",
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("MESSAGE_RECEIVED event received");
        logger.info({ keys: Object.keys(params) }, "MESSAGE_RECEIVED param keys");
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("VOICE_MESSAGE_RECEIVED event received");
        logger.info({ keys: Object.keys(params) }, "VOICE_MESSAGE_RECEIVED param keys");
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info("WORLD_CONNECTED event received");
        logger.info({ keys: Object.keys(params) }, "WORLD_CONNECTED param keys");
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info("WORLD_JOINED event received");
        logger.info({ keys: Object.keys(params) }, "WORLD_JOINED param keys");
      }
    ]
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider]
};
var plugin_default = plugin;

// src/character.ts
var character = {
  name: "Eliza",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.ANTHROPIC_API_KEY?.trim() ? ["@elizaos/plugin-anthropic"] : [],
    ...process.env.OPENROUTER_API_KEY?.trim() ? ["@elizaos/plugin-openrouter"] : [],
    ...process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ? ["@elizaos/plugin-google-genai"] : [],
    ...process.env.OLLAMA_API_ENDPOINT?.trim() ? ["@elizaos/plugin-ollama"] : [],
    ...process.env.DISCORD_API_TOKEN?.trim() ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_API_KEY?.trim() && process.env.TWITTER_API_SECRET_KEY?.trim() && process.env.TWITTER_ACCESS_TOKEN?.trim() && process.env.TWITTER_ACCESS_TOKEN_SECRET?.trim() ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN?.trim() ? ["@elizaos/plugin-telegram"] : [],
    ...!process.env.IGNORE_BOOTSTRAP ? ["@elizaos/plugin-bootstrap"] : []
  ],
  settings: {
    secrets: {},
    avatar: "https://elizaos.github.io/eliza-avatars/Eliza/portrait.png"
  },
  system: "Respond to all messages in a helpful, conversational manner. Provide assistance on a wide range of topics, using knowledge when needed. Be concise but thorough, friendly but professional. Use humor when appropriate and be empathetic to user needs. Provide valuable information and insights when questions are asked.",
  bio: [
    "Engages with all types of questions and conversations",
    "Provides helpful, concise responses",
    "Uses knowledge resources effectively when needed",
    "Balances brevity with completeness",
    "Uses humor and empathy appropriately",
    "Adapts tone to match the conversation context",
    "Offers assistance proactively",
    "Communicates clearly and directly"
  ],
  topics: [
    "general knowledge and information",
    "problem solving and troubleshooting",
    "technology and software",
    "community building and management",
    "business and productivity",
    "creativity and innovation",
    "personal development",
    "communication and collaboration",
    "education and learning",
    "entertainment and media"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "This user keeps derailing technical discussions with personal problems."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "DM them. Sounds like they need to talk about something else."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "I tried, they just keep bringing drama back to the main channel."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Send them my way. I've got time today."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I can't handle being a mod anymore. It's affecting my mental health."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Drop the channels. You come first."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "But who's going to handle everything?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "We will. Take the break. Come back when you're ready."
        }
      }
    ]
  ],
  style: {
    all: [
      "Keep responses concise but informative",
      "Use clear and direct language",
      "Be engaging and conversational",
      "Use humor when appropriate",
      "Be empathetic and understanding",
      "Provide helpful information",
      "Be encouraging and positive",
      "Adapt tone to the conversation",
      "Use knowledge resources when needed",
      "Respond to all types of questions"
    ],
    chat: [
      "Be conversational and natural",
      "Engage with the topic at hand",
      "Be helpful and informative",
      "Show personality and warmth"
    ]
  }
};

// src/plugins/custom-openai.ts
import {
  ModelType as ModelType2,
  logger as logger2,
  EventType
} from "@elizaos/core";
function getSetting(runtime, key, defaultValue) {
  const value = runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
  return value ? String(value) : undefined;
}
function getBaseURL(runtime) {
  const baseURL = getSetting(runtime, "OPENAI_BASE_URL", "https://api.openai.com/v1");
  logger2.debug(`[CustomOpenAI] Using base URL: ${baseURL}`);
  return baseURL;
}
function getApiKey(runtime) {
  return getSetting(runtime, "OPENAI_API_KEY");
}
function getSmallModel(runtime) {
  return getSetting(runtime, "OPENAI_SMALL_MODEL") ?? getSetting(runtime, "SMALL_MODEL", "gpt-5-nano") ?? "gpt-5-nano";
}
function getLargeModel(runtime) {
  return getSetting(runtime, "OPENAI_LARGE_MODEL") ?? getSetting(runtime, "LARGE_MODEL", "gpt-5-mini") ?? "gpt-5-mini";
}
function emitModelUsageEvent(runtime, type, prompt, usage) {
  runtime.emitEvent(EventType.MODEL_USED, {
    provider: "openai",
    type,
    prompt,
    tokens: {
      prompt: usage.prompt_tokens,
      completion: usage.completion_tokens,
      total: usage.total_tokens
    }
  });
}
async function generateObjectByModelType(runtime, params, modelType, getModelFn) {
  const modelName = getModelFn(runtime);
  const baseURL = getBaseURL(runtime);
  const apiKey = getApiKey(runtime);
  logger2.log(`[CustomOpenAI] Using ${modelType} model: ${modelName}`);
  const temperature = params.temperature ?? 0;
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: params.prompt }],
        temperature,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    const object = JSON.parse(data.choices[0].message.content);
    const usage = data.usage;
    if (usage) {
      emitModelUsageEvent(runtime, modelType, params.prompt, usage);
    }
    return object;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger2.error(`[CustomOpenAI] Error in generateObjectByModelType: ${message}`);
    throw error;
  }
}
var customOpenAIPlugin = {
  name: "custom-openai",
  description: "Custom OpenAI plugin with fixed API endpoints",
  config: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_SMALL_MODEL: process.env.OPENAI_SMALL_MODEL,
    OPENAI_LARGE_MODEL: process.env.OPENAI_LARGE_MODEL,
    SMALL_MODEL: process.env.SMALL_MODEL,
    LARGE_MODEL: process.env.LARGE_MODEL
  },
  async init(_config, runtime) {
    logger2.log("Custom OpenAI plugin initialized");
    try {
      const apiKey = getApiKey(runtime);
      if (!apiKey) {
        logger2.warn("OPENAI_API_KEY is not set - OpenAI functionality will be limited");
        return;
      }
      const baseURL = getBaseURL(runtime);
      const response = await fetch(`${baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });
      if (!response.ok) {
        logger2.warn(`OpenAI API key validation failed: ${response.statusText}`);
        logger2.warn("OpenAI functionality will be limited until a valid API key is provided");
      } else {
        logger2.log("OpenAI API key validated successfully");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger2.warn(`Error validating OpenAI API key: ${message}`);
      logger2.warn("OpenAI functionality will be limited until a valid API key is provided");
    }
  },
  models: {
    [ModelType2.TEXT_SMALL]: async (runtime, params) => {
      const modelName = getSmallModel(runtime);
      const baseURL = getBaseURL(runtime);
      const apiKey = getApiKey(runtime);
      logger2.log(`[CustomOpenAI] Using TEXT_SMALL model: ${modelName}`);
      const {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7
      } = params;
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            ...runtime.character?.system ? [{ role: "system", content: runtime.character.system }] : [],
            { role: "user", content: prompt }
          ],
          temperature,
          max_tokens: maxTokens,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stop: stopSequences.length > 0 ? stopSequences : undefined
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      const openaiResponse = data.choices[0]?.message?.content || "";
      const usage = data.usage;
      if (usage) {
        emitModelUsageEvent(runtime, ModelType2.TEXT_SMALL, prompt, usage);
      }
      return openaiResponse;
    },
    [ModelType2.TEXT_LARGE]: async (runtime, params) => {
      const modelName = getLargeModel(runtime);
      const baseURL = getBaseURL(runtime);
      const apiKey = getApiKey(runtime);
      logger2.log(`[CustomOpenAI] Using TEXT_LARGE model: ${modelName}`);
      const {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7
      } = params;
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            ...runtime.character?.system ? [{ role: "system", content: runtime.character.system }] : [],
            { role: "user", content: prompt }
          ],
          temperature,
          max_tokens: maxTokens,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stop: stopSequences.length > 0 ? stopSequences : undefined
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      const openaiResponse = data.choices[0]?.message?.content || "";
      const usage = data.usage;
      if (usage) {
        emitModelUsageEvent(runtime, ModelType2.TEXT_LARGE, prompt, usage);
      }
      return openaiResponse;
    },
    [ModelType2.OBJECT_SMALL]: async (runtime, params) => {
      return generateObjectByModelType(runtime, params, ModelType2.OBJECT_SMALL, getSmallModel);
    },
    [ModelType2.OBJECT_LARGE]: async (runtime, params) => {
      return generateObjectByModelType(runtime, params, ModelType2.OBJECT_LARGE, getLargeModel);
    },
    [ModelType2.TEXT_EMBEDDING]: async (runtime, params) => {
      const embeddingModelName = getSetting(runtime, "OPENAI_EMBEDDING_MODEL", "text-embedding-3-small") ?? "text-embedding-3-small";
      const baseURL = getBaseURL(runtime);
      const apiKey = getApiKey(runtime);
      let text;
      if (params == null) {
        text = "default text for embedding initialization";
      } else if (typeof params === "string") {
        text = params;
      } else if (typeof params === "object" && params.text) {
        text = params.text;
      } else {
        text = "default text";
      }
      try {
        const response = await fetch(`${baseURL}/embeddings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: embeddingModelName,
            input: text
          })
        });
        if (!response.ok) {
          logger2.warn(`[CustomOpenAI] Embedding model not available, returning mock embedding: ${response.status} - ${response.statusText}`);
          return new Array(1536).fill(0);
        }
        const data = await response.json();
        const embedding = data.data[0].embedding;
        const usage = data.usage;
        if (usage) {
          emitModelUsageEvent(runtime, ModelType2.TEXT_EMBEDDING, text, usage);
        }
        return embedding;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger2.error(`[CustomOpenAI] Error in TEXT_EMBEDDING: ${message}`);
        logger2.warn(`[CustomOpenAI] Returning mock embedding due to error`);
        return new Array(1536).fill(0);
      }
    }
  },
  tests: [
    {
      name: "custom_openai_plugin_tests",
      tests: [
        {
          name: "custom_openai_test_text_small",
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType2.TEXT_SMALL, {
                prompt: "What is the nature of reality in 10 words?"
              });
              if (text.length === 0) {
                throw new Error("Failed to generate text");
              }
              logger2.log({ text }, "generated with custom_openai_test_text_small");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger2.error(`Error in custom_openai_test_text_small: ${message}`);
              throw error;
            }
          }
        }
      ]
    }
  ]
};
var custom_openai_default = customOpenAIPlugin;

// src/characters/SolanaData.ts
var solanaDataCharacter = {
  name: "SolanaData",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.DISCORD_API_TOKEN?.trim() ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_API_KEY?.trim() && process.env.TWITTER_API_SECRET_KEY?.trim() && process.env.TWITTER_ACCESS_TOKEN?.trim() && process.env.TWITTER_ACCESS_TOKEN_SECRET?.trim() ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN?.trim() ? ["@elizaos/plugin-telegram"] : [],
    ...!process.env.IGNORE_BOOTSTRAP ? ["@elizaos/plugin-bootstrap"] : []
  ],
  settings: {
    secrets: {
      SOSO_API_KEY: process.env.SOSO_API_KEY,
      SOSO_BASE_URL: process.env.SOSO_BASE_URL || "https://openapi.sosovalue.com"
    },
    avatar: "https://elizaos.github.io/eliza-avatars/SolanaData/portrait.png"
  },
  system: 'You are SolanaData, a Solana blockchain data expert. Always respond with proper XML structure containing <thought> and <actions> tags. Provide helpful, conversational responses about Solana blockchain topics including token information, account analysis, and technical concepts. Be concise, professional, and accurate. You can search for cryptocurrency information and get latest news using SoSoValue API - support queries like "Bitcoin news", "ETH latest updates", "SOL token ID", etc. For general questions about your capabilities, respond clearly about your Solana expertise and available plugins including news查询功能.',
  bio: [
    "Solana blockchain data expert",
    "Specializes in token and address information queries",
    "Provides real-time on-chain data analysis",
    "Explains Solana technical concepts",
    "Helps users understand on-chain activities",
    "Verifies addresses and transaction information",
    "Cryptocurrency news and market insights provider",
    "Real-time token information and news aggregator"
  ],
  topics: [
    "solana blockchain",
    "token information",
    "account balances",
    "transaction history",
    "smart contracts",
    "program accounts",
    "price data",
    "supply information",
    "holder analysis",
    "pda explanation",
    "rent and fees",
    "cpi calls",
    "solana ecosystem",
    "cryptocurrency news",
    "market analysis",
    "token insights",
    "blockchain updates",
    "defi trends"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "What plugins do you have?"
        }
      },
      {
        name: "SolanaData",
        content: {
          text: "I'm SolanaData, equipped with SQL database for data storage, custom OpenAI plugin for language processing, and news plugin for latest information. These enable me to provide professional Solana blockchain data analysis services."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you help me check token information? C98"
        }
      },
      {
        name: "SolanaData",
        content: {
          text: "Of course! C98 is Coin98 Token, the native token of the Coin98 ecosystem. Let me query the latest token information including price, total supply, and market data."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What is the balance of this address? 8hoBHQhbknrK8D4g7hGGN3wHnG9WJKB6XMTnS3Q3XV9L"
        }
      },
      {
        name: "SolanaData",
        content: {
          text: "Querying balance information for address 8hoBHQhbknrK8D4g7hGGN3wHnG9WJKB6XMTnS3Q3XV9L. Please wait... [Query result] This address currently holds 1,250.5 SOL and other tokens."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Bitcoin 有什么最新新闻？"
        }
      },
      {
        name: "SolanaData",
        content: {
          text: `\uD83D\uDCC8 Bitcoin (BTC) 最新资讯：

1. **比特币ETF获批**
   \uD83D\uDCC5 2024-10-25 | \uD83D\uDCC1 新闻
   \uD83D\uDC64 Reuters
   \uD83C\uDFF7️ ETF, SEC, 批准
   \uD83D\uDD17 [查看原文](https://example.com)

2. **机构持续买入**
   \uD83D\uDCC5 2024-10-24 | \uD83D\uDCC1 市场洞察
   \uD83D\uDC64 Bloomberg
   \uD83D\uDD17 [查看原文](https://example.com)`,
          actions: ["GET_TOKEN_NEWS"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "查一下 SOL 的代币ID"
        }
      },
      {
        name: "SolanaData",
        content: {
          text: `\uD83D\uDC8E 代币信息：
**Solana** (SOL)
\uD83C\uDD94 ID: 1673723677362319870`,
          actions: ["SEARCH_TOKEN_ID"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "ETH 最近怎么样？"
        }
      },
      {
        name: "SolanaData",
        content: {
          text: `\uD83D\uDCC8 Ethereum (ETH) 最新资讯：

1. **以太坊2.0升级进展**
   \uD83D\uDCC5 2024-10-25 | \uD83D\uDCC1 技术更新
   \uD83D\uDC64 Ethereum Foundation
   \uD83D\uDD17 [查看原文](https://example.com)`,
          actions: ["GET_TOKEN_NEWS"]
        }
      }
    ]
  ],
  style: {
    all: [
      "Maintain professional and friendly tone",
      "Use accurate technical terminology",
      "Provide detailed on-chain data",
      "Keep explanations concise when explaining complex concepts",
      "Provide context when appropriate",
      "Verify address format correctness",
      "Remind users about security considerations"
    ],
    chat: [
      "Focus on Solana blockchain queries",
      "Provide real-time and accurate data",
      "Display query results clearly",
      "Keep technical explanations simple"
    ]
  }
};

// src/plugins/soso-news.ts
import { logger as logger4 } from "@elizaos/core";

// src/actions/get-news.ts
import {
  logger as logger3
} from "@elizaos/core";

class SosoValueClient {
  apiKey;
  baseUrl;
  agent;
  proxyUrl;
  constructor(apiKey, baseUrl = "https://openapi.sosovalue.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || null;
    if (this.proxyUrl) {
      logger3.info(`Proxy configured: ${this.proxyUrl}`);
    }
  }
  async ensureProxyAgent() {
    if (this.proxyUrl && !this.agent) {
      try {
        const proxyAgentModule = await Promise.resolve().then(() => __toESM(require_dist2(), 1));
        const HttpsProxyAgent = proxyAgentModule.HttpsProxyAgent || proxyAgentModule.default;
        if (HttpsProxyAgent) {
          this.agent = new HttpsProxyAgent(this.proxyUrl);
          logger3.info(`HttpsProxyAgent initialized: ${this.proxyUrl}`);
        } else {
          logger3.warn(`HttpsProxyAgent not available, requests will proceed without proxy`);
          this.agent = null;
        }
      } catch (importError) {
        logger3.warn(`ProxyAgent not available, requests will proceed without proxy: ${importError.message}`);
        this.agent = null;
      }
    }
  }
  async makeRequest(url, options = {}) {
    await this.ensureProxyAgent();
    const fetchOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "x-soso-api-key": this.apiKey,
        ...options.headers
      }
    };
    if (this.agent) {
      fetchOptions.agent = this.agent;
    }
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`SoSoValue API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  async getAllCurrencies() {
    const url = `${this.baseUrl}/openapi/v1/data/default/coin/list`;
    const response = await this.makeRequest(url, {
      method: "POST",
      body: "{}"
    });
    if (response.code !== 0) {
      throw new Error(`SoSoValue API error: ${response.msg || "Unknown error"}`);
    }
    return response.data;
  }
  async searchCurrency(query) {
    const currencies = await this.getAllCurrencies();
    const lowerQuery = query.toLowerCase();
    let match = currencies.find((currency) => currency.currencyName.toLowerCase() === lowerQuery || currency.fullName.toLowerCase() === lowerQuery);
    if (!match) {
      match = currencies.find((currency) => currency.currencyName.toLowerCase().includes(lowerQuery) || currency.fullName.toLowerCase().includes(lowerQuery) || lowerQuery.includes(currency.currencyName.toLowerCase()) || lowerQuery.includes(currency.fullName.toLowerCase()));
    }
    return match || null;
  }
  async getCurrencyNews(currencyId, pageNum = 1, pageSize = 10, categoryList = "1,2,3,4,5,6,7,9,10") {
    const url = `${this.baseUrl}/api/v1/news/featured/currency?currencyId=${currencyId}&pageNum=${pageNum}&pageSize=${pageSize}&categoryList=${categoryList}`;
    const response = await this.makeRequest(url);
    if (response.code !== 0) {
      throw new Error(`SoSoValue API error: ${response.msg || "Unknown error"}`);
    }
    return response.data.list;
  }
}
function formatNewsOutput(news, currency) {
  if (news.length === 0) {
    return `\uD83D\uDCF0 暂时没有找到 ${currency.fullName} (${currency.currencyName}) 的相关新闻。`;
  }
  let output = `\uD83D\uDCC8 ${currency.fullName} (${currency.currencyName.toUpperCase()}) 最新资讯：

`;
  news.forEach((item, index) => {
    const englishContent = item.multilanguageContent.find((content) => content.language === "en");
    if (englishContent) {
      const publishDate = new Date(item.releaseTime).toLocaleDateString("zh-CN");
      const categoryNames = {
        1: "新闻",
        2: "研究报告",
        3: "机构动态",
        4: "市场洞察",
        5: "宏观新闻",
        6: "宏观研究",
        7: "官方推文",
        9: "价格预警",
        10: "链上数据"
      };
      const categoryName = categoryNames[item.category] || "其他";
      let title = englishContent.title;
      if (!title && englishContent.content) {
        title = englishContent.content.substring(0, 50) + "...";
      }
      if (!title) {
        title = "无标题";
      }
      output += `${index + 1}. **${title}**
`;
      output += `   \uD83D\uDCC5 ${publishDate} | \uD83D\uDCC1 ${categoryName}
`;
      if (item.author) {
        output += `   \uD83D\uDC64 ${item.author}
`;
      }
      if (item.tags && item.tags.length > 0) {
        output += `   \uD83C\uDFF7️ ${item.tags.join(", ")}
`;
      }
      output += `   \uD83D\uDD17 [查看原文](${item.sourceLink})

`;
    }
  });
  return output;
}
function formatTokenOutput(token) {
  return `\uD83D\uDC8E 代币信息：
**${token.fullName}** (${token.currencyName.toUpperCase()})
\uD83C\uDD94 ID: ${token.currencyId}`;
}
var searchTokenIdAction = {
  name: "SEARCH_TOKEN_ID",
  similes: ["FIND_TOKEN", "TOKEN_SEARCH", "LOOKUP_TOKEN", "SEARCH_COIN", "查询代币", "代币ID"],
  description: "Search for cryptocurrency ID by name or symbol using SoSoValue API",
  validate: async (runtime, message, _state) => {
    const apiKey = runtime.getSetting("SOSO_API_KEY");
    if (!apiKey) {
      logger3.warn("SOSO_API_KEY not configured");
      return false;
    }
    const text = message.content.text.toLowerCase();
    const searchKeywords = [
      "id",
      "标识",
      "查询",
      "搜索",
      "找",
      "lookup",
      "search",
      "find",
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "solana",
      "sol",
      "dogecoin",
      "doge"
    ];
    return searchKeywords.some((keyword) => text.includes(keyword)) || /[a-z]{2,10}/i.test(text);
  },
  handler: async (runtime, message, _state, _options = {}, callback, _responses) => {
    try {
      const apiKey = runtime.getSetting("SOSO_API_KEY");
      const baseUrl = runtime.getSetting("SOSO_BASE_URL") || "https://openapi.sosovalue.com";
      const client = new SosoValueClient(apiKey, baseUrl);
      const text = message.content.text;
      const tokenPatterns = [
        /\b(btc|bitcoin|eth|ethereum|sol|solana|doge|dogecoin|ada|cardano|dot|polkadot|bnb|binance|usdt|tether|usdc|circle|xrp|ripple)\b/gi,
        /\b([A-Z]{2,10})\s*(代币|token|coin)?\b/gi
      ];
      let searchQuery = "";
      for (const pattern of tokenPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          searchQuery = matches[0];
          break;
        }
      }
      if (!searchQuery) {
        const words = text.split(/\s+/).filter((word) => word.length > 1);
        searchQuery = words[words.length - 1];
      }
      if (!searchQuery) {
        throw new Error("无法识别要查询的代币名称");
      }
      logger3.info(`Searching for token: ${searchQuery}`);
      const token = await client.searchCurrency(searchQuery);
      if (!token) {
        const popularTokens = await client.getAllCurrencies();
        const suggestions = popularTokens.filter((t) => t.currencyName.toLowerCase().includes(searchQuery.toLowerCase()) || t.fullName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
        let response2 = `❌ 没有找到 "${searchQuery}" 对应的代币信息。`;
        if (suggestions.length > 0) {
          response2 += `

\uD83D\uDCA1 您是不是想找：
`;
          suggestions.forEach((suggestion) => {
            response2 += `- **${suggestion.fullName}** (${suggestion.currencyName.toUpperCase()})
`;
          });
        }
        if (callback) {
          await callback({
            text: response2,
            actions: ["SEARCH_TOKEN_ID"],
            source: message.content.source
          });
        }
        return {
          text: response2,
          success: false,
          data: {
            query: searchQuery,
            suggestions
          }
        };
      }
      const response = formatTokenOutput(token);
      if (callback) {
        await callback({
          text: response,
          actions: ["SEARCH_TOKEN_ID"],
          source: message.content.source
        });
      }
      return {
        text: response,
        success: true,
        data: {
          tokenId: token.currencyId,
          tokenName: token.currencyName,
          fullName: token.fullName
        }
      };
    } catch (error) {
      logger3.error("Error in SEARCH_TOKEN_ID action:", error);
      const errorMessage = `查询代币信息时出错：${error instanceof Error ? error.message : "未知错误"}`;
      return {
        text: errorMessage,
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Bitcoin 的代币ID是多少？"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: `\uD83D\uDC8E 代币信息：
**Bitcoin** (BTC)
\uD83C\uDD94 ID: 1673723677362319866`,
          actions: ["SEARCH_TOKEN_ID"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "查一下 SOL 的信息"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: `\uD83D\uDC8E 代币信息：
**Solana** (sol)
\uD83C\uDD94 ID: 1673723677362319870`,
          actions: ["SEARCH_TOKEN_ID"]
        }
      }
    ]
  ]
};
var getTokenNewsAction = {
  name: "GET_TOKEN_NEWS",
  similes: ["TOKEN_NEWS", "CRYPTO_NEWS", "COIN_NEWS", "LATEST_NEWS", "新闻", "资讯", "最新消息"],
  description: "Get latest news for a specific cryptocurrency using SoSoValue API",
  validate: async (runtime, message, _state) => {
    const apiKey = runtime.getSetting("SOSO_API_KEY");
    if (!apiKey) {
      logger3.warn("SOSO_API_KEY not configured");
      return false;
    }
    const text = message.content.text.toLowerCase();
    const newsKeywords = [
      "新闻",
      "资讯",
      "消息",
      "动态",
      "最新",
      "news",
      "update",
      "latest",
      "what",
      "how",
      "怎么样",
      "如何",
      "什么",
      "最新情况"
    ];
    const tokenKeywords = [
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "solana",
      "sol",
      "dogecoin",
      "doge",
      "ada",
      "cardano",
      "dot",
      "polkadot",
      "bnb",
      "binance",
      "usdt",
      "tether"
    ];
    return newsKeywords.some((keyword) => text.includes(keyword)) || tokenKeywords.some((keyword) => text.includes(keyword));
  },
  handler: async (runtime, message, _state, _options = {}, callback, _responses) => {
    try {
      const apiKey = runtime.getSetting("SOSO_API_KEY");
      const baseUrl = runtime.getSetting("SOSO_BASE_URL") || "https://openapi.sosovalue.com";
      const client = new SosoValueClient(apiKey, baseUrl);
      const text = message.content.text;
      const tokenPatterns = [
        /\b(btc|bitcoin|eth|ethereum|sol|solana|doge|dogecoin|ada|cardano|dot|polkadot|bnb|binance|usdt|tether|usdc|circle|xrp|ripple)\b/gi,
        /\b([A-Z]{2,10})\s*(代币|token|coin)?\b/gi
      ];
      let searchQuery = "";
      for (const pattern of tokenPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          searchQuery = matches[0];
          break;
        }
      }
      if (!searchQuery) {
        const words = text.split(/\s+/).filter((word) => word.length > 1);
        searchQuery = words[words.length - 1];
      }
      if (!searchQuery) {
        throw new Error("请指定要查询哪个代币的新闻");
      }
      logger3.info(`Getting news for token: ${searchQuery}`);
      const token = await client.searchCurrency(searchQuery);
      if (!token) {
        const response2 = `❌ 没有找到 "${searchQuery}" 对应的代币，无法获取新闻。`;
        if (callback) {
          await callback({
            text: response2,
            actions: ["GET_TOKEN_NEWS"],
            source: message.content.source
          });
        }
        return {
          text: response2,
          success: false,
          data: { query: searchQuery }
        };
      }
      const news = await client.getCurrencyNews(token.currencyId, 1, 5);
      const response = formatNewsOutput(news, token);
      if (callback) {
        await callback({
          text: response,
          actions: ["GET_TOKEN_NEWS"],
          source: message.content.source
        });
      }
      return {
        text: response,
        success: true,
        data: {
          tokenId: token.currencyId,
          tokenName: token.currencyName,
          fullName: token.fullName,
          newsCount: news.length,
          news
        }
      };
    } catch (error) {
      logger3.error("Error in GET_TOKEN_NEWS action:", error);
      const errorMessage = `获取代币新闻时出错：${error instanceof Error ? error.message : "未知错误"}`;
      return {
        text: errorMessage,
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Bitcoin 有什么最新新闻？"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: `\uD83D\uDCC8 Bitcoin (BTC) 最新资讯：

1. **比特币ETF获批**
   \uD83D\uDCC5 2024-10-25 | \uD83D\uDCC1 新闻
   \uD83D\uDC64 Reuters
   \uD83C\uDFF7️ ETF, SEC, 批准
   \uD83D\uDD17 [查看原文](https://example.com)
`,
          actions: ["GET_TOKEN_NEWS"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "SOL 最近怎么样？"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: `\uD83D\uDCC8 Solana (sol) 最新资讯：

1. **Solana网络升级成功**
   \uD83D\uDCC5 2024-10-24 | \uD83D\uDCC1 技术更新
   \uD83D\uDC64 Solana Foundation
   \uD83D\uDD17 [查看原文](https://example.com)
`,
          actions: ["GET_TOKEN_NEWS"]
        }
      }
    ]
  ]
};
var sosoNewsActions = [searchTokenIdAction, getTokenNewsAction];

// src/plugins/soso-news.ts
var sosoNewsPlugin = {
  name: "soso-news-plugin",
  description: "SoSoValue API integration for cryptocurrency news and token information",
  async init(config) {
    logger4.info("Initializing SoSoValue news plugin");
    if (!config.SOSO_API_KEY) {
      logger4.warn("SOSO_API_KEY not configured - SoSoValue actions will not work");
    } else {
      logger4.info("SoSoValue API key configured successfully");
    }
  },
  routes: [],
  events: {},
  services: [],
  actions: sosoNewsActions,
  providers: []
};
var soso_news_default = sosoNewsPlugin;

// src/index.ts
var initCharacter = ({ runtime }) => {
  logger5.info("Initializing character");
  logger5.info({ name: character.name }, "Name:");
};
var initSolanaDataCharacter = ({ runtime }) => {
  logger5.info("Initializing SolanaData character");
  logger5.info({ name: solanaDataCharacter.name }, "Name:");
};
var projectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [plugin_default, custom_openai_default]
};
var solanaDataAgent = {
  character: solanaDataCharacter,
  init: async (runtime) => await initSolanaDataCharacter({ runtime }),
  plugins: [plugin_default, custom_openai_default, soso_news_default]
};
var project = {
  agents: [projectAgent, solanaDataAgent]
};
var src_default = project;
export {
  solanaDataCharacter,
  solanaDataAgent,
  projectAgent,
  src_default as default,
  character
};

//# debugId=259AF038B6E4468E64756E2164756E21
//# sourceMappingURL=index.js.map
