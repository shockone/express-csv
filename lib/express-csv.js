/*!
 * express-csv
 * Copyright 2011 Seiya Konno <nulltask@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , express = require('express')
  , res = express.response || http.ServerResponse.prototype;

/**
 * Import package information.
 */

var package = require('../package');

/**
 * Library version.
 */

exports.version = package.version;

/**
 * CSV separator
 */

exports.separator = ',';

/**
 * CSV record separator
 */

exports.recordSeparator = '\r\n';

/**
 * Prevent Excel's casting.
 */

exports.preventCast = false;

/**
 * Ignore `null` or `undefined`
 */

exports.ignoreNullOrUndefined = true;

/**
 * Escape CSV field
 *
 * @param {Mixed} field
 * @return {String}
 * @api private
 */

function escape(field) {
  if (exports.ignoreNullOrUndefined && field == undefined) {
    return '';
  }
  if (exports.preventCast) {
    return '="' + String(field).replace(/\"/g, '""') + '"';
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

/**
 * Convert an object to an array of property values.
 *
 * Example:
 *    objToArray({ name: "john", id: 1 })
 *    // => [ "john", 1 ]
 *
 * @param {Object} obj The object to convert.
 * @return {Array} The array of object properties.
 * @api private
 */

function objToArray(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(obj[prop]);
    }
  }
  return result;
}

/**
 * Generate the CSV header.
 *
 * @param {Object} obj
 * @returns {String}
 */

function generateCSVHeader(obj) {
  var firstRecord = obj[0];
  if (firstRecord == null || typeof firstRecord !== 'object') return false;

  var headers = [];

  for (var prop in firstRecord) {
    if (firstRecord.hasOwnProperty(prop)) {
      headers.push(prop);
    }
  }

  return formatRecord(headers);
}

/**
 * Convert an array of fields to a CSV record.
 *
 * @param {Array} fields
 * @returns {String}
 */

function formatRecord(fields) {
  if (!fields) return '';

  return fields.map(escape).join(exports.separator) + exports.recordSeparator;
}

/**
 * Send CSV response with `obj`, optional `headers`, and optional `status`.
 * 
 * @param {Array} obj
 * @param {Object|Number} headers or status
 * @param {Number} status
 * @param {Boolean} includeCSVHeader
 * @return {ServerResponse}
 * @api public
 */

res.csv = function(obj, headers, status, includeCSVHeader) {
  var file = '';

  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');

  if (includeCSVHeader) file += generateCSVHeader(obj);

  obj.forEach(function(record) {
    if (!(record instanceof Array)) record = objToArray(record);
    file += formatRecord(record);
  });

  return this.send(file, headers, status);
};