(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 * @license
 * lodash 3.9.3 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash include="keys,defaults" exports="node" -o ./lib/lodash.custom.js`
 */
;(function(){function t(t){return typeof t=="function"||false}function n(t){return!!t&&typeof t=="object"}function r(){}function e(t,n){return t===j?n:t}function o(t,n){return typeof t!="function"?v:n===j?t:function(r,e,o,u,c){return t.call(n,r,e,o,u,c)}}function u(t,n){var r=null==t?j:t[n];return y(r)?r:j}function c(t){return null!=t&&i(W(t))}function l(t,n){return t=typeof t=="number"||$.test(t)?+t:-1,n=null==n?J:n,-1<t&&0==t%1&&t<n}function i(t){return typeof t=="number"&&-1<t&&0==t%1&&t<=J}function a(t){
for(var n=h(t),r=n.length,e=r&&t.length,o=!!e&&i(e)&&(X(t)||s(t)||g(t)),u=-1,c=[];++u<r;){var a=n[u];(o&&l(a,e)||U.call(t,a))&&c.push(a)}return c}function f(t,n){if(typeof t!="function")throw new TypeError(m);return n=H(n===j?t.length-1:+n||0,0),function(){for(var r=arguments,e=-1,o=H(r.length-n,0),u=Array(o);++e<o;)u[e]=r[n+e];switch(n){case 0:return t.call(this,u);case 1:return t.call(this,r[0],u);case 2:return t.call(this,r[0],r[1],u)}for(o=Array(n+1),e=-1;++e<n;)o[e]=r[e];return o[n]=u,t.apply(this,o);
}}function s(t){return n(t)&&c(t)&&V.call(t)==O}function p(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function y(t){return null==t?false:V.call(t)==x?_.test(M.call(t)):n(t)&&(N(t)?_:P).test(t)}function g(t){return typeof t=="string"||n(t)&&V.call(t)==E}function h(t){if(null==t)return[];p(t)||(t=Object(t));for(var n=t.length,e=r.support,n=n&&i(n)&&(X(t)||s(t)||g(t))&&n||0,o=t.constructor,u=-1,o=Y(o)&&o.prototype||B,c=o===t,a=Array(n),f=0<n,y=e.enumErrorProps&&(t===L||t instanceof Error),h=e.enumPrototypes&&Y(t);++u<n;)a[u]=u+"";
for(var b in t)h&&"prototype"==b||y&&("message"==b||"name"==b)||f&&l(b,n)||"constructor"==b&&(c||!U.call(t,b))||a.push(b);if(e.nonEnumShadows&&t!==B)for(n=t===D?E:t===L?d:V.call(t),e=K[n]||K[w],n==w&&(o=B),n=R.length;n--;)b=R[n],u=e[b],c&&u||(u?!U.call(t,b):t[b]===o[b])||a.push(b);return a}function b(t){return(t=typeof t=="string"?t:null==t?"":t+"")&&A.test(t)?t.replace(S,"\\$&"):t}function v(t){return t}var j,m="Expected a function",O="[object Arguments]",d="[object Error]",x="[object Function]",w="[object Object]",E="[object String]",S=/[.*+?^${}()|[\]\/\\]/g,A=RegExp(S.source),P=/^\[object .+?Constructor\]$/,$=/^\d+$/,R="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),T={
"function":true,object:true},I=T[typeof exports]&&exports&&!exports.nodeType&&exports,k=T[typeof module]&&module&&!module.nodeType&&module,C=T[typeof self]&&self&&self.Object&&self,F=T[typeof window]&&window&&window.Object&&window,T=k&&k.exports===I&&I,C=I&&k&&typeof global=="object"&&global&&global.Object&&global||F!==(this&&this.window)&&F||C||this,N=function(){try{Object({toString:0}+"")}catch(t){return function(){return false}}return function(t){return typeof t.toString!="function"&&typeof(t+"")=="string";
}}(),F=Array.prototype,L=Error.prototype,B=Object.prototype,D=String.prototype,M=Function.prototype.toString,U=B.hasOwnProperty,V=B.toString,_=RegExp("^"+b(M.call(U)).replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),q=B.propertyIsEnumerable,z=F.splice,C=u(C,"Uint8Array"),F=u(Array,"isArray"),G=u(Object,"keys"),H=Math.max,J=9007199254740991,K={};K["[object Array]"]=K["[object Date]"]=K["[object Number]"]={constructor:true,toLocaleString:true,toString:true,valueOf:true},K["[object Boolean]"]=K[E]={
constructor:true,toString:true,valueOf:true},K[d]=K[x]=K["[object RegExp]"]={constructor:true,toString:true},K[w]={constructor:true},function(t,n){for(var r=-1,e=t.length;++r<e&&false!==n(t[r],r,t););return t}(R,function(t){for(var n in K)if(U.call(K,n)){var r=K[n];r[t]=U.call(r,t)}});var Q=r.support={};!function(t){function n(){this.x=t}var r={0:t,length:t},e=[];n.prototype={valueOf:t,y:t};for(var o in new n)e.push(o);Q.argsTag=V.call(arguments)==O,Q.enumErrorProps=q.call(L,"message")||q.call(L,"name"),Q.enumPrototypes=q.call(n,"prototype"),
Q.nonEnumShadows=!/valueOf/.test(e),Q.spliceObjects=(z.call(r,0,1),!r[0]),Q.unindexedChars="xx"!="x"[0]+Object("x")[0]}(1,0);var W=function(t){return function(n){if(null==n)n=j;else{if(r.support.unindexedChars&&g(n)){for(var e=-1,o=n.length,u=Object(n);++e<o;)u[e]=n.charAt(e);n=u}else n=p(n)?n:Object(n);n=n[t]}return n}}("length");Q.argsTag||(s=function(t){return n(t)&&c(t)&&U.call(t,"callee")&&!q.call(t,"callee")});var X=F||function(t){return n(t)&&i(t.length)&&"[object Array]"==V.call(t)},Y=t(/x/)||C&&!t(C)?function(t){
return V.call(t)==x}:t,Z=function(t){return f(function(n,r){var e=-1,u=null==n?0:r.length,i=2<u?r[u-2]:j,a=2<u?r[2]:j,f=1<u?r[u-1]:j;if(typeof i=="function"?(i=o(i,f),u-=2):(i=typeof f=="function"?f:j,u-=i?1:0),f=a){var f=r[0],s=r[1];if(p(a)){var y=typeof s;("number"==y?c(a)&&l(s,a.length):"string"==y&&s in a)?(a=a[s],f=f===f?f===a:a!==a):f=false}else f=false}for(f&&(i=3>u?j:i,u=1);++e<u;)(a=r[e])&&t(n,a,i);return n})}(function(t,n,r){if(r)for(var e=-1,o=tt(n),u=o.length;++e<u;){var c=o[e],l=t[c],i=r(l,n[c],c,t,n);
(i===i?i===l:l!==l)&&(l!==j||c in t)||(t[c]=i)}else if(null!=n)for(r=tt(n),t||(t={}),e=-1,o=r.length;++e<o;)u=r[e],t[u]=n[u];return n=t}),C=f(function(t){var n=t[0];return null==n?n:(t.push(e),Z.apply(j,t))}),tt=G?function(t){var n=null==t?null:t.constructor;return typeof n=="function"&&n.prototype===t||(typeof t=="function"?r.support.enumPrototypes:c(t))?a(t):p(t)?G(t):[]}:a;r.assign=Z,r.defaults=C,r.keys=tt,r.keysIn=h,r.restParam=f,r.extend=Z,r.escapeRegExp=b,r.identity=v,r.isArguments=s,r.isArray=X,
r.isFunction=Y,r.isNative=y,r.isObject=p,r.isString=g,r.VERSION="3.9.3",I&&k&&T&&((k.exports=r)._=r)}).call(this);
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
var AlephBet, Storage, log, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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

    GoogleUniversalAnalyticsAdapter.experiment_start = function(experiment_name, variant) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name + " | " + variant, 'Visitors');
    };

    GoogleUniversalAnalyticsAdapter.goal_complete = function(experiment_name, variant, goal) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name + " | " + variant, goal);
    };

    return GoogleUniversalAnalyticsAdapter;

  })();

  AlephBet.LocalStorageAdapter = (function() {
    function LocalStorageAdapter() {}

    LocalStorageAdapter.namespace = 'alephbet';

    LocalStorageAdapter.set = function(key, value) {
      return new Storage(this.namespace).set(key, value);
    };

    LocalStorageAdapter.get = function(key) {
      return new Storage(this.namespace).get(key);
    };

    return LocalStorageAdapter;

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
      tracking_adapter: AlephBet.GoogleUniversalAnalyticsAdapter,
      storage_adapter: AlephBet.LocalStorageAdapter
    };

    function Experiment(options) {
      this.options = options != null ? options : {};
      this.add_goal = bind(this.add_goal, this);
      utils.defaults(this.options, Experiment._options);
      _validate.call(this);
      this.variants = utils.keys(this.options.variants);
      _run.call(this);
    }

    Experiment.prototype.run = function() {
      log("running with options: " + (JSON.stringify(this.options)));
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
        this.tracking().experiment_start(this.options.name, variant);
      }
      return (ref = this.options.variants[variant]) != null ? ref.activate() : void 0;
    };

    Experiment.prototype.goal_complete = function(goal_name, props) {
      var variant;
      if (props == null) {
        props = {};
      }
      utils.defaults(props, {
        unique: true
      });
      if (props.unique && this.storage().get(this.options.name + ":" + goal_name)) {
        return;
      }
      variant = this.get_stored_variant();
      if (!variant) {
        return;
      }
      if (props.unique) {
        this.storage().set(this.options.name + ":" + goal_name, true);
      }
      log("experiment: " + this.options.name + " variant:" + variant + " goal:" + goal_name + " complete");
      return this.tracking().goal_complete(this.options.name, variant, goal_name);
    };

    Experiment.prototype.get_stored_variant = function() {
      return this.storage().get(this.options.name + ":variant");
    };

    Experiment.prototype.pick_variant = function() {
      var chosen_partition, partitions, variant;
      partitions = 1.0 / this.variants.length;
      chosen_partition = Math.floor(Math.random() / partitions);
      variant = this.variants[chosen_partition];
      log(variant + " picked");
      return this.storage().set(this.options.name + ":variant", variant);
    };

    Experiment.prototype.in_sample = function() {
      var active;
      active = this.storage().get(this.options.name + ":in_sample");
      if (typeof active !== 'undefined') {
        return active;
      }
      return this.storage().set(this.options.name + ":in_sample", Math.random() <= this.options.sample);
    };

    Experiment.prototype.add_goal = function(goal) {
      return goal.add_experiment(this);
    };

    Experiment.prototype.storage = function() {
      return this.options.storage_adapter;
    };

    Experiment.prototype.tracking = function() {
      return this.options.tracking_adapter;
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

  AlephBet.Goal = (function() {
    function Goal(name, props1) {
      this.name = name;
      this.props = props1 != null ? props1 : {};
      utils.defaults(this.props, {
        unique: true
      });
    }

    Goal.prototype.add_experiment = function(experiment) {
      this.experiments || (this.experiments = []);
      return this.experiments.push(experiment);
    };

    Goal.prototype.complete = function() {
      var experiment, i, len, ref, results;
      ref = this.experiments;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        experiment = ref[i];
        results.push(experiment.goal_complete(this.name, this.props));
      }
      return results;
    };

    return Goal;

  })();

  return AlephBet;

})();

log = function(message) {
  utils.set_debug(AlephBet.options.debug);
  return utils.log(message);
};

module.exports = AlephBet;


},{"./storage.js.coffee":3,"./utils.js.coffee":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvbG9kYXNoLmN1c3RvbS5taW4uanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUubWluLmpzIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3N0b3JhZ2UuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3V0aWxzLmpzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9hbGVwaGJldC5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBOztBQ0RBLElBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUdGO0VBQ1MsaUJBQUMsU0FBRDtJQUFDLElBQUMsQ0FBQSxnQ0FBRCxZQUFXO0lBQ3ZCLElBQUEsQ0FBMkMsS0FBSyxDQUFDLE9BQWpEO0FBQUEsWUFBTSw4QkFBTjs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENBQUEsR0FB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QUFBLEdBQWdCLFNBQUMsVUFBRDtNQUNkLElBQUMsQ0FBQSxnQkFBRCxJQUFDLENBQUEsY0FBZ0I7YUFDakIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFVBQWxCO0lBRmM7O21CQUloQixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O3FCQUNFLFVBQVUsQ0FBQyxhQUFYLENBQXlCLElBQUMsQ0FBQSxJQUExQixFQUFnQyxJQUFDLENBQUEsS0FBakM7QUFERjs7SUFEUTs7Ozs7Ozs7OztBQUlkLEdBQUEsR0FBTSxTQUFDLE9BQUQ7RUFDSixLQUFLLENBQUMsU0FBTixDQUFnQixRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWpDO1NBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWO0FBRkk7O0FBSU4sTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAbGljZW5zZVxuICogbG9kYXNoIDMuOS4zIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0c1wiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9saWIvbG9kYXNoLmN1c3RvbS5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIHQodCl7cmV0dXJuIHR5cGVvZiB0PT1cImZ1bmN0aW9uXCJ8fGZhbHNlfWZ1bmN0aW9uIG4odCl7cmV0dXJuISF0JiZ0eXBlb2YgdD09XCJvYmplY3RcIn1mdW5jdGlvbiByKCl7fWZ1bmN0aW9uIGUodCxuKXtyZXR1cm4gdD09PWo/bjp0fWZ1bmN0aW9uIG8odCxuKXtyZXR1cm4gdHlwZW9mIHQhPVwiZnVuY3Rpb25cIj92Om49PT1qP3Q6ZnVuY3Rpb24ocixlLG8sdSxjKXtyZXR1cm4gdC5jYWxsKG4scixlLG8sdSxjKX19ZnVuY3Rpb24gdSh0LG4pe3ZhciByPW51bGw9PXQ/ajp0W25dO3JldHVybiB5KHIpP3I6an1mdW5jdGlvbiBjKHQpe3JldHVybiBudWxsIT10JiZpKFcodCkpfWZ1bmN0aW9uIGwodCxuKXtyZXR1cm4gdD10eXBlb2YgdD09XCJudW1iZXJcInx8JC50ZXN0KHQpPyt0Oi0xLG49bnVsbD09bj9KOm4sLTE8dCYmMD09dCUxJiZ0PG59ZnVuY3Rpb24gaSh0KXtyZXR1cm4gdHlwZW9mIHQ9PVwibnVtYmVyXCImJi0xPHQmJjA9PXQlMSYmdDw9Sn1mdW5jdGlvbiBhKHQpe1xuZm9yKHZhciBuPWgodCkscj1uLmxlbmd0aCxlPXImJnQubGVuZ3RoLG89ISFlJiZpKGUpJiYoWCh0KXx8cyh0KXx8Zyh0KSksdT0tMSxjPVtdOysrdTxyOyl7dmFyIGE9blt1XTsobyYmbChhLGUpfHxVLmNhbGwodCxhKSkmJmMucHVzaChhKX1yZXR1cm4gY31mdW5jdGlvbiBmKHQsbil7aWYodHlwZW9mIHQhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKG0pO3JldHVybiBuPUgobj09PWo/dC5sZW5ndGgtMTorbnx8MCwwKSxmdW5jdGlvbigpe2Zvcih2YXIgcj1hcmd1bWVudHMsZT0tMSxvPUgoci5sZW5ndGgtbiwwKSx1PUFycmF5KG8pOysrZTxvOyl1W2VdPXJbbitlXTtzd2l0Y2gobil7Y2FzZSAwOnJldHVybiB0LmNhbGwodGhpcyx1KTtjYXNlIDE6cmV0dXJuIHQuY2FsbCh0aGlzLHJbMF0sdSk7Y2FzZSAyOnJldHVybiB0LmNhbGwodGhpcyxyWzBdLHJbMV0sdSl9Zm9yKG89QXJyYXkobisxKSxlPS0xOysrZTxuOylvW2VdPXJbZV07cmV0dXJuIG9bbl09dSx0LmFwcGx5KHRoaXMsbyk7XG59fWZ1bmN0aW9uIHModCl7cmV0dXJuIG4odCkmJmModCkmJlYuY2FsbCh0KT09T31mdW5jdGlvbiBwKHQpe3ZhciBuPXR5cGVvZiB0O3JldHVybiEhdCYmKFwib2JqZWN0XCI9PW58fFwiZnVuY3Rpb25cIj09bil9ZnVuY3Rpb24geSh0KXtyZXR1cm4gbnVsbD09dD9mYWxzZTpWLmNhbGwodCk9PXg/Xy50ZXN0KE0uY2FsbCh0KSk6bih0KSYmKE4odCk/XzpQKS50ZXN0KHQpfWZ1bmN0aW9uIGcodCl7cmV0dXJuIHR5cGVvZiB0PT1cInN0cmluZ1wifHxuKHQpJiZWLmNhbGwodCk9PUV9ZnVuY3Rpb24gaCh0KXtpZihudWxsPT10KXJldHVybltdO3AodCl8fCh0PU9iamVjdCh0KSk7Zm9yKHZhciBuPXQubGVuZ3RoLGU9ci5zdXBwb3J0LG49biYmaShuKSYmKFgodCl8fHModCl8fGcodCkpJiZufHwwLG89dC5jb25zdHJ1Y3Rvcix1PS0xLG89WShvKSYmby5wcm90b3R5cGV8fEIsYz1vPT09dCxhPUFycmF5KG4pLGY9MDxuLHk9ZS5lbnVtRXJyb3JQcm9wcyYmKHQ9PT1MfHx0IGluc3RhbmNlb2YgRXJyb3IpLGg9ZS5lbnVtUHJvdG90eXBlcyYmWSh0KTsrK3U8bjspYVt1XT11K1wiXCI7XG5mb3IodmFyIGIgaW4gdCloJiZcInByb3RvdHlwZVwiPT1ifHx5JiYoXCJtZXNzYWdlXCI9PWJ8fFwibmFtZVwiPT1iKXx8ZiYmbChiLG4pfHxcImNvbnN0cnVjdG9yXCI9PWImJihjfHwhVS5jYWxsKHQsYikpfHxhLnB1c2goYik7aWYoZS5ub25FbnVtU2hhZG93cyYmdCE9PUIpZm9yKG49dD09PUQ/RTp0PT09TD9kOlYuY2FsbCh0KSxlPUtbbl18fEtbd10sbj09dyYmKG89Qiksbj1SLmxlbmd0aDtuLS07KWI9UltuXSx1PWVbYl0sYyYmdXx8KHU/IVUuY2FsbCh0LGIpOnRbYl09PT1vW2JdKXx8YS5wdXNoKGIpO3JldHVybiBhfWZ1bmN0aW9uIGIodCl7cmV0dXJuKHQ9dHlwZW9mIHQ9PVwic3RyaW5nXCI/dDpudWxsPT10P1wiXCI6dCtcIlwiKSYmQS50ZXN0KHQpP3QucmVwbGFjZShTLFwiXFxcXCQmXCIpOnR9ZnVuY3Rpb24gdih0KXtyZXR1cm4gdH12YXIgaixtPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLE89XCJbb2JqZWN0IEFyZ3VtZW50c11cIixkPVwiW29iamVjdCBFcnJvcl1cIix4PVwiW29iamVjdCBGdW5jdGlvbl1cIix3PVwiW29iamVjdCBPYmplY3RdXCIsRT1cIltvYmplY3QgU3RyaW5nXVwiLFM9L1suKis/XiR7fSgpfFtcXF1cXC9cXFxcXS9nLEE9UmVnRXhwKFMuc291cmNlKSxQPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sJD0vXlxcZCskLyxSPVwiY29uc3RydWN0b3IgaGFzT3duUHJvcGVydHkgaXNQcm90b3R5cGVPZiBwcm9wZXJ0eUlzRW51bWVyYWJsZSB0b0xvY2FsZVN0cmluZyB0b1N0cmluZyB2YWx1ZU9mXCIuc3BsaXQoXCIgXCIpLFQ9e1xuXCJmdW5jdGlvblwiOnRydWUsb2JqZWN0OnRydWV9LEk9VFt0eXBlb2YgZXhwb3J0c10mJmV4cG9ydHMmJiFleHBvcnRzLm5vZGVUeXBlJiZleHBvcnRzLGs9VFt0eXBlb2YgbW9kdWxlXSYmbW9kdWxlJiYhbW9kdWxlLm5vZGVUeXBlJiZtb2R1bGUsQz1UW3R5cGVvZiBzZWxmXSYmc2VsZiYmc2VsZi5PYmplY3QmJnNlbGYsRj1UW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cmJndpbmRvdy5PYmplY3QmJndpbmRvdyxUPWsmJmsuZXhwb3J0cz09PUkmJkksQz1JJiZrJiZ0eXBlb2YgZ2xvYmFsPT1cIm9iamVjdFwiJiZnbG9iYWwmJmdsb2JhbC5PYmplY3QmJmdsb2JhbHx8RiE9PSh0aGlzJiZ0aGlzLndpbmRvdykmJkZ8fEN8fHRoaXMsTj1mdW5jdGlvbigpe3RyeXtPYmplY3Qoe3RvU3RyaW5nOjB9K1wiXCIpfWNhdGNoKHQpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmYWxzZX19cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdC50b1N0cmluZyE9XCJmdW5jdGlvblwiJiZ0eXBlb2YodCtcIlwiKT09XCJzdHJpbmdcIjtcbn19KCksRj1BcnJheS5wcm90b3R5cGUsTD1FcnJvci5wcm90b3R5cGUsQj1PYmplY3QucHJvdG90eXBlLEQ9U3RyaW5nLnByb3RvdHlwZSxNPUZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyxVPUIuaGFzT3duUHJvcGVydHksVj1CLnRvU3RyaW5nLF89UmVnRXhwKFwiXlwiK2IoTS5jYWxsKFUpKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLHE9Qi5wcm9wZXJ0eUlzRW51bWVyYWJsZSx6PUYuc3BsaWNlLEM9dShDLFwiVWludDhBcnJheVwiKSxGPXUoQXJyYXksXCJpc0FycmF5XCIpLEc9dShPYmplY3QsXCJrZXlzXCIpLEg9TWF0aC5tYXgsSj05MDA3MTk5MjU0NzQwOTkxLEs9e307S1tcIltvYmplY3QgQXJyYXldXCJdPUtbXCJbb2JqZWN0IERhdGVdXCJdPUtbXCJbb2JqZWN0IE51bWJlcl1cIl09e2NvbnN0cnVjdG9yOnRydWUsdG9Mb2NhbGVTdHJpbmc6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX0sS1tcIltvYmplY3QgQm9vbGVhbl1cIl09S1tFXT17XG5jb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfSxLW2RdPUtbeF09S1tcIltvYmplY3QgUmVnRXhwXVwiXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlfSxLW3ddPXtjb25zdHJ1Y3Rvcjp0cnVlfSxmdW5jdGlvbih0LG4pe2Zvcih2YXIgcj0tMSxlPXQubGVuZ3RoOysrcjxlJiZmYWxzZSE9PW4odFtyXSxyLHQpOyk7cmV0dXJuIHR9KFIsZnVuY3Rpb24odCl7Zm9yKHZhciBuIGluIEspaWYoVS5jYWxsKEssbikpe3ZhciByPUtbbl07clt0XT1VLmNhbGwocix0KX19KTt2YXIgUT1yLnN1cHBvcnQ9e307IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIG4oKXt0aGlzLng9dH12YXIgcj17MDp0LGxlbmd0aDp0fSxlPVtdO24ucHJvdG90eXBlPXt2YWx1ZU9mOnQseTp0fTtmb3IodmFyIG8gaW4gbmV3IG4pZS5wdXNoKG8pO1EuYXJnc1RhZz1WLmNhbGwoYXJndW1lbnRzKT09TyxRLmVudW1FcnJvclByb3BzPXEuY2FsbChMLFwibWVzc2FnZVwiKXx8cS5jYWxsKEwsXCJuYW1lXCIpLFEuZW51bVByb3RvdHlwZXM9cS5jYWxsKG4sXCJwcm90b3R5cGVcIiksXG5RLm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKSxRLnNwbGljZU9iamVjdHM9KHouY2FsbChyLDAsMSksIXJbMF0pLFEudW5pbmRleGVkQ2hhcnM9XCJ4eFwiIT1cInhcIlswXStPYmplY3QoXCJ4XCIpWzBdfSgxLDApO3ZhciBXPWZ1bmN0aW9uKHQpe3JldHVybiBmdW5jdGlvbihuKXtpZihudWxsPT1uKW49ajtlbHNle2lmKHIuc3VwcG9ydC51bmluZGV4ZWRDaGFycyYmZyhuKSl7Zm9yKHZhciBlPS0xLG89bi5sZW5ndGgsdT1PYmplY3Qobik7KytlPG87KXVbZV09bi5jaGFyQXQoZSk7bj11fWVsc2Ugbj1wKG4pP246T2JqZWN0KG4pO249blt0XX1yZXR1cm4gbn19KFwibGVuZ3RoXCIpO1EuYXJnc1RhZ3x8KHM9ZnVuY3Rpb24odCl7cmV0dXJuIG4odCkmJmModCkmJlUuY2FsbCh0LFwiY2FsbGVlXCIpJiYhcS5jYWxsKHQsXCJjYWxsZWVcIil9KTt2YXIgWD1GfHxmdW5jdGlvbih0KXtyZXR1cm4gbih0KSYmaSh0Lmxlbmd0aCkmJlwiW29iamVjdCBBcnJheV1cIj09Vi5jYWxsKHQpfSxZPXQoL3gvKXx8QyYmIXQoQyk/ZnVuY3Rpb24odCl7XG5yZXR1cm4gVi5jYWxsKHQpPT14fTp0LFo9ZnVuY3Rpb24odCl7cmV0dXJuIGYoZnVuY3Rpb24obixyKXt2YXIgZT0tMSx1PW51bGw9PW4/MDpyLmxlbmd0aCxpPTI8dT9yW3UtMl06aixhPTI8dT9yWzJdOmosZj0xPHU/clt1LTFdOmo7aWYodHlwZW9mIGk9PVwiZnVuY3Rpb25cIj8oaT1vKGksZiksdS09Mik6KGk9dHlwZW9mIGY9PVwiZnVuY3Rpb25cIj9mOmosdS09aT8xOjApLGY9YSl7dmFyIGY9clswXSxzPXJbMV07aWYocChhKSl7dmFyIHk9dHlwZW9mIHM7KFwibnVtYmVyXCI9PXk/YyhhKSYmbChzLGEubGVuZ3RoKTpcInN0cmluZ1wiPT15JiZzIGluIGEpPyhhPWFbc10sZj1mPT09Zj9mPT09YTphIT09YSk6Zj1mYWxzZX1lbHNlIGY9ZmFsc2V9Zm9yKGYmJihpPTM+dT9qOmksdT0xKTsrK2U8dTspKGE9cltlXSkmJnQobixhLGkpO3JldHVybiBufSl9KGZ1bmN0aW9uKHQsbixyKXtpZihyKWZvcih2YXIgZT0tMSxvPXR0KG4pLHU9by5sZW5ndGg7KytlPHU7KXt2YXIgYz1vW2VdLGw9dFtjXSxpPXIobCxuW2NdLGMsdCxuKTtcbihpPT09aT9pPT09bDpsIT09bCkmJihsIT09anx8YyBpbiB0KXx8KHRbY109aSl9ZWxzZSBpZihudWxsIT1uKWZvcihyPXR0KG4pLHR8fCh0PXt9KSxlPS0xLG89ci5sZW5ndGg7KytlPG87KXU9cltlXSx0W3VdPW5bdV07cmV0dXJuIG49dH0pLEM9ZihmdW5jdGlvbih0KXt2YXIgbj10WzBdO3JldHVybiBudWxsPT1uP246KHQucHVzaChlKSxaLmFwcGx5KGosdCkpfSksdHQ9Rz9mdW5jdGlvbih0KXt2YXIgbj1udWxsPT10P251bGw6dC5jb25zdHJ1Y3RvcjtyZXR1cm4gdHlwZW9mIG49PVwiZnVuY3Rpb25cIiYmbi5wcm90b3R5cGU9PT10fHwodHlwZW9mIHQ9PVwiZnVuY3Rpb25cIj9yLnN1cHBvcnQuZW51bVByb3RvdHlwZXM6Yyh0KSk/YSh0KTpwKHQpP0codCk6W119OmE7ci5hc3NpZ249WixyLmRlZmF1bHRzPUMsci5rZXlzPXR0LHIua2V5c0luPWgsci5yZXN0UGFyYW09ZixyLmV4dGVuZD1aLHIuZXNjYXBlUmVnRXhwPWIsci5pZGVudGl0eT12LHIuaXNBcmd1bWVudHM9cyxyLmlzQXJyYXk9WCxcbnIuaXNGdW5jdGlvbj1ZLHIuaXNOYXRpdmU9eSxyLmlzT2JqZWN0PXAsci5pc1N0cmluZz1nLHIuVkVSU0lPTj1cIjMuOS4zXCIsSSYmayYmVCYmKChrLmV4cG9ydHM9cikuXz1yKX0pLmNhbGwodGhpcyk7IiwiLyogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgTWFyY3VzIFdlc3RpbiAqL1xuKGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG8oKXt0cnl7cmV0dXJuIHIgaW4gZSYmZVtyXX1jYXRjaCh0KXtyZXR1cm4hMX19dmFyIHQ9e30sbj1lLmRvY3VtZW50LHI9XCJsb2NhbFN0b3JhZ2VcIixpPVwic2NyaXB0XCIsczt0LmRpc2FibGVkPSExLHQudmVyc2lvbj1cIjEuMy4xN1wiLHQuc2V0PWZ1bmN0aW9uKGUsdCl7fSx0LmdldD1mdW5jdGlvbihlLHQpe30sdC5oYXM9ZnVuY3Rpb24oZSl7cmV0dXJuIHQuZ2V0KGUpIT09dW5kZWZpbmVkfSx0LnJlbW92ZT1mdW5jdGlvbihlKXt9LHQuY2xlYXI9ZnVuY3Rpb24oKXt9LHQudHJhbnNhY3Q9ZnVuY3Rpb24oZSxuLHIpe3I9PW51bGwmJihyPW4sbj1udWxsKSxuPT1udWxsJiYobj17fSk7dmFyIGk9dC5nZXQoZSxuKTtyKGkpLHQuc2V0KGUsaSl9LHQuZ2V0QWxsPWZ1bmN0aW9uKCl7fSx0LmZvckVhY2g9ZnVuY3Rpb24oKXt9LHQuc2VyaWFsaXplPWZ1bmN0aW9uKGUpe3JldHVybiBKU09OLnN0cmluZ2lmeShlKX0sdC5kZXNlcmlhbGl6ZT1mdW5jdGlvbihlKXtpZih0eXBlb2YgZSE9XCJzdHJpbmdcIilyZXR1cm4gdW5kZWZpbmVkO3RyeXtyZXR1cm4gSlNPTi5wYXJzZShlKX1jYXRjaCh0KXtyZXR1cm4gZXx8dW5kZWZpbmVkfX07aWYobygpKXM9ZVtyXSx0LnNldD1mdW5jdGlvbihlLG4pe3JldHVybiBuPT09dW5kZWZpbmVkP3QucmVtb3ZlKGUpOihzLnNldEl0ZW0oZSx0LnNlcmlhbGl6ZShuKSksbil9LHQuZ2V0PWZ1bmN0aW9uKGUsbil7dmFyIHI9dC5kZXNlcmlhbGl6ZShzLmdldEl0ZW0oZSkpO3JldHVybiByPT09dW5kZWZpbmVkP246cn0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7cy5yZW1vdmVJdGVtKGUpfSx0LmNsZWFyPWZ1bmN0aW9uKCl7cy5jbGVhcigpfSx0LmdldEFsbD1mdW5jdGlvbigpe3ZhciBlPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCxuKXtlW3RdPW59KSxlfSx0LmZvckVhY2g9ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjxzLmxlbmd0aDtuKyspe3ZhciByPXMua2V5KG4pO2Uocix0LmdldChyKSl9fTtlbHNlIGlmKG4uZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKXt2YXIgdSxhO3RyeXthPW5ldyBBY3RpdmVYT2JqZWN0KFwiaHRtbGZpbGVcIiksYS5vcGVuKCksYS53cml0ZShcIjxcIitpK1wiPmRvY3VtZW50Lnc9d2luZG93PC9cIitpKyc+PGlmcmFtZSBzcmM9XCIvZmF2aWNvbi5pY29cIj48L2lmcmFtZT4nKSxhLmNsb3NlKCksdT1hLncuZnJhbWVzWzBdLmRvY3VtZW50LHM9dS5jcmVhdGVFbGVtZW50KFwiZGl2XCIpfWNhdGNoKGYpe3M9bi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHU9bi5ib2R5fXZhciBsPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3ZhciBuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtuLnVuc2hpZnQocyksdS5hcHBlbmRDaGlsZChzKSxzLmFkZEJlaGF2aW9yKFwiI2RlZmF1bHQjdXNlckRhdGFcIikscy5sb2FkKHIpO3ZhciBpPWUuYXBwbHkodCxuKTtyZXR1cm4gdS5yZW1vdmVDaGlsZChzKSxpfX0sYz1uZXcgUmVnRXhwKFwiWyFcXFwiIyQlJicoKSorLC9cXFxcXFxcXDo7PD0+P0BbXFxcXF1eYHt8fX5dXCIsXCJnXCIpO2Z1bmN0aW9uIGgoZSl7cmV0dXJuIGUucmVwbGFjZSgvXmQvLFwiX19fJCZcIikucmVwbGFjZShjLFwiX19fXCIpfXQuc2V0PWwoZnVuY3Rpb24oZSxuLGkpe3JldHVybiBuPWgobiksaT09PXVuZGVmaW5lZD90LnJlbW92ZShuKTooZS5zZXRBdHRyaWJ1dGUobix0LnNlcmlhbGl6ZShpKSksZS5zYXZlKHIpLGkpfSksdC5nZXQ9bChmdW5jdGlvbihlLG4scil7bj1oKG4pO3ZhciBpPXQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUobikpO3JldHVybiBpPT09dW5kZWZpbmVkP3I6aX0pLHQucmVtb3ZlPWwoZnVuY3Rpb24oZSx0KXt0PWgodCksZS5yZW1vdmVBdHRyaWJ1dGUodCksZS5zYXZlKHIpfSksdC5jbGVhcj1sKGZ1bmN0aW9uKGUpe3ZhciB0PWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7ZS5sb2FkKHIpO2Zvcih2YXIgbj0wLGk7aT10W25dO24rKyllLnJlbW92ZUF0dHJpYnV0ZShpLm5hbWUpO2Uuc2F2ZShyKX0pLHQuZ2V0QWxsPWZ1bmN0aW9uKGUpe3ZhciBuPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSx0KXtuW2VdPXR9KSxufSx0LmZvckVhY2g9bChmdW5jdGlvbihlLG4pe3ZhciByPWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7Zm9yKHZhciBpPTAscztzPXJbaV07KytpKW4ocy5uYW1lLHQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUocy5uYW1lKSkpfSl9dHJ5e3ZhciBwPVwiX19zdG9yZWpzX19cIjt0LnNldChwLHApLHQuZ2V0KHApIT1wJiYodC5kaXNhYmxlZD0hMCksdC5yZW1vdmUocCl9Y2F0Y2goZil7dC5kaXNhYmxlZD0hMH10LmVuYWJsZWQ9IXQuZGlzYWJsZWQsdHlwZW9mIG1vZHVsZSE9XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMmJnRoaXMubW9kdWxlIT09bW9kdWxlP21vZHVsZS5leHBvcnRzPXQ6dHlwZW9mIGRlZmluZT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kP2RlZmluZSh0KTplLnN0b3JlPXR9KShGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkpIiwic3RvcmUgPSByZXF1aXJlKCdzdG9yZScpXG5cbiMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIHN0b3JlLmpzIGZvciBlYXN5IHN3YXBwaW5nXG5jbGFzcyBTdG9yYWdlXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWVzcGFjZT0nYWxlcGhiZXQnKSAtPlxuICAgIHRocm93ICdsb2NhbCBzdG9yYWdlIG5vdCBzdXBwb3J0ZWQnIHVubGVzcyBzdG9yZS5lbmFibGVkXG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnbG9kYXNoLmN1c3RvbScpXG5cbmNsYXNzIFV0aWxzXG4gIEBkZWZhdWx0czogXy5kZWZhdWx0c1xuICBAa2V5czogXy5rZXlzXG4gIEBzZXRfZGVidWc6IChAZGVidWcpIC0+XG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIEBkZWJ1Z1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzXG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMuY29mZmVlJylcblN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UuanMuY29mZmVlJylcblxuY2xhc3MgQWxlcGhCZXRcbiAgQG9wdGlvbnMgPSB7ZGVidWc6IGZhbHNlfVxuXG4gIGNsYXNzIEBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuXG4gICAgQF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB2YWx1ZSkgLT5cbiAgICAgIGxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfSwgI3t2YWx1ZX1cIilcbiAgICAgIHRocm93ICdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpXG5cbiAgICBAZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWwpXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuICBjbGFzcyBARXhwZXJpbWVudFxuICAgIEBfb3B0aW9uczpcbiAgICAgIG5hbWU6IG51bGxcbiAgICAgIHZhcmlhbnRzOiBudWxsXG4gICAgICBzYW1wbGU6IDEuMFxuICAgICAgdHJpZ2dlcjogLT4gdHJ1ZVxuICAgICAgdHJhY2tpbmdfYWRhcHRlcjogQWxlcGhCZXQuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgICAgc3RvcmFnZV9hZGFwdGVyOiBBbGVwaEJldC5Mb2NhbFN0b3JhZ2VBZGFwdGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQHZhcmlhbnRzID0gdXRpbHMua2V5cyhAb3B0aW9ucy52YXJpYW50cylcbiAgICAgIF9ydW4uY2FsbCh0aGlzKVxuXG4gICAgcnVuOiAtPlxuICAgICAgbG9nKFwicnVubmluZyB3aXRoIG9wdGlvbnM6ICN7SlNPTi5zdHJpbmdpZnkoQG9wdGlvbnMpfVwiKVxuICAgICAgX2ZvcmNlX3ZhcmlhbnQoKVxuICAgICAgQGFwcGx5X3ZhcmlhbnQoKVxuXG4gICAgX3J1biA9IC0+IEBydW4oKVxuXG4gICAgX2ZvcmNlX3ZhcmlhbnQgPSAtPlxuICAgICAgIyBUT0RPOiBnZXQgdmFyaWFudCBmcm9tIFVSSVxuXG4gICAgYXBwbHlfdmFyaWFudDogLT5cbiAgICAgIHJldHVybiB1bmxlc3MgQG9wdGlvbnMudHJpZ2dlcigpXG4gICAgICBsb2coJ3RyaWdnZXIgc2V0JylcbiAgICAgIHJldHVybiB1bmxlc3MgQGluX3NhbXBsZSgpXG4gICAgICBsb2coJ2luIHNhbXBsZScpXG4gICAgICBpZiB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICAgIGxvZyhcIiN7dmFyaWFudH0gYWN0aXZlXCIpXG4gICAgICBlbHNlXG4gICAgICAgIHZhcmlhbnQgPSBAcGlja192YXJpYW50KClcbiAgICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydChAb3B0aW9ucy5uYW1lLCB2YXJpYW50KVxuICAgICAgQG9wdGlvbnMudmFyaWFudHNbdmFyaWFudF0/LmFjdGl2YXRlKClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICBsb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZShAb3B0aW9ucy5uYW1lLCB2YXJpYW50LCBnb2FsX25hbWUpXG5cbiAgICBnZXRfc3RvcmVkX3ZhcmlhbnQ6IC0+XG4gICAgICBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiKVxuXG4gICAgcGlja192YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50cy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50c1tjaG9zZW5fcGFydGl0aW9uXVxuICAgICAgbG9nKFwiI3t2YXJpYW50fSBwaWNrZWRcIilcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIE1hdGgucmFuZG9tKCkgPD0gQG9wdGlvbnMuc2FtcGxlKVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSA9PlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgc3RvcmFnZTogLT4gQG9wdGlvbnMuc3RvcmFnZV9hZGFwdGVyXG5cbiAgICB0cmFja2luZzogLT4gQG9wdGlvbnMudHJhY2tpbmdfYWRhcHRlclxuXG4gICAgX3ZhbGlkYXRlID0gLT5cbiAgICAgIHRocm93ICdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3ZhcmlhbnRzIG11c3QgYmUgcHJvdmlkZWQnIGlmIEBvcHRpb25zLnZhcmlhbnRzIGlzIG51bGxcbiAgICAgIHRocm93ICd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicgaWYgdHlwZW9mIEBvcHRpb25zLnRyaWdnZXIgaXNudCAnZnVuY3Rpb24nXG5cbiAgY2xhc3MgQEdvYWxcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAcHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuXG4gICAgYWRkX2V4cGVyaW1lbnQ6IChleHBlcmltZW50KSAtPlxuICAgICAgQGV4cGVyaW1lbnRzIHx8PSBbXVxuICAgICAgQGV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudClcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5sb2cgPSAobWVzc2FnZSkgLT5cbiAgdXRpbHMuc2V0X2RlYnVnKEFsZXBoQmV0Lm9wdGlvbnMuZGVidWcpXG4gIHV0aWxzLmxvZyhtZXNzYWdlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXBoQmV0XG4iXX0=
