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
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name, variant + " | Visitors");
    };

    GoogleUniversalAnalyticsAdapter.goal_complete = function(experiment_name, variant, event_name) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name, variant + " | " + event_name);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvbG9kYXNoLmN1c3RvbS5taW4uanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUubWluLmpzIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3N0b3JhZ2UuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3V0aWxzLmpzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9hbGVwaGJldC5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBOztBQ0RBLElBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUdGO0VBQ1MsaUJBQUMsU0FBRDtJQUFDLElBQUMsQ0FBQSxnQ0FBRCxZQUFXO0lBQ3ZCLElBQUEsQ0FBMkMsS0FBSyxDQUFDLE9BQWpEO0FBQUEsWUFBTSw4QkFBTjs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENBQUEsR0FB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QUFnQjthQUNqQixJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsVUFBbEI7SUFGYzs7bUJBSWhCLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsSUFBQyxDQUFBLElBQTFCLEVBQWdDLElBQUMsQ0FBQSxLQUFqQztBQURGOztJQURROzs7Ozs7Ozs7O0FBSWQsR0FBQSxHQUFNLFNBQUMsT0FBRDtFQUNKLEtBQUssQ0FBQyxTQUFOLENBQWdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBakM7U0FDQSxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVY7QUFGSTs7QUFJTixNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBsb2Rhc2ggMy45LjMgKEN1c3RvbSBCdWlsZCkgbG9kYXNoLmNvbS9saWNlbnNlIHwgVW5kZXJzY29yZS5qcyAxLjguMyB1bmRlcnNjb3JlanMub3JnL0xJQ0VOU0VcbiAqIEJ1aWxkOiBgbG9kYXNoIGluY2x1ZGU9XCJrZXlzLGRlZmF1bHRzXCIgZXhwb3J0cz1cIm5vZGVcIiAtbyAuL2xpYi9sb2Rhc2guY3VzdG9tLmpzYFxuICovXG47KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0KXtyZXR1cm4gdHlwZW9mIHQ9PVwiZnVuY3Rpb25cInx8ZmFsc2V9ZnVuY3Rpb24gbih0KXtyZXR1cm4hIXQmJnR5cGVvZiB0PT1cIm9iamVjdFwifWZ1bmN0aW9uIHIoKXt9ZnVuY3Rpb24gZSh0LG4pe3JldHVybiB0PT09aj9uOnR9ZnVuY3Rpb24gbyh0LG4pe3JldHVybiB0eXBlb2YgdCE9XCJmdW5jdGlvblwiP3Y6bj09PWo/dDpmdW5jdGlvbihyLGUsbyx1LGMpe3JldHVybiB0LmNhbGwobixyLGUsbyx1LGMpfX1mdW5jdGlvbiB1KHQsbil7dmFyIHI9bnVsbD09dD9qOnRbbl07cmV0dXJuIHkocik/cjpqfWZ1bmN0aW9uIGModCl7cmV0dXJuIG51bGwhPXQmJmkoVyh0KSl9ZnVuY3Rpb24gbCh0LG4pe3JldHVybiB0PXR5cGVvZiB0PT1cIm51bWJlclwifHwkLnRlc3QodCk/K3Q6LTEsbj1udWxsPT1uP0o6biwtMTx0JiYwPT10JTEmJnQ8bn1mdW5jdGlvbiBpKHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmLTE8dCYmMD09dCUxJiZ0PD1KfWZ1bmN0aW9uIGEodCl7XG5mb3IodmFyIG49aCh0KSxyPW4ubGVuZ3RoLGU9ciYmdC5sZW5ndGgsbz0hIWUmJmkoZSkmJihYKHQpfHxzKHQpfHxnKHQpKSx1PS0xLGM9W107Kyt1PHI7KXt2YXIgYT1uW3VdOyhvJiZsKGEsZSl8fFUuY2FsbCh0LGEpKSYmYy5wdXNoKGEpfXJldHVybiBjfWZ1bmN0aW9uIGYodCxuKXtpZih0eXBlb2YgdCE9XCJmdW5jdGlvblwiKXRocm93IG5ldyBUeXBlRXJyb3IobSk7cmV0dXJuIG49SChuPT09aj90Lmxlbmd0aC0xOitufHwwLDApLGZ1bmN0aW9uKCl7Zm9yKHZhciByPWFyZ3VtZW50cyxlPS0xLG89SChyLmxlbmd0aC1uLDApLHU9QXJyYXkobyk7KytlPG87KXVbZV09cltuK2VdO3N3aXRjaChuKXtjYXNlIDA6cmV0dXJuIHQuY2FsbCh0aGlzLHUpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKHRoaXMsclswXSx1KTtjYXNlIDI6cmV0dXJuIHQuY2FsbCh0aGlzLHJbMF0sclsxXSx1KX1mb3Iobz1BcnJheShuKzEpLGU9LTE7KytlPG47KW9bZV09cltlXTtyZXR1cm4gb1tuXT11LHQuYXBwbHkodGhpcyxvKTtcbn19ZnVuY3Rpb24gcyh0KXtyZXR1cm4gbih0KSYmYyh0KSYmVi5jYWxsKHQpPT1PfWZ1bmN0aW9uIHAodCl7dmFyIG49dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09bnx8XCJmdW5jdGlvblwiPT1uKX1mdW5jdGlvbiB5KHQpe3JldHVybiBudWxsPT10P2ZhbHNlOlYuY2FsbCh0KT09eD9fLnRlc3QoTS5jYWxsKHQpKTpuKHQpJiYoTih0KT9fOlApLnRlc3QodCl9ZnVuY3Rpb24gZyh0KXtyZXR1cm4gdHlwZW9mIHQ9PVwic3RyaW5nXCJ8fG4odCkmJlYuY2FsbCh0KT09RX1mdW5jdGlvbiBoKHQpe2lmKG51bGw9PXQpcmV0dXJuW107cCh0KXx8KHQ9T2JqZWN0KHQpKTtmb3IodmFyIG49dC5sZW5ndGgsZT1yLnN1cHBvcnQsbj1uJiZpKG4pJiYoWCh0KXx8cyh0KXx8Zyh0KSkmJm58fDAsbz10LmNvbnN0cnVjdG9yLHU9LTEsbz1ZKG8pJiZvLnByb3RvdHlwZXx8QixjPW89PT10LGE9QXJyYXkobiksZj0wPG4seT1lLmVudW1FcnJvclByb3BzJiYodD09PUx8fHQgaW5zdGFuY2VvZiBFcnJvciksaD1lLmVudW1Qcm90b3R5cGVzJiZZKHQpOysrdTxuOylhW3VdPXUrXCJcIjtcbmZvcih2YXIgYiBpbiB0KWgmJlwicHJvdG90eXBlXCI9PWJ8fHkmJihcIm1lc3NhZ2VcIj09Ynx8XCJuYW1lXCI9PWIpfHxmJiZsKGIsbil8fFwiY29uc3RydWN0b3JcIj09YiYmKGN8fCFVLmNhbGwodCxiKSl8fGEucHVzaChiKTtpZihlLm5vbkVudW1TaGFkb3dzJiZ0IT09Qilmb3Iobj10PT09RD9FOnQ9PT1MP2Q6Vi5jYWxsKHQpLGU9S1tuXXx8S1t3XSxuPT13JiYobz1CKSxuPVIubGVuZ3RoO24tLTspYj1SW25dLHU9ZVtiXSxjJiZ1fHwodT8hVS5jYWxsKHQsYik6dFtiXT09PW9bYl0pfHxhLnB1c2goYik7cmV0dXJuIGF9ZnVuY3Rpb24gYih0KXtyZXR1cm4odD10eXBlb2YgdD09XCJzdHJpbmdcIj90Om51bGw9PXQ/XCJcIjp0K1wiXCIpJiZBLnRlc3QodCk/dC5yZXBsYWNlKFMsXCJcXFxcJCZcIik6dH1mdW5jdGlvbiB2KHQpe3JldHVybiB0fXZhciBqLG09XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsTz1cIltvYmplY3QgQXJndW1lbnRzXVwiLGQ9XCJbb2JqZWN0IEVycm9yXVwiLHg9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLHc9XCJbb2JqZWN0IE9iamVjdF1cIixFPVwiW29iamVjdCBTdHJpbmddXCIsUz0vWy4qKz9eJHt9KCl8W1xcXVxcL1xcXFxdL2csQT1SZWdFeHAoUy5zb3VyY2UpLFA9L15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLywkPS9eXFxkKyQvLFI9XCJjb25zdHJ1Y3RvciBoYXNPd25Qcm9wZXJ0eSBpc1Byb3RvdHlwZU9mIHByb3BlcnR5SXNFbnVtZXJhYmxlIHRvTG9jYWxlU3RyaW5nIHRvU3RyaW5nIHZhbHVlT2ZcIi5zcGxpdChcIiBcIiksVD17XG5cImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0sST1UW3R5cGVvZiBleHBvcnRzXSYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsaz1UW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxDPVRbdHlwZW9mIHNlbGZdJiZzZWxmJiZzZWxmLk9iamVjdCYmc2VsZixGPVRbdHlwZW9mIHdpbmRvd10mJndpbmRvdyYmd2luZG93Lk9iamVjdCYmd2luZG93LFQ9ayYmay5leHBvcnRzPT09SSYmSSxDPUkmJmsmJnR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdCYmZ2xvYmFsfHxGIT09KHRoaXMmJnRoaXMud2luZG93KSYmRnx8Q3x8dGhpcyxOPWZ1bmN0aW9uKCl7dHJ5e09iamVjdCh7dG9TdHJpbmc6MH0rXCJcIil9Y2F0Y2godCl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfX1yZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0LnRvU3RyaW5nIT1cImZ1bmN0aW9uXCImJnR5cGVvZih0K1wiXCIpPT1cInN0cmluZ1wiO1xufX0oKSxGPUFycmF5LnByb3RvdHlwZSxMPUVycm9yLnByb3RvdHlwZSxCPU9iamVjdC5wcm90b3R5cGUsRD1TdHJpbmcucHJvdG90eXBlLE09RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLFU9Qi5oYXNPd25Qcm9wZXJ0eSxWPUIudG9TdHJpbmcsXz1SZWdFeHAoXCJeXCIrYihNLmNhbGwoVSkpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIikscT1CLnByb3BlcnR5SXNFbnVtZXJhYmxlLHo9Ri5zcGxpY2UsQz11KEMsXCJVaW50OEFycmF5XCIpLEY9dShBcnJheSxcImlzQXJyYXlcIiksRz11KE9iamVjdCxcImtleXNcIiksSD1NYXRoLm1heCxKPTkwMDcxOTkyNTQ3NDA5OTEsSz17fTtLW1wiW29iamVjdCBBcnJheV1cIl09S1tcIltvYmplY3QgRGF0ZV1cIl09S1tcIltvYmplY3QgTnVtYmVyXVwiXT17Y29uc3RydWN0b3I6dHJ1ZSx0b0xvY2FsZVN0cmluZzp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfSxLW1wiW29iamVjdCBCb29sZWFuXVwiXT1LW0VdPXtcbmNvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LEtbZF09S1t4XT1LW1wiW29iamVjdCBSZWdFeHBdXCJdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWV9LEtbd109e2NvbnN0cnVjdG9yOnRydWV9LGZ1bmN0aW9uKHQsbil7Zm9yKHZhciByPS0xLGU9dC5sZW5ndGg7KytyPGUmJmZhbHNlIT09bih0W3JdLHIsdCk7KTtyZXR1cm4gdH0oUixmdW5jdGlvbih0KXtmb3IodmFyIG4gaW4gSylpZihVLmNhbGwoSyxuKSl7dmFyIHI9S1tuXTtyW3RdPVUuY2FsbChyLHQpfX0pO3ZhciBRPXIuc3VwcG9ydD17fTshZnVuY3Rpb24odCl7ZnVuY3Rpb24gbigpe3RoaXMueD10fXZhciByPXswOnQsbGVuZ3RoOnR9LGU9W107bi5wcm90b3R5cGU9e3ZhbHVlT2Y6dCx5OnR9O2Zvcih2YXIgbyBpbiBuZXcgbillLnB1c2gobyk7US5hcmdzVGFnPVYuY2FsbChhcmd1bWVudHMpPT1PLFEuZW51bUVycm9yUHJvcHM9cS5jYWxsKEwsXCJtZXNzYWdlXCIpfHxxLmNhbGwoTCxcIm5hbWVcIiksUS5lbnVtUHJvdG90eXBlcz1xLmNhbGwobixcInByb3RvdHlwZVwiKSxcblEubm9uRW51bVNoYWRvd3M9IS92YWx1ZU9mLy50ZXN0KGUpLFEuc3BsaWNlT2JqZWN0cz0oei5jYWxsKHIsMCwxKSwhclswXSksUS51bmluZGV4ZWRDaGFycz1cInh4XCIhPVwieFwiWzBdK09iamVjdChcInhcIilbMF19KDEsMCk7dmFyIFc9ZnVuY3Rpb24odCl7cmV0dXJuIGZ1bmN0aW9uKG4pe2lmKG51bGw9PW4pbj1qO2Vsc2V7aWYoci5zdXBwb3J0LnVuaW5kZXhlZENoYXJzJiZnKG4pKXtmb3IodmFyIGU9LTEsbz1uLmxlbmd0aCx1PU9iamVjdChuKTsrK2U8bzspdVtlXT1uLmNoYXJBdChlKTtuPXV9ZWxzZSBuPXAobik/bjpPYmplY3Qobik7bj1uW3RdfXJldHVybiBufX0oXCJsZW5ndGhcIik7US5hcmdzVGFnfHwocz1mdW5jdGlvbih0KXtyZXR1cm4gbih0KSYmYyh0KSYmVS5jYWxsKHQsXCJjYWxsZWVcIikmJiFxLmNhbGwodCxcImNhbGxlZVwiKX0pO3ZhciBYPUZ8fGZ1bmN0aW9uKHQpe3JldHVybiBuKHQpJiZpKHQubGVuZ3RoKSYmXCJbb2JqZWN0IEFycmF5XVwiPT1WLmNhbGwodCl9LFk9dCgveC8pfHxDJiYhdChDKT9mdW5jdGlvbih0KXtcbnJldHVybiBWLmNhbGwodCk9PXh9OnQsWj1mdW5jdGlvbih0KXtyZXR1cm4gZihmdW5jdGlvbihuLHIpe3ZhciBlPS0xLHU9bnVsbD09bj8wOnIubGVuZ3RoLGk9Mjx1P3JbdS0yXTpqLGE9Mjx1P3JbMl06aixmPTE8dT9yW3UtMV06ajtpZih0eXBlb2YgaT09XCJmdW5jdGlvblwiPyhpPW8oaSxmKSx1LT0yKTooaT10eXBlb2YgZj09XCJmdW5jdGlvblwiP2Y6aix1LT1pPzE6MCksZj1hKXt2YXIgZj1yWzBdLHM9clsxXTtpZihwKGEpKXt2YXIgeT10eXBlb2YgczsoXCJudW1iZXJcIj09eT9jKGEpJiZsKHMsYS5sZW5ndGgpOlwic3RyaW5nXCI9PXkmJnMgaW4gYSk/KGE9YVtzXSxmPWY9PT1mP2Y9PT1hOmEhPT1hKTpmPWZhbHNlfWVsc2UgZj1mYWxzZX1mb3IoZiYmKGk9Mz51P2o6aSx1PTEpOysrZTx1OykoYT1yW2VdKSYmdChuLGEsaSk7cmV0dXJuIG59KX0oZnVuY3Rpb24odCxuLHIpe2lmKHIpZm9yKHZhciBlPS0xLG89dHQobiksdT1vLmxlbmd0aDsrK2U8dTspe3ZhciBjPW9bZV0sbD10W2NdLGk9cihsLG5bY10sYyx0LG4pO1xuKGk9PT1pP2k9PT1sOmwhPT1sKSYmKGwhPT1qfHxjIGluIHQpfHwodFtjXT1pKX1lbHNlIGlmKG51bGwhPW4pZm9yKHI9dHQobiksdHx8KHQ9e30pLGU9LTEsbz1yLmxlbmd0aDsrK2U8bzspdT1yW2VdLHRbdV09blt1XTtyZXR1cm4gbj10fSksQz1mKGZ1bmN0aW9uKHQpe3ZhciBuPXRbMF07cmV0dXJuIG51bGw9PW4/bjoodC5wdXNoKGUpLFouYXBwbHkoaix0KSl9KSx0dD1HP2Z1bmN0aW9uKHQpe3ZhciBuPW51bGw9PXQ/bnVsbDp0LmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2Ygbj09XCJmdW5jdGlvblwiJiZuLnByb3RvdHlwZT09PXR8fCh0eXBlb2YgdD09XCJmdW5jdGlvblwiP3Iuc3VwcG9ydC5lbnVtUHJvdG90eXBlczpjKHQpKT9hKHQpOnAodCk/Ryh0KTpbXX06YTtyLmFzc2lnbj1aLHIuZGVmYXVsdHM9QyxyLmtleXM9dHQsci5rZXlzSW49aCxyLnJlc3RQYXJhbT1mLHIuZXh0ZW5kPVosci5lc2NhcGVSZWdFeHA9YixyLmlkZW50aXR5PXYsci5pc0FyZ3VtZW50cz1zLHIuaXNBcnJheT1YLFxuci5pc0Z1bmN0aW9uPVksci5pc05hdGl2ZT15LHIuaXNPYmplY3Q9cCxyLmlzU3RyaW5nPWcsci5WRVJTSU9OPVwiMy45LjNcIixJJiZrJiZUJiYoKGsuZXhwb3J0cz1yKS5fPXIpfSkuY2FsbCh0aGlzKTsiLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBNYXJjdXMgV2VzdGluICovXG4oZnVuY3Rpb24oZSl7ZnVuY3Rpb24gbygpe3RyeXtyZXR1cm4gciBpbiBlJiZlW3JdfWNhdGNoKHQpe3JldHVybiExfX12YXIgdD17fSxuPWUuZG9jdW1lbnQscj1cImxvY2FsU3RvcmFnZVwiLGk9XCJzY3JpcHRcIixzO3QuZGlzYWJsZWQ9ITEsdC52ZXJzaW9uPVwiMS4zLjE3XCIsdC5zZXQ9ZnVuY3Rpb24oZSx0KXt9LHQuZ2V0PWZ1bmN0aW9uKGUsdCl7fSx0Lmhhcz1mdW5jdGlvbihlKXtyZXR1cm4gdC5nZXQoZSkhPT11bmRlZmluZWR9LHQucmVtb3ZlPWZ1bmN0aW9uKGUpe30sdC5jbGVhcj1mdW5jdGlvbigpe30sdC50cmFuc2FjdD1mdW5jdGlvbihlLG4scil7cj09bnVsbCYmKHI9bixuPW51bGwpLG49PW51bGwmJihuPXt9KTt2YXIgaT10LmdldChlLG4pO3IoaSksdC5zZXQoZSxpKX0sdC5nZXRBbGw9ZnVuY3Rpb24oKXt9LHQuZm9yRWFjaD1mdW5jdGlvbigpe30sdC5zZXJpYWxpemU9ZnVuY3Rpb24oZSl7cmV0dXJuIEpTT04uc3RyaW5naWZ5KGUpfSx0LmRlc2VyaWFsaXplPWZ1bmN0aW9uKGUpe2lmKHR5cGVvZiBlIT1cInN0cmluZ1wiKXJldHVybiB1bmRlZmluZWQ7dHJ5e3JldHVybiBKU09OLnBhcnNlKGUpfWNhdGNoKHQpe3JldHVybiBlfHx1bmRlZmluZWR9fTtpZihvKCkpcz1lW3JdLHQuc2V0PWZ1bmN0aW9uKGUsbil7cmV0dXJuIG49PT11bmRlZmluZWQ/dC5yZW1vdmUoZSk6KHMuc2V0SXRlbShlLHQuc2VyaWFsaXplKG4pKSxuKX0sdC5nZXQ9ZnVuY3Rpb24oZSxuKXt2YXIgcj10LmRlc2VyaWFsaXplKHMuZ2V0SXRlbShlKSk7cmV0dXJuIHI9PT11bmRlZmluZWQ/bjpyfSx0LnJlbW92ZT1mdW5jdGlvbihlKXtzLnJlbW92ZUl0ZW0oZSl9LHQuY2xlYXI9ZnVuY3Rpb24oKXtzLmNsZWFyKCl9LHQuZ2V0QWxsPWZ1bmN0aW9uKCl7dmFyIGU9e307cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0LG4pe2VbdF09bn0pLGV9LHQuZm9yRWFjaD1mdW5jdGlvbihlKXtmb3IodmFyIG49MDtuPHMubGVuZ3RoO24rKyl7dmFyIHI9cy5rZXkobik7ZShyLHQuZ2V0KHIpKX19O2Vsc2UgaWYobi5kb2N1bWVudEVsZW1lbnQuYWRkQmVoYXZpb3Ipe3ZhciB1LGE7dHJ5e2E9bmV3IEFjdGl2ZVhPYmplY3QoXCJodG1sZmlsZVwiKSxhLm9wZW4oKSxhLndyaXRlKFwiPFwiK2krXCI+ZG9jdW1lbnQudz13aW5kb3c8L1wiK2krJz48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpLGEuY2xvc2UoKSx1PWEudy5mcmFtZXNbMF0uZG9jdW1lbnQscz11LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIil9Y2F0Y2goZil7cz1uLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdT1uLmJvZHl9dmFyIGw9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIG49QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDApO24udW5zaGlmdChzKSx1LmFwcGVuZENoaWxkKHMpLHMuYWRkQmVoYXZpb3IoXCIjZGVmYXVsdCN1c2VyRGF0YVwiKSxzLmxvYWQocik7dmFyIGk9ZS5hcHBseSh0LG4pO3JldHVybiB1LnJlbW92ZUNoaWxkKHMpLGl9fSxjPW5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIixcImdcIik7ZnVuY3Rpb24gaChlKXtyZXR1cm4gZS5yZXBsYWNlKC9eZC8sXCJfX18kJlwiKS5yZXBsYWNlKGMsXCJfX19cIil9dC5zZXQ9bChmdW5jdGlvbihlLG4saSl7cmV0dXJuIG49aChuKSxpPT09dW5kZWZpbmVkP3QucmVtb3ZlKG4pOihlLnNldEF0dHJpYnV0ZShuLHQuc2VyaWFsaXplKGkpKSxlLnNhdmUociksaSl9KSx0LmdldD1sKGZ1bmN0aW9uKGUsbixyKXtuPWgobik7dmFyIGk9dC5kZXNlcmlhbGl6ZShlLmdldEF0dHJpYnV0ZShuKSk7cmV0dXJuIGk9PT11bmRlZmluZWQ/cjppfSksdC5yZW1vdmU9bChmdW5jdGlvbihlLHQpe3Q9aCh0KSxlLnJlbW92ZUF0dHJpYnV0ZSh0KSxlLnNhdmUocil9KSx0LmNsZWFyPWwoZnVuY3Rpb24oZSl7dmFyIHQ9ZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlcztlLmxvYWQocik7Zm9yKHZhciBuPTAsaTtpPXRbbl07bisrKWUucmVtb3ZlQXR0cmlidXRlKGkubmFtZSk7ZS5zYXZlKHIpfSksdC5nZXRBbGw9ZnVuY3Rpb24oZSl7dmFyIG49e307cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbihlLHQpe25bZV09dH0pLG59LHQuZm9yRWFjaD1sKGZ1bmN0aW9uKGUsbil7dmFyIHI9ZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlcztmb3IodmFyIGk9MCxzO3M9cltpXTsrK2kpbihzLm5hbWUsdC5kZXNlcmlhbGl6ZShlLmdldEF0dHJpYnV0ZShzLm5hbWUpKSl9KX10cnl7dmFyIHA9XCJfX3N0b3JlanNfX1wiO3Quc2V0KHAscCksdC5nZXQocCkhPXAmJih0LmRpc2FibGVkPSEwKSx0LnJlbW92ZShwKX1jYXRjaChmKXt0LmRpc2FibGVkPSEwfXQuZW5hYmxlZD0hdC5kaXNhYmxlZCx0eXBlb2YgbW9kdWxlIT1cInVuZGVmaW5lZFwiJiZtb2R1bGUuZXhwb3J0cyYmdGhpcy5tb2R1bGUhPT1tb2R1bGU/bW9kdWxlLmV4cG9ydHM9dDp0eXBlb2YgZGVmaW5lPT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQ/ZGVmaW5lKHQpOmUuc3RvcmU9dH0pKEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSkiLCJzdG9yZSA9IHJlcXVpcmUoJ3N0b3JlJylcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgc3RvcmUuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgdGhyb3cgJ2xvY2FsIHN0b3JhZ2Ugbm90IHN1cHBvcnRlZCcgdW5sZXNzIHN0b3JlLmVuYWJsZWRcbiAgICBAc3RvcmFnZSA9IHN0b3JlLmdldChAbmFtZXNwYWNlKSB8fCB7fVxuICBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgIEBzdG9yYWdlW2tleV0gPSB2YWx1ZVxuICAgIHN0b3JlLnNldChAbmFtZXNwYWNlLCBAc3RvcmFnZSlcbiAgICByZXR1cm4gdmFsdWVcbiAgZ2V0OiAoa2V5KSAtPlxuICAgIEBzdG9yYWdlW2tleV1cbiAgICAjIHN0b3JlLmdldChcIiN7QG5hbWVzcGFjZX06I3trZXl9XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBOT1RFOiB1c2luZyBhIGN1c3RvbSBidWlsZCBvZiBsb2Rhc2gsIHRvIHNhdmUgc3BhY2Vcbl8gPSByZXF1aXJlKCdsb2Rhc2guY3VzdG9tJylcblxuY2xhc3MgVXRpbHNcbiAgQGRlZmF1bHRzOiBfLmRlZmF1bHRzXG4gIEBrZXlzOiBfLmtleXNcbiAgQHNldF9kZWJ1ZzogKEBkZWJ1ZykgLT5cbiAgQGxvZzogKG1lc3NhZ2UpIC0+XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSkgaWYgQGRlYnVnXG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcy5jb2ZmZWUnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS5qcy5jb2ZmZWUnKVxuXG5jbGFzcyBBbGVwaEJldFxuICBAb3B0aW9ucyA9IHtkZWJ1ZzogZmFsc2V9XG5cbiAgY2xhc3MgQEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG5cbiAgICBAX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKSAtPlxuICAgICAgbG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9LCAje3ZhbHVlfVwiKVxuICAgICAgdGhyb3cgJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JyBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBnYSgnc2VuZCcsICdldmVudCcsIGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB2YWx1ZSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBleHBlcmltZW50X25hbWUsIFwiI3t2YXJpYW50fSB8IFZpc2l0b3JzXCIpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZXZlbnRfbmFtZSkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgZXhwZXJpbWVudF9uYW1lLCBcIiN7dmFyaWFudH0gfCAje2V2ZW50X25hbWV9XCIpXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuICBjbGFzcyBARXhwZXJpbWVudFxuICAgIEBfb3B0aW9uczpcbiAgICAgIG5hbWU6IG51bGxcbiAgICAgIHZhcmlhbnRzOiBudWxsXG4gICAgICBzYW1wbGU6IDEuMFxuICAgICAgdHJpZ2dlcjogLT4gdHJ1ZVxuICAgICAgdHJhY2tpbmdfYWRhcHRlcjogQWxlcGhCZXQuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgICAgc3RvcmFnZV9hZGFwdGVyOiBBbGVwaEJldC5Mb2NhbFN0b3JhZ2VBZGFwdGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQHZhcmlhbnRzID0gdXRpbHMua2V5cyhAb3B0aW9ucy52YXJpYW50cylcbiAgICAgIF9ydW4uY2FsbCh0aGlzKVxuXG4gICAgcnVuOiAtPlxuICAgICAgbG9nKFwicnVubmluZyB3aXRoIG9wdGlvbnM6ICN7QG9wdGlvbnN9XCIpXG4gICAgICBfZm9yY2VfdmFyaWFudCgpXG4gICAgICBAYXBwbHlfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBfZm9yY2VfdmFyaWFudCA9IC0+XG4gICAgICAjIFRPRE86IGdldCB2YXJpYW50IGZyb20gVVJJXG5cbiAgICBhcHBseV92YXJpYW50OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAb3B0aW9ucy50cmlnZ2VyKClcbiAgICAgIGxvZygndHJpZ2dlciBzZXQnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaW5fc2FtcGxlKClcbiAgICAgIGxvZygnaW4gc2FtcGxlJylcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgbG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgIGVsc2VcbiAgICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgICBAdHJhY2tpbmcoKS5leHBlcmltZW50X3N0YXJ0KEBvcHRpb25zLm5hbWUsIHZhcmlhbnQpXG4gICAgICBAb3B0aW9ucy52YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUoKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGdvYWxfbmFtZSwgcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICByZXR1cm4gaWYgcHJvcHMudW5pcXVlICYmIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIilcbiAgICAgIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgIHJldHVybiB1bmxlc3MgdmFyaWFudFxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiLCB0cnVlKSBpZiBwcm9wcy51bmlxdWVcbiAgICAgIGxvZyhcImV4cGVyaW1lbnQ6ICN7QG9wdGlvbnMubmFtZX0gdmFyaWFudDoje3ZhcmlhbnR9IGdvYWw6I3tnb2FsX25hbWV9IGNvbXBsZXRlXCIpXG4gICAgICBAdHJhY2tpbmcoKS5nb2FsX2NvbXBsZXRlKEBvcHRpb25zLm5hbWUsIHZhcmlhbnQsIGdvYWxfbmFtZSlcblxuICAgIGdldF9zdG9yZWRfdmFyaWFudDogLT5cbiAgICAgIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIpXG5cbiAgICBwaWNrX3ZhcmlhbnQ6IC0+XG4gICAgICBwYXJ0aXRpb25zID0gMS4wIC8gQHZhcmlhbnRzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICBsb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgIGluX3NhbXBsZTogLT5cbiAgICAgIGFjdGl2ZSA9IEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIilcbiAgICAgIHJldHVybiBhY3RpdmUgdW5sZXNzIHR5cGVvZiBhY3RpdmUgaXMgJ3VuZGVmaW5lZCdcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIiwgTWF0aC5yYW5kb20oKSA8PSBAb3B0aW9ucy5zYW1wbGUpXG5cbiAgICBhZGRfZ29hbDogKGdvYWwpID0+XG4gICAgICBnb2FsLmFkZF9leHBlcmltZW50KHRoaXMpXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcgaWYgQG9wdGlvbnMubmFtZSBpcyBudWxsXG4gICAgICB0aHJvdyAndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3RyaWdnZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMgfHw9IFtdXG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgY29tcGxldGU6IC0+XG4gICAgICBmb3IgZXhwZXJpbWVudCBpbiBAZXhwZXJpbWVudHNcbiAgICAgICAgZXhwZXJpbWVudC5nb2FsX2NvbXBsZXRlKEBuYW1lLCBAcHJvcHMpXG5cbmxvZyA9IChtZXNzYWdlKSAtPlxuICB1dGlscy5zZXRfZGVidWcoQWxlcGhCZXQub3B0aW9ucy5kZWJ1ZylcbiAgdXRpbHMubG9nKG1lc3NhZ2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiJdfQ==
