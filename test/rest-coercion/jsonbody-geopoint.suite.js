// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-remoting
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var jsonBodyContext = require('./_jsonbody.context');

module.exports = function(ctx) {
  ctx = jsonBodyContext(ctx);
  var ERROR_BAD_REQUEST = ctx.ERROR_BAD_REQUEST;
  var verifyTestCases = ctx.verifyTestCases;

  describe('json body - geopoint - required', function() {
    // See verifyTestCases' jsdoc for details about the format of test cases.
    verifyTestCases({ arg: 'anyname', type: 'geopoint', required: true }, [
      // valid values
      [{ lat: 2.5, lng: 3.2 }],
      [[2.5, 3.2]], // Arrays are allowed

      // Empty values trigger ERROR_BAD_REQUEST
      [null, ERROR_BAD_REQUEST],
      [undefined, ERROR_BAD_REQUEST],
      [{}, ERROR_BAD_REQUEST],
      [[], ERROR_BAD_REQUEST],
    ]);
  });

  describe('json body - geopoint - optional', function() {
    // See verifyTestCases' jsdoc for details about the format of test cases.
    verifyTestCases({ arg: 'anyname', type: 'geopoint' }, [
      // Empty values
      [null, null],
      [{}, {}],
      [[], {}],

      // Valid values
      [{ lat: 0, lng: 3.2 }],
      [{ lat: -1, lng: 3.2 }],
      [{ lat: 1, lng: 3.2 }],
      [{ lat: 2.5, lng: 0 }],
      [{ lat: 2.5, lng: -1 }],

      // Scientific notation works
      [{lat: 1.234e+1, lng: -1.234e+1 }],

      // Missing values trigger ERROR_BAD_REQUEST
      [{ lat: 2.5 }, ERROR_BAD_REQUEST],
      [{ lng: 3.2 }, ERROR_BAD_REQUEST],
      [[2.5], ERROR_BAD_REQUEST],

      // Invalid values trigger ERROR_BAD_REQUEST
      [{ lat: null, lng: 3.2 }, ERROR_BAD_REQUEST],
      [{ lat: 2.5, lng: null }, ERROR_BAD_REQUEST],
      [{ lat: undefined, lng: 3.2 }, ERROR_BAD_REQUEST],
      [{ lat: NaN, lng: 3.2 }, ERROR_BAD_REQUEST],

      // Latitude beyond range: -90 to 90 triggers ERROR_BAD_REQUEST
      [{ lat: -91, lng: 3.2 }, ERROR_BAD_REQUEST],
      [{ lat: 90.521, lng: 3.2 }, ERROR_BAD_REQUEST],

      // Longitude beyond range: -180 to 180 triggers ERROR_BAD_REQUEST
      [{ lat: 2.5, lng: -181 }, ERROR_BAD_REQUEST],
      [{ lat: 2.5, lng: 180.45 }, ERROR_BAD_REQUEST],

      // String is not supported
      [{ lat: 'text', lng: 3.2 }, ERROR_BAD_REQUEST],
      [{ lat: 2.5, lng: 'text' }, ERROR_BAD_REQUEST],
      [{ lat: '', lng: 3.2 }, ERROR_BAD_REQUEST],
      // Strings mimicking scientific notation
      [{ lat: '1.234e+1', lng: 3.2 }, ERROR_BAD_REQUEST],

      // boolean is not supported
      [{ lat: true, lng: 3.2 }, ERROR_BAD_REQUEST],
      [{ lat: -9.5, lng: false }, ERROR_BAD_REQUEST],

      // Array with more than two elements is not allowed
      [[2,3,5], ERROR_BAD_REQUEST],
      // Array of objects is not allowed
      [[{}, {}], ERROR_BAD_REQUEST],
    ]);
  });
};