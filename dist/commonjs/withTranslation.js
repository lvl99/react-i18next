"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withTranslation = withTranslation;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _useTranslation3 = require("./useTranslation");

function withTranslation(ns) {
  return function Extend(WrappedComponent) {
    function I18nextWithTranslation(props) {
      var _useTranslation = (0, _useTranslation3.useTranslation)(ns, props),
          _useTranslation2 = (0, _slicedToArray2["default"])(_useTranslation, 3),
          t = _useTranslation2[0],
          i18n = _useTranslation2[1],
          ready = _useTranslation2[2];

      return _react["default"].createElement(WrappedComponent, (0, _objectSpread2["default"])({}, props, {
        t: t,
        i18n: i18n,
        tReady: ready
      }));
    }

    return I18nextWithTranslation;
  };
}