(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Adapters, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

utils = require('./utils.js.coffee');

Adapters = (function() {
  function Adapters() {}

  Adapters.PersistentQueueGoogleAnalyticsAdapter = (function() {
    PersistentQueueGoogleAnalyticsAdapter.prototype.namespace = 'alephbet';

    PersistentQueueGoogleAnalyticsAdapter.prototype.queue_name = '_ga_queue';

    function PersistentQueueGoogleAnalyticsAdapter(storage) {
      if (storage == null) {
        storage = AlephBet.LocalStorageAdapter;
      }
      this.goal_complete = bind(this.goal_complete, this);
      this.experiment_start = bind(this.experiment_start, this);
      this.log = AlephBet.log;
      this._storage = storage;
      this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');
      this._flush();
    }

    PersistentQueueGoogleAnalyticsAdapter.prototype._remove_uuid = function(uuid) {
      return (function(_this) {
        return function() {
          utils.remove(_this._queue, function(el) {
            return el.uuid === uuid;
          });
          return _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
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
          'hitCallback': callback,
          'nonInteraction': 1
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
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
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

  Adapters.PersistentQueueKeenAdapter = (function() {
    PersistentQueueKeenAdapter.prototype.queue_name = '_keen_queue';

    function PersistentQueueKeenAdapter(keen_client, storage) {
      if (storage == null) {
        storage = AlephBet.LocalStorageAdapter;
      }
      this.goal_complete = bind(this.goal_complete, this);
      this.experiment_start = bind(this.experiment_start, this);
      this.log = AlephBet.log;
      this.client = keen_client;
      this._storage = storage;
      this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');
      this._flush();
    }

    PersistentQueueKeenAdapter.prototype._remove_uuid = function(uuid) {
      return (function(_this) {
        return function(err, res) {
          if (err) {
            return;
          }
          utils.remove(_this._queue, function(el) {
            return el.properties.uuid === uuid;
          });
          return _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
        };
      })(this);
    };

    PersistentQueueKeenAdapter.prototype._flush = function() {
      var callback, i, item, len, ref, results;
      ref = this._queue;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        callback = this._remove_uuid(item.properties.uuid);
        results.push(this.client.addEvent(item.experiment_name, item.properties, callback));
      }
      return results;
    };

    PersistentQueueKeenAdapter.prototype._track = function(experiment_name, variant, event) {
      this.log("Persistent Queue Keen track: " + experiment_name + ", " + variant + ", " + event);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        experiment_name: experiment_name,
        properties: {
          uuid: utils.uuid(),
          variant: variant,
          event: event
        }
      });
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
      return this._flush();
    };

    PersistentQueueKeenAdapter.prototype.experiment_start = function(experiment_name, variant) {
      return this._track(experiment_name, variant, 'participate');
    };

    PersistentQueueKeenAdapter.prototype.goal_complete = function(experiment_name, variant, goal) {
      return this._track(experiment_name, variant, goal);
    };

    return PersistentQueueKeenAdapter;

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

  AlephBet.utils = utils;

  AlephBet.PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter;

  AlephBet.PersistentQueueKeenAdapter = adapters.PersistentQueueKeenAdapter;

  AlephBet.GoogleUniversalAnalyticsAdapter = (function() {
    function GoogleUniversalAnalyticsAdapter() {}

    GoogleUniversalAnalyticsAdapter.namespace = 'alephbet';

    GoogleUniversalAnalyticsAdapter._track = function(category, action, label) {
      log("Google Universal Analytics track: " + category + ", " + action + ", " + label);
      if (typeof ga !== 'function') {
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
      }
      return ga('send', 'event', category, action, label, {
        'nonInteraction': 1
      });
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvYWRhcHRlcnMuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L2FsZXBoYmV0LmpzLmNvZmZlZSIsImxpYi9sb2Rhc2guY3VzdG9tLm1pbi5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXV1aWQvdXVpZC5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yZS5taW4uanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3RvcmFnZS5qcy5jb2ZmZWUiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvdXRpbHMuanMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxlQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFFRjs7O0VBRUUsUUFBQyxDQUFBO29EQUNMLFNBQUEsR0FBVzs7b0RBQ1gsVUFBQSxHQUFZOztJQUVDLCtDQUFDLE9BQUQ7O1FBQUMsVUFBVSxRQUFRLENBQUM7Ozs7TUFDL0IsSUFBQyxDQUFBLEdBQUQsR0FBTyxRQUFRLENBQUM7TUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsVUFBZixDQUFBLElBQThCLElBQXpDO01BQ1YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUpXOztvREFNYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFDLENBQUEsTUFBZCxFQUFzQixTQUFDLEVBQUQ7bUJBQVEsRUFBRSxDQUFDLElBQUgsS0FBVztVQUFuQixDQUF0QjtpQkFDQSxLQUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7O0FDREEsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0FBR0Y7RUFDUyxpQkFBQyxTQUFEO0lBQUMsSUFBQyxDQUFBLGdDQUFELFlBQVc7SUFDdkIsSUFBQSxDQUEyQyxLQUFLLENBQUMsT0FBakQ7QUFBQSxZQUFNLDhCQUFOOztJQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsU0FBWCxDQUFBLElBQXlCO0VBRnpCOztvQkFHYixHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sS0FBTjtJQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQSxDQUFULEdBQWdCO0lBQ2hCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsRUFBc0IsSUFBQyxDQUFBLE9BQXZCO0FBQ0EsV0FBTztFQUhKOztvQkFJTCxHQUFBLEdBQUssU0FBQyxHQUFEO1dBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxHQUFBO0VBRE47Ozs7OztBQUlQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDZGpCLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxlQUFSOztBQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUjs7QUFFRDs7O0VBQ0osS0FBQyxDQUFBLFFBQUQsR0FBVyxDQUFDLENBQUM7O0VBQ2IsS0FBQyxDQUFBLElBQUQsR0FBTyxDQUFDLENBQUM7O0VBQ1QsS0FBQyxDQUFBLE1BQUQsR0FBUyxDQUFDLENBQUM7O0VBQ1gsS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLEtBQUQ7SUFBQyxJQUFDLENBQUEsUUFBRDtFQUFEOztFQUNaLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxPQUFEO0lBQ0osSUFBd0IsSUFBQyxDQUFBLEtBQXpCO2FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQUE7O0VBREk7O0VBRU4sS0FBQyxDQUFBLElBQUQsR0FBTyxJQUFJLENBQUM7Ozs7OztBQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcy5jb2ZmZWUnKVxuXG5jbGFzcyBBZGFwdGVyc1xuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gICAgbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgcXVldWVfbmFtZTogJ19nYV9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoc3RvcmFnZSA9IEFsZXBoQmV0LkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAbG9nID0gQWxlcGhCZXQubG9nXG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgPT5cbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIHRocm93ICdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3V1aWQoaXRlbS51dWlkKVxuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsIGl0ZW0uY2F0ZWdvcnksIGl0ZW0uYWN0aW9uLCBpdGVtLmxhYmVsLCB7J2hpdENhbGxiYWNrJzogY2FsbGJhY2ssICdub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIC0+XG4gICAgICBAbG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH1cIilcbiAgICAgIEBfcXVldWUuc2hpZnQoKSBpZiBAX3F1ZXVlLmxlbmd0aCA+IDEwMFxuICAgICAgQF9xdWV1ZS5wdXNoKHt1dWlkOiB1dGlscy51dWlkKCksIGNhdGVnb3J5OiBjYXRlZ29yeSwgYWN0aW9uOiBhY3Rpb24sIGxhYmVsOiBsYWJlbH0pXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbClcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfa2Vlbl9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoa2Vlbl9jbGllbnQsIHN0b3JhZ2UgPSBBbGVwaEJldC5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGxvZyA9IEFsZXBoQmV0LmxvZ1xuICAgICAgQGNsaWVudCA9IGtlZW5fY2xpZW50XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgKGVyciwgcmVzKSA9PlxuICAgICAgICByZXR1cm4gaWYgZXJyXG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnByb3BlcnRpZXMudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV91dWlkKGl0ZW0ucHJvcGVydGllcy51dWlkKVxuICAgICAgICBAY2xpZW50LmFkZEV2ZW50KGl0ZW0uZXhwZXJpbWVudF9uYW1lLCBpdGVtLnByb3BlcnRpZXMsIGNhbGxiYWNrKVxuXG4gICAgX3RyYWNrOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBldmVudCkgLT5cbiAgICAgIEBsb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEtlZW4gdHJhY2s6ICN7ZXhwZXJpbWVudF9uYW1lfSwgI3t2YXJpYW50fSwgI3tldmVudH1cIilcbiAgICAgIEBfcXVldWUuc2hpZnQoKSBpZiBAX3F1ZXVlLmxlbmd0aCA+IDEwMFxuICAgICAgQF9xdWV1ZS5wdXNoXG4gICAgICAgIGV4cGVyaW1lbnRfbmFtZTogZXhwZXJpbWVudF9uYW1lXG4gICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgdXVpZDogdXRpbHMudXVpZCgpXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudFxuICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgJ3BhcnRpY2lwYXRlJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbClcblxubW9kdWxlLmV4cG9ydHMgPSBBZGFwdGVyc1xuIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzLmNvZmZlZScpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzLmNvZmZlZScpXG5hZGFwdGVycyA9IHJlcXVpcmUoJy4vYWRhcHRlcnMuanMuY29mZmVlJylcblxuY2xhc3MgQWxlcGhCZXRcbiAgQG9wdGlvbnMgPSB7ZGVidWc6IGZhbHNlfVxuICBAdXRpbHMgPSB1dGlsc1xuXG4gIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuXG4gIGNsYXNzIEBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuXG4gICAgQF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgbG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHsnbm9uSW50ZXJhY3Rpb24nOiAxfSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIEBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbClcblxuICBjbGFzcyBATG9jYWxTdG9yYWdlQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcbiAgICBAc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKVxuICAgIEBnZXQ6IChrZXkpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5nZXQoa2V5KVxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBBbGVwaEJldC5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IEFsZXBoQmV0LkxvY2FsU3RvcmFnZUFkYXB0ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAb3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucylcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpXG4gICAgICBAbmFtZSA9IEBvcHRpb25zLm5hbWVcbiAgICAgIEB2YXJpYW50cyA9IEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICBAdmFyaWFudF9uYW1lcyA9IHV0aWxzLmtleXMoQHZhcmlhbnRzKVxuICAgICAgX3J1bi5jYWxsKHRoaXMpXG5cbiAgICBydW46IC0+XG4gICAgICBsb2coXCJydW5uaW5nIHdpdGggb3B0aW9uczogI3tKU09OLnN0cmluZ2lmeShAb3B0aW9ucyl9XCIpXG4gICAgICBfZm9yY2VfdmFyaWFudCgpXG4gICAgICBAYXBwbHlfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBfZm9yY2VfdmFyaWFudCA9IC0+XG4gICAgICAjIFRPRE86IGdldCB2YXJpYW50IGZyb20gVVJJXG5cbiAgICBhcHBseV92YXJpYW50OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAb3B0aW9ucy50cmlnZ2VyKClcbiAgICAgIGxvZygndHJpZ2dlciBzZXQnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaW5fc2FtcGxlKClcbiAgICAgIGxvZygnaW4gc2FtcGxlJylcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgbG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgIGVsc2VcbiAgICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgICBAdHJhY2tpbmcoKS5leHBlcmltZW50X3N0YXJ0KEBvcHRpb25zLm5hbWUsIHZhcmlhbnQpXG4gICAgICBAdmFyaWFudHNbdmFyaWFudF0/LmFjdGl2YXRlKHRoaXMpXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiLCB2YXJpYW50KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGdvYWxfbmFtZSwgcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICByZXR1cm4gaWYgcHJvcHMudW5pcXVlICYmIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIilcbiAgICAgIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgIHJldHVybiB1bmxlc3MgdmFyaWFudFxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiLCB0cnVlKSBpZiBwcm9wcy51bmlxdWVcbiAgICAgIGxvZyhcImV4cGVyaW1lbnQ6ICN7QG9wdGlvbnMubmFtZX0gdmFyaWFudDoje3ZhcmlhbnR9IGdvYWw6I3tnb2FsX25hbWV9IGNvbXBsZXRlXCIpXG4gICAgICBAdHJhY2tpbmcoKS5nb2FsX2NvbXBsZXRlKEBvcHRpb25zLm5hbWUsIHZhcmlhbnQsIGdvYWxfbmFtZSlcblxuICAgIGdldF9zdG9yZWRfdmFyaWFudDogLT5cbiAgICAgIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIpXG5cbiAgICBwaWNrX3ZhcmlhbnQ6IC0+XG4gICAgICBwYXJ0aXRpb25zID0gMS4wIC8gQHZhcmlhbnRfbmFtZXMubGVuZ3RoXG4gICAgICBjaG9zZW5fcGFydGl0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpIC8gcGFydGl0aW9ucylcbiAgICAgIHZhcmlhbnQgPSBAdmFyaWFudF9uYW1lc1tjaG9zZW5fcGFydGl0aW9uXVxuICAgICAgbG9nKFwiI3t2YXJpYW50fSBwaWNrZWRcIilcbiAgICAgIHZhcmlhbnRcblxuICAgIGluX3NhbXBsZTogLT5cbiAgICAgIGFjdGl2ZSA9IEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIilcbiAgICAgIHJldHVybiBhY3RpdmUgdW5sZXNzIHR5cGVvZiBhY3RpdmUgaXMgJ3VuZGVmaW5lZCdcbiAgICAgIGFjdGl2ZSA9IE1hdGgucmFuZG9tKCkgPD0gQG9wdGlvbnMuc2FtcGxlXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIGFjdGl2ZSlcbiAgICAgIGFjdGl2ZVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSA9PlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgYWRkX2dvYWxzOiAoZ29hbHMpID0+XG4gICAgICBAYWRkX2dvYWwoZ29hbCkgZm9yIGdvYWwgaW4gZ29hbHNcblxuICAgIHN0b3JhZ2U6IC0+IEBvcHRpb25zLnN0b3JhZ2VfYWRhcHRlclxuXG4gICAgdHJhY2tpbmc6IC0+IEBvcHRpb25zLnRyYWNraW5nX2FkYXB0ZXJcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyAnYW4gZXhwZXJpbWVudCBuYW1lIG11c3QgYmUgc3BlY2lmaWVkJyBpZiBAb3B0aW9ucy5uYW1lIGlzIG51bGxcbiAgICAgIHRocm93ICd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJyBpZiBAb3B0aW9ucy52YXJpYW50cyBpcyBudWxsXG4gICAgICB0aHJvdyAndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuXG4gIGNsYXNzIEBHb2FsXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG4gIGxvZyA9IEBsb2cgPSAobWVzc2FnZSkgPT5cbiAgICB1dGlscy5zZXRfZGVidWcoQG9wdGlvbnMuZGVidWcpXG4gICAgdXRpbHMubG9nKG1lc3NhZ2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIGxvZGFzaCAzLjEwLjAgKEN1c3RvbSBCdWlsZCkgbG9kYXNoLmNvbS9saWNlbnNlIHwgVW5kZXJzY29yZS5qcyAxLjguMyB1bmRlcnNjb3JlanMub3JnL0xJQ0VOU0VcbiAqIEJ1aWxkOiBgbG9kYXNoIGluY2x1ZGU9XCJrZXlzLGRlZmF1bHRzLHJlbW92ZVwiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9saWIvbG9kYXNoLmN1c3RvbS5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIEIoYSl7cmV0dXJuISFhJiZ0eXBlb2YgYT09XCJvYmplY3RcIn1mdW5jdGlvbiBuKCl7fWZ1bmN0aW9uIFNhKGEsYil7dmFyIGM9LTEsZT1hLmxlbmd0aDtmb3IoYnx8KGI9QXJyYXkoZSkpOysrYzxlOyliW2NdPWFbY107cmV0dXJuIGJ9ZnVuY3Rpb24gcmEoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZSYmZmFsc2UhPT1iKGFbY10sYyxhKTspO3JldHVybiBhfWZ1bmN0aW9uIFRhKGEsYil7Zm9yKHZhciBjPS0xLGU9YS5sZW5ndGg7KytjPGU7KWlmKGIoYVtjXSxjLGEpKXJldHVybiB0cnVlO3JldHVybiBmYWxzZX1mdW5jdGlvbiBzYShhLGIpe3ZhciBjO2lmKG51bGw9PWIpYz1hO2Vsc2V7Yz1DKGIpO3ZhciBlPWE7ZXx8KGU9e30pO2Zvcih2YXIgZD0tMSxmPWMubGVuZ3RoOysrZDxmOyl7dmFyIGg9Y1tkXTtlW2hdPWJbaF19Yz1lfXJldHVybiBjfWZ1bmN0aW9uIHRhKGEsYixjKXt2YXIgZT10eXBlb2YgYTtyZXR1cm5cImZ1bmN0aW9uXCI9PVxuZT9iPT09cD9hOnVhKGEsYixjKTpudWxsPT1hP2hhOlwib2JqZWN0XCI9PWU/dmEoYSk6Yj09PXA/d2EoYSk6VWEoYSxiKX1mdW5jdGlvbiB4YShhLGIsYyxlLGQsZixoKXt2YXIgZztjJiYoZz1kP2MoYSxlLGQpOmMoYSkpO2lmKGchPT1wKXJldHVybiBnO2lmKCF2KGEpKXJldHVybiBhO2lmKGU9eShhKSl7aWYoZz1WYShhKSwhYilyZXR1cm4gU2EoYSxnKX1lbHNle3ZhciBsPUEuY2FsbChhKSxtPWw9PUg7aWYobD09dHx8bD09SXx8bSYmIWQpe2lmKFEoYSkpcmV0dXJuIGQ/YTp7fTtnPVdhKG0/e306YSk7aWYoIWIpcmV0dXJuIHNhKGcsYSl9ZWxzZSByZXR1cm4gcVtsXT9YYShhLGwsYik6ZD9hOnt9fWZ8fChmPVtdKTtofHwoaD1bXSk7Zm9yKGQ9Zi5sZW5ndGg7ZC0tOylpZihmW2RdPT1hKXJldHVybiBoW2RdO2YucHVzaChhKTtoLnB1c2goZyk7KGU/cmE6WWEpKGEsZnVuY3Rpb24oZCxlKXtnW2VdPXhhKGQsYixjLGUsYSxmLGgpfSk7cmV0dXJuIGd9ZnVuY3Rpb24gWWEoYSxiKXtyZXR1cm4gWmEoYSxcbmIsQyl9ZnVuY3Rpb24geWEoYSxiLGMpe2lmKG51bGwhPWEpe2E9eihhKTtjIT09cCYmYyBpbiBhJiYoYj1bY10pO2M9MDtmb3IodmFyIGU9Yi5sZW5ndGg7bnVsbCE9YSYmYzxlOylhPXooYSlbYltjKytdXTtyZXR1cm4gYyYmYz09ZT9hOnB9fWZ1bmN0aW9uIGlhKGEsYixjLGUsZCxmKXtpZihhPT09YilhPXRydWU7ZWxzZSBpZihudWxsPT1hfHxudWxsPT1ifHwhdihhKSYmIUIoYikpYT1hIT09YSYmYiE9PWI7ZWxzZSBhOnt2YXIgaD1pYSxnPXkoYSksbD15KGIpLG09RixrPUY7Z3x8KG09QS5jYWxsKGEpLG09PUk/bT10Om0hPXQmJihnPWphKGEpKSk7bHx8KGs9QS5jYWxsKGIpLGs9PUk/az10OmshPXQmJmphKGIpKTt2YXIgcD1tPT10JiYhUShhKSxsPWs9PXQmJiFRKGIpLGs9bT09aztpZigha3x8Z3x8cCl7aWYoIWUmJihtPXAmJnUuY2FsbChhLFwiX193cmFwcGVkX19cIiksbD1sJiZ1LmNhbGwoYixcIl9fd3JhcHBlZF9fXCIpLG18fGwpKXthPWgobT9hLnZhbHVlKCk6YSxsP2IudmFsdWUoKTpcbmIsYyxlLGQsZik7YnJlYWsgYX1pZihrKXtkfHwoZD1bXSk7Znx8KGY9W10pO2ZvcihtPWQubGVuZ3RoO20tLTspaWYoZFttXT09YSl7YT1mW21dPT1iO2JyZWFrIGF9ZC5wdXNoKGEpO2YucHVzaChiKTthPShnPyRhOmFiKShhLGIsaCxjLGUsZCxmKTtkLnBvcCgpO2YucG9wKCl9ZWxzZSBhPWZhbHNlfWVsc2UgYT1iYihhLGIsbSl9cmV0dXJuIGF9ZnVuY3Rpb24gY2IoYSxiKXt2YXIgYz1iLmxlbmd0aCxlPWM7aWYobnVsbD09YSlyZXR1cm4hZTtmb3IoYT16KGEpO2MtLTspe3ZhciBkPWJbY107aWYoZFsyXT9kWzFdIT09YVtkWzBdXTohKGRbMF1pbiBhKSlyZXR1cm4gZmFsc2V9Zm9yKDsrK2M8ZTspe3ZhciBkPWJbY10sZj1kWzBdLGg9YVtmXSxnPWRbMV07aWYoZFsyXSl7aWYoaD09PXAmJiEoZiBpbiBhKSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihkPXAsZD09PXA/IWlhKGcsaCx2b2lkIDAsdHJ1ZSk6IWQpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIHZhKGEpe3ZhciBiPWRiKGEpO2lmKDE9PWIubGVuZ3RoJiZcbmJbMF1bMl0pe3ZhciBjPWJbMF1bMF0sZT1iWzBdWzFdO3JldHVybiBmdW5jdGlvbihhKXtpZihudWxsPT1hKXJldHVybiBmYWxzZTthPXooYSk7cmV0dXJuIGFbY109PT1lJiYoZSE9PXB8fGMgaW4gYSl9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gY2IoYSxiKX19ZnVuY3Rpb24gVWEoYSxiKXt2YXIgYz15KGEpLGU9emEoYSkmJmI9PT1iJiYhdihiKSxkPWErXCJcIjthPUFhKGEpO3JldHVybiBmdW5jdGlvbihmKXtpZihudWxsPT1mKXJldHVybiBmYWxzZTt2YXIgaD1kO2Y9eihmKTtpZighKCFjJiZlfHxoIGluIGYpKXtpZigxIT1hLmxlbmd0aCl7dmFyIGg9YSxnPTAsbD0tMSxtPS0xLGs9aC5sZW5ndGgsZz1udWxsPT1nPzA6K2d8fDA7MD5nJiYoZz0tZz5rPzA6aytnKTtsPWw9PT1wfHxsPms/azorbHx8MDswPmwmJihsKz1rKTtrPWc+bD8wOmwtZz4+PjA7Zz4+Pj0wO2ZvcihsPUFycmF5KGspOysrbTxrOylsW21dPWhbbStnXTtmPXlhKGYsbCl9aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7aD1CYShhKTtcbmY9eihmKX1yZXR1cm4gZltoXT09PWI/YiE9PXB8fGggaW4gZjppYShiLGZbaF0scCx0cnVlKX19ZnVuY3Rpb24gQ2EoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBudWxsPT1iP3A6eihiKVthXX19ZnVuY3Rpb24gZWIoYSl7dmFyIGI9YStcIlwiO2E9QWEoYSk7cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB5YShjLGEsYil9fWZ1bmN0aW9uIHVhKGEsYixjKXtpZih0eXBlb2YgYSE9XCJmdW5jdGlvblwiKXJldHVybiBoYTtpZihiPT09cClyZXR1cm4gYTtzd2l0Y2goYyl7Y2FzZSAxOnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gYS5jYWxsKGIsYyl9O2Nhc2UgMzpyZXR1cm4gZnVuY3Rpb24oYyxkLGYpe3JldHVybiBhLmNhbGwoYixjLGQsZil9O2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgpfTtjYXNlIDU6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgsZyl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgsZyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsXG5hcmd1bWVudHMpfX1mdW5jdGlvbiBEYShhKXt2YXIgYj1uZXcgZmIoYS5ieXRlTGVuZ3RoKTsobmV3IGthKGIpKS5zZXQobmV3IGthKGEpKTtyZXR1cm4gYn1mdW5jdGlvbiAkYShhLGIsYyxlLGQsZixoKXt2YXIgZz0tMSxsPWEubGVuZ3RoLG09Yi5sZW5ndGg7aWYobCE9bSYmIShkJiZtPmwpKXJldHVybiBmYWxzZTtmb3IoOysrZzxsOyl7dmFyIGs9YVtnXSxtPWJbZ10sbj1lP2UoZD9tOmssZD9rOm0sZyk6cDtpZihuIT09cCl7aWYobiljb250aW51ZTtyZXR1cm4gZmFsc2V9aWYoZCl7aWYoIVRhKGIsZnVuY3Rpb24oYSl7cmV0dXJuIGs9PT1hfHxjKGssYSxlLGQsZixoKX0pKXJldHVybiBmYWxzZX1lbHNlIGlmKGshPT1tJiYhYyhrLG0sZSxkLGYsaCkpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIGJiKGEsYixjKXtzd2l0Y2goYyl7Y2FzZSBKOmNhc2UgSzpyZXR1cm4rYT09K2I7Y2FzZSBMOnJldHVybiBhLm5hbWU9PWIubmFtZSYmYS5tZXNzYWdlPT1iLm1lc3NhZ2U7Y2FzZSBNOnJldHVybiBhIT1cbithP2IhPStiOmE9PStiO2Nhc2UgTjpjYXNlIEQ6cmV0dXJuIGE9PWIrXCJcIn1yZXR1cm4gZmFsc2V9ZnVuY3Rpb24gYWIoYSxiLGMsZSxkLGYsaCl7dmFyIGc9QyhhKSxsPWcubGVuZ3RoLG09QyhiKS5sZW5ndGg7aWYobCE9bSYmIWQpcmV0dXJuIGZhbHNlO2ZvcihtPWw7bS0tOyl7dmFyIGs9Z1ttXTtpZighKGQ/ayBpbiBiOnUuY2FsbChiLGspKSlyZXR1cm4gZmFsc2V9Zm9yKHZhciBuPWQ7KyttPGw7KXt2YXIgaz1nW21dLHE9YVtrXSxyPWJba10scz1lP2UoZD9yOnEsZD9xOnIsayk6cDtpZihzPT09cD8hYyhxLHIsZSxkLGYsaCk6IXMpcmV0dXJuIGZhbHNlO258fChuPVwiY29uc3RydWN0b3JcIj09ayl9cmV0dXJuIG58fChjPWEuY29uc3RydWN0b3IsZT1iLmNvbnN0cnVjdG9yLCEoYyE9ZSYmXCJjb25zdHJ1Y3RvclwiaW4gYSYmXCJjb25zdHJ1Y3RvclwiaW4gYil8fHR5cGVvZiBjPT1cImZ1bmN0aW9uXCImJmMgaW5zdGFuY2VvZiBjJiZ0eXBlb2YgZT09XCJmdW5jdGlvblwiJiZlIGluc3RhbmNlb2YgZSk/dHJ1ZTpmYWxzZX1mdW5jdGlvbiBkYihhKXthPVxuRWEoYSk7Zm9yKHZhciBiPWEubGVuZ3RoO2ItLTspe3ZhciBjPWFbYl1bMV07YVtiXVsyXT1jPT09YyYmIXYoYyl9cmV0dXJuIGF9ZnVuY3Rpb24gRmEoYSxiKXt2YXIgYz1udWxsPT1hP3A6YVtiXTtyZXR1cm4gR2EoYyk/YzpwfWZ1bmN0aW9uIFZhKGEpe3ZhciBiPWEubGVuZ3RoLGM9bmV3IGEuY29uc3RydWN0b3IoYik7YiYmXCJzdHJpbmdcIj09dHlwZW9mIGFbMF0mJnUuY2FsbChhLFwiaW5kZXhcIikmJihjLmluZGV4PWEuaW5kZXgsYy5pbnB1dD1hLmlucHV0KTtyZXR1cm4gY31mdW5jdGlvbiBXYShhKXthPWEuY29uc3RydWN0b3I7dHlwZW9mIGE9PVwiZnVuY3Rpb25cIiYmYSBpbnN0YW5jZW9mIGF8fChhPU9iamVjdCk7cmV0dXJuIG5ldyBhfWZ1bmN0aW9uIFhhKGEsYixjKXt2YXIgZT1hLmNvbnN0cnVjdG9yO3N3aXRjaChiKXtjYXNlIGxhOnJldHVybiBEYShhKTtjYXNlIEo6Y2FzZSBLOnJldHVybiBuZXcgZSgrYSk7Y2FzZSBSOmNhc2UgUzpjYXNlIFQ6Y2FzZSBVOmNhc2UgVjpjYXNlIFc6Y2FzZSBYOmNhc2UgWTpjYXNlIFo6cmV0dXJuIGUgaW5zdGFuY2VvZlxuZSYmKGU9d1tiXSksYj1hLmJ1ZmZlcixuZXcgZShjP0RhKGIpOmIsYS5ieXRlT2Zmc2V0LGEubGVuZ3RoKTtjYXNlIE06Y2FzZSBEOnJldHVybiBuZXcgZShhKTtjYXNlIE46dmFyIGQ9bmV3IGUoYS5zb3VyY2UsZ2IuZXhlYyhhKSk7ZC5sYXN0SW5kZXg9YS5sYXN0SW5kZXh9cmV0dXJuIGR9ZnVuY3Rpb24gJChhLGIpe2E9dHlwZW9mIGE9PVwibnVtYmVyXCJ8fGhiLnRlc3QoYSk/K2E6LTE7Yj1udWxsPT1iP0hhOmI7cmV0dXJuLTE8YSYmMD09YSUxJiZhPGJ9ZnVuY3Rpb24gSWEoYSxiLGMpe2lmKCF2KGMpKXJldHVybiBmYWxzZTt2YXIgZT10eXBlb2YgYjtyZXR1cm4oXCJudW1iZXJcIj09ZT9udWxsIT1jJiZFKG1hKGMpKSYmJChiLGMubGVuZ3RoKTpcInN0cmluZ1wiPT1lJiZiIGluIGMpPyhiPWNbYl0sYT09PWE/YT09PWI6YiE9PWIpOmZhbHNlfWZ1bmN0aW9uIHphKGEpe3ZhciBiPXR5cGVvZiBhO3JldHVyblwic3RyaW5nXCI9PWImJmliLnRlc3QoYSl8fFwibnVtYmVyXCI9PWI/dHJ1ZTp5KGEpP2ZhbHNlOiFqYi50ZXN0KGEpfHxcbiExfWZ1bmN0aW9uIEUoYSl7cmV0dXJuIHR5cGVvZiBhPT1cIm51bWJlclwiJiYtMTxhJiYwPT1hJTEmJmE8PUhhfWZ1bmN0aW9uIEphKGEpe2Zvcih2YXIgYj1LYShhKSxjPWIubGVuZ3RoLGU9YyYmYS5sZW5ndGgsZD0hIWUmJkUoZSkmJih5KGEpfHxuYShhKXx8YWEoYSkpLGY9LTEsaD1bXTsrK2Y8Yzspe3ZhciBnPWJbZl07KGQmJiQoZyxlKXx8dS5jYWxsKGEsZykpJiZoLnB1c2goZyl9cmV0dXJuIGh9ZnVuY3Rpb24geihhKXtpZihuLnN1cHBvcnQudW5pbmRleGVkQ2hhcnMmJmFhKGEpKXtmb3IodmFyIGI9LTEsYz1hLmxlbmd0aCxlPU9iamVjdChhKTsrK2I8YzspZVtiXT1hLmNoYXJBdChiKTtyZXR1cm4gZX1yZXR1cm4gdihhKT9hOk9iamVjdChhKX1mdW5jdGlvbiBBYShhKXtpZih5KGEpKXJldHVybiBhO3ZhciBiPVtdOyhudWxsPT1hP1wiXCI6YStcIlwiKS5yZXBsYWNlKGtiLGZ1bmN0aW9uKGEsZSxkLGYpe2IucHVzaChkP2YucmVwbGFjZShsYixcIiQxXCIpOmV8fGEpfSk7cmV0dXJuIGJ9XG5mdW5jdGlvbiBCYShhKXt2YXIgYj1hP2EubGVuZ3RoOjA7cmV0dXJuIGI/YVtiLTFdOnB9ZnVuY3Rpb24gb2EoYSxiKXtpZih0eXBlb2YgYSE9XCJmdW5jdGlvblwiKXRocm93IG5ldyBUeXBlRXJyb3IobWIpO2I9TGEoYj09PXA/YS5sZW5ndGgtMTorYnx8MCwwKTtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIGM9YXJndW1lbnRzLGU9LTEsZD1MYShjLmxlbmd0aC1iLDApLGY9QXJyYXkoZCk7KytlPGQ7KWZbZV09Y1tiK2VdO3N3aXRjaChiKXtjYXNlIDA6cmV0dXJuIGEuY2FsbCh0aGlzLGYpO2Nhc2UgMTpyZXR1cm4gYS5jYWxsKHRoaXMsY1swXSxmKTtjYXNlIDI6cmV0dXJuIGEuY2FsbCh0aGlzLGNbMF0sY1sxXSxmKX1kPUFycmF5KGIrMSk7Zm9yKGU9LTE7KytlPGI7KWRbZV09Y1tlXTtkW2JdPWY7cmV0dXJuIGEuYXBwbHkodGhpcyxkKX19ZnVuY3Rpb24gbmEoYSl7cmV0dXJuIEIoYSkmJm51bGwhPWEmJkUobWEoYSkpJiZ1LmNhbGwoYSxcImNhbGxlZVwiKSYmIWJhLmNhbGwoYSxcImNhbGxlZVwiKX1cbmZ1bmN0aW9uIGNhKGEpe3JldHVybiB2KGEpJiZBLmNhbGwoYSk9PUh9ZnVuY3Rpb24gdihhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm4hIWEmJihcIm9iamVjdFwiPT1ifHxcImZ1bmN0aW9uXCI9PWIpfWZ1bmN0aW9uIEdhKGEpe3JldHVybiBudWxsPT1hP2ZhbHNlOmNhKGEpP01hLnRlc3QoTmEuY2FsbChhKSk6QihhKSYmKFEoYSk/TWE6bmIpLnRlc3QoYSl9ZnVuY3Rpb24gYWEoYSl7cmV0dXJuIHR5cGVvZiBhPT1cInN0cmluZ1wifHxCKGEpJiZBLmNhbGwoYSk9PUR9ZnVuY3Rpb24gamEoYSl7cmV0dXJuIEIoYSkmJkUoYS5sZW5ndGgpJiYhIXJbQS5jYWxsKGEpXX1mdW5jdGlvbiBLYShhKXtpZihudWxsPT1hKXJldHVybltdO3YoYSl8fChhPU9iamVjdChhKSk7Zm9yKHZhciBiPWEubGVuZ3RoLGM9bi5zdXBwb3J0LGI9YiYmRShiKSYmKHkoYSl8fG5hKGEpfHxhYShhKSkmJmJ8fDAsZT1hLmNvbnN0cnVjdG9yLGQ9LTEsZT1jYShlKSYmZS5wcm90b3R5cGV8fEcsZj1lPT09YSxoPUFycmF5KGIpLGc9XG4wPGIsbD1jLmVudW1FcnJvclByb3BzJiYoYT09PWRhfHxhIGluc3RhbmNlb2YgRXJyb3IpLG09Yy5lbnVtUHJvdG90eXBlcyYmY2EoYSk7KytkPGI7KWhbZF09ZCtcIlwiO2Zvcih2YXIgayBpbiBhKW0mJlwicHJvdG90eXBlXCI9PWt8fGwmJihcIm1lc3NhZ2VcIj09a3x8XCJuYW1lXCI9PWspfHxnJiYkKGssYil8fFwiY29uc3RydWN0b3JcIj09ayYmKGZ8fCF1LmNhbGwoYSxrKSl8fGgucHVzaChrKTtpZihjLm5vbkVudW1TaGFkb3dzJiZhIT09Rylmb3IoYj1hPT09b2I/RDphPT09ZGE/TDpBLmNhbGwoYSksYz1zW2JdfHxzW3RdLGI9PXQmJihlPUcpLGI9cGEubGVuZ3RoO2ItLTspaz1wYVtiXSxkPWNba10sZiYmZHx8KGQ/IXUuY2FsbChhLGspOmFba109PT1lW2tdKXx8aC5wdXNoKGspO3JldHVybiBofWZ1bmN0aW9uIEVhKGEpe2E9eihhKTtmb3IodmFyIGI9LTEsYz1DKGEpLGU9Yy5sZW5ndGgsZD1BcnJheShlKTsrK2I8ZTspe3ZhciBmPWNbYl07ZFtiXT1bZixhW2ZdXX1yZXR1cm4gZH1mdW5jdGlvbiBlYShhLFxuYixjKXtjJiZJYShhLGIsYykmJihiPXApO3JldHVybiBCKGEpP09hKGEpOnRhKGEsYil9ZnVuY3Rpb24gaGEoYSl7cmV0dXJuIGF9ZnVuY3Rpb24gT2EoYSl7cmV0dXJuIHZhKHhhKGEsdHJ1ZSkpfWZ1bmN0aW9uIHdhKGEpe3JldHVybiB6YShhKT9DYShhKTplYihhKX12YXIgcCxtYj1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixJPVwiW29iamVjdCBBcmd1bWVudHNdXCIsRj1cIltvYmplY3QgQXJyYXldXCIsSj1cIltvYmplY3QgQm9vbGVhbl1cIixLPVwiW29iamVjdCBEYXRlXVwiLEw9XCJbb2JqZWN0IEVycm9yXVwiLEg9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLE09XCJbb2JqZWN0IE51bWJlcl1cIix0PVwiW29iamVjdCBPYmplY3RdXCIsTj1cIltvYmplY3QgUmVnRXhwXVwiLEQ9XCJbb2JqZWN0IFN0cmluZ11cIixsYT1cIltvYmplY3QgQXJyYXlCdWZmZXJdXCIsUj1cIltvYmplY3QgRmxvYXQzMkFycmF5XVwiLFM9XCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIixUPVwiW29iamVjdCBJbnQ4QXJyYXldXCIsVT1cIltvYmplY3QgSW50MTZBcnJheV1cIixcblY9XCJbb2JqZWN0IEludDMyQXJyYXldXCIsVz1cIltvYmplY3QgVWludDhBcnJheV1cIixYPVwiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIixZPVwiW29iamVjdCBVaW50MTZBcnJheV1cIixaPVwiW29iamVjdCBVaW50MzJBcnJheV1cIixqYj0vXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXG5cXFxcXXxcXFxcLikqP1xcMSlcXF0vLGliPS9eXFx3KiQvLGtiPS9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXG5cXFxcXXxcXFxcLikqPylcXDIpXFxdL2csbGI9L1xcXFwoXFxcXCk/L2csZ2I9L1xcdyokLyxuYj0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLGhiPS9eXFxkKyQvLHBhPVwiY29uc3RydWN0b3IgaGFzT3duUHJvcGVydHkgaXNQcm90b3R5cGVPZiBwcm9wZXJ0eUlzRW51bWVyYWJsZSB0b0xvY2FsZVN0cmluZyB0b1N0cmluZyB2YWx1ZU9mXCIuc3BsaXQoXCIgXCIpLHI9e307cltSXT1yW1NdPXJbVF09cltVXT1yW1ZdPXJbV109cltYXT1yW1ldPXJbWl09dHJ1ZTtcbnJbSV09cltGXT1yW2xhXT1yW0pdPXJbS109cltMXT1yW0hdPXJbXCJbb2JqZWN0IE1hcF1cIl09cltNXT1yW3RdPXJbTl09cltcIltvYmplY3QgU2V0XVwiXT1yW0RdPXJbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBxPXt9O3FbSV09cVtGXT1xW2xhXT1xW0pdPXFbS109cVtSXT1xW1NdPXFbVF09cVtVXT1xW1ZdPXFbTV09cVt0XT1xW05dPXFbRF09cVtXXT1xW1hdPXFbWV09cVtaXT10cnVlO3FbTF09cVtIXT1xW1wiW29iamVjdCBNYXBdXCJdPXFbXCJbb2JqZWN0IFNldF1cIl09cVtcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIGZhPXtcImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0sZ2E9ZmFbdHlwZW9mIGV4cG9ydHNdJiZleHBvcnRzJiYhZXhwb3J0cy5ub2RlVHlwZSYmZXhwb3J0cyxPPWZhW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxwYj1mYVt0eXBlb2Ygc2VsZl0mJnNlbGYmJnNlbGYuT2JqZWN0JiZzZWxmLFBhPWZhW3R5cGVvZiB3aW5kb3ddJiZcbndpbmRvdyYmd2luZG93Lk9iamVjdCYmd2luZG93LHFiPU8mJk8uZXhwb3J0cz09PWdhJiZnYSx4PWdhJiZPJiZ0eXBlb2YgZ2xvYmFsPT1cIm9iamVjdFwiJiZnbG9iYWwmJmdsb2JhbC5PYmplY3QmJmdsb2JhbHx8UGEhPT0odGhpcyYmdGhpcy53aW5kb3cpJiZQYXx8cGJ8fHRoaXMsUT1mdW5jdGlvbigpe3RyeXtPYmplY3Qoe3RvU3RyaW5nOjB9K1wiXCIpfWNhdGNoKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmYWxzZX19cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiB0eXBlb2YgYS50b1N0cmluZyE9XCJmdW5jdGlvblwiJiZ0eXBlb2YoYStcIlwiKT09XCJzdHJpbmdcIn19KCkscmI9QXJyYXkucHJvdG90eXBlLGRhPUVycm9yLnByb3RvdHlwZSxHPU9iamVjdC5wcm90b3R5cGUsb2I9U3RyaW5nLnByb3RvdHlwZSxOYT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsdT1HLmhhc093blByb3BlcnR5LEE9Ry50b1N0cmluZyxNYT1SZWdFeHAoXCJeXCIrTmEuY2FsbCh1KS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcblwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIiksZmI9eC5BcnJheUJ1ZmZlcixiYT1HLnByb3BlcnR5SXNFbnVtZXJhYmxlLFFhPXJiLnNwbGljZSxrYT14LlVpbnQ4QXJyYXksc2I9RmEoQXJyYXksXCJpc0FycmF5XCIpLFJhPUZhKE9iamVjdCxcImtleXNcIiksTGE9TWF0aC5tYXgsSGE9OTAwNzE5OTI1NDc0MDk5MSx3PXt9O3dbUl09eC5GbG9hdDMyQXJyYXk7d1tTXT14LkZsb2F0NjRBcnJheTt3W1RdPXguSW50OEFycmF5O3dbVV09eC5JbnQxNkFycmF5O3dbVl09eC5JbnQzMkFycmF5O3dbV109a2E7d1tYXT14LlVpbnQ4Q2xhbXBlZEFycmF5O3dbWV09eC5VaW50MTZBcnJheTt3W1pdPXguVWludDMyQXJyYXk7dmFyIHM9e307c1tGXT1zW0tdPXNbTV09e2NvbnN0cnVjdG9yOnRydWUsdG9Mb2NhbGVTdHJpbmc6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tKXT1zW0RdPXtjb25zdHJ1Y3Rvcjp0cnVlLFxudG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9O3NbTF09c1tIXT1zW05dPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWV9O3NbdF09e2NvbnN0cnVjdG9yOnRydWV9O3JhKHBhLGZ1bmN0aW9uKGEpe2Zvcih2YXIgYiBpbiBzKWlmKHUuY2FsbChzLGIpKXt2YXIgYz1zW2JdO2NbYV09dS5jYWxsKGMsYSl9fSk7dmFyIFA9bi5zdXBwb3J0PXt9OyhmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7dGhpcy54PWF9dmFyIGM9ezA6YSxsZW5ndGg6YX0sZT1bXTtiLnByb3RvdHlwZT17dmFsdWVPZjphLHk6YX07Zm9yKHZhciBkIGluIG5ldyBiKWUucHVzaChkKTtQLmVudW1FcnJvclByb3BzPWJhLmNhbGwoZGEsXCJtZXNzYWdlXCIpfHxiYS5jYWxsKGRhLFwibmFtZVwiKTtQLmVudW1Qcm90b3R5cGVzPWJhLmNhbGwoYixcInByb3RvdHlwZVwiKTtQLm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKTtQLnNwbGljZU9iamVjdHM9KFFhLmNhbGwoYywwLDEpLCFjWzBdKTtQLnVuaW5kZXhlZENoYXJzPVwieHhcIiE9XCJ4XCJbMF0rXG5PYmplY3QoXCJ4XCIpWzBdfSkoMSwwKTt2YXIgWmE9ZnVuY3Rpb24oYSl7cmV0dXJuIGZ1bmN0aW9uKGIsYyxlKXt2YXIgZD16KGIpO2U9ZShiKTtmb3IodmFyIGY9ZS5sZW5ndGgsaD1hP2Y6LTE7YT9oLS06KytoPGY7KXt2YXIgZz1lW2hdO2lmKGZhbHNlPT09YyhkW2ddLGcsZCkpYnJlYWt9cmV0dXJuIGJ9fSgpLG1hPUNhKFwibGVuZ3RoXCIpLHk9c2J8fGZ1bmN0aW9uKGEpe3JldHVybiBCKGEpJiZFKGEubGVuZ3RoKSYmQS5jYWxsKGEpPT1GfSxxYT1mdW5jdGlvbihhKXtyZXR1cm4gb2EoZnVuY3Rpb24oYixjKXt2YXIgZT0tMSxkPW51bGw9PWI/MDpjLmxlbmd0aCxmPTI8ZD9jW2QtMl06cCxoPTI8ZD9jWzJdOnAsZz0xPGQ/Y1tkLTFdOnA7dHlwZW9mIGY9PVwiZnVuY3Rpb25cIj8oZj11YShmLGcsNSksZC09Mik6KGY9dHlwZW9mIGc9PVwiZnVuY3Rpb25cIj9nOnAsZC09Zj8xOjApO2gmJklhKGNbMF0sY1sxXSxoKSYmKGY9Mz5kP3A6ZixkPTEpO2Zvcig7KytlPGQ7KShoPWNbZV0pJiZhKGIsaCxcbmYpO3JldHVybiBifSl9KGZ1bmN0aW9uKGEsYixjKXtpZihjKWZvcih2YXIgZT0tMSxkPUMoYiksZj1kLmxlbmd0aDsrK2U8Zjspe3ZhciBoPWRbZV0sZz1hW2hdLGw9YyhnLGJbaF0saCxhLGIpOyhsPT09bD9sPT09ZzpnIT09ZykmJihnIT09cHx8aCBpbiBhKXx8KGFbaF09bCl9ZWxzZSBhPXNhKGEsYik7cmV0dXJuIGF9KSx0Yj1mdW5jdGlvbihhLGIpe3JldHVybiBvYShmdW5jdGlvbihjKXt2YXIgZT1jWzBdO2lmKG51bGw9PWUpcmV0dXJuIGU7Yy5wdXNoKGIpO3JldHVybiBhLmFwcGx5KHAsYyl9KX0ocWEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PXA/YjphfSksQz1SYT9mdW5jdGlvbihhKXt2YXIgYj1udWxsPT1hP3A6YS5jb25zdHJ1Y3RvcjtyZXR1cm4gdHlwZW9mIGI9PVwiZnVuY3Rpb25cIiYmYi5wcm90b3R5cGU9PT1hfHwodHlwZW9mIGE9PVwiZnVuY3Rpb25cIj9uLnN1cHBvcnQuZW51bVByb3RvdHlwZXM6bnVsbCE9YSYmRShtYShhKSkpP0phKGEpOnYoYSk/UmEoYSk6W119OlxuSmE7bi5hc3NpZ249cWE7bi5jYWxsYmFjaz1lYTtuLmRlZmF1bHRzPXRiO24ua2V5cz1DO24ua2V5c0luPUthO24ubWF0Y2hlcz1PYTtuLnBhaXJzPUVhO24ucHJvcGVydHk9d2E7bi5yZW1vdmU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBlPVtdO2lmKCFhfHwhYS5sZW5ndGgpcmV0dXJuIGU7dmFyIGQ9LTEsZj1bXSxoPWEubGVuZ3RoLGc9bi5jYWxsYmFja3x8ZWEsZz1nPT09ZWE/dGE6Zztmb3IoYj1nKGIsYywzKTsrK2Q8aDspYz1hW2RdLGIoYyxkLGEpJiYoZS5wdXNoKGMpLGYucHVzaChkKSk7Zm9yKGI9YT9mLmxlbmd0aDowO2ItLTspaWYoZD1mW2JdLGQhPWwmJiQoZCkpe3ZhciBsPWQ7UWEuY2FsbChhLGQsMSl9cmV0dXJuIGV9O24ucmVzdFBhcmFtPW9hO24uZXh0ZW5kPXFhO24uaXRlcmF0ZWU9ZWE7bi5pZGVudGl0eT1oYTtuLmlzQXJndW1lbnRzPW5hO24uaXNBcnJheT15O24uaXNGdW5jdGlvbj1jYTtuLmlzTmF0aXZlPUdhO24uaXNPYmplY3Q9djtuLmlzU3RyaW5nPWFhO24uaXNUeXBlZEFycmF5PVxuamE7bi5sYXN0PUJhO24uVkVSU0lPTj1cIjMuMTAuMFwiO2dhJiZPJiZxYiYmKChPLmV4cG9ydHM9bikuXz1uKX0uY2FsbCh0aGlzKSk7IiwiLy8gICAgIHV1aWQuanNcbi8vXG4vLyAgICAgQ29weXJpZ2h0IChjKSAyMDEwLTIwMTIgUm9iZXJ0IEtpZWZmZXJcbi8vICAgICBNSVQgTGljZW5zZSAtIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dsb2JhbCA9IHRoaXM7XG5cbiAgLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIFdlIGZlYXR1cmVcbiAgLy8gZGV0ZWN0IHRvIGRldGVybWluZSB0aGUgYmVzdCBSTkcgc291cmNlLCBub3JtYWxpemluZyB0byBhIGZ1bmN0aW9uIHRoYXRcbiAgLy8gcmV0dXJucyAxMjgtYml0cyBvZiByYW5kb21uZXNzLCBzaW5jZSB0aGF0J3Mgd2hhdCdzIHVzdWFsbHkgcmVxdWlyZWRcbiAgdmFyIF9ybmc7XG5cbiAgLy8gTm9kZS5qcyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL25vZGVqcy5vcmcvZG9jcy92MC42LjIvYXBpL2NyeXB0by5odG1sXG4gIC8vXG4gIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gIGlmICh0eXBlb2YoX2dsb2JhbC5yZXF1aXJlKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBfcmIgPSBfZ2xvYmFsLnJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzO1xuICAgICAgX3JuZyA9IF9yYiAmJiBmdW5jdGlvbigpIHtyZXR1cm4gX3JiKDE2KTt9O1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmICghX3JuZyAmJiBfZ2xvYmFsLmNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gV0hBVFdHIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gICAgLy9cbiAgICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICAgIHZhciBfcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoX3JuZHM4KTtcbiAgICAgIHJldHVybiBfcm5kczg7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghX3JuZykge1xuICAgIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgICAvL1xuICAgIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgTWF0aC5yYW5kb20oKS4gIEl0J3MgZmFzdCwgYnV0IGlzIG9mIHVuc3BlY2lmaWVkXG4gICAgLy8gcXVhbGl0eS5cbiAgICB2YXIgIF9ybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICAgIF9ybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3JuZHM7XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJ1ZmZlciBjbGFzcyB0byB1c2VcbiAgdmFyIEJ1ZmZlckNsYXNzID0gdHlwZW9mKF9nbG9iYWwuQnVmZmVyKSA9PSAnZnVuY3Rpb24nID8gX2dsb2JhbC5CdWZmZXIgOiBBcnJheTtcblxuICAvLyBNYXBzIGZvciBudW1iZXIgPC0+IGhleCBzdHJpbmcgY29udmVyc2lvblxuICB2YXIgX2J5dGVUb0hleCA9IFtdO1xuICB2YXIgX2hleFRvQnl0ZSA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgX2J5dGVUb0hleFtpXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7XG4gICAgX2hleFRvQnl0ZVtfYnl0ZVRvSGV4W2ldXSA9IGk7XG4gIH1cblxuICAvLyAqKmBwYXJzZSgpYCAtIFBhcnNlIGEgVVVJRCBpbnRvIGl0J3MgY29tcG9uZW50IGJ5dGVzKipcbiAgZnVuY3Rpb24gcGFyc2UocywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IChidWYgJiYgb2Zmc2V0KSB8fCAwLCBpaSA9IDA7XG5cbiAgICBidWYgPSBidWYgfHwgW107XG4gICAgcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1swLTlhLWZdezJ9L2csIGZ1bmN0aW9uKG9jdCkge1xuICAgICAgaWYgKGlpIDwgMTYpIHsgLy8gRG9uJ3Qgb3ZlcmZsb3chXG4gICAgICAgIGJ1ZltpICsgaWkrK10gPSBfaGV4VG9CeXRlW29jdF07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBaZXJvIG91dCByZW1haW5pbmcgYnl0ZXMgaWYgc3RyaW5nIHdhcyBzaG9ydFxuICAgIHdoaWxlIChpaSA8IDE2KSB7XG4gICAgICBidWZbaSArIGlpKytdID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgLy8gKipgdW5wYXJzZSgpYCAtIENvbnZlcnQgVVVJRCBieXRlIGFycmF5IChhbGEgcGFyc2UoKSkgaW50byBhIHN0cmluZyoqXG4gIGZ1bmN0aW9uIHVucGFyc2UoYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IG9mZnNldCB8fCAwLCBidGggPSBfYnl0ZVRvSGV4O1xuICAgIHJldHVybiAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV07XG4gIH1cblxuICAvLyAqKmB2MSgpYCAtIEdlbmVyYXRlIHRpbWUtYmFzZWQgVVVJRCoqXG4gIC8vXG4gIC8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG4gIC8vIGFuZCBodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvdXVpZC5odG1sXG5cbiAgLy8gcmFuZG9tICMncyB3ZSBuZWVkIHRvIGluaXQgbm9kZSBhbmQgY2xvY2tzZXFcbiAgdmFyIF9zZWVkQnl0ZXMgPSBfcm5nKCk7XG5cbiAgLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG4gIHZhciBfbm9kZUlkID0gW1xuICAgIF9zZWVkQnl0ZXNbMF0gfCAweDAxLFxuICAgIF9zZWVkQnl0ZXNbMV0sIF9zZWVkQnl0ZXNbMl0sIF9zZWVkQnl0ZXNbM10sIF9zZWVkQnl0ZXNbNF0sIF9zZWVkQnl0ZXNbNV1cbiAgXTtcblxuICAvLyBQZXIgNC4yLjIsIHJhbmRvbWl6ZSAoMTQgYml0KSBjbG9ja3NlcVxuICB2YXIgX2Nsb2Nrc2VxID0gKF9zZWVkQnl0ZXNbNl0gPDwgOCB8IF9zZWVkQnl0ZXNbN10pICYgMHgzZmZmO1xuXG4gIC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuICB2YXIgX2xhc3RNU2VjcyA9IDAsIF9sYXN0TlNlY3MgPSAwO1xuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcbiAgICB2YXIgYiA9IGJ1ZiB8fCBbXTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNsb2Nrc2VxID0gb3B0aW9ucy5jbG9ja3NlcSAhPSBudWxsID8gb3B0aW9ucy5jbG9ja3NlcSA6IF9jbG9ja3NlcTtcblxuICAgIC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG4gICAgLy8gKDE1ODItMTAtMTUgMDA6MDApLiAgSlNOdW1iZXJzIGFyZW4ndCBwcmVjaXNlIGVub3VnaCBmb3IgdGhpcywgc29cbiAgICAvLyB0aW1lIGlzIGhhbmRsZWQgaW50ZXJuYWxseSBhcyAnbXNlY3MnIChpbnRlZ2VyIG1pbGxpc2Vjb25kcykgYW5kICduc2VjcydcbiAgICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuICAgIHZhciBtc2VjcyA9IG9wdGlvbnMubXNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubXNlY3MgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgICAvLyBjeWNsZSB0byBzaW11bGF0ZSBoaWdoZXIgcmVzb2x1dGlvbiBjbG9ja1xuICAgIHZhciBuc2VjcyA9IG9wdGlvbnMubnNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubnNlY3MgOiBfbGFzdE5TZWNzICsgMTtcblxuICAgIC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcbiAgICB2YXIgZHQgPSAobXNlY3MgLSBfbGFzdE1TZWNzKSArIChuc2VjcyAtIF9sYXN0TlNlY3MpLzEwMDAwO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIEJ1bXAgY2xvY2tzZXEgb24gY2xvY2sgcmVncmVzc2lvblxuICAgIGlmIChkdCA8IDAgJiYgb3B0aW9ucy5jbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAgIC8vIHRpbWUgaW50ZXJ2YWxcbiAgICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT0gbnVsbCkge1xuICAgICAgbnNlY3MgPSAwO1xuICAgIH1cblxuICAgIC8vIFBlciA0LjIuMS4yIFRocm93IGVycm9yIGlmIHRvbyBtYW55IHV1aWRzIGFyZSByZXF1ZXN0ZWRcbiAgICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXVpZC52MSgpOiBDYW5cXCd0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlYycpO1xuICAgIH1cblxuICAgIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgICBfbGFzdE5TZWNzID0gbnNlY3M7XG4gICAgX2Nsb2Nrc2VxID0gY2xvY2tzZXE7XG5cbiAgICAvLyBQZXIgNC4xLjQgLSBDb252ZXJ0IGZyb20gdW5peCBlcG9jaCB0byBHcmVnb3JpYW4gZXBvY2hcbiAgICBtc2VjcyArPSAxMjIxOTI5MjgwMDAwMDtcblxuICAgIC8vIGB0aW1lX2xvd2BcbiAgICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gICAgYltpKytdID0gdGwgPj4+IDI0ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gMTYgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9taWRgXG4gICAgdmFyIHRtaCA9IChtc2VjcyAvIDB4MTAwMDAwMDAwICogMTAwMDApICYgMHhmZmZmZmZmO1xuICAgIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdG1oICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX2hpZ2hfYW5kX3ZlcnNpb25gXG4gICAgYltpKytdID0gdG1oID4+PiAyNCAmIDB4ZiB8IDB4MTA7IC8vIGluY2x1ZGUgdmVyc2lvblxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMTYgJiAweGZmO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgIChQZXIgNC4yLjIgLSBpbmNsdWRlIHZhcmlhbnQpXG4gICAgYltpKytdID0gY2xvY2tzZXEgPj4+IDggfCAweDgwO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9sb3dgXG4gICAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmO1xuXG4gICAgLy8gYG5vZGVgXG4gICAgdmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgX25vZGVJZDtcbiAgICBmb3IgKHZhciBuID0gMDsgbiA8IDY7IG4rKykge1xuICAgICAgYltpICsgbl0gPSBub2RlW25dO1xuICAgIH1cblxuICAgIHJldHVybiBidWYgPyBidWYgOiB1bnBhcnNlKGIpO1xuICB9XG5cbiAgLy8gKipgdjQoKWAgLSBHZW5lcmF0ZSByYW5kb20gVVVJRCoqXG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIC8vIERlcHJlY2F0ZWQgLSAnZm9ybWF0JyBhcmd1bWVudCwgYXMgc3VwcG9ydGVkIGluIHYxLjJcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcblxuICAgIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQnVmZmVyQ2xhc3MoMTYpIDogbnVsbDtcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IF9ybmcpKCk7XG5cbiAgICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gICAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICAgIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAgIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICAgIGlmIChidWYpIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgaWkrKykge1xuICAgICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWYgfHwgdW5wYXJzZShybmRzKTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBwdWJsaWMgQVBJXG4gIHZhciB1dWlkID0gdjQ7XG4gIHV1aWQudjEgPSB2MTtcbiAgdXVpZC52NCA9IHY0O1xuICB1dWlkLnBhcnNlID0gcGFyc2U7XG4gIHV1aWQudW5wYXJzZSA9IHVucGFyc2U7XG4gIHV1aWQuQnVmZmVyQ2xhc3MgPSBCdWZmZXJDbGFzcztcblxuICBpZiAodHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAvLyBQdWJsaXNoIGFzIG5vZGUuanMgbW9kdWxlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB1dWlkO1xuICB9IGVsc2UgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBQdWJsaXNoIGFzIEFNRCBtb2R1bGVcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIHV1aWQ7fSk7XG4gXG5cbiAgfSBlbHNlIHtcbiAgICAvLyBQdWJsaXNoIGFzIGdsb2JhbCAoaW4gYnJvd3NlcnMpXG4gICAgdmFyIF9wcmV2aW91c1Jvb3QgPSBfZ2xvYmFsLnV1aWQ7XG5cbiAgICAvLyAqKmBub0NvbmZsaWN0KClgIC0gKGJyb3dzZXIgb25seSkgdG8gcmVzZXQgZ2xvYmFsICd1dWlkJyB2YXIqKlxuICAgIHV1aWQubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgX2dsb2JhbC51dWlkID0gX3ByZXZpb3VzUm9vdDtcbiAgICAgIHJldHVybiB1dWlkO1xuICAgIH07XG5cbiAgICBfZ2xvYmFsLnV1aWQgPSB1dWlkO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiLyogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgTWFyY3VzIFdlc3RpbiAqL1xuKGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG8oKXt0cnl7cmV0dXJuIHIgaW4gZSYmZVtyXX1jYXRjaCh0KXtyZXR1cm4hMX19dmFyIHQ9e30sbj1lLmRvY3VtZW50LHI9XCJsb2NhbFN0b3JhZ2VcIixpPVwic2NyaXB0XCIsczt0LmRpc2FibGVkPSExLHQudmVyc2lvbj1cIjEuMy4xN1wiLHQuc2V0PWZ1bmN0aW9uKGUsdCl7fSx0LmdldD1mdW5jdGlvbihlLHQpe30sdC5oYXM9ZnVuY3Rpb24oZSl7cmV0dXJuIHQuZ2V0KGUpIT09dW5kZWZpbmVkfSx0LnJlbW92ZT1mdW5jdGlvbihlKXt9LHQuY2xlYXI9ZnVuY3Rpb24oKXt9LHQudHJhbnNhY3Q9ZnVuY3Rpb24oZSxuLHIpe3I9PW51bGwmJihyPW4sbj1udWxsKSxuPT1udWxsJiYobj17fSk7dmFyIGk9dC5nZXQoZSxuKTtyKGkpLHQuc2V0KGUsaSl9LHQuZ2V0QWxsPWZ1bmN0aW9uKCl7fSx0LmZvckVhY2g9ZnVuY3Rpb24oKXt9LHQuc2VyaWFsaXplPWZ1bmN0aW9uKGUpe3JldHVybiBKU09OLnN0cmluZ2lmeShlKX0sdC5kZXNlcmlhbGl6ZT1mdW5jdGlvbihlKXtpZih0eXBlb2YgZSE9XCJzdHJpbmdcIilyZXR1cm4gdW5kZWZpbmVkO3RyeXtyZXR1cm4gSlNPTi5wYXJzZShlKX1jYXRjaCh0KXtyZXR1cm4gZXx8dW5kZWZpbmVkfX07aWYobygpKXM9ZVtyXSx0LnNldD1mdW5jdGlvbihlLG4pe3JldHVybiBuPT09dW5kZWZpbmVkP3QucmVtb3ZlKGUpOihzLnNldEl0ZW0oZSx0LnNlcmlhbGl6ZShuKSksbil9LHQuZ2V0PWZ1bmN0aW9uKGUsbil7dmFyIHI9dC5kZXNlcmlhbGl6ZShzLmdldEl0ZW0oZSkpO3JldHVybiByPT09dW5kZWZpbmVkP246cn0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7cy5yZW1vdmVJdGVtKGUpfSx0LmNsZWFyPWZ1bmN0aW9uKCl7cy5jbGVhcigpfSx0LmdldEFsbD1mdW5jdGlvbigpe3ZhciBlPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCxuKXtlW3RdPW59KSxlfSx0LmZvckVhY2g9ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjxzLmxlbmd0aDtuKyspe3ZhciByPXMua2V5KG4pO2Uocix0LmdldChyKSl9fTtlbHNlIGlmKG4uZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKXt2YXIgdSxhO3RyeXthPW5ldyBBY3RpdmVYT2JqZWN0KFwiaHRtbGZpbGVcIiksYS5vcGVuKCksYS53cml0ZShcIjxcIitpK1wiPmRvY3VtZW50Lnc9d2luZG93PC9cIitpKyc+PGlmcmFtZSBzcmM9XCIvZmF2aWNvbi5pY29cIj48L2lmcmFtZT4nKSxhLmNsb3NlKCksdT1hLncuZnJhbWVzWzBdLmRvY3VtZW50LHM9dS5jcmVhdGVFbGVtZW50KFwiZGl2XCIpfWNhdGNoKGYpe3M9bi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHU9bi5ib2R5fXZhciBsPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3ZhciBuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtuLnVuc2hpZnQocyksdS5hcHBlbmRDaGlsZChzKSxzLmFkZEJlaGF2aW9yKFwiI2RlZmF1bHQjdXNlckRhdGFcIikscy5sb2FkKHIpO3ZhciBpPWUuYXBwbHkodCxuKTtyZXR1cm4gdS5yZW1vdmVDaGlsZChzKSxpfX0sYz1uZXcgUmVnRXhwKFwiWyFcXFwiIyQlJicoKSorLC9cXFxcXFxcXDo7PD0+P0BbXFxcXF1eYHt8fX5dXCIsXCJnXCIpO2Z1bmN0aW9uIGgoZSl7cmV0dXJuIGUucmVwbGFjZSgvXmQvLFwiX19fJCZcIikucmVwbGFjZShjLFwiX19fXCIpfXQuc2V0PWwoZnVuY3Rpb24oZSxuLGkpe3JldHVybiBuPWgobiksaT09PXVuZGVmaW5lZD90LnJlbW92ZShuKTooZS5zZXRBdHRyaWJ1dGUobix0LnNlcmlhbGl6ZShpKSksZS5zYXZlKHIpLGkpfSksdC5nZXQ9bChmdW5jdGlvbihlLG4scil7bj1oKG4pO3ZhciBpPXQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUobikpO3JldHVybiBpPT09dW5kZWZpbmVkP3I6aX0pLHQucmVtb3ZlPWwoZnVuY3Rpb24oZSx0KXt0PWgodCksZS5yZW1vdmVBdHRyaWJ1dGUodCksZS5zYXZlKHIpfSksdC5jbGVhcj1sKGZ1bmN0aW9uKGUpe3ZhciB0PWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7ZS5sb2FkKHIpO2Zvcih2YXIgbj0wLGk7aT10W25dO24rKyllLnJlbW92ZUF0dHJpYnV0ZShpLm5hbWUpO2Uuc2F2ZShyKX0pLHQuZ2V0QWxsPWZ1bmN0aW9uKGUpe3ZhciBuPXt9O3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSx0KXtuW2VdPXR9KSxufSx0LmZvckVhY2g9bChmdW5jdGlvbihlLG4pe3ZhciByPWUuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXM7Zm9yKHZhciBpPTAscztzPXJbaV07KytpKW4ocy5uYW1lLHQuZGVzZXJpYWxpemUoZS5nZXRBdHRyaWJ1dGUocy5uYW1lKSkpfSl9dHJ5e3ZhciBwPVwiX19zdG9yZWpzX19cIjt0LnNldChwLHApLHQuZ2V0KHApIT1wJiYodC5kaXNhYmxlZD0hMCksdC5yZW1vdmUocCl9Y2F0Y2goZil7dC5kaXNhYmxlZD0hMH10LmVuYWJsZWQ9IXQuZGlzYWJsZWQsdHlwZW9mIG1vZHVsZSE9XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMmJnRoaXMubW9kdWxlIT09bW9kdWxlP21vZHVsZS5leHBvcnRzPXQ6dHlwZW9mIGRlZmluZT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kP2RlZmluZSh0KTplLnN0b3JlPXR9KShGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkpIiwic3RvcmUgPSByZXF1aXJlKCdzdG9yZScpXG5cbiMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIHN0b3JlLmpzIGZvciBlYXN5IHN3YXBwaW5nXG5jbGFzcyBTdG9yYWdlXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWVzcGFjZT0nYWxlcGhiZXQnKSAtPlxuICAgIHRocm93ICdsb2NhbCBzdG9yYWdlIG5vdCBzdXBwb3J0ZWQnIHVubGVzcyBzdG9yZS5lbmFibGVkXG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnbG9kYXNoLmN1c3RvbScpXG51dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJylcblxuY2xhc3MgVXRpbHNcbiAgQGRlZmF1bHRzOiBfLmRlZmF1bHRzXG4gIEBrZXlzOiBfLmtleXNcbiAgQHJlbW92ZTogXy5yZW1vdmVcbiAgQHNldF9kZWJ1ZzogKEBkZWJ1ZykgLT5cbiAgQGxvZzogKG1lc3NhZ2UpIC0+XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSkgaWYgQGRlYnVnXG4gIEB1dWlkOiB1dWlkLnY0XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiJdfQ==
