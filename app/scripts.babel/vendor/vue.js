/*!
 * Vue.js v2.2.2
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Vue = factory());
})(this, (() => {
	'use strict';

/*  */

/**
 * Convert a value to a string that is actually rendered.
 */
	function _toString(val) {
		return val == null ?
    '' :
    typeof val === 'object' ?
      JSON.stringify(val, null, 2) :
      String(val);
	}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
	function toNumber(val) {
		const n = parseFloat(val);
		return isNaN(n) ? val : n;
	}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
	function makeMap(
		str,
		expectsLowerCase
) {
		const map = Object.create(null);
		const list = str.split(',');
		for (let i = 0; i < list.length; i++) {
			map[list[i]] = true;
		}
		return expectsLowerCase ?
    function (val) {
	return map[val.toLowerCase()];
} :
    function (val) {
	return map[val];
};
	}

/**
 * Check if a tag is a built-in tag.
 */
	const isBuiltInTag = makeMap('slot,component', true);

/**
 * Remove an item from an array
 */
	function remove(arr, item) {
		if (arr.length) {
			const index = arr.indexOf(item);
			if (index > -1) {
				return arr.splice(index, 1);
			}
		}
	}

/**
 * Check whether the object has the property.
 */
	const hasOwnProperty = Object.prototype.hasOwnProperty;
	function hasOwn(obj, key) {
		return hasOwnProperty.call(obj, key);
	}

/**
 * Check if value is primitive
 */
	function isPrimitive(value) {
		return typeof value === 'string' || typeof value === 'number';
	}

/**
 * Create a cached version of a pure function.
 */
	function cached(fn) {
		const cache = Object.create(null);
		return (function cachedFn(str) {
			const hit = cache[str];
			return hit || (cache[str] = fn(str));
		});
	}

/**
 * Camelize a hyphen-delimited string.
 */
	const camelizeRE = /-(\w)/g;
	const camelize = cached(str => {
		return str.replace(camelizeRE, (_, c) => {
			return c ? c.toUpperCase() : '';
		});
	});

/**
 * Capitalize a string.
 */
	const capitalize = cached(str => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	});

/**
 * Hyphenate a camelCase string.
 */
	const hyphenateRE = /([^-])([A-Z])/g;
	const hyphenate = cached(str => {
		return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase();
	});

/**
 * Simple bind, faster than native
 */
	function bind(fn, ctx) {
		function boundFn(a) {
			const l = arguments.length;
			return l ?
      l > 1 ?
        fn.apply(ctx, arguments) :
        fn.call(ctx, a) :
      fn.call(ctx);
		}
  // Record original fn length
		boundFn._length = fn.length;
		return boundFn;
	}

/**
 * Convert an Array-like object to a real Array.
 */
	function toArray(list, start) {
		start = start || 0;
		let i = list.length - start;
		const ret = new Array(i);
		while (i--) {
			ret[i] = list[i + start];
		}
		return ret;
	}

/**
 * Mix properties into target object.
 */
	function extend(to, _from) {
		for (const key in _from) {
			to[key] = _from[key];
		}
		return to;
	}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
	function isObject(obj) {
		return obj !== null && typeof obj === 'object';
	}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
	const toString = Object.prototype.toString;
	const OBJECT_STRING = '[object Object]';
	function isPlainObject(obj) {
		return toString.call(obj) === OBJECT_STRING;
	}

/**
 * Merge an Array of Objects into a single Object.
 */
	function toObject(arr) {
		const res = {};
		for (let i = 0; i < arr.length; i++) {
			if (arr[i]) {
				extend(res, arr[i]);
			}
		}
		return res;
	}

/**
 * Perform no operation.
 */
	function noop() {}

/**
 * Always return false.
 */
	const no = function () {
		return false;
	};

/**
 * Return same value
 */
	const identity = function (_) {
		return _;
	};

/**
 * Generate a static keys string from compiler modules.
 */
	function genStaticKeys(modules) {
		return modules.reduce((keys, m) => {
			return keys.concat(m.staticKeys || []);
		}, []).join(',');
	}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
	function looseEqual(a, b) {
		const isObjectA = isObject(a);
		const isObjectB = isObject(b);
		if (isObjectA && isObjectB) {
			try {
				return JSON.stringify(a) === JSON.stringify(b);
			} catch (e) {
      // Possible circular reference
				return a === b;
			}
		} else if (!isObjectA && !isObjectB) {
			return String(a) === String(b);
		} else {
			return false;
		}
	}

	function looseIndexOf(arr, val) {
		for (let i = 0; i < arr.length; i++) {
			if (looseEqual(arr[i], val)) {
				return i;
			}
		}
		return -1;
	}

/**
 * Ensure a function is called only once.
 */
	function once(fn) {
		let called = false;
		return function () {
			if (!called) {
				called = true;
				fn();
			}
		};
	}

/*  */

	const config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
		optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
		silent: false,

  /**
   * Show production mode tip message on boot?
   */
		productionTip: 'development' !== 'production',

  /**
   * Whether to enable devtools
   */
		devtools: 'development' !== 'production',

  /**
   * Whether to record perf
   */
		performance: 'development' !== 'production',

  /**
   * Error handler for watcher errors
   */
		errorHandler: null,

  /**
   * Ignore certain custom elements
   */
		ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
		keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
		isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
		isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
		getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
		parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
		mustUseProp: no,

  /**
   * List of asset types that a component can own.
   */
		_assetTypes: [
			'component',
			'directive',
			'filter'
		],

  /**
   * List of lifecycle hooks.
   */
		_lifecycleHooks: [
			'beforeCreate',
			'created',
			'beforeMount',
			'mounted',
			'beforeUpdate',
			'updated',
			'beforeDestroy',
			'destroyed',
			'activated',
			'deactivated'
		],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
		_maxUpdateCount: 100
	};

/*  */
/* globals MutationObserver */

// can we use __proto__?
	const hasProto = '__proto__' in {};

// Browser environment sniffing
	const inBrowser = typeof window !== 'undefined';
	const UA = inBrowser && window.navigator.userAgent.toLowerCase();
	const isIE = UA && /msie|trident/.test(UA);
	const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
	const isEdge = UA && UA.indexOf('edge/') > 0;
	const isAndroid = UA && UA.indexOf('android') > 0;
	const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
	const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// This needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
	let _isServer;
	const isServerRendering = function () {
		if (_isServer === undefined) {
    /* istanbul ignore if */
			if (!inBrowser && typeof global !== 'undefined') {
      // Detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
				_isServer = global.process.env.VUE_ENV === 'server';
			} else {
				_isServer = false;
			}
		}
		return _isServer;
	};

// Detect devtools
	const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
	function isNative(Ctor) {
		return /native code/.test(Ctor.toString());
	}

	const hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

/**
 * Defer a task to execute it asynchronously.
 */
	const nextTick = (function () {
		const callbacks = [];
		let pending = false;
		let timerFunc;

		function nextTickHandler() {
			pending = false;
			const copies = callbacks.slice(0);
			callbacks.length = 0;
			for (let i = 0; i < copies.length; i++) {
				copies[i]();
			}
		}

  // The nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
		if (typeof Promise !== 'undefined' && isNative(Promise)) {
			const p = Promise.resolve();
			const logError = function (err) {
				console.error(err);
			};
			timerFunc = function () {
				p.then(nextTickHandler).catch(logError);
      // In problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
				if (isIOS) {
					setTimeout(noop);
				}
			};
		} else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
			let counter = 1;
			const observer = new MutationObserver(nextTickHandler);
			const textNode = document.createTextNode(String(counter));
			observer.observe(textNode, {
				characterData: true
			});
			timerFunc = function () {
				counter = (counter + 1) % 2;
				textNode.data = String(counter);
			};
		} else {
    // Fallback to setTimeout
    /* istanbul ignore next */
			timerFunc = function () {
				setTimeout(nextTickHandler, 0);
			};
		}

		return function queueNextTick(cb, ctx) {
			let _resolve;
			callbacks.push(() => {
				if (cb) {
					cb.call(ctx);
				}
				if (_resolve) {
					_resolve(ctx);
				}
			});
			if (!pending) {
				pending = true;
				timerFunc();
			}
			if (!cb && typeof Promise !== 'undefined') {
				return new Promise(resolve => {
					_resolve = resolve;
				});
			}
		};
	})();

	let _Set;
/* istanbul ignore if */
	if (typeof Set !== 'undefined' && isNative(Set)) {
  // Use native Set when available.
		_Set = Set;
	} else {
  // A non-standard Set polyfill that only works with primitive keys.
		_Set = (function () {
			function Set() {
				this.set = Object.create(null);
			}
			Set.prototype.has = function has(key) {
				return this.set[key] === true;
			};
			Set.prototype.add = function add(key) {
				this.set[key] = true;
			};
			Set.prototype.clear = function clear() {
				this.set = Object.create(null);
			};

			return Set;
		})();
	}

	let perf;

	{
		perf = inBrowser && window.performance;
		if (perf && (!perf.mark || !perf.measure)) {
			perf = undefined;
		}
	}

/*  */

	const emptyObject = Object.freeze({});

/**
 * Check if a string starts with $ or _
 */
	function isReserved(str) {
		const c = (String(str)).charCodeAt(0);
		return c === 0x24 || c === 0x5F;
	}

/**
 * Define a property.
 */
	function def(obj, key, val, enumerable) {
		Object.defineProperty(obj, key, {
			value: val,
			enumerable: Boolean(enumerable),
			writable: true,
			configurable: true
		});
	}

/**
 * Parse simple path.
 */
	const bailRE = /[^\w.$]/;
	function parsePath(path) {
		if (bailRE.test(path)) {
			return;
		}
		const segments = path.split('.');
		return function (obj) {
			for (let i = 0; i < segments.length; i++) {
				if (!obj) {
					return;
				}
				obj = obj[segments[i]];
			}
			return obj;
		};
	}

	let warn = noop;
	let tip = noop;
	let formatComponentName;

	{
		const hasConsole = typeof console !== 'undefined';
		const classifyRE = /(?:^|[-_])(\w)/g;
		const classify = function (str) {
			return str
    .replace(classifyRE, c => {
	return c.toUpperCase();
})
    .replace(/[-_]/g, '');
		};

		warn = function (msg, vm) {
			if (hasConsole && (!config.silent)) {
				console.error('[Vue warn]: ' + msg + ' ' + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ));
			}
		};

		tip = function (msg, vm) {
			if (hasConsole && (!config.silent)) {
				console.warn('[Vue tip]: ' + msg + ' ' + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ));
			}
		};

		formatComponentName = function (vm, includeFile) {
			if (vm.$root === vm) {
				return '<Root>';
			}
			let name = vm._isVue ?
      vm.$options.name || vm.$options._componentTag :
      vm.name;

			const file = vm._isVue && vm.$options.__file;
			if (!name && file) {
				const match = file.match(/([^/\\]+)\.vue$/);
				name = match && match[1];
			}

			return (
      (name ? ('<' + (classify(name)) + '>') : '<Anonymous>') +
      (file && includeFile !== false ? (' at ' + file) : '')
			);
		};

		var formatLocation = function (str) {
			if (str === '<Anonymous>') {
				str += ' - use the "name" option for better debugging messages.';
			}
			return ('\n(found in ' + str + ')');
		};
	}

/*  */

	let uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
	const Dep = function Dep() {
		this.id = uid$1++;
		this.subs = [];
	};

	Dep.prototype.addSub = function addSub(sub) {
		this.subs.push(sub);
	};

	Dep.prototype.removeSub = function removeSub(sub) {
		remove(this.subs, sub);
	};

	Dep.prototype.depend = function depend() {
		if (Dep.target) {
			Dep.target.addDep(this);
		}
	};

	Dep.prototype.notify = function notify() {
  // Stabilize the subscriber list first
		const subs = this.subs.slice();
		for (let i = 0, l = subs.length; i < l; i++) {
			subs[i].update();
		}
	};

// The current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
	Dep.target = null;
	const targetStack = [];

	function pushTarget(_target) {
		if (Dep.target) {
			targetStack.push(Dep.target);
		}
		Dep.target = _target;
	}

	function popTarget() {
		Dep.target = targetStack.pop();
	}

/*
 * Not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

	const arrayProto = Array.prototype;
	const arrayMethods = Object.create(arrayProto); [
		'push',
		'pop',
		'shift',
		'unshift',
		'splice',
		'sort',
		'reverse'
	]
.forEach(method => {
  // Cache original method
	const original = arrayProto[method];
	def(arrayMethods, method, function mutator() {
		const arguments$1 = arguments;

    // Avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
		let i = arguments.length;
		const args = new Array(i);
		while (i--) {
			args[i] = arguments$1[i];
		}
		const result = original.apply(this, args);
		const ob = this.__ob__;
		let inserted;
		switch (method) {
			case 'push':
				inserted = args;
				break;
			case 'unshift':
				inserted = args;
				break;
			case 'splice':
				inserted = args.slice(2);
				break;
		}
		if (inserted) {
			ob.observeArray(inserted);
		}
    // Notify change
		ob.dep.notify();
		return result;
	});
});

/*  */

	const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
	const observerState = {
		shouldConvert: true,
		isSettingProps: false
	};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
	const Observer = function Observer(value) {
		this.value = value;
		this.dep = new Dep();
		this.vmCount = 0;
		def(value, '__ob__', this);
		if (Array.isArray(value)) {
			const augment = hasProto ?
      protoAugment :
      copyAugment;
			augment(value, arrayMethods, arrayKeys);
			this.observeArray(value);
		} else {
			this.walk(value);
		}
	};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
	Observer.prototype.walk = function walk(obj) {
		const keys = Object.keys(obj);
		for (let i = 0; i < keys.length; i++) {
			defineReactive$$1(obj, keys[i], obj[keys[i]]);
		}
	};

/**
 * Observe a list of Array items.
 */
	Observer.prototype.observeArray = function observeArray(items) {
		for (let i = 0, l = items.length; i < l; i++) {
			observe(items[i]);
		}
	};

// Helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
	function protoAugment(target, src) {
  /* eslint-disable no-proto */
		target.__proto__ = src;
  /* eslint-enable no-proto */
	}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
	function copyAugment(target, src, keys) {
		for (let i = 0, l = keys.length; i < l; i++) {
			const key = keys[i];
			def(target, key, src[key]);
		}
	}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
	function observe(value, asRootData) {
		if (!isObject(value)) {
			return;
		}
		let ob;
		if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
			ob = value.__ob__;
		} else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
			ob = new Observer(value);
		}
		if (asRootData && ob) {
			ob.vmCount++;
		}
		return ob;
	}

/**
 * Define a reactive property on an Object.
 */
	function defineReactive$$1(
		obj,
		key,
		val,
		customSetter
) {
		const dep = new Dep();

		const property = Object.getOwnPropertyDescriptor(obj, key);
		if (property && property.configurable === false) {
			return;
		}

  // Cater for pre-defined getter/setters
		const getter = property && property.get;
		const setter = property && property.set;

		let childOb = observe(val);
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,
			get: function reactiveGetter() {
				const value = getter ? getter.call(obj) : val;
				if (Dep.target) {
					dep.depend();
					if (childOb) {
						childOb.dep.depend();
					}
					if (Array.isArray(value)) {
						dependArray(value);
					}
				}
				return value;
			},
			set: function reactiveSetter(newVal) {
				const value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
				if (newVal === value || (newVal !== newVal && value !== value)) {
					return;
				}
      /* eslint-enable no-self-compare */
				if ('development' !== 'production' && customSetter) {
					customSetter();
				}
				if (setter) {
					setter.call(obj, newVal);
				} else {
					val = newVal;
				}
				childOb = observe(newVal);
				dep.notify();
			}
		});
	}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
	function set(target, key, val) {
		if (Array.isArray(target)) {
			target.length = Math.max(target.length, key);
			target.splice(key, 1, val);
			return val;
		}
		if (hasOwn(target, key)) {
			target[key] = val;
			return val;
		}
		const ob = target.__ob__;
		if (target._isVue || (ob && ob.vmCount)) {
			'development' !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
			return val;
		}
		if (!ob) {
			target[key] = val;
			return val;
		}
		defineReactive$$1(ob.value, key, val);
		ob.dep.notify();
		return val;
	}

/**
 * Delete a property and trigger change if necessary.
 */
	function del(target, key) {
		if (Array.isArray(target)) {
			target.splice(key, 1);
			return;
		}
		const ob = target.__ob__;
		if (target._isVue || (ob && ob.vmCount)) {
			'development' !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
			return;
		}
		if (!hasOwn(target, key)) {
			return;
		}
		delete target[key];
		if (!ob) {
			return;
		}
		ob.dep.notify();
	}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
	function dependArray(value) {
		for (let e = (void 0), i = 0, l = value.length; i < l; i++) {
			e = value[i];
			e && e.__ob__ && e.__ob__.dep.depend();
			if (Array.isArray(e)) {
				dependArray(e);
			}
		}
	}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
	const strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
	{
		strats.el = strats.propsData = function (parent, child, vm, key) {
			if (!vm) {
				warn(
        'option "' + key + '" can only be used during instance ' +
        'creation with the `new` keyword.'
      );
			}
			return defaultStrat(parent, child);
		};
	}

/**
 * Helper that recursively merges two data objects together.
 */
	function mergeData(to, from) {
		if (!from) {
			return to;
		}
		let key, toVal, fromVal;
		const keys = Object.keys(from);
		for (let i = 0; i < keys.length; i++) {
			key = keys[i];
			toVal = to[key];
			fromVal = from[key];
			if (!hasOwn(to, key)) {
				set(to, key, fromVal);
			} else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
				mergeData(toVal, fromVal);
			}
		}
		return to;
	}

/**
 * Data
 */
	strats.data = function (
		parentVal,
		childVal,
		vm
) {
		if (!vm) {
    // In a Vue.extend merge, both should be functions
			if (!childVal) {
				return parentVal;
			}
			if (typeof childVal !== 'function') {
				'development' !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );
				return parentVal;
			}
			if (!parentVal) {
				return childVal;
			}
    // When parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
			return function mergedDataFn() {
				return mergeData(
        childVal.call(this),
        parentVal.call(this)
      );
			};
		} else if (parentVal || childVal) {
			return function mergedInstanceDataFn() {
      // Instance merge
				const instanceData = typeof childVal === 'function' ?
        childVal.call(vm) :
        childVal;
				const defaultData = typeof parentVal === 'function' ?
        parentVal.call(vm) :
        undefined;
				if (instanceData) {
					return mergeData(instanceData, defaultData);
				}
				return defaultData;
			};
		}
	};

/**
 * Hooks and props are merged as arrays.
 */
	function mergeHook(
		parentVal,
		childVal
) {
		return childVal ?
    parentVal ?
      parentVal.concat(childVal) :
      Array.isArray(childVal) ?
        childVal :
        [childVal] :
    parentVal;
	}

	config._lifecycleHooks.forEach(hook => {
		strats[hook] = mergeHook;
	});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
	function mergeAssets(parentVal, childVal) {
		const res = Object.create(parentVal || null);
		return childVal ?
    extend(res, childVal) :
    res;
	}

	config._assetTypes.forEach(type => {
		strats[type + 's'] = mergeAssets;
	});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
	strats.watch = function (parentVal, childVal) {
  /* istanbul ignore if */
		if (!childVal) {
			return Object.create(parentVal || null);
		}
		if (!parentVal) {
			return childVal;
		}
		const ret = {};
		extend(ret, parentVal);
		for (const key in childVal) {
			let parent = ret[key];
			const child = childVal[key];
			if (parent && !Array.isArray(parent)) {
				parent = [parent];
			}
			ret[key] = parent ?
      parent.concat(child) :
      [child];
		}
		return ret;
	};

/**
 * Other object hashes.
 */
	strats.props =
strats.methods =
strats.computed = function (parentVal, childVal) {
	if (!childVal) {
		return Object.create(parentVal || null);
	}
	if (!parentVal) {
		return childVal;
	}
	const ret = Object.create(null);
	extend(ret, parentVal);
	extend(ret, childVal);
	return ret;
};

/**
 * Default strategy.
 */
	var defaultStrat = function (parentVal, childVal) {
		return childVal === undefined ?
    parentVal :
    childVal;
	};

/**
 * Validate component names
 */
	function checkComponents(options) {
		for (const key in options.components) {
			const lower = key.toLowerCase();
			if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
				warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      );
			}
		}
	}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
	function normalizeProps(options) {
		const props = options.props;
		if (!props) {
			return;
		}
		const res = {};
		let i, val, name;
		if (Array.isArray(props)) {
			i = props.length;
			while (i--) {
				val = props[i];
				if (typeof val === 'string') {
					name = camelize(val);
					res[name] = {type: null};
				} else {
					warn('props must be strings when using array syntax.');
				}
			}
		} else if (isPlainObject(props)) {
			for (const key in props) {
				val = props[key];
				name = camelize(key);
				res[name] = isPlainObject(val) ?
        val :
        {type: val};
			}
		}
		options.props = res;
	}

/**
 * Normalize raw function directives into object format.
 */
	function normalizeDirectives(options) {
		const dirs = options.directives;
		if (dirs) {
			for (const key in dirs) {
				const def = dirs[key];
				if (typeof def === 'function') {
					dirs[key] = {bind: def, update: def};
				}
			}
		}
	}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
	function mergeOptions(
		parent,
		child,
		vm
) {
		{
			checkComponents(child);
		}
		normalizeProps(child);
		normalizeDirectives(child);
		const extendsFrom = child.extends;
		if (extendsFrom) {
			parent = typeof extendsFrom === 'function' ?
      mergeOptions(parent, extendsFrom.options, vm) :
      mergeOptions(parent, extendsFrom, vm);
		}
		if (child.mixins) {
			for (let i = 0, l = child.mixins.length; i < l; i++) {
				let mixin = child.mixins[i];
				if (mixin.prototype instanceof Vue$3) {
					mixin = mixin.options;
				}
				parent = mergeOptions(parent, mixin, vm);
			}
		}
		const options = {};
		let key;
		for (key in parent) {
			mergeField(key);
		}
		for (key in child) {
			if (!hasOwn(parent, key)) {
				mergeField(key);
			}
		}
		function mergeField(key) {
			const strat = strats[key] || defaultStrat;
			options[key] = strat(parent[key], child[key], vm, key);
		}
		return options;
	}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
	function resolveAsset(
		options,
		type,
		id,
		warnMissing
) {
  /* istanbul ignore if */
		if (typeof id !== 'string') {
			return;
		}
		const assets = options[type];
  // Check local registration variations first
		if (hasOwn(assets, id)) {
			return assets[id];
		}
		const camelizedId = camelize(id);
		if (hasOwn(assets, camelizedId)) {
			return assets[camelizedId];
		}
		const PascalCaseId = capitalize(camelizedId);
		if (hasOwn(assets, PascalCaseId)) {
			return assets[PascalCaseId];
		}
  // Fallback to prototype chain
		const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
		if ('development' !== 'production' && warnMissing && !res) {
			warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
		}
		return res;
	}

/*  */

	function validateProp(
		key,
		propOptions,
		propsData,
		vm
) {
		const prop = propOptions[key];
		const absent = !hasOwn(propsData, key);
		let value = propsData[key];
  // Handle boolean props
		if (isType(Boolean, prop.type)) {
			if (absent && !hasOwn(prop, 'default')) {
				value = false;
			} else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
				value = true;
			}
		}
  // Check default value
		if (value === undefined) {
			value = getPropDefaultValue(vm, prop, key);
    // Since the default value is a fresh copy,
    // make sure to observe it.
			const prevShouldConvert = observerState.shouldConvert;
			observerState.shouldConvert = true;
			observe(value);
			observerState.shouldConvert = prevShouldConvert;
		}
		{
			assertProp(prop, key, value, vm, absent);
		}
		return value;
	}

/**
 * Get the default value of a prop.
 */
	function getPropDefaultValue(vm, prop, key) {
  // No default, return undefined
		if (!hasOwn(prop, 'default')) {
			return undefined;
		}
		const def = prop.default;
  // Warn against non-factory defaults for Object & Array
		if ('development' !== 'production' && isObject(def)) {
			warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
		}
  // The raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
		if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined) {
			return vm._props[key];
		}
  // Call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
		return typeof def === 'function' && getType(prop.type) !== 'Function' ?
    def.call(vm) :
    def;
	}

/**
 * Assert whether a prop is valid.
 */
	function assertProp(
		prop,
		name,
		value,
		vm,
		absent
) {
		if (prop.required && absent) {
			warn(
      'Missing required prop: "' + name + '"',
      vm
    );
			return;
		}
		if (value == null && !prop.required) {
			return;
		}
		let type = prop.type;
		let valid = !type || type === true;
		const expectedTypes = [];
		if (type) {
			if (!Array.isArray(type)) {
				type = [type];
			}
			for (let i = 0; i < type.length && !valid; i++) {
				const assertedType = assertType(value, type[i]);
				expectedTypes.push(assertedType.expectedType || '');
				valid = assertedType.valid;
			}
		}
		if (!valid) {
			warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    );
			return;
		}
		const validator = prop.validator;
		if (validator) {
			if (!validator(value)) {
				warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
			}
		}
	}

