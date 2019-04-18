import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import React from 'react';
import { useSSR } from './useSSR';
import { composeInitialProps } from './context';
export function withSSR() {
  return function Extend(WrappedComponent) {
    function I18nextWithSSR(_ref) {
      var initialI18nStore = _ref.initialI18nStore,
          initialLanguage = _ref.initialLanguage,
          rest = _objectWithoutProperties(_ref, ["initialI18nStore", "initialLanguage"]);

      useSSR(initialI18nStore, initialLanguage);
      return React.createElement(WrappedComponent, _objectSpread({}, rest));
    }

    I18nextWithSSR.getInitialProps = composeInitialProps(WrappedComponent);
    return I18nextWithSSR;
  };
}