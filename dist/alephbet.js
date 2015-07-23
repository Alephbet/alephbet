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
;(function(){function t(t){return!!t&&typeof t=="object"}function r(){}function n(t,r){return typeof t!="function"?g:r===h?t:function(n,e,o,u,c){return t.call(r,n,e,o,u,c)}}function e(t,r){var n=null==t?h:t[r];return s(n)?n:h}function o(t,r){return t=typeof t=="number"||d.test(t)?+t:-1,r=null==r?V:r,-1<t&&0==t%1&&t<r}function u(t){return typeof t=="number"&&-1<t&&0==t%1&&t<=V}function c(t){for(var r=y(t),n=r.length,e=n&&t.length,c=!!e&&u(e)&&(G(t)||i(t)||p(t)),l=-1,a=[];++l<n;){var f=r[l];(c&&o(f,e)||N.call(t,f))&&a.push(f);
}return a}function l(t,r){if(typeof t!="function")throw new TypeError(b);return r=M(r===h?t.length-1:+r||0,0),function(){for(var n=arguments,e=-1,o=M(n.length-r,0),u=Array(o);++e<o;)u[e]=n[r+e];switch(r){case 0:return t.call(this,u);case 1:return t.call(this,n[0],u);case 2:return t.call(this,n[0],n[1],u)}for(o=Array(r+1),e=-1;++e<r;)o[e]=n[e];return o[r]=u,t.apply(this,o)}}function i(r){return t(r)&&null!=r&&u(z(r))&&N.call(r,"callee")&&!L.call(r,"callee")}function a(t){return f(t)&&R.call(t)==m}
function f(t){var r=typeof t;return!!t&&("object"==r||"function"==r)}function s(r){return null==r?false:a(r)?T.test(F.call(r)):t(r)&&(w(r)?T:x).test(r)}function p(r){return typeof r=="string"||t(r)&&R.call(r)==O}function y(t){if(null==t)return[];f(t)||(t=Object(t));for(var n=t.length,e=r.support,n=n&&u(n)&&(G(t)||i(t)||p(t))&&n||0,c=t.constructor,l=-1,c=a(c)&&c.prototype||k,s=c===t,y=Array(n),g=0<n,h=e.enumErrorProps&&(t===I||t instanceof Error),b=e.enumPrototypes&&a(t);++l<n;)y[l]=l+"";for(var m in t)b&&"prototype"==m||h&&("message"==m||"name"==m)||g&&o(m,n)||"constructor"==m&&(s||!N.call(t,m))||y.push(m);
if(e.nonEnumShadows&&t!==k)for(n=t===C?O:t===I?v:R.call(t),e=_[n]||_[j],n==j&&(c=k),n=S.length;n--;)m=S[n],l=e[m],s&&l||(l?!N.call(t,m):t[m]===c[m])||y.push(m);return y}function g(t){return t}var h,b="Expected a function",v="[object Error]",m="[object Function]",j="[object Object]",O="[object String]",x=/^\[object .+?Constructor\]$/,d=/^\d+$/,S="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),E={"function":true,object:true},A=E[typeof exports]&&exports&&!exports.nodeType&&exports,P=(E=E[typeof module]&&module&&!module.nodeType&&module)&&E.exports===A&&A,w=function(){
try{Object({toString:0}+"")}catch(t){return function(){return false}}return function(t){return typeof t.toString!="function"&&typeof(t+"")=="string"}}(),$=Array.prototype,I=Error.prototype,k=Object.prototype,C=String.prototype,F=Function.prototype.toString,N=k.hasOwnProperty,R=k.toString,T=RegExp("^"+F.call(N).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),L=k.propertyIsEnumerable,B=$.splice,$=e(Array,"isArray"),D=e(Object,"keys"),M=Math.max,V=9007199254740991,_={};
_["[object Array]"]=_["[object Date]"]=_["[object Number]"]={constructor:true,toLocaleString:true,toString:true,valueOf:true},_["[object Boolean]"]=_[O]={constructor:true,toString:true,valueOf:true},_[v]=_[m]=_["[object RegExp]"]={constructor:true,toString:true},_[j]={constructor:true},function(t,r){for(var n=-1,e=t.length;++n<e&&false!==r(t[n],n,t););return t}(S,function(t){for(var r in _)if(N.call(_,r)){var n=_[r];n[t]=N.call(n,t)}});var q=r.support={};!function(t){function r(){this.x=t}var n={0:t,length:t},e=[];r.prototype={
valueOf:t,y:t};for(var o in new r)e.push(o);q.enumErrorProps=L.call(I,"message")||L.call(I,"name"),q.enumPrototypes=L.call(r,"prototype"),q.nonEnumShadows=!/valueOf/.test(e),q.spliceObjects=(B.call(n,0,1),!n[0]),q.unindexedChars="xx"!="x"[0]+Object("x")[0]}(1,0);var z=function(t){return function(n){if(null==n)n=h;else{if(r.support.unindexedChars&&p(n)){for(var e=-1,o=n.length,u=Object(n);++e<o;)u[e]=n.charAt(e);n=u}else n=f(n)?n:Object(n);n=n[t]}return n}}("length"),G=$||function(r){return t(r)&&u(r.length)&&"[object Array]"==R.call(r);
},$=function(t){return l(function(r,e){var c=-1,l=null==r?0:e.length,i=2<l?e[l-2]:h,a=2<l?e[2]:h,s=1<l?e[l-1]:h;if(typeof i=="function"?(i=n(i,s),l-=2):(i=typeof s=="function"?s:h,l-=i?1:0),s=a){var s=e[0],p=e[1];if(f(a)){var y=typeof p;("number"==y?null!=a&&u(z(a))&&o(p,a.length):"string"==y&&p in a)?(a=a[p],s=s===s?s===a:a!==a):s=false}else s=false}for(s&&(i=3>l?h:i,l=1);++c<l;)(a=e[c])&&t(r,a,i);return r})}(function(t,r,n){if(n)for(var e=-1,o=J(r),u=o.length;++e<u;){var c=o[e],l=t[c],i=n(l,r[c],c,t,r);
(i===i?i===l:l!==l)&&(l!==h||c in t)||(t[c]=i)}else if(null!=r)for(n=J(r),t||(t={}),e=-1,o=n.length;++e<o;)u=n[e],t[u]=r[u];return r=t}),H=function(t,r){return l(function(n){var e=n[0];return null==e?e:(n.push(r),t.apply(h,n))})}($,function(t,r){return t===h?r:t}),J=D?function(t){var n=null==t?h:t.constructor;return typeof n=="function"&&n.prototype===t||(typeof t=="function"?r.support.enumPrototypes:null!=t&&u(z(t)))?c(t):f(t)?D(t):[]}:c;r.assign=$,r.defaults=H,r.keys=J,r.keysIn=y,r.restParam=l,r.extend=$,
r.identity=g,r.isArguments=i,r.isArray=G,r.isFunction=a,r.isNative=s,r.isObject=f,r.isString=p,r.VERSION="3.10.0",A&&E&&P&&((E.exports=r)._=r)}).call(this);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvYWxlcGhiZXQuanMuY29mZmVlIiwibGliL2xvZGFzaC5jdXN0b20ubWluLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JlLm1pbi5qcyIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9zdG9yYWdlLmpzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC91dGlscy5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDZCQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLHFCQUFSOztBQUVKOzs7RUFDSixRQUFDLENBQUEsT0FBRCxHQUFXO0lBQUMsS0FBQSxFQUFPLEtBQVI7OztFQUVMLFFBQUMsQ0FBQTs7O0lBQ0wsK0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBRVosK0JBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixLQUFuQixFQUEwQixLQUExQjtNQUNQLEdBQUEsQ0FBSSxvQ0FBQSxHQUFxQyxRQUFyQyxHQUE4QyxJQUE5QyxHQUFrRCxNQUFsRCxHQUF5RCxJQUF6RCxHQUE2RCxLQUE3RCxHQUFtRSxJQUFuRSxHQUF1RSxLQUEzRTtNQUNBLElBQXlGLE9BQU8sRUFBUCxLQUFlLFVBQXhHO0FBQUEsY0FBTSxnRkFBTjs7YUFDQSxFQUFBLENBQUcsTUFBSCxFQUFXLE9BQVgsRUFBb0IsUUFBcEIsRUFBOEIsTUFBOUIsRUFBc0MsS0FBdEMsRUFBNkMsS0FBN0M7SUFITzs7SUFLVCwrQkFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNqQiwrQkFBQyxDQUFBLE1BQUQsQ0FBUSwrQkFBQyxDQUFBLFNBQVQsRUFB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QUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsZUFBUjs7QUFFRTs7O0VBQ0osS0FBQyxDQUFBLFFBQUQsR0FBVyxDQUFDLENBQUM7O0VBQ2IsS0FBQyxDQUFBLElBQUQsR0FBTyxDQUFDLENBQUM7O0VBQ1QsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLEtBQUQ7SUFBQyxJQUFDLENBQUEsUUFBRDtFQUFEOztFQUNaLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxPQUFEO0lBQ0osSUFBd0IsSUFBQyxDQUFBLEtBQXpCO2FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQUE7O0VBREk7Ozs7OztBQUdSLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcy5jb2ZmZWUnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS5qcy5jb2ZmZWUnKVxuXG5jbGFzcyBBbGVwaEJldFxuICBAb3B0aW9ucyA9IHtkZWJ1ZzogZmFsc2V9XG5cbiAgY2xhc3MgQEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG5cbiAgICBAX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKSAtPlxuICAgICAgbG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9LCAje3ZhbHVlfVwiKVxuICAgICAgdGhyb3cgJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JyBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBnYSgnc2VuZCcsICdldmVudCcsIGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB2YWx1ZSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIEBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbClcblxuICBjbGFzcyBATG9jYWxTdG9yYWdlQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcbiAgICBAc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKVxuICAgIEBnZXQ6IChrZXkpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5nZXQoa2V5KVxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBBbGVwaEJldC5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IEFsZXBoQmV0LkxvY2FsU3RvcmFnZUFkYXB0ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAb3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucylcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpXG4gICAgICBAdmFyaWFudHMgPSB1dGlscy5rZXlzKEBvcHRpb25zLnZhcmlhbnRzKVxuICAgICAgX3J1bi5jYWxsKHRoaXMpXG5cbiAgICBydW46IC0+XG4gICAgICBsb2coXCJydW5uaW5nIHdpdGggb3B0aW9uczogI3tKU09OLnN0cmluZ2lmeShAb3B0aW9ucyl9XCIpXG4gICAgICBfZm9yY2VfdmFyaWFudCgpXG4gICAgICBAYXBwbHlfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBfZm9yY2VfdmFyaWFudCA9IC0+XG4gICAgICAjIFRPRE86IGdldCB2YXJpYW50IGZyb20gVVJJXG5cbiAgICBhcHBseV92YXJpYW50OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAb3B0aW9ucy50cmlnZ2VyKClcbiAgICAgIGxvZygndHJpZ2dlciBzZXQnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaW5fc2FtcGxlKClcbiAgICAgIGxvZygnaW4gc2FtcGxlJylcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgbG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgIGVsc2VcbiAgICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgICBAdHJhY2tpbmcoKS5leHBlcmltZW50X3N0YXJ0KEBvcHRpb25zLm5hbWUsIHZhcmlhbnQpXG4gICAgICBAb3B0aW9ucy52YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUodGhpcylcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZ29hbF9uYW1lLCBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIHJldHVybiBpZiBwcm9wcy51bmlxdWUgJiYgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiKVxuICAgICAgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgcmV0dXJuIHVubGVzcyB2YXJpYW50XG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIsIHRydWUpIGlmIHByb3BzLnVuaXF1ZVxuICAgICAgbG9nKFwiZXhwZXJpbWVudDogI3tAb3B0aW9ucy5uYW1lfSB2YXJpYW50OiN7dmFyaWFudH0gZ29hbDoje2dvYWxfbmFtZX0gY29tcGxldGVcIilcbiAgICAgIEB0cmFja2luZygpLmdvYWxfY29tcGxldGUoQG9wdGlvbnMubmFtZSwgdmFyaWFudCwgZ29hbF9uYW1lKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudHMubGVuZ3RoXG4gICAgICBjaG9zZW5fcGFydGl0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpIC8gcGFydGl0aW9ucylcbiAgICAgIHZhcmlhbnQgPSBAdmFyaWFudHNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIGxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICB2YXJpYW50XG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBhY3RpdmUgPSBNYXRoLnJhbmRvbSgpIDw9IEBvcHRpb25zLnNhbXBsZVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiLCBhY3RpdmUpXG4gICAgICBhY3RpdmVcblxuICAgIGFkZF9nb2FsOiAoZ29hbCkgPT5cbiAgICAgIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcylcblxuICAgIGFkZF9nb2FsczogKGdvYWxzKSA9PlxuICAgICAgQGFkZF9nb2FsKGdvYWwpIGZvciBnb2FsIGluIGdvYWxzXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcgaWYgQG9wdGlvbnMubmFtZSBpcyBudWxsXG4gICAgICB0aHJvdyAndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3RyaWdnZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICBAZXhwZXJpbWVudHMgPSBbXVxuXG4gICAgYWRkX2V4cGVyaW1lbnQ6IChleHBlcmltZW50KSAtPlxuICAgICAgQGV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudClcblxuICAgIGFkZF9leHBlcmltZW50czogKGV4cGVyaW1lbnRzKSAtPlxuICAgICAgQGFkZF9leHBlcmltZW50KGV4cGVyaW1lbnQpIGZvciBleHBlcmltZW50IGluIGV4cGVyaW1lbnRzXG5cbiAgICBjb21wbGV0ZTogLT5cbiAgICAgIGZvciBleHBlcmltZW50IGluIEBleHBlcmltZW50c1xuICAgICAgICBleHBlcmltZW50LmdvYWxfY29tcGxldGUoQG5hbWUsIEBwcm9wcylcblxubG9nID0gKG1lc3NhZ2UpIC0+XG4gIHV0aWxzLnNldF9kZWJ1ZyhBbGVwaEJldC5vcHRpb25zLmRlYnVnKVxuICB1dGlscy5sb2cobWVzc2FnZSlcblxubW9kdWxlLmV4cG9ydHMgPSBBbGVwaEJldFxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogbG9kYXNoIDMuMTAuMCAoQ3VzdG9tIEJ1aWxkKSBsb2Rhc2guY29tL2xpY2Vuc2UgfCBVbmRlcnNjb3JlLmpzIDEuOC4zIHVuZGVyc2NvcmVqcy5vcmcvTElDRU5TRVxuICogQnVpbGQ6IGBsb2Rhc2ggaW5jbHVkZT1cImtleXMsZGVmYXVsdHNcIiBleHBvcnRzPVwibm9kZVwiIC1vIC4vbGliL2xvZGFzaC5jdXN0b20uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQpe3JldHVybiEhdCYmdHlwZW9mIHQ9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gcigpe31mdW5jdGlvbiBuKHQscil7cmV0dXJuIHR5cGVvZiB0IT1cImZ1bmN0aW9uXCI/ZzpyPT09aD90OmZ1bmN0aW9uKG4sZSxvLHUsYyl7cmV0dXJuIHQuY2FsbChyLG4sZSxvLHUsYyl9fWZ1bmN0aW9uIGUodCxyKXt2YXIgbj1udWxsPT10P2g6dFtyXTtyZXR1cm4gcyhuKT9uOmh9ZnVuY3Rpb24gbyh0LHIpe3JldHVybiB0PXR5cGVvZiB0PT1cIm51bWJlclwifHxkLnRlc3QodCk/K3Q6LTEscj1udWxsPT1yP1Y6ciwtMTx0JiYwPT10JTEmJnQ8cn1mdW5jdGlvbiB1KHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmLTE8dCYmMD09dCUxJiZ0PD1WfWZ1bmN0aW9uIGModCl7Zm9yKHZhciByPXkodCksbj1yLmxlbmd0aCxlPW4mJnQubGVuZ3RoLGM9ISFlJiZ1KGUpJiYoRyh0KXx8aSh0KXx8cCh0KSksbD0tMSxhPVtdOysrbDxuOyl7dmFyIGY9cltsXTsoYyYmbyhmLGUpfHxOLmNhbGwodCxmKSkmJmEucHVzaChmKTtcbn1yZXR1cm4gYX1mdW5jdGlvbiBsKHQscil7aWYodHlwZW9mIHQhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKGIpO3JldHVybiByPU0ocj09PWg/dC5sZW5ndGgtMTorcnx8MCwwKSxmdW5jdGlvbigpe2Zvcih2YXIgbj1hcmd1bWVudHMsZT0tMSxvPU0obi5sZW5ndGgtciwwKSx1PUFycmF5KG8pOysrZTxvOyl1W2VdPW5bcitlXTtzd2l0Y2gocil7Y2FzZSAwOnJldHVybiB0LmNhbGwodGhpcyx1KTtjYXNlIDE6cmV0dXJuIHQuY2FsbCh0aGlzLG5bMF0sdSk7Y2FzZSAyOnJldHVybiB0LmNhbGwodGhpcyxuWzBdLG5bMV0sdSl9Zm9yKG89QXJyYXkocisxKSxlPS0xOysrZTxyOylvW2VdPW5bZV07cmV0dXJuIG9bcl09dSx0LmFwcGx5KHRoaXMsbyl9fWZ1bmN0aW9uIGkocil7cmV0dXJuIHQocikmJm51bGwhPXImJnUoeihyKSkmJk4uY2FsbChyLFwiY2FsbGVlXCIpJiYhTC5jYWxsKHIsXCJjYWxsZWVcIil9ZnVuY3Rpb24gYSh0KXtyZXR1cm4gZih0KSYmUi5jYWxsKHQpPT1tfVxuZnVuY3Rpb24gZih0KXt2YXIgcj10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1yfHxcImZ1bmN0aW9uXCI9PXIpfWZ1bmN0aW9uIHMocil7cmV0dXJuIG51bGw9PXI/ZmFsc2U6YShyKT9ULnRlc3QoRi5jYWxsKHIpKTp0KHIpJiYodyhyKT9UOngpLnRlc3Qocil9ZnVuY3Rpb24gcChyKXtyZXR1cm4gdHlwZW9mIHI9PVwic3RyaW5nXCJ8fHQocikmJlIuY2FsbChyKT09T31mdW5jdGlvbiB5KHQpe2lmKG51bGw9PXQpcmV0dXJuW107Zih0KXx8KHQ9T2JqZWN0KHQpKTtmb3IodmFyIG49dC5sZW5ndGgsZT1yLnN1cHBvcnQsbj1uJiZ1KG4pJiYoRyh0KXx8aSh0KXx8cCh0KSkmJm58fDAsYz10LmNvbnN0cnVjdG9yLGw9LTEsYz1hKGMpJiZjLnByb3RvdHlwZXx8ayxzPWM9PT10LHk9QXJyYXkobiksZz0wPG4saD1lLmVudW1FcnJvclByb3BzJiYodD09PUl8fHQgaW5zdGFuY2VvZiBFcnJvciksYj1lLmVudW1Qcm90b3R5cGVzJiZhKHQpOysrbDxuOyl5W2xdPWwrXCJcIjtmb3IodmFyIG0gaW4gdCliJiZcInByb3RvdHlwZVwiPT1tfHxoJiYoXCJtZXNzYWdlXCI9PW18fFwibmFtZVwiPT1tKXx8ZyYmbyhtLG4pfHxcImNvbnN0cnVjdG9yXCI9PW0mJihzfHwhTi5jYWxsKHQsbSkpfHx5LnB1c2gobSk7XG5pZihlLm5vbkVudW1TaGFkb3dzJiZ0IT09aylmb3Iobj10PT09Qz9POnQ9PT1JP3Y6Ui5jYWxsKHQpLGU9X1tuXXx8X1tqXSxuPT1qJiYoYz1rKSxuPVMubGVuZ3RoO24tLTspbT1TW25dLGw9ZVttXSxzJiZsfHwobD8hTi5jYWxsKHQsbSk6dFttXT09PWNbbV0pfHx5LnB1c2gobSk7cmV0dXJuIHl9ZnVuY3Rpb24gZyh0KXtyZXR1cm4gdH12YXIgaCxiPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLHY9XCJbb2JqZWN0IEVycm9yXVwiLG09XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLGo9XCJbb2JqZWN0IE9iamVjdF1cIixPPVwiW29iamVjdCBTdHJpbmddXCIseD0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLGQ9L15cXGQrJC8sUz1cImNvbnN0cnVjdG9yIGhhc093blByb3BlcnR5IGlzUHJvdG90eXBlT2YgcHJvcGVydHlJc0VudW1lcmFibGUgdG9Mb2NhbGVTdHJpbmcgdG9TdHJpbmcgdmFsdWVPZlwiLnNwbGl0KFwiIFwiKSxFPXtcImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0sQT1FW3R5cGVvZiBleHBvcnRzXSYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsUD0oRT1FW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSkmJkUuZXhwb3J0cz09PUEmJkEsdz1mdW5jdGlvbigpe1xudHJ5e09iamVjdCh7dG9TdHJpbmc6MH0rXCJcIil9Y2F0Y2godCl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfX1yZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0LnRvU3RyaW5nIT1cImZ1bmN0aW9uXCImJnR5cGVvZih0K1wiXCIpPT1cInN0cmluZ1wifX0oKSwkPUFycmF5LnByb3RvdHlwZSxJPUVycm9yLnByb3RvdHlwZSxrPU9iamVjdC5wcm90b3R5cGUsQz1TdHJpbmcucHJvdG90eXBlLEY9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLE49ay5oYXNPd25Qcm9wZXJ0eSxSPWsudG9TdHJpbmcsVD1SZWdFeHAoXCJeXCIrRi5jYWxsKE4pLnJlcGxhY2UoL1tcXFxcXiQuKis/KClbXFxde318XS9nLFwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIiksTD1rLnByb3BlcnR5SXNFbnVtZXJhYmxlLEI9JC5zcGxpY2UsJD1lKEFycmF5LFwiaXNBcnJheVwiKSxEPWUoT2JqZWN0LFwia2V5c1wiKSxNPU1hdGgubWF4LFY9OTAwNzE5OTI1NDc0MDk5MSxfPXt9O1xuX1tcIltvYmplY3QgQXJyYXldXCJdPV9bXCJbb2JqZWN0IERhdGVdXCJdPV9bXCJbb2JqZWN0IE51bWJlcl1cIl09e2NvbnN0cnVjdG9yOnRydWUsdG9Mb2NhbGVTdHJpbmc6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX0sX1tcIltvYmplY3QgQm9vbGVhbl1cIl09X1tPXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX0sX1t2XT1fW21dPV9bXCJbb2JqZWN0IFJlZ0V4cF1cIl09e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZX0sX1tqXT17Y29uc3RydWN0b3I6dHJ1ZX0sZnVuY3Rpb24odCxyKXtmb3IodmFyIG49LTEsZT10Lmxlbmd0aDsrK248ZSYmZmFsc2UhPT1yKHRbbl0sbix0KTspO3JldHVybiB0fShTLGZ1bmN0aW9uKHQpe2Zvcih2YXIgciBpbiBfKWlmKE4uY2FsbChfLHIpKXt2YXIgbj1fW3JdO25bdF09Ti5jYWxsKG4sdCl9fSk7dmFyIHE9ci5zdXBwb3J0PXt9OyFmdW5jdGlvbih0KXtmdW5jdGlvbiByKCl7dGhpcy54PXR9dmFyIG49ezA6dCxsZW5ndGg6dH0sZT1bXTtyLnByb3RvdHlwZT17XG52YWx1ZU9mOnQseTp0fTtmb3IodmFyIG8gaW4gbmV3IHIpZS5wdXNoKG8pO3EuZW51bUVycm9yUHJvcHM9TC5jYWxsKEksXCJtZXNzYWdlXCIpfHxMLmNhbGwoSSxcIm5hbWVcIikscS5lbnVtUHJvdG90eXBlcz1MLmNhbGwocixcInByb3RvdHlwZVwiKSxxLm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKSxxLnNwbGljZU9iamVjdHM9KEIuY2FsbChuLDAsMSksIW5bMF0pLHEudW5pbmRleGVkQ2hhcnM9XCJ4eFwiIT1cInhcIlswXStPYmplY3QoXCJ4XCIpWzBdfSgxLDApO3ZhciB6PWZ1bmN0aW9uKHQpe3JldHVybiBmdW5jdGlvbihuKXtpZihudWxsPT1uKW49aDtlbHNle2lmKHIuc3VwcG9ydC51bmluZGV4ZWRDaGFycyYmcChuKSl7Zm9yKHZhciBlPS0xLG89bi5sZW5ndGgsdT1PYmplY3Qobik7KytlPG87KXVbZV09bi5jaGFyQXQoZSk7bj11fWVsc2Ugbj1mKG4pP246T2JqZWN0KG4pO249blt0XX1yZXR1cm4gbn19KFwibGVuZ3RoXCIpLEc9JHx8ZnVuY3Rpb24ocil7cmV0dXJuIHQocikmJnUoci5sZW5ndGgpJiZcIltvYmplY3QgQXJyYXldXCI9PVIuY2FsbChyKTtcbn0sJD1mdW5jdGlvbih0KXtyZXR1cm4gbChmdW5jdGlvbihyLGUpe3ZhciBjPS0xLGw9bnVsbD09cj8wOmUubGVuZ3RoLGk9MjxsP2VbbC0yXTpoLGE9MjxsP2VbMl06aCxzPTE8bD9lW2wtMV06aDtpZih0eXBlb2YgaT09XCJmdW5jdGlvblwiPyhpPW4oaSxzKSxsLT0yKTooaT10eXBlb2Ygcz09XCJmdW5jdGlvblwiP3M6aCxsLT1pPzE6MCkscz1hKXt2YXIgcz1lWzBdLHA9ZVsxXTtpZihmKGEpKXt2YXIgeT10eXBlb2YgcDsoXCJudW1iZXJcIj09eT9udWxsIT1hJiZ1KHooYSkpJiZvKHAsYS5sZW5ndGgpOlwic3RyaW5nXCI9PXkmJnAgaW4gYSk/KGE9YVtwXSxzPXM9PT1zP3M9PT1hOmEhPT1hKTpzPWZhbHNlfWVsc2Ugcz1mYWxzZX1mb3IocyYmKGk9Mz5sP2g6aSxsPTEpOysrYzxsOykoYT1lW2NdKSYmdChyLGEsaSk7cmV0dXJuIHJ9KX0oZnVuY3Rpb24odCxyLG4pe2lmKG4pZm9yKHZhciBlPS0xLG89SihyKSx1PW8ubGVuZ3RoOysrZTx1Oyl7dmFyIGM9b1tlXSxsPXRbY10saT1uKGwscltjXSxjLHQscik7XG4oaT09PWk/aT09PWw6bCE9PWwpJiYobCE9PWh8fGMgaW4gdCl8fCh0W2NdPWkpfWVsc2UgaWYobnVsbCE9cilmb3Iobj1KKHIpLHR8fCh0PXt9KSxlPS0xLG89bi5sZW5ndGg7KytlPG87KXU9bltlXSx0W3VdPXJbdV07cmV0dXJuIHI9dH0pLEg9ZnVuY3Rpb24odCxyKXtyZXR1cm4gbChmdW5jdGlvbihuKXt2YXIgZT1uWzBdO3JldHVybiBudWxsPT1lP2U6KG4ucHVzaChyKSx0LmFwcGx5KGgsbikpfSl9KCQsZnVuY3Rpb24odCxyKXtyZXR1cm4gdD09PWg/cjp0fSksSj1EP2Z1bmN0aW9uKHQpe3ZhciBuPW51bGw9PXQ/aDp0LmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2Ygbj09XCJmdW5jdGlvblwiJiZuLnByb3RvdHlwZT09PXR8fCh0eXBlb2YgdD09XCJmdW5jdGlvblwiP3Iuc3VwcG9ydC5lbnVtUHJvdG90eXBlczpudWxsIT10JiZ1KHoodCkpKT9jKHQpOmYodCk/RCh0KTpbXX06YztyLmFzc2lnbj0kLHIuZGVmYXVsdHM9SCxyLmtleXM9SixyLmtleXNJbj15LHIucmVzdFBhcmFtPWwsci5leHRlbmQ9JCxcbnIuaWRlbnRpdHk9ZyxyLmlzQXJndW1lbnRzPWksci5pc0FycmF5PUcsci5pc0Z1bmN0aW9uPWEsci5pc05hdGl2ZT1zLHIuaXNPYmplY3Q9ZixyLmlzU3RyaW5nPXAsci5WRVJTSU9OPVwiMy4xMC4wXCIsQSYmRSYmUCYmKChFLmV4cG9ydHM9cikuXz1yKX0pLmNhbGwodGhpcyk7IiwiLyogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgTWFyY3VzIFdlc3RpbiAqL1xuKGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG8oKXt0cnl7cmV0dXJuIHIgaW4gZSYmZVtyXX1jYXRjaCh0KXtyZXR1cm4hMX19dmFyIHQ9e30sbj1lLmRvY3VtZW50LHI9XCJsb2NhbFN0b3JhZ2VcIixpPVwic2NyaXB0XCIsczt0LmRpc2FibGVkPSExLHQudmVyc2lvbj1cIjEuMy4xN1wiLHQuc2V0PWZ1bmN0aW9uKGUsdCl7fSx0LmdldD1mdW5jdGlvbihlLHQpe30sdC5oYXM9ZnVuY3Rpb24oZSl7cmV0dXJuIHQuZ2V0KGUpIT09dW5kZWZpbmVkfSx0LnJlbW92ZT1mdW5jdGlvbihlKXt9LHQuY2xlYXI9ZnVuY3Rpb24oKXt9LHQudHJhbnNhY3Q9ZnVuY3Rpb24oZSxuLHIpe3I9PW51bGwmJihyPW4sbj1udWxsKSxuPT1udWxsJiYobj17fSk7dmFyIGk9dC5nZXQoZSxuKTtyKGkpLHQuc2V0KGUsaSl9LHQuZ2V0QWxsPWZ1bmN0aW9uKCl7fSx0LmZvckVhY2g9ZnVuY3Rpb24oKXt9LHQuc2VyaWFsaXplPWZ1bmN0aW9uKGUpe3JldHVybiBKU09OLnN0cmluZ2lmeShlKX0sdC5kZXNlcmlhbGl6ZT1mdW5jdGlvbihlKXtpZih0eXBlb2YgZSE9XCJzdHJpbmdcIilyZXR1cm4gdW5kZWZpbmVkO3RyeXtyZXR1cm4gSlNPTi5wYXJzZShlKX1jYXRjaCh0KXtyZXR1cm4gZXx8dW5kZWZpbmVkfX07aWYobygpKXM9ZVtyXSx0LnNldD1mdW5jdGlvbihlLG4pe3JldHVybiBuPT09dW5kZWZpbmVkP3QucmVtb3ZlKGUpOihzLnNldEl0ZW0oZSx0LnNlcmlhbGl6ZShuKSksbil9LHQuZ2V0PWZ1bmN0aW9uKGUsbil7dmFyIHI9dC5kZXNlcmlhbGl6ZShzLmdldEl0ZW0oZSkpO3JldHVybiByPT09dW5kZWZpbmVkP246cn0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7cy5yZW1vdmVJdGVtKGUpfSx0LmNsZWFyPWZ1bmN0aW9uKCl7cy5jbGVhcigpfSx0LmdldEFsbD1mdW5jdGlvbigpe3ZhciBlPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCxuKXtlW3RdPW59KSxlfSx0LmZvckVhY2g9ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjxzLmxlbmd0aDtuKyspe3ZhciByPXMua2V5KG4pO2Uocix0LmdldChyKSl9fTtlbHNlIGlmKG4uZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKXt2YXIgdSxhO3RyeXthPW5ldyBBY3RpdmVYT2JqZWN0KFwiaHRtbGZpbGVcIiksYS5vcGVuKCksYS53cml0ZShcIjxcIitpK1wiPmRvY3VtZW50Lnc9d2luZG93PC9cIitpKyc+PGlmcmFtZSBzcmM9XCIvZmF2aWNvbi5pY29cIj48L2lmcmFtZT4nKSxhLmNsb3NlKCksdT1hLncuZnJhbWVzWzBdLmRvY3VtZW50LHM9dS5jcmVhdGVFbGVtZW50KFwiZGl2XCIpfWNhdGNoKGYpe3M9bi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHU9bi5ib2R5fXZhciBsPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3ZhciBuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtuLnVuc2hpZnQocyksdS5hcHBlbmRDaGlsZChzKSxzLmFkZEJlaGF2aW9yKFwiI2RlZmF1bHQjdXNlckRhdGFcIikscy5sb2FkKHIpO3ZhciBpPWUuYXBwbHkodCxuKTtyZXR1cm4gdS5yZW1vdmVDaGlsZChzKSxpfX0sYz1uZXcgUmVnRXhwKFwiWyFcXFwiIyQlJicoKSorLC9cXFxcXFxcXDo7PD0+P0BbXFxcXF1eYHt8fX5dXCIsXCJnXCIpO2Z1bmN0aW9uIGgoZSl7cmV0dXJuIGUucmVwbGFjZSgvXmQvLFwiX19fJCZcIikucmVwbGFjZShjLFwiX19fXCIpfXQuc2V0PWwoZnVuY3Rpb24oZSxuLGkpe3JldHVybiBuPWgobiksaT09PXVuZGVmaW5lZD90LnJlbW92ZShuKTooZS5zZXRBdHRyaWJ1dGUobix0LnNlcmlhbGl6ZShpKSksZS5zYXZlKHIpLGkpfSksdC5nZXQ9bChmdW5jdGlvbihlLG4scil7bj1oKG4pO3ZhciBpPXQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUobikpO3JldHVybiBpPT09dW5kZWZpbmVkP3I6aX0pLHQucmVtb3ZlPWwoZnVuY3Rpb24oZSx0KXt0PWgodCksZS5yZW1vdmVBdHRyaWJ1dGUodCksZS5zYXZlKHIpfSksdC5jbGVhcj1sKGZ1bmN0aW9uKGUpe3ZhciB0PWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7ZS5sb2FkKHIpO2Zvcih2YXIgbj0wLGk7aT10W25dO24rKyllLnJlbW92ZUF0dHJpYnV0ZShpLm5hbWUpO2Uuc2F2ZShyKX0pLHQuZ2V0QWxsPWZ1bmN0aW9uKGUpe3ZhciBuPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSx0KXtuW2VdPXR9KSxufSx0LmZvckVhY2g9bChmdW5jdGlvbihlLG4pe3ZhciByPWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7Zm9yKHZhciBpPTAscztzPXJbaV07KytpKW4ocy5uYW1lLHQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUocy5uYW1lKSkpfSl9dHJ5e3ZhciBwPVwiX19zdG9yZWpzX19cIjt0LnNldChwLHApLHQuZ2V0KHApIT1wJiYodC5kaXNhYmxlZD0hMCksdC5yZW1vdmUocCl9Y2F0Y2goZil7dC5kaXNhYmxlZD0hMH10LmVuYWJsZWQ9IXQuZGlzYWJsZWQsdHlwZW9mIG1vZHVsZSE9XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMmJnRoaXMubW9kdWxlIT09bW9kdWxlP21vZHVsZS5leHBvcnRzPXQ6dHlwZW9mIGRlZmluZT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kP2RlZmluZSh0KTplLnN0b3JlPXR9KShGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkpIiwic3RvcmUgPSByZXF1aXJlKCdzdG9yZScpXG5cbiMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIHN0b3JlLmpzIGZvciBlYXN5IHN3YXBwaW5nXG5jbGFzcyBTdG9yYWdlXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWVzcGFjZT0nYWxlcGhiZXQnKSAtPlxuICAgIHRocm93ICdsb2NhbCBzdG9yYWdlIG5vdCBzdXBwb3J0ZWQnIHVubGVzcyBzdG9yZS5lbmFibGVkXG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnbG9kYXNoLmN1c3RvbScpXG5cbmNsYXNzIFV0aWxzXG4gIEBkZWZhdWx0czogXy5kZWZhdWx0c1xuICBAa2V5czogXy5rZXlzXG4gIEBzZXRfZGVidWc6IChAZGVidWcpIC0+XG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIEBkZWJ1Z1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzXG4iXX0=