/**
 * Assert the type of a value
 */
	function assertType(value, type) {
		let valid;
		let expectedType = getType(type);
		if (expectedType === 'String') {
			valid = typeof value === (expectedType = 'string');
		} else if (expectedType === 'Number') {
			valid = typeof value === (expectedType = 'number');
		} else if (expectedType === 'Boolean') {
			valid = typeof value === (expectedType = 'boolean');
		} else if (expectedType === 'Function') {
			valid = typeof value === (expectedType = 'function');
		} else if (expectedType === 'Object') {
			valid = isPlainObject(value);
		} else if (expectedType === 'Array') {
			valid = Array.isArray(value);
		} else {
			valid = value instanceof type;
		}
		return {
			valid,
			expectedType
		};
	}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
	function getType(fn) {
		const match = fn && fn.toString().match(/^\s*function (\w+)/);
		return match && match[1];
	}

	function isType(type, fn) {
		if (!Array.isArray(fn)) {
			return getType(fn) === getType(type);
		}
		for (let i = 0, len = fn.length; i < len; i++) {
			if (getType(fn[i]) === getType(type)) {
				return true;
			}
		}
  /* istanbul ignore next */
		return false;
	}

	function handleError(err, vm, info) {
		if (config.errorHandler) {
			config.errorHandler.call(null, err, vm, info);
		} else {
			{
				warn(('Error in ' + info + ':'), vm);
			}
    /* istanbul ignore else */
			if (inBrowser && typeof console !== 'undefined') {
				console.error(err);
			} else {
				throw err;
			}
		}
	}

/* Not type checking this file because flow doesn't play well with Proxy */

	let initProxy;

	{
		const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // For Webpack/Browserify
  );

		const warnNonPresent = function (target, key) {
			warn(
      'Property or method "' + key + '" is not defined on the instance but ' +
      'referenced during render. Make sure to declare reactive data ' +
      'properties in the data option.',
      target
    );
		};

		const hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/);

		if (hasProxy) {
			const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
			config.keyCodes = new Proxy(config.keyCodes, {
				set: function set(target, key, value) {
					if (isBuiltInModifier(key)) {
						warn(('Avoid overwriting built-in modifier in config.keyCodes: .' + key));
						return false;
					}
					target[key] = value;
					return true;
				}
			});
		}

		const hasHandler = {
			has: function has(target, key) {
				const has = key in target;
				const isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
				if (!has && !isAllowed) {
					warnNonPresent(target, key);
				}
				return has || !isAllowed;
			}
		};

		const getHandler = {
			get: function get(target, key) {
				if (typeof key === 'string' && !(key in target)) {
					warnNonPresent(target, key);
				}
				return target[key];
			}
		};

		initProxy = function initProxy(vm) {
			if (hasProxy) {
      // Determine which proxy handler to use
				const options = vm.$options;
				const handlers = options.render && options.render._withStripped ?
        getHandler :
        hasHandler;
				vm._renderProxy = new Proxy(vm, handlers);
			} else {
				vm._renderProxy = vm;
			}
		};
	}

/*  */

	const VNode = function VNode(
		tag,
		data,
		children,
		text,
		elm,
		context,
		componentOptions
) {
		this.tag = tag;
		this.data = data;
		this.children = children;
		this.text = text;
		this.elm = elm;
		this.ns = undefined;
		this.context = context;
		this.functionalContext = undefined;
		this.key = data && data.key;
		this.componentOptions = componentOptions;
		this.componentInstance = undefined;
		this.parent = undefined;
		this.raw = false;
		this.isStatic = false;
		this.isRootInsert = true;
		this.isComment = false;
		this.isCloned = false;
		this.isOnce = false;
	};

	const prototypeAccessors = {child: {}};

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
	prototypeAccessors.child.get = function () {
		return this.componentInstance;
	};

	Object.defineProperties(VNode.prototype, prototypeAccessors);

	const createEmptyVNode = function () {
		const node = new VNode();
		node.text = '';
		node.isComment = true;
		return node;
	};

	function createTextVNode(val) {
		return new VNode(undefined, undefined, undefined, String(val));
	}

// Optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
	function cloneVNode(vnode) {
		const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions
  );
		cloned.ns = vnode.ns;
		cloned.isStatic = vnode.isStatic;
		cloned.key = vnode.key;
		cloned.isCloned = true;
		return cloned;
	}

	function cloneVNodes(vnodes) {
		const len = vnodes.length;
		const res = new Array(len);
		for (let i = 0; i < len; i++) {
			res[i] = cloneVNode(vnodes[i]);
		}
		return res;
	}

/*  */

	const normalizeEvent = cached(name => {
		const once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
		name = once$$1 ? name.slice(1) : name;
		const capture = name.charAt(0) === '!';
		name = capture ? name.slice(1) : name;
		return {
			name,
			once: once$$1,
			capture
		};
	});

	function createFnInvoker(fns) {
		function invoker() {
			const arguments$1 = arguments;

			const fns = invoker.fns;
			if (Array.isArray(fns)) {
				for (let i = 0; i < fns.length; i++) {
					fns[i].apply(null, arguments$1);
				}
			} else {
      // Return handler return value for single handlers
				return fns.apply(null, arguments);
			}
		}
		invoker.fns = fns;
		return invoker;
	}

	function updateListeners(
		on,
		oldOn,
		add,
		remove$$1,
		vm
) {
		let name, cur, old, event;
		for (name in on) {
			cur = on[name];
			old = oldOn[name];
			event = normalizeEvent(name);
			if (!cur) {
				'development' !== 'production' && warn(
        'Invalid handler for event "' + (event.name) + '": got ' + String(cur),
        vm
      );
			} else if (!old) {
				if (!cur.fns) {
					cur = on[name] = createFnInvoker(cur);
				}
				add(event.name, cur, event.once, event.capture);
			} else if (cur !== old) {
				old.fns = cur;
				on[name] = old;
			}
		}
		for (name in oldOn) {
			if (!on[name]) {
				event = normalizeEvent(name);
				remove$$1(event.name, oldOn[name], event.capture);
			}
		}
	}

/*  */

	function mergeVNodeHook(def, hookKey, hook) {
		let invoker;
		const oldHook = def[hookKey];

		function wrappedHook() {
			hook.apply(this, arguments);
    // Important: remove merged hook to ensure it's called only once
    // and prevent memory leak
			remove(invoker.fns, wrappedHook);
		}

		if (!oldHook) {
    // No existing hook
			invoker = createFnInvoker([wrappedHook]);
		} else {
    /* istanbul ignore if */
			if (oldHook.fns && oldHook.merged) {
      // Already a merged invoker
				invoker = oldHook;
				invoker.fns.push(wrappedHook);
			} else {
      // Existing plain hook
				invoker = createFnInvoker([oldHook, wrappedHook]);
			}
		}

		invoker.merged = true;
		def[hookKey] = invoker;
	}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
	function simpleNormalizeChildren(children) {
		for (let i = 0; i < children.length; i++) {
			if (Array.isArray(children[i])) {
				return Array.prototype.concat.apply([], children);
			}
		}
		return children;
	}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
	function normalizeChildren(children) {
		return isPrimitive(children) ?
    [createTextVNode(children)] :
    Array.isArray(children) ?
      normalizeArrayChildren(children) :
      undefined;
	}

	function normalizeArrayChildren(children, nestedIndex) {
		const res = [];
		let i, c, last;
		for (i = 0; i < children.length; i++) {
			c = children[i];
			if (c == null || typeof c === 'boolean') {
				continue;
			}
			last = res[res.length - 1];
    //  Nested
			if (Array.isArray(c)) {
				res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + '_' + i)));
			} else if (isPrimitive(c)) {
				if (last && last.text) {
					last.text += String(c);
				} else if (c !== '') {
        // Convert primitive to vnode
					res.push(createTextVNode(c));
				}
			} else if (c.text && last && last.text) {
				res[res.length - 1] = createTextVNode(last.text + c.text);
			} else {
        // Default key for nested array children (likely generated by v-for)
				if (c.tag && c.key == null && nestedIndex != null) {
					c.key = '__vlist' + nestedIndex + '_' + i + '__';
				}
				res.push(c);
			}
		}
		return res;
	}

/*  */

	function getFirstComponentChild(children) {
		return children && children.filter(c => {
			return c && c.componentOptions;
		})[0];
	}

/*  */

	function initEvents(vm) {
		vm._events = Object.create(null);
		vm._hasHookEvent = false;
  // Init parent attached events
		const listeners = vm.$options._parentListeners;
		if (listeners) {
			updateComponentListeners(vm, listeners);
		}
	}

	let target;

	function add(event, fn, once$$1) {
		if (once$$1) {
			target.$once(event, fn);
		} else {
			target.$on(event, fn);
		}
	}

	function remove$1(event, fn) {
		target.$off(event, fn);
	}

	function updateComponentListeners(
		vm,
		listeners,
		oldListeners
) {
		target = vm;
		updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
	}

	function eventsMixin(Vue) {
		const hookRE = /^hook:/;
		Vue.prototype.$on = function (event, fn) {
			const this$1 = this;

			const vm = this;
			if (Array.isArray(event)) {
				for (let i = 0, l = event.length; i < l; i++) {
					this$1.$on(event[i], fn);
				}
			} else {
				(vm._events[event] || (vm._events[event] = [])).push(fn);
      // Optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
				if (hookRE.test(event)) {
					vm._hasHookEvent = true;
				}
			}
			return vm;
		};

		Vue.prototype.$once = function (event, fn) {
			const vm = this;
			function on() {
				vm.$off(event, on);
				fn.apply(vm, arguments);
			}
			on.fn = fn;
			vm.$on(event, on);
			return vm;
		};

		Vue.prototype.$off = function (event, fn) {
			const this$1 = this;

			const vm = this;
    // All
			if (!arguments.length) {
				vm._events = Object.create(null);
				return vm;
			}
    // Array of events
			if (Array.isArray(event)) {
				for (let i$1 = 0, l = event.length; i$1 < l; i$1++) {
					this$1.$off(event[i$1], fn);
				}
				return vm;
			}
    // Specific event
			const cbs = vm._events[event];
			if (!cbs) {
				return vm;
			}
			if (arguments.length === 1) {
				vm._events[event] = null;
				return vm;
			}
    // Specific handler
			let cb;
			let i = cbs.length;
			while (i--) {
				cb = cbs[i];
				if (cb === fn || cb.fn === fn) {
					cbs.splice(i, 1);
					break;
				}
			}
			return vm;
		};

		Vue.prototype.$emit = function (event) {
			const vm = this;
			let cbs = vm._events[event];
			if (cbs) {
				cbs = cbs.length > 1 ? toArray(cbs) : cbs;
				const args = toArray(arguments, 1);
				for (let i = 0, l = cbs.length; i < l; i++) {
					cbs[i].apply(vm, args);
				}
			}
			return vm;
		};
	}

/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
	function resolveSlots(
		children,
		context
) {
		const slots = {};
		if (!children) {
			return slots;
		}
		const defaultSlot = [];
		let name, child;
		for (let i = 0, l = children.length; i < l; i++) {
			child = children[i];
    // Named slots should only be respected if the vnode was rendered in the
    // same context.
			if ((child.context === context || child.functionalContext === context) &&
        child.data && (name = child.data.slot)) {
				const slot = (slots[name] || (slots[name] = []));
				if (child.tag === 'template') {
					slot.push.apply(slot, child.children);
				} else {
					slot.push(child);
				}
			} else {
				defaultSlot.push(child);
			}
		}
  // ignore whitespace
		if (!defaultSlot.every(isWhitespace)) {
			slots.default = defaultSlot;
		}
		return slots;
	}

	function isWhitespace(node) {
		return node.isComment || node.text === ' ';
	}

	function resolveScopedSlots(
		fns
) {
		const res = {};
		for (let i = 0; i < fns.length; i++) {
			res[fns[i][0]] = fns[i][1];
		}
		return res;
	}

/*  */

	let activeInstance = null;

	function initLifecycle(vm) {
		const options = vm.$options;

  // Locate first non-abstract parent
		let parent = options.parent;
		if (parent && !options.abstract) {
			while (parent.$options.abstract && parent.$parent) {
				parent = parent.$parent;
			}
			parent.$children.push(vm);
		}

		vm.$parent = parent;
		vm.$root = parent ? parent.$root : vm;

		vm.$children = [];
		vm.$refs = {};

		vm._watcher = null;
		vm._inactive = null;
		vm._directInactive = false;
		vm._isMounted = false;
		vm._isDestroyed = false;
		vm._isBeingDestroyed = false;
	}

	function lifecycleMixin(Vue) {
		Vue.prototype._update = function (vnode, hydrating) {
			const vm = this;
			if (vm._isMounted) {
				callHook(vm, 'beforeUpdate');
			}
			const prevEl = vm.$el;
			const prevVnode = vm._vnode;
			const prevActiveInstance = activeInstance;
			activeInstance = vm;
			vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
			if (!prevVnode) {
      // Initial render
				vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      );
			} else {
      // Updates
				vm.$el = vm.__patch__(prevVnode, vnode);
			}
			activeInstance = prevActiveInstance;
    // Update __vue__ reference
			if (prevEl) {
				prevEl.__vue__ = null;
			}
			if (vm.$el) {
				vm.$el.__vue__ = vm;
			}
    // If parent is an HOC, update its $el as well
			if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
				vm.$parent.$el = vm.$el;
			}
    // Updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
		};

		Vue.prototype.$forceUpdate = function () {
			const vm = this;
			if (vm._watcher) {
				vm._watcher.update();
			}
		};

		Vue.prototype.$destroy = function () {
			const vm = this;
			if (vm._isBeingDestroyed) {
				return;
			}
			callHook(vm, 'beforeDestroy');
			vm._isBeingDestroyed = true;
    // Remove self from parent
			const parent = vm.$parent;
			if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
				remove(parent.$children, vm);
			}
    // Teardown watchers
			if (vm._watcher) {
				vm._watcher.teardown();
			}
			let i = vm._watchers.length;
			while (i--) {
				vm._watchers[i].teardown();
			}
    // Remove reference from data ob
    // frozen object may not have observer.
			if (vm._data.__ob__) {
				vm._data.__ob__.vmCount--;
			}
    // Call the last hook...
			vm._isDestroyed = true;
			callHook(vm, 'destroyed');
    // Turn off all instance listeners.
			vm.$off();
    // Remove __vue__ reference
			if (vm.$el) {
				vm.$el.__vue__ = null;
			}
    // Invoke destroy hooks on current rendered tree
			vm.__patch__(vm._vnode, null);
		};
	}

	function mountComponent(
		vm,
		el,
		hydrating
) {
		vm.$el = el;
		if (!vm.$options.render) {
			vm.$options.render = createEmptyVNode;
			{
      /* istanbul ignore if */
				if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
					warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
				} else {
					warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
				}
			}
		}
		callHook(vm, 'beforeMount');

		let updateComponent;
  /* istanbul ignore if */
		if ('development' !== 'production' && config.performance && perf) {
			updateComponent = function () {
				const name = vm._name;
				const startTag = 'start ' + name;
				const endTag = 'end ' + name;
				perf.mark(startTag);
				const vnode = vm._render();
				perf.mark(endTag);
				perf.measure((name + ' render'), startTag, endTag);
				perf.mark(startTag);
				vm._update(vnode, hydrating);
				perf.mark(endTag);
				perf.measure((name + ' patch'), startTag, endTag);
			};
		} else {
			updateComponent = function () {
				vm._update(vm._render(), hydrating);
			};
		}

		vm._watcher = new Watcher(vm, updateComponent, noop);
		hydrating = false;

  // Manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
		if (vm.$vnode == null) {
			vm._isMounted = true;
			callHook(vm, 'mounted');
		}
		return vm;
	}

	function updateChildComponent(
		vm,
		propsData,
		listeners,
		parentVnode,
		renderChildren
) {
  // Determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
		const hasChildren = Boolean(renderChildren ||               // Has new static slots
    vm.$options._renderChildren ||  // Has old static slots
    parentVnode.data.scopedSlots || // Has new scoped slots
    vm.$scopedSlots !== emptyObject);

		vm.$options._parentVnode = parentVnode;
		vm.$vnode = parentVnode; // Update vm's placeholder node without re-render
		if (vm._vnode) { // Update child tree's parent
			vm._vnode.parent = parentVnode;
		}
		vm.$options._renderChildren = renderChildren;

  // Update props
		if (propsData && vm.$options.props) {
			observerState.shouldConvert = false;
			{
				observerState.isSettingProps = true;
			}
			const props = vm._props;
			const propKeys = vm.$options._propKeys || [];
			for (let i = 0; i < propKeys.length; i++) {
				const key = propKeys[i];
				props[key] = validateProp(key, vm.$options.props, propsData, vm);
			}
			observerState.shouldConvert = true;
			{
				observerState.isSettingProps = false;
			}
    // Keep a copy of raw propsData
			vm.$options.propsData = propsData;
		}
  // Update listeners
		if (listeners) {
			const oldListeners = vm.$options._parentListeners;
			vm.$options._parentListeners = listeners;
			updateComponentListeners(vm, listeners, oldListeners);
		}
  // Resolve slots + force update if has children
		if (hasChildren) {
			vm.$slots = resolveSlots(renderChildren, parentVnode.context);
			vm.$forceUpdate();
		}
	}

	function isInInactiveTree(vm) {
		while (vm && (vm = vm.$parent)) {
			if (vm._inactive) {
				return true;
			}
		}
		return false;
	}

	function activateChildComponent(vm, direct) {
		if (direct) {
			vm._directInactive = false;
			if (isInInactiveTree(vm)) {
				return;
			}
		} else if (vm._directInactive) {
			return;
		}
		if (vm._inactive || vm._inactive == null) {
			vm._inactive = false;
			for (let i = 0; i < vm.$children.length; i++) {
				activateChildComponent(vm.$children[i]);
			}
			callHook(vm, 'activated');
		}
	}

	function deactivateChildComponent(vm, direct) {
		if (direct) {
			vm._directInactive = true;
			if (isInInactiveTree(vm)) {
				return;
			}
		}
		if (!vm._inactive) {
			vm._inactive = true;
			for (let i = 0; i < vm.$children.length; i++) {
				deactivateChildComponent(vm.$children[i]);
			}
			callHook(vm, 'deactivated');
		}
	}

	function callHook(vm, hook) {
		const handlers = vm.$options[hook];
		if (handlers) {
			for (let i = 0, j = handlers.length; i < j; i++) {
				try {
					handlers[i].call(vm);
				} catch (e) {
					handleError(e, vm, (hook + ' hook'));
				}
			}
		}
		if (vm._hasHookEvent) {
			vm.$emit('hook:' + hook);
		}
	}

/*  */

	const queue = [];
	let has = {};
	let circular = {};
	let waiting = false;
	let flushing = false;
	let index = 0;

/**
 * Reset the scheduler's state.
 */
	function resetSchedulerState() {
		queue.length = 0;
		has = {};
		{
			circular = {};
		}
		waiting = flushing = false;
	}

/**
 * Flush both queues and run the watchers.
 */
	function flushSchedulerQueue() {
		flushing = true;
		let watcher, id, vm;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
		queue.sort((a, b) => {
			return a.id - b.id;
		});

  // Do not cache length because more watchers might be pushed
  // as we run existing watchers
		for (index = 0; index < queue.length; index++) {
			watcher = queue[index];
			id = watcher.id;
			has[id] = null;
			watcher.run();
    // In dev build, check and stop circular updates.
			if ('development' !== 'production' && has[id] != null) {
				circular[id] = (circular[id] || 0) + 1;
				if (circular[id] > config._maxUpdateCount) {
					warn(
          'You may have an infinite update loop ' + (
            watcher.user ?
              ('in watcher with expression "' + (watcher.expression) + '"') :
              'in a component render function.'
          ),
          watcher.vm
        );
					break;
				}
			}
		}

  // Call updated hooks
		index = queue.length;
		while (index--) {
			watcher = queue[index];
			vm = watcher.vm;
			if (vm._watcher === watcher && vm._isMounted) {
				callHook(vm, 'updated');
			}
		}

  // Devtool hook
  /* istanbul ignore if */
		if (devtools && config.devtools) {
			devtools.emit('flush');
		}

		resetSchedulerState();
	}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
	function queueWatcher(watcher) {
		const id = watcher.id;
		if (has[id] == null) {
			has[id] = true;
			if (!flushing) {
				queue.push(watcher);
			} else {
      // If already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
				let i = queue.length - 1;
				while (i >= 0 && queue[i].id > watcher.id) {
					i--;
				}
				queue.splice(Math.max(i, index) + 1, 0, watcher);
			}
    // Queue the flush
			if (!waiting) {
				waiting = true;
				nextTick(flushSchedulerQueue);
			}
		}
	}

/*  */

	let uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
	var Watcher = function Watcher(
		vm,
		expOrFn,
		cb,
		options
) {
		this.vm = vm;
		vm._watchers.push(this);
  // Options
		if (options) {
			this.deep = Boolean(options.deep);
			this.user = Boolean(options.user);
			this.lazy = Boolean(options.lazy);
			this.sync = Boolean(options.sync);
		} else {
			this.deep = this.user = this.lazy = this.sync = false;
		}
		this.cb = cb;
		this.id = ++uid$2; // Uid for batching
		this.active = true;
		this.dirty = this.lazy; // For lazy watchers
		this.deps = [];
		this.newDeps = [];
		this.depIds = new _Set();
		this.newDepIds = new _Set();
		this.expression = expOrFn.toString();
  // Parse expression for getter
		if (typeof expOrFn === 'function') {
			this.getter = expOrFn;
		} else {
			this.getter = parsePath(expOrFn);
			if (!this.getter) {
				this.getter = function () {};
				'development' !== 'production' && warn(
        'Failed watching path: "' + expOrFn + '" ' +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
			}
		}
		this.value = this.lazy ?
    undefined :
    this.get();
	};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
	Watcher.prototype.get = function get() {
		pushTarget(this);
		let value;
		const vm = this.vm;
		if (this.user) {
			try {
				value = this.getter.call(vm, vm);
			} catch (e) {
				handleError(e, vm, ('getter for watcher "' + (this.expression) + '"'));
			}
		} else {
			value = this.getter.call(vm, vm);
		}
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
		if (this.deep) {
			traverse(value);
		}
		popTarget();
		this.cleanupDeps();
		return value;
	};

/**
 * Add a dependency to this directive.
 */
	Watcher.prototype.addDep = function addDep(dep) {
		const id = dep.id;
		if (!this.newDepIds.has(id)) {
			this.newDepIds.add(id);
			this.newDeps.push(dep);
			if (!this.depIds.has(id)) {
				dep.addSub(this);
			}
		}
	};

/**
 * Clean up for dependency collection.
 */
	Watcher.prototype.cleanupDeps = function cleanupDeps() {
		const this$1 = this;

		let i = this.deps.length;
		while (i--) {
			const dep = this$1.deps[i];
			if (!this$1.newDepIds.has(dep.id)) {
				dep.removeSub(this$1);
			}
		}
		let tmp = this.depIds;
		this.depIds = this.newDepIds;
		this.newDepIds = tmp;
		this.newDepIds.clear();
		tmp = this.deps;
		this.deps = this.newDeps;
		this.newDeps = tmp;
		this.newDeps.length = 0;
	};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
	Watcher.prototype.update = function update() {
  /* istanbul ignore else */
		if (this.lazy) {
			this.dirty = true;
		} else if (this.sync) {
			this.run();
		} else {
			queueWatcher(this);
		}
	};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
	Watcher.prototype.run = function run() {
		if (this.active) {
			const value = this.get();
			if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // Set new value
				const oldValue = this.value;
				this.value = value;
				if (this.user) {
					try {
						this.cb.call(this.vm, value, oldValue);
					} catch (e) {
						handleError(e, this.vm, ('callback for watcher "' + (this.expression) + '"'));
					}
				} else {
					this.cb.call(this.vm, value, oldValue);
				}
			}
		}
	};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
	Watcher.prototype.evaluate = function evaluate() {
		this.value = this.get();
		this.dirty = false;
	};

/**
 * Depend on all deps collected by this watcher.
 */
	Watcher.prototype.depend = function depend() {
		const this$1 = this;

		let i = this.deps.length;
		while (i--) {
			this$1.deps[i].depend();
		}
	};

/**
 * Remove self from all dependencies' subscriber list.
 */
	Watcher.prototype.teardown = function teardown() {
		const this$1 = this;

		if (this.active) {
    // Remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
			if (!this.vm._isBeingDestroyed) {
				remove(this.vm._watchers, this);
			}
			let i = this.deps.length;
			while (i--) {
				this$1.deps[i].removeSub(this$1);
			}
			this.active = false;
		}
	};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
	const seenObjects = new _Set();
	function traverse(val) {
		seenObjects.clear();
		_traverse(val, seenObjects);
	}

	function _traverse(val, seen) {
		let i, keys;
		const isA = Array.isArray(val);
		if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
			return;
		}
		if (val.__ob__) {
			const depId = val.__ob__.dep.id;
			if (seen.has(depId)) {
				return;
			}
			seen.add(depId);
		}
		if (isA) {
			i = val.length;
			while (i--) {
				_traverse(val[i], seen);
			}
		} else {
			keys = Object.keys(val);
			i = keys.length;
			while (i--) {
				_traverse(val[keys[i]], seen);
			}
		}
	}

