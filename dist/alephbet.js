(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 * @license
 * lodash 3.9.3 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash include="keys,defaults" exports="node" -o ./lib/lodash.custom.js`
 */
;(function(){function t(t){return typeof t=="function"||false}function r(t){return typeof t=="string"?t:null==t?"":t+""}function n(t){return!!t&&typeof t=="object"}function e(){}function o(t,r){for(var n=-1,e=t.length;++n<e&&r(t[n],n,t)!==false;);return t}function u(t,r){return t===P?r:t}function c(t,r,n){for(var e=-1,o=xt(r),u=o.length;++e<u;){var c=o[e],l=t[c],i=n(l,r[c],c,t,r);(i===i?i===l:l!==l)&&(l!==P||c in t)||(t[c]=i)}return t}function l(t,r){return null==r?t:i(r,xt(r),t)}function i(t,r,n){n||(n={});
for(var e=-1,o=r.length;++e<o;){var u=r[e];n[u]=t[u]}return n}function a(t){return function(r){return null==r?P:j(r)[t]}}function f(t,r,n){if(typeof t!="function")return A;if(r===P)return t;switch(n){case 1:return function(n){return t.call(r,n)};case 3:return function(n,e,o){return t.call(r,n,e,o)};case 4:return function(n,e,o,u){return t.call(r,n,e,o,u)};case 5:return function(n,e,o,u,c){return t.call(r,n,e,o,u,c)}}return function(){return t.apply(r,arguments)}}function s(t){return m(function(r,n){
var e=-1,o=null==r?0:n.length,u=o>2?n[o-2]:P,c=o>2?n[2]:P,l=o>1?n[o-1]:P;for(typeof u=="function"?(u=f(u,l,5),o-=2):(u=typeof l=="function"?l:P,o-=u?1:0),c&&h(n[0],n[1],c)&&(u=o<3?P:u,o=1);++e<o;){var i=n[e];i&&t(r,i,u)}return r})}function p(t,r){var n=null==t?P:t[r];return x(n)?n:P}function y(t){return null!=t&&b(vt(t))}function g(t,r){return t=typeof t=="number"||q.test(t)?+t:-1,r=null==r?gt:r,t>-1&&t%1==0&&t<r}function h(t,r,n){if(!d(n))return false;var e=typeof r;if("number"==e?y(n)&&g(r,n.length):"string"==e&&r in n){
var o=n[r];return t===t?t===o:o!==o}return false}function b(t){return typeof t=="number"&&t>-1&&t%1==0&&t<=gt}function v(t){for(var r=E(t),n=r.length,e=n&&t.length,o=!!e&&b(e)&&(jt(t)||O(t)||w(t)),u=-1,c=[];++u<n;){var l=r[u];(o&&g(l,e)||ut.call(t,l))&&c.push(l)}return c}function j(t){if(e.support.unindexedChars&&w(t)){for(var r=-1,n=t.length,o=Object(t);++r<n;)o[r]=t.charAt(r);return o}return d(t)?t:Object(t)}function m(t,r){if(typeof t!="function")throw new TypeError(R);return r=yt(r===P?t.length-1:+r||0,0),
function(){for(var n=arguments,e=-1,o=yt(n.length-r,0),u=Array(o);++e<o;)u[e]=n[r+e];switch(r){case 0:return t.call(this,u);case 1:return t.call(this,n[0],u);case 2:return t.call(this,n[0],n[1],u)}var c=Array(r+1);for(e=-1;++e<r;)c[e]=n[e];return c[r]=u,t.apply(this,c)}}function O(t){return n(t)&&y(t)&&ct.call(t)==T}function d(t){var r=typeof t;return!!t&&("object"==r||"function"==r)}function x(t){return null==t?false:ct.call(t)==N?lt.test(ot.call(t)):n(t)&&(Z(t)?lt:_).test(t)}function w(t){return typeof t=="string"||n(t)&&ct.call(t)==M;
}function E(t){if(null==t)return[];d(t)||(t=Object(t));var r=t.length,n=e.support;r=r&&b(r)&&(jt(t)||O(t)||w(t))&&r||0;for(var o=t.constructor,u=-1,c=mt(o)&&o.prototype||nt,l=c===t,i=Array(r),a=r>0,f=n.enumErrorProps&&(t===rt||t instanceof Error),s=n.enumPrototypes&&mt(t);++u<r;)i[u]=u+"";for(var p in t)s&&"prototype"==p||f&&("message"==p||"name"==p)||a&&g(p,r)||"constructor"==p&&(l||!ut.call(t,p))||i.push(p);if(n.nonEnumShadows&&t!==nt){var y=t===et?M:t===rt?F:ct.call(t),h=ht[y]||ht[B];for(y==B&&(c=nt),
r=z.length;r--;){p=z[r];var v=h[p];l&&v||(v?!ut.call(t,p):t[p]===c[p])||i.push(p)}}return i}function S(t){return t=r(t),t&&V.test(t)?t.replace(U,"\\$&"):t}function A(t){return t}var P,$="3.9.3",R="Expected a function",T="[object Arguments]",I="[object Array]",k="[object Boolean]",C="[object Date]",F="[object Error]",N="[object Function]",L="[object Number]",B="[object Object]",D="[object RegExp]",M="[object String]",U=/[.*+?^${}()|[\]\/\\]/g,V=RegExp(U.source),_=/^\[object .+?Constructor\]$/,q=/^\d+$/,z=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],G={
"function":true,object:true},H=G[typeof exports]&&exports&&!exports.nodeType&&exports,J=G[typeof module]&&module&&!module.nodeType&&module,K=H&&J&&typeof global=="object"&&global&&global.Object&&global,Q=G[typeof self]&&self&&self.Object&&self,W=G[typeof window]&&window&&window.Object&&window,X=J&&J.exports===H&&H,Y=K||W!==(this&&this.window)&&W||Q||this,Z=function(){try{Object({toString:0}+"")}catch(t){return function(){return false}}return function(t){return typeof t.toString!="function"&&typeof(t+"")=="string";
}}(),tt=Array.prototype,rt=Error.prototype,nt=Object.prototype,et=String.prototype,ot=Function.prototype.toString,ut=nt.hasOwnProperty,ct=nt.toString,lt=RegExp("^"+S(ot.call(ut)).replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),it=nt.propertyIsEnumerable,at=tt.splice,ft=p(Y,"Uint8Array"),st=p(Array,"isArray"),pt=p(Object,"keys"),yt=Math.max,gt=9007199254740991,ht={};ht[I]=ht[C]=ht[L]={constructor:true,toLocaleString:true,toString:true,valueOf:true},ht[k]=ht[M]={constructor:true,
toString:true,valueOf:true},ht[F]=ht[N]=ht[D]={constructor:true,toString:true},ht[B]={constructor:true},o(z,function(t){for(var r in ht)if(ut.call(ht,r)){var n=ht[r];n[t]=ut.call(n,t)}});var bt=e.support={};!function(t){var r=function(){this.x=t},n={0:t,length:t},e=[];r.prototype={valueOf:t,y:t};for(var o in new r)e.push(o);bt.argsTag=ct.call(arguments)==T,bt.enumErrorProps=it.call(rt,"message")||it.call(rt,"name"),bt.enumPrototypes=it.call(r,"prototype"),bt.nonEnumShadows=!/valueOf/.test(e),bt.spliceObjects=(at.call(n,0,1),
!n[0]),bt.unindexedChars="x"[0]+Object("x")[0]!="xx"}(1,0);var vt=a("length");bt.argsTag||(O=function(t){return n(t)&&y(t)&&ut.call(t,"callee")&&!it.call(t,"callee")});var jt=st||function(t){return n(t)&&b(t.length)&&ct.call(t)==I},mt=t(/x/)||ft&&!t(ft)?function(t){return ct.call(t)==N}:t,Ot=s(function(t,r,n){return n?c(t,r,n):l(t,r)}),dt=m(function(t){var r=t[0];return null==r?r:(t.push(u),Ot.apply(P,t))}),xt=pt?function(t){var r=null==t?null:t.constructor;return typeof r=="function"&&r.prototype===t||(typeof t=="function"?e.support.enumPrototypes:y(t))?v(t):d(t)?pt(t):[];
}:v;e.assign=Ot,e.defaults=dt,e.keys=xt,e.keysIn=E,e.restParam=m,e.extend=Ot,e.escapeRegExp=S,e.identity=A,e.isArguments=O,e.isArray=jt,e.isFunction=mt,e.isNative=x,e.isObject=d,e.isString=w,e.VERSION=$,H&&J&&X&&((J.exports=e)._=e)}).call(this);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
/* Copyright (c) 2010-2013 Marcus Westin */
(function(e){function o(){try{return r in e&&e[r]}catch(t){return!1}}var t={},n=e.document,r="localStorage",i="script",s;t.disabled=!1,t.version="1.3.17",t.set=function(e,t){},t.get=function(e,t){},t.has=function(e){return t.get(e)!==undefined},t.remove=function(e){},t.clear=function(){},t.transact=function(e,n,r){r==null&&(r=n,n=null),n==null&&(n={});var i=t.get(e,n);r(i),t.set(e,i)},t.getAll=function(){},t.forEach=function(){},t.serialize=function(e){return JSON.stringify(e)},t.deserialize=function(e){if(typeof e!="string")return undefined;try{return JSON.parse(e)}catch(t){return e||undefined}};if(o())s=e[r],t.set=function(e,n){return n===undefined?t.remove(e):(s.setItem(e,t.serialize(n)),n)},t.get=function(e,n){var r=t.deserialize(s.getItem(e));return r===undefined?n:r},t.remove=function(e){s.removeItem(e)},t.clear=function(){s.clear()},t.getAll=function(){var e={};return t.forEach(function(t,n){e[t]=n}),e},t.forEach=function(e){for(var n=0;n<s.length;n++){var r=s.key(n);e(r,t.get(r))}};else if(n.documentElement.addBehavior){var u,a;try{a=new ActiveXObject("htmlfile"),a.open(),a.write("<"+i+">document.w=window</"+i+'><iframe src="/favicon.ico"></iframe>'),a.close(),u=a.w.frames[0].document,s=u.createElement("div")}catch(f){s=n.createElement("div"),u=n.body}var l=function(e){return function(){var n=Array.prototype.slice.call(arguments,0);n.unshift(s),u.appendChild(s),s.addBehavior("#default#userData"),s.load(r);var i=e.apply(t,n);return u.removeChild(s),i}},c=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g");function h(e){return e.replace(/^d/,"___$&").replace(c,"___")}t.set=l(function(e,n,i){return n=h(n),i===undefined?t.remove(n):(e.setAttribute(n,t.serialize(i)),e.save(r),i)}),t.get=l(function(e,n,r){n=h(n);var i=t.deserialize(e.getAttribute(n));return i===undefined?r:i}),t.remove=l(function(e,t){t=h(t),e.removeAttribute(t),e.save(r)}),t.clear=l(function(e){var t=e.XMLDocument.documentElement.attributes;e.load(r);for(var n=0,i;i=t[n];n++)e.removeAttribute(i.name);e.save(r)}),t.getAll=function(e){var n={};return t.forEach(function(e,t){n[e]=t}),n},t.forEach=l(function(e,n){var r=e.XMLDocument.documentElement.attributes;for(var i=0,s;s=r[i];++i)n(s.name,t.deserialize(e.getAttribute(s.name)))})}try{var p="__storejs__";t.set(p,p),t.get(p)!=p&&(t.disabled=!0),t.remove(p)}catch(f){t.disabled=!0}t.enabled=!t.disabled,typeof module!="undefined"&&module.exports&&this.module!==module?module.exports=t:typeof define=="function"&&define.amd?define(t):e.store=t})(Function("return this")())
},{}],3:[function(require,module,exports){
var Storage, store;

store = require('store');

Storage = (function() {
  function Storage(namespace) {
    this.namespace = namespace != null ? namespace : 'alephbet';
    if (!store.enabled) {
      throw 'local storage not supported';
    }
    this.storage = store.get(this.namespace) || {};
  }

  Storage.prototype.set = function(key, value) {
    this.storage[key] = value;
    store.set(this.namespace, this.storage);
    return value;
  };

  Storage.prototype.get = function(key) {
    return this.storage[key];
  };

  return Storage;

})();

module.exports = Storage;


},{"store":2}],4:[function(require,module,exports){
var Utils, _;

_ = require('lodash.custom');

Utils = (function() {
  function Utils() {}

  Utils.defaults = _.defaults;

  Utils.keys = _.keys;

  Utils.set_debug = function(debug) {
    this.debug = debug;
  };

  Utils.log = function(message) {
    if (this.debug) {
      return console.log(message);
    }
  };

  return Utils;

})();

module.exports = Utils;


},{"lodash.custom":1}],5:[function(require,module,exports){
var AlephBet, Storage, log, storage, utils;

utils = require('./utils.js.coffee');

Storage = require('./storage.js.coffee');

AlephBet = (function() {
  function AlephBet() {}

  AlephBet.options = {
    debug: false
  };

  AlephBet.GoogleUniversalAnalyticsAdapter = (function() {
    function GoogleUniversalAnalyticsAdapter() {}

    GoogleUniversalAnalyticsAdapter.namespace = 'alephbet';

    GoogleUniversalAnalyticsAdapter._track = function(category, action, label, value) {
      log("Google Universal Analytics track: " + category + ", " + action + ", " + label + ", " + value);
      if (typeof ga !== 'function') {
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
      }
      return ga('send', 'event', category, action, label, value);
    };

    GoogleUniversalAnalyticsAdapter.onInitialize = function(experiment_name, variant) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name, variant + " | Visitors");
    };

    GoogleUniversalAnalyticsAdapter.onEvent = function(experiment_name, variant, event_name) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name, variant + " | " + event_name);
    };

    return GoogleUniversalAnalyticsAdapter;

  })();

  AlephBet.Experiment = (function() {
    var _force_variant, _run, _validate;

    Experiment._options = {
      name: null,
      variants: null,
      sample: 1.0,
      trigger: function() {
        return true;
      },
      tracking_adapter: AlephBet.GoogleUniversalAnalyticsAdapter
    };

    function Experiment(options) {
      this.options = options != null ? options : {};
      utils.defaults(this.options, Experiment._options);
      _validate.call(this);
      this.variants = utils.keys(this.options.variants);
      _run.call(this);
    }

    Experiment.prototype.run = function() {
      log("running with options: " + this.options);
      _force_variant();
      return this.apply_variant();
    };

    _run = function() {
      return this.run();
    };

    _force_variant = function() {};

    Experiment.prototype.apply_variant = function() {
      var ref, variant;
      if (!this.options.trigger()) {
        return;
      }
      log('trigger set');
      if (!this.in_sample()) {
        return;
      }
      log('in sample');
      if (variant = this.get_stored_variant()) {
        log(variant + " active");
      } else {
        variant = this.pick_variant();
        this.options.tracking_adapter.onInitialize(this.options.name, variant);
      }
      return (ref = this.options.variants[variant]) != null ? ref.activate() : void 0;
    };

    Experiment.prototype.goal = function(goal_name, unique) {
      var variant;
      if (unique == null) {
        unique = true;
      }
      if (unique && storage.get(this.options.name + ":" + goal_name)) {
        return;
      }
      variant = this.get_stored_variant();
      if (!variant) {
        return;
      }
      if (unique) {
        storage.set(this.options.name + ":" + goal_name, true);
      }
      return this.options.tracking_adapter.onEvent(this.options.name, variant, goal_name);
    };

    Experiment.prototype.get_stored_variant = function() {
      return storage.get(this.options.name + ":variant");
    };

    Experiment.prototype.pick_variant = function() {
      var chosen_partition, partitions, variant;
      partitions = 1.0 / this.variants.length;
      chosen_partition = Math.floor(Math.random() / partitions);
      variant = this.variants[chosen_partition];
      log(variant + " picked");
      return storage.set(this.options.name + ":variant", variant);
    };

    Experiment.prototype.in_sample = function() {
      var active;
      active = storage.get(this.options.name + ":in_sample");
      if (typeof active !== 'undefined') {
        return active;
      }
      return storage.set(this.options.name + ":in_sample", Math.random() <= this.options.sample);
    };

    _validate = function() {
      if (this.options.name === null) {
        throw 'an experiment name must be specified';
      }
      if (this.options.variants === null) {
        throw 'variants must be provided';
      }
      if (typeof this.options.trigger !== 'function') {
        throw 'trigger must be a function';
      }
    };

    return Experiment;

  })();

  return AlephBet;

})();

log = function(message) {
  utils.set_debug(AlephBet.options.debug);
  return utils.log(message);
};

storage = new Storage('alephbet');

module.exports = AlephBet;


},{"./storage.js.coffee":3,"./utils.js.coffee":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvbG9kYXNoLmN1c3RvbS5taW4uanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUubWluLmpzIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3N0b3JhZ2UuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3V0aWxzLmpzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9hbGVwaGJldC5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hCQTtBQUNBOztBQ0RBLElBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUdGO0VBQ1MsaUJBQUMsU0FBRDtJQUFDLElBQUMsQ0FBQSxnQ0FBRCxZQUFXO0lBQ3ZCLElBQUEsQ0FBMkMsS0FBSyxDQUFDLE9BQWpEO0FBQUEsWUFBTSw4QkFBTjs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENB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QUEsT0FBQSxDQUFRLFVBQVI7O0FBRWQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAbGljZW5zZVxuICogbG9kYXNoIDMuOS4zIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0c1wiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9saWIvbG9kYXNoLmN1c3RvbS5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIHQodCl7cmV0dXJuIHR5cGVvZiB0PT1cImZ1bmN0aW9uXCJ8fGZhbHNlfWZ1bmN0aW9uIHIodCl7cmV0dXJuIHR5cGVvZiB0PT1cInN0cmluZ1wiP3Q6bnVsbD09dD9cIlwiOnQrXCJcIn1mdW5jdGlvbiBuKHQpe3JldHVybiEhdCYmdHlwZW9mIHQ9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gZSgpe31mdW5jdGlvbiBvKHQscil7Zm9yKHZhciBuPS0xLGU9dC5sZW5ndGg7KytuPGUmJnIodFtuXSxuLHQpIT09ZmFsc2U7KTtyZXR1cm4gdH1mdW5jdGlvbiB1KHQscil7cmV0dXJuIHQ9PT1QP3I6dH1mdW5jdGlvbiBjKHQscixuKXtmb3IodmFyIGU9LTEsbz14dChyKSx1PW8ubGVuZ3RoOysrZTx1Oyl7dmFyIGM9b1tlXSxsPXRbY10saT1uKGwscltjXSxjLHQscik7KGk9PT1pP2k9PT1sOmwhPT1sKSYmKGwhPT1QfHxjIGluIHQpfHwodFtjXT1pKX1yZXR1cm4gdH1mdW5jdGlvbiBsKHQscil7cmV0dXJuIG51bGw9PXI/dDppKHIseHQociksdCl9ZnVuY3Rpb24gaSh0LHIsbil7bnx8KG49e30pO1xuZm9yKHZhciBlPS0xLG89ci5sZW5ndGg7KytlPG87KXt2YXIgdT1yW2VdO25bdV09dFt1XX1yZXR1cm4gbn1mdW5jdGlvbiBhKHQpe3JldHVybiBmdW5jdGlvbihyKXtyZXR1cm4gbnVsbD09cj9QOmoocilbdF19fWZ1bmN0aW9uIGYodCxyLG4pe2lmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCIpcmV0dXJuIEE7aWYocj09PVApcmV0dXJuIHQ7c3dpdGNoKG4pe2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24obil7cmV0dXJuIHQuY2FsbChyLG4pfTtjYXNlIDM6cmV0dXJuIGZ1bmN0aW9uKG4sZSxvKXtyZXR1cm4gdC5jYWxsKHIsbixlLG8pfTtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKG4sZSxvLHUpe3JldHVybiB0LmNhbGwocixuLGUsbyx1KX07Y2FzZSA1OnJldHVybiBmdW5jdGlvbihuLGUsbyx1LGMpe3JldHVybiB0LmNhbGwocixuLGUsbyx1LGMpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdC5hcHBseShyLGFyZ3VtZW50cyl9fWZ1bmN0aW9uIHModCl7cmV0dXJuIG0oZnVuY3Rpb24ocixuKXtcbnZhciBlPS0xLG89bnVsbD09cj8wOm4ubGVuZ3RoLHU9bz4yP25bby0yXTpQLGM9bz4yP25bMl06UCxsPW8+MT9uW28tMV06UDtmb3IodHlwZW9mIHU9PVwiZnVuY3Rpb25cIj8odT1mKHUsbCw1KSxvLT0yKToodT10eXBlb2YgbD09XCJmdW5jdGlvblwiP2w6UCxvLT11PzE6MCksYyYmaChuWzBdLG5bMV0sYykmJih1PW88Mz9QOnUsbz0xKTsrK2U8bzspe3ZhciBpPW5bZV07aSYmdChyLGksdSl9cmV0dXJuIHJ9KX1mdW5jdGlvbiBwKHQscil7dmFyIG49bnVsbD09dD9QOnRbcl07cmV0dXJuIHgobik/bjpQfWZ1bmN0aW9uIHkodCl7cmV0dXJuIG51bGwhPXQmJmIodnQodCkpfWZ1bmN0aW9uIGcodCxyKXtyZXR1cm4gdD10eXBlb2YgdD09XCJudW1iZXJcInx8cS50ZXN0KHQpPyt0Oi0xLHI9bnVsbD09cj9ndDpyLHQ+LTEmJnQlMT09MCYmdDxyfWZ1bmN0aW9uIGgodCxyLG4pe2lmKCFkKG4pKXJldHVybiBmYWxzZTt2YXIgZT10eXBlb2YgcjtpZihcIm51bWJlclwiPT1lP3kobikmJmcocixuLmxlbmd0aCk6XCJzdHJpbmdcIj09ZSYmciBpbiBuKXtcbnZhciBvPW5bcl07cmV0dXJuIHQ9PT10P3Q9PT1vOm8hPT1vfXJldHVybiBmYWxzZX1mdW5jdGlvbiBiKHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmdD4tMSYmdCUxPT0wJiZ0PD1ndH1mdW5jdGlvbiB2KHQpe2Zvcih2YXIgcj1FKHQpLG49ci5sZW5ndGgsZT1uJiZ0Lmxlbmd0aCxvPSEhZSYmYihlKSYmKGp0KHQpfHxPKHQpfHx3KHQpKSx1PS0xLGM9W107Kyt1PG47KXt2YXIgbD1yW3VdOyhvJiZnKGwsZSl8fHV0LmNhbGwodCxsKSkmJmMucHVzaChsKX1yZXR1cm4gY31mdW5jdGlvbiBqKHQpe2lmKGUuc3VwcG9ydC51bmluZGV4ZWRDaGFycyYmdyh0KSl7Zm9yKHZhciByPS0xLG49dC5sZW5ndGgsbz1PYmplY3QodCk7KytyPG47KW9bcl09dC5jaGFyQXQocik7cmV0dXJuIG99cmV0dXJuIGQodCk/dDpPYmplY3QodCl9ZnVuY3Rpb24gbSh0LHIpe2lmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihSKTtyZXR1cm4gcj15dChyPT09UD90Lmxlbmd0aC0xOityfHwwLDApLFxuZnVuY3Rpb24oKXtmb3IodmFyIG49YXJndW1lbnRzLGU9LTEsbz15dChuLmxlbmd0aC1yLDApLHU9QXJyYXkobyk7KytlPG87KXVbZV09bltyK2VdO3N3aXRjaChyKXtjYXNlIDA6cmV0dXJuIHQuY2FsbCh0aGlzLHUpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKHRoaXMsblswXSx1KTtjYXNlIDI6cmV0dXJuIHQuY2FsbCh0aGlzLG5bMF0sblsxXSx1KX12YXIgYz1BcnJheShyKzEpO2ZvcihlPS0xOysrZTxyOyljW2VdPW5bZV07cmV0dXJuIGNbcl09dSx0LmFwcGx5KHRoaXMsYyl9fWZ1bmN0aW9uIE8odCl7cmV0dXJuIG4odCkmJnkodCkmJmN0LmNhbGwodCk9PVR9ZnVuY3Rpb24gZCh0KXt2YXIgcj10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1yfHxcImZ1bmN0aW9uXCI9PXIpfWZ1bmN0aW9uIHgodCl7cmV0dXJuIG51bGw9PXQ/ZmFsc2U6Y3QuY2FsbCh0KT09Tj9sdC50ZXN0KG90LmNhbGwodCkpOm4odCkmJihaKHQpP2x0Ol8pLnRlc3QodCl9ZnVuY3Rpb24gdyh0KXtyZXR1cm4gdHlwZW9mIHQ9PVwic3RyaW5nXCJ8fG4odCkmJmN0LmNhbGwodCk9PU07XG59ZnVuY3Rpb24gRSh0KXtpZihudWxsPT10KXJldHVybltdO2QodCl8fCh0PU9iamVjdCh0KSk7dmFyIHI9dC5sZW5ndGgsbj1lLnN1cHBvcnQ7cj1yJiZiKHIpJiYoanQodCl8fE8odCl8fHcodCkpJiZyfHwwO2Zvcih2YXIgbz10LmNvbnN0cnVjdG9yLHU9LTEsYz1tdChvKSYmby5wcm90b3R5cGV8fG50LGw9Yz09PXQsaT1BcnJheShyKSxhPXI+MCxmPW4uZW51bUVycm9yUHJvcHMmJih0PT09cnR8fHQgaW5zdGFuY2VvZiBFcnJvcikscz1uLmVudW1Qcm90b3R5cGVzJiZtdCh0KTsrK3U8cjspaVt1XT11K1wiXCI7Zm9yKHZhciBwIGluIHQpcyYmXCJwcm90b3R5cGVcIj09cHx8ZiYmKFwibWVzc2FnZVwiPT1wfHxcIm5hbWVcIj09cCl8fGEmJmcocCxyKXx8XCJjb25zdHJ1Y3RvclwiPT1wJiYobHx8IXV0LmNhbGwodCxwKSl8fGkucHVzaChwKTtpZihuLm5vbkVudW1TaGFkb3dzJiZ0IT09bnQpe3ZhciB5PXQ9PT1ldD9NOnQ9PT1ydD9GOmN0LmNhbGwodCksaD1odFt5XXx8aHRbQl07Zm9yKHk9PUImJihjPW50KSxcbnI9ei5sZW5ndGg7ci0tOyl7cD16W3JdO3ZhciB2PWhbcF07bCYmdnx8KHY/IXV0LmNhbGwodCxwKTp0W3BdPT09Y1twXSl8fGkucHVzaChwKX19cmV0dXJuIGl9ZnVuY3Rpb24gUyh0KXtyZXR1cm4gdD1yKHQpLHQmJlYudGVzdCh0KT90LnJlcGxhY2UoVSxcIlxcXFwkJlwiKTp0fWZ1bmN0aW9uIEEodCl7cmV0dXJuIHR9dmFyIFAsJD1cIjMuOS4zXCIsUj1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixUPVwiW29iamVjdCBBcmd1bWVudHNdXCIsST1cIltvYmplY3QgQXJyYXldXCIsaz1cIltvYmplY3QgQm9vbGVhbl1cIixDPVwiW29iamVjdCBEYXRlXVwiLEY9XCJbb2JqZWN0IEVycm9yXVwiLE49XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLEw9XCJbb2JqZWN0IE51bWJlcl1cIixCPVwiW29iamVjdCBPYmplY3RdXCIsRD1cIltvYmplY3QgUmVnRXhwXVwiLE09XCJbb2JqZWN0IFN0cmluZ11cIixVPS9bLiorP14ke30oKXxbXFxdXFwvXFxcXF0vZyxWPVJlZ0V4cChVLnNvdXJjZSksXz0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLHE9L15cXGQrJC8sej1bXCJjb25zdHJ1Y3RvclwiLFwiaGFzT3duUHJvcGVydHlcIixcImlzUHJvdG90eXBlT2ZcIixcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsXCJ0b0xvY2FsZVN0cmluZ1wiLFwidG9TdHJpbmdcIixcInZhbHVlT2ZcIl0sRz17XG5cImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0sSD1HW3R5cGVvZiBleHBvcnRzXSYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsSj1HW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxLPUgmJkomJnR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdCYmZ2xvYmFsLFE9R1t0eXBlb2Ygc2VsZl0mJnNlbGYmJnNlbGYuT2JqZWN0JiZzZWxmLFc9R1t0eXBlb2Ygd2luZG93XSYmd2luZG93JiZ3aW5kb3cuT2JqZWN0JiZ3aW5kb3csWD1KJiZKLmV4cG9ydHM9PT1IJiZILFk9S3x8VyE9PSh0aGlzJiZ0aGlzLndpbmRvdykmJld8fFF8fHRoaXMsWj1mdW5jdGlvbigpe3RyeXtPYmplY3Qoe3RvU3RyaW5nOjB9K1wiXCIpfWNhdGNoKHQpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmYWxzZX19cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdC50b1N0cmluZyE9XCJmdW5jdGlvblwiJiZ0eXBlb2YodCtcIlwiKT09XCJzdHJpbmdcIjtcbn19KCksdHQ9QXJyYXkucHJvdG90eXBlLHJ0PUVycm9yLnByb3RvdHlwZSxudD1PYmplY3QucHJvdG90eXBlLGV0PVN0cmluZy5wcm90b3R5cGUsb3Q9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLHV0PW50Lmhhc093blByb3BlcnR5LGN0PW50LnRvU3RyaW5nLGx0PVJlZ0V4cChcIl5cIitTKG90LmNhbGwodXQpKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLGl0PW50LnByb3BlcnR5SXNFbnVtZXJhYmxlLGF0PXR0LnNwbGljZSxmdD1wKFksXCJVaW50OEFycmF5XCIpLHN0PXAoQXJyYXksXCJpc0FycmF5XCIpLHB0PXAoT2JqZWN0LFwia2V5c1wiKSx5dD1NYXRoLm1heCxndD05MDA3MTk5MjU0NzQwOTkxLGh0PXt9O2h0W0ldPWh0W0NdPWh0W0xdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LGh0W2tdPWh0W01dPXtjb25zdHJ1Y3Rvcjp0cnVlLFxudG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LGh0W0ZdPWh0W05dPWh0W0RdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWV9LGh0W0JdPXtjb25zdHJ1Y3Rvcjp0cnVlfSxvKHosZnVuY3Rpb24odCl7Zm9yKHZhciByIGluIGh0KWlmKHV0LmNhbGwoaHQscikpe3ZhciBuPWh0W3JdO25bdF09dXQuY2FsbChuLHQpfX0pO3ZhciBidD1lLnN1cHBvcnQ9e307IWZ1bmN0aW9uKHQpe3ZhciByPWZ1bmN0aW9uKCl7dGhpcy54PXR9LG49ezA6dCxsZW5ndGg6dH0sZT1bXTtyLnByb3RvdHlwZT17dmFsdWVPZjp0LHk6dH07Zm9yKHZhciBvIGluIG5ldyByKWUucHVzaChvKTtidC5hcmdzVGFnPWN0LmNhbGwoYXJndW1lbnRzKT09VCxidC5lbnVtRXJyb3JQcm9wcz1pdC5jYWxsKHJ0LFwibWVzc2FnZVwiKXx8aXQuY2FsbChydCxcIm5hbWVcIiksYnQuZW51bVByb3RvdHlwZXM9aXQuY2FsbChyLFwicHJvdG90eXBlXCIpLGJ0Lm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKSxidC5zcGxpY2VPYmplY3RzPShhdC5jYWxsKG4sMCwxKSxcbiFuWzBdKSxidC51bmluZGV4ZWRDaGFycz1cInhcIlswXStPYmplY3QoXCJ4XCIpWzBdIT1cInh4XCJ9KDEsMCk7dmFyIHZ0PWEoXCJsZW5ndGhcIik7YnQuYXJnc1RhZ3x8KE89ZnVuY3Rpb24odCl7cmV0dXJuIG4odCkmJnkodCkmJnV0LmNhbGwodCxcImNhbGxlZVwiKSYmIWl0LmNhbGwodCxcImNhbGxlZVwiKX0pO3ZhciBqdD1zdHx8ZnVuY3Rpb24odCl7cmV0dXJuIG4odCkmJmIodC5sZW5ndGgpJiZjdC5jYWxsKHQpPT1JfSxtdD10KC94Lyl8fGZ0JiYhdChmdCk/ZnVuY3Rpb24odCl7cmV0dXJuIGN0LmNhbGwodCk9PU59OnQsT3Q9cyhmdW5jdGlvbih0LHIsbil7cmV0dXJuIG4/Yyh0LHIsbik6bCh0LHIpfSksZHQ9bShmdW5jdGlvbih0KXt2YXIgcj10WzBdO3JldHVybiBudWxsPT1yP3I6KHQucHVzaCh1KSxPdC5hcHBseShQLHQpKX0pLHh0PXB0P2Z1bmN0aW9uKHQpe3ZhciByPW51bGw9PXQ/bnVsbDp0LmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2Ygcj09XCJmdW5jdGlvblwiJiZyLnByb3RvdHlwZT09PXR8fCh0eXBlb2YgdD09XCJmdW5jdGlvblwiP2Uuc3VwcG9ydC5lbnVtUHJvdG90eXBlczp5KHQpKT92KHQpOmQodCk/cHQodCk6W107XG59OnY7ZS5hc3NpZ249T3QsZS5kZWZhdWx0cz1kdCxlLmtleXM9eHQsZS5rZXlzSW49RSxlLnJlc3RQYXJhbT1tLGUuZXh0ZW5kPU90LGUuZXNjYXBlUmVnRXhwPVMsZS5pZGVudGl0eT1BLGUuaXNBcmd1bWVudHM9TyxlLmlzQXJyYXk9anQsZS5pc0Z1bmN0aW9uPW10LGUuaXNOYXRpdmU9eCxlLmlzT2JqZWN0PWQsZS5pc1N0cmluZz13LGUuVkVSU0lPTj0kLEgmJkomJlgmJigoSi5leHBvcnRzPWUpLl89ZSl9KS5jYWxsKHRoaXMpOyIsIi8qIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIE1hcmN1cyBXZXN0aW4gKi9cbihmdW5jdGlvbihlKXtmdW5jdGlvbiBvKCl7dHJ5e3JldHVybiByIGluIGUmJmVbcl19Y2F0Y2godCl7cmV0dXJuITF9fXZhciB0PXt9LG49ZS5kb2N1bWVudCxyPVwibG9jYWxTdG9yYWdlXCIsaT1cInNjcmlwdFwiLHM7dC5kaXNhYmxlZD0hMSx0LnZlcnNpb249XCIxLjMuMTdcIix0LnNldD1mdW5jdGlvbihlLHQpe30sdC5nZXQ9ZnVuY3Rpb24oZSx0KXt9LHQuaGFzPWZ1bmN0aW9uKGUpe3JldHVybiB0LmdldChlKSE9PXVuZGVmaW5lZH0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7fSx0LmNsZWFyPWZ1bmN0aW9uKCl7fSx0LnRyYW5zYWN0PWZ1bmN0aW9uKGUsbixyKXtyPT1udWxsJiYocj1uLG49bnVsbCksbj09bnVsbCYmKG49e30pO3ZhciBpPXQuZ2V0KGUsbik7cihpKSx0LnNldChlLGkpfSx0LmdldEFsbD1mdW5jdGlvbigpe30sdC5mb3JFYWNoPWZ1bmN0aW9uKCl7fSx0LnNlcmlhbGl6ZT1mdW5jdGlvbihlKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZSl9LHQuZGVzZXJpYWxpemU9ZnVuY3Rpb24oZSl7aWYodHlwZW9mIGUhPVwic3RyaW5nXCIpcmV0dXJuIHVuZGVmaW5lZDt0cnl7cmV0dXJuIEpTT04ucGFyc2UoZSl9Y2F0Y2godCl7cmV0dXJuIGV8fHVuZGVmaW5lZH19O2lmKG8oKSlzPWVbcl0sdC5zZXQ9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gbj09PXVuZGVmaW5lZD90LnJlbW92ZShlKToocy5zZXRJdGVtKGUsdC5zZXJpYWxpemUobikpLG4pfSx0LmdldD1mdW5jdGlvbihlLG4pe3ZhciByPXQuZGVzZXJpYWxpemUocy5nZXRJdGVtKGUpKTtyZXR1cm4gcj09PXVuZGVmaW5lZD9uOnJ9LHQucmVtb3ZlPWZ1bmN0aW9uKGUpe3MucmVtb3ZlSXRlbShlKX0sdC5jbGVhcj1mdW5jdGlvbigpe3MuY2xlYXIoKX0sdC5nZXRBbGw9ZnVuY3Rpb24oKXt2YXIgZT17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQsbil7ZVt0XT1ufSksZX0sdC5mb3JFYWNoPWZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248cy5sZW5ndGg7bisrKXt2YXIgcj1zLmtleShuKTtlKHIsdC5nZXQocikpfX07ZWxzZSBpZihuLmRvY3VtZW50RWxlbWVudC5hZGRCZWhhdmlvcil7dmFyIHUsYTt0cnl7YT1uZXcgQWN0aXZlWE9iamVjdChcImh0bWxmaWxlXCIpLGEub3BlbigpLGEud3JpdGUoXCI8XCIraStcIj5kb2N1bWVudC53PXdpbmRvdzwvXCIraSsnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+JyksYS5jbG9zZSgpLHU9YS53LmZyYW1lc1swXS5kb2N1bWVudCxzPXUuY3JlYXRlRWxlbWVudChcImRpdlwiKX1jYXRjaChmKXtzPW4uY3JlYXRlRWxlbWVudChcImRpdlwiKSx1PW4uYm9keX12YXIgbD1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgbj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7bi51bnNoaWZ0KHMpLHUuYXBwZW5kQ2hpbGQocykscy5hZGRCZWhhdmlvcihcIiNkZWZhdWx0I3VzZXJEYXRhXCIpLHMubG9hZChyKTt2YXIgaT1lLmFwcGx5KHQsbik7cmV0dXJuIHUucmVtb3ZlQ2hpbGQocyksaX19LGM9bmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLFwiZ1wiKTtmdW5jdGlvbiBoKGUpe3JldHVybiBlLnJlcGxhY2UoL15kLyxcIl9fXyQmXCIpLnJlcGxhY2UoYyxcIl9fX1wiKX10LnNldD1sKGZ1bmN0aW9uKGUsbixpKXtyZXR1cm4gbj1oKG4pLGk9PT11bmRlZmluZWQ/dC5yZW1vdmUobik6KGUuc2V0QXR0cmlidXRlKG4sdC5zZXJpYWxpemUoaSkpLGUuc2F2ZShyKSxpKX0pLHQuZ2V0PWwoZnVuY3Rpb24oZSxuLHIpe249aChuKTt2YXIgaT10LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKG4pKTtyZXR1cm4gaT09PXVuZGVmaW5lZD9yOml9KSx0LnJlbW92ZT1sKGZ1bmN0aW9uKGUsdCl7dD1oKHQpLGUucmVtb3ZlQXR0cmlidXRlKHQpLGUuc2F2ZShyKX0pLHQuY2xlYXI9bChmdW5jdGlvbihlKXt2YXIgdD1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2UubG9hZChyKTtmb3IodmFyIG49MCxpO2k9dFtuXTtuKyspZS5yZW1vdmVBdHRyaWJ1dGUoaS5uYW1lKTtlLnNhdmUocil9KSx0LmdldEFsbD1mdW5jdGlvbihlKXt2YXIgbj17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKGUsdCl7bltlXT10fSksbn0sdC5mb3JFYWNoPWwoZnVuY3Rpb24oZSxuKXt2YXIgcj1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2Zvcih2YXIgaT0wLHM7cz1yW2ldOysraSluKHMubmFtZSx0LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKHMubmFtZSkpKX0pfXRyeXt2YXIgcD1cIl9fc3RvcmVqc19fXCI7dC5zZXQocCxwKSx0LmdldChwKSE9cCYmKHQuZGlzYWJsZWQ9ITApLHQucmVtb3ZlKHApfWNhdGNoKGYpe3QuZGlzYWJsZWQ9ITB9dC5lbmFibGVkPSF0LmRpc2FibGVkLHR5cGVvZiBtb2R1bGUhPVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzJiZ0aGlzLm1vZHVsZSE9PW1vZHVsZT9tb2R1bGUuZXhwb3J0cz10OnR5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZD9kZWZpbmUodCk6ZS5zdG9yZT10fSkoRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpKSIsInN0b3JlID0gcmVxdWlyZSgnc3RvcmUnKVxuXG4jIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBzdG9yZS5qcyBmb3IgZWFzeSBzd2FwcGluZ1xuY2xhc3MgU3RvcmFnZVxuICBjb25zdHJ1Y3RvcjogKEBuYW1lc3BhY2U9J2FsZXBoYmV0JykgLT5cbiAgICB0aHJvdyAnbG9jYWwgc3RvcmFnZSBub3Qgc3VwcG9ydGVkJyB1bmxlc3Mgc3RvcmUuZW5hYmxlZFxuICAgIEBzdG9yYWdlID0gc3RvcmUuZ2V0KEBuYW1lc3BhY2UpIHx8IHt9XG4gIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XSA9IHZhbHVlXG4gICAgc3RvcmUuc2V0KEBuYW1lc3BhY2UsIEBzdG9yYWdlKVxuICAgIHJldHVybiB2YWx1ZVxuICBnZXQ6IChrZXkpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XVxuICAgICMgc3RvcmUuZ2V0KFwiI3tAbmFtZXNwYWNlfToje2tleX1cIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIE5PVEU6IHVzaW5nIGEgY3VzdG9tIGJ1aWxkIG9mIGxvZGFzaCwgdG8gc2F2ZSBzcGFjZVxuXyA9IHJlcXVpcmUoJ2xvZGFzaC5jdXN0b20nKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAc2V0X2RlYnVnOiAoQGRlYnVnKSAtPlxuICBAbG9nOiAobWVzc2FnZSkgLT5cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKSBpZiBAZGVidWdcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzLmNvZmZlZScpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzLmNvZmZlZScpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0ge2RlYnVnOiBmYWxzZX1cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpIC0+XG4gICAgICBsb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH0sICN7dmFsdWV9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKVxuXG4gICAgQG9uSW5pdGlhbGl6ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgZXhwZXJpbWVudF9uYW1lLCBcIiN7dmFyaWFudH0gfCBWaXNpdG9yc1wiKVxuXG4gICAgQG9uRXZlbnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGV2ZW50X25hbWUpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIGV4cGVyaW1lbnRfbmFtZSwgXCIje3ZhcmlhbnR9IHwgI3tldmVudF9uYW1lfVwiKVxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBBbGVwaEJldC5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQHZhcmlhbnRzID0gdXRpbHMua2V5cyhAb3B0aW9ucy52YXJpYW50cylcbiAgICAgIF9ydW4uY2FsbCh0aGlzKVxuXG4gICAgcnVuOiAtPlxuICAgICAgbG9nKFwicnVubmluZyB3aXRoIG9wdGlvbnM6ICN7QG9wdGlvbnN9XCIpXG4gICAgICBfZm9yY2VfdmFyaWFudCgpXG4gICAgICBAYXBwbHlfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBfZm9yY2VfdmFyaWFudCA9IC0+XG4gICAgICAjIFRPRE86IGdldCB2YXJpYW50IGZyb20gVVJJXG5cbiAgICBhcHBseV92YXJpYW50OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAb3B0aW9ucy50cmlnZ2VyKClcbiAgICAgIGxvZygndHJpZ2dlciBzZXQnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaW5fc2FtcGxlKClcbiAgICAgIGxvZygnaW4gc2FtcGxlJylcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgbG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgIGVsc2VcbiAgICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgICBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyLm9uSW5pdGlhbGl6ZShAb3B0aW9ucy5uYW1lLCB2YXJpYW50KVxuICAgICAgQG9wdGlvbnMudmFyaWFudHNbdmFyaWFudF0/LmFjdGl2YXRlKClcblxuICAgIGdvYWw6IChnb2FsX25hbWUsIHVuaXF1ZT10cnVlKSAtPlxuICAgICAgcmV0dXJuIGlmIHVuaXF1ZSAmJiBzdG9yYWdlLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIHN0b3JhZ2Uuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgdW5pcXVlXG4gICAgICBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyLm9uRXZlbnQoQG9wdGlvbnMubmFtZSwgdmFyaWFudCwgZ29hbF9uYW1lKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgc3RvcmFnZS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudHMubGVuZ3RoXG4gICAgICBjaG9zZW5fcGFydGl0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpIC8gcGFydGl0aW9ucylcbiAgICAgIHZhcmlhbnQgPSBAdmFyaWFudHNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIGxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICBzdG9yYWdlLnNldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiLCB2YXJpYW50KVxuXG4gICAgaW5fc2FtcGxlOiAtPlxuICAgICAgYWN0aXZlID0gc3RvcmFnZS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiKVxuICAgICAgcmV0dXJuIGFjdGl2ZSB1bmxlc3MgdHlwZW9mIGFjdGl2ZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgc3RvcmFnZS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiLCBNYXRoLnJhbmRvbSgpIDw9IEBvcHRpb25zLnNhbXBsZSlcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyAnYW4gZXhwZXJpbWVudCBuYW1lIG11c3QgYmUgc3BlY2lmaWVkJyBpZiBAb3B0aW9ucy5uYW1lIGlzIG51bGxcbiAgICAgIHRocm93ICd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJyBpZiBAb3B0aW9ucy52YXJpYW50cyBpcyBudWxsXG4gICAgICB0aHJvdyAndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuXG5sb2cgPSAobWVzc2FnZSkgLT5cbiAgdXRpbHMuc2V0X2RlYnVnKEFsZXBoQmV0Lm9wdGlvbnMuZGVidWcpXG4gIHV0aWxzLmxvZyhtZXNzYWdlKVxuXG5zdG9yYWdlID0gbmV3IFN0b3JhZ2UoJ2FsZXBoYmV0JylcblxubW9kdWxlLmV4cG9ydHMgPSBBbGVwaEJldFxuIl19
