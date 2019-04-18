import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import React from 'react';
import { useTranslation } from './useTranslation';
export function withTranslation(ns) {
  return function Extend(WrappedComponent) {
    function I18nextWithTranslation(props) {
      var _useTranslation = useTranslation(ns, props),
          _useTranslation2 = _slicedToArray(_useTranslation, 3),
          t = _useTranslation2[0],
          i18n = _useTranslation2[1],
          ready = _useTranslation2[2];

      return React.createElement(WrappedComponent, _objectSpread({}, props, {
        t: t,
        i18n: i18n,
        tReady: ready
      }));
    }

    return I18nextWithTranslation;
  };
}