/*  */

	const sharedPropertyDefinition = {
		enumerable: true,
		configurable: true,
		get: noop,
		set: noop
	};

	function proxy(target, sourceKey, key) {
		sharedPropertyDefinition.get = function proxyGetter() {
			return this[sourceKey][key];
		};
		sharedPropertyDefinition.set = function proxySetter(val) {
			this[sourceKey][key] = val;
		};
		Object.defineProperty(target, key, sharedPropertyDefinition);
	}

	function initState(vm) {
		vm._watchers = [];
		const opts = vm.$options;
		if (opts.props) {
			initProps(vm, opts.props);
		}
		if (opts.methods) {
			initMethods(vm, opts.methods);
		}
		if (opts.data) {
			initData(vm);
		} else {
			observe(vm._data = {}, true /* asRootData */);
		}
		if (opts.computed) {
			initComputed(vm, opts.computed);
		}
		if (opts.watch) {
			initWatch(vm, opts.watch);
		}
	}

	const isReservedProp = {key: 1, ref: 1, slot: 1};

	function initProps(vm, propsOptions) {
		const propsData = vm.$options.propsData || {};
		const props = vm._props = {};
  // Cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
		const keys = vm.$options._propKeys = [];
		const isRoot = !vm.$parent;
  // Root instance props should be converted
		observerState.shouldConvert = isRoot;
		const loop = function (key) {
			keys.push(key);
			const value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
			{
				if (isReservedProp[key]) {
					warn(
          ('"' + key + '" is a reserved attribute and cannot be used as component prop.'),
          vm
        );
				}
				defineReactive$$1(props, key, value, () => {
					if (vm.$parent && !observerState.isSettingProps) {
						warn(
            'Avoid mutating a prop directly since the value will be ' +
            'overwritten whenever the parent component re-renders. ' +
            'Instead, use a data or computed property based on the prop\'s ' +
            'value. Prop being mutated: "' + key + '"',
            vm
          );
					}
				});
			}
    // Static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
			if (!(key in vm)) {
				proxy(vm, '_props', key);
			}
		};

		for (const key in propsOptions) {
			loop(key);
		}
		observerState.shouldConvert = true;
	}

	function initData(vm) {
		let data = vm.$options.data;
		data = vm._data = typeof data === 'function' ?
    data.call(vm) :
    data || {};
		if (!isPlainObject(data)) {
			data = {};
			'development' !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
		}
  // Proxy data on instance
		const keys = Object.keys(data);
		const props = vm.$options.props;
		let i = keys.length;
		while (i--) {
			if (props && hasOwn(props, keys[i])) {
				'development' !== 'production' && warn(
        'The data property "' + (keys[i]) + '" is already declared as a prop. ' +
        'Use prop default value instead.',
        vm
      );
			} else if (!isReserved(keys[i])) {
				proxy(vm, '_data', keys[i]);
			}
		}
  // Observe data
		observe(data, true /* asRootData */);
	}

	const computedWatcherOptions = {lazy: true};

	function initComputed(vm, computed) {
		const watchers = vm._computedWatchers = Object.create(null);

		for (const key in computed) {
			const userDef = computed[key];
			const getter = typeof userDef === 'function' ? userDef : userDef.get;
    // Create internal watcher for the computed property.
			watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions);

    // Component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
			if (!(key in vm)) {
				defineComputed(vm, key, userDef);
			}
		}
	}

	function defineComputed(target, key, userDef) {
		if (typeof userDef === 'function') {
			sharedPropertyDefinition.get = createComputedGetter(key);
			sharedPropertyDefinition.set = noop;
		} else {
			sharedPropertyDefinition.get = userDef.get ?
      userDef.cache !== false ?
        createComputedGetter(key) :
        userDef.get :
      noop;
			sharedPropertyDefinition.set = userDef.set ?
      userDef.set :
      noop;
		}
		Object.defineProperty(target, key, sharedPropertyDefinition);
	}

	function createComputedGetter(key) {
		return function computedGetter() {
			const watcher = this._computedWatchers && this._computedWatchers[key];
			if (watcher) {
				if (watcher.dirty) {
					watcher.evaluate();
				}
				if (Dep.target) {
					watcher.depend();
				}
				return watcher.value;
			}
		};
	}

	function initMethods(vm, methods) {
		const props = vm.$options.props;
		for (const key in methods) {
			vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
			{
				if (methods[key] == null) {
					warn(
          'method "' + key + '" has an undefined value in the component definition. ' +
          'Did you reference the function correctly?',
          vm
        );
				}
				if (props && hasOwn(props, key)) {
					warn(
          ('method "' + key + '" has already been defined as a prop.'),
          vm
        );
				}
			}
		}
	}

	function initWatch(vm, watch) {
		for (const key in watch) {
			const handler = watch[key];
			if (Array.isArray(handler)) {
				for (let i = 0; i < handler.length; i++) {
					createWatcher(vm, key, handler[i]);
				}
			} else {
				createWatcher(vm, key, handler);
			}
		}
	}

	function createWatcher(vm, key, handler) {
		let options;
		if (isPlainObject(handler)) {
			options = handler;
			handler = handler.handler;
		}
		if (typeof handler === 'string') {
			handler = vm[handler];
		}
		vm.$watch(key, handler, options);
	}

	function stateMixin(Vue) {
  // Flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
		const dataDef = {};
		dataDef.get = function () {
			return this._data;
		};
		const propsDef = {};
		propsDef.get = function () {
			return this._props;
		};
		{
			dataDef.set = function (newData) {
				warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
			};
			propsDef.set = function () {
				warn('$props is readonly.', this);
			};
		}
		Object.defineProperty(Vue.prototype, '$data', dataDef);
		Object.defineProperty(Vue.prototype, '$props', propsDef);

		Vue.prototype.$set = set;
		Vue.prototype.$delete = del;

		Vue.prototype.$watch = function (
			expOrFn,
			cb,
			options
  ) {
			const vm = this;
			options = options || {};
			options.user = true;
			const watcher = new Watcher(vm, expOrFn, cb, options);
			if (options.immediate) {
				cb.call(vm, watcher.value);
			}
			return function unwatchFn() {
				watcher.teardown();
			};
		};
	}

/*  */

	const hooks = {init, prepatch, insert, destroy};
	const hooksToMerge = Object.keys(hooks);

	function createComponent(
		Ctor,
		data,
		context,
		children,
		tag
) {
		if (!Ctor) {
			return;
		}

		const baseCtor = context.$options._base;
		if (isObject(Ctor)) {
			Ctor = baseCtor.extend(Ctor);
		}

		if (typeof Ctor !== 'function') {
			{
				warn(('Invalid Component definition: ' + (String(Ctor))), context);
			}
			return;
		}

  // Async component
		if (!Ctor.cid) {
			if (Ctor.resolved) {
				Ctor = Ctor.resolved;
			} else {
				Ctor = resolveAsyncComponent(Ctor, baseCtor, () => {
        // It's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
					context.$forceUpdate();
				});
				if (!Ctor) {
        // Return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
					return;
				}
			}
		}

  // Resolve constructor options in case global mixins are applied after
  // component constructor creation
		resolveConstructorOptions(Ctor);

		data = data || {};

  // Transform component v-model data into props & events
		if (data.model) {
			transformModel(Ctor.options, data);
		}

  // Extract props
		const propsData = extractProps(data, Ctor);

  // Functional component
		if (Ctor.options.functional) {
			return createFunctionalComponent(Ctor, propsData, data, context, children);
		}

  // Extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
		const listeners = data.on;
  // Replace with listeners with .native modifier
		data.on = data.nativeOn;

		if (Ctor.options.abstract) {
    // Abstract components do not keep anything
    // other than props & listeners
			data = {};
		}

  // Merge component management hooks onto the placeholder node
		mergeHooks(data);

  // Return a placeholder vnode
		const name = Ctor.options.name || tag;
		const vnode = new VNode(
    ('vue-component-' + (Ctor.cid) + (name ? ('-' + name) : '')),
    data, undefined, undefined, undefined, context,
    {Ctor, propsData, listeners, tag, children}
  );
		return vnode;
	}

	function createFunctionalComponent(
		Ctor,
		propsData,
		data,
		context,
		children
) {
		const props = {};
		const propOptions = Ctor.options.props;
		if (propOptions) {
			for (const key in propOptions) {
				props[key] = validateProp(key, propOptions, propsData);
			}
		}
  // Ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
		const _context = Object.create(context);
		const h = function (a, b, c, d) {
			return createElement(_context, a, b, c, d, true);
		};
		const vnode = Ctor.options.render.call(null, h, {
			props,
			data,
			parent: context,
			children,
			slots() {
				return resolveSlots(children, context);
			}
		});
		if (vnode instanceof VNode) {
			vnode.functionalContext = context;
			if (data.slot) {
				(vnode.data || (vnode.data = {})).slot = data.slot;
			}
		}
		return vnode;
	}

	function createComponentInstanceForVnode(
		vnode, // We know it's MountedComponentVNode but flow doesn't
		parent, // ActiveInstance in lifecycle state
		parentElm,
		refElm
) {
		const vnodeComponentOptions = vnode.componentOptions;
		const options = {
			_isComponent: true,
			parent,
			propsData: vnodeComponentOptions.propsData,
			_componentTag: vnodeComponentOptions.tag,
			_parentVnode: vnode,
			_parentListeners: vnodeComponentOptions.listeners,
			_renderChildren: vnodeComponentOptions.children,
			_parentElm: parentElm || null,
			_refElm: refElm || null
		};
  // Check inline-template render functions
		const inlineTemplate = vnode.data.inlineTemplate;
		if (inlineTemplate) {
			options.render = inlineTemplate.render;
			options.staticRenderFns = inlineTemplate.staticRenderFns;
		}
		return new vnodeComponentOptions.Ctor(options);
	}

	function init(
		vnode,
		hydrating,
		parentElm,
		refElm
) {
		if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
			const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance,
      parentElm,
      refElm
    );
			child.$mount(hydrating ? vnode.elm : undefined, hydrating);
		} else if (vnode.data.keepAlive) {
    // Kept-alive components, treat as a patch
			const mountedNode = vnode; // Work around flow
			prepatch(mountedNode, mountedNode);
		}
	}

	function prepatch(
		oldVnode,
		vnode
) {
		const options = vnode.componentOptions;
		const child = vnode.componentInstance = oldVnode.componentInstance;
		updateChildComponent(
    child,
    options.propsData, // Updated props
    options.listeners, // Updated listeners
    vnode, // New parent vnode
    options.children // New children
  );
	}

	function insert(vnode) {
		if (!vnode.componentInstance._isMounted) {
			vnode.componentInstance._isMounted = true;
			callHook(vnode.componentInstance, 'mounted');
		}
		if (vnode.data.keepAlive) {
			activateChildComponent(vnode.componentInstance, true /* direct */);
		}
	}

	function destroy(vnode) {
		if (!vnode.componentInstance._isDestroyed) {
			if (!vnode.data.keepAlive) {
				vnode.componentInstance.$destroy();
			} else {
				deactivateChildComponent(vnode.componentInstance, true /* direct */);
			}
		}
	}

	function resolveAsyncComponent(
		factory,
		baseCtor,
		cb
) {
		if (factory.requested) {
    // Pool callbacks
			factory.pendingCallbacks.push(cb);
		} else {
			factory.requested = true;
			const cbs = factory.pendingCallbacks = [cb];
			let sync = true;

			const resolve = function (res) {
				if (isObject(res)) {
					res = baseCtor.extend(res);
				}
      // Cache resolved
				factory.resolved = res;
      // Invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
				if (!sync) {
					for (let i = 0, l = cbs.length; i < l; i++) {
						cbs[i](res);
					}
				}
			};

			const reject = function (reason) {
				'development' !== 'production' && warn(
        'Failed to resolve async component: ' + (String(factory)) +
        (reason ? ('\nReason: ' + reason) : '')
      );
			};

			const res = factory(resolve, reject);

    // Handle promise
			if (res && typeof res.then === 'function' && !factory.resolved) {
				res.then(resolve, reject);
			}

			sync = false;
    // Return in case resolved synchronously
			return factory.resolved;
		}
	}

	function extractProps(data, Ctor) {
  // We are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
		const propOptions = Ctor.options.props;
		if (!propOptions) {
			return;
		}
		const res = {};
		const attrs = data.attrs;
		const props = data.props;
		const domProps = data.domProps;
		if (attrs || props || domProps) {
			for (const key in propOptions) {
				const altKey = hyphenate(key);
				checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey);
			}
		}
		return res;
	}

	function checkProp(
		res,
		hash,
		key,
		altKey,
		preserve
) {
		if (hash) {
			if (hasOwn(hash, key)) {
				res[key] = hash[key];
				if (!preserve) {
					delete hash[key];
				}
				return true;
			} else if (hasOwn(hash, altKey)) {
				res[key] = hash[altKey];
				if (!preserve) {
					delete hash[altKey];
				}
				return true;
			}
		}
		return false;
	}

	function mergeHooks(data) {
		if (!data.hook) {
			data.hook = {};
		}
		for (let i = 0; i < hooksToMerge.length; i++) {
			const key = hooksToMerge[i];
			const fromParent = data.hook[key];
			const ours = hooks[key];
			data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
		}
	}

	function mergeHook$1(one, two) {
		return function (a, b, c, d) {
			one(a, b, c, d);
			two(a, b, c, d);
		};
	}

// Transform component v-model info (value and callback) into
// prop and event handler respectively.
	function transformModel(options, data) {
		const prop = (options.model && options.model.prop) || 'value';
		const event = (options.model && options.model.event) || 'input'; (data.props || (data.props = {}))[prop] = data.model.value;
		const on = data.on || (data.on = {});
		if (on[event]) {
			on[event] = [data.model.callback].concat(on[event]);
		} else {
			on[event] = data.model.callback;
		}
	}

/*  */

	const SIMPLE_NORMALIZE = 1;
	const ALWAYS_NORMALIZE = 2;

// Wrapper function for providing a more flexible interface
// without getting yelled at by flow
	function createElement(
		context,
		tag,
		data,
		children,
		normalizationType,
		alwaysNormalize
) {
		if (Array.isArray(data) || isPrimitive(data)) {
			normalizationType = children;
			children = data;
			data = undefined;
		}
		if (alwaysNormalize) {
			normalizationType = ALWAYS_NORMALIZE;
		}
		return _createElement(context, tag, data, children, normalizationType);
	}

	function _createElement(
		context,
		tag,
		data,
		children,
		normalizationType
) {
		if (data && data.__ob__) {
			'development' !== 'production' && warn(
      'Avoid using observed data object as vnode data: ' + (JSON.stringify(data)) + '\n' +
      'Always create fresh vnode data objects in each render!',
      context
    );
			return createEmptyVNode();
		}
		if (!tag) {
    // In case of component :is set to falsy value
			return createEmptyVNode();
		}
  // Support single function children as default scoped slot
		if (Array.isArray(children) &&
      typeof children[0] === 'function') {
			data = data || {};
			data.scopedSlots = {default: children[0]};
			children.length = 0;
		}
		if (normalizationType === ALWAYS_NORMALIZE) {
			children = normalizeChildren(children);
		} else if (normalizationType === SIMPLE_NORMALIZE) {
			children = simpleNormalizeChildren(children);
		}
		let vnode, ns;
		if (typeof tag === 'string') {
			let Ctor;
			ns = config.getTagNamespace(tag);
			if (config.isReservedTag(tag)) {
      // Platform built-in elements
				vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
			} else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // Component
				vnode = createComponent(Ctor, data, context, children, tag);
			} else {
      // Unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
				vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
			}
		} else {
    // Direct component options / constructor
			vnode = createComponent(tag, data, context, children);
		}
		if (vnode) {
			if (ns) {
				applyNS(vnode, ns);
			}
			return vnode;
		}
		return createEmptyVNode();
	}

	function applyNS(vnode, ns) {
		vnode.ns = ns;
		if (vnode.tag === 'foreignObject') {
    // Use default namespace inside foreignObject
			return;
		}
		if (vnode.children) {
			for (let i = 0, l = vnode.children.length; i < l; i++) {
				const child = vnode.children[i];
				if (child.tag && !child.ns) {
					applyNS(child, ns);
				}
			}
		}
	}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
	function renderList(
		val,
		render
) {
		let ret, i, l, keys, key;
		if (Array.isArray(val) || typeof val === 'string') {
			ret = new Array(val.length);
			for (i = 0, l = val.length; i < l; i++) {
				ret[i] = render(val[i], i);
			}
		} else if (typeof val === 'number') {
			ret = new Array(val);
			for (i = 0; i < val; i++) {
				ret[i] = render(i + 1, i);
			}
		} else if (isObject(val)) {
			keys = Object.keys(val);
			ret = new Array(keys.length);
			for (i = 0, l = keys.length; i < l; i++) {
				key = keys[i];
				ret[i] = render(val[key], key, i);
			}
		}
		return ret;
	}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
	function renderSlot(
		name,
		fallback,
		props,
		bindObject
) {
		const scopedSlotFn = this.$scopedSlots[name];
		if (scopedSlotFn) { // Scoped slot
			props = props || {};
			if (bindObject) {
				extend(props, bindObject);
			}
			return scopedSlotFn(props) || fallback;
		}
		const slotNodes = this.$slots[name];
    // Warn duplicate slot usage
		if (slotNodes && 'development' !== 'production') {
			slotNodes._rendered && warn(
        'Duplicate presence of slot "' + name + '" found in the same render tree ' +
        '- this will likely cause render errors.',
        this
      );
			slotNodes._rendered = true;
		}
		return slotNodes || fallback;
	}

/*  */

/**
 * Runtime helper for resolving filters
 */
	function resolveFilter(id) {
		return resolveAsset(this.$options, 'filters', id, true) || identity;
	}

/*  */

/**
 * Runtime helper for checking keyCodes from config.
 */
	function checkKeyCodes(
		eventKeyCode,
		key,
		builtInAlias
) {
		const keyCodes = config.keyCodes[key] || builtInAlias;
		if (Array.isArray(keyCodes)) {
			return keyCodes.indexOf(eventKeyCode) === -1;
		}
		return keyCodes !== eventKeyCode;
	}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
	function bindObjectProps(
		data,
		tag,
		value,
		asProp
) {
		if (value) {
			if (!isObject(value)) {
				'development' !== 'production' && warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
			} else {
				if (Array.isArray(value)) {
					value = toObject(value);
				}
				for (const key in value) {
					if (key === 'class' || key === 'style') {
						data[key] = value[key];
					} else {
						const type = data.attrs && data.attrs.type;
						const hash = asProp || config.mustUseProp(tag, type, key) ?
            data.domProps || (data.domProps = {}) :
            data.attrs || (data.attrs = {});
						hash[key] = value[key];
					}
				}
			}
		}
		return data;
	}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
	function renderStatic(
		index,
		isInFor
) {
		let tree = this._staticTrees[index];
  // If has already-rendered static tree and not inside v-for,
  // we can reuse the same tree by doing a shallow clone.
		if (tree && !isInFor) {
			return Array.isArray(tree) ?
      cloneVNodes(tree) :
      cloneVNode(tree);
		}
  // Otherwise, render a fresh tree.
		tree = this._staticTrees[index] =
    this.$options.staticRenderFns[index].call(this._renderProxy);
		markStatic(tree, ('__static__' + index), false);
		return tree;
	}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
	function markOnce(
		tree,
		index,
		key
) {
		markStatic(tree, ('__once__' + index + (key ? ('_' + key) : '')), true);
		return tree;
	}

	function markStatic(
		tree,
		key,
		isOnce
) {
		if (Array.isArray(tree)) {
			for (let i = 0; i < tree.length; i++) {
				if (tree[i] && typeof tree[i] !== 'string') {
					markStaticNode(tree[i], (key + '_' + i), isOnce);
				}
			}
		} else {
			markStaticNode(tree, key, isOnce);
		}
	}

	function markStaticNode(node, key, isOnce) {
		node.isStatic = true;
		node.key = key;
		node.isOnce = isOnce;
	}

/*  */

	function initRender(vm) {
		vm.$vnode = null; // The placeholder node in parent tree
		vm._vnode = null; // The root of the child tree
		vm._staticTrees = null;
		const parentVnode = vm.$options._parentVnode;
		const renderContext = parentVnode && parentVnode.context;
		vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
		vm.$scopedSlots = emptyObject;
  // Bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
		vm._c = function (a, b, c, d) {
			return createElement(vm, a, b, c, d, false);
		};
  // Normalization is always applied for the public version, used in
  // user-written render functions.
		vm.$createElement = function (a, b, c, d) {
			return createElement(vm, a, b, c, d, true);
		};
	}

	function renderMixin(Vue) {
		Vue.prototype.$nextTick = function (fn) {
			return nextTick(fn, this);
		};

		Vue.prototype._render = function () {
			const vm = this;
			const ref = vm.$options;
			const render = ref.render;
			const staticRenderFns = ref.staticRenderFns;
			const _parentVnode = ref._parentVnode;

			if (vm._isMounted) {
      // Clone slot nodes on re-renders
				for (const key in vm.$slots) {
					vm.$slots[key] = cloneVNodes(vm.$slots[key]);
				}
			}

			vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

			if (staticRenderFns && !vm._staticTrees) {
				vm._staticTrees = [];
			}
    // Set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
			vm.$vnode = _parentVnode;
    // Render self
			let vnode;
			try {
				vnode = render.call(vm._renderProxy, vm.$createElement);
			} catch (e) {
				handleError(e, vm, 'render function');
      // Return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
				{
					vnode = vm.$options.renderError ?
          vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e) :
          vm._vnode;
				}
			}
    // Return empty vnode in case the render function errored out
			if (!(vnode instanceof VNode)) {
				if ('development' !== 'production' && Array.isArray(vnode)) {
					warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
				}
				vnode = createEmptyVNode();
			}
    // Set parent
			vnode.parent = _parentVnode;
			return vnode;
		};

  // Internal render helpers.
  // these are exposed on the instance prototype to reduce generated render
  // code size.
		Vue.prototype._o = markOnce;
		Vue.prototype._n = toNumber;
		Vue.prototype._s = _toString;
		Vue.prototype._l = renderList;
		Vue.prototype._t = renderSlot;
		Vue.prototype._q = looseEqual;
		Vue.prototype._i = looseIndexOf;
		Vue.prototype._m = renderStatic;
		Vue.prototype._f = resolveFilter;
		Vue.prototype._k = checkKeyCodes;
		Vue.prototype._b = bindObjectProps;
		Vue.prototype._v = createTextVNode;
		Vue.prototype._e = createEmptyVNode;
		Vue.prototype._u = resolveScopedSlots;
	}

/*  */

	function initProvide(vm) {
		const provide = vm.$options.provide;
		if (provide) {
			vm._provided = typeof provide === 'function' ?
      provide.call(vm) :
      provide;
		}
	}

	function initInjections(vm) {
		const inject = vm.$options.inject;
		if (inject) {
    // Inject is :any because flow is not smart enough to figure out cached
    // isArray here
			const isArray = Array.isArray(inject);
			const keys = isArray ?
      inject :
      hasSymbol ?
        Reflect.ownKeys(inject) :
        Object.keys(inject);

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const provideKey = isArray ? key : inject[key];
				let source = vm;
				while (source) {
					if (source._provided && provideKey in source._provided) {
						vm[key] = source._provided[provideKey];
						break;
					}
					source = source.$parent;
				}
			}
		}
	}

/*  */

	let uid = 0;

	function initMixin(Vue) {
		Vue.prototype._init = function (options) {
    /* istanbul ignore if */
			if ('development' !== 'production' && config.performance && perf) {
				perf.mark('init');
			}

			const vm = this;
    // A uid
			vm._uid = uid++;
    // A flag to avoid this being observed
			vm._isVue = true;
    // Merge options
			if (options && options._isComponent) {
      // Optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
				initInternalComponent(vm, options);
			} else {
				vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
			}
    /* istanbul ignore else */
			{
				initProxy(vm);
			}
    // Expose real self
			vm._self = vm;
			initLifecycle(vm);
			initEvents(vm);
			initRender(vm);
			callHook(vm, 'beforeCreate');
			initInjections(vm); // Resolve injections before data/props
			initState(vm);
			initProvide(vm); // Resolve provide after data/props
			callHook(vm, 'created');

    /* istanbul ignore if */
			if ('development' !== 'production' && config.performance && perf) {
				vm._name = formatComponentName(vm, false);
				perf.mark('init end');
				perf.measure(((vm._name) + ' init'), 'init', 'init end');
			}

			if (vm.$options.el) {
				vm.$mount(vm.$options.el);
			}
		};
	}

	function initInternalComponent(vm, options) {
		const opts = vm.$options = Object.create(vm.constructor.options);
  // Doing this because it's faster than dynamic enumeration.
		opts.parent = options.parent;
		opts.propsData = options.propsData;
		opts._parentVnode = options._parentVnode;
		opts._parentListeners = options._parentListeners;
		opts._renderChildren = options._renderChildren;
		opts._componentTag = options._componentTag;
		opts._parentElm = options._parentElm;
		opts._refElm = options._refElm;
		if (options.render) {
			opts.render = options.render;
			opts.staticRenderFns = options.staticRenderFns;
		}
	}

	function resolveConstructorOptions(Ctor) {
		let options = Ctor.options;
		if (Ctor.super) {
			const superOptions = resolveConstructorOptions(Ctor.super);
			const cachedSuperOptions = Ctor.superOptions;
			if (superOptions !== cachedSuperOptions) {
      // Super option changed,
      // need to resolve new options.
				Ctor.superOptions = superOptions;
      // Check if there are any late-modified/attached options (#4976)
				const modifiedOptions = resolveModifiedOptions(Ctor);
      // Update base extend options
				if (modifiedOptions) {
					extend(Ctor.extendOptions, modifiedOptions);
				}
				options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
				if (options.name) {
					options.components[options.name] = Ctor;
				}
			}
		}
		return options;
	}

	function resolveModifiedOptions(Ctor) {
		let modified;
		const latest = Ctor.options;
		const sealed = Ctor.sealedOptions;
		for (const key in latest) {
			if (latest[key] !== sealed[key]) {
				if (!modified) {
					modified = {};
				}
				modified[key] = dedupe(latest[key], sealed[key]);
			}
		}
		return modified;
	}

	function dedupe(latest, sealed) {
  // Compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
		if (Array.isArray(latest)) {
			const res = [];
			sealed = Array.isArray(sealed) ? sealed : [sealed];
			for (let i = 0; i < latest.length; i++) {
				if (sealed.indexOf(latest[i]) < 0) {
					res.push(latest[i]);
				}
			}
			return res;
		}
		return latest;
	}

	function Vue$3(options) {
		if ('development' !== 'production' &&
    !(this instanceof Vue$3)) {
			warn('Vue is a constructor and should be called with the `new` keyword');
		}
		this._init(options);
	}

	initMixin(Vue$3);
	stateMixin(Vue$3);
	eventsMixin(Vue$3);
	lifecycleMixin(Vue$3);
	renderMixin(Vue$3);

