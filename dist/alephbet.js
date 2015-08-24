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
      this.name = this.options.name;
      this.variants = this.options.variants;
      this.variant_names = utils.keys(this.variants);
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
      if ((ref = this.variants[variant]) != null) {
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
      partitions = 1.0 / this.variant_names.length;
      chosen_partition = Math.floor(Math.random() / partitions);
      variant = this.variant_names[chosen_partition];
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvYWxlcGhiZXQuanMuY29mZmVlIiwibGliL2xvZGFzaC5jdXN0b20ubWluLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JlLm1pbi5qcyIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9zdG9yYWdlLmpzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC91dGlscy5qcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDZCQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLHFCQUFSOztBQUVKOzs7RUFDSixRQUFDLENBQUEsT0FBRCxHQUFXO0lBQUMsS0FBQSxFQUFPLEtBQVI7OztFQUVMLFFBQUMsQ0FBQTs7O0lBQ0wsK0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBRVosK0JBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixLQUFuQixFQUEwQixLQUExQjtNQUNQLEdBQUEsQ0FBSSxvQ0FBQSxHQUFxQyxRQUFyQyxHQUE4QyxJQUE5QyxHQUFrRCxNQUFsRCxHQUF5RCxJQUF6RCxHQUE2RCxLQUE3RCxHQUFtRSxJQUFuRSxHQUF1RSxLQUEzRTtNQUNBLElBQXlGLE9BQU8sRUFBUCxLQUFlLFVBQXhHO0FBQUEsY0FBTSxnRkFBTjs7YUFDQSxFQUFBLENBQUcsTUFBSCxFQUFXLE9BQVgsRUFBb0IsUUFBcEIsRUFBOEIsTUFBOUIsRUFBc0MsS0FBdEMsRUFBNkMsS0FBN0M7SUFITzs7SUFLVCwrQkFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNqQiwrQkFBQyxDQUFBLE1BQUQsQ0FBUSwrQkFBQyxDQUFBLFNBQVQsRUFBdUIsZUFBRCxHQUFpQixLQUFqQixHQUFzQixPQUE1QyxFQUF1RCxVQUF2RDtJQURpQjs7SUFHbkIsK0JBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixJQUEzQjthQUNkLCtCQUFDLENBQUEsTUFBRCxDQUFRLCtCQUFDLENBQUEsU0FBVCxFQUF1QixlQUFELEdBQWlCLEtBQWpCLEdBQXNCLE9BQTVDLEVBQXVELElBQXZEO0lBRGM7Ozs7OztFQUdaLFFBQUMsQ0FBQTs7O0lBQ0wsbUJBQUMsQ0FBQSxTQUFELEdBQVk7O0lBQ1osbUJBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFELEVBQU0sS0FBTjthQUNBLElBQUEsT0FBQSxDQUFRLElBQUMsQ0FBQSxTQUFULENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsR0FBeEIsRUFBNkIsS0FBN0I7SUFEQTs7SUFFTixtQkFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7YUFDQSxJQUFBLE9BQUEsQ0FBUSxJQUFDLENBQUEsU0FBVCxDQUFtQixDQUFDLEdBQXBCLENBQXdCLEdBQXhCO0lBREE7Ozs7OztFQUdGLFFBQUMsQ0FBQTtBQUNMLFFBQUE7O0lBQUEsVUFBQyxDQUFBLFFBQUQsR0FDRTtNQUFBLElBQUEsRUFBTSxJQUFOO01BQ0EsUUFBQSxFQUFVLElBRFY7TUFFQSxNQUFBLEVBQVEsR0FGUjtNQUdBLE9BQUEsRUFBUyxTQUFBO2VBQUc7TUFBSCxDQUhUO01BSUEsZ0JBQUEsRUFBa0IsUUFBUSxDQUFDLCtCQUozQjtNQUtBLGVBQUEsRUFBaUIsUUFBUSxDQUFDLG1CQUwxQjs7O0lBT1csb0JBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSw0QkFBRCxVQUFTOzs7TUFDckIsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsT0FBaEIsRUFBeUIsVUFBVSxDQUFDLFFBQXBDO01BQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDO01BQ2pCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQztNQUNyQixJQUFDLENBQUEsYUFBRCxHQUFpQixLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaO01BQ2pCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtJQU5XOzt5QkFRYixHQUFBLEdBQUssU0FBQTtNQUNILEdBQUEsQ0FBSSx3QkFBQSxHQUF3QixDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE9BQWhCLENBQUQsQ0FBNUI7TUFDQSxjQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBO0lBSEc7O0lBS0wsSUFBQSxHQUFPLFNBQUE7YUFBRyxJQUFDLENBQUEsR0FBRCxDQUFBO0lBQUg7O0lBRVAsY0FBQSxHQUFpQixTQUFBLEdBQUE7O3lCQUdqQixhQUFBLEdBQWUsU0FBQTtBQUNiLFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsR0FBQSxDQUFJLGFBQUo7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFkO0FBQUEsZUFBQTs7TUFDQSxHQUFBLENBQUksV0FBSjtNQUNBLElBQUcsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQWI7UUFDRSxHQUFBLENBQU8sT0FBRCxHQUFTLFNBQWYsRUFERjtPQUFBLE1BQUE7UUFHRSxPQUFBLEdBQVUsSUFBQyxDQUFBLFlBQUQsQ0FBQTtRQUNWLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVyxDQUFDLGdCQUFaLENBQTZCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBdEMsRUFBNEMsT0FBNUMsRUFKRjs7O1dBS2tCLENBQUUsUUFBcEIsQ0FBNkIsSUFBN0I7O2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsR0FBWCxDQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVYsR0FBZSxVQUFoQyxFQUEyQyxPQUEzQztJQVhhOzt5QkFhZixhQUFBLEdBQWUsU0FBQyxTQUFELEVBQVksS0FBWjtBQUNiLFVBQUE7O1FBRHlCLFFBQU07O01BQy9CLEtBQUssQ0FBQyxRQUFOLENBQWUsS0FBZixFQUFzQjtRQUFDLE1BQUEsRUFBUSxJQUFUO09BQXRCO01BQ0EsSUFBVSxLQUFLLENBQUMsTUFBTixJQUFnQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLEdBQWYsR0FBa0IsU0FBbkMsQ0FBMUI7QUFBQSxlQUFBOztNQUNBLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNWLElBQUEsQ0FBYyxPQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUF5RCxLQUFLLENBQUMsTUFBL0Q7UUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLEdBQWYsR0FBa0IsU0FBbkMsRUFBZ0QsSUFBaEQsRUFBQTs7TUFDQSxHQUFBLENBQUksY0FBQSxHQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBeEIsR0FBNkIsV0FBN0IsR0FBd0MsT0FBeEMsR0FBZ0QsUUFBaEQsR0FBd0QsU0FBeEQsR0FBa0UsV0FBdEU7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVcsQ0FBQyxhQUFaLENBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBbkMsRUFBeUMsT0FBekMsRUFBa0QsU0FBbEQ7SUFQYTs7eUJBU2Ysa0JBQUEsR0FBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFVBQWhDO0lBRGtCOzt5QkFHcEIsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsVUFBQSxHQUFhLEdBQUEsR0FBTSxJQUFDLENBQUEsYUFBYSxDQUFDO01BQ2xDLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLFVBQTNCO01BQ25CLE9BQUEsR0FBVSxJQUFDLENBQUEsYUFBYyxDQUFBLGdCQUFBO01BQ3pCLEdBQUEsQ0FBTyxPQUFELEdBQVMsU0FBZjthQUNBO0lBTFk7O3lCQU9kLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFlBQWhDO01BQ1QsSUFBcUIsT0FBTyxNQUFQLEtBQWlCLFdBQXRDO0FBQUEsZUFBTyxPQUFQOztNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsSUFBaUIsSUFBQyxDQUFBLE9BQU8sQ0FBQztNQUNuQyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFlBQWhDLEVBQTZDLE1BQTdDO2FBQ0E7SUFMUzs7eUJBT1gsUUFBQSxHQUFVLFNBQUMsSUFBRDthQUNSLElBQUksQ0FBQyxjQUFMLENBQW9CLElBQXBCO0lBRFE7O3lCQUdWLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxVQUFBO0FBQUE7V0FBQSx1Q0FBQTs7cUJBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO0FBQUE7O0lBRFM7O3lCQUdYLE9BQUEsR0FBUyxTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQztJQUFaOzt5QkFFVCxRQUFBLEdBQVUsU0FBQTthQUFHLElBQUMsQ0FBQSxPQUFPLENBQUM7SUFBWjs7SUFFVixTQUFBLEdBQVksU0FBQTtNQUNWLElBQWdELElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxLQUFpQixJQUFqRTtBQUFBLGNBQU0sdUNBQU47O01BQ0EsSUFBcUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULEtBQXFCLElBQTFEO0FBQUEsY0FBTSw0QkFBTjs7TUFDQSxJQUFzQyxPQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBaEIsS0FBNkIsVUFBbkU7QUFBQSxjQUFNLDZCQUFOOztJQUhVOzs7Ozs7RUFLUixRQUFDLENBQUE7SUFDUSxjQUFDLElBQUQsRUFBUSxNQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEseUJBQUQsU0FBTztNQUMxQixLQUFLLENBQUMsUUFBTixDQUFlLElBQUMsQ0FBQSxLQUFoQixFQUF1QjtRQUFDLE1BQUEsRUFBUSxJQUFUO09BQXZCO01BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUZKOzttQkFJYixjQUFBLEdBQWdCLFNBQUMsVUFBRDthQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixVQUFsQjtJQURjOzttQkFHaEIsZUFBQSxHQUFpQixTQUFDLFdBQUQ7QUFDZixVQUFBO0FBQUE7V0FBQSw2Q0FBQTs7cUJBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsVUFBaEI7QUFBQTs7SUFEZTs7bUJBR2pCLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsSUFBQyxDQUFBLElBQTFCLEVBQWdDLElBQUMsQ0FBQSxLQUFqQztBQURGOztJQURROzs7Ozs7Ozs7O0FBSWQsR0FBQSxHQUFNLFNBQUMsT0FBRDtFQUNKLEtBQUssQ0FBQyxTQUFOLENBQWdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBakM7U0FDQSxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVY7QUFGSTs7QUFJTixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQy9IakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7O0FDREEsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0FBR0Y7RUFDUyxpQkFBQyxTQUFEO0lBQUMsSUFBQyxDQUFBLGdDQUFELFlBQVc7SUFDdkIsSUFBQSxDQUEyQyxLQUFLLENBQUMsT0FBakQ7QUFBQSxZQUFNLDhCQUFOOztJQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsU0FBWCxDQUFBLElBQXlCO0VBRnpCOztvQkFHYixHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sS0FBTjtJQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQSxDQUFULEdBQWdCO0lBQ2hCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsRUFBc0IsSUFBQyxDQUFBLE9BQXZCO0FBQ0EsV0FBTztFQUhKOztvQkFJTCxHQUFBLEdBQUssU0FBQyxHQUFEO1dBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxHQUFBO0VBRE47Ozs7OztBQUlQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDZGpCLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxlQUFSOztBQUVFOzs7RUFDSixLQUFDLENBQUEsUUFBRCxHQUFXLENBQUMsQ0FBQzs7RUFDYixLQUFDLENBQUEsSUFBRCxHQUFPLENBQUMsQ0FBQzs7RUFDVCxLQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsS0FBRDtJQUFDLElBQUMsQ0FBQSxRQUFEO0VBQUQ7O0VBQ1osS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLE9BQUQ7SUFDSixJQUF3QixJQUFDLENBQUEsS0FBekI7YUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBQTs7RUFESTs7Ozs7O0FBR1IsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzLmNvZmZlZScpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzLmNvZmZlZScpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0ge2RlYnVnOiBmYWxzZX1cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpIC0+XG4gICAgICBsb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH0sICN7dmFsdWV9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKVxuXG4gICAgQGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgQGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsKVxuXG4gIGNsYXNzIEBMb2NhbFN0b3JhZ2VBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIEBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuc2V0KGtleSwgdmFsdWUpXG4gICAgQGdldDogKGtleSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLmdldChrZXkpXG5cbiAgY2xhc3MgQEV4cGVyaW1lbnRcbiAgICBAX29wdGlvbnM6XG4gICAgICBuYW1lOiBudWxsXG4gICAgICB2YXJpYW50czogbnVsbFxuICAgICAgc2FtcGxlOiAxLjBcbiAgICAgIHRyaWdnZXI6IC0+IHRydWVcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IEFsZXBoQmV0Lkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogQWxlcGhCZXQuTG9jYWxTdG9yYWdlQWRhcHRlclxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBvcHRpb25zLCBFeHBlcmltZW50Ll9vcHRpb25zKVxuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcylcbiAgICAgIEBuYW1lID0gQG9wdGlvbnMubmFtZVxuICAgICAgQHZhcmlhbnRzID0gQG9wdGlvbnMudmFyaWFudHNcbiAgICAgIEB2YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyhAdmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIGxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIF9mb3JjZV92YXJpYW50KClcbiAgICAgIEBhcHBseV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIF9mb3JjZV92YXJpYW50ID0gLT5cbiAgICAgICMgVE9ETzogZ2V0IHZhcmlhbnQgZnJvbSBVUklcblxuICAgIGFwcGx5X3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgbG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgbG9nKCdpbiBzYW1wbGUnKVxuICAgICAgaWYgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgICBsb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgZWxzZVxuICAgICAgICB2YXJpYW50ID0gQHBpY2tfdmFyaWFudCgpXG4gICAgICAgIEB0cmFja2luZygpLmV4cGVyaW1lbnRfc3RhcnQoQG9wdGlvbnMubmFtZSwgdmFyaWFudClcbiAgICAgIEB2YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUodGhpcylcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZ29hbF9uYW1lLCBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIHJldHVybiBpZiBwcm9wcy51bmlxdWUgJiYgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiKVxuICAgICAgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgcmV0dXJuIHVubGVzcyB2YXJpYW50XG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIsIHRydWUpIGlmIHByb3BzLnVuaXF1ZVxuICAgICAgbG9nKFwiZXhwZXJpbWVudDogI3tAb3B0aW9ucy5uYW1lfSB2YXJpYW50OiN7dmFyaWFudH0gZ29hbDoje2dvYWxfbmFtZX0gY29tcGxldGVcIilcbiAgICAgIEB0cmFja2luZygpLmdvYWxfY29tcGxldGUoQG9wdGlvbnMubmFtZSwgdmFyaWFudCwgZ29hbF9uYW1lKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudF9uYW1lcy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICBsb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgdmFyaWFudFxuXG4gICAgaW5fc2FtcGxlOiAtPlxuICAgICAgYWN0aXZlID0gQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiKVxuICAgICAgcmV0dXJuIGFjdGl2ZSB1bmxlc3MgdHlwZW9mIGFjdGl2ZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgYWN0aXZlID0gTWF0aC5yYW5kb20oKSA8PSBAb3B0aW9ucy5zYW1wbGVcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIiwgYWN0aXZlKVxuICAgICAgYWN0aXZlXG5cbiAgICBhZGRfZ29hbDogKGdvYWwpID0+XG4gICAgICBnb2FsLmFkZF9leHBlcmltZW50KHRoaXMpXG5cbiAgICBhZGRfZ29hbHM6IChnb2FscykgPT5cbiAgICAgIEBhZGRfZ29hbChnb2FsKSBmb3IgZ29hbCBpbiBnb2Fsc1xuXG4gICAgc3RvcmFnZTogLT4gQG9wdGlvbnMuc3RvcmFnZV9hZGFwdGVyXG5cbiAgICB0cmFja2luZzogLT4gQG9wdGlvbnMudHJhY2tpbmdfYWRhcHRlclxuXG4gICAgX3ZhbGlkYXRlID0gLT5cbiAgICAgIHRocm93ICdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3ZhcmlhbnRzIG11c3QgYmUgcHJvdmlkZWQnIGlmIEBvcHRpb25zLnZhcmlhbnRzIGlzIG51bGxcbiAgICAgIHRocm93ICd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicgaWYgdHlwZW9mIEBvcHRpb25zLnRyaWdnZXIgaXNudCAnZnVuY3Rpb24nXG5cbiAgY2xhc3MgQEdvYWxcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAcHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgQGV4cGVyaW1lbnRzID0gW11cblxuICAgIGFkZF9leHBlcmltZW50OiAoZXhwZXJpbWVudCkgLT5cbiAgICAgIEBleHBlcmltZW50cy5wdXNoKGV4cGVyaW1lbnQpXG5cbiAgICBhZGRfZXhwZXJpbWVudHM6IChleHBlcmltZW50cykgLT5cbiAgICAgIEBhZGRfZXhwZXJpbWVudChleHBlcmltZW50KSBmb3IgZXhwZXJpbWVudCBpbiBleHBlcmltZW50c1xuXG4gICAgY29tcGxldGU6IC0+XG4gICAgICBmb3IgZXhwZXJpbWVudCBpbiBAZXhwZXJpbWVudHNcbiAgICAgICAgZXhwZXJpbWVudC5nb2FsX2NvbXBsZXRlKEBuYW1lLCBAcHJvcHMpXG5cbmxvZyA9IChtZXNzYWdlKSAtPlxuICB1dGlscy5zZXRfZGVidWcoQWxlcGhCZXQub3B0aW9ucy5kZWJ1ZylcbiAgdXRpbHMubG9nKG1lc3NhZ2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIGxvZGFzaCAzLjEwLjAgKEN1c3RvbSBCdWlsZCkgbG9kYXNoLmNvbS9saWNlbnNlIHwgVW5kZXJzY29yZS5qcyAxLjguMyB1bmRlcnNjb3JlanMub3JnL0xJQ0VOU0VcbiAqIEJ1aWxkOiBgbG9kYXNoIGluY2x1ZGU9XCJrZXlzLGRlZmF1bHRzXCIgZXhwb3J0cz1cIm5vZGVcIiAtbyAuL2xpYi9sb2Rhc2guY3VzdG9tLmpzYFxuICovXG47KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0KXtyZXR1cm4hIXQmJnR5cGVvZiB0PT1cIm9iamVjdFwifWZ1bmN0aW9uIHIoKXt9ZnVuY3Rpb24gbih0LHIpe3JldHVybiB0eXBlb2YgdCE9XCJmdW5jdGlvblwiP2c6cj09PWg/dDpmdW5jdGlvbihuLGUsbyx1LGMpe3JldHVybiB0LmNhbGwocixuLGUsbyx1LGMpfX1mdW5jdGlvbiBlKHQscil7dmFyIG49bnVsbD09dD9oOnRbcl07cmV0dXJuIHMobik/bjpofWZ1bmN0aW9uIG8odCxyKXtyZXR1cm4gdD10eXBlb2YgdD09XCJudW1iZXJcInx8ZC50ZXN0KHQpPyt0Oi0xLHI9bnVsbD09cj9WOnIsLTE8dCYmMD09dCUxJiZ0PHJ9ZnVuY3Rpb24gdSh0KXtyZXR1cm4gdHlwZW9mIHQ9PVwibnVtYmVyXCImJi0xPHQmJjA9PXQlMSYmdDw9Vn1mdW5jdGlvbiBjKHQpe2Zvcih2YXIgcj15KHQpLG49ci5sZW5ndGgsZT1uJiZ0Lmxlbmd0aCxjPSEhZSYmdShlKSYmKEcodCl8fGkodCl8fHAodCkpLGw9LTEsYT1bXTsrK2w8bjspe3ZhciBmPXJbbF07KGMmJm8oZixlKXx8Ti5jYWxsKHQsZikpJiZhLnB1c2goZik7XG59cmV0dXJuIGF9ZnVuY3Rpb24gbCh0LHIpe2lmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihiKTtyZXR1cm4gcj1NKHI9PT1oP3QubGVuZ3RoLTE6K3J8fDAsMCksZnVuY3Rpb24oKXtmb3IodmFyIG49YXJndW1lbnRzLGU9LTEsbz1NKG4ubGVuZ3RoLXIsMCksdT1BcnJheShvKTsrK2U8bzspdVtlXT1uW3IrZV07c3dpdGNoKHIpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKHRoaXMsdSk7Y2FzZSAxOnJldHVybiB0LmNhbGwodGhpcyxuWzBdLHUpO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKHRoaXMsblswXSxuWzFdLHUpfWZvcihvPUFycmF5KHIrMSksZT0tMTsrK2U8cjspb1tlXT1uW2VdO3JldHVybiBvW3JdPXUsdC5hcHBseSh0aGlzLG8pfX1mdW5jdGlvbiBpKHIpe3JldHVybiB0KHIpJiZudWxsIT1yJiZ1KHoocikpJiZOLmNhbGwocixcImNhbGxlZVwiKSYmIUwuY2FsbChyLFwiY2FsbGVlXCIpfWZ1bmN0aW9uIGEodCl7cmV0dXJuIGYodCkmJlIuY2FsbCh0KT09bX1cbmZ1bmN0aW9uIGYodCl7dmFyIHI9dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09cnx8XCJmdW5jdGlvblwiPT1yKX1mdW5jdGlvbiBzKHIpe3JldHVybiBudWxsPT1yP2ZhbHNlOmEocik/VC50ZXN0KEYuY2FsbChyKSk6dChyKSYmKHcocik/VDp4KS50ZXN0KHIpfWZ1bmN0aW9uIHAocil7cmV0dXJuIHR5cGVvZiByPT1cInN0cmluZ1wifHx0KHIpJiZSLmNhbGwocik9PU99ZnVuY3Rpb24geSh0KXtpZihudWxsPT10KXJldHVybltdO2YodCl8fCh0PU9iamVjdCh0KSk7Zm9yKHZhciBuPXQubGVuZ3RoLGU9ci5zdXBwb3J0LG49biYmdShuKSYmKEcodCl8fGkodCl8fHAodCkpJiZufHwwLGM9dC5jb25zdHJ1Y3RvcixsPS0xLGM9YShjKSYmYy5wcm90b3R5cGV8fGsscz1jPT09dCx5PUFycmF5KG4pLGc9MDxuLGg9ZS5lbnVtRXJyb3JQcm9wcyYmKHQ9PT1JfHx0IGluc3RhbmNlb2YgRXJyb3IpLGI9ZS5lbnVtUHJvdG90eXBlcyYmYSh0KTsrK2w8bjspeVtsXT1sK1wiXCI7Zm9yKHZhciBtIGluIHQpYiYmXCJwcm90b3R5cGVcIj09bXx8aCYmKFwibWVzc2FnZVwiPT1tfHxcIm5hbWVcIj09bSl8fGcmJm8obSxuKXx8XCJjb25zdHJ1Y3RvclwiPT1tJiYoc3x8IU4uY2FsbCh0LG0pKXx8eS5wdXNoKG0pO1xuaWYoZS5ub25FbnVtU2hhZG93cyYmdCE9PWspZm9yKG49dD09PUM/Tzp0PT09ST92OlIuY2FsbCh0KSxlPV9bbl18fF9bal0sbj09aiYmKGM9ayksbj1TLmxlbmd0aDtuLS07KW09U1tuXSxsPWVbbV0scyYmbHx8KGw/IU4uY2FsbCh0LG0pOnRbbV09PT1jW21dKXx8eS5wdXNoKG0pO3JldHVybiB5fWZ1bmN0aW9uIGcodCl7cmV0dXJuIHR9dmFyIGgsYj1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIix2PVwiW29iamVjdCBFcnJvcl1cIixtPVwiW29iamVjdCBGdW5jdGlvbl1cIixqPVwiW29iamVjdCBPYmplY3RdXCIsTz1cIltvYmplY3QgU3RyaW5nXVwiLHg9L15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLyxkPS9eXFxkKyQvLFM9XCJjb25zdHJ1Y3RvciBoYXNPd25Qcm9wZXJ0eSBpc1Byb3RvdHlwZU9mIHByb3BlcnR5SXNFbnVtZXJhYmxlIHRvTG9jYWxlU3RyaW5nIHRvU3RyaW5nIHZhbHVlT2ZcIi5zcGxpdChcIiBcIiksRT17XCJmdW5jdGlvblwiOnRydWUsb2JqZWN0OnRydWV9LEE9RVt0eXBlb2YgZXhwb3J0c10mJmV4cG9ydHMmJiFleHBvcnRzLm5vZGVUeXBlJiZleHBvcnRzLFA9KEU9RVt0eXBlb2YgbW9kdWxlXSYmbW9kdWxlJiYhbW9kdWxlLm5vZGVUeXBlJiZtb2R1bGUpJiZFLmV4cG9ydHM9PT1BJiZBLHc9ZnVuY3Rpb24oKXtcbnRyeXtPYmplY3Qoe3RvU3RyaW5nOjB9K1wiXCIpfWNhdGNoKHQpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmYWxzZX19cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdC50b1N0cmluZyE9XCJmdW5jdGlvblwiJiZ0eXBlb2YodCtcIlwiKT09XCJzdHJpbmdcIn19KCksJD1BcnJheS5wcm90b3R5cGUsST1FcnJvci5wcm90b3R5cGUsaz1PYmplY3QucHJvdG90eXBlLEM9U3RyaW5nLnByb3RvdHlwZSxGPUZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyxOPWsuaGFzT3duUHJvcGVydHksUj1rLnRvU3RyaW5nLFQ9UmVnRXhwKFwiXlwiK0YuY2FsbChOKS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLEw9ay5wcm9wZXJ0eUlzRW51bWVyYWJsZSxCPSQuc3BsaWNlLCQ9ZShBcnJheSxcImlzQXJyYXlcIiksRD1lKE9iamVjdCxcImtleXNcIiksTT1NYXRoLm1heCxWPTkwMDcxOTkyNTQ3NDA5OTEsXz17fTtcbl9bXCJbb2JqZWN0IEFycmF5XVwiXT1fW1wiW29iamVjdCBEYXRlXVwiXT1fW1wiW29iamVjdCBOdW1iZXJdXCJdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LF9bXCJbb2JqZWN0IEJvb2xlYW5dXCJdPV9bT109e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9LF9bdl09X1ttXT1fW1wiW29iamVjdCBSZWdFeHBdXCJdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWV9LF9bal09e2NvbnN0cnVjdG9yOnRydWV9LGZ1bmN0aW9uKHQscil7Zm9yKHZhciBuPS0xLGU9dC5sZW5ndGg7KytuPGUmJmZhbHNlIT09cih0W25dLG4sdCk7KTtyZXR1cm4gdH0oUyxmdW5jdGlvbih0KXtmb3IodmFyIHIgaW4gXylpZihOLmNhbGwoXyxyKSl7dmFyIG49X1tyXTtuW3RdPU4uY2FsbChuLHQpfX0pO3ZhciBxPXIuc3VwcG9ydD17fTshZnVuY3Rpb24odCl7ZnVuY3Rpb24gcigpe3RoaXMueD10fXZhciBuPXswOnQsbGVuZ3RoOnR9LGU9W107ci5wcm90b3R5cGU9e1xudmFsdWVPZjp0LHk6dH07Zm9yKHZhciBvIGluIG5ldyByKWUucHVzaChvKTtxLmVudW1FcnJvclByb3BzPUwuY2FsbChJLFwibWVzc2FnZVwiKXx8TC5jYWxsKEksXCJuYW1lXCIpLHEuZW51bVByb3RvdHlwZXM9TC5jYWxsKHIsXCJwcm90b3R5cGVcIikscS5ub25FbnVtU2hhZG93cz0hL3ZhbHVlT2YvLnRlc3QoZSkscS5zcGxpY2VPYmplY3RzPShCLmNhbGwobiwwLDEpLCFuWzBdKSxxLnVuaW5kZXhlZENoYXJzPVwieHhcIiE9XCJ4XCJbMF0rT2JqZWN0KFwieFwiKVswXX0oMSwwKTt2YXIgej1mdW5jdGlvbih0KXtyZXR1cm4gZnVuY3Rpb24obil7aWYobnVsbD09biluPWg7ZWxzZXtpZihyLnN1cHBvcnQudW5pbmRleGVkQ2hhcnMmJnAobikpe2Zvcih2YXIgZT0tMSxvPW4ubGVuZ3RoLHU9T2JqZWN0KG4pOysrZTxvOyl1W2VdPW4uY2hhckF0KGUpO249dX1lbHNlIG49ZihuKT9uOk9iamVjdChuKTtuPW5bdF19cmV0dXJuIG59fShcImxlbmd0aFwiKSxHPSR8fGZ1bmN0aW9uKHIpe3JldHVybiB0KHIpJiZ1KHIubGVuZ3RoKSYmXCJbb2JqZWN0IEFycmF5XVwiPT1SLmNhbGwocik7XG59LCQ9ZnVuY3Rpb24odCl7cmV0dXJuIGwoZnVuY3Rpb24ocixlKXt2YXIgYz0tMSxsPW51bGw9PXI/MDplLmxlbmd0aCxpPTI8bD9lW2wtMl06aCxhPTI8bD9lWzJdOmgscz0xPGw/ZVtsLTFdOmg7aWYodHlwZW9mIGk9PVwiZnVuY3Rpb25cIj8oaT1uKGkscyksbC09Mik6KGk9dHlwZW9mIHM9PVwiZnVuY3Rpb25cIj9zOmgsbC09aT8xOjApLHM9YSl7dmFyIHM9ZVswXSxwPWVbMV07aWYoZihhKSl7dmFyIHk9dHlwZW9mIHA7KFwibnVtYmVyXCI9PXk/bnVsbCE9YSYmdSh6KGEpKSYmbyhwLGEubGVuZ3RoKTpcInN0cmluZ1wiPT15JiZwIGluIGEpPyhhPWFbcF0scz1zPT09cz9zPT09YTphIT09YSk6cz1mYWxzZX1lbHNlIHM9ZmFsc2V9Zm9yKHMmJihpPTM+bD9oOmksbD0xKTsrK2M8bDspKGE9ZVtjXSkmJnQocixhLGkpO3JldHVybiByfSl9KGZ1bmN0aW9uKHQscixuKXtpZihuKWZvcih2YXIgZT0tMSxvPUoociksdT1vLmxlbmd0aDsrK2U8dTspe3ZhciBjPW9bZV0sbD10W2NdLGk9bihsLHJbY10sYyx0LHIpO1xuKGk9PT1pP2k9PT1sOmwhPT1sKSYmKGwhPT1ofHxjIGluIHQpfHwodFtjXT1pKX1lbHNlIGlmKG51bGwhPXIpZm9yKG49SihyKSx0fHwodD17fSksZT0tMSxvPW4ubGVuZ3RoOysrZTxvOyl1PW5bZV0sdFt1XT1yW3VdO3JldHVybiByPXR9KSxIPWZ1bmN0aW9uKHQscil7cmV0dXJuIGwoZnVuY3Rpb24obil7dmFyIGU9blswXTtyZXR1cm4gbnVsbD09ZT9lOihuLnB1c2gociksdC5hcHBseShoLG4pKX0pfSgkLGZ1bmN0aW9uKHQscil7cmV0dXJuIHQ9PT1oP3I6dH0pLEo9RD9mdW5jdGlvbih0KXt2YXIgbj1udWxsPT10P2g6dC5jb25zdHJ1Y3RvcjtyZXR1cm4gdHlwZW9mIG49PVwiZnVuY3Rpb25cIiYmbi5wcm90b3R5cGU9PT10fHwodHlwZW9mIHQ9PVwiZnVuY3Rpb25cIj9yLnN1cHBvcnQuZW51bVByb3RvdHlwZXM6bnVsbCE9dCYmdSh6KHQpKSk/Yyh0KTpmKHQpP0QodCk6W119OmM7ci5hc3NpZ249JCxyLmRlZmF1bHRzPUgsci5rZXlzPUosci5rZXlzSW49eSxyLnJlc3RQYXJhbT1sLHIuZXh0ZW5kPSQsXG5yLmlkZW50aXR5PWcsci5pc0FyZ3VtZW50cz1pLHIuaXNBcnJheT1HLHIuaXNGdW5jdGlvbj1hLHIuaXNOYXRpdmU9cyxyLmlzT2JqZWN0PWYsci5pc1N0cmluZz1wLHIuVkVSU0lPTj1cIjMuMTAuMFwiLEEmJkUmJlAmJigoRS5leHBvcnRzPXIpLl89cil9KS5jYWxsKHRoaXMpOyIsIi8qIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIE1hcmN1cyBXZXN0aW4gKi9cbihmdW5jdGlvbihlKXtmdW5jdGlvbiBvKCl7dHJ5e3JldHVybiByIGluIGUmJmVbcl19Y2F0Y2godCl7cmV0dXJuITF9fXZhciB0PXt9LG49ZS5kb2N1bWVudCxyPVwibG9jYWxTdG9yYWdlXCIsaT1cInNjcmlwdFwiLHM7dC5kaXNhYmxlZD0hMSx0LnZlcnNpb249XCIxLjMuMTdcIix0LnNldD1mdW5jdGlvbihlLHQpe30sdC5nZXQ9ZnVuY3Rpb24oZSx0KXt9LHQuaGFzPWZ1bmN0aW9uKGUpe3JldHVybiB0LmdldChlKSE9PXVuZGVmaW5lZH0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7fSx0LmNsZWFyPWZ1bmN0aW9uKCl7fSx0LnRyYW5zYWN0PWZ1bmN0aW9uKGUsbixyKXtyPT1udWxsJiYocj1uLG49bnVsbCksbj09bnVsbCYmKG49e30pO3ZhciBpPXQuZ2V0KGUsbik7cihpKSx0LnNldChlLGkpfSx0LmdldEFsbD1mdW5jdGlvbigpe30sdC5mb3JFYWNoPWZ1bmN0aW9uKCl7fSx0LnNlcmlhbGl6ZT1mdW5jdGlvbihlKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZSl9LHQuZGVzZXJpYWxpemU9ZnVuY3Rpb24oZSl7aWYodHlwZW9mIGUhPVwic3RyaW5nXCIpcmV0dXJuIHVuZGVmaW5lZDt0cnl7cmV0dXJuIEpTT04ucGFyc2UoZSl9Y2F0Y2godCl7cmV0dXJuIGV8fHVuZGVmaW5lZH19O2lmKG8oKSlzPWVbcl0sdC5zZXQ9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gbj09PXVuZGVmaW5lZD90LnJlbW92ZShlKToocy5zZXRJdGVtKGUsdC5zZXJpYWxpemUobikpLG4pfSx0LmdldD1mdW5jdGlvbihlLG4pe3ZhciByPXQuZGVzZXJpYWxpemUocy5nZXRJdGVtKGUpKTtyZXR1cm4gcj09PXVuZGVmaW5lZD9uOnJ9LHQucmVtb3ZlPWZ1bmN0aW9uKGUpe3MucmVtb3ZlSXRlbShlKX0sdC5jbGVhcj1mdW5jdGlvbigpe3MuY2xlYXIoKX0sdC5nZXRBbGw9ZnVuY3Rpb24oKXt2YXIgZT17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQsbil7ZVt0XT1ufSksZX0sdC5mb3JFYWNoPWZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248cy5sZW5ndGg7bisrKXt2YXIgcj1zLmtleShuKTtlKHIsdC5nZXQocikpfX07ZWxzZSBpZihuLmRvY3VtZW50RWxlbWVudC5hZGRCZWhhdmlvcil7dmFyIHUsYTt0cnl7YT1uZXcgQWN0aXZlWE9iamVjdChcImh0bWxmaWxlXCIpLGEub3BlbigpLGEud3JpdGUoXCI8XCIraStcIj5kb2N1bWVudC53PXdpbmRvdzwvXCIraSsnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+JyksYS5jbG9zZSgpLHU9YS53LmZyYW1lc1swXS5kb2N1bWVudCxzPXUuY3JlYXRlRWxlbWVudChcImRpdlwiKX1jYXRjaChmKXtzPW4uY3JlYXRlRWxlbWVudChcImRpdlwiKSx1PW4uYm9keX12YXIgbD1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgbj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7bi51bnNoaWZ0KHMpLHUuYXBwZW5kQ2hpbGQocykscy5hZGRCZWhhdmlvcihcIiNkZWZhdWx0I3VzZXJEYXRhXCIpLHMubG9hZChyKTt2YXIgaT1lLmFwcGx5KHQsbik7cmV0dXJuIHUucmVtb3ZlQ2hpbGQocyksaX19LGM9bmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLFwiZ1wiKTtmdW5jdGlvbiBoKGUpe3JldHVybiBlLnJlcGxhY2UoL15kLyxcIl9fXyQmXCIpLnJlcGxhY2UoYyxcIl9fX1wiKX10LnNldD1sKGZ1bmN0aW9uKGUsbixpKXtyZXR1cm4gbj1oKG4pLGk9PT11bmRlZmluZWQ/dC5yZW1vdmUobik6KGUuc2V0QXR0cmlidXRlKG4sdC5zZXJpYWxpemUoaSkpLGUuc2F2ZShyKSxpKX0pLHQuZ2V0PWwoZnVuY3Rpb24oZSxuLHIpe249aChuKTt2YXIgaT10LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKG4pKTtyZXR1cm4gaT09PXVuZGVmaW5lZD9yOml9KSx0LnJlbW92ZT1sKGZ1bmN0aW9uKGUsdCl7dD1oKHQpLGUucmVtb3ZlQXR0cmlidXRlKHQpLGUuc2F2ZShyKX0pLHQuY2xlYXI9bChmdW5jdGlvbihlKXt2YXIgdD1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2UubG9hZChyKTtmb3IodmFyIG49MCxpO2k9dFtuXTtuKyspZS5yZW1vdmVBdHRyaWJ1dGUoaS5uYW1lKTtlLnNhdmUocil9KSx0LmdldEFsbD1mdW5jdGlvbihlKXt2YXIgbj17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKGUsdCl7bltlXT10fSksbn0sdC5mb3JFYWNoPWwoZnVuY3Rpb24oZSxuKXt2YXIgcj1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2Zvcih2YXIgaT0wLHM7cz1yW2ldOysraSluKHMubmFtZSx0LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKHMubmFtZSkpKX0pfXRyeXt2YXIgcD1cIl9fc3RvcmVqc19fXCI7dC5zZXQocCxwKSx0LmdldChwKSE9cCYmKHQuZGlzYWJsZWQ9ITApLHQucmVtb3ZlKHApfWNhdGNoKGYpe3QuZGlzYWJsZWQ9ITB9dC5lbmFibGVkPSF0LmRpc2FibGVkLHR5cGVvZiBtb2R1bGUhPVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzJiZ0aGlzLm1vZHVsZSE9PW1vZHVsZT9tb2R1bGUuZXhwb3J0cz10OnR5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZD9kZWZpbmUodCk6ZS5zdG9yZT10fSkoRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpKSIsInN0b3JlID0gcmVxdWlyZSgnc3RvcmUnKVxuXG4jIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBzdG9yZS5qcyBmb3IgZWFzeSBzd2FwcGluZ1xuY2xhc3MgU3RvcmFnZVxuICBjb25zdHJ1Y3RvcjogKEBuYW1lc3BhY2U9J2FsZXBoYmV0JykgLT5cbiAgICB0aHJvdyAnbG9jYWwgc3RvcmFnZSBub3Qgc3VwcG9ydGVkJyB1bmxlc3Mgc3RvcmUuZW5hYmxlZFxuICAgIEBzdG9yYWdlID0gc3RvcmUuZ2V0KEBuYW1lc3BhY2UpIHx8IHt9XG4gIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XSA9IHZhbHVlXG4gICAgc3RvcmUuc2V0KEBuYW1lc3BhY2UsIEBzdG9yYWdlKVxuICAgIHJldHVybiB2YWx1ZVxuICBnZXQ6IChrZXkpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XVxuICAgICMgc3RvcmUuZ2V0KFwiI3tAbmFtZXNwYWNlfToje2tleX1cIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIE5PVEU6IHVzaW5nIGEgY3VzdG9tIGJ1aWxkIG9mIGxvZGFzaCwgdG8gc2F2ZSBzcGFjZVxuXyA9IHJlcXVpcmUoJ2xvZGFzaC5jdXN0b20nKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAc2V0X2RlYnVnOiAoQGRlYnVnKSAtPlxuICBAbG9nOiAobWVzc2FnZSkgLT5cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKSBpZiBAZGVidWdcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIl19
