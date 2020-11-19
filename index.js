/*
Documentation for the API

INIT
  -settinsgs
    -prefix (set the prefix of the urls)
    -unauthorized_callback (function) of the result is 403

*/
// if (typeof window === "undefined") {
//   // this is node
//   fetch = require("node-fetch");
// }
const errorStatuses = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",

  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",

  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "Request-URI Too Long",
  415: "Unsupported Media Type",
  416: "Requested Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  444: "Connection Closed Without Response",
  451: "Unavailable For Legal Reasons",
  499: "Client Closed Request",

  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
  599: "Network Connect Timeout Error",
};

const Api = class {
  // Constructor -----------------------------------------------
  constructor(settings) {
    // console.log("Api Constructor settings", settings);
    // console.log("------------------------");

    // Default variables
    this.prefix = "";
    this.error = null;
    this.loading = false;
    this.loaded = false;
    this.default = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    this.headers = this.default.headers;
    this.unauthorized_callback = null;
    this.persistantData = {
      post: {},
      put: {},
    };
    this.logEnabled = false;
    this.logStyle =
      "background: #1890ff; color: white; padding: 2px 5px; border-radius: 2px";
    this.logPrefix = "API >";

    this.includeDetails = false;
    this.middlewareFunctions = {};
    this.fetchLib = null;
    this.fetchLibName = "fetch";

    if (settings.prefix) this.prefix = settings.prefix;
    if (settings.unauthorized_callback)
      this.unauthorized_callback = settings.unauthorized_callback;

    // Log Settings ----
    if (typeof settings.logEnabled !== "undefined") {
      this.logEnabled = Boolean(settings.logEnabled);
    }
    if (settings.logPrefix) this.logPrefix = settings.logPrefix;
    if (typeof settings.logStyle !== "undefined")
      this.logStyle = String(settings.logStyle);
    // Details settings -----
    if (typeof settings.includeDetails !== "undefined") {
      this.includeDetails = Boolean(settings.includeDetails);
    }
    // middlewareFunctions
    if (typeof settings.middlewareFunctions !== "undefined") {
      this.middlewareFunctions = settings.middlewareFunctions;
    }
    // fetchLib
    if (typeof settings.fetchLib !== "undefined") {
      this.fetchLib = settings.fetchLib;
      this.fetchLibName = settings.fetchLibName;
    } else {
      this.fetchLib = fetch ? fetch : null;
      this.fetchLibName = "fetch";
    }
  }
  // End of Constructor -----------------------------------------------

  // Log -----------------------------------------------
  _log(_txt) {
    if (this.logEnabled === true) {
      console.log(`%c${this.logPrefix} ${_txt}`, this.logStyle);
    } else {
      return () => {};
    }
  }
  _info(_txt, _obj) {
    if (this.logEnabled === true) {
      console.log(`%c${this.logPrefix} ${_txt}`, this.logStyle);
      console.info(_obj);
    } else {
      return () => {};
    }
  }

  // Headers ---------------------------------------
  setHeaders(_headers) {
    //console.log("setHeaders", _headers);
    this.headers = _headers;
  }
  addHeaders(_headers) {
    this.headers = Object.assign(_headers, this.headers);
  }
  resetHeaders() {
    this.headers = this.default.headers;
  }
  removeHeader(_key) {
    if (this.headers[_key]) delete this.headers[_key];
  }

  // Middleware ---------------------------------------
  setMiddleware(_status, _function) {
    this._log("setMiddleware > " + _status, " fn > " + _function);
    this.middlewareFunctions[_status] = _function;
  }
  removeMiddleware(_status) {
    this._log("removeMiddleware > " + _status);
    delete this.middlewareFunctions[_status];
  }

  // Persistant data ----------------------------------
  setPersistantData(_type, _data) {
    //console.log("setPersistantData _type", _type, "_data", _data);
    this.persistantData[_type] = {
      ...this.persistantData[_type],
      ..._data,
    };
  }

  async get(_command, _body, _successCallback, _errorCallback) {
    this._log(`GET > ${_command}`);
    return this.call("GET", _command, _body, _successCallback, _errorCallback);
  }

  async post(_command, _body, _successCallback, _errorCallback) {
    this._info(`POST > ${_command}, body`, _body);
    return this.call("POST", _command, _body, _successCallback, _errorCallback);
  }

  async put(_command, _body, _successCallback, _errorCallback) {
    this._info(`PUT > ${_command}, body`, _body);
    return this.call("PUT", _command, _body, _successCallback, _errorCallback);
  }

  async delete(_command, _successCallback, _errorCallback) {
    //console.log("API Delete _command", _command);
    this._log(`DELETE > ${_command}`);
    return this.call(
      "DELETE",
      _command,
      _body,
      _successCallback,
      _errorCallback
    );
  }

  async call(_method, _command, _body, _successCallback, _errorCallback) {
    return new Promise(async (resolve, reject) => {
      // console.log(
      //   "CALL _method",
      //   _method,
      //   "_command",
      //   _command,
      //   "_body",
      //   _body,
      //   "_successCallback",
      //   _successCallback,
      //   "_errorCallback",
      //   _errorCallback
      // );

      const startTime =
        process && process.hrtime ? process.hrtime() : performance.now();

      let settingsObject = {
        method: _method,
      };
      // Adding persistant data
      if (Object.keys(this.persistantData.post).length > 0) {
        _body = { ..._body, ...this.persistantData.post };
      }

      // Authorization headers??
      if (Object.keys(this.headers).length > 0) {
        let that = this;
        settingsObject.headers = {};
        Object.keys(this.headers).forEach(function (key) {
          settingsObject.headers[key] = that.headers[key];
        });
      }

      let url = this.prefix + _command;

      let resStatus = 0;

      switch (this.fetchLibName) {
        case "fetch":
        default:
          if (_method.toUpperCase() === "GET" && typeof _body !== "undefined") {
            url = url + "?" + this.serialize(_body);
          } else {
            settingsObject["body"] =
              typeof _body !== "undefined" ? JSON.stringify(_body) : null;
          }

          resStatus = 0;
          await this.fetchLib(url, settingsObject)
            .then((res) => {
              resStatus = res.status;

              // middleware
              if (typeof this.middlewareFunctions[resStatus] === "function")
                this.middlewareFunctions[resStatus](res);

              if (resStatus === 403) {
                if (typeof this.unauthorized_callback === "function")
                  this.unauthorized_callback(res.statusText);
                throw new Error(errorStatuses[resStatus]);
              }

              return res.json ? res.json() : res.data;
            })
            .then((res) => {
              const hrtime =
                process && process.hrtime
                  ? process.hrtime(startTime)
                  : performance.now();
              const seconds =
                process && process.hrtime
                  ? (hrtime[0] + hrtime[1] / 1e9).toFixed(3)
                  : ((hrtime - startTime) / 1000).toFixed(3);

              this._log(
                `${_method.toUpperCase()} > ${_command} | STATUS: ${resStatus} | TIME: ${seconds} seconds`
              );

              if (resStatus >= 200 && resStatus < 300) {
                const result =
                  this.includeDetails === true
                    ? { data: res, status: resStatus, time: Number(seconds) }
                    : res;

                if (!_successCallback) {
                  // Promise
                  resolve(result);
                } else {
                  //
                  if (typeof _successCallback === "function")
                    _successCallback(result);
                }
              } else {
                if (!_successCallback) {
                  // Promise
                  reject(`${resStatus} - ${errorStatuses[resStatus]}`);
                } else {
                  //
                  if (typeof _errorCallback === "function")
                    _errorCallback(
                      `${resStatus} - ${errorStatuses[resStatus]}`
                    );
                }
              }
            })
            .catch((err) => {
              if (!_successCallback) {
                // Promise
                reject(err.message);
              } else {
                //
                if (typeof _errorCallback === "function")
                  _errorCallback(err.message);
              }
            });

          break;
        case "axios":
          settingsObject["url"] = url;
          settingsObject["body"] = _body;

          resStatus = 0;
          await this.fetchLib(settingsObject)
            .then((res) => {
              resStatus = res.status;
              // middleware
              if (typeof this.middlewareFunctions[resStatus] === "function")
                this.middlewareFunctions[resStatus](res);
              return res.json ? res.json() : res.data;
            })
            .then((res) => {
              const hrtime =
                process && process.hrtime
                  ? process.hrtime(startTime)
                  : performance.now();
              const seconds =
                process && process.hrtime
                  ? (hrtime[0] + hrtime[1] / 1e9).toFixed(3)
                  : ((hrtime - startTime) / 1000).toFixed(3);

              this._log(
                `${_method.toUpperCase()} > ${_command} | STATUS: ${resStatus} | TIME: ${seconds} seconds`
              );

              if (resStatus >= 200 && resStatus < 300) {
                const result =
                  this.includeDetails === true
                    ? { data: res, status: resStatus, time: Number(seconds) }
                    : res;

                if (!_successCallback) {
                  // Promise
                  resolve(result);
                } else {
                  //
                  if (typeof _successCallback === "function")
                    _successCallback(result);
                }
              } else {
                if (!_successCallback) {
                  // Promise
                  reject(`${resStatus} - ${errorStatuses[resStatus]}`);
                } else {
                  //
                  if (typeof _errorCallback === "function")
                    _errorCallback(
                      `${resStatus} - ${errorStatuses[resStatus]}`
                    );
                }
              }
            })
            .catch((err) => {
              if (!_successCallback) {
                // Promise
                reject(err.message);
              } else {
                //
                if (typeof _errorCallback === "function")
                  _errorCallback(err.message);
              }
            });

          break;
      }
    }); // end of the Promise

    // return new Promise((resolve, reject) => {
    //
    // });
  }

  serialize(obj, prefix) {
    var str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
        str.push(
          v !== null && typeof v === "object"
            ? this.serialize(v, k)
            : encodeURIComponent(k) + "=" + encodeURIComponent(v)
        );
      }
    }
    return str.join("&");
  }
};

module.exports = Api;