/*  */

	function initUse(Vue) {
		Vue.use = function (plugin) {
    /* istanbul ignore if */
			if (plugin.installed) {
				return;
			}
    // Additional parameters
			const args = toArray(arguments, 1);
			args.unshift(this);
			if (typeof plugin.install === 'function') {
				plugin.install.apply(plugin, args);
			} else if (typeof plugin === 'function') {
				plugin.apply(null, args);
			}
			plugin.installed = true;
			return this;
		};
	}

/*  */

	function initMixin$1(Vue) {
		Vue.mixin = function (mixin) {
			this.options = mergeOptions(this.options, mixin);
		};
	}

/*  */

	function initExtend(Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
		Vue.cid = 0;
		let cid = 1;

  /**
   * Class inheritance
   */
		Vue.extend = function (extendOptions) {
			extendOptions = extendOptions || {};
			const Super = this;
			const SuperId = Super.cid;
			const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
			if (cachedCtors[SuperId]) {
				return cachedCtors[SuperId];
			}

			const name = extendOptions.name || Super.options.name;
			{
				if (!/^[a-zA-Z][\w-]*$/.test(name)) {
					warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        );
				}
			}

			const Sub = function VueComponent(options) {
				this._init(options);
			};
			Sub.prototype = Object.create(Super.prototype);
			Sub.prototype.constructor = Sub;
			Sub.cid = cid++;
			Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
			Sub.super = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
			if (Sub.options.props) {
				initProps$1(Sub);
			}
			if (Sub.options.computed) {
				initComputed$1(Sub);
			}

    // Allow further extension/mixin/plugin usage
			Sub.extend = Super.extend;
			Sub.mixin = Super.mixin;
			Sub.use = Super.use;

    // Create asset registers, so extended classes
    // can have their private assets too.
			config._assetTypes.forEach(type => {
				Sub[type] = Super[type];
			});
    // Enable recursive self-lookup
			if (name) {
				Sub.options.components[name] = Sub;
			}

    // Keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
			Sub.superOptions = Super.options;
			Sub.extendOptions = extendOptions;
			Sub.sealedOptions = extend({}, Sub.options);

    // Cache constructor
			cachedCtors[SuperId] = Sub;
			return Sub;
		};
	}

	function initProps$1(Comp) {
		const props = Comp.options.props;
		for (const key in props) {
			proxy(Comp.prototype, '_props', key);
		}
	}

	function initComputed$1(Comp) {
		const computed = Comp.options.computed;
		for (const key in computed) {
			defineComputed(Comp.prototype, key, computed[key]);
		}
	}

/*  */

	function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
		config._assetTypes.forEach(type => {
			Vue[type] = function (
				id,
				definition
    ) {
				if (!definition) {
					return this.options[type + 's'][id];
				}
        /* istanbul ignore if */
				{
					if (type === 'component' && config.isReservedTag(id)) {
						warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            );
					}
				}
				if (type === 'component' && isPlainObject(definition)) {
					definition.name = definition.name || id;
					definition = this.options._base.extend(definition);
				}
				if (type === 'directive' && typeof definition === 'function') {
					definition = {bind: definition, update: definition};
				}
				this.options[type + 's'][id] = definition;
				return definition;
			};
		});
	}

/*  */

	const patternTypes = [String, RegExp];

	function getComponentName(opts) {
		return opts && (opts.Ctor.options.name || opts.tag);
	}

	function matches(pattern, name) {
		if (typeof pattern === 'string') {
			return pattern.split(',').indexOf(name) > -1;
		} else if (pattern instanceof RegExp) {
			return pattern.test(name);
		}
  /* istanbul ignore next */
		return false;
	}

	function pruneCache(cache, filter) {
		for (const key in cache) {
			const cachedNode = cache[key];
			if (cachedNode) {
				const name = getComponentName(cachedNode.componentOptions);
				if (name && !filter(name)) {
					pruneCacheEntry(cachedNode);
					cache[key] = null;
				}
			}
		}
	}

	function pruneCacheEntry(vnode) {
		if (vnode) {
			if (!vnode.componentInstance._inactive) {
				callHook(vnode.componentInstance, 'deactivated');
			}
			vnode.componentInstance.$destroy();
		}
	}

	const KeepAlive = {
		name: 'keep-alive',
		abstract: true,

		props: {
			include: patternTypes,
			exclude: patternTypes
		},

		created: function created() {
			this.cache = Object.create(null);
		},

		destroyed: function destroyed() {
			const this$1 = this;

			for (const key in this$1.cache) {
				pruneCacheEntry(this$1.cache[key]);
			}
		},

		watch: {
			include: function include(val) {
				pruneCache(this.cache, name => {
					return matches(val, name);
				});
			},
			exclude: function exclude(val) {
				pruneCache(this.cache, name => {
					return !matches(val, name);
				});
			}
		},

		render: function render() {
			const vnode = getFirstComponentChild(this.$slots.default);
			const componentOptions = vnode && vnode.componentOptions;
			if (componentOptions) {
      // Check pattern
				const name = getComponentName(componentOptions);
				if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
					return vnode;
				}
				const key = vnode.key == null ?
        // Same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        componentOptions.Ctor.cid + (componentOptions.tag ? ('::' + (componentOptions.tag)) : '') :
        vnode.key;
				if (this.cache[key]) {
					vnode.componentInstance = this.cache[key].componentInstance;
				} else {
					this.cache[key] = vnode;
				}
				vnode.data.keepAlive = true;
			}
			return vnode;
		}
	};

	const builtInComponents = {
		KeepAlive
	};

/*  */

	function initGlobalAPI(Vue) {
  // Config
		const configDef = {};
		configDef.get = function () {
			return config;
		};
		{
			configDef.set = function () {
				warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
			};
		}
		Object.defineProperty(Vue, 'config', configDef);

  // Exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
		Vue.util = {
			warn,
			extend,
			mergeOptions,
			defineReactive: defineReactive$$1
		};

		Vue.set = set;
		Vue.delete = del;
		Vue.nextTick = nextTick;

		Vue.options = Object.create(null);
		config._assetTypes.forEach(type => {
			Vue.options[type + 's'] = Object.create(null);
		});

  // This is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
		Vue.options._base = Vue;

		extend(Vue.options.components, builtInComponents);

		initUse(Vue);
		initMixin$1(Vue);
		initExtend(Vue);
		initAssetRegisters(Vue);
	}

	initGlobalAPI(Vue$3);

	Object.defineProperty(Vue$3.prototype, '$isServer', {
		get: isServerRendering
	});

	Vue$3.version = '2.2.2';

/*  */

// attributes that should be using props for binding
	const acceptValue = makeMap('input,textarea,option,select');
	const mustUseProp = function (tag, type, attr) {
		return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
		);
	};

	const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

	const isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

	const xlinkNS = 'http://www.w3.org/1999/xlink';

	const isXlink = function (name) {
		return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
	};

	const getXlinkProp = function (name) {
		return isXlink(name) ? name.slice(6, name.length) : '';
	};

	const isFalsyAttrValue = function (val) {
		return val == null || val === false;
	};

/*  */

	function genClassForVnode(vnode) {
		let data = vnode.data;
		let parentNode = vnode;
		let childNode = vnode;
		while (childNode.componentInstance) {
			childNode = childNode.componentInstance._vnode;
			if (childNode.data) {
				data = mergeClassData(childNode.data, data);
			}
		}
		while ((parentNode = parentNode.parent)) {
			if (parentNode.data) {
				data = mergeClassData(data, parentNode.data);
			}
		}
		return genClassFromData(data);
	}

	function mergeClassData(child, parent) {
		return {
			staticClass: concat(child.staticClass, parent.staticClass),
			class: child.class ?
      [child.class, parent.class] :
      parent.class
		};
	}

	function genClassFromData(data) {
		const dynamicClass = data.class;
		const staticClass = data.staticClass;
		if (staticClass || dynamicClass) {
			return concat(staticClass, stringifyClass(dynamicClass));
		}
  /* istanbul ignore next */
		return '';
	}

	function concat(a, b) {
		return a ? b ? (a + ' ' + b) : a : (b || '');
	}

	function stringifyClass(value) {
		let res = '';
		if (!value) {
			return res;
		}
		if (typeof value === 'string') {
			return value;
		}
		if (Array.isArray(value)) {
			let stringified;
			for (let i = 0, l = value.length; i < l; i++) {
				if (value[i]) {
					if ((stringified = stringifyClass(value[i]))) {
						res += stringified + ' ';
					}
				}
			}
			return res.slice(0, -1);
		}
		if (isObject(value)) {
			for (const key in value) {
				if (value[key]) {
					res += key + ' ';
				}
			}
			return res.slice(0, -1);
		}
  /* istanbul ignore next */
		return res;
	}

/*  */

	const namespaceMap = {
		svg: 'http://www.w3.org/2000/svg',
		math: 'http://www.w3.org/1998/Math/MathML'
	};

	const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
);

// This map is intentionally selective, only covering SVG elements that may
// contain child elements.
	const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

	const isPreTag = function (tag) {
		return tag === 'pre';
	};

	const isReservedTag = function (tag) {
		return isHTMLTag(tag) || isSVG(tag);
	};

	function getTagNamespace(tag) {
		if (isSVG(tag)) {
			return 'svg';
		}
  // Basic support for MathML
  // note it doesn't support other MathML elements being component roots
		if (tag === 'math') {
			return 'math';
		}
	}

	const unknownElementCache = Object.create(null);
	function isUnknownElement(tag) {
  /* istanbul ignore if */
		if (!inBrowser) {
			return true;
		}
		if (isReservedTag(tag)) {
			return false;
		}
		tag = tag.toLowerCase();
  /* istanbul ignore if */
		if (unknownElementCache[tag] != null) {
			return unknownElementCache[tag];
		}
		const el = document.createElement(tag);
		if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
			return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ));
		}
		return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()));
	}

/*  */

/**
 * Query an element selector if it's not an element already.
 */
	function query(el) {
		if (typeof el === 'string') {
			const selected = document.querySelector(el);
			if (!selected) {
				'development' !== 'production' && warn(
        'Cannot find element: ' + el
      );
				return document.createElement('div');
			}
			return selected;
		}
		return el;
	}

/*  */

	function createElement$1(tagName, vnode) {
		const elm = document.createElement(tagName);
		if (tagName !== 'select') {
			return elm;
		}
  // False or null will remove the attribute but undefined will not
		if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
			elm.setAttribute('multiple', 'multiple');
		}
		return elm;
	}

	function createElementNS(namespace, tagName) {
		return document.createElementNS(namespaceMap[namespace], tagName);
	}

	function createTextNode(text) {
		return document.createTextNode(text);
	}

	function createComment(text) {
		return document.createComment(text);
	}

	function insertBefore(parentNode, newNode, referenceNode) {
		parentNode.insertBefore(newNode, referenceNode);
	}

	function removeChild(node, child) {
		node.removeChild(child);
	}

	function appendChild(node, child) {
		node.appendChild(child);
	}

	function parentNode(node) {
		return node.parentNode;
	}

	function nextSibling(node) {
		return node.nextSibling;
	}

	function tagName(node) {
		return node.tagName;
	}

	function setTextContent(node, text) {
		node.textContent = text;
	}

	function setAttribute(node, key, val) {
		node.setAttribute(key, val);
	}

	const nodeOps = Object.freeze({
		createElement: createElement$1,
		createElementNS,
		createTextNode,
		createComment,
		insertBefore,
		removeChild,
		appendChild,
		parentNode,
		nextSibling,
		tagName,
		setTextContent,
		setAttribute
	});

/*  */

	const ref = {
		create: function create(_, vnode) {
			registerRef(vnode);
		},
		update: function update(oldVnode, vnode) {
			if (oldVnode.data.ref !== vnode.data.ref) {
				registerRef(oldVnode, true);
				registerRef(vnode);
			}
		},
		destroy: function destroy(vnode) {
			registerRef(vnode, true);
		}
	};

	function registerRef(vnode, isRemoval) {
		const key = vnode.data.ref;
		if (!key) {
			return;
		}

		const vm = vnode.context;
		const ref = vnode.componentInstance || vnode.elm;
		const refs = vm.$refs;
		if (isRemoval) {
			if (Array.isArray(refs[key])) {
				remove(refs[key], ref);
			} else if (refs[key] === ref) {
				refs[key] = undefined;
			}
		} else if (vnode.data.refInFor) {
			if (Array.isArray(refs[key]) && refs[key].indexOf(ref) < 0) {
				refs[key].push(ref);
			} else {
				refs[key] = [ref];
			}
		} else {
			refs[key] = ref;
		}
	}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

	const emptyNode = new VNode('', {}, []);

	const hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy'];

	function isUndef(s) {
		return s == null;
	}

	function isDef(s) {
		return s != null;
	}

	function sameVnode(vnode1, vnode2) {
		return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment &&
    !vnode1.data === !vnode2.data
		);
	}

	function createKeyToOldIdx(children, beginIdx, endIdx) {
		let i, key;
		const map = {};
		for (i = beginIdx; i <= endIdx; ++i) {
			key = children[i].key;
			if (isDef(key)) {
				map[key] = i;
			}
		}
		return map;
	}

	function createPatchFunction(backend) {
		let i, j;
		const cbs = {};

		const modules = backend.modules;
		const nodeOps = backend.nodeOps;

		for (i = 0; i < hooks$1.length; ++i) {
			cbs[hooks$1[i]] = [];
			for (j = 0; j < modules.length; ++j) {
				if (modules[j][hooks$1[i]] !== undefined) {
					cbs[hooks$1[i]].push(modules[j][hooks$1[i]]);
				}
			}
		}

		function emptyNodeAt(elm) {
			return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
		}

		function createRmCb(childElm, listeners) {
			function remove$$1() {
				if (--remove$$1.listeners === 0) {
					removeNode(childElm);
				}
			}
			remove$$1.listeners = listeners;
			return remove$$1;
		}

		function removeNode(el) {
			const parent = nodeOps.parentNode(el);
    // Element may have already been removed due to v-html / v-text
			if (parent) {
				nodeOps.removeChild(parent, el);
			}
		}

		let inPre = 0;
		function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
			vnode.isRootInsert = !nested; // For transition enter check
			if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
				return;
			}

			const data = vnode.data;
			const children = vnode.children;
			const tag = vnode.tag;
			if (isDef(tag)) {
				{
					if (data && data.pre) {
						inPre++;
					}
					if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
						warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
					}
				}
				vnode.elm = vnode.ns ?
        nodeOps.createElementNS(vnode.ns, tag) :
        nodeOps.createElement(tag, vnode);
				setScope(vnode);

      /* istanbul ignore if */
				{
					createChildren(vnode, children, insertedVnodeQueue);
					if (isDef(data)) {
						invokeCreateHooks(vnode, insertedVnodeQueue);
					}
					insert(parentElm, vnode.elm, refElm);
				}

				if ('development' !== 'production' && data && data.pre) {
					inPre--;
				}
			} else if (vnode.isComment) {
				vnode.elm = nodeOps.createComment(vnode.text);
				insert(parentElm, vnode.elm, refElm);
			} else {
				vnode.elm = nodeOps.createTextNode(vnode.text);
				insert(parentElm, vnode.elm, refElm);
			}
		}

		function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
			let i = vnode.data;
			if (isDef(i)) {
				const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
				if (isDef(i = i.hook) && isDef(i = i.init)) {
					i(vnode, false /* hydrating */, parentElm, refElm);
				}
      // After calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
				if (isDef(vnode.componentInstance)) {
					initComponent(vnode, insertedVnodeQueue);
					if (isReactivated) {
						reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
					}
					return true;
				}
			}
		}

		function initComponent(vnode, insertedVnodeQueue) {
			if (vnode.data.pendingInsert) {
				insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
			}
			vnode.elm = vnode.componentInstance.$el;
			if (isPatchable(vnode)) {
				invokeCreateHooks(vnode, insertedVnodeQueue);
				setScope(vnode);
			} else {
      // Empty component root.
      // skip all element-related modules except for ref (#3455)
				registerRef(vnode);
      // Make sure to invoke the insert hook
				insertedVnodeQueue.push(vnode);
			}
		}

		function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
			let i;
    // Hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
			let innerNode = vnode;
			while (innerNode.componentInstance) {
				innerNode = innerNode.componentInstance._vnode;
				if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
					for (i = 0; i < cbs.activate.length; ++i) {
						cbs.activate[i](emptyNode, innerNode);
					}
					insertedVnodeQueue.push(innerNode);
					break;
				}
			}
    // Unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
			insert(parentElm, vnode.elm, refElm);
		}

		function insert(parent, elm, ref) {
			if (parent) {
				if (ref) {
					nodeOps.insertBefore(parent, elm, ref);
				} else {
					nodeOps.appendChild(parent, elm);
				}
			}
		}

		function createChildren(vnode, children, insertedVnodeQueue) {
			if (Array.isArray(children)) {
				for (let i = 0; i < children.length; ++i) {
					createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
				}
			} else if (isPrimitive(vnode.text)) {
				nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
			}
		}

		function isPatchable(vnode) {
			while (vnode.componentInstance) {
				vnode = vnode.componentInstance._vnode;
			}
			return isDef(vnode.tag);
		}

		function invokeCreateHooks(vnode, insertedVnodeQueue) {
			for (let i$1 = 0; i$1 < cbs.create.length; ++i$1) {
				cbs.create[i$1](emptyNode, vnode);
			}
			i = vnode.data.hook; // Reuse variable
			if (isDef(i)) {
				if (i.create) {
					i.create(emptyNode, vnode);
				}
				if (i.insert) {
					insertedVnodeQueue.push(vnode);
				}
			}
		}

  // Set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
		function setScope(vnode) {
			let i;
			let ancestor = vnode;
			while (ancestor) {
				if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
					nodeOps.setAttribute(vnode.elm, i, '');
				}
				ancestor = ancestor.parent;
			}
    // For slot content they should also get the scopeId from the host instance.
			if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        isDef(i = i.$options._scopeId)) {
				nodeOps.setAttribute(vnode.elm, i, '');
			}
		}

		function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
			for (; startIdx <= endIdx; ++startIdx) {
				createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
			}
		}

		function invokeDestroyHook(vnode) {
			let i, j;
			const data = vnode.data;
			if (isDef(data)) {
				if (isDef(i = data.hook) && isDef(i = i.destroy)) {
					i(vnode);
				}
				for (i = 0; i < cbs.destroy.length; ++i) {
					cbs.destroy[i](vnode);
				}
			}
			if (isDef(i = vnode.children)) {
				for (j = 0; j < vnode.children.length; ++j) {
					invokeDestroyHook(vnode.children[j]);
				}
			}
		}

		function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
			for (; startIdx <= endIdx; ++startIdx) {
				const ch = vnodes[startIdx];
				if (isDef(ch)) {
					if (isDef(ch.tag)) {
						removeAndInvokeRemoveHook(ch);
						invokeDestroyHook(ch);
					} else { // Text node
						removeNode(ch.elm);
					}
				}
			}
		}

		function removeAndInvokeRemoveHook(vnode, rm) {
			if (rm || isDef(vnode.data)) {
				const listeners = cbs.remove.length + 1;
				if (!rm) {
        // Directly removing
					rm = createRmCb(vnode.elm, listeners);
				} else {
        // We have a recursively passed down rm callback
        // increase the listeners count
					rm.listeners += listeners;
				}
      // Recursively invoke hooks on child component root node
				if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
					removeAndInvokeRemoveHook(i, rm);
				}
				for (i = 0; i < cbs.remove.length; ++i) {
					cbs.remove[i](vnode, rm);
				}
				if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
					i(vnode, rm);
				} else {
					rm();
				}
			} else {
				removeNode(vnode.elm);
			}
		}

		function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
			let oldStartIdx = 0;
			let newStartIdx = 0;
			let oldEndIdx = oldCh.length - 1;
			let oldStartVnode = oldCh[0];
			let oldEndVnode = oldCh[oldEndIdx];
			let newEndIdx = newCh.length - 1;
			let newStartVnode = newCh[0];
			let newEndVnode = newCh[newEndIdx];
			let oldKeyToIdx, idxInOld, elmToMove, refElm;

    // RemoveOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
			const canMove = !removeOnly;

			while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
				if (isUndef(oldStartVnode)) {
					oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
				} else if (isUndef(oldEndVnode)) {
					oldEndVnode = oldCh[--oldEndIdx];
				} else if (sameVnode(oldStartVnode, newStartVnode)) {
					patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
					oldStartVnode = oldCh[++oldStartIdx];
					newStartVnode = newCh[++newStartIdx];
				} else if (sameVnode(oldEndVnode, newEndVnode)) {
					patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
					oldEndVnode = oldCh[--oldEndIdx];
					newEndVnode = newCh[--newEndIdx];
				} else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
					patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
					canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
					oldStartVnode = oldCh[++oldStartIdx];
					newEndVnode = newCh[--newEndIdx];
				} else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
				patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
				canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
				oldEndVnode = oldCh[--oldEndIdx];
				newStartVnode = newCh[++newStartIdx];
			} else {
				if (isUndef(oldKeyToIdx)) {
				oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
			}
				idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
				if (isUndef(idxInOld)) { // New element
				createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
				newStartVnode = newCh[++newStartIdx];
			} else {
				elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
				if ('development' !== 'production' && !elmToMove) {
				warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            );
			}
				if (sameVnode(elmToMove, newStartVnode)) {
				patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
				oldCh[idxInOld] = undefined;
				canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
				newStartVnode = newCh[++newStartIdx];
			} else {
            // Same key but different element. treat as new element
				createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
				newStartVnode = newCh[++newStartIdx];
			}
			}
			}
			}
			if (oldStartIdx > oldEndIdx) {
				refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
				addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
			} else if (newStartIdx > newEndIdx) {
				removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
			}
		}

		function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
			if (oldVnode === vnode) {
				return;
			}
    // Reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
			if (vnode.isStatic &&
        oldVnode.isStatic &&
        vnode.key === oldVnode.key &&
        (vnode.isCloned || vnode.isOnce)) {
				vnode.elm = oldVnode.elm;
				vnode.componentInstance = oldVnode.componentInstance;
				return;
			}
			let i;
			const data = vnode.data;
			const hasData = isDef(data);
			if (hasData && isDef(i = data.hook) && isDef(i = i.prepatch)) {
				i(oldVnode, vnode);
			}
			const elm = vnode.elm = oldVnode.elm;
			const oldCh = oldVnode.children;
			const ch = vnode.children;
			if (hasData && isPatchable(vnode)) {
				for (i = 0; i < cbs.update.length; ++i) {
					cbs.update[i](oldVnode, vnode);
				}
				if (isDef(i = data.hook) && isDef(i = i.update)) {
					i(oldVnode, vnode);
				}
			}
			if (isUndef(vnode.text)) {
				if (isDef(oldCh) && isDef(ch)) {
					if (oldCh !== ch) {
						updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
					}
				} else if (isDef(ch)) {
					if (isDef(oldVnode.text)) {
						nodeOps.setTextContent(elm, '');
					}
					addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
				} else if (isDef(oldCh)) {
					removeVnodes(elm, oldCh, 0, oldCh.length - 1);
				} else if (isDef(oldVnode.text)) {
					nodeOps.setTextContent(elm, '');
				}
			} else if (oldVnode.text !== vnode.text) {
				nodeOps.setTextContent(elm, vnode.text);
			}
			if (hasData) {
				if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
					i(oldVnode, vnode);
				}
			}
		}

		function invokeInsertHook(vnode, queue, initial) {
    // Delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
			if (initial && vnode.parent) {
				vnode.parent.data.pendingInsert = queue;
			} else {
				for (let i = 0; i < queue.length; ++i) {
					queue[i].data.hook.insert(queue[i]);
				}
			}
		}

		let bailed = false;
  // List of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
		const isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
		function hydrate(elm, vnode, insertedVnodeQueue) {
			{
				if (!assertNodeMatch(elm, vnode)) {
					return false;
				}
			}
			vnode.elm = elm;
			const tag = vnode.tag;
			const data = vnode.data;
			const children = vnode.children;
			if (isDef(data)) {
				if (isDef(i = data.hook) && isDef(i = i.init)) {
					i(vnode, true /* hydrating */);
				}
				if (isDef(i = vnode.componentInstance)) {
        // Child component. it should have hydrated its own tree.
					initComponent(vnode, insertedVnodeQueue);
					return true;
				}
			}
			if (isDef(tag)) {
				if (isDef(children)) {
        // Empty element, allow client to pick up and populate children
					if (!elm.hasChildNodes()) {
						createChildren(vnode, children, insertedVnodeQueue);
					} else {
						let childrenMatch = true;
						let childNode = elm.firstChild;
						for (let i$1 = 0; i$1 < children.length; i$1++) {
							if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
								childrenMatch = false;
								break;
							}
							childNode = childNode.nextSibling;
						}
          // If childNode is not null, it means the actual childNodes list is
          // longer than the virtual children list.
						if (!childrenMatch || childNode) {
							if ('development' !== 'production' &&
                typeof console !== 'undefined' &&
                !bailed) {
								bailed = true;
								console.warn('Parent: ', elm);
								console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
							}
							return false;
						}
					}
				}
				if (isDef(data)) {
					for (const key in data) {
						if (!isRenderedModule(key)) {
							invokeCreateHooks(vnode, insertedVnodeQueue);
							break;
						}
					}
				}
			} else if (elm.data !== vnode.text) {
				elm.data = vnode.text;
			}
			return true;
		}

		function assertNodeMatch(node, vnode) {
			if (vnode.tag) {
				return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
				);
			}
			return node.nodeType === (vnode.isComment ? 8 : 3);
		}

		return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
			if (!vnode) {
				if (oldVnode) {
					invokeDestroyHook(oldVnode);
				}
				return;
			}

			let isInitialPatch = false;
			const insertedVnodeQueue = [];

			if (!oldVnode) {
      // Empty mount (likely as component), create new root element
				isInitialPatch = true;
				createElm(vnode, insertedVnodeQueue, parentElm, refElm);
			} else {
				const isRealElement = isDef(oldVnode.nodeType);
				if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // Patch existing root node
					patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
				} else {
					if (isRealElement) {
          // Mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
						if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
							oldVnode.removeAttribute('server-rendered');
							hydrating = true;
						}
						if (hydrating) {
							if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
								invokeInsertHook(vnode, insertedVnodeQueue, true);
								return oldVnode;
							}
							warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
						}
          // Either not server-rendered, or hydration failed.
          // create an empty node and replace it
						oldVnode = emptyNodeAt(oldVnode);
					}
        // Replacing existing element
					const oldElm = oldVnode.elm;
					const parentElm$1 = nodeOps.parentNode(oldElm);
					createElm(
          vnode,
          insertedVnodeQueue,
          // Extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm$1,
          nodeOps.nextSibling(oldElm)
        );

					if (vnode.parent) {
          // Component root element replaced.
          // update parent placeholder node element, recursively
						let ancestor = vnode.parent;
						while (ancestor) {
							ancestor.elm = vnode.elm;
							ancestor = ancestor.parent;
						}
						if (isPatchable(vnode)) {
							for (let i = 0; i < cbs.create.length; ++i) {
								cbs.create[i](emptyNode, vnode.parent);
							}
						}
					}

					if (parentElm$1 !== null) {
						removeVnodes(parentElm$1, [oldVnode], 0, 0);
					} else if (isDef(oldVnode.tag)) {
						invokeDestroyHook(oldVnode);
					}
				}
			}

			invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
			return vnode.elm;
		};
	}

