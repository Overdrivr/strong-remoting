// Copyright IBM Corp. 2013,2014. All Rights Reserved.
// Node module: strong-remoting
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var g = require('strong-globalize')();
/**
 * Expose `SocketIOContext`.
 */
module.exports = SocketIOContext;

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('strong-remoting:socket-io-context');
var util = require('util');
var inherits = util.inherits;
var assert = require('assert');


/**
 * Create a new `SocketIOContext` with the given `options`.
 *
 * @param {Object} options
 * @return {SocketIOContext}
 */

function SocketIOContext(req, ctorArgs, args) {
  this.req = req;
  this.ctorArgs = ctorArgs;
  this.args = args;
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(SocketIOContext, EventEmitter);

/**
 * Get an arg by name using the given options.
 *
 * @param {String} name
 * @param {Object} options **optional**
 */

SocketIOContext.prototype.getArgByName = function(name, options) {
  return this.args[name];
};

/**
 * Set an arg by name using the given options.
 *
 * @param {String} name
 * @param {Object} options **optional**
 */

SocketIOContext.prototype.setArgByName = function(name, options) {
  throw 'not implemented';
};

/**
 * Set part or all of the result by name using the given options.
 *
 * @param {String} name
 * @param {Object} options **optional**
 */

SocketIOContext.prototype.setResultByName = function(name, options) {

};

/**
 * Get part or all of the result by name using the given options.
 *
 * @param {String} name
 * @param {Object} options **optional**
 */

SocketIOContext.prototype.getResultByName = function(name, options) {

};

/**
 * Invoke the given shared method using the provided scope against
 * the current context.
 */

SocketIOContext.prototype.invoke = function(scope, method, fn) {
  var args = method.isSharedCtor ? this.ctorArgs : this.args;
  var accepts = method.accepts;
  var returns = method.returns;
  var errors = method.errors;
  var result;

  // invoke the shared method
  method.invoke(scope, args, function(err) {
    var resultArgs = arguments;

    if (method.name === 'on' && method.ctor instanceof EventEmitter) {
      resultArgs[1] = resultArgs[0];
      err = null;
    }

    if (err) {
      return fn(err);
    }

    // map the arguments using the returns description
    if (returns.length > 1) {
      // multiple
      result = {};

      returns.forEach(function(o, i) {
        // map the name of the arg in the returns desc
        // to the same arg in the callback
        result[o.name || o.arg] = resultArgs[i + 1];
      });
    } else {
      // single or no result...
      result = resultArgs[1];
    }

    fn(null, result);
  });
};
