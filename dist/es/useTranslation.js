import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import { useState, useEffect, useContext } from 'react';
import { getI18n, getDefaults, ReportNamespaces, getHasUsedI18nextProvider, I18nContext } from './context';
import { warnOnce, loadNamespaces, hasLoadedNamespace } from './utils';
export function useTranslation(ns) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // assert we have the needed i18nInstance
  var i18nFromProps = props.i18n;

  var _ref = getHasUsedI18nextProvider() ? useContext(I18nContext) : {},
      i18nFromContext = _ref.i18n;

  var i18n = i18nFromProps || i18nFromContext || getI18n();
  if (i18n && !i18n.reportNamespaces) i18n.reportNamespaces = new ReportNamespaces();

  if (!i18n) {
    warnOnce('You will need pass in an i18next instance by using i18nextReactModule');
    var retNotReady = [function (k) {
      return k;
    }, {}, true];

    retNotReady.t = function (k) {
      return k;
    };

    retNotReady.i18n = {};
    retNotReady.ready = true;
    return retNotReady;
  }

  var i18nOptions = _objectSpread({}, getDefaults(), i18n.options.react); // prepare having a namespace


  var namespaces = ns || i18n.options && i18n.options.defaultNS;
  namespaces = typeof namespaces === 'string' ? [namespaces] : namespaces || ['translation']; // report namespaces as used

  if (i18n.reportNamespaces.addUsedNamespaces) i18n.reportNamespaces.addUsedNamespaces(namespaces); // are we ready? yes if all namespaces in first language are loaded already (either with data or empty objedt on failed load)

  var ready = (i18n.isInitialized || i18n.initializedStoreOnce) && namespaces.every(function (n) {
    return hasLoadedNamespace(n, i18n);
  }); // set states

  var _useState = useState({
    t: i18n.getFixedT(null, namespaces[0])
  }),
      _useState2 = _slicedToArray(_useState, 2),
      t = _useState2[0],
      setT = _useState2[1]; // seems we can't have functions as value -> wrap it in obj


  function resetT() {
    setT({
      t: i18n.getFixedT(null, namespaces[0])
    });
  }

  useEffect(function () {
    var bindI18n = i18nOptions.bindI18n,
        bindI18nStore = i18nOptions.bindI18nStore; // bind events to trigger change, like languageChanged

    if (bindI18n && i18n) i18n.on(bindI18n, resetT);
    if (bindI18nStore && i18n) i18n.store.on(bindI18nStore, resetT); // unbinding

    return function () {
      if (bindI18n && i18n) bindI18n.split(' ').forEach(function (e) {
        return i18n.off(e, resetT);
      });
      if (bindI18nStore && i18n) bindI18nStore.split(' ').forEach(function (e) {
        return i18n.store.off(e, resetT);
      });
    };
  });
  var ret = [t.t, i18n, ready];
  ret.t = t.t;
  ret.i18n = i18n;
  ret.ready = ready; // return hook stuff if ready

  if (ready) return ret; // not yet loaded namespaces -> load them -> and return if useSuspense option set false

  var _props$useSuspense = props.useSuspense,
      useSuspense = _props$useSuspense === void 0 ? i18nOptions.useSuspense : _props$useSuspense;

  if (!ready && !useSuspense) {
    loadNamespaces(i18n, namespaces, function () {
      resetT();
    });
    return ret;
  } // not yet loaded namespaces -> load them -> and trigger suspense


  throw new Promise(function (resolve) {
    loadNamespaces(i18n, namespaces, function () {
      resetT();
      resolve();
    });
  });
}