/*  */

	const directives = {
		create: updateDirectives,
		update: updateDirectives,
		destroy: function unbindDirectives(vnode) {
			updateDirectives(vnode, emptyNode);
		}
	};

	function updateDirectives(oldVnode, vnode) {
		if (oldVnode.data.directives || vnode.data.directives) {
			_update(oldVnode, vnode);
		}
	}

	function _update(oldVnode, vnode) {
		const isCreate = oldVnode === emptyNode;
		const isDestroy = vnode === emptyNode;
		const oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
		const newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

		const dirsWithInsert = [];
		const dirsWithPostpatch = [];

		let key, oldDir, dir;
		for (key in newDirs) {
			oldDir = oldDirs[key];
			dir = newDirs[key];
			if (!oldDir) {
      // New directive, bind
				callHook$1(dir, 'bind', vnode, oldVnode);
				if (dir.def && dir.def.inserted) {
					dirsWithInsert.push(dir);
				}
			} else {
      // Existing directive, update
				dir.oldValue = oldDir.value;
				callHook$1(dir, 'update', vnode, oldVnode);
				if (dir.def && dir.def.componentUpdated) {
					dirsWithPostpatch.push(dir);
				}
			}
		}

		if (dirsWithInsert.length) {
			const callInsert = function () {
				for (let i = 0; i < dirsWithInsert.length; i++) {
					callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
				}
			};
			if (isCreate) {
				mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
			} else {
				callInsert();
			}
		}

		if (dirsWithPostpatch.length) {
			mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', () => {
				for (let i = 0; i < dirsWithPostpatch.length; i++) {
					callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
				}
			});
		}

		if (!isCreate) {
			for (key in oldDirs) {
				if (!newDirs[key]) {
        // No longer present, unbind
					callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
				}
			}
		}
	}

	const emptyModifiers = Object.create(null);

	function normalizeDirectives$1(
		dirs,
		vm
) {
		const res = Object.create(null);
		if (!dirs) {
			return res;
		}
		let i, dir;
		for (i = 0; i < dirs.length; i++) {
			dir = dirs[i];
			if (!dir.modifiers) {
				dir.modifiers = emptyModifiers;
			}
			res[getRawDirName(dir)] = dir;
			dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
		}
		return res;
	}

	function getRawDirName(dir) {
		return dir.rawName || ((dir.name) + '.' + (Object.keys(dir.modifiers || {}).join('.')));
	}

	function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
		const fn = dir.def && dir.def[hook];
		if (fn) {
			fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
		}
	}

	const baseModules = [
		ref,
		directives
	];

/*  */

	function updateAttrs(oldVnode, vnode) {
		if (!oldVnode.data.attrs && !vnode.data.attrs) {
			return;
		}
		let key, cur, old;
		const elm = vnode.elm;
		const oldAttrs = oldVnode.data.attrs || {};
		let attrs = vnode.data.attrs || {};
  // Clone observed objects, as the user probably wants to mutate it
		if (attrs.__ob__) {
			attrs = vnode.data.attrs = extend({}, attrs);
		}

		for (key in attrs) {
			cur = attrs[key];
			old = oldAttrs[key];
			if (old !== cur) {
				setAttr(elm, key, cur);
			}
		}
  // #4391: in IE9, setting type can reset value for input[type=radio]
  /* istanbul ignore if */
		if (isIE9 && attrs.value !== oldAttrs.value) {
			setAttr(elm, 'value', attrs.value);
		}
		for (key in oldAttrs) {
			if (attrs[key] == null) {
				if (isXlink(key)) {
					elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
				} else if (!isEnumeratedAttr(key)) {
					elm.removeAttribute(key);
				}
			}
		}
	}

	function setAttr(el, key, value) {
		if (isBooleanAttr(key)) {
    // Set attribute for blank value
    // e.g. <option disabled>Select one</option>
			if (isFalsyAttrValue(value)) {
				el.removeAttribute(key);
			} else {
				el.setAttribute(key, key);
			}
		} else if (isEnumeratedAttr(key)) {
			el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
		} else if (isXlink(key)) {
			if (isFalsyAttrValue(value)) {
				el.removeAttributeNS(xlinkNS, getXlinkProp(key));
			} else {
				el.setAttributeNS(xlinkNS, key, value);
			}
		} else if (isFalsyAttrValue(value)) {
			el.removeAttribute(key);
		} else {
			el.setAttribute(key, value);
		}
	}

	const attrs = {
		create: updateAttrs,
		update: updateAttrs
	};

/*  */

	function updateClass(oldVnode, vnode) {
		const el = vnode.elm;
		const data = vnode.data;
		const oldData = oldVnode.data;
		if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
			return;
		}

		let cls = genClassForVnode(vnode);

  // Handle transition classes
		const transitionClass = el._transitionClasses;
		if (transitionClass) {
			cls = concat(cls, stringifyClass(transitionClass));
		}

  // Set the class
		if (cls !== el._prevClass) {
			el.setAttribute('class', cls);
			el._prevClass = cls;
		}
	}

	const klass = {
		create: updateClass,
		update: updateClass
	};

/*  */

	const validDivisionCharRE = /[\w).+\-_$\]]/;

	function parseFilters(exp) {
		let inSingle = false;
		let inDouble = false;
		let inTemplateString = false;
		let inRegex = false;
		let curly = 0;
		let square = 0;
		let paren = 0;
		let lastFilterIndex = 0;
		let c, prev, i, expression, filters;

		for (i = 0; i < exp.length; i++) {
			prev = c;
			c = exp.charCodeAt(i);
			if (inSingle) {
				if (c === 0x27 && prev !== 0x5C) {
					inSingle = false;
				}
			} else if (inDouble) {
				if (c === 0x22 && prev !== 0x5C) {
					inDouble = false;
				}
			} else if (inTemplateString) {
				if (c === 0x60 && prev !== 0x5C) {
					inTemplateString = false;
				}
			} else if (inRegex) {
				if (c === 0x2F && prev !== 0x5C) {
					inRegex = false;
				}
			} else if (
      c === 0x7C && // Pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
				if (expression === undefined) {
        // First filter, end of expression
					lastFilterIndex = i + 1;
					expression = exp.slice(0, i).trim();
				} else {
					pushFilter();
				}
			} else {
				switch (c) {
					case 0x22: inDouble = true; break;         // "
					case 0x27: inSingle = true; break;         // '
					case 0x60: inTemplateString = true; break; // `
					case 0x28: paren++; break;                 // (
					case 0x29: paren--; break;                 // )
					case 0x5B: square++; break;                // [
					case 0x5D: square--; break;                // ]
					case 0x7B: curly++; break;                 // {
					case 0x7D: curly--; break;                 // }
				}
				if (c === 0x2F) { // /
					let j = i - 1;
					let p = (void 0);
        // Find first non-whitespace prev char
					for (; j >= 0; j--) {
					p = exp.charAt(j);
					if (p !== ' ') {
					break;
				}
				}
					if (!p || !validDivisionCharRE.test(p)) {
					inRegex = true;
				}
				}
			}
		}

		if (expression === undefined) {
			expression = exp.slice(0, i).trim();
		} else if (lastFilterIndex !== 0) {
			pushFilter();
		}

		function pushFilter() {
			(filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
			lastFilterIndex = i + 1;
		}

		if (filters) {
			for (i = 0; i < filters.length; i++) {
				expression = wrapFilter(expression, filters[i]);
			}
		}

		return expression;
	}

	function wrapFilter(exp, filter) {
		const i = filter.indexOf('(');
		if (i < 0) {
    // _f: resolveFilter
			return ('_f("' + filter + '")(' + exp + ')');
		}
		const name = filter.slice(0, i);
		const args = filter.slice(i + 1);
		return ('_f("' + name + '")(' + exp + ',' + args);
	}

/*  */

	function baseWarn(msg) {
		console.error(('[Vue compiler]: ' + msg));
	}

	function pluckModuleFunction(
		modules,
		key
) {
		return modules ?
    modules.map(m => {
	return m[key];
}).filter(_ => {
	return _;
}) :
    [];
	}

	function addProp(el, name, value) {
		(el.props || (el.props = [])).push({name, value});
	}

	function addAttr(el, name, value) {
		(el.attrs || (el.attrs = [])).push({name, value});
	}

	function addDirective(
		el,
		name,
		rawName,
		value,
		arg,
		modifiers
) {
		(el.directives || (el.directives = [])).push({name, rawName, value, arg, modifiers});
	}

	function addHandler(
		el,
		name,
		value,
		modifiers,
		important
) {
  // Check capture modifier
		if (modifiers && modifiers.capture) {
			delete modifiers.capture;
			name = '!' + name; // Mark the event as captured
		}
		if (modifiers && modifiers.once) {
			delete modifiers.once;
			name = '~' + name; // Mark the event as once
		}
		let events;
		if (modifiers && modifiers.native) {
			delete modifiers.native;
			events = el.nativeEvents || (el.nativeEvents = {});
		} else {
			events = el.events || (el.events = {});
		}
		const newHandler = {value, modifiers};
		const handlers = events[name];
  /* istanbul ignore if */
		if (Array.isArray(handlers)) {
			important ? handlers.unshift(newHandler) : handlers.push(newHandler);
		} else if (handlers) {
			events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
		} else {
			events[name] = newHandler;
		}
	}

	function getBindingAttr(
		el,
		name,
		getStatic
) {
		const dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
		if (dynamicValue != null) {
			return parseFilters(dynamicValue);
		} else if (getStatic !== false) {
			const staticValue = getAndRemoveAttr(el, name);
			if (staticValue != null) {
				return JSON.stringify(staticValue);
			}
		}
	}

	function getAndRemoveAttr(el, name) {
		let val;
		if ((val = el.attrsMap[name]) != null) {
			const list = el.attrsList;
			for (let i = 0, l = list.length; i < l; i++) {
				if (list[i].name === name) {
					list.splice(i, 1);
					break;
				}
			}
		}
		return val;
	}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
	function genComponentModel(
		el,
		value,
		modifiers
) {
		const ref = modifiers || {};
		const number = ref.number;
		const trim = ref.trim;

		const baseValueExpression = '$$v';
		let valueExpression = baseValueExpression;
		if (trim) {
			valueExpression =
      '(typeof ' + baseValueExpression + ' === \'string\'' +
        '? ' + baseValueExpression + '.trim()' +
        ': ' + baseValueExpression + ')';
		}
		if (number) {
			valueExpression = '_n(' + valueExpression + ')';
		}
		const assignment = genAssignmentCode(value, valueExpression);

		el.model = {
			value: ('(' + value + ')'),
			expression: ('"' + value + '"'),
			callback: ('function (' + baseValueExpression + ') {' + assignment + '}')
		};
	}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
	function genAssignmentCode(
		value,
		assignment
) {
		const modelRs = parseModel(value);
		if (modelRs.idx === null) {
			return (value + '=' + assignment);
		}
		return 'var $$exp = ' + (modelRs.exp) + ', $$idx = ' + (modelRs.idx) + ';' +
      'if (!Array.isArray($$exp)){' +
        value + '=' + assignment + '}' +
      'else{$$exp.splice($$idx, 1, ' + assignment + ')}';
	}

/**
 * Parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
 *
 * for loop possible cases:
 *
 * - test
 * - test[idx]
 * - test[test1[idx]]
 * - test["a"][idx]
 * - xxx.test[a[a].test1[idx]]
 * - test.xxx.a["asa"][test1[idx]]
 *
 */

	let len;
	let str;
	let chr;
	let index$1;
	let expressionPos;
	let expressionEndPos;

	function parseModel(val) {
		str = val;
		len = str.length;
		index$1 = expressionPos = expressionEndPos = 0;

		if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
			return {
				exp: val,
				idx: null
			};
		}

		while (!eof()) {
			chr = next();
    /* istanbul ignore if */
			if (isStringStart(chr)) {
				parseString(chr);
			} else if (chr === 0x5B) {
				parseBracket(chr);
			}
		}

		return {
			exp: val.substring(0, expressionPos),
			idx: val.substring(expressionPos + 1, expressionEndPos)
		};
	}

	function next() {
		return str.charCodeAt(++index$1);
	}

	function eof() {
		return index$1 >= len;
	}

	function isStringStart(chr) {
		return chr === 0x22 || chr === 0x27;
	}

	function parseBracket(chr) {
		let inBracket = 1;
		expressionPos = index$1;
		while (!eof()) {
			chr = next();
			if (isStringStart(chr)) {
				parseString(chr);
				continue;
			}
			if (chr === 0x5B) {
				inBracket++;
			}
			if (chr === 0x5D) {
				inBracket--;
			}
			if (inBracket === 0) {
				expressionEndPos = index$1;
				break;
			}
		}
	}

	function parseString(chr) {
		const stringQuote = chr;
		while (!eof()) {
			chr = next();
			if (chr === stringQuote) {
				break;
			}
		}
	}

/*  */

	let warn$1;

// In some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
	const RANGE_TOKEN = '__r';
	const CHECKBOX_RADIO_TOKEN = '__c';

	function model(
		el,
		dir,
		_warn
) {
		warn$1 = _warn;
		const value = dir.value;
		const modifiers = dir.modifiers;
		const tag = el.tag;
		const type = el.attrsMap.type;

		{
			const dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
			if (tag === 'input' && dynamicType) {
				warn$1(
        '<input :type="' + dynamicType + '" v-model="' + value + '">:\n' +
        'v-model does not support dynamic input types. Use v-if branches instead.'
      );
			}
    // Inputs with type="file" are read only and setting the input's
    // value will throw an error.
			if (tag === 'input' && type === 'file') {
				warn$1(
        '<' + (el.tag) + ' v-model="' + value + '" type="file">:\n' +
        'File inputs are read only. Use a v-on:change listener instead.'
      );
			}
		}

		if (tag === 'select') {
			genSelect(el, value, modifiers);
		} else if (tag === 'input' && type === 'checkbox') {
			genCheckboxModel(el, value, modifiers);
		} else if (tag === 'input' && type === 'radio') {
			genRadioModel(el, value, modifiers);
		} else if (tag === 'input' || tag === 'textarea') {
			genDefaultModel(el, value, modifiers);
		} else if (!config.isReservedTag(tag)) {
			genComponentModel(el, value, modifiers);
    // Component v-model doesn't need extra runtime
			return false;
		} else {
			warn$1(
      '<' + (el.tag) + ' v-model="' + value + '">: ' +
      'v-model is not supported on this element type. ' +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.'
    );
		}

  // Ensure runtime directive metadata
		return true;
	}

	function genCheckboxModel(
		el,
		value,
		modifiers
) {
		const number = modifiers && modifiers.number;
		const valueBinding = getBindingAttr(el, 'value') || 'null';
		const trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
		const falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
		addProp(el, 'checked',
    'Array.isArray(' + value + ')' +
      '?_i(' + value + ',' + valueBinding + ')>-1' + (
        trueValueBinding === 'true' ?
          (':(' + value + ')') :
          (':_q(' + value + ',' + trueValueBinding + ')')
      )
  );
		addHandler(el, CHECKBOX_RADIO_TOKEN,
    'var $$a=' + value + ',' +
        '$$el=$event.target,' +
        '$$c=$$el.checked?(' + trueValueBinding + '):(' + falseValueBinding + ');' +
    'if(Array.isArray($$a)){' +
      'var $$v=' + (number ? '_n(' + valueBinding + ')' : valueBinding) + ',' +
          '$$i=_i($$a,$$v);' +
      'if($$c){$$i<0&&(' + value + '=$$a.concat($$v))}' +
      'else{$$i>-1&&(' + value + '=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}' +
    '}else{' + value + '=$$c}',
    null, true
  );
	}

	function genRadioModel(
		el,
		value,
		modifiers
) {
		const number = modifiers && modifiers.number;
		let valueBinding = getBindingAttr(el, 'value') || 'null';
		valueBinding = number ? ('_n(' + valueBinding + ')') : valueBinding;
		addProp(el, 'checked', ('_q(' + value + ',' + valueBinding + ')'));
		addHandler(el, CHECKBOX_RADIO_TOKEN, genAssignmentCode(value, valueBinding), null, true);
	}

	function genSelect(
		el,
		value,
		modifiers
) {
		const number = modifiers && modifiers.number;
		const selectedVal = 'Array.prototype.filter' +
    '.call($event.target.options,function(o){return o.selected})' +
    '.map(function(o){var val = "_value" in o ? o._value : o.value;' +
    'return ' + (number ? '_n(val)' : 'val') + '})';

		const assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
		let code = 'var $$selectedVal = ' + selectedVal + ';';
		code = code + ' ' + (genAssignmentCode(value, assignment));
		addHandler(el, 'change', code, null, true);
	}

	function genDefaultModel(
		el,
		value,
		modifiers
) {
		const type = el.attrsMap.type;
		const ref = modifiers || {};
		const lazy = ref.lazy;
		const number = ref.number;
		const trim = ref.trim;
		const needCompositionGuard = !lazy && type !== 'range';
		const event = lazy ?
    'change' :
    type === 'range' ?
      RANGE_TOKEN :
      'input';

		let valueExpression = '$event.target.value';
		if (trim) {
			valueExpression = '$event.target.value.trim()';
		}
		if (number) {
			valueExpression = '_n(' + valueExpression + ')';
		}

		let code = genAssignmentCode(value, valueExpression);
		if (needCompositionGuard) {
			code = 'if($event.target.composing)return;' + code;
		}

		addProp(el, 'value', ('(' + value + ')'));
		addHandler(el, event, code, null, true);
		if (trim || number || type === 'number') {
			addHandler(el, 'blur', '$forceUpdate()');
		}
	}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
	function normalizeEvents(on) {
		let event;
  /* istanbul ignore if */
		if (on[RANGE_TOKEN]) {
    // IE input[type=range] only supports `change` event
			event = isIE ? 'change' : 'input';
			on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
			delete on[RANGE_TOKEN];
		}
		if (on[CHECKBOX_RADIO_TOKEN]) {
    // Chrome fires microtasks in between click/change, leads to #4521
			event = isChrome ? 'click' : 'change';
			on[event] = [].concat(on[CHECKBOX_RADIO_TOKEN], on[event] || []);
			delete on[CHECKBOX_RADIO_TOKEN];
		}
	}

	let target$1;

	function add$1(
		event,
		handler,
		once,
		capture
) {
		if (once) {
			const oldHandler = handler;
			const _target = target$1; // Save current target element in closure
			handler = function (ev) {
				const res = arguments.length === 1 ?
        oldHandler(ev) :
        oldHandler.apply(null, arguments);
				if (res !== null) {
					remove$2(event, handler, capture, _target);
				}
			};
		}
		target$1.addEventListener(event, handler, capture);
	}

	function remove$2(
		event,
		handler,
		capture,
		_target
) {
		(_target || target$1).removeEventListener(event, handler, capture);
	}

	function updateDOMListeners(oldVnode, vnode) {
		if (!oldVnode.data.on && !vnode.data.on) {
			return;
		}
		const on = vnode.data.on || {};
		const oldOn = oldVnode.data.on || {};
		target$1 = vnode.elm;
		normalizeEvents(on);
		updateListeners(on, oldOn, add$1, remove$2, vnode.context);
	}

	const events = {
		create: updateDOMListeners,
		update: updateDOMListeners
	};

/*  */

	function updateDOMProps(oldVnode, vnode) {
		if (!oldVnode.data.domProps && !vnode.data.domProps) {
			return;
		}
		let key, cur;
		const elm = vnode.elm;
		const oldProps = oldVnode.data.domProps || {};
		let props = vnode.data.domProps || {};
  // Clone observed objects, as the user probably wants to mutate it
		if (props.__ob__) {
			props = vnode.data.domProps = extend({}, props);
		}

		for (key in oldProps) {
			if (props[key] == null) {
				elm[key] = '';
			}
		}
		for (key in props) {
			cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
			if (key === 'textContent' || key === 'innerHTML') {
				if (vnode.children) {
					vnode.children.length = 0;
				}
				if (cur === oldProps[key]) {
					continue;
				}
			}

			if (key === 'value') {
      // Store value as _value as well since
      // non-string values will be stringified
				elm._value = cur;
      // Avoid resetting cursor position when value is the same
				const strCur = cur == null ? '' : String(cur);
				if (shouldUpdateValue(elm, vnode, strCur)) {
					elm.value = strCur;
				}
			} else {
				elm[key] = cur;
			}
		}
	}

// Check platforms/web/util/attrs.js acceptValue

	function shouldUpdateValue(
		elm,
		vnode,
		checkVal
) {
		return (!elm.composing && (
    vnode.tag === 'option' ||
    isDirty(elm, checkVal) ||
    isInputChanged(elm, checkVal)
  ));
	}

	function isDirty(elm, checkVal) {
  // Return true when textbox (.number and .trim) loses focus and its value is not equal to the updated value
		return document.activeElement !== elm && elm.value !== checkVal;
	}

	function isInputChanged(elm, newVal) {
		const value = elm.value;
		const modifiers = elm._vModifiers; // Injected by v-model runtime
		if ((modifiers && modifiers.number) || elm.type === 'number') {
			return toNumber(value) !== toNumber(newVal);
		}
		if (modifiers && modifiers.trim) {
			return value.trim() !== newVal.trim();
		}
		return value !== newVal;
	}

	const domProps = {
		create: updateDOMProps,
		update: updateDOMProps
	};

/*  */

	const parseStyleText = cached(cssText => {
		const res = {};
		const listDelimiter = /;(?![^(]*\))/g;
		const propertyDelimiter = /:(.+)/;
		cssText.split(listDelimiter).forEach(item => {
			if (item) {
				const tmp = item.split(propertyDelimiter);
				tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
			}
		});
		return res;
	});

// Merge static and dynamic style data on the same vnode
	function normalizeStyleData(data) {
		const style = normalizeStyleBinding(data.style);
  // Static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
		return data.staticStyle ?
    extend(data.staticStyle, style) :
    style;
	}

// Normalize possible array / string values into Object
	function normalizeStyleBinding(bindingStyle) {
		if (Array.isArray(bindingStyle)) {
			return toObject(bindingStyle);
		}
		if (typeof bindingStyle === 'string') {
			return parseStyleText(bindingStyle);
		}
		return bindingStyle;
	}

/**
 * Parent component style should be after child's
 * so that parent component's style could override it
 */
	function getStyle(vnode, checkChild) {
		const res = {};
		let styleData;

		if (checkChild) {
			let childNode = vnode;
			while (childNode.componentInstance) {
				childNode = childNode.componentInstance._vnode;
				if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
					extend(res, styleData);
				}
			}
		}

		if ((styleData = normalizeStyleData(vnode.data))) {
			extend(res, styleData);
		}

		let parentNode = vnode;
		while ((parentNode = parentNode.parent)) {
			if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
				extend(res, styleData);
			}
		}
		return res;
	}

