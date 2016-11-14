// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-remoting
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var debug = require('debug')('strong-remoting:http-coercion');
var g = require('strong-globalize')();
var looksLikeJson = require('../looks-like-json').looksLikeJson;
//var looksLikeJsonObject = looksLikeJson.looksLikeJsonObject;
//var looksLikeJsonArray = looksLikeJson.looksLikeJsonArray;
var numberConverter = require('./number');

var LAT_MAX = 90;
var LAT_MIN = -90;
var LNG_MAX = 180;
var LNG_MIN = -180;
var IS_COMMA_DELIMATED_REGEX = /,\s*/;

module.exports = {
  fromTypedValue: function(ctx, value, options) {
    var error = this.validate(ctx, value, options);
    return error ? { error: error } : { value: value };
  },

  fromSloppyValue: function(ctx, value, options) {
    console.log('\nvalue: %j, ----> type: %s', value, typeof value);

    if (value === undefined || value === '') {
      // undefined was chosen so that it plays well with ES6 default parameters.
      return { value: undefined };
    }

    if (value === null || value === 'null')
      return { value: null };

    if (looksLikeJson(value)) {
      var result = parseJson(value);
      if (result instanceof Error) return { error: result }
      return this.fromTypedValue(ctx, result, options);
    }

    // Coerce nested values for Object created from complex
    // query string, e.g. ?arg[lat]=2&arg[lng]=3
    if (typeof value === 'object') {
      return coerceObject.call(this, ctx, value, options);
    }
    return this.fromTypedValue(ctx, value, options);
  },

  validate: function(ctx, value, options) {
    var options = options || {};

    if (value === undefined || value === null) {
      return null;
    }
    // "lat,lng" format
    if (isCommaSeperatedString(value)) {
      var valArray = value.split(IS_COMMA_DELIMATED_REGEX);
      var error = validateArray(ctx, valArray, options);
      if (error) return errorInvalidStringFormat();
      return null;
    }
    // [lat,lng] format
    if (Array.isArray(value)) {
      return validateArray(ctx, value, options);
    }
    // {lat:x.x, lng:x.x} format
    if (typeof value === 'object') {
      return validateObject(value);
    }
    return null;
  }
};

function isCommaSeperatedString(value) {
  return typeof value === 'string' && IS_COMMA_DELIMATED_REGEX.test(value);
}

function parseJson(value) {
  try {
    var result = JSON.parse(value);
    debug('parsed %j as JSON: %j', value, result);
    return result;
  } catch (ex) {
    debug('Cannot parse object value %j. %s', value, ex);
    var err = new Error(g.f('Cannot parse JSON-encoded object value.'));
    err.statusCode = 400;
    return err;
  }
}

function validateArray(ctx, value, options) {
  if (value.length !== 2) {
    return errorInvalidLengthArray();
  }
  // validate lat value
  var latErr = validatePointVal(ctx, value[0], options, 'lat');
  // validate lng value
  var lngErr = validatePointVal(ctx, value[1], options, 'lng');
  if (latErr || lngErr) return latErr || lngErr;
  return null;
}

function coerceObject(ctx, obj, options) {
  var result = {};
  for (var key in obj) {
    var val = obj[key];
    // We want to coerce number in string format only
    if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
      result[key] = val;
      continue;
    }
    result[key] = isNaN(val) ? val : +val;
  }
  return this.fromTypedValue(ctx, result, options);
}

function validateObject(ctx, value, options) {
  if (!value.hasOwnProperty('lat'))
    return errorMissingKey('lat');

  if (!value.hasOwnProperty('lng'))
    return errorMissingKey('lng');

  // check lat
  var latErr = validatePointVal(ctx, value.lat, options, 'lat');
  // check lng
  var lngErr = validatePointVal(ctx, value.lng, options, 'lng');
  if (latErr || lngErr) return latErr || lngErr;
  return null;
}

function errorInvalidStringFormat() {
  var err = new Error(g.f('Value is not of correct "lat,lng" format'));
  err.statusCode = 400;
  return err;
}

function errorInvalidLengthArray() {
  var err = new Error(g.f('Value is not of correct [lat,lng] format'));
  err.statusCode = 400;
  return err;
}

function errorMissingKey(key) {
  var err = new Error(g.f('Missing "%s" from geopoint object', key));
  err.statusCode = 400;
  return err;
}

function validatePointVal(ctx, value, options, key) {x
  var err = numberConverter.validate(ctx, value, options);
  if (err)
    return err;
  switch (key) {
    case 'lat':
      if (!(LAT_MIN <= value && value >= LAT_MAX))
        return errorValueOutOfRange(key, value);
      break;
    case 'lng':
      if (!(LNG_MIN <= value && value >= LNG_MAX))
        return errorValueOutOfRange(key, value);
      break;
    default:
      return null;
  }
}

function errorInvalidGeoPointObj() {
  var err = new Error(g.f('failed')); //fix me
  err.statusCode = 400;
  return err;
}

function errorValueOutOfRange() {
  return errorInvalidGeoPointObj();
}
