(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Adapters, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

utils = require('./utils.js.coffee');

Adapters = (function() {
  function Adapters() {}

  Adapters.PersistentQueueGoogleAnalyticsAdapter = (function() {
    PersistentQueueGoogleAnalyticsAdapter.prototype.namespace = 'alephbet';

    function PersistentQueueGoogleAnalyticsAdapter(storage) {
      if (storage == null) {
        storage = AlephBet.LocalStorageAdapter;
      }
      this.goal_complete = bind(this.goal_complete, this);
      this.experiment_start = bind(this.experiment_start, this);
      this.log = AlephBet.log;
      this._storage = storage;
      this._queue = JSON.parse(this._storage.get('_queue') || '[]');
      this._flush();
    }

    PersistentQueueGoogleAnalyticsAdapter.prototype._remove_uuid = function(uuid) {
      return (function(_this) {
        return function() {
          utils.remove(_this._queue, function(el) {
            return el.uuid === uuid;
          });
          return _this._storage.set('_queue', JSON.stringify(_this._queue));
        };
      })(this);
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype._flush = function() {
      var callback, i, item, len, ref, results;
      if (typeof ga !== 'function') {
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
      }
      ref = this._queue;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        callback = this._remove_uuid(item.uuid);
        results.push(ga('send', 'event', item.category, item.action, item.label, {
          'hitCallback': callback
        }));
      }
      return results;
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype._track = function(category, action, label) {
      this.log("Persistent Queue Google Universal Analytics track: " + category + ", " + action + ", " + label);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        uuid: utils.uuid(),
        category: category,
        action: action,
        label: label
      });
      this._storage.set('_queue', JSON.stringify(this._queue));
      return this._flush();
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype.experiment_start = function(experiment_name, variant) {
      return this._track(this.namespace, experiment_name + " | " + variant, 'Visitors');
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype.goal_complete = function(experiment_name, variant, goal) {
      return this._track(this.namespace, experiment_name + " | " + variant, goal);
    };

    return PersistentQueueGoogleAnalyticsAdapter;

  })();

  return Adapters;

})();

module.exports = Adapters;


},{"./utils.js.coffee":7}],2:[function(require,module,exports){
var AlephBet, Storage, adapters, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

utils = require('./utils.js.coffee');

Storage = require('./storage.js.coffee');

adapters = require('./adapters.js.coffee');

AlephBet = (function() {
  var log;

  function AlephBet() {}

  AlephBet.options = {
    debug: false
  };

  AlephBet.PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter;

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

  log = AlephBet.log = function(message) {
    utils.set_debug(AlephBet.options.debug);
    return utils.log(message);
  };

  return AlephBet;

})();

module.exports = AlephBet;


},{"./adapters.js.coffee":1,"./storage.js.coffee":6,"./utils.js.coffee":7}],3:[function(require,module,exports){
(function (global){
/**
 * @license
 * lodash 3.10.0 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash include="keys,defaults,remove" exports="node" -o ./lib/lodash.custom.js`
 */
;(function(){function B(a){return!!a&&typeof a=="object"}function n(){}function Sa(a,b){var c=-1,e=a.length;for(b||(b=Array(e));++c<e;)b[c]=a[c];return b}function ra(a,b){for(var c=-1,e=a.length;++c<e&&false!==b(a[c],c,a););return a}function Ta(a,b){for(var c=-1,e=a.length;++c<e;)if(b(a[c],c,a))return true;return false}function sa(a,b){var c;if(null==b)c=a;else{c=C(b);var e=a;e||(e={});for(var d=-1,f=c.length;++d<f;){var h=c[d];e[h]=b[h]}c=e}return c}function ta(a,b,c){var e=typeof a;return"function"==
e?b===p?a:ua(a,b,c):null==a?ha:"object"==e?va(a):b===p?wa(a):Ua(a,b)}function xa(a,b,c,e,d,f,h){var g;c&&(g=d?c(a,e,d):c(a));if(g!==p)return g;if(!v(a))return a;if(e=y(a)){if(g=Va(a),!b)return Sa(a,g)}else{var l=A.call(a),m=l==H;if(l==t||l==I||m&&!d){if(Q(a))return d?a:{};g=Wa(m?{}:a);if(!b)return sa(g,a)}else return q[l]?Xa(a,l,b):d?a:{}}f||(f=[]);h||(h=[]);for(d=f.length;d--;)if(f[d]==a)return h[d];f.push(a);h.push(g);(e?ra:Ya)(a,function(d,e){g[e]=xa(d,b,c,e,a,f,h)});return g}function Ya(a,b){return Za(a,
b,C)}function ya(a,b,c){if(null!=a){a=z(a);c!==p&&c in a&&(b=[c]);c=0;for(var e=b.length;null!=a&&c<e;)a=z(a)[b[c++]];return c&&c==e?a:p}}function ia(a,b,c,e,d,f){if(a===b)a=true;else if(null==a||null==b||!v(a)&&!B(b))a=a!==a&&b!==b;else a:{var h=ia,g=y(a),l=y(b),m=F,k=F;g||(m=A.call(a),m==I?m=t:m!=t&&(g=ja(a)));l||(k=A.call(b),k==I?k=t:k!=t&&ja(b));var p=m==t&&!Q(a),l=k==t&&!Q(b),k=m==k;if(!k||g||p){if(!e&&(m=p&&u.call(a,"__wrapped__"),l=l&&u.call(b,"__wrapped__"),m||l)){a=h(m?a.value():a,l?b.value():
b,c,e,d,f);break a}if(k){d||(d=[]);f||(f=[]);for(m=d.length;m--;)if(d[m]==a){a=f[m]==b;break a}d.push(a);f.push(b);a=(g?$a:ab)(a,b,h,c,e,d,f);d.pop();f.pop()}else a=false}else a=bb(a,b,m)}return a}function cb(a,b){var c=b.length,e=c;if(null==a)return!e;for(a=z(a);c--;){var d=b[c];if(d[2]?d[1]!==a[d[0]]:!(d[0]in a))return false}for(;++c<e;){var d=b[c],f=d[0],h=a[f],g=d[1];if(d[2]){if(h===p&&!(f in a))return false}else if(d=p,d===p?!ia(g,h,void 0,true):!d)return false}return true}function va(a){var b=db(a);if(1==b.length&&
b[0][2]){var c=b[0][0],e=b[0][1];return function(a){if(null==a)return false;a=z(a);return a[c]===e&&(e!==p||c in a)}}return function(a){return cb(a,b)}}function Ua(a,b){var c=y(a),e=za(a)&&b===b&&!v(b),d=a+"";a=Aa(a);return function(f){if(null==f)return false;var h=d;f=z(f);if(!(!c&&e||h in f)){if(1!=a.length){var h=a,g=0,l=-1,m=-1,k=h.length,g=null==g?0:+g||0;0>g&&(g=-g>k?0:k+g);l=l===p||l>k?k:+l||0;0>l&&(l+=k);k=g>l?0:l-g>>>0;g>>>=0;for(l=Array(k);++m<k;)l[m]=h[m+g];f=ya(f,l)}if(null==f)return false;h=Ba(a);
f=z(f)}return f[h]===b?b!==p||h in f:ia(b,f[h],p,true)}}function Ca(a){return function(b){return null==b?p:z(b)[a]}}function eb(a){var b=a+"";a=Aa(a);return function(c){return ya(c,a,b)}}function ua(a,b,c){if(typeof a!="function")return ha;if(b===p)return a;switch(c){case 1:return function(c){return a.call(b,c)};case 3:return function(c,d,f){return a.call(b,c,d,f)};case 4:return function(c,d,f,h){return a.call(b,c,d,f,h)};case 5:return function(c,d,f,h,g){return a.call(b,c,d,f,h,g)}}return function(){return a.apply(b,
arguments)}}function Da(a){var b=new fb(a.byteLength);(new ka(b)).set(new ka(a));return b}function $a(a,b,c,e,d,f,h){var g=-1,l=a.length,m=b.length;if(l!=m&&!(d&&m>l))return false;for(;++g<l;){var k=a[g],m=b[g],n=e?e(d?m:k,d?k:m,g):p;if(n!==p){if(n)continue;return false}if(d){if(!Ta(b,function(a){return k===a||c(k,a,e,d,f,h)}))return false}else if(k!==m&&!c(k,m,e,d,f,h))return false}return true}function bb(a,b,c){switch(c){case J:case K:return+a==+b;case L:return a.name==b.name&&a.message==b.message;case M:return a!=
+a?b!=+b:a==+b;case N:case D:return a==b+""}return false}function ab(a,b,c,e,d,f,h){var g=C(a),l=g.length,m=C(b).length;if(l!=m&&!d)return false;for(m=l;m--;){var k=g[m];if(!(d?k in b:u.call(b,k)))return false}for(var n=d;++m<l;){var k=g[m],q=a[k],r=b[k],s=e?e(d?r:q,d?q:r,k):p;if(s===p?!c(q,r,e,d,f,h):!s)return false;n||(n="constructor"==k)}return n||(c=a.constructor,e=b.constructor,!(c!=e&&"constructor"in a&&"constructor"in b)||typeof c=="function"&&c instanceof c&&typeof e=="function"&&e instanceof e)?true:false}function db(a){a=
Ea(a);for(var b=a.length;b--;){var c=a[b][1];a[b][2]=c===c&&!v(c)}return a}function Fa(a,b){var c=null==a?p:a[b];return Ga(c)?c:p}function Va(a){var b=a.length,c=new a.constructor(b);b&&"string"==typeof a[0]&&u.call(a,"index")&&(c.index=a.index,c.input=a.input);return c}function Wa(a){a=a.constructor;typeof a=="function"&&a instanceof a||(a=Object);return new a}function Xa(a,b,c){var e=a.constructor;switch(b){case la:return Da(a);case J:case K:return new e(+a);case R:case S:case T:case U:case V:case W:case X:case Y:case Z:return e instanceof
e&&(e=w[b]),b=a.buffer,new e(c?Da(b):b,a.byteOffset,a.length);case M:case D:return new e(a);case N:var d=new e(a.source,gb.exec(a));d.lastIndex=a.lastIndex}return d}function $(a,b){a=typeof a=="number"||hb.test(a)?+a:-1;b=null==b?Ha:b;return-1<a&&0==a%1&&a<b}function Ia(a,b,c){if(!v(c))return false;var e=typeof b;return("number"==e?null!=c&&E(ma(c))&&$(b,c.length):"string"==e&&b in c)?(b=c[b],a===a?a===b:b!==b):false}function za(a){var b=typeof a;return"string"==b&&ib.test(a)||"number"==b?true:y(a)?false:!jb.test(a)||
!1}function E(a){return typeof a=="number"&&-1<a&&0==a%1&&a<=Ha}function Ja(a){for(var b=Ka(a),c=b.length,e=c&&a.length,d=!!e&&E(e)&&(y(a)||na(a)||aa(a)),f=-1,h=[];++f<c;){var g=b[f];(d&&$(g,e)||u.call(a,g))&&h.push(g)}return h}function z(a){if(n.support.unindexedChars&&aa(a)){for(var b=-1,c=a.length,e=Object(a);++b<c;)e[b]=a.charAt(b);return e}return v(a)?a:Object(a)}function Aa(a){if(y(a))return a;var b=[];(null==a?"":a+"").replace(kb,function(a,e,d,f){b.push(d?f.replace(lb,"$1"):e||a)});return b}
function Ba(a){var b=a?a.length:0;return b?a[b-1]:p}function oa(a,b){if(typeof a!="function")throw new TypeError(mb);b=La(b===p?a.length-1:+b||0,0);return function(){for(var c=arguments,e=-1,d=La(c.length-b,0),f=Array(d);++e<d;)f[e]=c[b+e];switch(b){case 0:return a.call(this,f);case 1:return a.call(this,c[0],f);case 2:return a.call(this,c[0],c[1],f)}d=Array(b+1);for(e=-1;++e<b;)d[e]=c[e];d[b]=f;return a.apply(this,d)}}function na(a){return B(a)&&null!=a&&E(ma(a))&&u.call(a,"callee")&&!ba.call(a,"callee")}
function ca(a){return v(a)&&A.call(a)==H}function v(a){var b=typeof a;return!!a&&("object"==b||"function"==b)}function Ga(a){return null==a?false:ca(a)?Ma.test(Na.call(a)):B(a)&&(Q(a)?Ma:nb).test(a)}function aa(a){return typeof a=="string"||B(a)&&A.call(a)==D}function ja(a){return B(a)&&E(a.length)&&!!r[A.call(a)]}function Ka(a){if(null==a)return[];v(a)||(a=Object(a));for(var b=a.length,c=n.support,b=b&&E(b)&&(y(a)||na(a)||aa(a))&&b||0,e=a.constructor,d=-1,e=ca(e)&&e.prototype||G,f=e===a,h=Array(b),g=
0<b,l=c.enumErrorProps&&(a===da||a instanceof Error),m=c.enumPrototypes&&ca(a);++d<b;)h[d]=d+"";for(var k in a)m&&"prototype"==k||l&&("message"==k||"name"==k)||g&&$(k,b)||"constructor"==k&&(f||!u.call(a,k))||h.push(k);if(c.nonEnumShadows&&a!==G)for(b=a===ob?D:a===da?L:A.call(a),c=s[b]||s[t],b==t&&(e=G),b=pa.length;b--;)k=pa[b],d=c[k],f&&d||(d?!u.call(a,k):a[k]===e[k])||h.push(k);return h}function Ea(a){a=z(a);for(var b=-1,c=C(a),e=c.length,d=Array(e);++b<e;){var f=c[b];d[b]=[f,a[f]]}return d}function ea(a,
b,c){c&&Ia(a,b,c)&&(b=p);return B(a)?Oa(a):ta(a,b)}function ha(a){return a}function Oa(a){return va(xa(a,true))}function wa(a){return za(a)?Ca(a):eb(a)}var p,mb="Expected a function",I="[object Arguments]",F="[object Array]",J="[object Boolean]",K="[object Date]",L="[object Error]",H="[object Function]",M="[object Number]",t="[object Object]",N="[object RegExp]",D="[object String]",la="[object ArrayBuffer]",R="[object Float32Array]",S="[object Float64Array]",T="[object Int8Array]",U="[object Int16Array]",
V="[object Int32Array]",W="[object Uint8Array]",X="[object Uint8ClampedArray]",Y="[object Uint16Array]",Z="[object Uint32Array]",jb=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,ib=/^\w*$/,kb=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,lb=/\\(\\)?/g,gb=/\w*$/,nb=/^\[object .+?Constructor\]$/,hb=/^\d+$/,pa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),r={};r[R]=r[S]=r[T]=r[U]=r[V]=r[W]=r[X]=r[Y]=r[Z]=true;
r[I]=r[F]=r[la]=r[J]=r[K]=r[L]=r[H]=r["[object Map]"]=r[M]=r[t]=r[N]=r["[object Set]"]=r[D]=r["[object WeakMap]"]=false;var q={};q[I]=q[F]=q[la]=q[J]=q[K]=q[R]=q[S]=q[T]=q[U]=q[V]=q[M]=q[t]=q[N]=q[D]=q[W]=q[X]=q[Y]=q[Z]=true;q[L]=q[H]=q["[object Map]"]=q["[object Set]"]=q["[object WeakMap]"]=false;var fa={"function":true,object:true},ga=fa[typeof exports]&&exports&&!exports.nodeType&&exports,O=fa[typeof module]&&module&&!module.nodeType&&module,pb=fa[typeof self]&&self&&self.Object&&self,Pa=fa[typeof window]&&
window&&window.Object&&window,qb=O&&O.exports===ga&&ga,x=ga&&O&&typeof global=="object"&&global&&global.Object&&global||Pa!==(this&&this.window)&&Pa||pb||this,Q=function(){try{Object({toString:0}+"")}catch(a){return function(){return false}}return function(a){return typeof a.toString!="function"&&typeof(a+"")=="string"}}(),rb=Array.prototype,da=Error.prototype,G=Object.prototype,ob=String.prototype,Na=Function.prototype.toString,u=G.hasOwnProperty,A=G.toString,Ma=RegExp("^"+Na.call(u).replace(/[\\^$.*+?()[\]{}|]/g,
"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),fb=x.ArrayBuffer,ba=G.propertyIsEnumerable,Qa=rb.splice,ka=x.Uint8Array,sb=Fa(Array,"isArray"),Ra=Fa(Object,"keys"),La=Math.max,Ha=9007199254740991,w={};w[R]=x.Float32Array;w[S]=x.Float64Array;w[T]=x.Int8Array;w[U]=x.Int16Array;w[V]=x.Int32Array;w[W]=ka;w[X]=x.Uint8ClampedArray;w[Y]=x.Uint16Array;w[Z]=x.Uint32Array;var s={};s[F]=s[K]=s[M]={constructor:true,toLocaleString:true,toString:true,valueOf:true};s[J]=s[D]={constructor:true,
toString:true,valueOf:true};s[L]=s[H]=s[N]={constructor:true,toString:true};s[t]={constructor:true};ra(pa,function(a){for(var b in s)if(u.call(s,b)){var c=s[b];c[a]=u.call(c,a)}});var P=n.support={};(function(a){function b(){this.x=a}var c={0:a,length:a},e=[];b.prototype={valueOf:a,y:a};for(var d in new b)e.push(d);P.enumErrorProps=ba.call(da,"message")||ba.call(da,"name");P.enumPrototypes=ba.call(b,"prototype");P.nonEnumShadows=!/valueOf/.test(e);P.spliceObjects=(Qa.call(c,0,1),!c[0]);P.unindexedChars="xx"!="x"[0]+
Object("x")[0]})(1,0);var Za=function(a){return function(b,c,e){var d=z(b);e=e(b);for(var f=e.length,h=a?f:-1;a?h--:++h<f;){var g=e[h];if(false===c(d[g],g,d))break}return b}}(),ma=Ca("length"),y=sb||function(a){return B(a)&&E(a.length)&&A.call(a)==F},qa=function(a){return oa(function(b,c){var e=-1,d=null==b?0:c.length,f=2<d?c[d-2]:p,h=2<d?c[2]:p,g=1<d?c[d-1]:p;typeof f=="function"?(f=ua(f,g,5),d-=2):(f=typeof g=="function"?g:p,d-=f?1:0);h&&Ia(c[0],c[1],h)&&(f=3>d?p:f,d=1);for(;++e<d;)(h=c[e])&&a(b,h,
f);return b})}(function(a,b,c){if(c)for(var e=-1,d=C(b),f=d.length;++e<f;){var h=d[e],g=a[h],l=c(g,b[h],h,a,b);(l===l?l===g:g!==g)&&(g!==p||h in a)||(a[h]=l)}else a=sa(a,b);return a}),tb=function(a,b){return oa(function(c){var e=c[0];if(null==e)return e;c.push(b);return a.apply(p,c)})}(qa,function(a,b){return a===p?b:a}),C=Ra?function(a){var b=null==a?p:a.constructor;return typeof b=="function"&&b.prototype===a||(typeof a=="function"?n.support.enumPrototypes:null!=a&&E(ma(a)))?Ja(a):v(a)?Ra(a):[]}:
Ja;n.assign=qa;n.callback=ea;n.defaults=tb;n.keys=C;n.keysIn=Ka;n.matches=Oa;n.pairs=Ea;n.property=wa;n.remove=function(a,b,c){var e=[];if(!a||!a.length)return e;var d=-1,f=[],h=a.length,g=n.callback||ea,g=g===ea?ta:g;for(b=g(b,c,3);++d<h;)c=a[d],b(c,d,a)&&(e.push(c),f.push(d));for(b=a?f.length:0;b--;)if(d=f[b],d!=l&&$(d)){var l=d;Qa.call(a,d,1)}return e};n.restParam=oa;n.extend=qa;n.iteratee=ea;n.identity=ha;n.isArguments=na;n.isArray=y;n.isFunction=ca;n.isNative=Ga;n.isObject=v;n.isString=aa;n.isTypedArray=
ja;n.last=Ba;n.VERSION="3.10.0";ga&&O&&qb&&((O.exports=n)._=n)}.call(this));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
 

  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],5:[function(require,module,exports){
/* Copyright (c) 2010-2013 Marcus Westin */
(function(e){function o(){try{return r in e&&e[r]}catch(t){return!1}}var t={},n=e.document,r="localStorage",i="script",s;t.disabled=!1,t.version="1.3.17",t.set=function(e,t){},t.get=function(e,t){},t.has=function(e){return t.get(e)!==undefined},t.remove=function(e){},t.clear=function(){},t.transact=function(e,n,r){r==null&&(r=n,n=null),n==null&&(n={});var i=t.get(e,n);r(i),t.set(e,i)},t.getAll=function(){},t.forEach=function(){},t.serialize=function(e){return JSON.stringify(e)},t.deserialize=function(e){if(typeof e!="string")return undefined;try{return JSON.parse(e)}catch(t){return e||undefined}};if(o())s=e[r],t.set=function(e,n){return n===undefined?t.remove(e):(s.setItem(e,t.serialize(n)),n)},t.get=function(e,n){var r=t.deserialize(s.getItem(e));return r===undefined?n:r},t.remove=function(e){s.removeItem(e)},t.clear=function(){s.clear()},t.getAll=function(){var e={};return t.forEach(function(t,n){e[t]=n}),e},t.forEach=function(e){for(var n=0;n<s.length;n++){var r=s.key(n);e(r,t.get(r))}};else if(n.documentElement.addBehavior){var u,a;try{a=new ActiveXObject("htmlfile"),a.open(),a.write("<"+i+">document.w=window</"+i+'><iframe src="/favicon.ico"></iframe>'),a.close(),u=a.w.frames[0].document,s=u.createElement("div")}catch(f){s=n.createElement("div"),u=n.body}var l=function(e){return function(){var n=Array.prototype.slice.call(arguments,0);n.unshift(s),u.appendChild(s),s.addBehavior("#default#userData"),s.load(r);var i=e.apply(t,n);return u.removeChild(s),i}},c=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g");function h(e){return e.replace(/^d/,"___$&").replace(c,"___")}t.set=l(function(e,n,i){return n=h(n),i===undefined?t.remove(n):(e.setAttribute(n,t.serialize(i)),e.save(r),i)}),t.get=l(function(e,n,r){n=h(n);var i=t.deserialize(e.getAttribute(n));return i===undefined?r:i}),t.remove=l(function(e,t){t=h(t),e.removeAttribute(t),e.save(r)}),t.clear=l(function(e){var t=e.XMLDocument.documentElement.attributes;e.load(r);for(var n=0,i;i=t[n];n++)e.removeAttribute(i.name);e.save(r)}),t.getAll=function(e){var n={};return t.forEach(function(e,t){n[e]=t}),n},t.forEach=l(function(e,n){var r=e.XMLDocument.documentElement.attributes;for(var i=0,s;s=r[i];++i)n(s.name,t.deserialize(e.getAttribute(s.name)))})}try{var p="__storejs__";t.set(p,p),t.get(p)!=p&&(t.disabled=!0),t.remove(p)}catch(f){t.disabled=!0}t.enabled=!t.disabled,typeof module!="undefined"&&module.exports&&this.module!==module?module.exports=t:typeof define=="function"&&define.amd?define(t):e.store=t})(Function("return this")())
},{}],6:[function(require,module,exports){
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


},{"store":5}],7:[function(require,module,exports){
var Utils, _, uuid;

_ = require('lodash.custom');

uuid = require('node-uuid');

Utils = (function() {
  function Utils() {}

  Utils.defaults = _.defaults;

  Utils.keys = _.keys;

  Utils.remove = _.remove;

  Utils.set_debug = function(debug) {
    this.debug = debug;
  };

  Utils.log = function(message) {
    if (this.debug) {
      return console.log(message);
    }
  };

  Utils.uuid = uuid.v4;

  return Utils;

})();

module.exports = Utils;


},{"lodash.custom":3,"node-uuid":4}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvYWRhcHRlcnMuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L2FsZXBoYmV0LmpzLmNvZmZlZSIsImxpYi9sb2Rhc2guY3VzdG9tLm1pbi5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXV1aWQvdXVpZC5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yZS5taW4uanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3RvcmFnZS5qcy5jb2ZmZWUiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvdXRpbHMuanMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxlQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFFRjs7O0VBRUUsUUFBQyxDQUFBO29EQUNMLFNBQUEsR0FBVzs7SUFFRSwrQ0FBQyxPQUFEOztRQUFDLFVBQVUsUUFBUSxDQUFDOzs7O01BQy9CLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO01BQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsUUFBZCxDQUFBLElBQTJCLElBQXRDO01BQ1YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUpXOztvREFNYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFDLENBQUEsTUFBZCxFQUFzQixTQUFDLEVBQUQ7bUJBQVEsRUFBRSxDQUFDLElBQUgsS0FBVztVQUFuQixDQUF0QjtpQkFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxRQUFkLEVBQXdCLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBQyxDQUFBLE1BQWhCLENBQXhCO1FBRkY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBRFk7O29EQUtkLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLElBQXlGLE9BQU8sRUFBUCxLQUFlLFVBQXhHO0FBQUEsY0FBTSxnRkFBTjs7QUFDQTtBQUFBO1dBQUEscUNBQUE7O1FBQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBSSxDQUFDLElBQW5CO3FCQUNYLEVBQUEsQ0FBRyxNQUFILEVBQVcsT0FBWCxFQUFvQixJQUFJLENBQUMsUUFBekIsRUFBbUMsSUFBSSxDQUFDLE1BQXhDLEVBQWdELElBQUksQ0FBQyxLQUFyRCxFQUE0RDtVQUFDLGFBQUEsRUFBZSxRQUFoQjtTQUE1RDtBQUZGOztJQUZNOztvREFNUixNQUFBLEdBQVEsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixLQUFuQjtNQUNOLElBQUMsQ0FBQSxHQUFELENBQUsscURBQUEsR0FBc0QsUUFBdEQsR0FBK0QsSUFBL0QsR0FBbUUsTUFBbkUsR0FBMEUsSUFBMUUsR0FBOEUsS0FBbkY7TUFDQSxJQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsR0FBcEM7UUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQSxFQUFBOztNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhO1FBQUMsSUFBQSxFQUFNLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FBUDtRQUFxQixRQUFBLEVBQVUsUUFBL0I7UUFBeUMsTUFBQSxFQUFRLE1BQWpEO1FBQXlELEtBQUEsRUFBTyxLQUFoRTtPQUFiO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsUUFBZCxFQUF3QixJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxNQUFoQixDQUF4QjthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFMTTs7b0RBT1IsZ0JBQUEsR0FBa0IsU0FBQyxlQUFELEVBQWtCLE9BQWxCO2FBQ2hCLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLFNBQVQsRUFBdUIsZUFBRCxHQUFpQixLQUFqQixHQUFzQixPQUE1QyxFQUF1RCxVQUF2RDtJQURnQjs7b0RBR2xCLGFBQUEsR0FBZSxTQUFDLGVBQUQsRUFBa0IsT0FBbEIsRUFBMkIsSUFBM0I7YUFDYixJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxTQUFULEVBQXVCLGVBQUQsR0FBaUIsS0FBakIsR0FBc0IsT0FBNUMsRUFBdUQsSUFBdkQ7SUFEYTs7Ozs7Ozs7OztBQUduQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ3JDakIsSUFBQSxrQ0FBQTtFQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsbUJBQVI7O0FBQ1IsT0FBQSxHQUFVLE9BQUEsQ0FBUSxxQkFBUjs7QUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLHNCQUFSOztBQUVMO0FBQ0osTUFBQTs7OztFQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVc7SUFBQyxLQUFBLEVBQU8sS0FBUjs7O0VBRVgsUUFBQyxDQUFBLHFDQUFELEdBQXlDLFFBQVEsQ0FBQzs7RUFFNUMsUUFBQyxDQUFBOzs7SUFDTCwrQkFBQyxDQUFBLFNBQUQsR0FBWTs7SUFFWiwrQkFBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLEtBQW5CLEVBQTBCLEtBQTFCO01BQ1AsR0FBQSxDQUFJLG9DQUFBLEdBQXFDLFFBQXJDLEdBQThDLElBQTlDLEdBQWtELE1BQWxELEdBQXlELElBQXpELEdBQTZELEtBQTdELEdBQW1FLElBQW5FLEdBQXVFLEtBQTNFO01BQ0EsSUFBeUYsT0FBTyxFQUFQLEtBQWUsVUFBeEc7QUFBQSxjQUFNLGdGQUFOOzthQUNBLEVBQUEsQ0FBRyxNQUFILEVBQVcsT0FBWCxFQUFvQixRQUFwQixFQUE4QixNQUE5QixFQUFzQyxLQUF0QyxFQUE2QyxLQUE3QztJQUhPOztJQUtULCtCQUFDLENBQUEsZ0JBQUQsR0FBbUIsU0FBQyxlQUFELEVBQWtCLE9BQWxCO2FBQ2pCLCtCQUFDLENBQUEsTUFBRCxDQUFRLCtCQUFDLENBQUEsU0FBVCxFQUF1QixlQUFELEdBQWlCLEtBQWpCLEdBQXNCLE9BQTVDLEVBQXVELFVBQXZEO0lBRGlCOztJQUduQiwrQkFBQyxDQUFBLGFBQUQsR0FBZ0IsU0FBQyxlQUFELEVBQWtCLE9BQWxCLEVBQTJCLElBQTNCO2FBQ2QsK0JBQUMsQ0FBQSxNQUFELENBQVEsK0JBQUMsQ0FBQSxTQUFULEVBQXVCLGVBQUQsR0FBaUIsS0FBakIsR0FBc0IsT0FBNUMsRUFBdUQsSUFBdkQ7SUFEYzs7Ozs7O0VBR1osUUFBQyxDQUFBOzs7SUFDTCxtQkFBQyxDQUFBLFNBQUQsR0FBWTs7SUFDWixtQkFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOO2FBQ0EsSUFBQSxPQUFBLENBQVEsSUFBQyxDQUFBLFNBQVQsQ0FBbUIsQ0FBQyxHQUFwQixDQUF3QixHQUF4QixFQUE2QixLQUE3QjtJQURBOztJQUVOLG1CQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsR0FBRDthQUNBLElBQUEsT0FBQSxDQUFRLElBQUMsQ0FBQSxTQUFULENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsR0FBeEI7SUFEQTs7Ozs7O0VBR0YsUUFBQyxDQUFBO0FBQ0wsUUFBQTs7SUFBQSxVQUFDLENBQUEsUUFBRCxHQUNFO01BQUEsSUFBQSxFQUFNLElBQU47TUFDQSxRQUFBLEVBQVUsSUFEVjtNQUVBLE1BQUEsRUFBUSxHQUZSO01BR0EsT0FBQSxFQUFTLFNBQUE7ZUFBRztNQUFILENBSFQ7TUFJQSxnQkFBQSxFQUFrQixRQUFRLENBQUMsK0JBSjNCO01BS0EsZUFBQSxFQUFpQixRQUFRLENBQUMsbUJBTDFCOzs7SUFPVyxvQkFBQyxPQUFEO01BQUMsSUFBQyxDQUFBLDRCQUFELFVBQVM7OztNQUNyQixLQUFLLENBQUMsUUFBTixDQUFlLElBQUMsQ0FBQSxPQUFoQixFQUF5QixVQUFVLENBQUMsUUFBcEM7TUFDQSxTQUFTLENBQUMsSUFBVixDQUFlLElBQWY7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxPQUFPLENBQUM7TUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsT0FBTyxDQUFDO01BQ3JCLElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVo7TUFDakIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO0lBTlc7O3lCQVFiLEdBQUEsR0FBSyxTQUFBO01BQ0gsR0FBQSxDQUFJLHdCQUFBLEdBQXdCLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsT0FBaEIsQ0FBRCxDQUE1QjtNQUNBLGNBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFELENBQUE7SUFIRzs7SUFLTCxJQUFBLEdBQU8sU0FBQTthQUFHLElBQUMsQ0FBQSxHQUFELENBQUE7SUFBSDs7SUFFUCxjQUFBLEdBQWlCLFNBQUEsR0FBQTs7eUJBR2pCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQSxDQUFkO0FBQUEsZUFBQTs7TUFDQSxHQUFBLENBQUksYUFBSjtNQUNBLElBQUEsQ0FBYyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUNBLEdBQUEsQ0FBSSxXQUFKO01BQ0EsSUFBRyxPQUFBLEdBQVUsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FBYjtRQUNFLEdBQUEsQ0FBTyxPQUFELEdBQVMsU0FBZixFQURGO09BQUEsTUFBQTtRQUdFLE9BQUEsR0FBVSxJQUFDLENBQUEsWUFBRCxDQUFBO1FBQ1YsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsZ0JBQVosQ0FBNkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUF0QyxFQUE0QyxPQUE1QyxFQUpGOzs7V0FLa0IsQ0FBRSxRQUFwQixDQUE2QixJQUE3Qjs7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFVBQWhDLEVBQTJDLE9BQTNDO0lBWGE7O3lCQWFmLGFBQUEsR0FBZSxTQUFDLFNBQUQsRUFBWSxLQUFaO0FBQ2IsVUFBQTs7UUFEeUIsUUFBTTs7TUFDL0IsS0FBSyxDQUFDLFFBQU4sQ0FBZSxLQUFmLEVBQXNCO1FBQUMsTUFBQSxFQUFRLElBQVQ7T0FBdEI7TUFDQSxJQUFVLEtBQUssQ0FBQyxNQUFOLElBQWdCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsR0FBZixHQUFrQixTQUFuQyxDQUExQjtBQUFBLGVBQUE7O01BQ0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ1YsSUFBQSxDQUFjLE9BQWQ7QUFBQSxlQUFBOztNQUNBLElBQXlELEtBQUssQ0FBQyxNQUEvRDtRQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsR0FBZixHQUFrQixTQUFuQyxFQUFnRCxJQUFoRCxFQUFBOztNQUNBLEdBQUEsQ0FBSSxjQUFBLEdBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUF4QixHQUE2QixXQUE3QixHQUF3QyxPQUF4QyxHQUFnRCxRQUFoRCxHQUF3RCxTQUF4RCxHQUFrRSxXQUF0RTthQUNBLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVyxDQUFDLGFBQVosQ0FBMEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFuQyxFQUF5QyxPQUF6QyxFQUFrRCxTQUFsRDtJQVBhOzt5QkFTZixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsVUFBaEM7SUFEa0I7O3lCQUdwQixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxVQUFBLEdBQWEsR0FBQSxHQUFNLElBQUMsQ0FBQSxhQUFhLENBQUM7TUFDbEMsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsVUFBM0I7TUFDbkIsT0FBQSxHQUFVLElBQUMsQ0FBQSxhQUFjLENBQUEsZ0JBQUE7TUFDekIsR0FBQSxDQUFPLE9BQUQsR0FBUyxTQUFmO2FBQ0E7SUFMWTs7eUJBT2QsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsWUFBaEM7TUFDVCxJQUFxQixPQUFPLE1BQVAsS0FBaUIsV0FBdEM7QUFBQSxlQUFPLE9BQVA7O01BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxJQUFpQixJQUFDLENBQUEsT0FBTyxDQUFDO01BQ25DLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsWUFBaEMsRUFBNkMsTUFBN0M7YUFDQTtJQUxTOzt5QkFPWCxRQUFBLEdBQVUsU0FBQyxJQUFEO2FBQ1IsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsSUFBcEI7SUFEUTs7eUJBR1YsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFVBQUE7QUFBQTtXQUFBLHVDQUFBOztxQkFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQVY7QUFBQTs7SUFEUzs7eUJBR1gsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDO0lBQVo7O3lCQUVULFFBQUEsR0FBVSxTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQztJQUFaOztJQUVWLFNBQUEsR0FBWSxTQUFBO01BQ1YsSUFBZ0QsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULEtBQWlCLElBQWpFO0FBQUEsY0FBTSx1Q0FBTjs7TUFDQSxJQUFxQyxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsS0FBcUIsSUFBMUQ7QUFBQSxjQUFNLDRCQUFOOztNQUNBLElBQXNDLE9BQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFoQixLQUE2QixVQUFuRTtBQUFBLGNBQU0sNkJBQU47O0lBSFU7Ozs7OztFQUtSLFFBQUMsQ0FBQTtJQUNRLGNBQUMsSUFBRCxFQUFRLE1BQVI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSx5QkFBRCxTQUFPO01BQzFCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLEtBQWhCLEVBQXVCO1FBQUMsTUFBQSxFQUFRLElBQVQ7T0FBdkI7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRko7O21CQUliLGNBQUEsR0FBZ0IsU0FBQyxVQUFEO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFVBQWxCO0lBRGM7O21CQUdoQixlQUFBLEdBQWlCLFNBQUMsV0FBRDtBQUNmLFVBQUE7QUFBQTtXQUFBLDZDQUFBOztxQkFBQSxJQUFDLENBQUEsY0FBRCxDQUFnQixVQUFoQjtBQUFBOztJQURlOzttQkFHakIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDRSxVQUFVLENBQUMsYUFBWCxDQUF5QixJQUFDLENBQUEsSUFBMUIsRUFBZ0MsSUFBQyxDQUFBLEtBQWpDO0FBREY7O0lBRFE7Ozs7OztFQUlaLEdBQUEsR0FBTSxRQUFDLENBQUEsR0FBRCxHQUFPLFNBQUMsT0FBRDtJQUNYLEtBQUssQ0FBQyxTQUFOLENBQWdCLFFBQUMsQ0FBQSxPQUFPLENBQUMsS0FBekI7V0FDQSxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVY7RUFGVzs7Ozs7O0FBSWYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDbElqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7O0FDREEsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0FBR0Y7RUFDUyxpQkFBQyxTQUFEO0lBQUMsSUFBQyxDQUFBLGdDQUFELFlBQVc7SUFDdkIsSUFBQSxDQUEyQyxLQUFLLENBQUMsT0FBakQ7QUFBQSxZQUFNLDhCQUFOOztJQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsU0FBWCxDQUFBLElBQXlCO0VBRnpCOztvQkFHYixHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sS0FBTjtJQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQSxDQUFULEdBQWdCO0lBQ2hCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsRUFBc0IsSUFBQyxDQUFBLE9BQXZCO0FBQ0EsV0FBTztFQUhKOztvQkFJTCxHQUFBLEdBQUssU0FBQyxHQUFEO1dBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxHQUFBO0VBRE47Ozs7OztBQUlQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDZGpCLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxlQUFSOztBQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUjs7QUFFRDs7O0VBQ0osS0FBQyxDQUFBLFFBQUQsR0FBVyxDQUFDLENBQUM7O0VBQ2IsS0FBQyxDQUFBLElBQUQsR0FBTyxDQUFDLENBQUM7O0VBQ1QsS0FBQyxDQUFBLE1BQUQsR0FBUyxDQUFDLENBQUM7O0VBQ1gsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLEtBQUQ7SUFBQyxJQUFDLENBQUEsUUFBRDtFQUFEOztFQUNaLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxPQUFEO0lBQ0osSUFBd0IsSUFBQyxDQUFBLEtBQXpCO2FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQUE7O0VBREk7O0VBRU4sS0FBQyxDQUFBLElBQUQsR0FBTyxJQUFJLENBQUM7Ozs7OztBQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcy5jb2ZmZWUnKVxuXG5jbGFzcyBBZGFwdGVyc1xuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gICAgbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHN0b3JhZ2UgPSBBbGVwaEJldC5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGxvZyA9IEFsZXBoQmV0LmxvZ1xuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldCgnX3F1ZXVlJykgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgID0+XG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldCgnX3F1ZXVlJywgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV91dWlkKGl0ZW0udXVpZClcbiAgICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBpdGVtLmNhdGVnb3J5LCBpdGVtLmFjdGlvbiwgaXRlbS5sYWJlbCwgeydoaXRDYWxsYmFjayc6IGNhbGxiYWNrfSlcblxuICAgIF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgQGxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaCh7dXVpZDogdXRpbHMudXVpZCgpLCBjYXRlZ29yeTogY2F0ZWdvcnksIGFjdGlvbjogYWN0aW9uLCBsYWJlbDogbGFiZWx9KVxuICAgICAgQF9zdG9yYWdlLnNldCgnX3F1ZXVlJywgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWwpXG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHRlcnNcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcy5jb2ZmZWUnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS5qcy5jb2ZmZWUnKVxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzLmpzLmNvZmZlZScpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0ge2RlYnVnOiBmYWxzZX1cblxuICBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXJcblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpIC0+XG4gICAgICBsb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH0sICN7dmFsdWV9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHZhbHVlKVxuXG4gICAgQGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgQGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsKVxuXG4gIGNsYXNzIEBMb2NhbFN0b3JhZ2VBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIEBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuc2V0KGtleSwgdmFsdWUpXG4gICAgQGdldDogKGtleSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLmdldChrZXkpXG5cbiAgY2xhc3MgQEV4cGVyaW1lbnRcbiAgICBAX29wdGlvbnM6XG4gICAgICBuYW1lOiBudWxsXG4gICAgICB2YXJpYW50czogbnVsbFxuICAgICAgc2FtcGxlOiAxLjBcbiAgICAgIHRyaWdnZXI6IC0+IHRydWVcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IEFsZXBoQmV0Lkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogQWxlcGhCZXQuTG9jYWxTdG9yYWdlQWRhcHRlclxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBvcHRpb25zLCBFeHBlcmltZW50Ll9vcHRpb25zKVxuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcylcbiAgICAgIEBuYW1lID0gQG9wdGlvbnMubmFtZVxuICAgICAgQHZhcmlhbnRzID0gQG9wdGlvbnMudmFyaWFudHNcbiAgICAgIEB2YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyhAdmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIGxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIF9mb3JjZV92YXJpYW50KClcbiAgICAgIEBhcHBseV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIF9mb3JjZV92YXJpYW50ID0gLT5cbiAgICAgICMgVE9ETzogZ2V0IHZhcmlhbnQgZnJvbSBVUklcblxuICAgIGFwcGx5X3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgbG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgbG9nKCdpbiBzYW1wbGUnKVxuICAgICAgaWYgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgICBsb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgZWxzZVxuICAgICAgICB2YXJpYW50ID0gQHBpY2tfdmFyaWFudCgpXG4gICAgICAgIEB0cmFja2luZygpLmV4cGVyaW1lbnRfc3RhcnQoQG9wdGlvbnMubmFtZSwgdmFyaWFudClcbiAgICAgIEB2YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUodGhpcylcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZ29hbF9uYW1lLCBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIHJldHVybiBpZiBwcm9wcy51bmlxdWUgJiYgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiKVxuICAgICAgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgcmV0dXJuIHVubGVzcyB2YXJpYW50XG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIsIHRydWUpIGlmIHByb3BzLnVuaXF1ZVxuICAgICAgbG9nKFwiZXhwZXJpbWVudDogI3tAb3B0aW9ucy5uYW1lfSB2YXJpYW50OiN7dmFyaWFudH0gZ29hbDoje2dvYWxfbmFtZX0gY29tcGxldGVcIilcbiAgICAgIEB0cmFja2luZygpLmdvYWxfY29tcGxldGUoQG9wdGlvbnMubmFtZSwgdmFyaWFudCwgZ29hbF9uYW1lKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudF9uYW1lcy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICBsb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgdmFyaWFudFxuXG4gICAgaW5fc2FtcGxlOiAtPlxuICAgICAgYWN0aXZlID0gQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiKVxuICAgICAgcmV0dXJuIGFjdGl2ZSB1bmxlc3MgdHlwZW9mIGFjdGl2ZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgYWN0aXZlID0gTWF0aC5yYW5kb20oKSA8PSBAb3B0aW9ucy5zYW1wbGVcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIiwgYWN0aXZlKVxuICAgICAgYWN0aXZlXG5cbiAgICBhZGRfZ29hbDogKGdvYWwpID0+XG4gICAgICBnb2FsLmFkZF9leHBlcmltZW50KHRoaXMpXG5cbiAgICBhZGRfZ29hbHM6IChnb2FscykgPT5cbiAgICAgIEBhZGRfZ29hbChnb2FsKSBmb3IgZ29hbCBpbiBnb2Fsc1xuXG4gICAgc3RvcmFnZTogLT4gQG9wdGlvbnMuc3RvcmFnZV9hZGFwdGVyXG5cbiAgICB0cmFja2luZzogLT4gQG9wdGlvbnMudHJhY2tpbmdfYWRhcHRlclxuXG4gICAgX3ZhbGlkYXRlID0gLT5cbiAgICAgIHRocm93ICdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3ZhcmlhbnRzIG11c3QgYmUgcHJvdmlkZWQnIGlmIEBvcHRpb25zLnZhcmlhbnRzIGlzIG51bGxcbiAgICAgIHRocm93ICd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicgaWYgdHlwZW9mIEBvcHRpb25zLnRyaWdnZXIgaXNudCAnZnVuY3Rpb24nXG5cbiAgY2xhc3MgQEdvYWxcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAcHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgQGV4cGVyaW1lbnRzID0gW11cblxuICAgIGFkZF9leHBlcmltZW50OiAoZXhwZXJpbWVudCkgLT5cbiAgICAgIEBleHBlcmltZW50cy5wdXNoKGV4cGVyaW1lbnQpXG5cbiAgICBhZGRfZXhwZXJpbWVudHM6IChleHBlcmltZW50cykgLT5cbiAgICAgIEBhZGRfZXhwZXJpbWVudChleHBlcmltZW50KSBmb3IgZXhwZXJpbWVudCBpbiBleHBlcmltZW50c1xuXG4gICAgY29tcGxldGU6IC0+XG4gICAgICBmb3IgZXhwZXJpbWVudCBpbiBAZXhwZXJpbWVudHNcbiAgICAgICAgZXhwZXJpbWVudC5nb2FsX2NvbXBsZXRlKEBuYW1lLCBAcHJvcHMpXG5cbiAgbG9nID0gQGxvZyA9IChtZXNzYWdlKSA9PlxuICAgIHV0aWxzLnNldF9kZWJ1ZyhAb3B0aW9ucy5kZWJ1ZylcbiAgICB1dGlscy5sb2cobWVzc2FnZSlcblxubW9kdWxlLmV4cG9ydHMgPSBBbGVwaEJldFxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogbG9kYXNoIDMuMTAuMCAoQ3VzdG9tIEJ1aWxkKSBsb2Rhc2guY29tL2xpY2Vuc2UgfCBVbmRlcnNjb3JlLmpzIDEuOC4zIHVuZGVyc2NvcmVqcy5vcmcvTElDRU5TRVxuICogQnVpbGQ6IGBsb2Rhc2ggaW5jbHVkZT1cImtleXMsZGVmYXVsdHMscmVtb3ZlXCIgZXhwb3J0cz1cIm5vZGVcIiAtbyAuL2xpYi9sb2Rhc2guY3VzdG9tLmpzYFxuICovXG47KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gQihhKXtyZXR1cm4hIWEmJnR5cGVvZiBhPT1cIm9iamVjdFwifWZ1bmN0aW9uIG4oKXt9ZnVuY3Rpb24gU2EoYSxiKXt2YXIgYz0tMSxlPWEubGVuZ3RoO2ZvcihifHwoYj1BcnJheShlKSk7KytjPGU7KWJbY109YVtjXTtyZXR1cm4gYn1mdW5jdGlvbiByYShhLGIpe2Zvcih2YXIgYz0tMSxlPWEubGVuZ3RoOysrYzxlJiZmYWxzZSE9PWIoYVtjXSxjLGEpOyk7cmV0dXJuIGF9ZnVuY3Rpb24gVGEoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZTspaWYoYihhW2NdLGMsYSkpcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIHNhKGEsYil7dmFyIGM7aWYobnVsbD09YiljPWE7ZWxzZXtjPUMoYik7dmFyIGU9YTtlfHwoZT17fSk7Zm9yKHZhciBkPS0xLGY9Yy5sZW5ndGg7KytkPGY7KXt2YXIgaD1jW2RdO2VbaF09YltoXX1jPWV9cmV0dXJuIGN9ZnVuY3Rpb24gdGEoYSxiLGMpe3ZhciBlPXR5cGVvZiBhO3JldHVyblwiZnVuY3Rpb25cIj09XG5lP2I9PT1wP2E6dWEoYSxiLGMpOm51bGw9PWE/aGE6XCJvYmplY3RcIj09ZT92YShhKTpiPT09cD93YShhKTpVYShhLGIpfWZ1bmN0aW9uIHhhKGEsYixjLGUsZCxmLGgpe3ZhciBnO2MmJihnPWQ/YyhhLGUsZCk6YyhhKSk7aWYoZyE9PXApcmV0dXJuIGc7aWYoIXYoYSkpcmV0dXJuIGE7aWYoZT15KGEpKXtpZihnPVZhKGEpLCFiKXJldHVybiBTYShhLGcpfWVsc2V7dmFyIGw9QS5jYWxsKGEpLG09bD09SDtpZihsPT10fHxsPT1JfHxtJiYhZCl7aWYoUShhKSlyZXR1cm4gZD9hOnt9O2c9V2EobT97fTphKTtpZighYilyZXR1cm4gc2EoZyxhKX1lbHNlIHJldHVybiBxW2xdP1hhKGEsbCxiKTpkP2E6e319Znx8KGY9W10pO2h8fChoPVtdKTtmb3IoZD1mLmxlbmd0aDtkLS07KWlmKGZbZF09PWEpcmV0dXJuIGhbZF07Zi5wdXNoKGEpO2gucHVzaChnKTsoZT9yYTpZYSkoYSxmdW5jdGlvbihkLGUpe2dbZV09eGEoZCxiLGMsZSxhLGYsaCl9KTtyZXR1cm4gZ31mdW5jdGlvbiBZYShhLGIpe3JldHVybiBaYShhLFxuYixDKX1mdW5jdGlvbiB5YShhLGIsYyl7aWYobnVsbCE9YSl7YT16KGEpO2MhPT1wJiZjIGluIGEmJihiPVtjXSk7Yz0wO2Zvcih2YXIgZT1iLmxlbmd0aDtudWxsIT1hJiZjPGU7KWE9eihhKVtiW2MrK11dO3JldHVybiBjJiZjPT1lP2E6cH19ZnVuY3Rpb24gaWEoYSxiLGMsZSxkLGYpe2lmKGE9PT1iKWE9dHJ1ZTtlbHNlIGlmKG51bGw9PWF8fG51bGw9PWJ8fCF2KGEpJiYhQihiKSlhPWEhPT1hJiZiIT09YjtlbHNlIGE6e3ZhciBoPWlhLGc9eShhKSxsPXkoYiksbT1GLGs9RjtnfHwobT1BLmNhbGwoYSksbT09ST9tPXQ6bSE9dCYmKGc9amEoYSkpKTtsfHwoaz1BLmNhbGwoYiksaz09ST9rPXQ6ayE9dCYmamEoYikpO3ZhciBwPW09PXQmJiFRKGEpLGw9az09dCYmIVEoYiksaz1tPT1rO2lmKCFrfHxnfHxwKXtpZighZSYmKG09cCYmdS5jYWxsKGEsXCJfX3dyYXBwZWRfX1wiKSxsPWwmJnUuY2FsbChiLFwiX193cmFwcGVkX19cIiksbXx8bCkpe2E9aChtP2EudmFsdWUoKTphLGw/Yi52YWx1ZSgpOlxuYixjLGUsZCxmKTticmVhayBhfWlmKGspe2R8fChkPVtdKTtmfHwoZj1bXSk7Zm9yKG09ZC5sZW5ndGg7bS0tOylpZihkW21dPT1hKXthPWZbbV09PWI7YnJlYWsgYX1kLnB1c2goYSk7Zi5wdXNoKGIpO2E9KGc/JGE6YWIpKGEsYixoLGMsZSxkLGYpO2QucG9wKCk7Zi5wb3AoKX1lbHNlIGE9ZmFsc2V9ZWxzZSBhPWJiKGEsYixtKX1yZXR1cm4gYX1mdW5jdGlvbiBjYihhLGIpe3ZhciBjPWIubGVuZ3RoLGU9YztpZihudWxsPT1hKXJldHVybiFlO2ZvcihhPXooYSk7Yy0tOyl7dmFyIGQ9YltjXTtpZihkWzJdP2RbMV0hPT1hW2RbMF1dOiEoZFswXWluIGEpKXJldHVybiBmYWxzZX1mb3IoOysrYzxlOyl7dmFyIGQ9YltjXSxmPWRbMF0saD1hW2ZdLGc9ZFsxXTtpZihkWzJdKXtpZihoPT09cCYmIShmIGluIGEpKXJldHVybiBmYWxzZX1lbHNlIGlmKGQ9cCxkPT09cD8haWEoZyxoLHZvaWQgMCx0cnVlKTohZClyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9ZnVuY3Rpb24gdmEoYSl7dmFyIGI9ZGIoYSk7aWYoMT09Yi5sZW5ndGgmJlxuYlswXVsyXSl7dmFyIGM9YlswXVswXSxlPWJbMF1bMV07cmV0dXJuIGZ1bmN0aW9uKGEpe2lmKG51bGw9PWEpcmV0dXJuIGZhbHNlO2E9eihhKTtyZXR1cm4gYVtjXT09PWUmJihlIT09cHx8YyBpbiBhKX19cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiBjYihhLGIpfX1mdW5jdGlvbiBVYShhLGIpe3ZhciBjPXkoYSksZT16YShhKSYmYj09PWImJiF2KGIpLGQ9YStcIlwiO2E9QWEoYSk7cmV0dXJuIGZ1bmN0aW9uKGYpe2lmKG51bGw9PWYpcmV0dXJuIGZhbHNlO3ZhciBoPWQ7Zj16KGYpO2lmKCEoIWMmJmV8fGggaW4gZikpe2lmKDEhPWEubGVuZ3RoKXt2YXIgaD1hLGc9MCxsPS0xLG09LTEsaz1oLmxlbmd0aCxnPW51bGw9PWc/MDorZ3x8MDswPmcmJihnPS1nPms/MDprK2cpO2w9bD09PXB8fGw+az9rOitsfHwwOzA+bCYmKGwrPWspO2s9Zz5sPzA6bC1nPj4+MDtnPj4+PTA7Zm9yKGw9QXJyYXkoayk7KyttPGs7KWxbbV09aFttK2ddO2Y9eWEoZixsKX1pZihudWxsPT1mKXJldHVybiBmYWxzZTtoPUJhKGEpO1xuZj16KGYpfXJldHVybiBmW2hdPT09Yj9iIT09cHx8aCBpbiBmOmlhKGIsZltoXSxwLHRydWUpfX1mdW5jdGlvbiBDYShhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIG51bGw9PWI/cDp6KGIpW2FdfX1mdW5jdGlvbiBlYihhKXt2YXIgYj1hK1wiXCI7YT1BYShhKTtyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIHlhKGMsYSxiKX19ZnVuY3Rpb24gdWEoYSxiLGMpe2lmKHR5cGVvZiBhIT1cImZ1bmN0aW9uXCIpcmV0dXJuIGhhO2lmKGI9PT1wKXJldHVybiBhO3N3aXRjaChjKXtjYXNlIDE6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiBhLmNhbGwoYixjKX07Y2FzZSAzOnJldHVybiBmdW5jdGlvbihjLGQsZil7cmV0dXJuIGEuY2FsbChiLGMsZCxmKX07Y2FzZSA0OnJldHVybiBmdW5jdGlvbihjLGQsZixoKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYsaCl9O2Nhc2UgNTpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCxnKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYsaCxnKX19cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGEuYXBwbHkoYixcbmFyZ3VtZW50cyl9fWZ1bmN0aW9uIERhKGEpe3ZhciBiPW5ldyBmYihhLmJ5dGVMZW5ndGgpOyhuZXcga2EoYikpLnNldChuZXcga2EoYSkpO3JldHVybiBifWZ1bmN0aW9uICRhKGEsYixjLGUsZCxmLGgpe3ZhciBnPS0xLGw9YS5sZW5ndGgsbT1iLmxlbmd0aDtpZihsIT1tJiYhKGQmJm0+bCkpcmV0dXJuIGZhbHNlO2Zvcig7KytnPGw7KXt2YXIgaz1hW2ddLG09YltnXSxuPWU/ZShkP206ayxkP2s6bSxnKTpwO2lmKG4hPT1wKXtpZihuKWNvbnRpbnVlO3JldHVybiBmYWxzZX1pZihkKXtpZighVGEoYixmdW5jdGlvbihhKXtyZXR1cm4gaz09PWF8fGMoayxhLGUsZCxmLGgpfSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoayE9PW0mJiFjKGssbSxlLGQsZixoKSlyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9ZnVuY3Rpb24gYmIoYSxiLGMpe3N3aXRjaChjKXtjYXNlIEo6Y2FzZSBLOnJldHVybithPT0rYjtjYXNlIEw6cmV0dXJuIGEubmFtZT09Yi5uYW1lJiZhLm1lc3NhZ2U9PWIubWVzc2FnZTtjYXNlIE06cmV0dXJuIGEhPVxuK2E/YiE9K2I6YT09K2I7Y2FzZSBOOmNhc2UgRDpyZXR1cm4gYT09YitcIlwifXJldHVybiBmYWxzZX1mdW5jdGlvbiBhYihhLGIsYyxlLGQsZixoKXt2YXIgZz1DKGEpLGw9Zy5sZW5ndGgsbT1DKGIpLmxlbmd0aDtpZihsIT1tJiYhZClyZXR1cm4gZmFsc2U7Zm9yKG09bDttLS07KXt2YXIgaz1nW21dO2lmKCEoZD9rIGluIGI6dS5jYWxsKGIsaykpKXJldHVybiBmYWxzZX1mb3IodmFyIG49ZDsrK208bDspe3ZhciBrPWdbbV0scT1hW2tdLHI9YltrXSxzPWU/ZShkP3I6cSxkP3E6cixrKTpwO2lmKHM9PT1wPyFjKHEscixlLGQsZixoKTohcylyZXR1cm4gZmFsc2U7bnx8KG49XCJjb25zdHJ1Y3RvclwiPT1rKX1yZXR1cm4gbnx8KGM9YS5jb25zdHJ1Y3RvcixlPWIuY29uc3RydWN0b3IsIShjIT1lJiZcImNvbnN0cnVjdG9yXCJpbiBhJiZcImNvbnN0cnVjdG9yXCJpbiBiKXx8dHlwZW9mIGM9PVwiZnVuY3Rpb25cIiYmYyBpbnN0YW5jZW9mIGMmJnR5cGVvZiBlPT1cImZ1bmN0aW9uXCImJmUgaW5zdGFuY2VvZiBlKT90cnVlOmZhbHNlfWZ1bmN0aW9uIGRiKGEpe2E9XG5FYShhKTtmb3IodmFyIGI9YS5sZW5ndGg7Yi0tOyl7dmFyIGM9YVtiXVsxXTthW2JdWzJdPWM9PT1jJiYhdihjKX1yZXR1cm4gYX1mdW5jdGlvbiBGYShhLGIpe3ZhciBjPW51bGw9PWE/cDphW2JdO3JldHVybiBHYShjKT9jOnB9ZnVuY3Rpb24gVmEoYSl7dmFyIGI9YS5sZW5ndGgsYz1uZXcgYS5jb25zdHJ1Y3RvcihiKTtiJiZcInN0cmluZ1wiPT10eXBlb2YgYVswXSYmdS5jYWxsKGEsXCJpbmRleFwiKSYmKGMuaW5kZXg9YS5pbmRleCxjLmlucHV0PWEuaW5wdXQpO3JldHVybiBjfWZ1bmN0aW9uIFdhKGEpe2E9YS5jb25zdHJ1Y3Rvcjt0eXBlb2YgYT09XCJmdW5jdGlvblwiJiZhIGluc3RhbmNlb2YgYXx8KGE9T2JqZWN0KTtyZXR1cm4gbmV3IGF9ZnVuY3Rpb24gWGEoYSxiLGMpe3ZhciBlPWEuY29uc3RydWN0b3I7c3dpdGNoKGIpe2Nhc2UgbGE6cmV0dXJuIERhKGEpO2Nhc2UgSjpjYXNlIEs6cmV0dXJuIG5ldyBlKCthKTtjYXNlIFI6Y2FzZSBTOmNhc2UgVDpjYXNlIFU6Y2FzZSBWOmNhc2UgVzpjYXNlIFg6Y2FzZSBZOmNhc2UgWjpyZXR1cm4gZSBpbnN0YW5jZW9mXG5lJiYoZT13W2JdKSxiPWEuYnVmZmVyLG5ldyBlKGM/RGEoYik6YixhLmJ5dGVPZmZzZXQsYS5sZW5ndGgpO2Nhc2UgTTpjYXNlIEQ6cmV0dXJuIG5ldyBlKGEpO2Nhc2UgTjp2YXIgZD1uZXcgZShhLnNvdXJjZSxnYi5leGVjKGEpKTtkLmxhc3RJbmRleD1hLmxhc3RJbmRleH1yZXR1cm4gZH1mdW5jdGlvbiAkKGEsYil7YT10eXBlb2YgYT09XCJudW1iZXJcInx8aGIudGVzdChhKT8rYTotMTtiPW51bGw9PWI/SGE6YjtyZXR1cm4tMTxhJiYwPT1hJTEmJmE8Yn1mdW5jdGlvbiBJYShhLGIsYyl7aWYoIXYoYykpcmV0dXJuIGZhbHNlO3ZhciBlPXR5cGVvZiBiO3JldHVybihcIm51bWJlclwiPT1lP251bGwhPWMmJkUobWEoYykpJiYkKGIsYy5sZW5ndGgpOlwic3RyaW5nXCI9PWUmJmIgaW4gYyk/KGI9Y1tiXSxhPT09YT9hPT09YjpiIT09Yik6ZmFsc2V9ZnVuY3Rpb24gemEoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJzdHJpbmdcIj09YiYmaWIudGVzdChhKXx8XCJudW1iZXJcIj09Yj90cnVlOnkoYSk/ZmFsc2U6IWpiLnRlc3QoYSl8fFxuITF9ZnVuY3Rpb24gRShhKXtyZXR1cm4gdHlwZW9mIGE9PVwibnVtYmVyXCImJi0xPGEmJjA9PWElMSYmYTw9SGF9ZnVuY3Rpb24gSmEoYSl7Zm9yKHZhciBiPUthKGEpLGM9Yi5sZW5ndGgsZT1jJiZhLmxlbmd0aCxkPSEhZSYmRShlKSYmKHkoYSl8fG5hKGEpfHxhYShhKSksZj0tMSxoPVtdOysrZjxjOyl7dmFyIGc9YltmXTsoZCYmJChnLGUpfHx1LmNhbGwoYSxnKSkmJmgucHVzaChnKX1yZXR1cm4gaH1mdW5jdGlvbiB6KGEpe2lmKG4uc3VwcG9ydC51bmluZGV4ZWRDaGFycyYmYWEoYSkpe2Zvcih2YXIgYj0tMSxjPWEubGVuZ3RoLGU9T2JqZWN0KGEpOysrYjxjOyllW2JdPWEuY2hhckF0KGIpO3JldHVybiBlfXJldHVybiB2KGEpP2E6T2JqZWN0KGEpfWZ1bmN0aW9uIEFhKGEpe2lmKHkoYSkpcmV0dXJuIGE7dmFyIGI9W107KG51bGw9PWE/XCJcIjphK1wiXCIpLnJlcGxhY2Uoa2IsZnVuY3Rpb24oYSxlLGQsZil7Yi5wdXNoKGQ/Zi5yZXBsYWNlKGxiLFwiJDFcIik6ZXx8YSl9KTtyZXR1cm4gYn1cbmZ1bmN0aW9uIEJhKGEpe3ZhciBiPWE/YS5sZW5ndGg6MDtyZXR1cm4gYj9hW2ItMV06cH1mdW5jdGlvbiBvYShhLGIpe2lmKHR5cGVvZiBhIT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihtYik7Yj1MYShiPT09cD9hLmxlbmd0aC0xOitifHwwLDApO3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgYz1hcmd1bWVudHMsZT0tMSxkPUxhKGMubGVuZ3RoLWIsMCksZj1BcnJheShkKTsrK2U8ZDspZltlXT1jW2IrZV07c3dpdGNoKGIpe2Nhc2UgMDpyZXR1cm4gYS5jYWxsKHRoaXMsZik7Y2FzZSAxOnJldHVybiBhLmNhbGwodGhpcyxjWzBdLGYpO2Nhc2UgMjpyZXR1cm4gYS5jYWxsKHRoaXMsY1swXSxjWzFdLGYpfWQ9QXJyYXkoYisxKTtmb3IoZT0tMTsrK2U8YjspZFtlXT1jW2VdO2RbYl09ZjtyZXR1cm4gYS5hcHBseSh0aGlzLGQpfX1mdW5jdGlvbiBuYShhKXtyZXR1cm4gQihhKSYmbnVsbCE9YSYmRShtYShhKSkmJnUuY2FsbChhLFwiY2FsbGVlXCIpJiYhYmEuY2FsbChhLFwiY2FsbGVlXCIpfVxuZnVuY3Rpb24gY2EoYSl7cmV0dXJuIHYoYSkmJkEuY2FsbChhKT09SH1mdW5jdGlvbiB2KGEpe3ZhciBiPXR5cGVvZiBhO3JldHVybiEhYSYmKFwib2JqZWN0XCI9PWJ8fFwiZnVuY3Rpb25cIj09Yil9ZnVuY3Rpb24gR2EoYSl7cmV0dXJuIG51bGw9PWE/ZmFsc2U6Y2EoYSk/TWEudGVzdChOYS5jYWxsKGEpKTpCKGEpJiYoUShhKT9NYTpuYikudGVzdChhKX1mdW5jdGlvbiBhYShhKXtyZXR1cm4gdHlwZW9mIGE9PVwic3RyaW5nXCJ8fEIoYSkmJkEuY2FsbChhKT09RH1mdW5jdGlvbiBqYShhKXtyZXR1cm4gQihhKSYmRShhLmxlbmd0aCkmJiEhcltBLmNhbGwoYSldfWZ1bmN0aW9uIEthKGEpe2lmKG51bGw9PWEpcmV0dXJuW107dihhKXx8KGE9T2JqZWN0KGEpKTtmb3IodmFyIGI9YS5sZW5ndGgsYz1uLnN1cHBvcnQsYj1iJiZFKGIpJiYoeShhKXx8bmEoYSl8fGFhKGEpKSYmYnx8MCxlPWEuY29uc3RydWN0b3IsZD0tMSxlPWNhKGUpJiZlLnByb3RvdHlwZXx8RyxmPWU9PT1hLGg9QXJyYXkoYiksZz1cbjA8YixsPWMuZW51bUVycm9yUHJvcHMmJihhPT09ZGF8fGEgaW5zdGFuY2VvZiBFcnJvciksbT1jLmVudW1Qcm90b3R5cGVzJiZjYShhKTsrK2Q8YjspaFtkXT1kK1wiXCI7Zm9yKHZhciBrIGluIGEpbSYmXCJwcm90b3R5cGVcIj09a3x8bCYmKFwibWVzc2FnZVwiPT1rfHxcIm5hbWVcIj09ayl8fGcmJiQoayxiKXx8XCJjb25zdHJ1Y3RvclwiPT1rJiYoZnx8IXUuY2FsbChhLGspKXx8aC5wdXNoKGspO2lmKGMubm9uRW51bVNoYWRvd3MmJmEhPT1HKWZvcihiPWE9PT1vYj9EOmE9PT1kYT9MOkEuY2FsbChhKSxjPXNbYl18fHNbdF0sYj09dCYmKGU9RyksYj1wYS5sZW5ndGg7Yi0tOylrPXBhW2JdLGQ9Y1trXSxmJiZkfHwoZD8hdS5jYWxsKGEsayk6YVtrXT09PWVba10pfHxoLnB1c2goayk7cmV0dXJuIGh9ZnVuY3Rpb24gRWEoYSl7YT16KGEpO2Zvcih2YXIgYj0tMSxjPUMoYSksZT1jLmxlbmd0aCxkPUFycmF5KGUpOysrYjxlOyl7dmFyIGY9Y1tiXTtkW2JdPVtmLGFbZl1dfXJldHVybiBkfWZ1bmN0aW9uIGVhKGEsXG5iLGMpe2MmJklhKGEsYixjKSYmKGI9cCk7cmV0dXJuIEIoYSk/T2EoYSk6dGEoYSxiKX1mdW5jdGlvbiBoYShhKXtyZXR1cm4gYX1mdW5jdGlvbiBPYShhKXtyZXR1cm4gdmEoeGEoYSx0cnVlKSl9ZnVuY3Rpb24gd2EoYSl7cmV0dXJuIHphKGEpP0NhKGEpOmViKGEpfXZhciBwLG1iPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLEk9XCJbb2JqZWN0IEFyZ3VtZW50c11cIixGPVwiW29iamVjdCBBcnJheV1cIixKPVwiW29iamVjdCBCb29sZWFuXVwiLEs9XCJbb2JqZWN0IERhdGVdXCIsTD1cIltvYmplY3QgRXJyb3JdXCIsSD1cIltvYmplY3QgRnVuY3Rpb25dXCIsTT1cIltvYmplY3QgTnVtYmVyXVwiLHQ9XCJbb2JqZWN0IE9iamVjdF1cIixOPVwiW29iamVjdCBSZWdFeHBdXCIsRD1cIltvYmplY3QgU3RyaW5nXVwiLGxhPVwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIixSPVwiW29iamVjdCBGbG9hdDMyQXJyYXldXCIsUz1cIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiLFQ9XCJbb2JqZWN0IEludDhBcnJheV1cIixVPVwiW29iamVjdCBJbnQxNkFycmF5XVwiLFxuVj1cIltvYmplY3QgSW50MzJBcnJheV1cIixXPVwiW29iamVjdCBVaW50OEFycmF5XVwiLFg9XCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiLFk9XCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiLFo9XCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiLGpiPS9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcblxcXFxdfFxcXFwuKSo/XFwxKVxcXS8saWI9L15cXHcqJC8sa2I9L1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZyxsYj0vXFxcXChcXFxcKT8vZyxnYj0vXFx3KiQvLG5iPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8saGI9L15cXGQrJC8scGE9XCJjb25zdHJ1Y3RvciBoYXNPd25Qcm9wZXJ0eSBpc1Byb3RvdHlwZU9mIHByb3BlcnR5SXNFbnVtZXJhYmxlIHRvTG9jYWxlU3RyaW5nIHRvU3RyaW5nIHZhbHVlT2ZcIi5zcGxpdChcIiBcIikscj17fTtyW1JdPXJbU109cltUXT1yW1VdPXJbVl09cltXXT1yW1hdPXJbWV09cltaXT10cnVlO1xucltJXT1yW0ZdPXJbbGFdPXJbSl09cltLXT1yW0xdPXJbSF09cltcIltvYmplY3QgTWFwXVwiXT1yW01dPXJbdF09cltOXT1yW1wiW29iamVjdCBTZXRdXCJdPXJbRF09cltcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIHE9e307cVtJXT1xW0ZdPXFbbGFdPXFbSl09cVtLXT1xW1JdPXFbU109cVtUXT1xW1VdPXFbVl09cVtNXT1xW3RdPXFbTl09cVtEXT1xW1ddPXFbWF09cVtZXT1xW1pdPXRydWU7cVtMXT1xW0hdPXFbXCJbb2JqZWN0IE1hcF1cIl09cVtcIltvYmplY3QgU2V0XVwiXT1xW1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTt2YXIgZmE9e1wiZnVuY3Rpb25cIjp0cnVlLG9iamVjdDp0cnVlfSxnYT1mYVt0eXBlb2YgZXhwb3J0c10mJmV4cG9ydHMmJiFleHBvcnRzLm5vZGVUeXBlJiZleHBvcnRzLE89ZmFbdHlwZW9mIG1vZHVsZV0mJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLHBiPWZhW3R5cGVvZiBzZWxmXSYmc2VsZiYmc2VsZi5PYmplY3QmJnNlbGYsUGE9ZmFbdHlwZW9mIHdpbmRvd10mJlxud2luZG93JiZ3aW5kb3cuT2JqZWN0JiZ3aW5kb3cscWI9TyYmTy5leHBvcnRzPT09Z2EmJmdhLHg9Z2EmJk8mJnR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdCYmZ2xvYmFsfHxQYSE9PSh0aGlzJiZ0aGlzLndpbmRvdykmJlBhfHxwYnx8dGhpcyxRPWZ1bmN0aW9uKCl7dHJ5e09iamVjdCh7dG9TdHJpbmc6MH0rXCJcIil9Y2F0Y2goYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIHR5cGVvZiBhLnRvU3RyaW5nIT1cImZ1bmN0aW9uXCImJnR5cGVvZihhK1wiXCIpPT1cInN0cmluZ1wifX0oKSxyYj1BcnJheS5wcm90b3R5cGUsZGE9RXJyb3IucHJvdG90eXBlLEc9T2JqZWN0LnByb3RvdHlwZSxvYj1TdHJpbmcucHJvdG90eXBlLE5hPUZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyx1PUcuaGFzT3duUHJvcGVydHksQT1HLnRvU3RyaW5nLE1hPVJlZ0V4cChcIl5cIitOYS5jYWxsKHUpLnJlcGxhY2UoL1tcXFxcXiQuKis/KClbXFxde318XS9nLFxuXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxmYj14LkFycmF5QnVmZmVyLGJhPUcucHJvcGVydHlJc0VudW1lcmFibGUsUWE9cmIuc3BsaWNlLGthPXguVWludDhBcnJheSxzYj1GYShBcnJheSxcImlzQXJyYXlcIiksUmE9RmEoT2JqZWN0LFwia2V5c1wiKSxMYT1NYXRoLm1heCxIYT05MDA3MTk5MjU0NzQwOTkxLHc9e307d1tSXT14LkZsb2F0MzJBcnJheTt3W1NdPXguRmxvYXQ2NEFycmF5O3dbVF09eC5JbnQ4QXJyYXk7d1tVXT14LkludDE2QXJyYXk7d1tWXT14LkludDMyQXJyYXk7d1tXXT1rYTt3W1hdPXguVWludDhDbGFtcGVkQXJyYXk7d1tZXT14LlVpbnQxNkFycmF5O3dbWl09eC5VaW50MzJBcnJheTt2YXIgcz17fTtzW0ZdPXNbS109c1tNXT17Y29uc3RydWN0b3I6dHJ1ZSx0b0xvY2FsZVN0cmluZzp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0pdPXNbRF09e2NvbnN0cnVjdG9yOnRydWUsXG50b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tMXT1zW0hdPXNbTl09e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZX07c1t0XT17Y29uc3RydWN0b3I6dHJ1ZX07cmEocGEsZnVuY3Rpb24oYSl7Zm9yKHZhciBiIGluIHMpaWYodS5jYWxsKHMsYikpe3ZhciBjPXNbYl07Y1thXT11LmNhbGwoYyxhKX19KTt2YXIgUD1uLnN1cHBvcnQ9e307KGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt0aGlzLng9YX12YXIgYz17MDphLGxlbmd0aDphfSxlPVtdO2IucHJvdG90eXBlPXt2YWx1ZU9mOmEseTphfTtmb3IodmFyIGQgaW4gbmV3IGIpZS5wdXNoKGQpO1AuZW51bUVycm9yUHJvcHM9YmEuY2FsbChkYSxcIm1lc3NhZ2VcIil8fGJhLmNhbGwoZGEsXCJuYW1lXCIpO1AuZW51bVByb3RvdHlwZXM9YmEuY2FsbChiLFwicHJvdG90eXBlXCIpO1Aubm9uRW51bVNoYWRvd3M9IS92YWx1ZU9mLy50ZXN0KGUpO1Auc3BsaWNlT2JqZWN0cz0oUWEuY2FsbChjLDAsMSksIWNbMF0pO1AudW5pbmRleGVkQ2hhcnM9XCJ4eFwiIT1cInhcIlswXStcbk9iamVjdChcInhcIilbMF19KSgxLDApO3ZhciBaYT1mdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oYixjLGUpe3ZhciBkPXooYik7ZT1lKGIpO2Zvcih2YXIgZj1lLmxlbmd0aCxoPWE/ZjotMTthP2gtLTorK2g8Zjspe3ZhciBnPWVbaF07aWYoZmFsc2U9PT1jKGRbZ10sZyxkKSlicmVha31yZXR1cm4gYn19KCksbWE9Q2EoXCJsZW5ndGhcIikseT1zYnx8ZnVuY3Rpb24oYSl7cmV0dXJuIEIoYSkmJkUoYS5sZW5ndGgpJiZBLmNhbGwoYSk9PUZ9LHFhPWZ1bmN0aW9uKGEpe3JldHVybiBvYShmdW5jdGlvbihiLGMpe3ZhciBlPS0xLGQ9bnVsbD09Yj8wOmMubGVuZ3RoLGY9MjxkP2NbZC0yXTpwLGg9MjxkP2NbMl06cCxnPTE8ZD9jW2QtMV06cDt0eXBlb2YgZj09XCJmdW5jdGlvblwiPyhmPXVhKGYsZyw1KSxkLT0yKTooZj10eXBlb2YgZz09XCJmdW5jdGlvblwiP2c6cCxkLT1mPzE6MCk7aCYmSWEoY1swXSxjWzFdLGgpJiYoZj0zPmQ/cDpmLGQ9MSk7Zm9yKDsrK2U8ZDspKGg9Y1tlXSkmJmEoYixoLFxuZik7cmV0dXJuIGJ9KX0oZnVuY3Rpb24oYSxiLGMpe2lmKGMpZm9yKHZhciBlPS0xLGQ9QyhiKSxmPWQubGVuZ3RoOysrZTxmOyl7dmFyIGg9ZFtlXSxnPWFbaF0sbD1jKGcsYltoXSxoLGEsYik7KGw9PT1sP2w9PT1nOmchPT1nKSYmKGchPT1wfHxoIGluIGEpfHwoYVtoXT1sKX1lbHNlIGE9c2EoYSxiKTtyZXR1cm4gYX0pLHRiPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG9hKGZ1bmN0aW9uKGMpe3ZhciBlPWNbMF07aWYobnVsbD09ZSlyZXR1cm4gZTtjLnB1c2goYik7cmV0dXJuIGEuYXBwbHkocCxjKX0pfShxYSxmdW5jdGlvbihhLGIpe3JldHVybiBhPT09cD9iOmF9KSxDPVJhP2Z1bmN0aW9uKGEpe3ZhciBiPW51bGw9PWE/cDphLmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2YgYj09XCJmdW5jdGlvblwiJiZiLnByb3RvdHlwZT09PWF8fCh0eXBlb2YgYT09XCJmdW5jdGlvblwiP24uc3VwcG9ydC5lbnVtUHJvdG90eXBlczpudWxsIT1hJiZFKG1hKGEpKSk/SmEoYSk6dihhKT9SYShhKTpbXX06XG5KYTtuLmFzc2lnbj1xYTtuLmNhbGxiYWNrPWVhO24uZGVmYXVsdHM9dGI7bi5rZXlzPUM7bi5rZXlzSW49S2E7bi5tYXRjaGVzPU9hO24ucGFpcnM9RWE7bi5wcm9wZXJ0eT13YTtuLnJlbW92ZT1mdW5jdGlvbihhLGIsYyl7dmFyIGU9W107aWYoIWF8fCFhLmxlbmd0aClyZXR1cm4gZTt2YXIgZD0tMSxmPVtdLGg9YS5sZW5ndGgsZz1uLmNhbGxiYWNrfHxlYSxnPWc9PT1lYT90YTpnO2ZvcihiPWcoYixjLDMpOysrZDxoOyljPWFbZF0sYihjLGQsYSkmJihlLnB1c2goYyksZi5wdXNoKGQpKTtmb3IoYj1hP2YubGVuZ3RoOjA7Yi0tOylpZihkPWZbYl0sZCE9bCYmJChkKSl7dmFyIGw9ZDtRYS5jYWxsKGEsZCwxKX1yZXR1cm4gZX07bi5yZXN0UGFyYW09b2E7bi5leHRlbmQ9cWE7bi5pdGVyYXRlZT1lYTtuLmlkZW50aXR5PWhhO24uaXNBcmd1bWVudHM9bmE7bi5pc0FycmF5PXk7bi5pc0Z1bmN0aW9uPWNhO24uaXNOYXRpdmU9R2E7bi5pc09iamVjdD12O24uaXNTdHJpbmc9YWE7bi5pc1R5cGVkQXJyYXk9XG5qYTtuLmxhc3Q9QmE7bi5WRVJTSU9OPVwiMy4xMC4wXCI7Z2EmJk8mJnFiJiYoKE8uZXhwb3J0cz1uKS5fPW4pfS5jYWxsKHRoaXMpKTsiLCIvLyAgICAgdXVpZC5qc1xuLy9cbi8vICAgICBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMiBSb2JlcnQgS2llZmZlclxuLy8gICAgIE1JVCBMaWNlbnNlIC0gaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2xvYmFsID0gdGhpcztcblxuICAvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgV2UgZmVhdHVyZVxuICAvLyBkZXRlY3QgdG8gZGV0ZXJtaW5lIHRoZSBiZXN0IFJORyBzb3VyY2UsIG5vcm1hbGl6aW5nIHRvIGEgZnVuY3Rpb24gdGhhdFxuICAvLyByZXR1cm5zIDEyOC1iaXRzIG9mIHJhbmRvbW5lc3MsIHNpbmNlIHRoYXQncyB3aGF0J3MgdXN1YWxseSByZXF1aXJlZFxuICB2YXIgX3JuZztcblxuICAvLyBOb2RlLmpzIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vbm9kZWpzLm9yZy9kb2NzL3YwLjYuMi9hcGkvY3J5cHRvLmh0bWxcbiAgLy9cbiAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgaWYgKHR5cGVvZihfZ2xvYmFsLnJlcXVpcmUpID09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIF9yYiA9IF9nbG9iYWwucmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXM7XG4gICAgICBfcm5nID0gX3JiICYmIGZ1bmN0aW9uKCkge3JldHVybiBfcmIoMTYpO307XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFfcm5nICYmIF9nbG9iYWwuY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBXSEFUV0cgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9DcnlwdG9cbiAgICAvL1xuICAgIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gICAgdmFyIF9ybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhfcm5kczgpO1xuICAgICAgcmV0dXJuIF9ybmRzODtcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFfcm5nKSB7XG4gICAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAgIC8vXG4gICAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgICAvLyBxdWFsaXR5LlxuICAgIHZhciAgX3JuZHMgPSBuZXcgQXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgICAgX3JuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfcm5kcztcbiAgICB9O1xuICB9XG5cbiAgLy8gQnVmZmVyIGNsYXNzIHRvIHVzZVxuICB2YXIgQnVmZmVyQ2xhc3MgPSB0eXBlb2YoX2dsb2JhbC5CdWZmZXIpID09ICdmdW5jdGlvbicgPyBfZ2xvYmFsLkJ1ZmZlciA6IEFycmF5O1xuXG4gIC8vIE1hcHMgZm9yIG51bWJlciA8LT4gaGV4IHN0cmluZyBjb252ZXJzaW9uXG4gIHZhciBfYnl0ZVRvSGV4ID0gW107XG4gIHZhciBfaGV4VG9CeXRlID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICBfYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbiAgICBfaGV4VG9CeXRlW19ieXRlVG9IZXhbaV1dID0gaTtcbiAgfVxuXG4gIC8vICoqYHBhcnNlKClgIC0gUGFyc2UgYSBVVUlEIGludG8gaXQncyBjb21wb25lbnQgYnl0ZXMqKlxuICBmdW5jdGlvbiBwYXJzZShzLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gKGJ1ZiAmJiBvZmZzZXQpIHx8IDAsIGlpID0gMDtcblxuICAgIGJ1ZiA9IGJ1ZiB8fCBbXTtcbiAgICBzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgZnVuY3Rpb24ob2N0KSB7XG4gICAgICBpZiAoaWkgPCAxNikgeyAvLyBEb24ndCBvdmVyZmxvdyFcbiAgICAgICAgYnVmW2kgKyBpaSsrXSA9IF9oZXhUb0J5dGVbb2N0XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFplcm8gb3V0IHJlbWFpbmluZyBieXRlcyBpZiBzdHJpbmcgd2FzIHNob3J0XG4gICAgd2hpbGUgKGlpIDwgMTYpIHtcbiAgICAgIGJ1ZltpICsgaWkrK10gPSAwO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICAvLyAqKmB1bnBhcnNlKClgIC0gQ29udmVydCBVVUlEIGJ5dGUgYXJyYXkgKGFsYSBwYXJzZSgpKSBpbnRvIGEgc3RyaW5nKipcbiAgZnVuY3Rpb24gdW5wYXJzZShidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gb2Zmc2V0IHx8IDAsIGJ0aCA9IF9ieXRlVG9IZXg7XG4gICAgcmV0dXJuICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbiAgfVxuXG4gIC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbiAgLy9cbiAgLy8gSW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL0xpb3NLL1VVSUQuanNcbiAgLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxuICAvLyByYW5kb20gIydzIHdlIG5lZWQgdG8gaW5pdCBub2RlIGFuZCBjbG9ja3NlcVxuICB2YXIgX3NlZWRCeXRlcyA9IF9ybmcoKTtcblxuICAvLyBQZXIgNC41LCBjcmVhdGUgYW5kIDQ4LWJpdCBub2RlIGlkLCAoNDcgcmFuZG9tIGJpdHMgKyBtdWx0aWNhc3QgYml0ID0gMSlcbiAgdmFyIF9ub2RlSWQgPSBbXG4gICAgX3NlZWRCeXRlc1swXSB8IDB4MDEsXG4gICAgX3NlZWRCeXRlc1sxXSwgX3NlZWRCeXRlc1syXSwgX3NlZWRCeXRlc1szXSwgX3NlZWRCeXRlc1s0XSwgX3NlZWRCeXRlc1s1XVxuICBdO1xuXG4gIC8vIFBlciA0LjIuMiwgcmFuZG9taXplICgxNCBiaXQpIGNsb2Nrc2VxXG4gIHZhciBfY2xvY2tzZXEgPSAoX3NlZWRCeXRlc1s2XSA8PCA4IHwgX3NlZWRCeXRlc1s3XSkgJiAweDNmZmY7XG5cbiAgLy8gUHJldmlvdXMgdXVpZCBjcmVhdGlvbiB0aW1lXG4gIHZhciBfbGFzdE1TZWNzID0gMCwgX2xhc3ROU2VjcyA9IDA7XG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2MShvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuICAgIHZhciBiID0gYnVmIHx8IFtdO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9IG51bGwgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxO1xuXG4gICAgLy8gVVVJRCB0aW1lc3RhbXBzIGFyZSAxMDAgbmFuby1zZWNvbmQgdW5pdHMgc2luY2UgdGhlIEdyZWdvcmlhbiBlcG9jaCxcbiAgICAvLyAoMTU4Mi0xMC0xNSAwMDowMCkuICBKU051bWJlcnMgYXJlbid0IHByZWNpc2UgZW5vdWdoIGZvciB0aGlzLCBzb1xuICAgIC8vIHRpbWUgaXMgaGFuZGxlZCBpbnRlcm5hbGx5IGFzICdtc2VjcycgKGludGVnZXIgbWlsbGlzZWNvbmRzKSBhbmQgJ25zZWNzJ1xuICAgIC8vICgxMDAtbmFub3NlY29uZHMgb2Zmc2V0IGZyb20gbXNlY3MpIHNpbmNlIHVuaXggZXBvY2gsIDE5NzAtMDEtMDEgMDA6MDAuXG4gICAgdmFyIG1zZWNzID0gb3B0aW9ucy5tc2VjcyAhPSBudWxsID8gb3B0aW9ucy5tc2VjcyA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIHVzZSBjb3VudCBvZiB1dWlkJ3MgZ2VuZXJhdGVkIGR1cmluZyB0aGUgY3VycmVudCBjbG9ja1xuICAgIC8vIGN5Y2xlIHRvIHNpbXVsYXRlIGhpZ2hlciByZXNvbHV0aW9uIGNsb2NrXG4gICAgdmFyIG5zZWNzID0gb3B0aW9ucy5uc2VjcyAhPSBudWxsID8gb3B0aW9ucy5uc2VjcyA6IF9sYXN0TlNlY3MgKyAxO1xuXG4gICAgLy8gVGltZSBzaW5jZSBsYXN0IHV1aWQgY3JlYXRpb24gKGluIG1zZWNzKVxuICAgIHZhciBkdCA9IChtc2VjcyAtIF9sYXN0TVNlY3MpICsgKG5zZWNzIC0gX2xhc3ROU2VjcykvMTAwMDA7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG4gICAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09IG51bGwpIHtcbiAgICAgIGNsb2Nrc2VxID0gY2xvY2tzZXEgKyAxICYgMHgzZmZmO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IG5zZWNzIGlmIGNsb2NrIHJlZ3Jlc3NlcyAobmV3IGNsb2Nrc2VxKSBvciB3ZSd2ZSBtb3ZlZCBvbnRvIGEgbmV3XG4gICAgLy8gdGltZSBpbnRlcnZhbFxuICAgIGlmICgoZHQgPCAwIHx8IG1zZWNzID4gX2xhc3RNU2VjcykgJiYgb3B0aW9ucy5uc2VjcyA9PSBudWxsKSB7XG4gICAgICBuc2VjcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gUGVyIDQuMi4xLjIgVGhyb3cgZXJyb3IgaWYgdG9vIG1hbnkgdXVpZHMgYXJlIHJlcXVlc3RlZFxuICAgIGlmIChuc2VjcyA+PSAxMDAwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1dWlkLnYxKCk6IENhblxcJ3QgY3JlYXRlIG1vcmUgdGhhbiAxME0gdXVpZHMvc2VjJyk7XG4gICAgfVxuXG4gICAgX2xhc3RNU2VjcyA9IG1zZWNzO1xuICAgIF9sYXN0TlNlY3MgPSBuc2VjcztcbiAgICBfY2xvY2tzZXEgPSBjbG9ja3NlcTtcblxuICAgIC8vIFBlciA0LjEuNCAtIENvbnZlcnQgZnJvbSB1bml4IGVwb2NoIHRvIEdyZWdvcmlhbiBlcG9jaFxuICAgIG1zZWNzICs9IDEyMjE5MjkyODAwMDAwO1xuXG4gICAgLy8gYHRpbWVfbG93YFxuICAgIHZhciB0bCA9ICgobXNlY3MgJiAweGZmZmZmZmYpICogMTAwMDAgKyBuc2VjcykgJSAweDEwMDAwMDAwMDtcbiAgICBiW2krK10gPSB0bCA+Pj4gMjQgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX21pZGBcbiAgICB2YXIgdG1oID0gKG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCkgJiAweGZmZmZmZmY7XG4gICAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bWggJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcbiAgICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG4gICAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcbiAgICBiW2krK10gPSBjbG9ja3NlcSA+Pj4gOCB8IDB4ODA7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2xvd2BcbiAgICBiW2krK10gPSBjbG9ja3NlcSAmIDB4ZmY7XG5cbiAgICAvLyBgbm9kZWBcbiAgICB2YXIgbm9kZSA9IG9wdGlvbnMubm9kZSB8fCBfbm9kZUlkO1xuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgNjsgbisrKSB7XG4gICAgICBiW2kgKyBuXSA9IG5vZGVbbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiA/IGJ1ZiA6IHVucGFyc2UoYik7XG4gIH1cblxuICAvLyAqKmB2NCgpYCAtIEdlbmVyYXRlIHJhbmRvbSBVVUlEKipcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgLy8gRGVwcmVjYXRlZCAtICdmb3JtYXQnIGFyZ3VtZW50LCBhcyBzdXBwb3J0ZWQgaW4gdjEuMlxuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gICAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgICAgYnVmID0gb3B0aW9ucyA9PSAnYmluYXJ5JyA/IG5ldyBCdWZmZXJDbGFzcygxNikgOiBudWxsO1xuICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgX3JuZykoKTtcblxuICAgIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gICAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gICAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gICAgaWYgKGJ1Zikge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyBpaSsrKSB7XG4gICAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiB8fCB1bnBhcnNlKHJuZHMpO1xuICB9XG5cbiAgLy8gRXhwb3J0IHB1YmxpYyBBUElcbiAgdmFyIHV1aWQgPSB2NDtcbiAgdXVpZC52MSA9IHYxO1xuICB1dWlkLnY0ID0gdjQ7XG4gIHV1aWQucGFyc2UgPSBwYXJzZTtcbiAgdXVpZC51bnBhcnNlID0gdW5wYXJzZTtcbiAgdXVpZC5CdWZmZXJDbGFzcyA9IEJ1ZmZlckNsYXNzO1xuXG4gIGlmICh0eXBlb2YobW9kdWxlKSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIFB1Ymxpc2ggYXMgbm9kZS5qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG4gIH0gZWxzZSAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIFB1Ymxpc2ggYXMgQU1EIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gdXVpZDt9KTtcbiBcblxuICB9IGVsc2Uge1xuICAgIC8vIFB1Ymxpc2ggYXMgZ2xvYmFsIChpbiBicm93c2VycylcbiAgICB2YXIgX3ByZXZpb3VzUm9vdCA9IF9nbG9iYWwudXVpZDtcblxuICAgIC8vICoqYG5vQ29uZmxpY3QoKWAgLSAoYnJvd3NlciBvbmx5KSB0byByZXNldCBnbG9iYWwgJ3V1aWQnIHZhcioqXG4gICAgdXVpZC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBfZ2xvYmFsLnV1aWQgPSBfcHJldmlvdXNSb290O1xuICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfTtcblxuICAgIF9nbG9iYWwudXVpZCA9IHV1aWQ7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBNYXJjdXMgV2VzdGluICovXG4oZnVuY3Rpb24oZSl7ZnVuY3Rpb24gbygpe3RyeXtyZXR1cm4gciBpbiBlJiZlW3JdfWNhdGNoKHQpe3JldHVybiExfX12YXIgdD17fSxuPWUuZG9jdW1lbnQscj1cImxvY2FsU3RvcmFnZVwiLGk9XCJzY3JpcHRcIixzO3QuZGlzYWJsZWQ9ITEsdC52ZXJzaW9uPVwiMS4zLjE3XCIsdC5zZXQ9ZnVuY3Rpb24oZSx0KXt9LHQuZ2V0PWZ1bmN0aW9uKGUsdCl7fSx0Lmhhcz1mdW5jdGlvbihlKXtyZXR1cm4gdC5nZXQoZSkhPT11bmRlZmluZWR9LHQucmVtb3ZlPWZ1bmN0aW9uKGUpe30sdC5jbGVhcj1mdW5jdGlvbigpe30sdC50cmFuc2FjdD1mdW5jdGlvbihlLG4scil7cj09bnVsbCYmKHI9bixuPW51bGwpLG49PW51bGwmJihuPXt9KTt2YXIgaT10LmdldChlLG4pO3IoaSksdC5zZXQoZSxpKX0sdC5nZXRBbGw9ZnVuY3Rpb24oKXt9LHQuZm9yRWFjaD1mdW5jdGlvbigpe30sdC5zZXJpYWxpemU9ZnVuY3Rpb24oZSl7cmV0dXJuIEpTT04uc3RyaW5naWZ5KGUpfSx0LmRlc2VyaWFsaXplPWZ1bmN0aW9uKGUpe2lmKHR5cGVvZiBlIT1cInN0cmluZ1wiKXJldHVybiB1bmRlZmluZWQ7dHJ5e3JldHVybiBKU09OLnBhcnNlKGUpfWNhdGNoKHQpe3JldHVybiBlfHx1bmRlZmluZWR9fTtpZihvKCkpcz1lW3JdLHQuc2V0PWZ1bmN0aW9uKGUsbil7cmV0dXJuIG49PT11bmRlZmluZWQ/dC5yZW1vdmUoZSk6KHMuc2V0SXRlbShlLHQuc2VyaWFsaXplKG4pKSxuKX0sdC5nZXQ9ZnVuY3Rpb24oZSxuKXt2YXIgcj10LmRlc2VyaWFsaXplKHMuZ2V0SXRlbShlKSk7cmV0dXJuIHI9PT11bmRlZmluZWQ/bjpyfSx0LnJlbW92ZT1mdW5jdGlvbihlKXtzLnJlbW92ZUl0ZW0oZSl9LHQuY2xlYXI9ZnVuY3Rpb24oKXtzLmNsZWFyKCl9LHQuZ2V0QWxsPWZ1bmN0aW9uKCl7dmFyIGU9e307cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0LG4pe2VbdF09bn0pLGV9LHQuZm9yRWFjaD1mdW5jdGlvbihlKXtmb3IodmFyIG49MDtuPHMubGVuZ3RoO24rKyl7dmFyIHI9cy5rZXkobik7ZShyLHQuZ2V0KHIpKX19O2Vsc2UgaWYobi5kb2N1bWVudEVsZW1lbnQuYWRkQmVoYXZpb3Ipe3ZhciB1LGE7dHJ5e2E9bmV3IEFjdGl2ZVhPYmplY3QoXCJodG1sZmlsZVwiKSxhLm9wZW4oKSxhLndyaXRlKFwiPFwiK2krXCI+ZG9jdW1lbnQudz13aW5kb3c8L1wiK2krJz48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpLGEuY2xvc2UoKSx1PWEudy5mcmFtZXNbMF0uZG9jdW1lbnQscz11LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIil9Y2F0Y2goZil7cz1uLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdT1uLmJvZHl9dmFyIGw9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIG49QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDApO24udW5zaGlmdChzKSx1LmFwcGVuZENoaWxkKHMpLHMuYWRkQmVoYXZpb3IoXCIjZGVmYXVsdCN1c2VyRGF0YVwiKSxzLmxvYWQocik7dmFyIGk9ZS5hcHBseSh0LG4pO3JldHVybiB1LnJlbW92ZUNoaWxkKHMpLGl9fSxjPW5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIixcImdcIik7ZnVuY3Rpb24gaChlKXtyZXR1cm4gZS5yZXBsYWNlKC9eZC8sXCJfX18kJlwiKS5yZXBsYWNlKGMsXCJfX19cIil9dC5zZXQ9bChmdW5jdGlvbihlLG4saSl7cmV0dXJuIG49aChuKSxpPT09dW5kZWZpbmVkP3QucmVtb3ZlKG4pOihlLnNldEF0dHJpYnV0ZShuLHQuc2VyaWFsaXplKGkpKSxlLnNhdmUociksaSl9KSx0LmdldD1sKGZ1bmN0aW9uKGUsbixyKXtuPWgobik7dmFyIGk9dC5kZXNlcmlhbGl6ZShlLmdldEF0dHJpYnV0ZShuKSk7cmV0dXJuIGk9PT11bmRlZmluZWQ/cjppfSksdC5yZW1vdmU9bChmdW5jdGlvbihlLHQpe3Q9aCh0KSxlLnJlbW92ZUF0dHJpYnV0ZSh0KSxlLnNhdmUocil9KSx0LmNsZWFyPWwoZnVuY3Rpb24oZSl7dmFyIHQ9ZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlcztlLmxvYWQocik7Zm9yKHZhciBuPTAsaTtpPXRbbl07bisrKWUucmVtb3ZlQXR0cmlidXRlKGkubmFtZSk7ZS5zYXZlKHIpfSksdC5nZXRBbGw9ZnVuY3Rpb24oZSl7dmFyIG49e307cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbihlLHQpe25bZV09dH0pLG59LHQuZm9yRWFjaD1sKGZ1bmN0aW9uKGUsbil7dmFyIHI9ZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlcztmb3IodmFyIGk9MCxzO3M9cltpXTsrK2kpbihzLm5hbWUsdC5kZXNlcmlhbGl6ZShlLmdldEF0dHJpYnV0ZShzLm5hbWUpKSl9KX10cnl7dmFyIHA9XCJfX3N0b3JlanNfX1wiO3Quc2V0KHAscCksdC5nZXQocCkhPXAmJih0LmRpc2FibGVkPSEwKSx0LnJlbW92ZShwKX1jYXRjaChmKXt0LmRpc2FibGVkPSEwfXQuZW5hYmxlZD0hdC5kaXNhYmxlZCx0eXBlb2YgbW9kdWxlIT1cInVuZGVmaW5lZFwiJiZtb2R1bGUuZXhwb3J0cyYmdGhpcy5tb2R1bGUhPT1tb2R1bGU/bW9kdWxlLmV4cG9ydHM9dDp0eXBlb2YgZGVmaW5lPT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQ/ZGVmaW5lKHQpOmUuc3RvcmU9dH0pKEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSkiLCJzdG9yZSA9IHJlcXVpcmUoJ3N0b3JlJylcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgc3RvcmUuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgdGhyb3cgJ2xvY2FsIHN0b3JhZ2Ugbm90IHN1cHBvcnRlZCcgdW5sZXNzIHN0b3JlLmVuYWJsZWRcbiAgICBAc3RvcmFnZSA9IHN0b3JlLmdldChAbmFtZXNwYWNlKSB8fCB7fVxuICBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgIEBzdG9yYWdlW2tleV0gPSB2YWx1ZVxuICAgIHN0b3JlLnNldChAbmFtZXNwYWNlLCBAc3RvcmFnZSlcbiAgICByZXR1cm4gdmFsdWVcbiAgZ2V0OiAoa2V5KSAtPlxuICAgIEBzdG9yYWdlW2tleV1cbiAgICAjIHN0b3JlLmdldChcIiN7QG5hbWVzcGFjZX06I3trZXl9XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBOT1RFOiB1c2luZyBhIGN1c3RvbSBidWlsZCBvZiBsb2Rhc2gsIHRvIHNhdmUgc3BhY2Vcbl8gPSByZXF1aXJlKCdsb2Rhc2guY3VzdG9tJylcbnV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAcmVtb3ZlOiBfLnJlbW92ZVxuICBAc2V0X2RlYnVnOiAoQGRlYnVnKSAtPlxuICBAbG9nOiAobWVzc2FnZSkgLT5cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKSBpZiBAZGVidWdcbiAgQHV1aWQ6IHV1aWQudjRcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIl19