/*  */

	const cssVarRE = /^--/;
	const importantRE = /\s*!important$/;
	const setProp = function (el, name, val) {
  /* istanbul ignore if */
		if (cssVarRE.test(name)) {
			el.style.setProperty(name, val);
		} else if (importantRE.test(val)) {
			el.style.setProperty(name, val.replace(importantRE, ''), 'important');
		} else {
			el.style[normalize(name)] = val;
		}
	};

	const prefixes = ['Webkit', 'Moz', 'ms'];

	let testEl;
	var normalize = cached(prop => {
		testEl = testEl || document.createElement('div');
		prop = camelize(prop);
		if (prop !== 'filter' && (prop in testEl.style)) {
			return prop;
		}
		const upper = prop.charAt(0).toUpperCase() + prop.slice(1);
		for (let i = 0; i < prefixes.length; i++) {
			const prefixed = prefixes[i] + upper;
			if (prefixed in testEl.style) {
				return prefixed;
			}
		}
	});

	function updateStyle(oldVnode, vnode) {
		const data = vnode.data;
		const oldData = oldVnode.data;

		if (!data.staticStyle && !data.style &&
      !oldData.staticStyle && !oldData.style) {
			return;
		}

		let cur, name;
		const el = vnode.elm;
		const oldStaticStyle = oldVnode.data.staticStyle;
		const oldStyleBinding = oldVnode.data.style || {};

  // If static style exists, stylebinding already merged into it when doing normalizeStyleData
		const oldStyle = oldStaticStyle || oldStyleBinding;

		const style = normalizeStyleBinding(vnode.data.style) || {};

		vnode.data.style = style.__ob__ ? extend({}, style) : style;

		const newStyle = getStyle(vnode, true);

		for (name in oldStyle) {
			if (newStyle[name] == null) {
				setProp(el, name, '');
			}
		}
		for (name in newStyle) {
			cur = newStyle[name];
			if (cur !== oldStyle[name]) {
      // Ie9 setting to null has no effect, must use empty string
				setProp(el, name, cur == null ? '' : cur);
			}
		}
	}

	const style = {
		create: updateStyle,
		update: updateStyle
	};

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
	function addClass(el, cls) {
  /* istanbul ignore if */
		if (!cls || !(cls = cls.trim())) {
			return;
		}

  /* istanbul ignore else */
		if (el.classList) {
			if (cls.indexOf(' ') > -1) {
				cls.split(/\s+/).forEach(c => {
					return el.classList.add(c);
				});
			} else {
				el.classList.add(cls);
			}
		} else {
			const cur = ' ' + (el.getAttribute('class') || '') + ' ';
			if (cur.indexOf(' ' + cls + ' ') < 0) {
				el.setAttribute('class', (cur + cls).trim());
			}
		}
	}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
	function removeClass(el, cls) {
  /* istanbul ignore if */
		if (!cls || !(cls = cls.trim())) {
			return;
		}

  /* istanbul ignore else */
		if (el.classList) {
			if (cls.indexOf(' ') > -1) {
				cls.split(/\s+/).forEach(c => {
					return el.classList.remove(c);
				});
			} else {
				el.classList.remove(cls);
			}
		} else {
			let cur = ' ' + (el.getAttribute('class') || '') + ' ';
			const tar = ' ' + cls + ' ';
			while (cur.indexOf(tar) >= 0) {
				cur = cur.replace(tar, ' ');
			}
			el.setAttribute('class', cur.trim());
		}
	}

/*  */

	function resolveTransition(def$$1) {
		if (!def$$1) {
			return;
		}
  /* istanbul ignore else */
		if (typeof def$$1 === 'object') {
			const res = {};
			if (def$$1.css !== false) {
				extend(res, autoCssTransition(def$$1.name || 'v'));
			}
			extend(res, def$$1);
			return res;
		} else if (typeof def$$1 === 'string') {
			return autoCssTransition(def$$1);
		}
	}

	var autoCssTransition = cached(name => {
		return {
			enterClass: (name + '-enter'),
			enterToClass: (name + '-enter-to'),
			enterActiveClass: (name + '-enter-active'),
			leaveClass: (name + '-leave'),
			leaveToClass: (name + '-leave-to'),
			leaveActiveClass: (name + '-leave-active')
		};
	});

	const hasTransition = inBrowser && !isIE9;
	const TRANSITION = 'transition';
	const ANIMATION = 'animation';

// Transition property/event sniffing
	let transitionProp = 'transition';
	let transitionEndEvent = 'transitionend';
	let animationProp = 'animation';
	let animationEndEvent = 'animationend';
	if (hasTransition) {
  /* istanbul ignore if */
		if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
			transitionProp = 'WebkitTransition';
			transitionEndEvent = 'webkitTransitionEnd';
		}
		if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
			animationProp = 'WebkitAnimation';
			animationEndEvent = 'webkitAnimationEnd';
		}
	}

// Binding to window is necessary to make hot reload work in IE in strict mode
	const raf = inBrowser && window.requestAnimationFrame ?
  window.requestAnimationFrame.bind(window) :
  setTimeout;

	function nextFrame(fn) {
		raf(() => {
			raf(fn);
		});
	}

	function addTransitionClass(el, cls) {
		(el._transitionClasses || (el._transitionClasses = [])).push(cls);
		addClass(el, cls);
	}

	function removeTransitionClass(el, cls) {
		if (el._transitionClasses) {
			remove(el._transitionClasses, cls);
		}
		removeClass(el, cls);
	}

	function whenTransitionEnds(
		el,
		expectedType,
		cb
) {
		const ref = getTransitionInfo(el, expectedType);
		const type = ref.type;
		const timeout = ref.timeout;
		const propCount = ref.propCount;
		if (!type) {
			return cb();
		}
		const event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
		let ended = 0;
		const end = function () {
			el.removeEventListener(event, onEnd);
			cb();
		};
		var onEnd = function (e) {
			if (e.target === el) {
				if (++ended >= propCount) {
					end();
				}
			}
		};
		setTimeout(() => {
			if (ended < propCount) {
				end();
			}
		}, timeout + 1);
		el.addEventListener(event, onEnd);
	}

	const transformRE = /\b(transform|all)(,|$)/;

	function getTransitionInfo(el, expectedType) {
		const styles = window.getComputedStyle(el);
		const transitionDelays = styles[transitionProp + 'Delay'].split(', ');
		const transitionDurations = styles[transitionProp + 'Duration'].split(', ');
		const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
		const animationDelays = styles[animationProp + 'Delay'].split(', ');
		const animationDurations = styles[animationProp + 'Duration'].split(', ');
		const animationTimeout = getTimeout(animationDelays, animationDurations);

		let type;
		let timeout = 0;
		let propCount = 0;
  /* istanbul ignore if */
		if (expectedType === TRANSITION) {
			if (transitionTimeout > 0) {
				type = TRANSITION;
				timeout = transitionTimeout;
				propCount = transitionDurations.length;
			}
		} else if (expectedType === ANIMATION) {
			if (animationTimeout > 0) {
				type = ANIMATION;
				timeout = animationTimeout;
				propCount = animationDurations.length;
			}
		} else {
			timeout = Math.max(transitionTimeout, animationTimeout);
			type = timeout > 0 ?
      transitionTimeout > animationTimeout ?
        TRANSITION :
        ANIMATION :
      null;
			propCount = type ?
      type === TRANSITION ?
        transitionDurations.length :
        animationDurations.length :
      0;
		}
		const hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
		return {
			type,
			timeout,
			propCount,
			hasTransform
		};
	}

	function getTimeout(delays, durations) {
  /* istanbul ignore next */
		while (delays.length < durations.length) {
			delays = delays.concat(delays);
		}

		return Math.max.apply(null, durations.map((d, i) => {
			return toMs(d) + toMs(delays[i]);
		}));
	}

	function toMs(s) {
		return Number(s.slice(0, -1)) * 1000;
	}

/*  */

	function enter(vnode, toggleDisplay) {
		const el = vnode.elm;

  // Call leave callback now
		if (el._leaveCb) {
			el._leaveCb.cancelled = true;
			el._leaveCb();
		}

		const data = resolveTransition(vnode.data.transition);
		if (!data) {
			return;
		}

  /* istanbul ignore if */
		if (el._enterCb || el.nodeType !== 1) {
			return;
		}

		const css = data.css;
		const type = data.type;
		const enterClass = data.enterClass;
		const enterToClass = data.enterToClass;
		const enterActiveClass = data.enterActiveClass;
		const appearClass = data.appearClass;
		const appearToClass = data.appearToClass;
		const appearActiveClass = data.appearActiveClass;
		const beforeEnter = data.beforeEnter;
		const enter = data.enter;
		const afterEnter = data.afterEnter;
		const enterCancelled = data.enterCancelled;
		const beforeAppear = data.beforeAppear;
		const appear = data.appear;
		const afterAppear = data.afterAppear;
		const appearCancelled = data.appearCancelled;
		const duration = data.duration;

  // ActiveInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
		let context = activeInstance;
		let transitionNode = activeInstance.$vnode;
		while (transitionNode && transitionNode.parent) {
			transitionNode = transitionNode.parent;
			context = transitionNode.context;
		}

		const isAppear = !context._isMounted || !vnode.isRootInsert;

		if (isAppear && !appear && appear !== '') {
			return;
		}

		const startClass = isAppear && appearClass ?
    appearClass :
    enterClass;
		const activeClass = isAppear && appearActiveClass ?
    appearActiveClass :
    enterActiveClass;
		const toClass = isAppear && appearToClass ?
    appearToClass :
    enterToClass;

		const beforeEnterHook = isAppear ?
    (beforeAppear || beforeEnter) :
    beforeEnter;
		const enterHook = isAppear ?
    (typeof appear === 'function' ? appear : enter) :
    enter;
		const afterEnterHook = isAppear ?
    (afterAppear || afterEnter) :
    afterEnter;
		const enterCancelledHook = isAppear ?
    (appearCancelled || enterCancelled) :
    enterCancelled;

		const explicitEnterDuration = toNumber(
    isObject(duration) ?
      duration.enter :
      duration
  );

		if ('development' !== 'production' && explicitEnterDuration != null) {
			checkDuration(explicitEnterDuration, 'enter', vnode);
		}

		const expectsCSS = css !== false && !isIE9;
		const userWantsControl = getHookArgumentsLength(enterHook);

		var cb = el._enterCb = once(() => {
			if (expectsCSS) {
				removeTransitionClass(el, toClass);
				removeTransitionClass(el, activeClass);
			}
			if (cb.cancelled) {
				if (expectsCSS) {
					removeTransitionClass(el, startClass);
				}
				enterCancelledHook && enterCancelledHook(el);
			} else {
				afterEnterHook && afterEnterHook(el);
			}
			el._enterCb = null;
		});

		if (!vnode.data.show) {
    // Remove pending leave element on enter by injecting an insert hook
			mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', () => {
				const parent = el.parentNode;
				const pendingNode = parent && parent._pending && parent._pending[vnode.key];
				if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb) {
					pendingNode.elm._leaveCb();
				}
				enterHook && enterHook(el, cb);
			});
		}

  // Start enter transition
		beforeEnterHook && beforeEnterHook(el);
		if (expectsCSS) {
			addTransitionClass(el, startClass);
			addTransitionClass(el, activeClass);
			nextFrame(() => {
				addTransitionClass(el, toClass);
				removeTransitionClass(el, startClass);
				if (!cb.cancelled && !userWantsControl) {
					if (isValidDuration(explicitEnterDuration)) {
						setTimeout(cb, explicitEnterDuration);
					} else {
						whenTransitionEnds(el, type, cb);
					}
				}
			});
		}

		if (vnode.data.show) {
			toggleDisplay && toggleDisplay();
			enterHook && enterHook(el, cb);
		}

		if (!expectsCSS && !userWantsControl) {
			cb();
		}
	}

	function leave(vnode, rm) {
		const el = vnode.elm;

  // Call enter callback now
		if (el._enterCb) {
			el._enterCb.cancelled = true;
			el._enterCb();
		}

		const data = resolveTransition(vnode.data.transition);
		if (!data) {
			return rm();
		}

  /* istanbul ignore if */
		if (el._leaveCb || el.nodeType !== 1) {
			return;
		}

		const css = data.css;
		const type = data.type;
		const leaveClass = data.leaveClass;
		const leaveToClass = data.leaveToClass;
		const leaveActiveClass = data.leaveActiveClass;
		const beforeLeave = data.beforeLeave;
		const leave = data.leave;
		const afterLeave = data.afterLeave;
		const leaveCancelled = data.leaveCancelled;
		const delayLeave = data.delayLeave;
		const duration = data.duration;

		const expectsCSS = css !== false && !isIE9;
		const userWantsControl = getHookArgumentsLength(leave);

		const explicitLeaveDuration = toNumber(
    isObject(duration) ?
      duration.leave :
      duration
  );

		if ('development' !== 'production' && explicitLeaveDuration != null) {
			checkDuration(explicitLeaveDuration, 'leave', vnode);
		}

		var cb = el._leaveCb = once(() => {
			if (el.parentNode && el.parentNode._pending) {
				el.parentNode._pending[vnode.key] = null;
			}
			if (expectsCSS) {
				removeTransitionClass(el, leaveToClass);
				removeTransitionClass(el, leaveActiveClass);
			}
			if (cb.cancelled) {
				if (expectsCSS) {
					removeTransitionClass(el, leaveClass);
				}
				leaveCancelled && leaveCancelled(el);
			} else {
				rm();
				afterLeave && afterLeave(el);
			}
			el._leaveCb = null;
		});

		if (delayLeave) {
			delayLeave(performLeave);
		} else {
			performLeave();
		}

		function performLeave() {
    // The delayed leave may have already been cancelled
			if (cb.cancelled) {
				return;
			}
    // Record leaving element
			if (!vnode.data.show) {
				(el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
			}
			beforeLeave && beforeLeave(el);
			if (expectsCSS) {
				addTransitionClass(el, leaveClass);
				addTransitionClass(el, leaveActiveClass);
				nextFrame(() => {
					addTransitionClass(el, leaveToClass);
					removeTransitionClass(el, leaveClass);
					if (!cb.cancelled && !userWantsControl) {
						if (isValidDuration(explicitLeaveDuration)) {
							setTimeout(cb, explicitLeaveDuration);
						} else {
							whenTransitionEnds(el, type, cb);
						}
					}
				});
			}
			leave && leave(el, cb);
			if (!expectsCSS && !userWantsControl) {
				cb();
			}
		}
	}

// Only used in dev mode
	function checkDuration(val, name, vnode) {
		if (typeof val !== 'number') {
			warn(
      '<transition> explicit ' + name + ' duration is not a valid number - ' +
      'got ' + (JSON.stringify(val)) + '.',
      vnode.context
    );
		} else if (isNaN(val)) {
			warn(
      '<transition> explicit ' + name + ' duration is NaN - ' +
      'the duration expression might be incorrect.',
      vnode.context
    );
		}
	}

	function isValidDuration(val) {
		return typeof val === 'number' && !isNaN(val);
	}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
	function getHookArgumentsLength(fn) {
		if (!fn) {
			return false;
		}
		const invokerFns = fn.fns;
		if (invokerFns) {
    // Invoker
			return getHookArgumentsLength(
      Array.isArray(invokerFns) ?
        invokerFns[0] :
        invokerFns
    );
		}
		return (fn._length || fn.length) > 1;
	}

	function _enter(_, vnode) {
		if (!vnode.data.show) {
			enter(vnode);
		}
	}

	const transition = inBrowser ? {
		create: _enter,
		activate: _enter,
		remove: function remove$$1(vnode, rm) {
    /* istanbul ignore else */
			if (!vnode.data.show) {
				leave(vnode, rm);
			} else {
				rm();
			}
		}
	} : {};

	const platformModules = [
		attrs,
		klass,
		events,
		domProps,
		style,
		transition
	];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
	const modules = platformModules.concat(baseModules);

	const patch = createPatchFunction({nodeOps, modules});

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
	if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
		document.addEventListener('selectionchange', () => {
			const el = document.activeElement;
			if (el && el.vmodel) {
				trigger(el, 'input');
			}
		});
	}

	const model$1 = {
		inserted: function inserted(el, binding, vnode) {
			if (vnode.tag === 'select') {
				const cb = function () {
					setSelected(el, binding, vnode.context);
				};
				cb();
      /* istanbul ignore if */
				if (isIE || isEdge) {
					setTimeout(cb, 0);
				}
			} else if (vnode.tag === 'textarea' || el.type === 'text') {
				el._vModifiers = binding.modifiers;
				if (!binding.modifiers.lazy) {
					if (!isAndroid) {
						el.addEventListener('compositionstart', onCompositionStart);
						el.addEventListener('compositionend', onCompositionEnd);
					}
        /* istanbul ignore if */
					if (isIE9) {
						el.vmodel = true;
					}
				}
			}
		},
		componentUpdated: function componentUpdated(el, binding, vnode) {
			if (vnode.tag === 'select') {
				setSelected(el, binding, vnode.context);
      // In case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
				const needReset = el.multiple ?
        binding.value.some(v => {
	return hasNoMatchingOption(v, el.options);
}) :
        binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
				if (needReset) {
					trigger(el, 'change');
				}
			}
		}
	};

	function setSelected(el, binding, vm) {
		const value = binding.value;
		const isMultiple = el.multiple;
		if (isMultiple && !Array.isArray(value)) {
			'development' !== 'production' && warn(
      '<select multiple v-model="' + (binding.expression) + '"> ' +
      'expects an Array value for its binding, but got ' + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
			return;
		}
		let selected, option;
		for (let i = 0, l = el.options.length; i < l; i++) {
			option = el.options[i];
			if (isMultiple) {
				selected = looseIndexOf(value, getValue(option)) > -1;
				if (option.selected !== selected) {
					option.selected = selected;
				}
			} else if (looseEqual(getValue(option), value)) {
				if (el.selectedIndex !== i) {
					el.selectedIndex = i;
				}
				return;
			}
		}
		if (!isMultiple) {
			el.selectedIndex = -1;
		}
	}

	function hasNoMatchingOption(value, options) {
		for (let i = 0, l = options.length; i < l; i++) {
			if (looseEqual(getValue(options[i]), value)) {
				return false;
			}
		}
		return true;
	}

	function getValue(option) {
		return '_value' in option ?
    option._value :
    option.value;
	}

	function onCompositionStart(e) {
		e.target.composing = true;
	}

	function onCompositionEnd(e) {
		e.target.composing = false;
		trigger(e.target, 'input');
	}

	function trigger(el, type) {
		const e = document.createEvent('HTMLEvents');
		e.initEvent(type, true, true);
		el.dispatchEvent(e);
	}

/*  */

// recursively search for possible transition defined inside the component root
	function locateNode(vnode) {
		return vnode.componentInstance && (!vnode.data || !vnode.data.transition) ?
    locateNode(vnode.componentInstance._vnode) :
    vnode;
	}

	const show = {
		bind: function bind(el, ref, vnode) {
			const value = ref.value;

			vnode = locateNode(vnode);
			const transition = vnode.data && vnode.data.transition;
			const originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
			if (value && transition && !isIE9) {
				vnode.data.show = true;
				enter(vnode, () => {
					el.style.display = originalDisplay;
				});
			} else {
				el.style.display = value ? originalDisplay : 'none';
			}
		},

		update: function update(el, ref, vnode) {
			const value = ref.value;
			const oldValue = ref.oldValue;

    /* istanbul ignore if */
			if (value === oldValue) {
				return;
			}
			vnode = locateNode(vnode);
			const transition = vnode.data && vnode.data.transition;
			if (transition && !isIE9) {
				vnode.data.show = true;
				if (value) {
					enter(vnode, () => {
						el.style.display = el.__vOriginalDisplay;
					});
				} else {
					leave(vnode, () => {
						el.style.display = 'none';
					});
				}
			} else {
				el.style.display = value ? el.__vOriginalDisplay : 'none';
			}
		},

		unbind: function unbind(
			el,
			binding,
			vnode,
			oldVnode,
			isDestroy
  ) {
			if (!isDestroy) {
				el.style.display = el.__vOriginalDisplay;
			}
		}
	};

	const platformDirectives = {
		model: model$1,
		show
	};

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

	const transitionProps = {
		name: String,
		appear: Boolean,
		css: Boolean,
		mode: String,
		type: String,
		enterClass: String,
		leaveClass: String,
		enterToClass: String,
		leaveToClass: String,
		enterActiveClass: String,
		leaveActiveClass: String,
		appearClass: String,
		appearActiveClass: String,
		appearToClass: String,
		duration: [Number, String, Object]
	};

// In case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
	function getRealChild(vnode) {
		const compOptions = vnode && vnode.componentOptions;
		if (compOptions && compOptions.Ctor.options.abstract) {
			return getRealChild(getFirstComponentChild(compOptions.children));
		}
		return vnode;
	}

	function extractTransitionData(comp) {
		const data = {};
		const options = comp.$options;
  // Props
		for (const key in options.propsData) {
			data[key] = comp[key];
		}
  // Events.
  // extract listeners and pass them directly to the transition methods
		const listeners = options._parentListeners;
		for (const key$1 in listeners) {
			data[camelize(key$1)] = listeners[key$1];
		}
		return data;
	}

	function placeholder(h, rawChild) {
		return /\d-keep-alive$/.test(rawChild.tag) ?
    h('keep-alive') :
    null;
	}

	function hasParentTransition(vnode) {
		while ((vnode = vnode.parent)) {
			if (vnode.data.transition) {
				return true;
			}
		}
	}

	function isSameChild(child, oldChild) {
		return oldChild.key === child.key && oldChild.tag === child.tag;
	}

	const Transition = {
		name: 'transition',
		props: transitionProps,
		abstract: true,

		render: function render(h) {
			const this$1 = this;

			let children = this.$slots.default;
			if (!children) {
				return;
			}

    // Filter out text nodes (possible whitespaces)
			children = children.filter(c => {
				return c.tag;
			});
    /* istanbul ignore if */
			if (!children.length) {
				return;
			}

    // Warn multiple elements
			if ('development' !== 'production' && children.length > 1) {
				warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
			}

			const mode = this.mode;

    // Warn invalid mode
			if ('development' !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
				warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
			}

			const rawChild = children[0];

    // If this is a component root node and the component's
    // parent container node also has transition, skip.
			if (hasParentTransition(this.$vnode)) {
				return rawChild;
			}

    // Apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
			const child = getRealChild(rawChild);
    /* istanbul ignore if */
			if (!child) {
				return rawChild;
			}

			if (this._leaving) {
				return placeholder(h, rawChild);
			}

    // Ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
			const id = '__transition-' + (this._uid) + '-';
			child.key = child.key == null ?
      id + child.tag :
      isPrimitive(child.key) ?
        (String(child.key).indexOf(id) === 0 ? child.key : id + child.key) :
        child.key;

			const data = (child.data || (child.data = {})).transition = extractTransitionData(this);
			const oldRawChild = this._vnode;
			const oldChild = getRealChild(oldRawChild);

    // Mark v-show
    // so that the transition module can hand over the control to the directive
			if (child.data.directives && child.data.directives.some(d => {
				return d.name === 'show';
			})) {
				child.data.show = true;
			}

			if (oldChild && oldChild.data && !isSameChild(child, oldChild)) {
      // Replace old child transition data with fresh one
      // important for dynamic transitions!
				const oldData = oldChild && (oldChild.data.transition = extend({}, data));
      // Handle transition mode
				if (mode === 'out-in') {
        // Return placeholder node and queue update when leave finishes
					this._leaving = true;
					mergeVNodeHook(oldData, 'afterLeave', () => {
						this$1._leaving = false;
						this$1.$forceUpdate();
					});
					return placeholder(h, rawChild);
				} else if (mode === 'in-out') {
					let delayedLeave;
					const performLeave = function () {
						delayedLeave();
					};
					mergeVNodeHook(data, 'afterEnter', performLeave);
					mergeVNodeHook(data, 'enterCancelled', performLeave);
					mergeVNodeHook(oldData, 'delayLeave', leave => {
						delayedLeave = leave;
					});
				}
			}

			return rawChild;
		}
	};

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final desired state. This way in the second pass removed
// nodes will remain where they should be.

	const props = extend({
		tag: String,
		moveClass: String
	}, transitionProps);

	delete props.mode;

	const TransitionGroup = {
		props,

		render: function render(h) {
			const tag = this.tag || this.$vnode.data.tag || 'span';
			const map = Object.create(null);
			const prevChildren = this.prevChildren = this.children;
			const rawChildren = this.$slots.default || [];
			const children = this.children = [];
			const transitionData = extractTransitionData(this);

			for (let i = 0; i < rawChildren.length; i++) {
				const c = rawChildren[i];
				if (c.tag) {
					if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
						children.push(c);
						map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
					} else {
						const opts = c.componentOptions;
						const name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
						warn(('<transition-group> children must be keyed: <' + name + '>'));
					}
				}
			}

			if (prevChildren) {
				const kept = [];
				const removed = [];
				for (let i$1 = 0; i$1 < prevChildren.length; i$1++) {
					const c$1 = prevChildren[i$1];
					c$1.data.transition = transitionData;
					c$1.data.pos = c$1.elm.getBoundingClientRect();
					if (map[c$1.key]) {
						kept.push(c$1);
					} else {
						removed.push(c$1);
					}
				}
				this.kept = h(tag, null, kept);
				this.removed = removed;
			}

			return h(tag, null, children);
		},

		beforeUpdate: function beforeUpdate() {
    // Force removing pass
			this.__patch__(
      this._vnode,
      this.kept,
      false, // Hydrating
      true // RemoveOnly (!important, avoids unnecessary moves)
    );
			this._vnode = this.kept;
		},

		updated: function updated() {
			const children = this.prevChildren;
			const moveClass = this.moveClass || ((this.name || 'v') + '-move');
			if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
				return;
			}

    // We divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
			children.forEach(callPendingCbs);
			children.forEach(recordPosition);
			children.forEach(applyTranslation);

    // Force reflow to put everything in position
			const body = document.body;
    var f = body.offsetHeight; // eslint-disable-line

			children.forEach(c => {
				if (c.data.moved) {
					const el = c.elm;
					const s = el.style;
					addTransitionClass(el, moveClass);
					s.transform = s.WebkitTransform = s.transitionDuration = '';
					el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
						if (!e || /transform$/.test(e.propertyName)) {
							el.removeEventListener(transitionEndEvent, cb);
							el._moveCb = null;
							removeTransitionClass(el, moveClass);
						}
					});
				}
			});
		},

		methods: {
			hasMove: function hasMove(el, moveClass) {
      /* istanbul ignore if */
				if (!hasTransition) {
					return false;
				}
				if (this._hasMove != null) {
					return this._hasMove;
				}
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
				const clone = el.cloneNode();
				if (el._transitionClasses) {
					el._transitionClasses.forEach(cls => {
						removeClass(clone, cls);
					});
				}
				addClass(clone, moveClass);
				clone.style.display = 'none';
				this.$el.appendChild(clone);
				const info = getTransitionInfo(clone);
				this.$el.removeChild(clone);
				return (this._hasMove = info.hasTransform);
			}
		}
	};

	function callPendingCbs(c) {
  /* istanbul ignore if */
		if (c.elm._moveCb) {
			c.elm._moveCb();
		}
  /* istanbul ignore if */
		if (c.elm._enterCb) {
			c.elm._enterCb();
		}
	}

	function recordPosition(c) {
		c.data.newPos = c.elm.getBoundingClientRect();
	}

	function applyTranslation(c) {
		const oldPos = c.data.pos;
		const newPos = c.data.newPos;
		const dx = oldPos.left - newPos.left;
		const dy = oldPos.top - newPos.top;
		if (dx || dy) {
			c.data.moved = true;
			const s = c.elm.style;
			s.transform = s.WebkitTransform = 'translate(' + dx + 'px,' + dy + 'px)';
			s.transitionDuration = '0s';
		}
	}

	const platformComponents = {
		Transition,
		TransitionGroup
	};

