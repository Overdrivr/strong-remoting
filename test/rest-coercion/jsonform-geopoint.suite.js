// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-remoting
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var jsonFormContext = require('./_jsonform.context');

module.exports = function(ctx) {
  ctx = jsonFormContext(ctx);
  var EMPTY_BODY = ctx.EMPTY_BODY;
  var ERROR_BAD_REQUEST = ctx.ERROR_BAD_REQUEST;
  var verifyTestCases = ctx.verifyTestCases;

  describe('json form - geopoint - required', function() {
    // See verifyTestCases' jsdoc for details about the format of test cases.
    verifyTestCases({ arg: 'arg', type: 'geopoint', required: true }, [
      // Valid values
      [{ arg: { lat: 2.5, lng: 3.2 }}, { lat: 2.5, lng: 3.2 }],
      [{ arg: [2.5, 3.2] }, { lat: 2.5, lng: 3.2 }],

      // Empty values trigger ERROR_BAD_REQUEST
      [EMPTY_BODY, ERROR_BAD_REQUEST],
      [{ arg: null }, ERROR_BAD_REQUEST],
      [{ arg: '' }, ERROR_BAD_REQUEST],
      [{ arg: {}}, ERROR_BAD_REQUEST],
      [{ arg: [] }, ERROR_BAD_REQUEST],
    ]);
  });

  describe('json form - geopoint - optional', function() {
    // See verifyTestCases' jsdoc for details about the format of test cases.
    verifyTestCases({ arg: 'arg', type: 'geopoint' }, [
      // Empty values
      [EMPTY_BODY, undefined],
      [{ arg: null }, null],
      [{ arg: {}}, {}],
      [{ arg: [] }, {}],

      // Valid values
      [{ arg: { lat: 0, lng: 3.2 }}, { lat: 0, lng: 3.2 }],
      [{ arg: { lat: -1, lng: 3.2 }}, { lat: -1, lng: 3.2 }],
      [{ arg: { lat: 1, lng: 3.2 }}, { lat: 1, lng: 3.2 }],
      [{ arg: { lat: 2.5, lng: 0 }}, { lat: 2.5, lng: 0 }],
      [{ arg: { lat: 2.5, lng: -1 }}, { lat: 2.5, lng: -1 }],
      // Scientific notation works
      [{ arg: { lat: 1.234e+1, lng: -1.234e+1 }}, { lat: 1.234e+1, lng: -1.234e+1 }],

      // Missing values trigger ERROR_BAD_REQUEST
      [{ arg: { lat: 2.5 }}, ERROR_BAD_REQUEST],
      [{ arg: { lng: 3.2 }}, ERROR_BAD_REQUEST],
      [{ arg: [2.5] }, ERROR_BAD_REQUEST],

      // Invalid values trigger ERROR_BAD_REQUEST
      [{ arg: { lat: null, lng: 3.2 }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: 2.5, lng: null }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: undefined, lng: 3.2 }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: NaN, lng: 3.2 }}, ERROR_BAD_REQUEST],

      // Latitude beyond range: -90 to 90 triggers ERROR_BAD_REQUEST
      [{ arg: { lat: -91, lng: 3.2 }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: 90.521, lng: 3.2 }}, ERROR_BAD_REQUEST],

      // Longitude beyond range: -180 to 180 triggers ERROR_BAD_REQUEST
      [{ arg: { lat: 2.5, lng: -181 }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: 2.5, lng: 180.45 }}, ERROR_BAD_REQUEST],

      // String is not supported
      [{ arg: { lat: 'text', lng: 3.2 }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: 2.5, lng: 'text' }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: '', lng: 3.2 }}, ERROR_BAD_REQUEST],
      // Strings mimicking scientific notation
      [{ arg: { lat: '1.234e+1', lng: 3.2 }}, ERROR_BAD_REQUEST],

      // boolean is not supported
      [{ arg: { lat: true, lng: 3.2 }}, ERROR_BAD_REQUEST],
      [{ arg: { lat: -9.5, lng: false }}, ERROR_BAD_REQUEST],

      // Array with more than two elements is not allowed
      [{ arg: [2, 3, 5] }, ERROR_BAD_REQUEST],
      // Array of objects is not allowed
      [{ arg: [{}, {}] }, ERROR_BAD_REQUEST],

    ]);
  });
};
