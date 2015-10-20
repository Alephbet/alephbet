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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvYWRhcHRlcnMuanMuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L2FsZXBoYmV0LmpzLmNvZmZlZSIsImxpYi9sb2Rhc2guY3VzdG9tLm1pbi5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXV1aWQvdXVpZC5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yZS5taW4uanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3RvcmFnZS5qcy5jb2ZmZWUiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvdXRpbHMuanMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxlQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFFRjs7O0VBRUUsUUFBQyxDQUFBO29EQUNMLFNBQUEsR0FBVzs7b0RBQ1gsVUFBQSxHQUFZOztJQUVDLCtDQUFDLE9BQUQ7O1FBQUMsVUFBVSxRQUFRLENBQUM7Ozs7TUFDL0IsSUFBQyxDQUFBLEdBQUQsR0FBTyxRQUFRLENBQUM7TUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsVUFBZixDQUFBLElBQThCLElBQXpDO01BQ1YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUpXOztvREFNYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFDLENBQUEsTUFBZCxFQUFzQixTQUFDLEVBQUQ7bUJBQVEsRUFBRSxDQUFDLElBQUgsS0FBVztVQUFuQixDQUF0QjtpQkFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxLQUFDLENBQUEsVUFBZixFQUEyQixJQUFJLENBQUMsU0FBTCxDQUFlLEtBQUMsQ0FBQSxNQUFoQixDQUEzQjtRQUZGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQURZOztvREFLZCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUF5RixPQUFPLEVBQVAsS0FBZSxVQUF4RztBQUFBLGNBQU0sZ0ZBQU47O0FBQ0E7QUFBQTtXQUFBLHFDQUFBOztRQUNFLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUksQ0FBQyxJQUFuQjtxQkFDWCxFQUFBLENBQUcsTUFBSCxFQUFXLE9BQVgsRUFBb0IsSUFBSSxDQUFDLFFBQXpCLEVBQW1DLElBQUksQ0FBQyxNQUF4QyxFQUFnRCxJQUFJLENBQUMsS0FBckQsRUFBNEQ7VUFBQyxhQUFBLEVBQWUsUUFBaEI7U0FBNUQ7QUFGRjs7SUFGTTs7b0RBTVIsTUFBQSxHQUFRLFNBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsS0FBbkI7TUFDTixJQUFDLENBQUEsR0FBRCxDQUFLLHFEQUFBLEdBQXNELFFBQXRELEdBQStELElBQS9ELEdBQW1FLE1BQW5FLEdBQTBFLElBQTFFLEdBQThFLEtBQW5GO01BQ0EsSUFBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLEdBQXBDO1FBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQUEsRUFBQTs7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYTtRQUFDLElBQUEsRUFBTSxLQUFLLENBQUMsSUFBTixDQUFBLENBQVA7UUFBcUIsUUFBQSxFQUFVLFFBQS9CO1FBQXlDLE1BQUEsRUFBUSxNQUFqRDtRQUF5RCxLQUFBLEVBQU8sS0FBaEU7T0FBYjtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxVQUFmLEVBQTJCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE1BQWhCLENBQTNCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUxNOztvREFPUixnQkFBQSxHQUFrQixTQUFDLGVBQUQsRUFBa0IsT0FBbEI7YUFDaEIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsU0FBVCxFQUF1QixlQUFELEdBQWlCLEtBQWpCLEdBQXNCLE9BQTVDLEVBQXVELFVBQXZEO0lBRGdCOztvREFHbEIsYUFBQSxHQUFlLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixJQUEzQjthQUNiLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLFNBQVQsRUFBdUIsZUFBRCxHQUFpQixLQUFqQixHQUFzQixPQUE1QyxFQUF1RCxJQUF2RDtJQURhOzs7Ozs7RUFJWCxRQUFDLENBQUE7eUNBQ0wsVUFBQSxHQUFZOztJQUVDLG9DQUFDLFdBQUQsRUFBYyxPQUFkOztRQUFjLFVBQVUsUUFBUSxDQUFDOzs7O01BQzVDLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBUSxDQUFDO01BQ2hCLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxVQUFmLENBQUEsSUFBOEIsSUFBekM7TUFDVixJQUFDLENBQUEsTUFBRCxDQUFBO0lBTFc7O3lDQU9iLFlBQUEsR0FBYyxTQUFDLElBQUQ7YUFDWixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRCxFQUFNLEdBQU47VUFDRSxJQUFVLEdBQVY7QUFBQSxtQkFBQTs7VUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEtBQUMsQ0FBQSxNQUFkLEVBQXNCLFNBQUMsRUFBRDttQkFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQWQsS0FBc0I7VUFBOUIsQ0FBdEI7aUJBQ0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsS0FBQyxDQUFBLFVBQWYsRUFBMkIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFDLENBQUEsTUFBaEIsQ0FBM0I7UUFIRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUFEWTs7eUNBTWQsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztRQUNFLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBOUI7cUJBQ1gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLElBQUksQ0FBQyxlQUF0QixFQUF1QyxJQUFJLENBQUMsVUFBNUMsRUFBd0QsUUFBeEQ7QUFGRjs7SUFETTs7eUNBS1IsTUFBQSxHQUFRLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixLQUEzQjtNQUNOLElBQUMsQ0FBQSxHQUFELENBQUssK0JBQUEsR0FBZ0MsZUFBaEMsR0FBZ0QsSUFBaEQsR0FBb0QsT0FBcEQsR0FBNEQsSUFBNUQsR0FBZ0UsS0FBckU7TUFDQSxJQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsR0FBcEM7UUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQSxFQUFBOztNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUNFO1FBQUEsZUFBQSxFQUFpQixlQUFqQjtRQUNBLFVBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxLQUFLLENBQUMsSUFBTixDQUFBLENBQU47VUFDQSxPQUFBLEVBQVMsT0FEVDtVQUVBLEtBQUEsRUFBTyxLQUZQO1NBRkY7T0FERjtNQU1BLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxVQUFmLEVBQTJCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE1BQWhCLENBQTNCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQVZNOzt5Q0FZUixnQkFBQSxHQUFrQixTQUFDLGVBQUQsRUFBa0IsT0FBbEI7YUFDaEIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxlQUFSLEVBQXlCLE9BQXpCLEVBQWtDLGFBQWxDO0lBRGdCOzt5Q0FHbEIsYUFBQSxHQUFlLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixJQUEzQjthQUNiLElBQUMsQ0FBQSxNQUFELENBQVEsZUFBUixFQUF5QixPQUF6QixFQUFrQyxJQUFsQztJQURhOzs7Ozs7Ozs7O0FBR25CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDOUVqQixJQUFBLGtDQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxtQkFBUjs7QUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLHFCQUFSOztBQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsc0JBQVI7O0FBRUw7QUFDSixNQUFBOzs7O0VBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVztJQUFDLEtBQUEsRUFBTyxLQUFSOzs7RUFFWCxRQUFDLENBQUEscUNBQUQsR0FBeUMsUUFBUSxDQUFDOztFQUNsRCxRQUFDLENBQUEsMEJBQUQsR0FBOEIsUUFBUSxDQUFDOztFQUVqQyxRQUFDLENBQUE7OztJQUNMLCtCQUFDLENBQUEsU0FBRCxHQUFZOztJQUVaLCtCQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsS0FBbkI7TUFDUCxHQUFBLENBQUksb0NBQUEsR0FBcUMsUUFBckMsR0FBOEMsSUFBOUMsR0FBa0QsTUFBbEQsR0FBeUQsSUFBekQsR0FBNkQsS0FBakU7TUFDQSxJQUF5RixPQUFPLEVBQVAsS0FBZSxVQUF4RztBQUFBLGNBQU0sZ0ZBQU47O2FBQ0EsRUFBQSxDQUFHLE1BQUgsRUFBVyxPQUFYLEVBQW9CLFFBQXBCLEVBQThCLE1BQTlCLEVBQXNDLEtBQXRDLEVBQTZDO1FBQUMsZ0JBQUEsRUFBa0IsQ0FBbkI7T0FBN0M7SUFITzs7SUFLVCwrQkFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNqQiwrQkFBQyxDQUFBLE1BQUQsQ0FBUSwrQkFBQyxDQUFBLFNBQVQsRUFBdUIsZUFBRCxHQUFpQixLQUFqQixHQUFzQixPQUE1QyxFQUF1RCxVQUF2RDtJQURpQjs7SUFHbkIsK0JBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixJQUEzQjthQUNkLCtCQUFDLENBQUEsTUFBRCxDQUFRLCtCQUFDLENBQUEsU0FBVCxFQUF1QixlQUFELEdBQWlCLEtBQWpCLEdBQXNCLE9BQTVDLEVBQXVELElBQXZEO0lBRGM7Ozs7OztFQUdaLFFBQUMsQ0FBQTs7O0lBQ0wsbUJBQUMsQ0FBQSxTQUFELEdBQVk7O0lBQ1osbUJBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFELEVBQU0sS0FBTjthQUNBLElBQUEsT0FBQSxDQUFRLElBQUMsQ0FBQSxTQUFULENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsR0FBeEIsRUFBNkIsS0FBN0I7SUFEQTs7SUFFTixtQkFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7YUFDQSxJQUFBLE9BQUEsQ0FBUSxJQUFDLENBQUEsU0FBVCxDQUFtQixDQUFDLEdBQXBCLENBQXdCLEdBQXhCO0lBREE7Ozs7OztFQUdGLFFBQUMsQ0FBQTtBQUNMLFFBQUE7O0lBQUEsVUFBQyxDQUFBLFFBQUQsR0FDRTtNQUFBLElBQUEsRUFBTSxJQUFOO01BQ0EsUUFBQSxFQUFVLElBRFY7TUFFQSxNQUFBLEVBQVEsR0FGUjtNQUdBLE9BQUEsRUFBUyxTQUFBO2VBQUc7TUFBSCxDQUhUO01BSUEsZ0JBQUEsRUFBa0IsUUFBUSxDQUFDLCtCQUozQjtNQUtBLGVBQUEsRUFBaUIsUUFBUSxDQUFDLG1CQUwxQjs7O0lBT1csb0JBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSw0QkFBRCxVQUFTOzs7TUFDckIsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsT0FBaEIsRUFBeUIsVUFBVSxDQUFDLFFBQXBDO01BQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDO01BQ2pCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQztNQUNyQixJQUFDLENBQUEsYUFBRCxHQUFpQixLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaO01BQ2pCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtJQU5XOzt5QkFRYixHQUFBLEdBQUssU0FBQTtNQUNILEdBQUEsQ0FBSSx3QkFBQSxHQUF3QixDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE9BQWhCLENBQUQsQ0FBNUI7TUFDQSxjQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBO0lBSEc7O0lBS0wsSUFBQSxHQUFPLFNBQUE7YUFBRyxJQUFDLENBQUEsR0FBRCxDQUFBO0lBQUg7O0lBRVAsY0FBQSxHQUFpQixTQUFBLEdBQUE7O3lCQUdqQixhQUFBLEdBQWUsU0FBQTtBQUNiLFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsR0FBQSxDQUFJLGFBQUo7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFkO0FBQUEsZUFBQTs7TUFDQSxHQUFBLENBQUksV0FBSjtNQUNBLElBQUcsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQWI7UUFDRSxHQUFBLENBQU8sT0FBRCxHQUFTLFNBQWYsRUFERjtPQUFBLE1BQUE7UUFHRSxPQUFBLEdBQVUsSUFBQyxDQUFBLFlBQUQsQ0FBQTtRQUNWLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVyxDQUFDLGdCQUFaLENBQTZCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBdEMsRUFBNEMsT0FBNUMsRUFKRjs7O1dBS2tCLENBQUUsUUFBcEIsQ0FBNkIsSUFBN0I7O2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsR0FBWCxDQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVYsR0FBZSxVQUFoQyxFQUEyQyxPQUEzQztJQVhhOzt5QkFhZixhQUFBLEdBQWUsU0FBQyxTQUFELEVBQVksS0FBWjtBQUNiLFVBQUE7O1FBRHlCLFFBQU07O01BQy9CLEtBQUssQ0FBQyxRQUFOLENBQWUsS0FBZixFQUFzQjtRQUFDLE1BQUEsRUFBUSxJQUFUO09BQXRCO01BQ0EsSUFBVSxLQUFLLENBQUMsTUFBTixJQUFnQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLEdBQWYsR0FBa0IsU0FBbkMsQ0FBMUI7QUFBQSxlQUFBOztNQUNBLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNWLElBQUEsQ0FBYyxPQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUF5RCxLQUFLLENBQUMsTUFBL0Q7UUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLEdBQWYsR0FBa0IsU0FBbkMsRUFBZ0QsSUFBaEQsRUFBQTs7TUFDQSxHQUFBLENBQUksY0FBQSxHQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBeEIsR0FBNkIsV0FBN0IsR0FBd0MsT0FBeEMsR0FBZ0QsUUFBaEQsR0FBd0QsU0FBeEQsR0FBa0UsV0FBdEU7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVcsQ0FBQyxhQUFaLENBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBbkMsRUFBeUMsT0FBekMsRUFBa0QsU0FBbEQ7SUFQYTs7eUJBU2Ysa0JBQUEsR0FBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFVBQWhDO0lBRGtCOzt5QkFHcEIsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsVUFBQSxHQUFhLEdBQUEsR0FBTSxJQUFDLENBQUEsYUFBYSxDQUFDO01BQ2xDLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLFVBQTNCO01BQ25CLE9BQUEsR0FBVSxJQUFDLENBQUEsYUFBYyxDQUFBLGdCQUFBO01BQ3pCLEdBQUEsQ0FBTyxPQUFELEdBQVMsU0FBZjthQUNBO0lBTFk7O3lCQU9kLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFlBQWhDO01BQ1QsSUFBcUIsT0FBTyxNQUFQLEtBQWlCLFdBQXRDO0FBQUEsZUFBTyxPQUFQOztNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsSUFBaUIsSUFBQyxDQUFBLE9BQU8sQ0FBQztNQUNuQyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFlBQWhDLEVBQTZDLE1BQTdDO2FBQ0E7SUFMUzs7eUJBT1gsUUFBQSxHQUFVLFNBQUMsSUFBRDthQUNSLElBQUksQ0FBQyxjQUFMLENBQW9CLElBQXBCO0lBRFE7O3lCQUdWLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxVQUFBO0FBQUE7V0FBQSx1Q0FBQTs7cUJBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO0FBQUE7O0lBRFM7O3lCQUdYLE9BQUEsR0FBUyxTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQztJQUFaOzt5QkFFVCxRQUFBLEdBQVUsU0FBQTthQUFHLElBQUMsQ0FBQSxPQUFPLENBQUM7SUFBWjs7SUFFVixTQUFBLEdBQVksU0FBQTtNQUNWLElBQWdELElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxLQUFpQixJQUFqRTtBQUFBLGNBQU0sdUNBQU47O01BQ0EsSUFBcUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULEtBQXFCLElBQTFEO0FBQUEsY0FBTSw0QkFBTjs7TUFDQSxJQUFzQyxPQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBaEIsS0FBNkIsVUFBbkU7QUFBQSxjQUFNLDZCQUFOOztJQUhVOzs7Ozs7RUFLUixRQUFDLENBQUE7SUFDUSxjQUFDLElBQUQsRUFBUSxNQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEseUJBQUQsU0FBTztNQUMxQixLQUFLLENBQUMsUUFBTixDQUFlLElBQUMsQ0FBQSxLQUFoQixFQUF1QjtRQUFDLE1BQUEsRUFBUSxJQUFUO09BQXZCO01BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUZKOzttQkFJYixjQUFBLEdBQWdCLFNBQUMsVUFBRDthQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixVQUFsQjtJQURjOzttQkFHaEIsZUFBQSxHQUFpQixTQUFDLFdBQUQ7QUFDZixVQUFBO0FBQUE7V0FBQSw2Q0FBQTs7cUJBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsVUFBaEI7QUFBQTs7SUFEZTs7bUJBR2pCLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsSUFBQyxDQUFBLElBQTFCLEVBQWdDLElBQUMsQ0FBQSxLQUFqQztBQURGOztJQURROzs7Ozs7RUFJWixHQUFBLEdBQU0sUUFBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLE9BQUQ7SUFDWCxLQUFLLENBQUMsU0FBTixDQUFnQixRQUFDLENBQUEsT0FBTyxDQUFDLEtBQXpCO1dBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWO0VBRlc7Ozs7OztBQUlmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ25JakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZQQTtBQUNBOztBQ0RBLElBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUdGO0VBQ1MsaUJBQUMsU0FBRDtJQUFDLElBQUMsQ0FBQSxnQ0FBRCxZQUFXO0lBQ3ZCLElBQUEsQ0FBMkMsS0FBSyxDQUFDLE9BQWpEO0FBQUEsWUFBTSw4QkFBTjs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsZUFBUjs7QUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVI7O0FBRUQ7OztFQUNKLEtBQUMsQ0FBQSxRQUFELEdBQVcsQ0FBQyxDQUFDOztFQUNiLEtBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQyxDQUFDOztFQUNULEtBQUMsQ0FBQSxNQUFELEdBQVMsQ0FBQyxDQUFDOztFQUNYLEtBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxLQUFEO0lBQUMsSUFBQyxDQUFBLFFBQUQ7RUFBRDs7RUFDWixLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsT0FBRDtJQUNKLElBQXdCLElBQUMsQ0FBQSxLQUF6QjthQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUFBOztFQURJOztFQUVOLEtBQUMsQ0FBQSxJQUFELEdBQU8sSUFBSSxDQUFDOzs7Ozs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMuY29mZmVlJylcblxuY2xhc3MgQWRhcHRlcnNcblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICAgIG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIHF1ZXVlX25hbWU6ICdfZ2FfcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHN0b3JhZ2UgPSBBbGVwaEJldC5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGxvZyA9IEFsZXBoQmV0LmxvZ1xuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgID0+XG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV91dWlkKGl0ZW0udXVpZClcbiAgICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBpdGVtLmNhdGVnb3J5LCBpdGVtLmFjdGlvbiwgaXRlbS5sYWJlbCwgeydoaXRDYWxsYmFjayc6IGNhbGxiYWNrfSlcblxuICAgIF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgQGxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaCh7dXVpZDogdXRpbHMudXVpZCgpLCBjYXRlZ29yeTogY2F0ZWdvcnksIGFjdGlvbjogYWN0aW9uLCBsYWJlbDogbGFiZWx9KVxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWwpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2tlZW5fcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKGtlZW5fY2xpZW50LCBzdG9yYWdlID0gQWxlcGhCZXQuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBsb2cgPSBBbGVwaEJldC5sb2dcbiAgICAgIEBjbGllbnQgPSBrZWVuX2NsaWVudFxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgIChlcnIsIHJlcykgPT5cbiAgICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC5wcm9wZXJ0aWVzLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnByb3BlcnRpZXMudXVpZClcbiAgICAgICAgQGNsaWVudC5hZGRFdmVudChpdGVtLmV4cGVyaW1lbnRfbmFtZSwgaXRlbS5wcm9wZXJ0aWVzLCBjYWxsYmFjaylcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZXZlbnQpIC0+XG4gICAgICBAbG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBLZWVuIHRyYWNrOiAje2V4cGVyaW1lbnRfbmFtZX0sICN7dmFyaWFudH0sICN7ZXZlbnR9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaFxuICAgICAgICBleHBlcmltZW50X25hbWU6IGV4cGVyaW1lbnRfbmFtZVxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIHV1aWQ6IHV0aWxzLnV1aWQoKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhleHBlcmltZW50X25hbWUsIHZhcmlhbnQsICdwYXJ0aWNpcGF0ZScpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpXG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHRlcnNcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcy5jb2ZmZWUnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS5qcy5jb2ZmZWUnKVxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzLmpzLmNvZmZlZScpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0ge2RlYnVnOiBmYWxzZX1cblxuICBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXJcbiAgQFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIGxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgdGhyb3cgJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JyBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBnYSgnc2VuZCcsICdldmVudCcsIGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB7J25vbkludGVyYWN0aW9uJzogMX0pXG5cbiAgICBAZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWwpXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuICBjbGFzcyBARXhwZXJpbWVudFxuICAgIEBfb3B0aW9uczpcbiAgICAgIG5hbWU6IG51bGxcbiAgICAgIHZhcmlhbnRzOiBudWxsXG4gICAgICBzYW1wbGU6IDEuMFxuICAgICAgdHJpZ2dlcjogLT4gdHJ1ZVxuICAgICAgdHJhY2tpbmdfYWRhcHRlcjogQWxlcGhCZXQuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgICAgc3RvcmFnZV9hZGFwdGVyOiBBbGVwaEJldC5Mb2NhbFN0b3JhZ2VBZGFwdGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQG5hbWUgPSBAb3B0aW9ucy5uYW1lXG4gICAgICBAdmFyaWFudHMgPSBAb3B0aW9ucy52YXJpYW50c1xuICAgICAgQHZhcmlhbnRfbmFtZXMgPSB1dGlscy5rZXlzKEB2YXJpYW50cylcbiAgICAgIF9ydW4uY2FsbCh0aGlzKVxuXG4gICAgcnVuOiAtPlxuICAgICAgbG9nKFwicnVubmluZyB3aXRoIG9wdGlvbnM6ICN7SlNPTi5zdHJpbmdpZnkoQG9wdGlvbnMpfVwiKVxuICAgICAgX2ZvcmNlX3ZhcmlhbnQoKVxuICAgICAgQGFwcGx5X3ZhcmlhbnQoKVxuXG4gICAgX3J1biA9IC0+IEBydW4oKVxuXG4gICAgX2ZvcmNlX3ZhcmlhbnQgPSAtPlxuICAgICAgIyBUT0RPOiBnZXQgdmFyaWFudCBmcm9tIFVSSVxuXG4gICAgYXBwbHlfdmFyaWFudDogLT5cbiAgICAgIHJldHVybiB1bmxlc3MgQG9wdGlvbnMudHJpZ2dlcigpXG4gICAgICBsb2coJ3RyaWdnZXIgc2V0JylcbiAgICAgIHJldHVybiB1bmxlc3MgQGluX3NhbXBsZSgpXG4gICAgICBsb2coJ2luIHNhbXBsZScpXG4gICAgICBpZiB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICAgIGxvZyhcIiN7dmFyaWFudH0gYWN0aXZlXCIpXG4gICAgICBlbHNlXG4gICAgICAgIHZhcmlhbnQgPSBAcGlja192YXJpYW50KClcbiAgICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydChAb3B0aW9ucy5uYW1lLCB2YXJpYW50KVxuICAgICAgQHZhcmlhbnRzW3ZhcmlhbnRdPy5hY3RpdmF0ZSh0aGlzKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICBsb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZShAb3B0aW9ucy5uYW1lLCB2YXJpYW50LCBnb2FsX25hbWUpXG5cbiAgICBnZXRfc3RvcmVkX3ZhcmlhbnQ6IC0+XG4gICAgICBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiKVxuXG4gICAgcGlja192YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50X25hbWVzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRfbmFtZXNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIGxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICB2YXJpYW50XG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBhY3RpdmUgPSBNYXRoLnJhbmRvbSgpIDw9IEBvcHRpb25zLnNhbXBsZVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiLCBhY3RpdmUpXG4gICAgICBhY3RpdmVcblxuICAgIGFkZF9nb2FsOiAoZ29hbCkgPT5cbiAgICAgIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcylcblxuICAgIGFkZF9nb2FsczogKGdvYWxzKSA9PlxuICAgICAgQGFkZF9nb2FsKGdvYWwpIGZvciBnb2FsIGluIGdvYWxzXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcgaWYgQG9wdGlvbnMubmFtZSBpcyBudWxsXG4gICAgICB0aHJvdyAndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3RyaWdnZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICBAZXhwZXJpbWVudHMgPSBbXVxuXG4gICAgYWRkX2V4cGVyaW1lbnQ6IChleHBlcmltZW50KSAtPlxuICAgICAgQGV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudClcblxuICAgIGFkZF9leHBlcmltZW50czogKGV4cGVyaW1lbnRzKSAtPlxuICAgICAgQGFkZF9leHBlcmltZW50KGV4cGVyaW1lbnQpIGZvciBleHBlcmltZW50IGluIGV4cGVyaW1lbnRzXG5cbiAgICBjb21wbGV0ZTogLT5cbiAgICAgIGZvciBleHBlcmltZW50IGluIEBleHBlcmltZW50c1xuICAgICAgICBleHBlcmltZW50LmdvYWxfY29tcGxldGUoQG5hbWUsIEBwcm9wcylcblxuICBsb2cgPSBAbG9nID0gKG1lc3NhZ2UpID0+XG4gICAgdXRpbHMuc2V0X2RlYnVnKEBvcHRpb25zLmRlYnVnKVxuICAgIHV0aWxzLmxvZyhtZXNzYWdlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXBoQmV0XG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBsb2Rhc2ggMy4xMC4wIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0cyxyZW1vdmVcIiBleHBvcnRzPVwibm9kZVwiIC1vIC4vbGliL2xvZGFzaC5jdXN0b20uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiBCKGEpe3JldHVybiEhYSYmdHlwZW9mIGE9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gbigpe31mdW5jdGlvbiBTYShhLGIpe3ZhciBjPS0xLGU9YS5sZW5ndGg7Zm9yKGJ8fChiPUFycmF5KGUpKTsrK2M8ZTspYltjXT1hW2NdO3JldHVybiBifWZ1bmN0aW9uIHJhKGEsYil7Zm9yKHZhciBjPS0xLGU9YS5sZW5ndGg7KytjPGUmJmZhbHNlIT09YihhW2NdLGMsYSk7KTtyZXR1cm4gYX1mdW5jdGlvbiBUYShhLGIpe2Zvcih2YXIgYz0tMSxlPWEubGVuZ3RoOysrYzxlOylpZihiKGFbY10sYyxhKSlyZXR1cm4gdHJ1ZTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gc2EoYSxiKXt2YXIgYztpZihudWxsPT1iKWM9YTtlbHNle2M9QyhiKTt2YXIgZT1hO2V8fChlPXt9KTtmb3IodmFyIGQ9LTEsZj1jLmxlbmd0aDsrK2Q8Zjspe3ZhciBoPWNbZF07ZVtoXT1iW2hdfWM9ZX1yZXR1cm4gY31mdW5jdGlvbiB0YShhLGIsYyl7dmFyIGU9dHlwZW9mIGE7cmV0dXJuXCJmdW5jdGlvblwiPT1cbmU/Yj09PXA/YTp1YShhLGIsYyk6bnVsbD09YT9oYTpcIm9iamVjdFwiPT1lP3ZhKGEpOmI9PT1wP3dhKGEpOlVhKGEsYil9ZnVuY3Rpb24geGEoYSxiLGMsZSxkLGYsaCl7dmFyIGc7YyYmKGc9ZD9jKGEsZSxkKTpjKGEpKTtpZihnIT09cClyZXR1cm4gZztpZighdihhKSlyZXR1cm4gYTtpZihlPXkoYSkpe2lmKGc9VmEoYSksIWIpcmV0dXJuIFNhKGEsZyl9ZWxzZXt2YXIgbD1BLmNhbGwoYSksbT1sPT1IO2lmKGw9PXR8fGw9PUl8fG0mJiFkKXtpZihRKGEpKXJldHVybiBkP2E6e307Zz1XYShtP3t9OmEpO2lmKCFiKXJldHVybiBzYShnLGEpfWVsc2UgcmV0dXJuIHFbbF0/WGEoYSxsLGIpOmQ/YTp7fX1mfHwoZj1bXSk7aHx8KGg9W10pO2ZvcihkPWYubGVuZ3RoO2QtLTspaWYoZltkXT09YSlyZXR1cm4gaFtkXTtmLnB1c2goYSk7aC5wdXNoKGcpOyhlP3JhOllhKShhLGZ1bmN0aW9uKGQsZSl7Z1tlXT14YShkLGIsYyxlLGEsZixoKX0pO3JldHVybiBnfWZ1bmN0aW9uIFlhKGEsYil7cmV0dXJuIFphKGEsXG5iLEMpfWZ1bmN0aW9uIHlhKGEsYixjKXtpZihudWxsIT1hKXthPXooYSk7YyE9PXAmJmMgaW4gYSYmKGI9W2NdKTtjPTA7Zm9yKHZhciBlPWIubGVuZ3RoO251bGwhPWEmJmM8ZTspYT16KGEpW2JbYysrXV07cmV0dXJuIGMmJmM9PWU/YTpwfX1mdW5jdGlvbiBpYShhLGIsYyxlLGQsZil7aWYoYT09PWIpYT10cnVlO2Vsc2UgaWYobnVsbD09YXx8bnVsbD09Ynx8IXYoYSkmJiFCKGIpKWE9YSE9PWEmJmIhPT1iO2Vsc2UgYTp7dmFyIGg9aWEsZz15KGEpLGw9eShiKSxtPUYsaz1GO2d8fChtPUEuY2FsbChhKSxtPT1JP209dDptIT10JiYoZz1qYShhKSkpO2x8fChrPUEuY2FsbChiKSxrPT1JP2s9dDprIT10JiZqYShiKSk7dmFyIHA9bT09dCYmIVEoYSksbD1rPT10JiYhUShiKSxrPW09PWs7aWYoIWt8fGd8fHApe2lmKCFlJiYobT1wJiZ1LmNhbGwoYSxcIl9fd3JhcHBlZF9fXCIpLGw9bCYmdS5jYWxsKGIsXCJfX3dyYXBwZWRfX1wiKSxtfHxsKSl7YT1oKG0/YS52YWx1ZSgpOmEsbD9iLnZhbHVlKCk6XG5iLGMsZSxkLGYpO2JyZWFrIGF9aWYoayl7ZHx8KGQ9W10pO2Z8fChmPVtdKTtmb3IobT1kLmxlbmd0aDttLS07KWlmKGRbbV09PWEpe2E9ZlttXT09YjticmVhayBhfWQucHVzaChhKTtmLnB1c2goYik7YT0oZz8kYTphYikoYSxiLGgsYyxlLGQsZik7ZC5wb3AoKTtmLnBvcCgpfWVsc2UgYT1mYWxzZX1lbHNlIGE9YmIoYSxiLG0pfXJldHVybiBhfWZ1bmN0aW9uIGNiKGEsYil7dmFyIGM9Yi5sZW5ndGgsZT1jO2lmKG51bGw9PWEpcmV0dXJuIWU7Zm9yKGE9eihhKTtjLS07KXt2YXIgZD1iW2NdO2lmKGRbMl0/ZFsxXSE9PWFbZFswXV06IShkWzBdaW4gYSkpcmV0dXJuIGZhbHNlfWZvcig7KytjPGU7KXt2YXIgZD1iW2NdLGY9ZFswXSxoPWFbZl0sZz1kWzFdO2lmKGRbMl0pe2lmKGg9PT1wJiYhKGYgaW4gYSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoZD1wLGQ9PT1wPyFpYShnLGgsdm9pZCAwLHRydWUpOiFkKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiB2YShhKXt2YXIgYj1kYihhKTtpZigxPT1iLmxlbmd0aCYmXG5iWzBdWzJdKXt2YXIgYz1iWzBdWzBdLGU9YlswXVsxXTtyZXR1cm4gZnVuY3Rpb24oYSl7aWYobnVsbD09YSlyZXR1cm4gZmFsc2U7YT16KGEpO3JldHVybiBhW2NdPT09ZSYmKGUhPT1wfHxjIGluIGEpfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIGNiKGEsYil9fWZ1bmN0aW9uIFVhKGEsYil7dmFyIGM9eShhKSxlPXphKGEpJiZiPT09YiYmIXYoYiksZD1hK1wiXCI7YT1BYShhKTtyZXR1cm4gZnVuY3Rpb24oZil7aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7dmFyIGg9ZDtmPXooZik7aWYoISghYyYmZXx8aCBpbiBmKSl7aWYoMSE9YS5sZW5ndGgpe3ZhciBoPWEsZz0wLGw9LTEsbT0tMSxrPWgubGVuZ3RoLGc9bnVsbD09Zz8wOitnfHwwOzA+ZyYmKGc9LWc+az8wOmsrZyk7bD1sPT09cHx8bD5rP2s6K2x8fDA7MD5sJiYobCs9ayk7az1nPmw/MDpsLWc+Pj4wO2c+Pj49MDtmb3IobD1BcnJheShrKTsrK208azspbFttXT1oW20rZ107Zj15YShmLGwpfWlmKG51bGw9PWYpcmV0dXJuIGZhbHNlO2g9QmEoYSk7XG5mPXooZil9cmV0dXJuIGZbaF09PT1iP2IhPT1wfHxoIGluIGY6aWEoYixmW2hdLHAsdHJ1ZSl9fWZ1bmN0aW9uIENhKGEpe3JldHVybiBmdW5jdGlvbihiKXtyZXR1cm4gbnVsbD09Yj9wOnooYilbYV19fWZ1bmN0aW9uIGViKGEpe3ZhciBiPWErXCJcIjthPUFhKGEpO3JldHVybiBmdW5jdGlvbihjKXtyZXR1cm4geWEoYyxhLGIpfX1mdW5jdGlvbiB1YShhLGIsYyl7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIilyZXR1cm4gaGE7aWYoYj09PXApcmV0dXJuIGE7c3dpdGNoKGMpe2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIGEuY2FsbChiLGMpfTtjYXNlIDM6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYpfTtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgpe3JldHVybiBhLmNhbGwoYixjLGQsZixoKX07Y2FzZSA1OnJldHVybiBmdW5jdGlvbihjLGQsZixoLGcpe3JldHVybiBhLmNhbGwoYixjLGQsZixoLGcpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYS5hcHBseShiLFxuYXJndW1lbnRzKX19ZnVuY3Rpb24gRGEoYSl7dmFyIGI9bmV3IGZiKGEuYnl0ZUxlbmd0aCk7KG5ldyBrYShiKSkuc2V0KG5ldyBrYShhKSk7cmV0dXJuIGJ9ZnVuY3Rpb24gJGEoYSxiLGMsZSxkLGYsaCl7dmFyIGc9LTEsbD1hLmxlbmd0aCxtPWIubGVuZ3RoO2lmKGwhPW0mJiEoZCYmbT5sKSlyZXR1cm4gZmFsc2U7Zm9yKDsrK2c8bDspe3ZhciBrPWFbZ10sbT1iW2ddLG49ZT9lKGQ/bTprLGQ/azptLGcpOnA7aWYobiE9PXApe2lmKG4pY29udGludWU7cmV0dXJuIGZhbHNlfWlmKGQpe2lmKCFUYShiLGZ1bmN0aW9uKGEpe3JldHVybiBrPT09YXx8YyhrLGEsZSxkLGYsaCl9KSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihrIT09bSYmIWMoayxtLGUsZCxmLGgpKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiBiYihhLGIsYyl7c3dpdGNoKGMpe2Nhc2UgSjpjYXNlIEs6cmV0dXJuK2E9PStiO2Nhc2UgTDpyZXR1cm4gYS5uYW1lPT1iLm5hbWUmJmEubWVzc2FnZT09Yi5tZXNzYWdlO2Nhc2UgTTpyZXR1cm4gYSE9XG4rYT9iIT0rYjphPT0rYjtjYXNlIE46Y2FzZSBEOnJldHVybiBhPT1iK1wiXCJ9cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIGFiKGEsYixjLGUsZCxmLGgpe3ZhciBnPUMoYSksbD1nLmxlbmd0aCxtPUMoYikubGVuZ3RoO2lmKGwhPW0mJiFkKXJldHVybiBmYWxzZTtmb3IobT1sO20tLTspe3ZhciBrPWdbbV07aWYoIShkP2sgaW4gYjp1LmNhbGwoYixrKSkpcmV0dXJuIGZhbHNlfWZvcih2YXIgbj1kOysrbTxsOyl7dmFyIGs9Z1ttXSxxPWFba10scj1iW2tdLHM9ZT9lKGQ/cjpxLGQ/cTpyLGspOnA7aWYocz09PXA/IWMocSxyLGUsZCxmLGgpOiFzKXJldHVybiBmYWxzZTtufHwobj1cImNvbnN0cnVjdG9yXCI9PWspfXJldHVybiBufHwoYz1hLmNvbnN0cnVjdG9yLGU9Yi5jb25zdHJ1Y3RvciwhKGMhPWUmJlwiY29uc3RydWN0b3JcImluIGEmJlwiY29uc3RydWN0b3JcImluIGIpfHx0eXBlb2YgYz09XCJmdW5jdGlvblwiJiZjIGluc3RhbmNlb2YgYyYmdHlwZW9mIGU9PVwiZnVuY3Rpb25cIiYmZSBpbnN0YW5jZW9mIGUpP3RydWU6ZmFsc2V9ZnVuY3Rpb24gZGIoYSl7YT1cbkVhKGEpO2Zvcih2YXIgYj1hLmxlbmd0aDtiLS07KXt2YXIgYz1hW2JdWzFdO2FbYl1bMl09Yz09PWMmJiF2KGMpfXJldHVybiBhfWZ1bmN0aW9uIEZhKGEsYil7dmFyIGM9bnVsbD09YT9wOmFbYl07cmV0dXJuIEdhKGMpP2M6cH1mdW5jdGlvbiBWYShhKXt2YXIgYj1hLmxlbmd0aCxjPW5ldyBhLmNvbnN0cnVjdG9yKGIpO2ImJlwic3RyaW5nXCI9PXR5cGVvZiBhWzBdJiZ1LmNhbGwoYSxcImluZGV4XCIpJiYoYy5pbmRleD1hLmluZGV4LGMuaW5wdXQ9YS5pbnB1dCk7cmV0dXJuIGN9ZnVuY3Rpb24gV2EoYSl7YT1hLmNvbnN0cnVjdG9yO3R5cGVvZiBhPT1cImZ1bmN0aW9uXCImJmEgaW5zdGFuY2VvZiBhfHwoYT1PYmplY3QpO3JldHVybiBuZXcgYX1mdW5jdGlvbiBYYShhLGIsYyl7dmFyIGU9YS5jb25zdHJ1Y3Rvcjtzd2l0Y2goYil7Y2FzZSBsYTpyZXR1cm4gRGEoYSk7Y2FzZSBKOmNhc2UgSzpyZXR1cm4gbmV3IGUoK2EpO2Nhc2UgUjpjYXNlIFM6Y2FzZSBUOmNhc2UgVTpjYXNlIFY6Y2FzZSBXOmNhc2UgWDpjYXNlIFk6Y2FzZSBaOnJldHVybiBlIGluc3RhbmNlb2ZcbmUmJihlPXdbYl0pLGI9YS5idWZmZXIsbmV3IGUoYz9EYShiKTpiLGEuYnl0ZU9mZnNldCxhLmxlbmd0aCk7Y2FzZSBNOmNhc2UgRDpyZXR1cm4gbmV3IGUoYSk7Y2FzZSBOOnZhciBkPW5ldyBlKGEuc291cmNlLGdiLmV4ZWMoYSkpO2QubGFzdEluZGV4PWEubGFzdEluZGV4fXJldHVybiBkfWZ1bmN0aW9uICQoYSxiKXthPXR5cGVvZiBhPT1cIm51bWJlclwifHxoYi50ZXN0KGEpPythOi0xO2I9bnVsbD09Yj9IYTpiO3JldHVybi0xPGEmJjA9PWElMSYmYTxifWZ1bmN0aW9uIElhKGEsYixjKXtpZighdihjKSlyZXR1cm4gZmFsc2U7dmFyIGU9dHlwZW9mIGI7cmV0dXJuKFwibnVtYmVyXCI9PWU/bnVsbCE9YyYmRShtYShjKSkmJiQoYixjLmxlbmd0aCk6XCJzdHJpbmdcIj09ZSYmYiBpbiBjKT8oYj1jW2JdLGE9PT1hP2E9PT1iOmIhPT1iKTpmYWxzZX1mdW5jdGlvbiB6YShhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm5cInN0cmluZ1wiPT1iJiZpYi50ZXN0KGEpfHxcIm51bWJlclwiPT1iP3RydWU6eShhKT9mYWxzZTohamIudGVzdChhKXx8XG4hMX1mdW5jdGlvbiBFKGEpe3JldHVybiB0eXBlb2YgYT09XCJudW1iZXJcIiYmLTE8YSYmMD09YSUxJiZhPD1IYX1mdW5jdGlvbiBKYShhKXtmb3IodmFyIGI9S2EoYSksYz1iLmxlbmd0aCxlPWMmJmEubGVuZ3RoLGQ9ISFlJiZFKGUpJiYoeShhKXx8bmEoYSl8fGFhKGEpKSxmPS0xLGg9W107KytmPGM7KXt2YXIgZz1iW2ZdOyhkJiYkKGcsZSl8fHUuY2FsbChhLGcpKSYmaC5wdXNoKGcpfXJldHVybiBofWZ1bmN0aW9uIHooYSl7aWYobi5zdXBwb3J0LnVuaW5kZXhlZENoYXJzJiZhYShhKSl7Zm9yKHZhciBiPS0xLGM9YS5sZW5ndGgsZT1PYmplY3QoYSk7KytiPGM7KWVbYl09YS5jaGFyQXQoYik7cmV0dXJuIGV9cmV0dXJuIHYoYSk/YTpPYmplY3QoYSl9ZnVuY3Rpb24gQWEoYSl7aWYoeShhKSlyZXR1cm4gYTt2YXIgYj1bXTsobnVsbD09YT9cIlwiOmErXCJcIikucmVwbGFjZShrYixmdW5jdGlvbihhLGUsZCxmKXtiLnB1c2goZD9mLnJlcGxhY2UobGIsXCIkMVwiKTplfHxhKX0pO3JldHVybiBifVxuZnVuY3Rpb24gQmEoYSl7dmFyIGI9YT9hLmxlbmd0aDowO3JldHVybiBiP2FbYi0xXTpwfWZ1bmN0aW9uIG9hKGEsYil7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKG1iKTtiPUxhKGI9PT1wP2EubGVuZ3RoLTE6K2J8fDAsMCk7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciBjPWFyZ3VtZW50cyxlPS0xLGQ9TGEoYy5sZW5ndGgtYiwwKSxmPUFycmF5KGQpOysrZTxkOylmW2VdPWNbYitlXTtzd2l0Y2goYil7Y2FzZSAwOnJldHVybiBhLmNhbGwodGhpcyxmKTtjYXNlIDE6cmV0dXJuIGEuY2FsbCh0aGlzLGNbMF0sZik7Y2FzZSAyOnJldHVybiBhLmNhbGwodGhpcyxjWzBdLGNbMV0sZil9ZD1BcnJheShiKzEpO2ZvcihlPS0xOysrZTxiOylkW2VdPWNbZV07ZFtiXT1mO3JldHVybiBhLmFwcGx5KHRoaXMsZCl9fWZ1bmN0aW9uIG5hKGEpe3JldHVybiBCKGEpJiZudWxsIT1hJiZFKG1hKGEpKSYmdS5jYWxsKGEsXCJjYWxsZWVcIikmJiFiYS5jYWxsKGEsXCJjYWxsZWVcIil9XG5mdW5jdGlvbiBjYShhKXtyZXR1cm4gdihhKSYmQS5jYWxsKGEpPT1IfWZ1bmN0aW9uIHYoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuISFhJiYoXCJvYmplY3RcIj09Ynx8XCJmdW5jdGlvblwiPT1iKX1mdW5jdGlvbiBHYShhKXtyZXR1cm4gbnVsbD09YT9mYWxzZTpjYShhKT9NYS50ZXN0KE5hLmNhbGwoYSkpOkIoYSkmJihRKGEpP01hOm5iKS50ZXN0KGEpfWZ1bmN0aW9uIGFhKGEpe3JldHVybiB0eXBlb2YgYT09XCJzdHJpbmdcInx8QihhKSYmQS5jYWxsKGEpPT1EfWZ1bmN0aW9uIGphKGEpe3JldHVybiBCKGEpJiZFKGEubGVuZ3RoKSYmISFyW0EuY2FsbChhKV19ZnVuY3Rpb24gS2EoYSl7aWYobnVsbD09YSlyZXR1cm5bXTt2KGEpfHwoYT1PYmplY3QoYSkpO2Zvcih2YXIgYj1hLmxlbmd0aCxjPW4uc3VwcG9ydCxiPWImJkUoYikmJih5KGEpfHxuYShhKXx8YWEoYSkpJiZifHwwLGU9YS5jb25zdHJ1Y3RvcixkPS0xLGU9Y2EoZSkmJmUucHJvdG90eXBlfHxHLGY9ZT09PWEsaD1BcnJheShiKSxnPVxuMDxiLGw9Yy5lbnVtRXJyb3JQcm9wcyYmKGE9PT1kYXx8YSBpbnN0YW5jZW9mIEVycm9yKSxtPWMuZW51bVByb3RvdHlwZXMmJmNhKGEpOysrZDxiOyloW2RdPWQrXCJcIjtmb3IodmFyIGsgaW4gYSltJiZcInByb3RvdHlwZVwiPT1rfHxsJiYoXCJtZXNzYWdlXCI9PWt8fFwibmFtZVwiPT1rKXx8ZyYmJChrLGIpfHxcImNvbnN0cnVjdG9yXCI9PWsmJihmfHwhdS5jYWxsKGEsaykpfHxoLnB1c2goayk7aWYoYy5ub25FbnVtU2hhZG93cyYmYSE9PUcpZm9yKGI9YT09PW9iP0Q6YT09PWRhP0w6QS5jYWxsKGEpLGM9c1tiXXx8c1t0XSxiPT10JiYoZT1HKSxiPXBhLmxlbmd0aDtiLS07KWs9cGFbYl0sZD1jW2tdLGYmJmR8fChkPyF1LmNhbGwoYSxrKTphW2tdPT09ZVtrXSl8fGgucHVzaChrKTtyZXR1cm4gaH1mdW5jdGlvbiBFYShhKXthPXooYSk7Zm9yKHZhciBiPS0xLGM9QyhhKSxlPWMubGVuZ3RoLGQ9QXJyYXkoZSk7KytiPGU7KXt2YXIgZj1jW2JdO2RbYl09W2YsYVtmXV19cmV0dXJuIGR9ZnVuY3Rpb24gZWEoYSxcbmIsYyl7YyYmSWEoYSxiLGMpJiYoYj1wKTtyZXR1cm4gQihhKT9PYShhKTp0YShhLGIpfWZ1bmN0aW9uIGhhKGEpe3JldHVybiBhfWZ1bmN0aW9uIE9hKGEpe3JldHVybiB2YSh4YShhLHRydWUpKX1mdW5jdGlvbiB3YShhKXtyZXR1cm4gemEoYSk/Q2EoYSk6ZWIoYSl9dmFyIHAsbWI9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsST1cIltvYmplY3QgQXJndW1lbnRzXVwiLEY9XCJbb2JqZWN0IEFycmF5XVwiLEo9XCJbb2JqZWN0IEJvb2xlYW5dXCIsSz1cIltvYmplY3QgRGF0ZV1cIixMPVwiW29iamVjdCBFcnJvcl1cIixIPVwiW29iamVjdCBGdW5jdGlvbl1cIixNPVwiW29iamVjdCBOdW1iZXJdXCIsdD1cIltvYmplY3QgT2JqZWN0XVwiLE49XCJbb2JqZWN0IFJlZ0V4cF1cIixEPVwiW29iamVjdCBTdHJpbmddXCIsbGE9XCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiLFI9XCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIixTPVwiW29iamVjdCBGbG9hdDY0QXJyYXldXCIsVD1cIltvYmplY3QgSW50OEFycmF5XVwiLFU9XCJbb2JqZWN0IEludDE2QXJyYXldXCIsXG5WPVwiW29iamVjdCBJbnQzMkFycmF5XVwiLFc9XCJbb2JqZWN0IFVpbnQ4QXJyYXldXCIsWD1cIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldXCIsWT1cIltvYmplY3QgVWludDE2QXJyYXldXCIsWj1cIltvYmplY3QgVWludDMyQXJyYXldXCIsamI9L1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxuXFxcXF18XFxcXC4pKj9cXDEpXFxdLyxpYj0vXlxcdyokLyxrYj0vW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxuXFxcXF18XFxcXC4pKj8pXFwyKVxcXS9nLGxiPS9cXFxcKFxcXFwpPy9nLGdiPS9cXHcqJC8sbmI9L15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLyxoYj0vXlxcZCskLyxwYT1cImNvbnN0cnVjdG9yIGhhc093blByb3BlcnR5IGlzUHJvdG90eXBlT2YgcHJvcGVydHlJc0VudW1lcmFibGUgdG9Mb2NhbGVTdHJpbmcgdG9TdHJpbmcgdmFsdWVPZlwiLnNwbGl0KFwiIFwiKSxyPXt9O3JbUl09cltTXT1yW1RdPXJbVV09cltWXT1yW1ddPXJbWF09cltZXT1yW1pdPXRydWU7XG5yW0ldPXJbRl09cltsYV09cltKXT1yW0tdPXJbTF09cltIXT1yW1wiW29iamVjdCBNYXBdXCJdPXJbTV09clt0XT1yW05dPXJbXCJbb2JqZWN0IFNldF1cIl09cltEXT1yW1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTt2YXIgcT17fTtxW0ldPXFbRl09cVtsYV09cVtKXT1xW0tdPXFbUl09cVtTXT1xW1RdPXFbVV09cVtWXT1xW01dPXFbdF09cVtOXT1xW0RdPXFbV109cVtYXT1xW1ldPXFbWl09dHJ1ZTtxW0xdPXFbSF09cVtcIltvYmplY3QgTWFwXVwiXT1xW1wiW29iamVjdCBTZXRdXCJdPXFbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBmYT17XCJmdW5jdGlvblwiOnRydWUsb2JqZWN0OnRydWV9LGdhPWZhW3R5cGVvZiBleHBvcnRzXSYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsTz1mYVt0eXBlb2YgbW9kdWxlXSYmbW9kdWxlJiYhbW9kdWxlLm5vZGVUeXBlJiZtb2R1bGUscGI9ZmFbdHlwZW9mIHNlbGZdJiZzZWxmJiZzZWxmLk9iamVjdCYmc2VsZixQYT1mYVt0eXBlb2Ygd2luZG93XSYmXG53aW5kb3cmJndpbmRvdy5PYmplY3QmJndpbmRvdyxxYj1PJiZPLmV4cG9ydHM9PT1nYSYmZ2EseD1nYSYmTyYmdHlwZW9mIGdsb2JhbD09XCJvYmplY3RcIiYmZ2xvYmFsJiZnbG9iYWwuT2JqZWN0JiZnbG9iYWx8fFBhIT09KHRoaXMmJnRoaXMud2luZG93KSYmUGF8fHBifHx0aGlzLFE9ZnVuY3Rpb24oKXt0cnl7T2JqZWN0KHt0b1N0cmluZzowfStcIlwiKX1jYXRjaChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gdHlwZW9mIGEudG9TdHJpbmchPVwiZnVuY3Rpb25cIiYmdHlwZW9mKGErXCJcIik9PVwic3RyaW5nXCJ9fSgpLHJiPUFycmF5LnByb3RvdHlwZSxkYT1FcnJvci5wcm90b3R5cGUsRz1PYmplY3QucHJvdG90eXBlLG9iPVN0cmluZy5wcm90b3R5cGUsTmE9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLHU9Ry5oYXNPd25Qcm9wZXJ0eSxBPUcudG9TdHJpbmcsTWE9UmVnRXhwKFwiXlwiK05hLmNhbGwodSkucmVwbGFjZSgvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2csXG5cIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLGZiPXguQXJyYXlCdWZmZXIsYmE9Ry5wcm9wZXJ0eUlzRW51bWVyYWJsZSxRYT1yYi5zcGxpY2Usa2E9eC5VaW50OEFycmF5LHNiPUZhKEFycmF5LFwiaXNBcnJheVwiKSxSYT1GYShPYmplY3QsXCJrZXlzXCIpLExhPU1hdGgubWF4LEhhPTkwMDcxOTkyNTQ3NDA5OTEsdz17fTt3W1JdPXguRmxvYXQzMkFycmF5O3dbU109eC5GbG9hdDY0QXJyYXk7d1tUXT14LkludDhBcnJheTt3W1VdPXguSW50MTZBcnJheTt3W1ZdPXguSW50MzJBcnJheTt3W1ddPWthO3dbWF09eC5VaW50OENsYW1wZWRBcnJheTt3W1ldPXguVWludDE2QXJyYXk7d1taXT14LlVpbnQzMkFycmF5O3ZhciBzPXt9O3NbRl09c1tLXT1zW01dPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9O3NbSl09c1tEXT17Y29uc3RydWN0b3I6dHJ1ZSxcbnRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0xdPXNbSF09c1tOXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlfTtzW3RdPXtjb25zdHJ1Y3Rvcjp0cnVlfTtyYShwYSxmdW5jdGlvbihhKXtmb3IodmFyIGIgaW4gcylpZih1LmNhbGwocyxiKSl7dmFyIGM9c1tiXTtjW2FdPXUuY2FsbChjLGEpfX0pO3ZhciBQPW4uc3VwcG9ydD17fTsoZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe3RoaXMueD1hfXZhciBjPXswOmEsbGVuZ3RoOmF9LGU9W107Yi5wcm90b3R5cGU9e3ZhbHVlT2Y6YSx5OmF9O2Zvcih2YXIgZCBpbiBuZXcgYillLnB1c2goZCk7UC5lbnVtRXJyb3JQcm9wcz1iYS5jYWxsKGRhLFwibWVzc2FnZVwiKXx8YmEuY2FsbChkYSxcIm5hbWVcIik7UC5lbnVtUHJvdG90eXBlcz1iYS5jYWxsKGIsXCJwcm90b3R5cGVcIik7UC5ub25FbnVtU2hhZG93cz0hL3ZhbHVlT2YvLnRlc3QoZSk7UC5zcGxpY2VPYmplY3RzPShRYS5jYWxsKGMsMCwxKSwhY1swXSk7UC51bmluZGV4ZWRDaGFycz1cInh4XCIhPVwieFwiWzBdK1xuT2JqZWN0KFwieFwiKVswXX0pKDEsMCk7dmFyIFphPWZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihiLGMsZSl7dmFyIGQ9eihiKTtlPWUoYik7Zm9yKHZhciBmPWUubGVuZ3RoLGg9YT9mOi0xO2E/aC0tOisraDxmOyl7dmFyIGc9ZVtoXTtpZihmYWxzZT09PWMoZFtnXSxnLGQpKWJyZWFrfXJldHVybiBifX0oKSxtYT1DYShcImxlbmd0aFwiKSx5PXNifHxmdW5jdGlvbihhKXtyZXR1cm4gQihhKSYmRShhLmxlbmd0aCkmJkEuY2FsbChhKT09Rn0scWE9ZnVuY3Rpb24oYSl7cmV0dXJuIG9hKGZ1bmN0aW9uKGIsYyl7dmFyIGU9LTEsZD1udWxsPT1iPzA6Yy5sZW5ndGgsZj0yPGQ/Y1tkLTJdOnAsaD0yPGQ/Y1syXTpwLGc9MTxkP2NbZC0xXTpwO3R5cGVvZiBmPT1cImZ1bmN0aW9uXCI/KGY9dWEoZixnLDUpLGQtPTIpOihmPXR5cGVvZiBnPT1cImZ1bmN0aW9uXCI/ZzpwLGQtPWY/MTowKTtoJiZJYShjWzBdLGNbMV0saCkmJihmPTM+ZD9wOmYsZD0xKTtmb3IoOysrZTxkOykoaD1jW2VdKSYmYShiLGgsXG5mKTtyZXR1cm4gYn0pfShmdW5jdGlvbihhLGIsYyl7aWYoYylmb3IodmFyIGU9LTEsZD1DKGIpLGY9ZC5sZW5ndGg7KytlPGY7KXt2YXIgaD1kW2VdLGc9YVtoXSxsPWMoZyxiW2hdLGgsYSxiKTsobD09PWw/bD09PWc6ZyE9PWcpJiYoZyE9PXB8fGggaW4gYSl8fChhW2hdPWwpfWVsc2UgYT1zYShhLGIpO3JldHVybiBhfSksdGI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gb2EoZnVuY3Rpb24oYyl7dmFyIGU9Y1swXTtpZihudWxsPT1lKXJldHVybiBlO2MucHVzaChiKTtyZXR1cm4gYS5hcHBseShwLGMpfSl9KHFhLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9PT1wP2I6YX0pLEM9UmE/ZnVuY3Rpb24oYSl7dmFyIGI9bnVsbD09YT9wOmEuY29uc3RydWN0b3I7cmV0dXJuIHR5cGVvZiBiPT1cImZ1bmN0aW9uXCImJmIucHJvdG90eXBlPT09YXx8KHR5cGVvZiBhPT1cImZ1bmN0aW9uXCI/bi5zdXBwb3J0LmVudW1Qcm90b3R5cGVzOm51bGwhPWEmJkUobWEoYSkpKT9KYShhKTp2KGEpP1JhKGEpOltdfTpcbkphO24uYXNzaWduPXFhO24uY2FsbGJhY2s9ZWE7bi5kZWZhdWx0cz10YjtuLmtleXM9QztuLmtleXNJbj1LYTtuLm1hdGNoZXM9T2E7bi5wYWlycz1FYTtuLnByb3BlcnR5PXdhO24ucmVtb3ZlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZT1bXTtpZighYXx8IWEubGVuZ3RoKXJldHVybiBlO3ZhciBkPS0xLGY9W10saD1hLmxlbmd0aCxnPW4uY2FsbGJhY2t8fGVhLGc9Zz09PWVhP3RhOmc7Zm9yKGI9ZyhiLGMsMyk7KytkPGg7KWM9YVtkXSxiKGMsZCxhKSYmKGUucHVzaChjKSxmLnB1c2goZCkpO2ZvcihiPWE/Zi5sZW5ndGg6MDtiLS07KWlmKGQ9ZltiXSxkIT1sJiYkKGQpKXt2YXIgbD1kO1FhLmNhbGwoYSxkLDEpfXJldHVybiBlfTtuLnJlc3RQYXJhbT1vYTtuLmV4dGVuZD1xYTtuLml0ZXJhdGVlPWVhO24uaWRlbnRpdHk9aGE7bi5pc0FyZ3VtZW50cz1uYTtuLmlzQXJyYXk9eTtuLmlzRnVuY3Rpb249Y2E7bi5pc05hdGl2ZT1HYTtuLmlzT2JqZWN0PXY7bi5pc1N0cmluZz1hYTtuLmlzVHlwZWRBcnJheT1cbmphO24ubGFzdD1CYTtuLlZFUlNJT049XCIzLjEwLjBcIjtnYSYmTyYmcWImJigoTy5leHBvcnRzPW4pLl89bil9LmNhbGwodGhpcykpOyIsIi8vICAgICB1dWlkLmpzXG4vL1xuLy8gICAgIENvcHlyaWdodCAoYykgMjAxMC0yMDEyIFJvYmVydCBLaWVmZmVyXG4vLyAgICAgTUlUIExpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIC8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBXZSBmZWF0dXJlXG4gIC8vIGRldGVjdCB0byBkZXRlcm1pbmUgdGhlIGJlc3QgUk5HIHNvdXJjZSwgbm9ybWFsaXppbmcgdG8gYSBmdW5jdGlvbiB0aGF0XG4gIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG4gIHZhciBfcm5nO1xuXG4gIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuICAvL1xuICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgX3JiID0gX2dsb2JhbC5yZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcztcbiAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIV9ybmcgJiYgX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFdIQVRXRyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICAgIC8vXG4gICAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgICB2YXIgX3JuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzOCk7XG4gICAgICByZXR1cm4gX3JuZHM4O1xuICAgIH07XG4gIH1cblxuICBpZiAoIV9ybmcpIHtcbiAgICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gICAgLy9cbiAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAgIC8vIHF1YWxpdHkuXG4gICAgdmFyICBfcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9ybmRzO1xuICAgIH07XG4gIH1cblxuICAvLyBCdWZmZXIgY2xhc3MgdG8gdXNlXG4gIHZhciBCdWZmZXJDbGFzcyA9IHR5cGVvZihfZ2xvYmFsLkJ1ZmZlcikgPT0gJ2Z1bmN0aW9uJyA/IF9nbG9iYWwuQnVmZmVyIDogQXJyYXk7XG5cbiAgLy8gTWFwcyBmb3IgbnVtYmVyIDwtPiBoZXggc3RyaW5nIGNvbnZlcnNpb25cbiAgdmFyIF9ieXRlVG9IZXggPSBbXTtcbiAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIF9ieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xuICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuICB9XG5cbiAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG4gIGZ1bmN0aW9uIHBhcnNlKHMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSAoYnVmICYmIG9mZnNldCkgfHwgMCwgaWkgPSAwO1xuXG4gICAgYnVmID0gYnVmIHx8IFtdO1xuICAgIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCBmdW5jdGlvbihvY3QpIHtcbiAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuICAgICAgICBidWZbaSArIGlpKytdID0gX2hleFRvQnl0ZVtvY3RdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWmVybyBvdXQgcmVtYWluaW5nIGJ5dGVzIGlmIHN0cmluZyB3YXMgc2hvcnRcbiAgICB3aGlsZSAoaWkgPCAxNikge1xuICAgICAgYnVmW2kgKyBpaSsrXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIC8vICoqYHVucGFyc2UoKWAgLSBDb252ZXJ0IFVVSUQgYnl0ZSBhcnJheSAoYWxhIHBhcnNlKCkpIGludG8gYSBzdHJpbmcqKlxuICBmdW5jdGlvbiB1bnBhcnNlKGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcbiAgICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xuICB9XG5cbiAgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuICAvL1xuICAvLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuICAvLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4gIC8vIHJhbmRvbSAjJ3Mgd2UgbmVlZCB0byBpbml0IG5vZGUgYW5kIGNsb2Nrc2VxXG4gIHZhciBfc2VlZEJ5dGVzID0gX3JuZygpO1xuXG4gIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICB2YXIgX25vZGVJZCA9IFtcbiAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcbiAgICBfc2VlZEJ5dGVzWzFdLCBfc2VlZEJ5dGVzWzJdLCBfc2VlZEJ5dGVzWzNdLCBfc2VlZEJ5dGVzWzRdLCBfc2VlZEJ5dGVzWzVdXG4gIF07XG5cbiAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgdmFyIF9jbG9ja3NlcSA9IChfc2VlZEJ5dGVzWzZdIDw8IDggfCBfc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcblxuICAvLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbiAgdmFyIF9sYXN0TVNlY3MgPSAwLCBfbGFzdE5TZWNzID0gMDtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGIgPSBidWYgfHwgW107XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT0gbnVsbCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7XG5cbiAgICAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAgIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gICAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cbiAgICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9IG51bGwgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gICAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcbiAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgICAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG4gICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblxuICAgIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgICAvLyB0aW1lIGludGVydmFsXG4gICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcbiAgICAgIG5zZWNzID0gMDtcbiAgICB9XG5cbiAgICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcbiAgICB9XG5cbiAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gICAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICAgIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gICAgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG4gICAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7XG5cbiAgICAvLyBgdGltZV9sb3dgXG4gICAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfbWlkYFxuICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcbiAgICBiW2krK10gPSB0bWggPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9oaWdoX2FuZF92ZXJzaW9uYFxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMjQgJiAweGYgfCAweDEwOyAvLyBpbmNsdWRlIHZlcnNpb25cbiAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAgIC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblxuICAgIC8vIGBjbG9ja19zZXFfbG93YFxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblxuICAgIC8vIGBub2RlYFxuICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyBuKyspIHtcbiAgICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmID8gYnVmIDogdW5wYXJzZShiKTtcbiAgfVxuXG4gIC8vICoqYHY0KClgIC0gR2VuZXJhdGUgcmFuZG9tIFVVSUQqKlxuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEJ1ZmZlckNsYXNzKDE2KSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXG4gICAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgICBpZiAoYnVmKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7IGlpKyspIHtcbiAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IHVucGFyc2Uocm5kcyk7XG4gIH1cblxuICAvLyBFeHBvcnQgcHVibGljIEFQSVxuICB2YXIgdXVpZCA9IHY0O1xuICB1dWlkLnYxID0gdjE7XG4gIHV1aWQudjQgPSB2NDtcbiAgdXVpZC5wYXJzZSA9IHBhcnNlO1xuICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuICB1dWlkLkJ1ZmZlckNsYXNzID0gQnVmZmVyQ2xhc3M7XG5cbiAgaWYgKHR5cGVvZihtb2R1bGUpICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gUHVibGlzaCBhcyBub2RlLmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gdXVpZDtcbiAgfSBlbHNlICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gUHVibGlzaCBhcyBBTUQgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiB1dWlkO30pO1xuIFxuXG4gIH0gZWxzZSB7XG4gICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuICAgIHZhciBfcHJldmlvdXNSb290ID0gX2dsb2JhbC51dWlkO1xuXG4gICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcbiAgICB1dWlkLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIF9nbG9iYWwudXVpZCA9IF9wcmV2aW91c1Jvb3Q7XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9O1xuXG4gICAgX2dsb2JhbC51dWlkID0gdXVpZDtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIE1hcmN1cyBXZXN0aW4gKi9cbihmdW5jdGlvbihlKXtmdW5jdGlvbiBvKCl7dHJ5e3JldHVybiByIGluIGUmJmVbcl19Y2F0Y2godCl7cmV0dXJuITF9fXZhciB0PXt9LG49ZS5kb2N1bWVudCxyPVwibG9jYWxTdG9yYWdlXCIsaT1cInNjcmlwdFwiLHM7dC5kaXNhYmxlZD0hMSx0LnZlcnNpb249XCIxLjMuMTdcIix0LnNldD1mdW5jdGlvbihlLHQpe30sdC5nZXQ9ZnVuY3Rpb24oZSx0KXt9LHQuaGFzPWZ1bmN0aW9uKGUpe3JldHVybiB0LmdldChlKSE9PXVuZGVmaW5lZH0sdC5yZW1vdmU9ZnVuY3Rpb24oZSl7fSx0LmNsZWFyPWZ1bmN0aW9uKCl7fSx0LnRyYW5zYWN0PWZ1bmN0aW9uKGUsbixyKXtyPT1udWxsJiYocj1uLG49bnVsbCksbj09bnVsbCYmKG49e30pO3ZhciBpPXQuZ2V0KGUsbik7cihpKSx0LnNldChlLGkpfSx0LmdldEFsbD1mdW5jdGlvbigpe30sdC5mb3JFYWNoPWZ1bmN0aW9uKCl7fSx0LnNlcmlhbGl6ZT1mdW5jdGlvbihlKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZSl9LHQuZGVzZXJpYWxpemU9ZnVuY3Rpb24oZSl7aWYodHlwZW9mIGUhPVwic3RyaW5nXCIpcmV0dXJuIHVuZGVmaW5lZDt0cnl7cmV0dXJuIEpTT04ucGFyc2UoZSl9Y2F0Y2godCl7cmV0dXJuIGV8fHVuZGVmaW5lZH19O2lmKG8oKSlzPWVbcl0sdC5zZXQ9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gbj09PXVuZGVmaW5lZD90LnJlbW92ZShlKToocy5zZXRJdGVtKGUsdC5zZXJpYWxpemUobikpLG4pfSx0LmdldD1mdW5jdGlvbihlLG4pe3ZhciByPXQuZGVzZXJpYWxpemUocy5nZXRJdGVtKGUpKTtyZXR1cm4gcj09PXVuZGVmaW5lZD9uOnJ9LHQucmVtb3ZlPWZ1bmN0aW9uKGUpe3MucmVtb3ZlSXRlbShlKX0sdC5jbGVhcj1mdW5jdGlvbigpe3MuY2xlYXIoKX0sdC5nZXRBbGw9ZnVuY3Rpb24oKXt2YXIgZT17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQsbil7ZVt0XT1ufSksZX0sdC5mb3JFYWNoPWZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248cy5sZW5ndGg7bisrKXt2YXIgcj1zLmtleShuKTtlKHIsdC5nZXQocikpfX07ZWxzZSBpZihuLmRvY3VtZW50RWxlbWVudC5hZGRCZWhhdmlvcil7dmFyIHUsYTt0cnl7YT1uZXcgQWN0aXZlWE9iamVjdChcImh0bWxmaWxlXCIpLGEub3BlbigpLGEud3JpdGUoXCI8XCIraStcIj5kb2N1bWVudC53PXdpbmRvdzwvXCIraSsnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+JyksYS5jbG9zZSgpLHU9YS53LmZyYW1lc1swXS5kb2N1bWVudCxzPXUuY3JlYXRlRWxlbWVudChcImRpdlwiKX1jYXRjaChmKXtzPW4uY3JlYXRlRWxlbWVudChcImRpdlwiKSx1PW4uYm9keX12YXIgbD1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgbj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7bi51bnNoaWZ0KHMpLHUuYXBwZW5kQ2hpbGQocykscy5hZGRCZWhhdmlvcihcIiNkZWZhdWx0I3VzZXJEYXRhXCIpLHMubG9hZChyKTt2YXIgaT1lLmFwcGx5KHQsbik7cmV0dXJuIHUucmVtb3ZlQ2hpbGQocyksaX19LGM9bmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLFwiZ1wiKTtmdW5jdGlvbiBoKGUpe3JldHVybiBlLnJlcGxhY2UoL15kLyxcIl9fXyQmXCIpLnJlcGxhY2UoYyxcIl9fX1wiKX10LnNldD1sKGZ1bmN0aW9uKGUsbixpKXtyZXR1cm4gbj1oKG4pLGk9PT11bmRlZmluZWQ/dC5yZW1vdmUobik6KGUuc2V0QXR0cmlidXRlKG4sdC5zZXJpYWxpemUoaSkpLGUuc2F2ZShyKSxpKX0pLHQuZ2V0PWwoZnVuY3Rpb24oZSxuLHIpe249aChuKTt2YXIgaT10LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKG4pKTtyZXR1cm4gaT09PXVuZGVmaW5lZD9yOml9KSx0LnJlbW92ZT1sKGZ1bmN0aW9uKGUsdCl7dD1oKHQpLGUucmVtb3ZlQXR0cmlidXRlKHQpLGUuc2F2ZShyKX0pLHQuY2xlYXI9bChmdW5jdGlvbihlKXt2YXIgdD1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2UubG9hZChyKTtmb3IodmFyIG49MCxpO2k9dFtuXTtuKyspZS5yZW1vdmVBdHRyaWJ1dGUoaS5uYW1lKTtlLnNhdmUocil9KSx0LmdldEFsbD1mdW5jdGlvbihlKXt2YXIgbj17fTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKGUsdCl7bltlXT10fSksbn0sdC5mb3JFYWNoPWwoZnVuY3Rpb24oZSxuKXt2YXIgcj1lLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzO2Zvcih2YXIgaT0wLHM7cz1yW2ldOysraSluKHMubmFtZSx0LmRlc2VyaWFsaXplKGUuZ2V0QXR0cmlidXRlKHMubmFtZSkpKX0pfXRyeXt2YXIgcD1cIl9fc3RvcmVqc19fXCI7dC5zZXQocCxwKSx0LmdldChwKSE9cCYmKHQuZGlzYWJsZWQ9ITApLHQucmVtb3ZlKHApfWNhdGNoKGYpe3QuZGlzYWJsZWQ9ITB9dC5lbmFibGVkPSF0LmRpc2FibGVkLHR5cGVvZiBtb2R1bGUhPVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzJiZ0aGlzLm1vZHVsZSE9PW1vZHVsZT9tb2R1bGUuZXhwb3J0cz10OnR5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZD9kZWZpbmUodCk6ZS5zdG9yZT10fSkoRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpKSIsInN0b3JlID0gcmVxdWlyZSgnc3RvcmUnKVxuXG4jIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBzdG9yZS5qcyBmb3IgZWFzeSBzd2FwcGluZ1xuY2xhc3MgU3RvcmFnZVxuICBjb25zdHJ1Y3RvcjogKEBuYW1lc3BhY2U9J2FsZXBoYmV0JykgLT5cbiAgICB0aHJvdyAnbG9jYWwgc3RvcmFnZSBub3Qgc3VwcG9ydGVkJyB1bmxlc3Mgc3RvcmUuZW5hYmxlZFxuICAgIEBzdG9yYWdlID0gc3RvcmUuZ2V0KEBuYW1lc3BhY2UpIHx8IHt9XG4gIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XSA9IHZhbHVlXG4gICAgc3RvcmUuc2V0KEBuYW1lc3BhY2UsIEBzdG9yYWdlKVxuICAgIHJldHVybiB2YWx1ZVxuICBnZXQ6IChrZXkpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XVxuICAgICMgc3RvcmUuZ2V0KFwiI3tAbmFtZXNwYWNlfToje2tleX1cIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIE5PVEU6IHVzaW5nIGEgY3VzdG9tIGJ1aWxkIG9mIGxvZGFzaCwgdG8gc2F2ZSBzcGFjZVxuXyA9IHJlcXVpcmUoJ2xvZGFzaC5jdXN0b20nKVxudXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpXG5cbmNsYXNzIFV0aWxzXG4gIEBkZWZhdWx0czogXy5kZWZhdWx0c1xuICBAa2V5czogXy5rZXlzXG4gIEByZW1vdmU6IF8ucmVtb3ZlXG4gIEBzZXRfZGVidWc6IChAZGVidWcpIC0+XG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIEBkZWJ1Z1xuICBAdXVpZDogdXVpZC52NFxuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzXG4iXX0=
