import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _typeof from "@babel/runtime/helpers/typeof";
import React, { useContext } from 'react';
import HTML from 'html-parse-stringify2';
import { getI18n, getHasUsedI18nextProvider, I18nContext } from './context';
import { warn, warnOnce } from './utils';

function hasChildren(node) {
  return node && (node.children || node.props && node.props.children);
}

function getChildren(node) {
  return node && node.children ? node.children : node.props && node.props.children;
}

function nodesToString(mem, children, index) {
  if (!children) return '';
  if (Object.prototype.toString.call(children) !== '[object Array]') children = [children];
  children.forEach(function (child, i) {
    // const isElement = React.isValidElement(child);
    // const elementKey = `${index !== 0 ? index + '-' : ''}${i}:${typeof child.type === 'function' ? child.type.name : child.type || 'var'}`;
    var elementKey = "".concat(i);

    if (typeof child === 'string') {
      mem = "".concat(mem).concat(child);
    } else if (hasChildren(child)) {
      mem = "".concat(mem, "<").concat(elementKey, ">").concat(nodesToString('', getChildren(child), i + 1), "</").concat(elementKey, ">");
    } else if (React.isValidElement(child)) {
      mem = "".concat(mem, "<").concat(elementKey, "></").concat(elementKey, ">");
    } else if (_typeof(child) === 'object') {
      var clone = _objectSpread({}, child);

      var format = clone.format;
      delete clone.format;
      var keys = Object.keys(clone);

      if (format && keys.length === 1) {
        mem = "".concat(mem, "{{").concat(keys[0], ", ").concat(format, "}}");
      } else if (keys.length === 1) {
        mem = "".concat(mem, "{{").concat(keys[0], "}}");
      } else {
        // not a valid interpolation object (can only contain one value plus format)
        warn("react-i18next: the passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.", child);
      }
    } else {
      warn("Trans: the passed in value is invalid - seems you passed in a variable like {number} - please pass in variables for interpolation as full objects like {{number}}.", child);
    }
  });
  return mem;
}

function renderNodes(children, targetString, i18n) {
  if (targetString === '') return [];
  if (!children) return [targetString]; // v2 -> interpolates upfront no need for "some <0>{{var}}</0>"" -> will be just "some {{var}}" in translation file

  var data = {};

  function getData(childs) {
    if (Object.prototype.toString.call(childs) !== '[object Array]') childs = [childs];
    childs.forEach(function (child) {
      if (typeof child === 'string') return;
      if (hasChildren(child)) getData(getChildren(child));else if (_typeof(child) === 'object' && !React.isValidElement(child)) Object.assign(data, child);
    });
  }

  getData(children);
  targetString = i18n.services.interpolator.interpolate(targetString, data, i18n.language); // parse ast from string with additional wrapper tag
  // -> avoids issues in parser removing prepending text nodes

  var ast = HTML.parse("<0>".concat(targetString, "</0>"));

  function mapAST(reactNodes, astNodes) {
    if (Object.prototype.toString.call(reactNodes) !== '[object Array]') reactNodes = [reactNodes];
    if (Object.prototype.toString.call(astNodes) !== '[object Array]') astNodes = [astNodes];
    return astNodes.reduce(function (mem, node, i) {
      if (node.type === 'tag') {
        var child = reactNodes[parseInt(node.name, 10)] || {};
        var isElement = React.isValidElement(child);

        if (typeof child === 'string') {
          mem.push(child);
        } else if (hasChildren(child)) {
          var inner = mapAST(getChildren(child), node.children);
          if (child.dummy) child.children = inner; // needed on preact!

          mem.push(React.cloneElement(child, _objectSpread({}, child.props, {
            key: i
          }), inner));
        } else if (_typeof(child) === 'object' && !isElement) {
          var content = node.children[0] ? node.children[0].content : null; // v1
          // as interpolation was done already we just have a regular content node
          // in the translation AST while having an object in reactNodes
          // -> push the content no need to interpolate again

          if (content) mem.push(content);
        } else {
          mem.push(child);
        }
      } else if (node.type === 'text') {
        mem.push(node.content);
      }

      return mem;
    }, []);
  } // call mapAST with having react nodes nested into additional node like
  // we did for the string ast from translation
  // return the children of that extra node to get expected result


  var result = mapAST([{
    dummy: true,
    children: children
  }], ast);
  return getChildren(result[0]);
}

export function Trans(_ref) {
  var children = _ref.children,
      count = _ref.count,
      parent = _ref.parent,
      i18nKey = _ref.i18nKey,
      tOptions = _ref.tOptions,
      values = _ref.values,
      defaults = _ref.defaults,
      components = _ref.components,
      ns = _ref.ns,
      i18nFromProps = _ref.i18n,
      tFromProps = _ref.t,
      additionalProps = _objectWithoutProperties(_ref, ["children", "count", "parent", "i18nKey", "tOptions", "values", "defaults", "components", "ns", "i18n", "t"]);

  var _ref2 = getHasUsedI18nextProvider() ? useContext(I18nContext) : {},
      i18nFromContext = _ref2.i18n;

  var i18n = i18nFromProps || i18nFromContext || getI18n();

  if (!i18n) {
    warnOnce('You will need pass in an i18next instance by using i18nextReactModule');
    return children;
  }

  var t = tFromProps || i18n.t.bind(i18n);
  var reactI18nextOptions = i18n.options && i18n.options.react || {};
  var useAsParent = parent !== undefined ? parent : reactI18nextOptions.defaultTransParent;
  var contents = components || children; // Replace any component values with <n></n> placeholders
  // e.g. { br: <br/> } => <0></0>

  if (values) {
    contents = contents ? contents instanceof Array ? contents.slice(0) : [contents] : [];
    Object.keys(values).forEach(function (valueKey) {
      var _value = values[valueKey];
      var isElement = React.isValidElement(_value);

      if (isElement) {
        var valueIndex = contents.length;
        var clonedElement = React.cloneElement(_value, _objectSpread({}, _value.props, {
          key: valueIndex
        }), _value.children);
        contents.push(clonedElement);
        values[valueKey] = "<".concat(valueIndex, "></").concat(valueIndex, ">");
      }
    });
  }

  var defaultValue = defaults || nodesToString('', children, 0) || reactI18nextOptions.transEmptyNodeValue;
  var hashTransKey = reactI18nextOptions.hashTransKey;
  var key = i18nKey || (hashTransKey ? hashTransKey(defaultValue) : defaultValue);
  var interpolationOverride = values ? {} : {
    interpolation: {
      prefix: '#$?',
      suffix: '?$#'
    }
  };
  var translation = key ? t(key, _objectSpread({}, tOptions, values, interpolationOverride, {
    defaultValue: defaultValue,
    count: count,
    ns: ns
  })) : defaultValue;
  if (!useAsParent) return renderNodes(contents, translation, i18n);
  return React.createElement(useAsParent, additionalProps, renderNodes(contents, translation, i18n));
}