/*  */

// install platform specific utils
	Vue$3.config.mustUseProp = mustUseProp;
	Vue$3.config.isReservedTag = isReservedTag;
	Vue$3.config.getTagNamespace = getTagNamespace;
	Vue$3.config.isUnknownElement = isUnknownElement;

// Install platform runtime directives & components
	extend(Vue$3.options.directives, platformDirectives);
	extend(Vue$3.options.components, platformComponents);

// Install platform patch function
	Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

// Public mount method
	Vue$3.prototype.$mount = function (
		el,
		hydrating
) {
		el = el && inBrowser ? query(el) : undefined;
		return mountComponent(this, el, hydrating);
	};

// Devtools global hook
/* istanbul ignore next */
	setTimeout(() => {
		if (config.devtools) {
			if (devtools) {
				devtools.emit('init', Vue$3);
			} else if ('development' !== 'production' && isChrome) {
				console[console.info ? 'info' : 'log'](
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      );
			}
		}
		if ('development' !== 'production' &&
      config.productionTip !== false &&
      inBrowser && typeof console !== 'undefined') {
			console[console.info ? 'info' : 'log'](
      'You are running Vue in development mode.\n' +
      'Make sure to turn on production mode when deploying for production.\n' +
      'See more tips at https://vuejs.org/guide/deployment.html'
    );
		}
	}, 0);

/*  */

// check whether current browser encodes a char inside attribute values
	function shouldDecode(content, encoded) {
		const div = document.createElement('div');
		div.innerHTML = '<div a="' + content + '">';
		return div.innerHTML.indexOf(encoded) > 0;
	}

// #3663
// IE encodes newlines inside attribute values while other browsers don't
	const shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

/*  */

	const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
	const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
	const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/*  */

	let decoder;

	function decode(html) {
		decoder = decoder || document.createElement('div');
		decoder.innerHTML = html;
		return decoder.textContent;
	}

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
	const singleAttrIdentifier = /([^\s"'<>/=]+)/;
	const singleAttrAssign = /(?:=)/;
	const singleAttrValues = [
  // Attr value double quotes
		/"([^"]*)"+/.source,
  // Attr value, single quotes
		/'([^']*)'+/.source,
  // Attr value, no quotes
		/([^\s"'=<>`]+)/.source
	];
	const attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
);

// Could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
	const ncname = '[a-zA-Z_][\\w\\-\\.]*';
	const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
	const startTagOpen = new RegExp('^<' + qnameCapture);
	const startTagClose = /^\s*(\/?)>/;
	const endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
	const doctype = /^<!DOCTYPE [^>]+>/i;
	const comment = /^<!--/;
	const conditionalComment = /^<!\[/;

	let IS_REGEX_CAPTURING_BROKEN = false;
	'x'.replace(/x(.)?/g, (m, g) => {
		IS_REGEX_CAPTURING_BROKEN = g === '';
	});

// Special Elements (can contain anything)
	const isScriptOrStyle = makeMap('script,style', true);
	const reCache = {};

	const decodingMap = {
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&amp;': '&',
		'&#10;': '\n'
	};
	const encodedAttr = /&(?:lt|gt|quot|amp);/g;
	const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

	function decodeAttr(value, shouldDecodeNewlines) {
		const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
		return value.replace(re, match => {
			return decodingMap[match];
		});
	}

	function parseHTML(html, options) {
		const stack = [];
		const expectHTML = options.expectHTML;
		const isUnaryTag$$1 = options.isUnaryTag || no;
		let index = 0;
		let last, lastTag;
		while (html) {
			last = html;
    // Make sure we're not in a script or style element
			if (!lastTag || !isScriptOrStyle(lastTag)) {
				let textEnd = html.indexOf('<');
				if (textEnd === 0) {
        // Comment:
					if (comment.test(html)) {
						const commentEnd = html.indexOf('-->');

						if (commentEnd >= 0) {
							advance(commentEnd + 3);
							continue;
						}
					}

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
					if (conditionalComment.test(html)) {
						const conditionalEnd = html.indexOf(']>');

						if (conditionalEnd >= 0) {
							advance(conditionalEnd + 2);
							continue;
						}
					}

        // Doctype:
					const doctypeMatch = html.match(doctype);
					if (doctypeMatch) {
						advance(doctypeMatch[0].length);
						continue;
					}

        // End tag:
					const endTagMatch = html.match(endTag);
					if (endTagMatch) {
						const curIndex = index;
						advance(endTagMatch[0].length);
						parseEndTag(endTagMatch[1], curIndex, index);
						continue;
					}

        // Start tag:
					const startTagMatch = parseStartTag();
					if (startTagMatch) {
						handleStartTag(startTagMatch);
						continue;
					}
				}

				let text = (void 0),
					rest$1 = (void 0),
					next = (void 0);
				if (textEnd >= 0) {
					rest$1 = html.slice(textEnd);
					while (
          !endTag.test(rest$1) &&
          !startTagOpen.test(rest$1) &&
          !comment.test(rest$1) &&
          !conditionalComment.test(rest$1)
        ) {
          // < in plain text, be forgiving and treat it as text
						next = rest$1.indexOf('<', 1);
						if (next < 0) {
							break;
						}
						textEnd += next;
						rest$1 = html.slice(textEnd);
					}
					text = html.substring(0, textEnd);
					advance(textEnd);
				}

				if (textEnd < 0) {
					text = html;
					html = '';
				}

				if (options.chars && text) {
					options.chars(text);
				}
			} else {
				var stackedTag = lastTag.toLowerCase();
				const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
				var endTagLength = 0;
				const rest = html.replace(reStackedTag, (all, text, endTag) => {
					endTagLength = endTag.length;
					if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
						text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
					}
					if (options.chars) {
						options.chars(text);
					}
					return '';
				});
				index += html.length - rest.length;
				html = rest;
				parseEndTag(stackedTag, index - endTagLength, index);
			}

			if (html === last) {
				options.chars && options.chars(html);
				if ('development' !== 'production' && !stack.length && options.warn) {
					options.warn(('Mal-formatted tag at end of template: "' + html + '"'));
				}
				break;
			}
		}

  // Clean up any remaining tags
		parseEndTag();

		function advance(n) {
			index += n;
			html = html.substring(n);
		}

		function parseStartTag() {
			const start = html.match(startTagOpen);
			if (start) {
				const match = {
					tagName: start[1],
					attrs: [],
					start: index
				};
				advance(start[0].length);
				let end, attr;
				while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
					advance(attr[0].length);
					match.attrs.push(attr);
				}
				if (end) {
					match.unarySlash = end[1];
					advance(end[0].length);
					match.end = index;
					return match;
				}
			}
		}

		function handleStartTag(match) {
			const tagName = match.tagName;
			const unarySlash = match.unarySlash;

			if (expectHTML) {
				if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
					parseEndTag(lastTag);
				}
				if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
					parseEndTag(tagName);
				}
			}

			const unary = isUnaryTag$$1(tagName) || tagName === 'html' && lastTag === 'head' || Boolean(unarySlash);

			const l = match.attrs.length;
			const attrs = new Array(l);
			for (let i = 0; i < l; i++) {
				const args = match.attrs[i];
      // Hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
				if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
					if (args[3] === '') {
						delete args[3];
					}
					if (args[4] === '') {
						delete args[4];
					}
					if (args[5] === '') {
						delete args[5];
					}
				}
				const value = args[3] || args[4] || args[5] || '';
				attrs[i] = {
					name: args[1],
					value: decodeAttr(
          value,
          options.shouldDecodeNewlines
        )
				};
			}

			if (!unary) {
				stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs});
				lastTag = tagName;
			}

			if (options.start) {
				options.start(tagName, attrs, unary, match.start, match.end);
			}
		}

		function parseEndTag(tagName, start, end) {
			let pos, lowerCasedTagName;
			if (start == null) {
				start = index;
			}
			if (end == null) {
				end = index;
			}

			if (tagName) {
				lowerCasedTagName = tagName.toLowerCase();
			}

    // Find the closest opened tag of the same type
			if (tagName) {
				for (pos = stack.length - 1; pos >= 0; pos--) {
					if (stack[pos].lowerCasedTag === lowerCasedTagName) {
						break;
					}
				}
			} else {
      // If no tag name is provided, clean shop
				pos = 0;
			}

			if (pos >= 0) {
      // Close all the open elements, up the stack
				for (let i = stack.length - 1; i >= pos; i--) {
					if ('development' !== 'production' &&
            (i > pos || !tagName) &&
            options.warn) {
						options.warn(
            ('tag <' + (stack[i].tag) + '> has no matching end tag.')
          );
					}
					if (options.end) {
						options.end(stack[i].tag, start, end);
					}
				}

      // Remove the open elements from the stack
				stack.length = pos;
				lastTag = pos && stack[pos - 1].tag;
			} else if (lowerCasedTagName === 'br') {
				if (options.start) {
					options.start(tagName, [], true, start, end);
				}
			} else if (lowerCasedTagName === 'p') {
				if (options.start) {
					options.start(tagName, [], false, start, end);
				}
				if (options.end) {
					options.end(tagName, start, end);
				}
			}
		}
	}

/*  */

	const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
	const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

	const buildRegex = cached(delimiters => {
		const open = delimiters[0].replace(regexEscapeRE, '\\$&');
		const close = delimiters[1].replace(regexEscapeRE, '\\$&');
		return new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
	});

	function parseText(
		text,
		delimiters
) {
		const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
		if (!tagRE.test(text)) {
			return;
		}
		const tokens = [];
		let lastIndex = tagRE.lastIndex = 0;
		let match, index;
		while ((match = tagRE.exec(text))) {
			index = match.index;
    // Push text token
			if (index > lastIndex) {
				tokens.push(JSON.stringify(text.slice(lastIndex, index)));
			}
    // Tag token
			const exp = parseFilters(match[1].trim());
			tokens.push(('_s(' + exp + ')'));
			lastIndex = index + match[0].length;
		}
		if (lastIndex < text.length) {
			tokens.push(JSON.stringify(text.slice(lastIndex)));
		}
		return tokens.join('+');
	}

/*  */

	const dirRE = /^v-|^@|^:/;
	const onRE = /^@|^v-on:/;
	const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
	const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;
	const bindRE = /^:|^v-bind:/;
	const argRE = /:(.*)$/;
	const modifierRE = /\.[^.]+/g;

	const decodeHTMLCached = cached(decode);

// Configurable state
	let warn$2;
	let platformGetTagNamespace;
	let platformMustUseProp;
	let platformIsPreTag;
	let preTransforms;
	let transforms;
	let postTransforms;
	let delimiters;

/**
 * Convert HTML string to AST.
 */
	function parse(
		template,
		options
) {
		warn$2 = options.warn || baseWarn;
		platformGetTagNamespace = options.getTagNamespace || no;
		platformMustUseProp = options.mustUseProp || no;
		platformIsPreTag = options.isPreTag || no;
		preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
		transforms = pluckModuleFunction(options.modules, 'transformNode');
		postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
		delimiters = options.delimiters;

		const stack = [];
		const preserveWhitespace = options.preserveWhitespace !== false;
		let root;
		let currentParent;
		let inVPre = false;
		let inPre = false;
		let warned = false;

		function endPre(element) {
    // Check pre state
			if (element.pre) {
				inVPre = false;
			}
			if (platformIsPreTag(element.tag)) {
				inPre = false;
			}
		}

		parseHTML(template, {
			warn: warn$2,
			expectHTML: options.expectHTML,
			isUnaryTag: options.isUnaryTag,
			shouldDecodeNewlines: options.shouldDecodeNewlines,
			start: function start(tag, attrs, unary) {
      // Check namespace.
      // inherit parent ns if there is one
				const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // Handle IE svg bug
      /* istanbul ignore if */
				if (isIE && ns === 'svg') {
					attrs = guardIESVGBug(attrs);
				}

				const element = {
					type: 1,
					tag,
					attrsList: attrs,
					attrsMap: makeAttrsMap(attrs),
					parent: currentParent,
					children: []
				};
				if (ns) {
					element.ns = ns;
				}

				if (isForbiddenTag(element) && !isServerRendering()) {
					element.forbidden = true;
					'development' !== 'production' && warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          '<' + tag + '>' + ', as they will not be parsed.'
        );
				}

      // Apply pre-transforms
				for (let i = 0; i < preTransforms.length; i++) {
					preTransforms[i](element, options);
				}

				if (!inVPre) {
					processPre(element);
					if (element.pre) {
						inVPre = true;
					}
				}
				if (platformIsPreTag(element.tag)) {
					inPre = true;
				}
				if (inVPre) {
					processRawAttrs(element);
				} else {
					processFor(element);
					processIf(element);
					processOnce(element);
					processKey(element);

        // Determine whether this is a plain element after
        // removing structural attributes
					element.plain = !element.key && !attrs.length;

					processRef(element);
					processSlot(element);
					processComponent(element);
					for (let i$1 = 0; i$1 < transforms.length; i$1++) {
						transforms[i$1](element, options);
					}
					processAttrs(element);
				}

				function checkRootConstraints(el) {
					if ('development' !== 'production' && !warned) {
						if (el.tag === 'slot' || el.tag === 'template') {
							warned = true;
							warn$2(
              'Cannot use <' + (el.tag) + '> as component root element because it may ' +
              'contain multiple nodes.'
            );
						}
						if (el.attrsMap.hasOwnProperty('v-for')) {
							warned = true;
							warn$2(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements.'
            );
						}
					}
				}

      // Tree management
				if (!root) {
					root = element;
					checkRootConstraints(root);
				} else if (!stack.length) {
        // Allow root elements with v-if, v-else-if and v-else
					if (root.if && (element.elseif || element.else)) {
						checkRootConstraints(element);
						addIfCondition(root, {
							exp: element.elseif,
							block: element
						});
					} else if ('development' !== 'production' && !warned) {
						warned = true;
						warn$2(
            'Component template should contain exactly one root element. ' +
            'If you are using v-if on multiple elements, ' +
            'use v-else-if to chain them instead.'
          );
					}
				}
				if (currentParent && !element.forbidden) {
					if (element.elseif || element.else) {
						processIfConditions(element, currentParent);
					} else if (element.slotScope) { // Scoped slot
						currentParent.plain = false;
						const name = element.slotTarget || '"default"'; (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
					} else {
						currentParent.children.push(element);
						element.parent = currentParent;
					}
				}
				if (!unary) {
					currentParent = element;
					stack.push(element);
				} else {
					endPre(element);
				}
      // Apply post-transforms
				for (let i$2 = 0; i$2 < postTransforms.length; i$2++) {
					postTransforms[i$2](element, options);
				}
			},

			end: function end() {
      // Remove trailing whitespace
				const element = stack[stack.length - 1];
				const lastNode = element.children[element.children.length - 1];
				if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
					element.children.pop();
				}
      // Pop stack
				stack.length -= 1;
				currentParent = stack[stack.length - 1];
				endPre(element);
			},

			chars: function chars(text) {
				if (!currentParent) {
					if ('development' !== 'production' && !warned && text === template) {
						warned = true;
						warn$2(
            'Component template requires a root element, rather than just text.'
          );
					}
					return;
				}
      // IE textarea placeholder bug
      /* istanbul ignore if */
				if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text) {
					return;
				}
				const children = currentParent.children;
				text = inPre || text.trim() ?
        decodeHTMLCached(text) :
        // Only preserve whitespace if its not right after a starting tag
        preserveWhitespace && children.length ? ' ' : '';
				if (text) {
					let expression;
					if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
						children.push({
							type: 2,
							expression,
							text
						});
					} else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
						children.push({
							type: 3,
							text
						});
					}
				}
			}
		});
		return root;
	}

	function processPre(el) {
		if (getAndRemoveAttr(el, 'v-pre') != null) {
			el.pre = true;
		}
	}

	function processRawAttrs(el) {
		const l = el.attrsList.length;
		if (l) {
			const attrs = el.attrs = new Array(l);
			for (let i = 0; i < l; i++) {
				attrs[i] = {
					name: el.attrsList[i].name,
					value: JSON.stringify(el.attrsList[i].value)
				};
			}
		} else if (!el.pre) {
    // Non root node in pre blocks with no attributes
			el.plain = true;
		}
	}

	function processKey(el) {
		const exp = getBindingAttr(el, 'key');
		if (exp) {
			if ('development' !== 'production' && el.tag === 'template') {
				warn$2('<template> cannot be keyed. Place the key on real elements instead.');
			}
			el.key = exp;
		}
	}

	function processRef(el) {
		const ref = getBindingAttr(el, 'ref');
		if (ref) {
			el.ref = ref;
			el.refInFor = checkInFor(el);
		}
	}

	function processFor(el) {
		let exp;
		if ((exp = getAndRemoveAttr(el, 'v-for'))) {
			const inMatch = exp.match(forAliasRE);
			if (!inMatch) {
				'development' !== 'production' && warn$2(
        ('Invalid v-for expression: ' + exp)
      );
				return;
			}
			el.for = inMatch[2].trim();
			const alias = inMatch[1].trim();
			const iteratorMatch = alias.match(forIteratorRE);
			if (iteratorMatch) {
				el.alias = iteratorMatch[1].trim();
				el.iterator1 = iteratorMatch[2].trim();
				if (iteratorMatch[3]) {
					el.iterator2 = iteratorMatch[3].trim();
				}
			} else {
				el.alias = alias;
			}
		}
	}

	function processIf(el) {
		const exp = getAndRemoveAttr(el, 'v-if');
		if (exp) {
			el.if = exp;
			addIfCondition(el, {
				exp,
				block: el
			});
		} else {
			if (getAndRemoveAttr(el, 'v-else') != null) {
				el.else = true;
			}
			const elseif = getAndRemoveAttr(el, 'v-else-if');
			if (elseif) {
				el.elseif = elseif;
			}
		}
	}

	function processIfConditions(el, parent) {
		const prev = findPrevElement(parent.children);
		if (prev && prev.if) {
			addIfCondition(prev, {
				exp: el.elseif,
				block: el
			});
		} else {
			warn$2(
      'v-' + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + ' ' +
      'used on element <' + (el.tag) + '> without corresponding v-if.'
    );
		}
	}

	function findPrevElement(children) {
		let i = children.length;
		while (i--) {
			if (children[i].type === 1) {
				return children[i];
			}
			if ('development' !== 'production' && children[i].text !== ' ') {
				warn$2(
          'text "' + (children[i].text.trim()) + '" between v-if and v-else(-if) ' +
          'will be ignored.'
        );
			}
			children.pop();
		}
	}

	function addIfCondition(el, condition) {
		if (!el.ifConditions) {
			el.ifConditions = [];
		}
		el.ifConditions.push(condition);
	}

	function processOnce(el) {
		const once$$1 = getAndRemoveAttr(el, 'v-once');
		if (once$$1 != null) {
			el.once = true;
		}
	}

	function processSlot(el) {
		if (el.tag === 'slot') {
			el.slotName = getBindingAttr(el, 'name');
			if ('development' !== 'production' && el.key) {
				warn$2(
        '`key` does not work on <slot> because slots are abstract outlets ' +
        'and can possibly expand into multiple elements. ' +
        'Use the key on a wrapping element instead.'
      );
			}
		} else {
			const slotTarget = getBindingAttr(el, 'slot');
			if (slotTarget) {
				el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
			}
			if (el.tag === 'template') {
				el.slotScope = getAndRemoveAttr(el, 'scope');
			}
		}
	}

	function processComponent(el) {
		let binding;
		if ((binding = getBindingAttr(el, 'is'))) {
			el.component = binding;
		}
		if (getAndRemoveAttr(el, 'inline-template') != null) {
			el.inlineTemplate = true;
		}
	}

	function processAttrs(el) {
		const list = el.attrsList;
		let i, l, name, rawName, value, arg, modifiers, isProp;
		for (i = 0, l = list.length; i < l; i++) {
			name = rawName = list[i].name;
			value = list[i].value;
			if (dirRE.test(name)) {
      // Mark element as dynamic
				el.hasBindings = true;
      // Modifiers
				modifiers = parseModifiers(name);
				if (modifiers) {
					name = name.replace(modifierRE, '');
				}
				if (bindRE.test(name)) { // V-bind
					name = name.replace(bindRE, '');
					value = parseFilters(value);
					isProp = false;
					if (modifiers) {
						if (modifiers.prop) {
							isProp = true;
							name = camelize(name);
							if (name === 'innerHtml') {
								name = 'innerHTML';
							}
						}
						if (modifiers.camel) {
							name = camelize(name);
						}
					}
					if (isProp || platformMustUseProp(el.tag, el.attrsMap.type, name)) {
						addProp(el, name, value);
					} else {
						addAttr(el, name, value);
					}
				} else if (onRE.test(name)) { // V-on
					name = name.replace(onRE, '');
					addHandler(el, name, value, modifiers);
				} else { // Normal directives
					name = name.replace(dirRE, '');
        // Parse arg
					const argMatch = name.match(argRE);
					if (argMatch && (arg = argMatch[1])) {
						name = name.slice(0, -(arg.length + 1));
					}
					addDirective(el, name, rawName, value, arg, modifiers);
					if ('development' !== 'production' && name === 'model') {
						checkForAliasModel(el, value);
					}
				}
			} else {
      // Literal attribute
				{
					const expression = parseText(value, delimiters);
					if (expression) {
						warn$2(
            name + '="' + value + '": ' +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          );
					}
				}
				addAttr(el, name, JSON.stringify(value));
			}
		}
	}

	function checkInFor(el) {
		let parent = el;
		while (parent) {
			if (parent.for !== undefined) {
				return true;
			}
			parent = parent.parent;
		}
		return false;
	}

	function parseModifiers(name) {
		const match = name.match(modifierRE);
		if (match) {
			const ret = {};
			match.forEach(m => {
				ret[m.slice(1)] = true;
			});
			return ret;
		}
	}

	function makeAttrsMap(attrs) {
		const map = {};
		for (let i = 0, l = attrs.length; i < l; i++) {
			if ('development' !== 'production' && map[attrs[i].name] && !isIE) {
				warn$2('duplicate attribute: ' + attrs[i].name);
			}
			map[attrs[i].name] = attrs[i].value;
		}
		return map;
	}

	function isForbiddenTag(el) {
		return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
		);
	}

	const ieNSBug = /^xmlns:NS\d+/;
	const ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
	function guardIESVGBug(attrs) {
		const res = [];
		for (let i = 0; i < attrs.length; i++) {
			const attr = attrs[i];
			if (!ieNSBug.test(attr.name)) {
				attr.name = attr.name.replace(ieNSPrefix, '');
				res.push(attr);
			}
		}
		return res;
	}

	function checkForAliasModel(el, value) {
		let _el = el;
		while (_el) {
			if (_el.for && _el.alias === value) {
				warn$2(
        '<' + (el.tag) + ' v-model="' + value + '">: ' +
        'You are binding v-model directly to a v-for iteration alias. ' +
        'This will not be able to modify the v-for source array because ' +
        'writing to the alias is like modifying a function local variable. ' +
        'Consider using an array of objects and use v-model on an object property instead.'
      );
			}
			_el = _el.parent;
		}
	}

