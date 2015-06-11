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

    GoogleUniversalAnalyticsAdapter._track = function(category, action, label, value) {
      log("Google Universal Analytics track: " + category + ", " + action + ", " + label + ", " + value);
      if (typeof ga !== 'function') {
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
      }
      return ga('send', 'event', category, action, label, value);
    };

    GoogleUniversalAnalyticsAdapter.onInitialize = function(experiment_namespace, experiment_name, variant) {
      return GoogleUniversalAnalyticsAdapter._track(experiment_namespace, experiment_name, variant + " | Visitors");
    };

    GoogleUniversalAnalyticsAdapter.onEvent = function(experiment_namespace, experiment_name, variant, event_name) {
      return GoogleUniversalAnalyticsAdapter._track(experiment_namespace, experiment_name, variant + " | " + event_name);
    };

    return GoogleUniversalAnalyticsAdapter;

  })();

  AlephBet.LocalStorageAdapter = (function() {
    function LocalStorageAdapter() {}

    LocalStorageAdapter.set = function(namespace, key, value) {
      return new Storage(namespace).set(key, value);
    };

    LocalStorageAdapter.get = function(namespace, key) {
      return new Storage(namespace).get(key);
    };

    return LocalStorageAdapter;

  })();

  AlephBet.Experiment = (function() {
    var _force_variant, _run, _validate;

    Experiment._options = {
      name: null,
      namespace: 'alephbet',
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
        this.tracking().onInitialize(this.options.namespace, this.options.name, variant);
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
      if (props.unique && this.storage().get(this.options.namespace, this.options.name + ":" + goal_name)) {
        return;
      }
      variant = this.get_stored_variant();
      if (!variant) {
        return;
      }
      if (props.unique) {
        this.storage().set(this.options.namespace, this.options.name + ":" + goal_name, true);
      }
      log("experiment: " + this.options.name + " variant:" + variant + " goal:" + goal_name + " complete");
      return this.tracking().onEvent(this.options.namespace, this.options.name, variant, goal_name);
    };

    Experiment.prototype.get_stored_variant = function() {
      return this.storage().get(this.options.namespace, this.options.name + ":variant");
    };

    Experiment.prototype.pick_variant = function() {
      var chosen_partition, partitions, variant;
      partitions = 1.0 / this.variants.length;
      chosen_partition = Math.floor(Math.random() / partitions);
      variant = this.variants[chosen_partition];
      log(variant + " picked");
      return this.storage().set(this.options.namespace, this.options.name + ":variant", variant);
    };

    Experiment.prototype.in_sample = function() {
      var active;
      active = this.storage().get(this.options.namespace, this.options.name + ":in_sample");
      if (typeof active !== 'undefined') {
        return active;
      }
      return this.storage().set(this.options.namespace, this.options.name + ":in_sample", Math.random() <= this.options.sample);
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
      if (this.options.namespace === null) {
        throw 'an experiment namespace must be specified';
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvbG9kYXNoLmN1c3RvbS5taW4uanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUubWluLmpzIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3N0b3JhZ2UuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3V0aWxzLmpzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9hbGVwaGJldC5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBOztBQ0RBLElBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUdGO0VBQ1MsaUJBQUMsU0FBRDtJQUFDLElBQUMsQ0FBQSxnQ0FBRCxZQUFXO0lBQ3ZCLElBQUEsQ0FBMkMsS0FBSyxDQUFDLE9BQWpEO0FBQUEsWUFBTSw4QkFBTjs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENBQUEsR0FB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Q2pCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixVQUFsQjtJQUZjOzttQkFJaEIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDRSxVQUFVLENBQUMsYUFBWCxDQUF5QixJQUFDLENBQUEsSUFBMUIsRUFBZ0MsSUFBQyxDQUFBLEtBQWpDO0FBREY7O0lBRFE7Ozs7Ozs7Ozs7QUFJZCxHQUFBLEdBQU0sU0FBQyxPQUFEO0VBQ0osS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFqQztTQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVjtBQUZJOztBQUlOLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIGxvZGFzaCAzLjkuMyAoQ3VzdG9tIEJ1aWxkKSBsb2Rhc2guY29tL2xpY2Vuc2UgfCBVbmRlcnNjb3JlLmpzIDEuOC4zIHVuZGVyc2NvcmVqcy5vcmcvTElDRU5TRVxuICogQnVpbGQ6IGBsb2Rhc2ggaW5jbHVkZT1cImtleXMsZGVmYXVsdHNcIiBleHBvcnRzPVwibm9kZVwiIC1vIC4vbGliL2xvZGFzaC5jdXN0b20uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQpe3JldHVybiB0eXBlb2YgdD09XCJmdW5jdGlvblwifHxmYWxzZX1mdW5jdGlvbiBuKHQpe3JldHVybiEhdCYmdHlwZW9mIHQ9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gcigpe31mdW5jdGlvbiBlKHQsbil7cmV0dXJuIHQ9PT1qP246dH1mdW5jdGlvbiBvKHQsbil7cmV0dXJuIHR5cGVvZiB0IT1cImZ1bmN0aW9uXCI/djpuPT09aj90OmZ1bmN0aW9uKHIsZSxvLHUsYyl7cmV0dXJuIHQuY2FsbChuLHIsZSxvLHUsYyl9fWZ1bmN0aW9uIHUodCxuKXt2YXIgcj1udWxsPT10P2o6dFtuXTtyZXR1cm4geShyKT9yOmp9ZnVuY3Rpb24gYyh0KXtyZXR1cm4gbnVsbCE9dCYmaShXKHQpKX1mdW5jdGlvbiBsKHQsbil7cmV0dXJuIHQ9dHlwZW9mIHQ9PVwibnVtYmVyXCJ8fCQudGVzdCh0KT8rdDotMSxuPW51bGw9PW4/SjpuLC0xPHQmJjA9PXQlMSYmdDxufWZ1bmN0aW9uIGkodCl7cmV0dXJuIHR5cGVvZiB0PT1cIm51bWJlclwiJiYtMTx0JiYwPT10JTEmJnQ8PUp9ZnVuY3Rpb24gYSh0KXtcbmZvcih2YXIgbj1oKHQpLHI9bi5sZW5ndGgsZT1yJiZ0Lmxlbmd0aCxvPSEhZSYmaShlKSYmKFgodCl8fHModCl8fGcodCkpLHU9LTEsYz1bXTsrK3U8cjspe3ZhciBhPW5bdV07KG8mJmwoYSxlKXx8VS5jYWxsKHQsYSkpJiZjLnB1c2goYSl9cmV0dXJuIGN9ZnVuY3Rpb24gZih0LG4pe2lmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihtKTtyZXR1cm4gbj1IKG49PT1qP3QubGVuZ3RoLTE6K258fDAsMCksZnVuY3Rpb24oKXtmb3IodmFyIHI9YXJndW1lbnRzLGU9LTEsbz1IKHIubGVuZ3RoLW4sMCksdT1BcnJheShvKTsrK2U8bzspdVtlXT1yW24rZV07c3dpdGNoKG4pe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKHRoaXMsdSk7Y2FzZSAxOnJldHVybiB0LmNhbGwodGhpcyxyWzBdLHUpO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKHRoaXMsclswXSxyWzFdLHUpfWZvcihvPUFycmF5KG4rMSksZT0tMTsrK2U8bjspb1tlXT1yW2VdO3JldHVybiBvW25dPXUsdC5hcHBseSh0aGlzLG8pO1xufX1mdW5jdGlvbiBzKHQpe3JldHVybiBuKHQpJiZjKHQpJiZWLmNhbGwodCk9PU99ZnVuY3Rpb24gcCh0KXt2YXIgbj10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1ufHxcImZ1bmN0aW9uXCI9PW4pfWZ1bmN0aW9uIHkodCl7cmV0dXJuIG51bGw9PXQ/ZmFsc2U6Vi5jYWxsKHQpPT14P18udGVzdChNLmNhbGwodCkpOm4odCkmJihOKHQpP186UCkudGVzdCh0KX1mdW5jdGlvbiBnKHQpe3JldHVybiB0eXBlb2YgdD09XCJzdHJpbmdcInx8bih0KSYmVi5jYWxsKHQpPT1FfWZ1bmN0aW9uIGgodCl7aWYobnVsbD09dClyZXR1cm5bXTtwKHQpfHwodD1PYmplY3QodCkpO2Zvcih2YXIgbj10Lmxlbmd0aCxlPXIuc3VwcG9ydCxuPW4mJmkobikmJihYKHQpfHxzKHQpfHxnKHQpKSYmbnx8MCxvPXQuY29uc3RydWN0b3IsdT0tMSxvPVkobykmJm8ucHJvdG90eXBlfHxCLGM9bz09PXQsYT1BcnJheShuKSxmPTA8bix5PWUuZW51bUVycm9yUHJvcHMmJih0PT09THx8dCBpbnN0YW5jZW9mIEVycm9yKSxoPWUuZW51bVByb3RvdHlwZXMmJlkodCk7Kyt1PG47KWFbdV09dStcIlwiO1xuZm9yKHZhciBiIGluIHQpaCYmXCJwcm90b3R5cGVcIj09Ynx8eSYmKFwibWVzc2FnZVwiPT1ifHxcIm5hbWVcIj09Yil8fGYmJmwoYixuKXx8XCJjb25zdHJ1Y3RvclwiPT1iJiYoY3x8IVUuY2FsbCh0LGIpKXx8YS5wdXNoKGIpO2lmKGUubm9uRW51bVNoYWRvd3MmJnQhPT1CKWZvcihuPXQ9PT1EP0U6dD09PUw/ZDpWLmNhbGwodCksZT1LW25dfHxLW3ddLG49PXcmJihvPUIpLG49Ui5sZW5ndGg7bi0tOyliPVJbbl0sdT1lW2JdLGMmJnV8fCh1PyFVLmNhbGwodCxiKTp0W2JdPT09b1tiXSl8fGEucHVzaChiKTtyZXR1cm4gYX1mdW5jdGlvbiBiKHQpe3JldHVybih0PXR5cGVvZiB0PT1cInN0cmluZ1wiP3Q6bnVsbD09dD9cIlwiOnQrXCJcIikmJkEudGVzdCh0KT90LnJlcGxhY2UoUyxcIlxcXFwkJlwiKTp0fWZ1bmN0aW9uIHYodCl7cmV0dXJuIHR9dmFyIGosbT1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixPPVwiW29iamVjdCBBcmd1bWVudHNdXCIsZD1cIltvYmplY3QgRXJyb3JdXCIseD1cIltvYmplY3QgRnVuY3Rpb25dXCIsdz1cIltvYmplY3QgT2JqZWN0XVwiLEU9XCJbb2JqZWN0IFN0cmluZ11cIixTPS9bLiorP14ke30oKXxbXFxdXFwvXFxcXF0vZyxBPVJlZ0V4cChTLnNvdXJjZSksUD0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLCQ9L15cXGQrJC8sUj1cImNvbnN0cnVjdG9yIGhhc093blByb3BlcnR5IGlzUHJvdG90eXBlT2YgcHJvcGVydHlJc0VudW1lcmFibGUgdG9Mb2NhbGVTdHJpbmcgdG9TdHJpbmcgdmFsdWVPZlwiLnNwbGl0KFwiIFwiKSxUPXtcblwiZnVuY3Rpb25cIjp0cnVlLG9iamVjdDp0cnVlfSxJPVRbdHlwZW9mIGV4cG9ydHNdJiZleHBvcnRzJiYhZXhwb3J0cy5ub2RlVHlwZSYmZXhwb3J0cyxrPVRbdHlwZW9mIG1vZHVsZV0mJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLEM9VFt0eXBlb2Ygc2VsZl0mJnNlbGYmJnNlbGYuT2JqZWN0JiZzZWxmLEY9VFt0eXBlb2Ygd2luZG93XSYmd2luZG93JiZ3aW5kb3cuT2JqZWN0JiZ3aW5kb3csVD1rJiZrLmV4cG9ydHM9PT1JJiZJLEM9SSYmayYmdHlwZW9mIGdsb2JhbD09XCJvYmplY3RcIiYmZ2xvYmFsJiZnbG9iYWwuT2JqZWN0JiZnbG9iYWx8fEYhPT0odGhpcyYmdGhpcy53aW5kb3cpJiZGfHxDfHx0aGlzLE49ZnVuY3Rpb24oKXt0cnl7T2JqZWN0KHt0b1N0cmluZzowfStcIlwiKX1jYXRjaCh0KXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9fXJldHVybiBmdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHQudG9TdHJpbmchPVwiZnVuY3Rpb25cIiYmdHlwZW9mKHQrXCJcIik9PVwic3RyaW5nXCI7XG59fSgpLEY9QXJyYXkucHJvdG90eXBlLEw9RXJyb3IucHJvdG90eXBlLEI9T2JqZWN0LnByb3RvdHlwZSxEPVN0cmluZy5wcm90b3R5cGUsTT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsVT1CLmhhc093blByb3BlcnR5LFY9Qi50b1N0cmluZyxfPVJlZ0V4cChcIl5cIitiKE0uY2FsbChVKSkucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxxPUIucHJvcGVydHlJc0VudW1lcmFibGUsej1GLnNwbGljZSxDPXUoQyxcIlVpbnQ4QXJyYXlcIiksRj11KEFycmF5LFwiaXNBcnJheVwiKSxHPXUoT2JqZWN0LFwia2V5c1wiKSxIPU1hdGgubWF4LEo9OTAwNzE5OTI1NDc0MDk5MSxLPXt9O0tbXCJbb2JqZWN0IEFycmF5XVwiXT1LW1wiW29iamVjdCBEYXRlXVwiXT1LW1wiW29iamVjdCBOdW1iZXJdXCJdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LEtbXCJbb2JqZWN0IEJvb2xlYW5dXCJdPUtbRV09e1xuY29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX0sS1tkXT1LW3hdPUtbXCJbb2JqZWN0IFJlZ0V4cF1cIl09e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZX0sS1t3XT17Y29uc3RydWN0b3I6dHJ1ZX0sZnVuY3Rpb24odCxuKXtmb3IodmFyIHI9LTEsZT10Lmxlbmd0aDsrK3I8ZSYmZmFsc2UhPT1uKHRbcl0scix0KTspO3JldHVybiB0fShSLGZ1bmN0aW9uKHQpe2Zvcih2YXIgbiBpbiBLKWlmKFUuY2FsbChLLG4pKXt2YXIgcj1LW25dO3JbdF09VS5jYWxsKHIsdCl9fSk7dmFyIFE9ci5zdXBwb3J0PXt9OyFmdW5jdGlvbih0KXtmdW5jdGlvbiBuKCl7dGhpcy54PXR9dmFyIHI9ezA6dCxsZW5ndGg6dH0sZT1bXTtuLnByb3RvdHlwZT17dmFsdWVPZjp0LHk6dH07Zm9yKHZhciBvIGluIG5ldyBuKWUucHVzaChvKTtRLmFyZ3NUYWc9Vi5jYWxsKGFyZ3VtZW50cyk9PU8sUS5lbnVtRXJyb3JQcm9wcz1xLmNhbGwoTCxcIm1lc3NhZ2VcIil8fHEuY2FsbChMLFwibmFtZVwiKSxRLmVudW1Qcm90b3R5cGVzPXEuY2FsbChuLFwicHJvdG90eXBlXCIpLFxuUS5ub25FbnVtU2hhZG93cz0hL3ZhbHVlT2YvLnRlc3QoZSksUS5zcGxpY2VPYmplY3RzPSh6LmNhbGwociwwLDEpLCFyWzBdKSxRLnVuaW5kZXhlZENoYXJzPVwieHhcIiE9XCJ4XCJbMF0rT2JqZWN0KFwieFwiKVswXX0oMSwwKTt2YXIgVz1mdW5jdGlvbih0KXtyZXR1cm4gZnVuY3Rpb24obil7aWYobnVsbD09biluPWo7ZWxzZXtpZihyLnN1cHBvcnQudW5pbmRleGVkQ2hhcnMmJmcobikpe2Zvcih2YXIgZT0tMSxvPW4ubGVuZ3RoLHU9T2JqZWN0KG4pOysrZTxvOyl1W2VdPW4uY2hhckF0KGUpO249dX1lbHNlIG49cChuKT9uOk9iamVjdChuKTtuPW5bdF19cmV0dXJuIG59fShcImxlbmd0aFwiKTtRLmFyZ3NUYWd8fChzPWZ1bmN0aW9uKHQpe3JldHVybiBuKHQpJiZjKHQpJiZVLmNhbGwodCxcImNhbGxlZVwiKSYmIXEuY2FsbCh0LFwiY2FsbGVlXCIpfSk7dmFyIFg9Rnx8ZnVuY3Rpb24odCl7cmV0dXJuIG4odCkmJmkodC5sZW5ndGgpJiZcIltvYmplY3QgQXJyYXldXCI9PVYuY2FsbCh0KX0sWT10KC94Lyl8fEMmJiF0KEMpP2Z1bmN0aW9uKHQpe1xucmV0dXJuIFYuY2FsbCh0KT09eH06dCxaPWZ1bmN0aW9uKHQpe3JldHVybiBmKGZ1bmN0aW9uKG4scil7dmFyIGU9LTEsdT1udWxsPT1uPzA6ci5sZW5ndGgsaT0yPHU/clt1LTJdOmosYT0yPHU/clsyXTpqLGY9MTx1P3JbdS0xXTpqO2lmKHR5cGVvZiBpPT1cImZ1bmN0aW9uXCI/KGk9byhpLGYpLHUtPTIpOihpPXR5cGVvZiBmPT1cImZ1bmN0aW9uXCI/ZjpqLHUtPWk/MTowKSxmPWEpe3ZhciBmPXJbMF0scz1yWzFdO2lmKHAoYSkpe3ZhciB5PXR5cGVvZiBzOyhcIm51bWJlclwiPT15P2MoYSkmJmwocyxhLmxlbmd0aCk6XCJzdHJpbmdcIj09eSYmcyBpbiBhKT8oYT1hW3NdLGY9Zj09PWY/Zj09PWE6YSE9PWEpOmY9ZmFsc2V9ZWxzZSBmPWZhbHNlfWZvcihmJiYoaT0zPnU/ajppLHU9MSk7KytlPHU7KShhPXJbZV0pJiZ0KG4sYSxpKTtyZXR1cm4gbn0pfShmdW5jdGlvbih0LG4scil7aWYocilmb3IodmFyIGU9LTEsbz10dChuKSx1PW8ubGVuZ3RoOysrZTx1Oyl7dmFyIGM9b1tlXSxsPXRbY10saT1yKGwsbltjXSxjLHQsbik7XG4oaT09PWk/aT09PWw6bCE9PWwpJiYobCE9PWp8fGMgaW4gdCl8fCh0W2NdPWkpfWVsc2UgaWYobnVsbCE9bilmb3Iocj10dChuKSx0fHwodD17fSksZT0tMSxvPXIubGVuZ3RoOysrZTxvOyl1PXJbZV0sdFt1XT1uW3VdO3JldHVybiBuPXR9KSxDPWYoZnVuY3Rpb24odCl7dmFyIG49dFswXTtyZXR1cm4gbnVsbD09bj9uOih0LnB1c2goZSksWi5hcHBseShqLHQpKX0pLHR0PUc/ZnVuY3Rpb24odCl7dmFyIG49bnVsbD09dD9udWxsOnQuY29uc3RydWN0b3I7cmV0dXJuIHR5cGVvZiBuPT1cImZ1bmN0aW9uXCImJm4ucHJvdG90eXBlPT09dHx8KHR5cGVvZiB0PT1cImZ1bmN0aW9uXCI/ci5zdXBwb3J0LmVudW1Qcm90b3R5cGVzOmModCkpP2EodCk6cCh0KT9HKHQpOltdfTphO3IuYXNzaWduPVosci5kZWZhdWx0cz1DLHIua2V5cz10dCxyLmtleXNJbj1oLHIucmVzdFBhcmFtPWYsci5leHRlbmQ9WixyLmVzY2FwZVJlZ0V4cD1iLHIuaWRlbnRpdHk9dixyLmlzQXJndW1lbnRzPXMsci5pc0FycmF5PVgsXG5yLmlzRnVuY3Rpb249WSxyLmlzTmF0aXZlPXksci5pc09iamVjdD1wLHIuaXNTdHJpbmc9ZyxyLlZFUlNJT049XCIzLjkuM1wiLEkmJmsmJlQmJigoay5leHBvcnRzPXIpLl89cil9KS5jYWxsKHRoaXMpOyIsIi8qIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIE1hcmN1cyBXZXN0aW4gKi9cbihmdW5jdGlvbihlKXtmdW5jdGlvbiBvKCl7dHJ5e3JldHVybiByIGluIGUmJmVbcl19Y2F0Y2godCl7cmV0dXJuITF9fXZhciB0PXt9LG49ZS5kb2N1bWVudCxyPVwibG9jYWxTdG9yYWdlXCIsaT1cInNjcmlwdFwiLHM7dC5kaXNhYmxlZD0hMSx0LnZlcnNpb249XCIxLjMuMTdcIix0LnNldD1mdW5jdGlvbihlLHQpe30sdC5nZXQ9ZnVuY3Rpb24oZSx0KXt9LHQuaGFzPWZ1bmN0aW9uKGUpe3JldHVybiB0LmdldChlKSE9PXVuZGVmaW5lZH0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7fSx0LmNsZWFyPWZ1bmN0aW9uKCl7fSx0LnRyYW5zYWN0PWZ1bmN0aW9uKGUsbixyKXtyPT1udWxsJiYocj1uLG49bnVsbCksbj09bnVsbCYmKG49e30pO3ZhciBpPXQuZ2V0KGUsbik7cihpKSx0LnNldChlLGkpfSx0LmdldEFsbD1mdW5jdGlvbigpe30sdC5mb3JFYWNoPWZ1bmN0aW9uKCl7fSx0LnNlcmlhbGl6ZT1mdW5jdGlvbihlKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZSl9LHQuZGVzZXJpYWxpemU9ZnVuY3Rpb24oZSl7aWYodHlwZW9mIGUhPVwic3RyaW5nXCIpcmV0dXJuIHVuZGVmaW5lZDt0cnl7cmV0dXJuIEpTT04ucGFyc2UoZSl9Y2F0Y2godCl7cmV0dXJuIGV8fHVuZGVmaW5lZH19O2lmKG8oKSlzPWVbcl0sdC5zZXQ9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gbj09PXVuZGVmaW5lZD90LnJlbW92ZShlKToocy5zZXRJdGVtKGUsdC5zZXJpYWxpemUobikpLG4pfSx0LmdldD1mdW5jdGlvbihlLG4pe3ZhciByPXQuZGVzZXJpYWxpemUocy5nZXRJdGVtKGUpKTtyZXR1cm4gcj09PXVuZGVmaW5lZD9uOnJ9LHQucmVtb3ZlPWZ1bmN0aW9uKGUpe3MucmVtb3ZlSXRlbShlKX0sdC5jbGVhcj1mdW5jdGlvbigpe3MuY2xlYXIoKX0sdC5nZXRBbGw9ZnVuY3Rpb24oKXt2YXIgZT17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQsbil7ZVt0XT1ufSksZX0sdC5mb3JFYWNoPWZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248cy5sZW5ndGg7bisrKXt2YXIgcj1zLmtleShuKTtlKHIsdC5nZXQocikpfX07ZWxzZSBpZihuLmRvY3VtZW50RWxlbWVudC5hZGRCZWhhdmlvcil7dmFyIHUsYTt0cnl7YT1uZXcgQWN0aXZlWE9iamVjdChcImh0bWxmaWxlXCIpLGEub3BlbigpLGEud3JpdGUoXCI8XCIraStcIj5kb2N1bWVudC53PXdpbmRvdzwvXCIraSsnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+JyksYS5jbG9zZSgpLHU9YS53LmZyYW1lc1swXS5kb2N1bWVudCxzPXUuY3JlYXRlRWxlbWVudChcImRpdlwiKX1jYXRjaChmKXtzPW4uY3JlYXRlRWxlbWVudChcImRpdlwiKSx1PW4uYm9keX12YXIgbD1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgbj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7bi51bnNoaWZ0KHMpLHUuYXBwZW5kQ2hpbGQocykscy5hZGRCZWhhdmlvcihcIiNkZWZhdWx0I3VzZXJEYXRhXCIpLHMubG9hZChyKTt2YXIgaT1lLmFwcGx5KHQsbik7cmV0dXJuIHUucmVtb3ZlQ2hpbGQocyksaX19LGM9bmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLFwiZ1wiKTtmdW5jdGlvbiBoKGUpe3JldHVybiBlLnJlcGxhY2UoL15kLyxcIl9fXyQmXCIpLnJlcGxhY2UoYyxcIl9fX1wiKX10LnNldD1sKGZ1bmN0aW9uKGUsbixpKXtyZXR1cm4gbj1oKG4pLGk9PT11bmRlZmluZWQ/dC5yZW1vdmUobik6KGUuc2V0QXR0cmlidXRlKG4sdC5zZXJpYWxpemUoaSkpLGUuc2F2ZShyKSxpKX0pLHQuZ2V0PWwoZnVuY3Rpb24oZSxuLHIpe249aChuKTt2YXIgaT10LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKG4pKTtyZXR1cm4gaT09PXVuZGVmaW5lZD9yOml9KSx0LnJlbW92ZT1sKGZ1bmN0aW9uKGUsdCl7dD1oKHQpLGUucmVtb3ZlQXR0cmlidXRlKHQpLGUuc2F2ZShyKX0pLHQuY2xlYXI9bChmdW5jdGlvbihlKXt2YXIgdD1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2UubG9hZChyKTtmb3IodmFyIG49MCxpO2k9dFtuXTtuKyspZS5yZW1vdmVBdHRyaWJ1dGUoaS5uYW1lKTtlLnNhdmUocil9KSx0LmdldEFsbD1mdW5jdGlvbihlKXt2YXIgbj17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKGUsdCl7bltlXT10fSksbn0sdC5mb3JFYWNoPWwoZnVuY3Rpb24oZSxuKXt2YXIgcj1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2Zvcih2YXIgaT0wLHM7cz1yW2ldOysraSluKHMubmFtZSx0LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKHMubmFtZSkpKX0pfXRyeXt2YXIgcD1cIl9fc3RvcmVqc19fXCI7dC5zZXQocCxwKSx0LmdldChwKSE9cCYmKHQuZGlzYWJsZWQ9ITApLHQucmVtb3ZlKHApfWNhdGNoKGYpe3QuZGlzYWJsZWQ9ITB9dC5lbmFibGVkPSF0LmRpc2FibGVkLHR5cGVvZiBtb2R1bGUhPVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzJiZ0aGlzLm1vZHVsZSE9PW1vZHVsZT9tb2R1bGUuZXhwb3J0cz10OnR5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZD9kZWZpbmUodCk6ZS5zdG9yZT10fSkoRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpKSIsInN0b3JlID0gcmVxdWlyZSgnc3RvcmUnKVxuXG4jIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBzdG9yZS5qcyBmb3IgZWFzeSBzd2FwcGluZ1xuY2xhc3MgU3RvcmFnZVxuICBjb25zdHJ1Y3RvcjogKEBuYW1lc3BhY2U9J2FsZXBoYmV0JykgLT5cbiAgICB0aHJvdyAnbG9jYWwgc3RvcmFnZSBub3Qgc3VwcG9ydGVkJyB1bmxlc3Mgc3RvcmUuZW5hYmxlZFxuICAgIEBzdG9yYWdlID0gc3RvcmUuZ2V0KEBuYW1lc3BhY2UpIHx8IHt9XG4gIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XSA9IHZhbHVlXG4gICAgc3RvcmUuc2V0KEBuYW1lc3BhY2UsIEBzdG9yYWdlKVxuICAgIHJldHVybiB2YWx1ZVxuICBnZXQ6IChrZXkpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XVxuICAgICMgc3RvcmUuZ2V0KFwiI3tAbmFtZXNwYWNlfToje2tleX1cIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIE5PVEU6IHVzaW5nIGEgY3VzdG9tIGJ1aWxkIG9mIGxvZGFzaCwgdG8gc2F2ZSBzcGFjZVxuXyA9IHJlcXVpcmUoJ2xvZGFzaC5jdXN0b20nKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAc2V0X2RlYnVnOiAoQGRlYnVnKSAtPlxuICBAbG9nOiAobWVzc2FnZSkgLT5cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKSBpZiBAZGVidWdcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzLmNvZmZlZScpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzLmNvZmZlZScpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0ge2RlYnVnOiBmYWxzZX1cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpIC0+XG4gICAgICBsb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH0sICN7dmFsdWV9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKVxuXG4gICAgQG9uSW5pdGlhbGl6ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgZXhwZXJpbWVudF9uYW1lLCBcIiN7dmFyaWFudH0gfCBWaXNpdG9yc1wiKVxuXG4gICAgQG9uRXZlbnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGV2ZW50X25hbWUpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIGV4cGVyaW1lbnRfbmFtZSwgXCIje3ZhcmlhbnR9IHwgI3tldmVudF9uYW1lfVwiKVxuXG4gIGNsYXNzIEBMb2NhbFN0b3JhZ2VBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIEBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuc2V0KGtleSwgdmFsdWUpXG4gICAgQGdldDogKGtleSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLmdldChrZXkpXG5cbiAgY2xhc3MgQEV4cGVyaW1lbnRcbiAgICBAX29wdGlvbnM6XG4gICAgICBuYW1lOiBudWxsXG4gICAgICB2YXJpYW50czogbnVsbFxuICAgICAgc2FtcGxlOiAxLjBcbiAgICAgIHRyaWdnZXI6IC0+IHRydWVcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IEFsZXBoQmV0Lkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogQWxlcGhCZXQuTG9jYWxTdG9yYWdlQWRhcHRlclxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBvcHRpb25zLCBFeHBlcmltZW50Ll9vcHRpb25zKVxuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcylcbiAgICAgIEB2YXJpYW50cyA9IHV0aWxzLmtleXMoQG9wdGlvbnMudmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIGxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0BvcHRpb25zfVwiKVxuICAgICAgX2ZvcmNlX3ZhcmlhbnQoKVxuICAgICAgQGFwcGx5X3ZhcmlhbnQoKVxuXG4gICAgX3J1biA9IC0+IEBydW4oKVxuXG4gICAgX2ZvcmNlX3ZhcmlhbnQgPSAtPlxuICAgICAgIyBUT0RPOiBnZXQgdmFyaWFudCBmcm9tIFVSSVxuXG4gICAgYXBwbHlfdmFyaWFudDogLT5cbiAgICAgIHJldHVybiB1bmxlc3MgQG9wdGlvbnMudHJpZ2dlcigpXG4gICAgICBsb2coJ3RyaWdnZXIgc2V0JylcbiAgICAgIHJldHVybiB1bmxlc3MgQGluX3NhbXBsZSgpXG4gICAgICBsb2coJ2luIHNhbXBsZScpXG4gICAgICBpZiB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICAgIGxvZyhcIiN7dmFyaWFudH0gYWN0aXZlXCIpXG4gICAgICBlbHNlXG4gICAgICAgIHZhcmlhbnQgPSBAcGlja192YXJpYW50KClcbiAgICAgICAgQHRyYWNraW5nKCkub25Jbml0aWFsaXplKEBvcHRpb25zLm5hbWUsIHZhcmlhbnQpXG4gICAgICBAb3B0aW9ucy52YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUoKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGdvYWxfbmFtZSwgcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICByZXR1cm4gaWYgcHJvcHMudW5pcXVlICYmIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIilcbiAgICAgIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgIHJldHVybiB1bmxlc3MgdmFyaWFudFxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiLCB0cnVlKSBpZiBwcm9wcy51bmlxdWVcbiAgICAgIGxvZyhcImV4cGVyaW1lbnQ6ICN7QG9wdGlvbnMubmFtZX0gdmFyaWFudDoje3ZhcmlhbnR9IGdvYWw6I3tnb2FsX25hbWV9IGNvbXBsZXRlXCIpXG4gICAgICBAdHJhY2tpbmcoKS5vbkV2ZW50KEBvcHRpb25zLm5hbWUsIHZhcmlhbnQsIGdvYWxfbmFtZSlcblxuICAgIGdldF9zdG9yZWRfdmFyaWFudDogLT5cbiAgICAgIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIpXG5cbiAgICBwaWNrX3ZhcmlhbnQ6IC0+XG4gICAgICBwYXJ0aXRpb25zID0gMS4wIC8gQHZhcmlhbnRzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICBsb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgIGluX3NhbXBsZTogLT5cbiAgICAgIGFjdGl2ZSA9IEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIilcbiAgICAgIHJldHVybiBhY3RpdmUgdW5sZXNzIHR5cGVvZiBhY3RpdmUgaXMgJ3VuZGVmaW5lZCdcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIiwgTWF0aC5yYW5kb20oKSA8PSBAb3B0aW9ucy5zYW1wbGUpXG5cbiAgICBhZGRfZ29hbDogKGdvYWwpID0+XG4gICAgICBnb2FsLmFkZF9leHBlcmltZW50KHRoaXMpXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcgaWYgQG9wdGlvbnMubmFtZSBpcyBudWxsXG4gICAgICB0aHJvdyAndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3RyaWdnZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMgfHw9IFtdXG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgY29tcGxldGU6IC0+XG4gICAgICBmb3IgZXhwZXJpbWVudCBpbiBAZXhwZXJpbWVudHNcbiAgICAgICAgZXhwZXJpbWVudC5nb2FsX2NvbXBsZXRlKEBuYW1lLCBAcHJvcHMpXG5cbmxvZyA9IChtZXNzYWdlKSAtPlxuICB1dGlscy5zZXRfZGVidWcoQWxlcGhCZXQub3B0aW9ucy5kZWJ1ZylcbiAgdXRpbHMubG9nKG1lc3NhZ2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiJdfQ==
