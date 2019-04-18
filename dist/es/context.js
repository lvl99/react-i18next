import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import React from 'react';
var defaultOptions = {
  bindI18n: 'languageChanged',
  bindI18nStore: '',
  transEmptyNodeValue: '',
  useSuspense: true
};
var i18nInstance;
var hasUsedI18nextProvider;
export var I18nContext = React.createContext();
export function usedI18nextProvider(used) {
  hasUsedI18nextProvider = used;
}
export function getHasUsedI18nextProvider() {
  return hasUsedI18nextProvider;
}
export function setDefaults() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  defaultOptions = _objectSpread({}, defaultOptions, options);
}
export function getDefaults() {
  return defaultOptions;
}
export var ReportNamespaces =
/*#__PURE__*/
function () {
  function ReportNamespaces() {
    _classCallCheck(this, ReportNamespaces);

    this.usedNamespaces = {};
  }

  _createClass(ReportNamespaces, [{
    key: "addUsedNamespaces",
    value: function addUsedNamespaces(namespaces) {
      var _this = this;

      namespaces.forEach(function (ns) {
        if (!_this.usedNamespaces[ns]) _this.usedNamespaces[ns] = true;
      });
    }
  }, {
    key: "getUsedNamespaces",
    value: function getUsedNamespaces() {
      return Object.keys(this.usedNamespaces);
    }
  }]);

  return ReportNamespaces;
}();
export function setI18n(instance) {
  i18nInstance = instance;
}
export function getI18n() {
  return i18nInstance;
}
export var initReactI18next = {
  type: '3rdParty',
  init: function init(instance) {
    setDefaults(instance.options.react);
    setI18n(instance);
  }
};
export function composeInitialProps(ForComponent) {
  return function (ctx) {
    return new Promise(function (resolve) {
      var i18nInitialProps = getInitialProps();

      if (ForComponent.getInitialProps) {
        ForComponent.getInitialProps(ctx).then(function (componentsInitialProps) {
          resolve(_objectSpread({}, componentsInitialProps, i18nInitialProps));
        });
      } else {
        resolve(i18nInitialProps);
      }
    });
  }; // Avoid async for now - so we do not need to pull in regenerator
  // return async ctx => {
  //   const componentsInitialProps = ForComponent.getInitialProps
  //     ? await ForComponent.getInitialProps(ctx)
  //     : {};
  //   const i18nInitialProps = getInitialProps();
  //   return {
  //     ...componentsInitialProps,
  //     ...i18nInitialProps,
  //   };
  // };
}
export function getInitialProps() {
  var i18n = getI18n();
  var namespaces = i18n.reportNamespaces ? i18n.reportNamespaces.getUsedNamespaces() : [];
  var ret = {};
  var initialI18nStore = {};
  i18n.languages.forEach(function (l) {
    initialI18nStore[l] = {};
    namespaces.forEach(function (ns) {
      initialI18nStore[l][ns] = i18n.getResourceBundle(l, ns) || {};
    });
  });
  ret.initialI18nStore = initialI18nStore;
  ret.initialLanguage = i18n.language;
  return ret;
}