/*  */

	let isStaticKey;
	let isPlatformReservedTag;

	const genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
	function optimize(root, options) {
		if (!root) {
			return;
		}
		isStaticKey = genStaticKeysCached(options.staticKeys || '');
		isPlatformReservedTag = options.isReservedTag || no;
  // First pass: mark all non-static nodes.
		markStatic$1(root);
  // Second pass: mark static roots.
		markStaticRoots(root, false);
	}

	function genStaticKeys$1(keys) {
		return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  );
	}

	function markStatic$1(node) {
		node.static = isStatic(node);
		if (node.type === 1) {
    // Do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
			if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
				return;
			}
			for (let i = 0, l = node.children.length; i < l; i++) {
				const child = node.children[i];
				markStatic$1(child);
				if (!child.static) {
					node.static = false;
				}
			}
		}
	}

	function markStaticRoots(node, isInFor) {
		if (node.type === 1) {
			if (node.static || node.once) {
				node.staticInFor = isInFor;
			}
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
			if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
				node.staticRoot = true;
				return;
			}
			node.staticRoot = false;

			if (node.children) {
				for (let i = 0, l = node.children.length; i < l; i++) {
					markStaticRoots(node.children[i], isInFor || Boolean(node.for));
				}
			}
			if (node.ifConditions) {
				walkThroughConditionsBlocks(node.ifConditions, isInFor);
			}
		}
	}

	function walkThroughConditionsBlocks(conditionBlocks, isInFor) {
		for (let i = 1, len = conditionBlocks.length; i < len; i++) {
			markStaticRoots(conditionBlocks[i].block, isInFor);
		}
	}

	function isStatic(node) {
		if (node.type === 2) { // Expression
			return false;
		}
		if (node.type === 3) { // Text
			return true;
		}
		return Boolean(node.pre || (
    !node.hasBindings && // No dynamic bindings
    !node.if && !node.for && // Not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // Not a built-in
    isPlatformReservedTag(node.tag) && // Not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ));
	}

	function isDirectChildOfTemplateFor(node) {
		while (node.parent) {
			node = node.parent;
			if (node.tag !== 'template') {
				return false;
			}
			if (node.for) {
				return true;
			}
		}
		return false;
	}

/*  */

	const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
	const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

// KeyCode aliases
	const keyCodes = {
		esc: 27,
		tab: 9,
		enter: 13,
		space: 32,
		up: 38,
		left: 37,
		right: 39,
		down: 40,
		delete: [8, 46]
	};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
	const genGuard = function (condition) {
		return ('if(' + condition + ')return null;');
	};

	const modifierCode = {
		stop: '$event.stopPropagation();',
		prevent: '$event.preventDefault();',
		self: genGuard('$event.target !== $event.currentTarget'),
		ctrl: genGuard('!$event.ctrlKey'),
		shift: genGuard('!$event.shiftKey'),
		alt: genGuard('!$event.altKey'),
		meta: genGuard('!$event.metaKey'),
		left: genGuard('\'button\' in $event && $event.button !== 0'),
		middle: genGuard('\'button\' in $event && $event.button !== 1'),
		right: genGuard('\'button\' in $event && $event.button !== 2')
	};

	function genHandlers(events, native) {
		let res = native ? 'nativeOn:{' : 'on:{';
		for (const name in events) {
			res += '"' + name + '":' + (genHandler(name, events[name])) + ',';
		}
		return res.slice(0, -1) + '}';
	}

	function genHandler(
		name,
		handler
) {
		if (!handler) {
			return 'function(){}';
		}

		if (Array.isArray(handler)) {
			return ('[' + (handler.map(handler => {
				return genHandler(name, handler);
			}).join(',')) + ']');
		}

		const isMethodPath = simplePathRE.test(handler.value);
		const isFunctionExpression = fnExpRE.test(handler.value);

		if (!handler.modifiers) {
			return isMethodPath || isFunctionExpression ?
      handler.value :
      ('function($event){' + (handler.value) + '}'); // Inline statement
		}
		let code = '';
		const keys = [];
		for (const key in handler.modifiers) {
			if (modifierCode[key]) {
				code += modifierCode[key];
        // Left/right
				if (keyCodes[key]) {
					keys.push(key);
				}
			} else {
				keys.push(key);
			}
		}
		if (keys.length) {
			code += genKeyFilter(keys);
		}
		const handlerCode = isMethodPath ?
      handler.value + '($event)' :
      isFunctionExpression ?
        ('(' + (handler.value) + ')($event)') :
        handler.value;
		return ('function($event){' + code + handlerCode + '}');
	}

	function genKeyFilter(keys) {
		return ('if(!(\'button\' in $event)&&' + (keys.map(genFilterCode).join('&&')) + ')return null;');
	}

	function genFilterCode(key) {
		const keyVal = parseInt(key, 10);
		if (keyVal) {
			return ('$event.keyCode!==' + keyVal);
		}
		const alias = keyCodes[key];
		return ('_k($event.keyCode,' + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ')');
	}

/*  */

	function bind$1(el, dir) {
		el.wrapData = function (code) {
			return ('_b(' + code + ',\'' + (el.tag) + '\',' + (dir.value) + (dir.modifiers && dir.modifiers.prop ? ',true' : '') + ')');
		};
	}

/*  */

	const baseDirectives = {
		bind: bind$1,
		cloak: noop
	};

/*  */

// configurable state
	let warn$3;
	let transforms$1;
	let dataGenFns;
	let platformDirectives$1;
	let isPlatformReservedTag$1;
	let staticRenderFns;
	let onceCount;
	let currentOptions;

	function generate(
		ast,
		options
) {
  // Save previous staticRenderFns so generate calls can be nested
		const prevStaticRenderFns = staticRenderFns;
		const currentStaticRenderFns = staticRenderFns = [];
		const prevOnceCount = onceCount;
		onceCount = 0;
		currentOptions = options;
		warn$3 = options.warn || baseWarn;
		transforms$1 = pluckModuleFunction(options.modules, 'transformCode');
		dataGenFns = pluckModuleFunction(options.modules, 'genData');
		platformDirectives$1 = options.directives || {};
		isPlatformReservedTag$1 = options.isReservedTag || no;
		const code = ast ? genElement(ast) : '_c("div")';
		staticRenderFns = prevStaticRenderFns;
		onceCount = prevOnceCount;
		return {
			render: ('with(this){return ' + code + '}'),
			staticRenderFns: currentStaticRenderFns
		};
	}

	function genElement(el) {
		if (el.staticRoot && !el.staticProcessed) {
			return genStatic(el);
		} else if (el.once && !el.onceProcessed) {
			return genOnce(el);
		} else if (el.for && !el.forProcessed) {
			return genFor(el);
		} else if (el.if && !el.ifProcessed) {
			return genIf(el);
		} else if (el.tag === 'template' && !el.slotTarget) {
			return genChildren(el) || 'void 0';
		} else if (el.tag === 'slot') {
			return genSlot(el);
		}
    // Component or element
		let code;
		if (el.component) {
			code = genComponent(el.component, el);
		} else {
			const data = el.plain ? undefined : genData(el);

			const children = el.inlineTemplate ? null : genChildren(el, true);
			code = '_c(\'' + (el.tag) + '\'' + (data ? (',' + data) : '') + (children ? (',' + children) : '') + ')';
		}
    // Module transforms
		for (let i = 0; i < transforms$1.length; i++) {
			code = transforms$1[i](el, code);
		}
		return code;
	}

// Hoist static sub-trees out
	function genStatic(el) {
		el.staticProcessed = true;
		staticRenderFns.push(('with(this){return ' + (genElement(el)) + '}'));
		return ('_m(' + (staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ')');
	}

// V-once
	function genOnce(el) {
		el.onceProcessed = true;
		if (el.if && !el.ifProcessed) {
			return genIf(el);
		} else if (el.staticInFor) {
			let key = '';
			let parent = el.parent;
			while (parent) {
				if (parent.for) {
					key = parent.key;
					break;
				}
				parent = parent.parent;
			}
			if (!key) {
				'development' !== 'production' && warn$3(
        'v-once can only be used inside v-for that is keyed. '
      );
				return genElement(el);
			}
			return ('_o(' + (genElement(el)) + ',' + (onceCount++) + (key ? (',' + key) : '') + ')');
		}
		return genStatic(el);
	}

	function genIf(el) {
		el.ifProcessed = true; // Avoid recursion
		return genIfConditions(el.ifConditions.slice());
	}

	function genIfConditions(conditions) {
		if (!conditions.length) {
			return '_e()';
		}

		const condition = conditions.shift();
		if (condition.exp) {
			return ('(' + (condition.exp) + ')?' + (genTernaryExp(condition.block)) + ':' + (genIfConditions(conditions)));
		}
		return (String(genTernaryExp(condition.block)));

  // V-if with v-once should generate code like (a)?_m(0):_m(1)
		function genTernaryExp(el) {
			return el.once ? genOnce(el) : genElement(el);
		}
	}

	function genFor(el) {
		const exp = el.for;
		const alias = el.alias;
		const iterator1 = el.iterator1 ? (',' + (el.iterator1)) : '';
		const iterator2 = el.iterator2 ? (',' + (el.iterator2)) : '';

		if (
    'development' !== 'production' &&
    maybeComponent(el) && el.tag !== 'slot' && el.tag !== 'template' && !el.key
  ) {
			warn$3(
      '<' + (el.tag) + ' v-for="' + alias + ' in ' + exp + '">: component lists rendered with ' +
      'v-for should have explicit keys. ' +
      'See https://vuejs.org/guide/list.html#key for more info.',
      true /* Tip */
    );
		}

		el.forProcessed = true; // Avoid recursion
		return '_l((' + exp + '),' +
    'function(' + alias + iterator1 + iterator2 + '){' +
      'return ' + (genElement(el)) +
    '})';
	}

	function genData(el) {
		let data = '{';

  // Directives first.
  // directives may mutate the el's other properties before they are generated.
		const dirs = genDirectives(el);
		if (dirs) {
			data += dirs + ',';
		}

  // Key
		if (el.key) {
			data += 'key:' + (el.key) + ',';
		}
  // Ref
		if (el.ref) {
			data += 'ref:' + (el.ref) + ',';
		}
		if (el.refInFor) {
			data += 'refInFor:true,';
		}
  // Pre
		if (el.pre) {
			data += 'pre:true,';
		}
  // Record original tag name for components using "is" attribute
		if (el.component) {
			data += 'tag:"' + (el.tag) + '",';
		}
  // Module data generation functions
		for (let i = 0; i < dataGenFns.length; i++) {
			data += dataGenFns[i](el);
		}
  // Attributes
		if (el.attrs) {
			data += 'attrs:{' + (genProps(el.attrs)) + '},';
		}
  // DOM props
		if (el.props) {
			data += 'domProps:{' + (genProps(el.props)) + '},';
		}
  // Event handlers
		if (el.events) {
			data += (genHandlers(el.events)) + ',';
		}
		if (el.nativeEvents) {
			data += (genHandlers(el.nativeEvents, true)) + ',';
		}
  // Slot target
		if (el.slotTarget) {
			data += 'slot:' + (el.slotTarget) + ',';
		}
  // Scoped slots
		if (el.scopedSlots) {
			data += (genScopedSlots(el.scopedSlots)) + ',';
		}
  // Component v-model
		if (el.model) {
			data += 'model:{value:' + (el.model.value) + ',callback:' + (el.model.callback) + ',expression:' + (el.model.expression) + '},';
		}
  // Inline-template
		if (el.inlineTemplate) {
			const inlineTemplate = genInlineTemplate(el);
			if (inlineTemplate) {
				data += inlineTemplate + ',';
			}
		}
		data = data.replace(/,$/, '') + '}';
  // V-bind data wrap
		if (el.wrapData) {
			data = el.wrapData(data);
		}
		return data;
	}

	function genDirectives(el) {
		const dirs = el.directives;
		if (!dirs) {
			return;
		}
		let res = 'directives:[';
		let hasRuntime = false;
		let i, l, dir, needRuntime;
		for (i = 0, l = dirs.length; i < l; i++) {
			dir = dirs[i];
			needRuntime = true;
			const gen = platformDirectives$1[dir.name] || baseDirectives[dir.name];
			if (gen) {
      // Compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
				needRuntime = Boolean(gen(el, dir, warn$3));
			}
			if (needRuntime) {
				hasRuntime = true;
				res += '{name:"' + (dir.name) + '",rawName:"' + (dir.rawName) + '"' + (dir.value ? (',value:(' + (dir.value) + '),expression:' + (JSON.stringify(dir.value))) : '') + (dir.arg ? (',arg:"' + (dir.arg) + '"') : '') + (dir.modifiers ? (',modifiers:' + (JSON.stringify(dir.modifiers))) : '') + '},';
			}
		}
		if (hasRuntime) {
			return res.slice(0, -1) + ']';
		}
	}

	function genInlineTemplate(el) {
		const ast = el.children[0];
		if ('development' !== 'production' && (
    el.children.length > 1 || ast.type !== 1
  )) {
			warn$3('Inline-template components must have exactly one child element.');
		}
		if (ast.type === 1) {
			const inlineRenderFns = generate(ast, currentOptions);
			return ('inlineTemplate:{render:function(){' + (inlineRenderFns.render) + '},staticRenderFns:[' + (inlineRenderFns.staticRenderFns.map(code => {
				return ('function(){' + code + '}');
			}).join(',')) + ']}');
		}
	}

	function genScopedSlots(slots) {
		return ('scopedSlots:_u([' + (Object.keys(slots).map(key => {
			return genScopedSlot(key, slots[key]);
		}).join(',')) + '])');
	}

	function genScopedSlot(key, el) {
		return '[' + key + ',function(' + (String(el.attrsMap.scope)) + '){' +
    'return ' + (el.tag === 'template' ?
      genChildren(el) || 'void 0' :
      genElement(el)) + '}]';
	}

	function genChildren(el, checkSkip) {
		const children = el.children;
		if (children.length) {
			const el$1 = children[0];
    // Optimize single v-for
			if (children.length === 1 &&
        el$1.for &&
        el$1.tag !== 'template' &&
        el$1.tag !== 'slot') {
				return genElement(el$1);
			}
			const normalizationType = checkSkip ? getNormalizationType(children) : 0;
			return ('[' + (children.map(genNode).join(',')) + ']' + (normalizationType ? (',' + normalizationType) : ''));
		}
	}

// Determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
	function getNormalizationType(children) {
		let res = 0;
		for (let i = 0; i < children.length; i++) {
			const el = children[i];
			if (el.type !== 1) {
				continue;
			}
			if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(c => {
	return needsNormalization(c.block);
}))) {
				res = 2;
				break;
			}
			if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(c => {
	return maybeComponent(c.block);
}))) {
				res = 1;
			}
		}
		return res;
	}

	function needsNormalization(el) {
		return el.for !== undefined || el.tag === 'template' || el.tag === 'slot';
	}

	function maybeComponent(el) {
		return !isPlatformReservedTag$1(el.tag);
	}

	function genNode(node) {
		if (node.type === 1) {
			return genElement(node);
		}
		return genText(node);
	}

	function genText(text) {
		return ('_v(' + (text.type === 2 ?
    text.expression : // No need for () because already wrapped in _s()
    transformSpecialNewlines(JSON.stringify(text.text))) + ')');
	}

	function genSlot(el) {
		const slotName = el.slotName || '"default"';
		const children = genChildren(el);
		let res = '_t(' + slotName + (children ? (',' + children) : '');
		const attrs = el.attrs && ('{' + (el.attrs.map(a => {
			return ((camelize(a.name)) + ':' + (a.value));
		}).join(',')) + '}');
		const bind$$1 = el.attrsMap['v-bind'];
		if ((attrs || bind$$1) && !children) {
			res += ',null';
		}
		if (attrs) {
			res += ',' + attrs;
		}
		if (bind$$1) {
			res += (attrs ? '' : ',null') + ',' + bind$$1;
		}
		return res + ')';
	}

// ComponentName is el.component, take it as argument to shun flow's pessimistic refinement
	function genComponent(componentName, el) {
		const children = el.inlineTemplate ? null : genChildren(el, true);
		return ('_c(' + componentName + ',' + (genData(el)) + (children ? (',' + children) : '') + ')');
	}

	function genProps(props) {
		let res = '';
		for (let i = 0; i < props.length; i++) {
			const prop = props[i];
			res += '"' + (prop.name) + '":' + (transformSpecialNewlines(prop.value)) + ',';
		}
		return res.slice(0, -1);
	}

// #3895, #4268
	function transformSpecialNewlines(text) {
		return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
	}

/*  */

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
	const prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// These unary operators should not be used as property/method names
	const unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// Check valid identifier for v-for
	const identRE = /[A-Za-z_$][\w$]*/;

// Strip strings in expressions
	const stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// Detect problematic expressions in a template
	function detectErrors(ast) {
		const errors = [];
		if (ast) {
			checkNode(ast, errors);
		}
		return errors;
	}

	function checkNode(node, errors) {
		if (node.type === 1) {
			for (const name in node.attrsMap) {
				if (dirRE.test(name)) {
					const value = node.attrsMap[name];
					if (value) {
						if (name === 'v-for') {
							checkFor(node, ('v-for="' + value + '"'), errors);
						} else if (onRE.test(name)) {
							checkEvent(value, (name + '="' + value + '"'), errors);
						} else {
							checkExpression(value, (name + '="' + value + '"'), errors);
						}
					}
				}
			}
			if (node.children) {
				for (let i = 0; i < node.children.length; i++) {
					checkNode(node.children[i], errors);
				}
			}
		} else if (node.type === 2) {
			checkExpression(node.expression, node.text, errors);
		}
	}

	function checkEvent(exp, text, errors) {
		const keywordMatch = exp.replace(stripStringRE, '').match(unaryOperatorsRE);
		if (keywordMatch) {
			errors.push(
      'avoid using JavaScript unary operator as property name: ' +
      '"' + (keywordMatch[0]) + '" in expression ' + (text.trim())
    );
		}
		checkExpression(exp, text, errors);
	}

	function checkFor(node, text, errors) {
		checkExpression(node.for || '', text, errors);
		checkIdentifier(node.alias, 'v-for alias', text, errors);
		checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
		checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
	}

	function checkIdentifier(ident, type, text, errors) {
		if (typeof ident === 'string' && !identRE.test(ident)) {
			errors.push(('invalid ' + type + ' "' + ident + '" in expression: ' + (text.trim())));
		}
	}

	function checkExpression(exp, text, errors) {
		try {
			new Function(('return ' + exp));
		} catch (e) {
			const keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
			if (keywordMatch) {
				errors.push(
        'avoid using JavaScript keyword as property name: ' +
        '"' + (keywordMatch[0]) + '" in expression ' + (text.trim())
      );
			} else {
				errors.push(('invalid expression: ' + (text.trim())));
			}
		}
	}

/*  */

	function baseCompile(
		template,
		options
) {
		const ast = parse(template.trim(), options);
		optimize(ast, options);
		const code = generate(ast, options);
		return {
			ast,
			render: code.render,
			staticRenderFns: code.staticRenderFns
		};
	}

	function makeFunction(code, errors) {
		try {
			return new Function(code);
		} catch (err) {
			errors.push({err, code});
			return noop;
		}
	}

	function createCompiler(baseOptions) {
		const functionCompileCache = Object.create(null);

		function compile(
			template,
			options
  ) {
			const finalOptions = Object.create(baseOptions);
			const errors = [];
			const tips = [];
			finalOptions.warn = function (msg, tip$$1) {
				(tip$$1 ? tips : errors).push(msg);
			};

			if (options) {
      // Merge custom modules
				if (options.modules) {
					finalOptions.modules = (baseOptions.modules || []).concat(options.modules);
				}
      // Merge custom directives
				if (options.directives) {
					finalOptions.directives = extend(
          Object.create(baseOptions.directives),
          options.directives
        );
				}
      // Copy other options
				for (const key in options) {
					if (key !== 'modules' && key !== 'directives') {
						finalOptions[key] = options[key];
					}
				}
			}

			const compiled = baseCompile(template, finalOptions);
			{
				errors.push.apply(errors, detectErrors(compiled.ast));
			}
			compiled.errors = errors;
			compiled.tips = tips;
			return compiled;
		}

		function compileToFunctions(
			template,
			options,
			vm
  ) {
			options = options || {};

    /* istanbul ignore if */
			{
      // Detect possible CSP restriction
				try {
					new Function('return 1');
				} catch (e) {
					if (e.toString().match(/unsafe-eval|CSP/)) {
						warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
					}
				}
			}

    // Check cache
			const key = options.delimiters ?
      String(options.delimiters) + template :
      template;
			if (functionCompileCache[key]) {
				return functionCompileCache[key];
			}

    // Compile
			const compiled = compile(template, options);

    // Check compilation errors/tips
			{
				if (compiled.errors && compiled.errors.length) {
					warn(
          'Error compiling template:\n\n' + template + '\n\n' +
          compiled.errors.map(e => {
	return ('- ' + e);
}).join('\n') + '\n',
          vm
        );
				}
				if (compiled.tips && compiled.tips.length) {
					compiled.tips.forEach(msg => {
						return tip(msg, vm);
					});
				}
			}

    // Turn code into functions
			const res = {};
			const fnGenErrors = [];
			res.render = makeFunction(compiled.render, fnGenErrors);
			const l = compiled.staticRenderFns.length;
			res.staticRenderFns = new Array(l);
			for (let i = 0; i < l; i++) {
				res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i], fnGenErrors);
			}

    // Check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
			{
				if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
					warn(
          'Failed to generate render function:\n\n' +
          fnGenErrors.map(ref => {
	const err = ref.err;
	const code = ref.code;

	return ((err.toString()) + ' in\n\n' + code + '\n');
}).join('\n'),
          vm
        );
				}
			}

			return (functionCompileCache[key] = res);
		}

		return {
			compile,
			compileToFunctions
		};
	}

/*  */

	function transformNode(el, options) {
		const warn = options.warn || baseWarn;
		const staticClass = getAndRemoveAttr(el, 'class');
		if ('development' !== 'production' && staticClass) {
			const expression = parseText(staticClass, options.delimiters);
			if (expression) {
				warn(
        'class="' + staticClass + '": ' +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      );
			}
		}
		if (staticClass) {
			el.staticClass = JSON.stringify(staticClass);
		}
		const classBinding = getBindingAttr(el, 'class', false /* getStatic */);
		if (classBinding) {
			el.classBinding = classBinding;
		}
	}

	function genData$1(el) {
		let data = '';
		if (el.staticClass) {
			data += 'staticClass:' + (el.staticClass) + ',';
		}
		if (el.classBinding) {
			data += 'class:' + (el.classBinding) + ',';
		}
		return data;
	}

	const klass$1 = {
		staticKeys: ['staticClass'],
		transformNode,
		genData: genData$1
	};

/*  */

	function transformNode$1(el, options) {
		const warn = options.warn || baseWarn;
		const staticStyle = getAndRemoveAttr(el, 'style');
		if (staticStyle) {
    /* istanbul ignore if */
			{
				const expression = parseText(staticStyle, options.delimiters);
				if (expression) {
					warn(
          'style="' + staticStyle + '": ' +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.'
        );
				}
			}
			el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
		}

		const styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
		if (styleBinding) {
			el.styleBinding = styleBinding;
		}
	}

	function genData$2(el) {
		let data = '';
		if (el.staticStyle) {
			data += 'staticStyle:' + (el.staticStyle) + ',';
		}
		if (el.styleBinding) {
			data += 'style:(' + (el.styleBinding) + '),';
		}
		return data;
	}

	const style$1 = {
		staticKeys: ['staticStyle'],
		transformNode: transformNode$1,
		genData: genData$2
	};

	const modules$1 = [
		klass$1,
		style$1
	];

/*  */

	function text(el, dir) {
		if (dir.value) {
			addProp(el, 'textContent', ('_s(' + (dir.value) + ')'));
		}
	}

/*  */

	function html(el, dir) {
		if (dir.value) {
			addProp(el, 'innerHTML', ('_s(' + (dir.value) + ')'));
		}
	}

	const directives$1 = {
		model,
		text,
		html
	};

/*  */

	const baseOptions = {
		expectHTML: true,
		modules: modules$1,
		directives: directives$1,
		isPreTag,
		isUnaryTag,
		mustUseProp,
		isReservedTag,
		getTagNamespace,
		staticKeys: genStaticKeys(modules$1)
	};

	const ref$1 = createCompiler(baseOptions);
	const compileToFunctions = ref$1.compileToFunctions;

/*  */

	const idToTemplate = cached(id => {
		const el = query(id);
		return el && el.innerHTML;
	});

	const mount = Vue$3.prototype.$mount;
	Vue$3.prototype.$mount = function (
		el,
		hydrating
) {
		el = el && query(el);

  /* istanbul ignore if */
		if (el === document.body || el === document.documentElement) {
			'development' !== 'production' && warn(
      'Do not mount Vue to <html> or <body> - mount to normal elements instead.'
    );
			return this;
		}

		const options = this.$options;
  // Resolve template/el and convert to render function
		if (!options.render) {
			let template = options.template;
			if (template) {
				if (typeof template === 'string') {
					if (template.charAt(0) === '#') {
						template = idToTemplate(template);
          /* istanbul ignore if */
						if ('development' !== 'production' && !template) {
							warn(
              ('Template element not found or is empty: ' + (options.template)),
              this
            );
						}
					}
				} else if (template.nodeType) {
					template = template.innerHTML;
				} else {
					{
						warn('invalid template option:' + template, this);
					}
					return this;
				}
			} else if (el) {
				template = getOuterHTML(el);
			}
			if (template) {
      /* istanbul ignore if */
				if ('development' !== 'production' && config.performance && perf) {
					perf.mark('compile');
				}

				const ref = compileToFunctions(template, {
					shouldDecodeNewlines,
					delimiters: options.delimiters
				}, this);
				const render = ref.render;
				const staticRenderFns = ref.staticRenderFns;
				options.render = render;
				options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
				if ('development' !== 'production' && config.performance && perf) {
					perf.mark('compile end');
					perf.measure(((this._name) + ' compile'), 'compile', 'compile end');
				}
			}
		}
		return mount.call(this, el, hydrating);
	};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
	function getOuterHTML(el) {
		if (el.outerHTML) {
			return el.outerHTML;
		}
		const container = document.createElement('div');
		container.appendChild(el.cloneNode(true));
		return container.innerHTML;
	}

	Vue$3.compile = compileToFunctions;

	return Vue$3;
}));
