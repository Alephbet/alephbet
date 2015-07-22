(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
      this.add_goals = bind(this.add_goals, this);
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
      if ((ref = this.options.variants[variant]) != null) {
        ref.activate(this);
      }
      return this.storage().set(this.options.name + ":variant", variant);
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
      return variant;
    };

    Experiment.prototype.in_sample = function() {
      var active;
      active = this.storage().get(this.options.name + ":in_sample");
      if (typeof active !== 'undefined') {
        return active;
      }
      active = Math.random() <= this.options.sample;
      this.storage().set(this.options.name + ":in_sample", active);
      return active;
    };

    Experiment.prototype.add_goal = function(goal) {
      return goal.add_experiment(this);
    };

    Experiment.prototype.add_goals = function(goals) {
      var goal, i, len, results;
      results = [];
      for (i = 0, len = goals.length; i < len; i++) {
        goal = goals[i];
        results.push(this.add_goal(goal));
      }
      return results;
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
      this.experiments = [];
    }

    Goal.prototype.add_experiment = function(experiment) {
      return this.experiments.push(experiment);
    };

    Goal.prototype.add_experiments = function(experiments) {
      var experiment, i, len, results;
      results = [];
      for (i = 0, len = experiments.length; i < len; i++) {
        experiment = experiments[i];
        results.push(this.add_experiment(experiment));
      }
      return results;
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


},{"./storage.js.coffee":4,"./utils.js.coffee":5}],2:[function(require,module,exports){
/**
 * @license
 * lodash 3.10.0 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash include="keys,defaults" exports="node" -o ./lib/lodash.custom.js`
 */
;(function(){function t(t){return!!t&&typeof t=="object"}function r(){}function n(t,r){for(var n=-1,e=t.length;++n<e&&r(t[n],n,t)!==false;);return t}function e(t,r){return t===A?r:t}function o(t,r,n){for(var e=-1,o=pt(r),u=o.length;++e<u;){var c=o[e],i=t[c],a=n(i,r[c],c,t,r);(a===a?a===i:i!==i)&&(i!==A||c in t)||(t[c]=a)}return t}function u(t,r){return null==r?t:c(r,pt(r),t)}function c(t,r,n){n||(n={});for(var e=-1,o=r.length;++e<o;){var u=r[e];n[u]=t[u]}return n}function i(t){return function(r){return null==r?A:b(r)[t];
}}function a(t,r,n){if(typeof t!="function")return w;if(r===A)return t;switch(n){case 1:return function(n){return t.call(r,n)};case 3:return function(n,e,o){return t.call(r,n,e,o)};case 4:return function(n,e,o,u){return t.call(r,n,e,o,u)};case 5:return function(n,e,o,u,c){return t.call(r,n,e,o,u,c)}}return function(){return t.apply(r,arguments)}}function l(t){return m(function(r,n){var e=-1,o=null==r?0:n.length,u=o>2?n[o-2]:A,c=o>2?n[2]:A,i=o>1?n[o-1]:A;for(typeof u=="function"?(u=a(u,i,5),o-=2):(u=typeof i=="function"?i:A,
o-=u?1:0),c&&g(n[0],n[1],c)&&(u=o<3?A:u,o=1);++e<o;){var l=n[e];l&&t(r,l,u)}return r})}function f(t,r){return m(function(n){var e=n[0];return null==e?e:(n.push(r),t.apply(A,n))})}function s(t,r){var n=null==t?A:t[r];return d(n)?n:A}function p(t){return null!=t&&h(at(t))}function y(t,r){return t=typeof t=="number"||M.test(t)?+t:-1,r=null==r?ut:r,t>-1&&t%1==0&&t<r}function g(t,r,n){if(!x(n))return false;var e=typeof r;if("number"==e?p(n)&&y(r,n.length):"string"==e&&r in n){var o=n[r];return t===t?t===o:o!==o;
}return false}function h(t){return typeof t=="number"&&t>-1&&t%1==0&&t<=ut}function v(t){for(var r=E(t),n=r.length,e=n&&t.length,o=!!e&&h(e)&&(lt(t)||j(t)||S(t)),u=-1,c=[];++u<n;){var i=r[u];(o&&y(i,e)||X.call(t,i))&&c.push(i)}return c}function b(t){if(r.support.unindexedChars&&S(t)){for(var n=-1,e=t.length,o=Object(t);++n<e;)o[n]=t.charAt(n);return o}return x(t)?t:Object(t)}function m(t,r){if(typeof t!="function")throw new TypeError($);return r=ot(r===A?t.length-1:+r||0,0),function(){for(var n=arguments,e=-1,o=ot(n.length-r,0),u=Array(o);++e<o;)u[e]=n[r+e];
switch(r){case 0:return t.call(this,u);case 1:return t.call(this,n[0],u);case 2:return t.call(this,n[0],n[1],u)}var c=Array(r+1);for(e=-1;++e<r;)c[e]=n[e];return c[r]=u,t.apply(this,c)}}function j(r){return t(r)&&p(r)&&X.call(r,"callee")&&!tt.call(r,"callee")}function O(t){return x(t)&&Y.call(t)==N}function x(t){var r=typeof t;return!!t&&("object"==r||"function"==r)}function d(r){return null==r?false:O(r)?Z.test(W.call(r)):t(r)&&(H(r)?Z:D).test(r)}function S(r){return typeof r=="string"||t(r)&&Y.call(r)==B;
}function E(t){if(null==t)return[];x(t)||(t=Object(t));var n=t.length,e=r.support;n=n&&h(n)&&(lt(t)||j(t)||S(t))&&n||0;for(var o=t.constructor,u=-1,c=O(o)&&o.prototype||Q,i=c===t,a=Array(n),l=n>0,f=e.enumErrorProps&&(t===K||t instanceof Error),s=e.enumPrototypes&&O(t);++u<n;)a[u]=u+"";for(var p in t)s&&"prototype"==p||f&&("message"==p||"name"==p)||l&&y(p,n)||"constructor"==p&&(i||!X.call(t,p))||a.push(p);if(e.nonEnumShadows&&t!==Q){var g=t===U?B:t===K?F:Y.call(t),v=ct[g]||ct[T];for(g==T&&(c=Q),n=V.length;n--;){
p=V[n];var b=v[p];i&&b||(b?!X.call(t,p):t[p]===c[p])||a.push(p)}}return a}function w(t){return t}var A,P="3.10.0",$="Expected a function",I="[object Array]",k="[object Boolean]",C="[object Date]",F="[object Error]",N="[object Function]",R="[object Number]",T="[object Object]",L="[object RegExp]",B="[object String]",D=/^\[object .+?Constructor\]$/,M=/^\d+$/,V=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],_={"function":true,object:true},q=_[typeof exports]&&exports&&!exports.nodeType&&exports,z=_[typeof module]&&module&&!module.nodeType&&module,G=z&&z.exports===q&&q,H=function(){
try{Object({toString:0}+"")}catch(t){return function(){return false}}return function(t){return typeof t.toString!="function"&&typeof(t+"")=="string"}}(),J=Array.prototype,K=Error.prototype,Q=Object.prototype,U=String.prototype,W=Function.prototype.toString,X=Q.hasOwnProperty,Y=Q.toString,Z=RegExp("^"+W.call(X).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),tt=Q.propertyIsEnumerable,rt=J.splice,nt=s(Array,"isArray"),et=s(Object,"keys"),ot=Math.max,ut=9007199254740991,ct={};
ct[I]=ct[C]=ct[R]={constructor:true,toLocaleString:true,toString:true,valueOf:true},ct[k]=ct[B]={constructor:true,toString:true,valueOf:true},ct[F]=ct[N]=ct[L]={constructor:true,toString:true},ct[T]={constructor:true},n(V,function(t){for(var r in ct)if(X.call(ct,r)){var n=ct[r];n[t]=X.call(n,t)}});var it=r.support={};!function(t){var r=function(){this.x=t},n={0:t,length:t},e=[];r.prototype={valueOf:t,y:t};for(var o in new r)e.push(o);it.enumErrorProps=tt.call(K,"message")||tt.call(K,"name"),it.enumPrototypes=tt.call(r,"prototype"),
it.nonEnumShadows=!/valueOf/.test(e),it.spliceObjects=(rt.call(n,0,1),!n[0]),it.unindexedChars="x"[0]+Object("x")[0]!="xx"}(1,0);var at=i("length"),lt=nt||function(r){return t(r)&&h(r.length)&&Y.call(r)==I},ft=l(function(t,r,n){return n?o(t,r,n):u(t,r)}),st=f(ft,e),pt=et?function(t){var n=null==t?A:t.constructor;return typeof n=="function"&&n.prototype===t||(typeof t=="function"?r.support.enumPrototypes:p(t))?v(t):x(t)?et(t):[]}:v;r.assign=ft,r.defaults=st,r.keys=pt,r.keysIn=E,r.restParam=m,r.extend=ft,
r.identity=w,r.isArguments=j,r.isArray=lt,r.isFunction=O,r.isNative=d,r.isObject=x,r.isString=S,r.VERSION=P,q&&z&&G&&((z.exports=r)._=r)}).call(this);
},{}],3:[function(require,module,exports){
/* Copyright (c) 2010-2013 Marcus Westin */
(function(e){function o(){try{return r in e&&e[r]}catch(t){return!1}}var t={},n=e.document,r="localStorage",i="script",s;t.disabled=!1,t.version="1.3.17",t.set=function(e,t){},t.get=function(e,t){},t.has=function(e){return t.get(e)!==undefined},t.remove=function(e){},t.clear=function(){},t.transact=function(e,n,r){r==null&&(r=n,n=null),n==null&&(n={});var i=t.get(e,n);r(i),t.set(e,i)},t.getAll=function(){},t.forEach=function(){},t.serialize=function(e){return JSON.stringify(e)},t.deserialize=function(e){if(typeof e!="string")return undefined;try{return JSON.parse(e)}catch(t){return e||undefined}};if(o())s=e[r],t.set=function(e,n){return n===undefined?t.remove(e):(s.setItem(e,t.serialize(n)),n)},t.get=function(e,n){var r=t.deserialize(s.getItem(e));return r===undefined?n:r},t.remove=function(e){s.removeItem(e)},t.clear=function(){s.clear()},t.getAll=function(){var e={};return t.forEach(function(t,n){e[t]=n}),e},t.forEach=function(e){for(var n=0;n<s.length;n++){var r=s.key(n);e(r,t.get(r))}};else if(n.documentElement.addBehavior){var u,a;try{a=new ActiveXObject("htmlfile"),a.open(),a.write("<"+i+">document.w=window</"+i+'><iframe src="/favicon.ico"></iframe>'),a.close(),u=a.w.frames[0].document,s=u.createElement("div")}catch(f){s=n.createElement("div"),u=n.body}var l=function(e){return function(){var n=Array.prototype.slice.call(arguments,0);n.unshift(s),u.appendChild(s),s.addBehavior("#default#userData"),s.load(r);var i=e.apply(t,n);return u.removeChild(s),i}},c=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g");function h(e){return e.replace(/^d/,"___$&").replace(c,"___")}t.set=l(function(e,n,i){return n=h(n),i===undefined?t.remove(n):(e.setAttribute(n,t.serialize(i)),e.save(r),i)}),t.get=l(function(e,n,r){n=h(n);var i=t.deserialize(e.getAttribute(n));return i===undefined?r:i}),t.remove=l(function(e,t){t=h(t),e.removeAttribute(t),e.save(r)}),t.clear=l(function(e){var t=e.XMLDocument.documentElement.attributes;e.load(r);for(var n=0,i;i=t[n];n++)e.removeAttribute(i.name);e.save(r)}),t.getAll=function(e){var n={};return t.forEach(function(e,t){n[e]=t}),n},t.forEach=l(function(e,n){var r=e.XMLDocument.documentElement.attributes;for(var i=0,s;s=r[i];++i)n(s.name,t.deserialize(e.getAttribute(s.name)))})}try{var p="__storejs__";t.set(p,p),t.get(p)!=p&&(t.disabled=!0),t.remove(p)}catch(f){t.disabled=!0}t.enabled=!t.disabled,typeof module!="undefined"&&module.exports&&this.module!==module?module.exports=t:typeof define=="function"&&define.amd?define(t):e.store=t})(Function("return this")())
},{}],4:[function(require,module,exports){
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


},{"store":3}],5:[function(require,module,exports){
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


},{"lodash.custom":2}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90aW0vcHJvamVjdHMvYWxlcGhiZXQvYWxlcGhiZXQuanMuY29mZmVlIiwibGliL2xvZGFzaC5jdXN0b20ubWluLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JlLm1pbi5qcyIsIi9ob21lL3RpbS9wcm9qZWN0cy9hbGVwaGJldC9zdG9yYWdlLmpzLmNvZmZlZSIsIi9ob21lL3RpbS9wcm9qZWN0cy9hbGVwaGJldC91dGlscy5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDZCQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLHFCQUFSOztBQUVKOzs7RUFDSixRQUFDLENBQUEsT0FBRCxHQUFXO0lBQUMsS0FBQSxFQUFPLEtBQVI7OztFQUVMLFFBQUMsQ0FBQTs7O0lBQ0wsK0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBRVosK0JBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixLQUFuQixFQUEwQixLQUExQjtNQUNQLEdBQUEsQ0FBSSxvQ0FBQSxHQUFxQyxRQUFyQyxHQUE4QyxJQUE5QyxHQUFrRCxNQUFsRCxHQUF5RCxJQUF6RCxHQUE2RCxLQUE3RCxHQUFtRSxJQUFuRSxHQUF1RSxLQUEzRTtNQUNBLElBQXlGLE9BQU8sRUFBUCxLQUFlLFVBQXhHO0FBQUEsY0FBTSxnRkFBTjs7YUFDQSxFQUFBLENBQUcsTUFBSCxFQUFXLE9BQVgsRUFBb0IsUUFBcEIsRUFBOEIsTUFBOUIsRUFBc0MsS0FBdEMsRUFBNkMsS0FBN0M7SUFITzs7SUFLVCwrQkFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNqQiwrQkFBQyxDQUFBLE1BQUQsQ0FBUSwrQkFBQyxDQUFB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QU4sQ0FBVSxJQUFDLENBQUEsU0FBWCxDQUFBLElBQXlCO0VBRnpCOztvQkFHYixHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sS0FBTjtJQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQSxDQUFULEdBQWdCO0lBQ2hCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsRUFBc0IsSUFBQyxDQUFBLE9BQXZCO0FBQ0EsV0FBTztFQUhKOztvQkFJTCxHQUFBLEdBQUssU0FBQyxHQUFEO1dBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxHQUFBO0VBRE47Ozs7OztBQUlQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDZGpCLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxlQUFSOztBQUVFOzs7RUFDSixLQUFDLENBQUEsUUFBRCxHQUFXLENBQUMsQ0FBQzs7RUFDYixLQUFDLENBQUEsSUFBRCxHQUFPLENBQUMsQ0FBQzs7RUFDVCxLQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsS0FBRDtJQUFDLElBQUMsQ0FBQSxRQUFEO0VBQUQ7O0VBQ1osS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLE9BQUQ7SUFDSixJQUF3QixJQUFDLENBQUEsS0FBekI7YUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBQTs7RUFESTs7Ozs7O0FBR1IsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzLmNvZmZlZScpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzLmNvZmZlZScpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0ge2RlYnVnOiBmYWxzZX1cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpIC0+XG4gICAgICBsb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH0sICN7dmFsdWV9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKVxuXG4gICAgQGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgQGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsKVxuXG4gIGNsYXNzIEBMb2NhbFN0b3JhZ2VBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIEBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuc2V0KGtleSwgdmFsdWUpXG4gICAgQGdldDogKGtleSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLmdldChrZXkpXG5cbiAgY2xhc3MgQEV4cGVyaW1lbnRcbiAgICBAX29wdGlvbnM6XG4gICAgICBuYW1lOiBudWxsXG4gICAgICB2YXJpYW50czogbnVsbFxuICAgICAgc2FtcGxlOiAxLjBcbiAgICAgIHRyaWdnZXI6IC0+IHRydWVcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IEFsZXBoQmV0Lkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogQWxlcGhCZXQuTG9jYWxTdG9yYWdlQWRhcHRlclxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBvcHRpb25zLCBFeHBlcmltZW50Ll9vcHRpb25zKVxuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcylcbiAgICAgIEB2YXJpYW50cyA9IHV0aWxzLmtleXMoQG9wdGlvbnMudmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIGxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIF9mb3JjZV92YXJpYW50KClcbiAgICAgIEBhcHBseV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIF9mb3JjZV92YXJpYW50ID0gLT5cbiAgICAgICMgVE9ETzogZ2V0IHZhcmlhbnQgZnJvbSBVUklcblxuICAgIGFwcGx5X3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgbG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgbG9nKCdpbiBzYW1wbGUnKVxuICAgICAgaWYgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgICBsb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgZWxzZVxuICAgICAgICB2YXJpYW50ID0gQHBpY2tfdmFyaWFudCgpXG4gICAgICAgIEB0cmFja2luZygpLmV4cGVyaW1lbnRfc3RhcnQoQG9wdGlvbnMubmFtZSwgdmFyaWFudClcbiAgICAgIEBvcHRpb25zLnZhcmlhbnRzW3ZhcmlhbnRdPy5hY3RpdmF0ZSh0aGlzKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICBsb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZShAb3B0aW9ucy5uYW1lLCB2YXJpYW50LCBnb2FsX25hbWUpXG5cbiAgICBnZXRfc3RvcmVkX3ZhcmlhbnQ6IC0+XG4gICAgICBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiKVxuXG4gICAgcGlja192YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50cy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50c1tjaG9zZW5fcGFydGl0aW9uXVxuICAgICAgbG9nKFwiI3t2YXJpYW50fSBwaWNrZWRcIilcbiAgICAgIHZhcmlhbnRcblxuICAgIGluX3NhbXBsZTogLT5cbiAgICAgIGFjdGl2ZSA9IEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIilcbiAgICAgIHJldHVybiBhY3RpdmUgdW5sZXNzIHR5cGVvZiBhY3RpdmUgaXMgJ3VuZGVmaW5lZCdcbiAgICAgIGFjdGl2ZSA9IE1hdGgucmFuZG9tKCkgPD0gQG9wdGlvbnMuc2FtcGxlXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIGFjdGl2ZSlcbiAgICAgIGFjdGl2ZVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSA9PlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgYWRkX2dvYWxzOiAoZ29hbHMpID0+XG4gICAgICBAYWRkX2dvYWwoZ29hbCkgZm9yIGdvYWwgaW4gZ29hbHNcblxuICAgIHN0b3JhZ2U6IC0+IEBvcHRpb25zLnN0b3JhZ2VfYWRhcHRlclxuXG4gICAgdHJhY2tpbmc6IC0+IEBvcHRpb25zLnRyYWNraW5nX2FkYXB0ZXJcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyAnYW4gZXhwZXJpbWVudCBuYW1lIG11c3QgYmUgc3BlY2lmaWVkJyBpZiBAb3B0aW9ucy5uYW1lIGlzIG51bGxcbiAgICAgIHRocm93ICd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJyBpZiBAb3B0aW9ucy52YXJpYW50cyBpcyBudWxsXG4gICAgICB0aHJvdyAndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuXG4gIGNsYXNzIEBHb2FsXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5sb2cgPSAobWVzc2FnZSkgLT5cbiAgdXRpbHMuc2V0X2RlYnVnKEFsZXBoQmV0Lm9wdGlvbnMuZGVidWcpXG4gIHV0aWxzLmxvZyhtZXNzYWdlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXBoQmV0XG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBsb2Rhc2ggMy4xMC4wIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0c1wiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9saWIvbG9kYXNoLmN1c3RvbS5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIHQodCl7cmV0dXJuISF0JiZ0eXBlb2YgdD09XCJvYmplY3RcIn1mdW5jdGlvbiByKCl7fWZ1bmN0aW9uIG4odCxyKXtmb3IodmFyIG49LTEsZT10Lmxlbmd0aDsrK248ZSYmcih0W25dLG4sdCkhPT1mYWxzZTspO3JldHVybiB0fWZ1bmN0aW9uIGUodCxyKXtyZXR1cm4gdD09PUE/cjp0fWZ1bmN0aW9uIG8odCxyLG4pe2Zvcih2YXIgZT0tMSxvPXB0KHIpLHU9by5sZW5ndGg7KytlPHU7KXt2YXIgYz1vW2VdLGk9dFtjXSxhPW4oaSxyW2NdLGMsdCxyKTsoYT09PWE/YT09PWk6aSE9PWkpJiYoaSE9PUF8fGMgaW4gdCl8fCh0W2NdPWEpfXJldHVybiB0fWZ1bmN0aW9uIHUodCxyKXtyZXR1cm4gbnVsbD09cj90OmMocixwdChyKSx0KX1mdW5jdGlvbiBjKHQscixuKXtufHwobj17fSk7Zm9yKHZhciBlPS0xLG89ci5sZW5ndGg7KytlPG87KXt2YXIgdT1yW2VdO25bdV09dFt1XX1yZXR1cm4gbn1mdW5jdGlvbiBpKHQpe3JldHVybiBmdW5jdGlvbihyKXtyZXR1cm4gbnVsbD09cj9BOmIocilbdF07XG59fWZ1bmN0aW9uIGEodCxyLG4pe2lmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCIpcmV0dXJuIHc7aWYocj09PUEpcmV0dXJuIHQ7c3dpdGNoKG4pe2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24obil7cmV0dXJuIHQuY2FsbChyLG4pfTtjYXNlIDM6cmV0dXJuIGZ1bmN0aW9uKG4sZSxvKXtyZXR1cm4gdC5jYWxsKHIsbixlLG8pfTtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKG4sZSxvLHUpe3JldHVybiB0LmNhbGwocixuLGUsbyx1KX07Y2FzZSA1OnJldHVybiBmdW5jdGlvbihuLGUsbyx1LGMpe3JldHVybiB0LmNhbGwocixuLGUsbyx1LGMpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdC5hcHBseShyLGFyZ3VtZW50cyl9fWZ1bmN0aW9uIGwodCl7cmV0dXJuIG0oZnVuY3Rpb24ocixuKXt2YXIgZT0tMSxvPW51bGw9PXI/MDpuLmxlbmd0aCx1PW8+Mj9uW28tMl06QSxjPW8+Mj9uWzJdOkEsaT1vPjE/bltvLTFdOkE7Zm9yKHR5cGVvZiB1PT1cImZ1bmN0aW9uXCI/KHU9YSh1LGksNSksby09Mik6KHU9dHlwZW9mIGk9PVwiZnVuY3Rpb25cIj9pOkEsXG5vLT11PzE6MCksYyYmZyhuWzBdLG5bMV0sYykmJih1PW88Mz9BOnUsbz0xKTsrK2U8bzspe3ZhciBsPW5bZV07bCYmdChyLGwsdSl9cmV0dXJuIHJ9KX1mdW5jdGlvbiBmKHQscil7cmV0dXJuIG0oZnVuY3Rpb24obil7dmFyIGU9blswXTtyZXR1cm4gbnVsbD09ZT9lOihuLnB1c2gociksdC5hcHBseShBLG4pKX0pfWZ1bmN0aW9uIHModCxyKXt2YXIgbj1udWxsPT10P0E6dFtyXTtyZXR1cm4gZChuKT9uOkF9ZnVuY3Rpb24gcCh0KXtyZXR1cm4gbnVsbCE9dCYmaChhdCh0KSl9ZnVuY3Rpb24geSh0LHIpe3JldHVybiB0PXR5cGVvZiB0PT1cIm51bWJlclwifHxNLnRlc3QodCk/K3Q6LTEscj1udWxsPT1yP3V0OnIsdD4tMSYmdCUxPT0wJiZ0PHJ9ZnVuY3Rpb24gZyh0LHIsbil7aWYoIXgobikpcmV0dXJuIGZhbHNlO3ZhciBlPXR5cGVvZiByO2lmKFwibnVtYmVyXCI9PWU/cChuKSYmeShyLG4ubGVuZ3RoKTpcInN0cmluZ1wiPT1lJiZyIGluIG4pe3ZhciBvPW5bcl07cmV0dXJuIHQ9PT10P3Q9PT1vOm8hPT1vO1xufXJldHVybiBmYWxzZX1mdW5jdGlvbiBoKHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmdD4tMSYmdCUxPT0wJiZ0PD11dH1mdW5jdGlvbiB2KHQpe2Zvcih2YXIgcj1FKHQpLG49ci5sZW5ndGgsZT1uJiZ0Lmxlbmd0aCxvPSEhZSYmaChlKSYmKGx0KHQpfHxqKHQpfHxTKHQpKSx1PS0xLGM9W107Kyt1PG47KXt2YXIgaT1yW3VdOyhvJiZ5KGksZSl8fFguY2FsbCh0LGkpKSYmYy5wdXNoKGkpfXJldHVybiBjfWZ1bmN0aW9uIGIodCl7aWYoci5zdXBwb3J0LnVuaW5kZXhlZENoYXJzJiZTKHQpKXtmb3IodmFyIG49LTEsZT10Lmxlbmd0aCxvPU9iamVjdCh0KTsrK248ZTspb1tuXT10LmNoYXJBdChuKTtyZXR1cm4gb31yZXR1cm4geCh0KT90Ok9iamVjdCh0KX1mdW5jdGlvbiBtKHQscil7aWYodHlwZW9mIHQhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKCQpO3JldHVybiByPW90KHI9PT1BP3QubGVuZ3RoLTE6K3J8fDAsMCksZnVuY3Rpb24oKXtmb3IodmFyIG49YXJndW1lbnRzLGU9LTEsbz1vdChuLmxlbmd0aC1yLDApLHU9QXJyYXkobyk7KytlPG87KXVbZV09bltyK2VdO1xuc3dpdGNoKHIpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKHRoaXMsdSk7Y2FzZSAxOnJldHVybiB0LmNhbGwodGhpcyxuWzBdLHUpO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKHRoaXMsblswXSxuWzFdLHUpfXZhciBjPUFycmF5KHIrMSk7Zm9yKGU9LTE7KytlPHI7KWNbZV09bltlXTtyZXR1cm4gY1tyXT11LHQuYXBwbHkodGhpcyxjKX19ZnVuY3Rpb24gaihyKXtyZXR1cm4gdChyKSYmcChyKSYmWC5jYWxsKHIsXCJjYWxsZWVcIikmJiF0dC5jYWxsKHIsXCJjYWxsZWVcIil9ZnVuY3Rpb24gTyh0KXtyZXR1cm4geCh0KSYmWS5jYWxsKHQpPT1OfWZ1bmN0aW9uIHgodCl7dmFyIHI9dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09cnx8XCJmdW5jdGlvblwiPT1yKX1mdW5jdGlvbiBkKHIpe3JldHVybiBudWxsPT1yP2ZhbHNlOk8ocik/Wi50ZXN0KFcuY2FsbChyKSk6dChyKSYmKEgocik/WjpEKS50ZXN0KHIpfWZ1bmN0aW9uIFMocil7cmV0dXJuIHR5cGVvZiByPT1cInN0cmluZ1wifHx0KHIpJiZZLmNhbGwocik9PUI7XG59ZnVuY3Rpb24gRSh0KXtpZihudWxsPT10KXJldHVybltdO3godCl8fCh0PU9iamVjdCh0KSk7dmFyIG49dC5sZW5ndGgsZT1yLnN1cHBvcnQ7bj1uJiZoKG4pJiYobHQodCl8fGoodCl8fFModCkpJiZufHwwO2Zvcih2YXIgbz10LmNvbnN0cnVjdG9yLHU9LTEsYz1PKG8pJiZvLnByb3RvdHlwZXx8USxpPWM9PT10LGE9QXJyYXkobiksbD1uPjAsZj1lLmVudW1FcnJvclByb3BzJiYodD09PUt8fHQgaW5zdGFuY2VvZiBFcnJvcikscz1lLmVudW1Qcm90b3R5cGVzJiZPKHQpOysrdTxuOylhW3VdPXUrXCJcIjtmb3IodmFyIHAgaW4gdClzJiZcInByb3RvdHlwZVwiPT1wfHxmJiYoXCJtZXNzYWdlXCI9PXB8fFwibmFtZVwiPT1wKXx8bCYmeShwLG4pfHxcImNvbnN0cnVjdG9yXCI9PXAmJihpfHwhWC5jYWxsKHQscCkpfHxhLnB1c2gocCk7aWYoZS5ub25FbnVtU2hhZG93cyYmdCE9PVEpe3ZhciBnPXQ9PT1VP0I6dD09PUs/RjpZLmNhbGwodCksdj1jdFtnXXx8Y3RbVF07Zm9yKGc9PVQmJihjPVEpLG49Vi5sZW5ndGg7bi0tOyl7XG5wPVZbbl07dmFyIGI9dltwXTtpJiZifHwoYj8hWC5jYWxsKHQscCk6dFtwXT09PWNbcF0pfHxhLnB1c2gocCl9fXJldHVybiBhfWZ1bmN0aW9uIHcodCl7cmV0dXJuIHR9dmFyIEEsUD1cIjMuMTAuMFwiLCQ9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsST1cIltvYmplY3QgQXJyYXldXCIsaz1cIltvYmplY3QgQm9vbGVhbl1cIixDPVwiW29iamVjdCBEYXRlXVwiLEY9XCJbb2JqZWN0IEVycm9yXVwiLE49XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLFI9XCJbb2JqZWN0IE51bWJlcl1cIixUPVwiW29iamVjdCBPYmplY3RdXCIsTD1cIltvYmplY3QgUmVnRXhwXVwiLEI9XCJbb2JqZWN0IFN0cmluZ11cIixEPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sTT0vXlxcZCskLyxWPVtcImNvbnN0cnVjdG9yXCIsXCJoYXNPd25Qcm9wZXJ0eVwiLFwiaXNQcm90b3R5cGVPZlwiLFwicHJvcGVydHlJc0VudW1lcmFibGVcIixcInRvTG9jYWxlU3RyaW5nXCIsXCJ0b1N0cmluZ1wiLFwidmFsdWVPZlwiXSxfPXtcImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0scT1fW3R5cGVvZiBleHBvcnRzXSYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsej1fW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxHPXomJnouZXhwb3J0cz09PXEmJnEsSD1mdW5jdGlvbigpe1xudHJ5e09iamVjdCh7dG9TdHJpbmc6MH0rXCJcIil9Y2F0Y2godCl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfX1yZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0LnRvU3RyaW5nIT1cImZ1bmN0aW9uXCImJnR5cGVvZih0K1wiXCIpPT1cInN0cmluZ1wifX0oKSxKPUFycmF5LnByb3RvdHlwZSxLPUVycm9yLnByb3RvdHlwZSxRPU9iamVjdC5wcm90b3R5cGUsVT1TdHJpbmcucHJvdG90eXBlLFc9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLFg9US5oYXNPd25Qcm9wZXJ0eSxZPVEudG9TdHJpbmcsWj1SZWdFeHAoXCJeXCIrVy5jYWxsKFgpLnJlcGxhY2UoL1tcXFxcXiQuKis/KClbXFxde318XS9nLFwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIiksdHQ9US5wcm9wZXJ0eUlzRW51bWVyYWJsZSxydD1KLnNwbGljZSxudD1zKEFycmF5LFwiaXNBcnJheVwiKSxldD1zKE9iamVjdCxcImtleXNcIiksb3Q9TWF0aC5tYXgsdXQ9OTAwNzE5OTI1NDc0MDk5MSxjdD17fTtcbmN0W0ldPWN0W0NdPWN0W1JdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LGN0W2tdPWN0W0JdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfSxjdFtGXT1jdFtOXT1jdFtMXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlfSxjdFtUXT17Y29uc3RydWN0b3I6dHJ1ZX0sbihWLGZ1bmN0aW9uKHQpe2Zvcih2YXIgciBpbiBjdClpZihYLmNhbGwoY3Qscikpe3ZhciBuPWN0W3JdO25bdF09WC5jYWxsKG4sdCl9fSk7dmFyIGl0PXIuc3VwcG9ydD17fTshZnVuY3Rpb24odCl7dmFyIHI9ZnVuY3Rpb24oKXt0aGlzLng9dH0sbj17MDp0LGxlbmd0aDp0fSxlPVtdO3IucHJvdG90eXBlPXt2YWx1ZU9mOnQseTp0fTtmb3IodmFyIG8gaW4gbmV3IHIpZS5wdXNoKG8pO2l0LmVudW1FcnJvclByb3BzPXR0LmNhbGwoSyxcIm1lc3NhZ2VcIil8fHR0LmNhbGwoSyxcIm5hbWVcIiksaXQuZW51bVByb3RvdHlwZXM9dHQuY2FsbChyLFwicHJvdG90eXBlXCIpLFxuaXQubm9uRW51bVNoYWRvd3M9IS92YWx1ZU9mLy50ZXN0KGUpLGl0LnNwbGljZU9iamVjdHM9KHJ0LmNhbGwobiwwLDEpLCFuWzBdKSxpdC51bmluZGV4ZWRDaGFycz1cInhcIlswXStPYmplY3QoXCJ4XCIpWzBdIT1cInh4XCJ9KDEsMCk7dmFyIGF0PWkoXCJsZW5ndGhcIiksbHQ9bnR8fGZ1bmN0aW9uKHIpe3JldHVybiB0KHIpJiZoKHIubGVuZ3RoKSYmWS5jYWxsKHIpPT1JfSxmdD1sKGZ1bmN0aW9uKHQscixuKXtyZXR1cm4gbj9vKHQscixuKTp1KHQscil9KSxzdD1mKGZ0LGUpLHB0PWV0P2Z1bmN0aW9uKHQpe3ZhciBuPW51bGw9PXQ/QTp0LmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2Ygbj09XCJmdW5jdGlvblwiJiZuLnByb3RvdHlwZT09PXR8fCh0eXBlb2YgdD09XCJmdW5jdGlvblwiP3Iuc3VwcG9ydC5lbnVtUHJvdG90eXBlczpwKHQpKT92KHQpOngodCk/ZXQodCk6W119OnY7ci5hc3NpZ249ZnQsci5kZWZhdWx0cz1zdCxyLmtleXM9cHQsci5rZXlzSW49RSxyLnJlc3RQYXJhbT1tLHIuZXh0ZW5kPWZ0LFxuci5pZGVudGl0eT13LHIuaXNBcmd1bWVudHM9aixyLmlzQXJyYXk9bHQsci5pc0Z1bmN0aW9uPU8sci5pc05hdGl2ZT1kLHIuaXNPYmplY3Q9eCxyLmlzU3RyaW5nPVMsci5WRVJTSU9OPVAscSYmeiYmRyYmKCh6LmV4cG9ydHM9cikuXz1yKX0pLmNhbGwodGhpcyk7IiwiLyogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgTWFyY3VzIFdlc3RpbiAqL1xuKGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG8oKXt0cnl7cmV0dXJuIHIgaW4gZSYmZVtyXX1jYXRjaCh0KXtyZXR1cm4hMX19dmFyIHQ9e30sbj1lLmRvY3VtZW50LHI9XCJsb2NhbFN0b3JhZ2VcIixpPVwic2NyaXB0XCIsczt0LmRpc2FibGVkPSExLHQudmVyc2lvbj1cIjEuMy4xN1wiLHQuc2V0PWZ1bmN0aW9uKGUsdCl7fSx0LmdldD1mdW5jdGlvbihlLHQpe30sdC5oYXM9ZnVuY3Rpb24oZSl7cmV0dXJuIHQuZ2V0KGUpIT09dW5kZWZpbmVkfSx0LnJlbW92ZT1mdW5jdGlvbihlKXt9LHQuY2xlYXI9ZnVuY3Rpb24oKXt9LHQudHJhbnNhY3Q9ZnVuY3Rpb24oZSxuLHIpe3I9PW51bGwmJihyPW4sbj1udWxsKSxuPT1udWxsJiYobj17fSk7dmFyIGk9dC5nZXQoZSxuKTtyKGkpLHQuc2V0KGUsaSl9LHQuZ2V0QWxsPWZ1bmN0aW9uKCl7fSx0LmZvckVhY2g9ZnVuY3Rpb24oKXt9LHQuc2VyaWFsaXplPWZ1bmN0aW9uKGUpe3JldHVybiBKU09OLnN0cmluZ2lmeShlKX0sdC5kZXNlcmlhbGl6ZT1mdW5jdGlvbihlKXtpZih0eXBlb2YgZSE9XCJzdHJpbmdcIilyZXR1cm4gdW5kZWZpbmVkO3RyeXtyZXR1cm4gSlNPTi5wYXJzZShlKX1jYXRjaCh0KXtyZXR1cm4gZXx8dW5kZWZpbmVkfX07aWYobygpKXM9ZVtyXSx0LnNldD1mdW5jdGlvbihlLG4pe3JldHVybiBuPT09dW5kZWZpbmVkP3QucmVtb3ZlKGUpOihzLnNldEl0ZW0oZSx0LnNlcmlhbGl6ZShuKSksbil9LHQuZ2V0PWZ1bmN0aW9uKGUsbil7dmFyIHI9dC5kZXNlcmlhbGl6ZShzLmdldEl0ZW0oZSkpO3JldHVybiByPT09dW5kZWZpbmVkP246cn0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7cy5yZW1vdmVJdGVtKGUpfSx0LmNsZWFyPWZ1bmN0aW9uKCl7cy5jbGVhcigpfSx0LmdldEFsbD1mdW5jdGlvbigpe3ZhciBlPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCxuKXtlW3RdPW59KSxlfSx0LmZvckVhY2g9ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjxzLmxlbmd0aDtuKyspe3ZhciByPXMua2V5KG4pO2Uocix0LmdldChyKSl9fTtlbHNlIGlmKG4uZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKXt2YXIgdSxhO3RyeXthPW5ldyBBY3RpdmVYT2JqZWN0KFwiaHRtbGZpbGVcIiksYS5vcGVuKCksYS53cml0ZShcIjxcIitpK1wiPmRvY3VtZW50Lnc9d2luZG93PC9cIitpKyc+PGlmcmFtZSBzcmM9XCIvZmF2aWNvbi5pY29cIj48L2lmcmFtZT4nKSxhLmNsb3NlKCksdT1hLncuZnJhbWVzWzBdLmRvY3VtZW50LHM9dS5jcmVhdGVFbGVtZW50KFwiZGl2XCIpfWNhdGNoKGYpe3M9bi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHU9bi5ib2R5fXZhciBsPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3ZhciBuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtuLnVuc2hpZnQocyksdS5hcHBlbmRDaGlsZChzKSxzLmFkZEJlaGF2aW9yKFwiI2RlZmF1bHQjdXNlckRhdGFcIikscy5sb2FkKHIpO3ZhciBpPWUuYXBwbHkodCxuKTtyZXR1cm4gdS5yZW1vdmVDaGlsZChzKSxpfX0sYz1uZXcgUmVnRXhwKFwiWyFcXFwiIyQlJicoKSorLC9cXFxcXFxcXDo7PD0+P0BbXFxcXF1eYHt8fX5dXCIsXCJnXCIpO2Z1bmN0aW9uIGgoZSl7cmV0dXJuIGUucmVwbGFjZSgvXmQvLFwiX19fJCZcIikucmVwbGFjZShjLFwiX19fXCIpfXQuc2V0PWwoZnVuY3Rpb24oZSxuLGkpe3JldHVybiBuPWgobiksaT09PXVuZGVmaW5lZD90LnJlbW92ZShuKTooZS5zZXRBdHRyaWJ1dGUobix0LnNlcmlhbGl6ZShpKSksZS5zYXZlKHIpLGkpfSksdC5nZXQ9bChmdW5jdGlvbihlLG4scil7bj1oKG4pO3ZhciBpPXQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUobikpO3JldHVybiBpPT09dW5kZWZpbmVkP3I6aX0pLHQucmVtb3ZlPWwoZnVuY3Rpb24oZSx0KXt0PWgodCksZS5yZW1vdmVBdHRyaWJ1dGUodCksZS5zYXZlKHIpfSksdC5jbGVhcj1sKGZ1bmN0aW9uKGUpe3ZhciB0PWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7ZS5sb2FkKHIpO2Zvcih2YXIgbj0wLGk7aT10W25dO24rKyllLnJlbW92ZUF0dHJpYnV0ZShpLm5hbWUpO2Uuc2F2ZShyKX0pLHQuZ2V0QWxsPWZ1bmN0aW9uKGUpe3ZhciBuPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSx0KXtuW2VdPXR9KSxufSx0LmZvckVhY2g9bChmdW5jdGlvbihlLG4pe3ZhciByPWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7Zm9yKHZhciBpPTAscztzPXJbaV07KytpKW4ocy5uYW1lLHQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUocy5uYW1lKSkpfSl9dHJ5e3ZhciBwPVwiX19zdG9yZWpzX19cIjt0LnNldChwLHApLHQuZ2V0KHApIT1wJiYodC5kaXNhYmxlZD0hMCksdC5yZW1vdmUocCl9Y2F0Y2goZil7dC5kaXNhYmxlZD0hMH10LmVuYWJsZWQ9IXQuZGlzYWJsZWQsdHlwZW9mIG1vZHVsZSE9XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMmJnRoaXMubW9kdWxlIT09bW9kdWxlP21vZHVsZS5leHBvcnRzPXQ6dHlwZW9mIGRlZmluZT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kP2RlZmluZSh0KTplLnN0b3JlPXR9KShGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkpIiwic3RvcmUgPSByZXF1aXJlKCdzdG9yZScpXG5cbiMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIHN0b3JlLmpzIGZvciBlYXN5IHN3YXBwaW5nXG5jbGFzcyBTdG9yYWdlXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWVzcGFjZT0nYWxlcGhiZXQnKSAtPlxuICAgIHRocm93ICdsb2NhbCBzdG9yYWdlIG5vdCBzdXBwb3J0ZWQnIHVubGVzcyBzdG9yZS5lbmFibGVkXG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnbG9kYXNoLmN1c3RvbScpXG5cbmNsYXNzIFV0aWxzXG4gIEBkZWZhdWx0czogXy5kZWZhdWx0c1xuICBAa2V5czogXy5rZXlzXG4gIEBzZXRfZGVidWc6IChAZGVidWcpIC0+XG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIEBkZWJ1Z1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzXG4iXX0=
