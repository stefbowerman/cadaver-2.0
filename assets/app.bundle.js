var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
(function() {
  "use strict";
  var _settings, _resizeObserver, _intersectionObserver, _onBlockSelect, _onBlockDeselect, _isLoading, _state, _muteUpdateSync;
  function SelectorSet() {
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }
    this.size = 0;
    this.uid = 0;
    this.selectors = [];
    this.selectorObjects = {};
    this.indexes = Object.create(this.indexes);
    this.activeIndexes = [];
  }
  var docElem = window.document.documentElement;
  var matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector;
  SelectorSet.prototype.matchesSelector = function(el, selector2) {
    return matches.call(el, selector2);
  };
  SelectorSet.prototype.querySelectorAll = function(selectors2, context) {
    return context.querySelectorAll(selectors2);
  };
  SelectorSet.prototype.indexes = [];
  var idRe = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: "ID",
    selector: function matchIdSelector(sel) {
      var m;
      if (m = sel.match(idRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementId(el) {
      if (el.id) {
        return [el.id];
      }
    }
  });
  var classRe = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: "CLASS",
    selector: function matchClassSelector(sel) {
      var m;
      if (m = sel.match(classRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementClassNames(el) {
      var className = el.className;
      if (className) {
        if (typeof className === "string") {
          return className.split(/\s/);
        } else if (typeof className === "object" && "baseVal" in className) {
          return className.baseVal.split(/\s/);
        }
      }
    }
  });
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: "TAG",
    selector: function matchTagSelector(sel) {
      var m;
      if (m = sel.match(tagRe)) {
        return m[0].toUpperCase();
      }
    },
    element: function getElementTagName(el) {
      return [el.nodeName.toUpperCase()];
    }
  });
  SelectorSet.prototype.indexes["default"] = {
    name: "UNIVERSAL",
    selector: function() {
      return true;
    },
    element: function() {
      return [true];
    }
  };
  var Map$1;
  if (typeof window.Map === "function") {
    Map$1 = window.Map;
  } else {
    Map$1 = (function() {
      function Map2() {
        this.map = {};
      }
      Map2.prototype.get = function(key) {
        return this.map[key + " "];
      };
      Map2.prototype.set = function(key, value) {
        this.map[key + " "] = value;
      };
      return Map2;
    })();
  }
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
  function parseSelectorIndexes(allIndexes, selector2) {
    allIndexes = allIndexes.slice(0).concat(allIndexes["default"]);
    var allIndexesLen = allIndexes.length, i, j, m, dup, rest = selector2, key, index, indexes = [];
    do {
      chunker.exec("");
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0; i < allIndexesLen; i++) {
            index = allIndexes[i];
            if (key = index.selector(m[1])) {
              j = indexes.length;
              dup = false;
              while (j--) {
                if (indexes[j].index === index && indexes[j].key === key) {
                  dup = true;
                  break;
                }
              }
              if (!dup) {
                indexes.push({ index, key });
              }
              break;
            }
          }
        }
      }
    } while (m);
    return indexes;
  }
  function findByPrototype(ary, proto) {
    var i, len, item;
    for (i = 0, len = ary.length; i < len; i++) {
      item = ary[i];
      if (proto.isPrototypeOf(item)) {
        return item;
      }
    }
  }
  SelectorSet.prototype.logDefaultIndexUsed = function() {
  };
  SelectorSet.prototype.add = function(selector2, data) {
    var obj, i, indexProto, key, index, objs, selectorIndexes, selectorIndex, indexes = this.activeIndexes, selectors2 = this.selectors, selectorObjects = this.selectorObjects;
    if (typeof selector2 !== "string") {
      return;
    }
    obj = {
      id: this.uid++,
      selector: selector2,
      data
    };
    selectorObjects[obj.id] = obj;
    selectorIndexes = parseSelectorIndexes(this.indexes, selector2);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      key = selectorIndex.key;
      indexProto = selectorIndex.index;
      index = findByPrototype(indexes, indexProto);
      if (!index) {
        index = Object.create(indexProto);
        index.map = new Map$1();
        indexes.push(index);
      }
      if (indexProto === this.indexes["default"]) {
        this.logDefaultIndexUsed(obj);
      }
      objs = index.map.get(key);
      if (!objs) {
        objs = [];
        index.map.set(key, objs);
      }
      objs.push(obj);
    }
    this.size++;
    selectors2.push(selector2);
  };
  SelectorSet.prototype.remove = function(selector2, data) {
    if (typeof selector2 !== "string") {
      return;
    }
    var selectorIndexes, selectorIndex, i, j, k, selIndex, objs, obj, indexes = this.activeIndexes, selectors2 = this.selectors = [], selectorObjects = this.selectorObjects, removedIds = {}, removeAll = arguments.length === 1;
    selectorIndexes = parseSelectorIndexes(this.indexes, selector2);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      j = indexes.length;
      while (j--) {
        selIndex = indexes[j];
        if (selectorIndex.index.isPrototypeOf(selIndex)) {
          objs = selIndex.map.get(selectorIndex.key);
          if (objs) {
            k = objs.length;
            while (k--) {
              obj = objs[k];
              if (obj.selector === selector2 && (removeAll || obj.data === data)) {
                objs.splice(k, 1);
                removedIds[obj.id] = true;
              }
            }
          }
          break;
        }
      }
    }
    for (i in removedIds) {
      delete selectorObjects[i];
      this.size--;
    }
    for (i in selectorObjects) {
      selectors2.push(selectorObjects[i].selector);
    }
  };
  function sortById(a, b) {
    return a.id - b.id;
  }
  SelectorSet.prototype.queryAll = function(context) {
    if (!this.selectors.length) {
      return [];
    }
    var matches2 = {}, results = [];
    var els = this.querySelectorAll(this.selectors.join(", "), context);
    var i, j, len, len2, el, m, match, obj;
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      m = this.matches(el);
      for (j = 0, len2 = m.length; j < len2; j++) {
        obj = m[j];
        if (!matches2[obj.id]) {
          match = {
            id: obj.id,
            selector: obj.selector,
            data: obj.data,
            elements: []
          };
          matches2[obj.id] = match;
          results.push(match);
        } else {
          match = matches2[obj.id];
        }
        match.elements.push(el);
      }
    }
    return results.sort(sortById);
  };
  SelectorSet.prototype.matches = function(el) {
    if (!el) {
      return [];
    }
    var i, j, k, len, len2, len3, index, keys, objs, obj, id;
    var indexes = this.activeIndexes, matchedIds = {}, matches2 = [];
    for (i = 0, len = indexes.length; i < len; i++) {
      index = indexes[i];
      keys = index.element(el);
      if (keys) {
        for (j = 0, len2 = keys.length; j < len2; j++) {
          if (objs = index.map.get(keys[j])) {
            for (k = 0, len3 = objs.length; k < len3; k++) {
              obj = objs[k];
              id = obj.id;
              if (!matchedIds[id] && this.matchesSelector(el, obj.selector)) {
                matchedIds[id] = true;
                matches2.push(obj);
              }
            }
          }
        }
      }
    }
    return matches2.sort(sortById);
  };
  const eventTypes = {};
  const listeners = {};
  const nonBubblers = ["mouseenter", "mouseleave", "pointerenter", "pointerleave", "blur", "focus"];
  function makeBusStack(event) {
    if (listeners[event] === void 0) {
      listeners[event] = /* @__PURE__ */ new Set();
    }
  }
  function triggerBus(event, args) {
    if (listeners[event]) {
      listeners[event].forEach((cb) => {
        cb(...args);
      });
    }
  }
  function maybeRunQuerySelector(el) {
    return typeof el === "string" ? document.querySelectorAll(el) : el;
  }
  function handleDelegation(e) {
    let matches2 = traverse(eventTypes[e.type], e.target);
    if (matches2.length) {
      for (let i = 0; i < matches2.length; i++) {
        for (let i2 = 0; i2 < matches2[i].stack.length; i2++) {
          if (nonBubblers.indexOf(e.type) !== -1) {
            addDelegateTarget(e, matches2[i].delegatedTarget);
            if (e.target === matches2[i].delegatedTarget) {
              matches2[i].stack[i2].data(e);
            }
          } else {
            addDelegateTarget(e, matches2[i].delegatedTarget);
            matches2[i].stack[i2].data(e);
          }
        }
      }
    }
  }
  function traverse(listeners2, target) {
    const queue = [];
    let node = target;
    do {
      if (node.nodeType !== 1) {
        break;
      }
      const matches2 = listeners2.matches(node);
      if (matches2.length) {
        queue.push({ delegatedTarget: node, stack: matches2 });
      }
    } while (node = node.parentElement);
    return queue;
  }
  function addDelegateTarget(event, delegatedTarget) {
    Object.defineProperty(event, "currentTarget", {
      configurable: true,
      enumerable: true,
      get: () => delegatedTarget
    });
  }
  function clone(object) {
    const copy = {};
    for (const key in object) {
      copy[key] = [...object[key]];
    }
    return copy;
  }
  class E {
    /**
     * Binds all provided methods to a provided context.
     *
     * @param {object} context
     * @param {string[]} [methods] Optional.
     */
    bindAll(context, methods) {
      if (!methods) {
        methods = Object.getOwnPropertyNames(Object.getPrototypeOf(context));
      }
      for (let i = 0; i < methods.length; i++) {
        context[methods[i]] = context[methods[i]].bind(context);
      }
    }
    /**
     * Bind event to a string, NodeList, or element.
     *
     * @param {string} event
     * @param {string|NodeList|NodeListOf<Element>|HTMLElement|HTMLElement[]|Window|Document|function} el
     * @param {*} [callback]
     * @param {{}|boolean} [options]
     */
    on(event, el, callback, options) {
      const events = event.split(" ");
      for (let i = 0; i < events.length; i++) {
        if (typeof el === "function" && callback === void 0) {
          makeBusStack(events[i]);
          listeners[events[i]].add(el);
          continue;
        }
        if (el.nodeType && el.nodeType === 1 || el === window || el === document) {
          el.addEventListener(events[i], callback, options);
          continue;
        }
        el = maybeRunQuerySelector(el);
        for (let n = 0; n < el.length; n++) {
          el[n].addEventListener(events[i], callback, options);
        }
      }
    }
    /**
     * Add a delegated event.
     *
     * @param {string} event
     * @param {string|NodeList|HTMLElement|Element} delegate
     * @param {*} [callback]
     */
    delegate(event, delegate, callback) {
      const events = event.split(" ");
      for (let i = 0; i < events.length; i++) {
        let map = eventTypes[events[i]];
        if (map === void 0) {
          map = new SelectorSet();
          eventTypes[events[i]] = map;
          if (nonBubblers.indexOf(events[i]) !== -1) {
            document.addEventListener(events[i], handleDelegation, true);
          } else {
            document.addEventListener(events[i], handleDelegation);
          }
        }
        map.add(delegate, callback);
      }
    }
    /**
     * Remove a callback from a DOM element, or one or all Bus events.
     *
     * @param {string} event
     * @param {string|NodeList|HTMLElement|Element|Window|undefined} [el]
     * @param {*} [callback]
     * @param {{}|boolean} [options]
     */
    off(event, el, callback, options) {
      const events = event.split(" ");
      for (let i = 0; i < events.length; i++) {
        if (el === void 0) {
          listeners[events[i]]?.clear();
          continue;
        }
        if (typeof el === "function") {
          makeBusStack(events[i]);
          listeners[events[i]].delete(el);
          continue;
        }
        const map = eventTypes[events[i]];
        if (map !== void 0) {
          map.remove(el, callback);
          if (map.size === 0) {
            delete eventTypes[events[i]];
            if (nonBubblers.indexOf(events[i]) !== -1) {
              document.removeEventListener(events[i], handleDelegation, true);
            } else {
              document.removeEventListener(events[i], handleDelegation);
            }
            continue;
          }
        }
        if (el.removeEventListener !== void 0) {
          el.removeEventListener(events[i], callback, options);
          continue;
        }
        el = maybeRunQuerySelector(el);
        for (let n = 0; n < el.length; n++) {
          el[n].removeEventListener(events[i], callback, options);
        }
      }
    }
    /**
     * Emit a Bus event.
     *
     * @param {string} event
     * @param {...*} args
     */
    emit(event, ...args) {
      triggerBus(event, args);
    }
    /**
     * Return a clone of the delegated event stack for debugging.
     *
     * @returns {Object.<string, array>}
     */
    debugDelegated() {
      return JSON.parse(JSON.stringify(eventTypes));
    }
    /**
     * Return a clone of the bus event stack for debugging.
     *
     * @returns {Object.<string, array>}
     */
    debugBus() {
      return clone(listeners);
    }
    /**
     * Checks if a given bus event has listeners.
     *
     * @param {string} event
     * @returns {boolean}
     */
    hasBus(event) {
      return this.debugBus().hasOwnProperty(event);
    }
  }
  const instance = new E();
  const parser = new DOMParser();
  function parseDom(html) {
    return typeof html === "string" ? parser.parseFromString(html, "text/html") : html;
  }
  function processUrl(url) {
    const details = new URL(url, window.location.origin);
    const normalized = details.hash.length ? url.replace(details.hash, "") : null;
    return {
      hasHash: details.hash.length > 0,
      pathname: details.pathname.replace(/\/+$/, ""),
      host: details.host,
      search: details.search,
      raw: url,
      href: normalized || details.href
    };
  }
  function reloadElement(node, elementType) {
    node.parentNode.replaceChild(duplicateElement(node, elementType), node);
  }
  function appendElement(node, elementType) {
    const target = node.parentNode.tagName === "HEAD" ? document.head : document.body;
    target.appendChild(duplicateElement(node, elementType));
  }
  function duplicateElement(node, elementType) {
    const replacement = document.createElement(elementType);
    for (let k = 0; k < node.attributes.length; k++) {
      const attr = node.attributes[k];
      replacement.setAttribute(attr.nodeName, attr.nodeValue);
    }
    if (node.innerHTML) {
      replacement.innerHTML = node.innerHTML;
    }
    return replacement;
  }
  class Transition {
    /**
     * @param {{wrapper: HTMLElement}} props
     */
    constructor({ wrapper }) {
      this.wrapper = wrapper;
    }
    /**
     * @param {{ from: HTMLElement|Element, trigger: string|HTMLElement|false }} props
     * @return {Promise<void>}
     */
    leave(props) {
      return new Promise((resolve) => {
        this.onLeave({ ...props, done: resolve });
      });
    }
    /**
     * @param {{ to: HTMLElement|Element, trigger: string|HTMLElement|false }} props
     * @return {Promise<void>}
     */
    enter(props) {
      return new Promise((resolve) => {
        this.onEnter({ ...props, done: resolve });
      });
    }
    /**
     * Handle the transition leaving the previous page.
     * @param {{from: HTMLElement|Element, trigger: string|HTMLElement|false, done: function}} props
     */
    onLeave({ from, trigger, done }) {
      done();
    }
    /**
     * Handle the transition entering the next page.
     * @param {{to: HTMLElement|Element, trigger: string|HTMLElement|false, done: function}} props
     */
    onEnter({ to, trigger, done }) {
      done();
    }
  }
  class Renderer {
    /**
     * @param {{content: HTMLElement|Element, page: Document|Node, title: string, wrapper: Element}} props
     */
    constructor({ content, page, title, wrapper }) {
      this._contentString = content.outerHTML;
      this._DOM = null;
      this.page = page;
      this.title = title;
      this.wrapper = wrapper;
      this.content = this.wrapper.lastElementChild;
    }
    onEnter() {
    }
    onEnterCompleted() {
    }
    onLeave() {
    }
    onLeaveCompleted() {
    }
    initialLoad() {
      this.onEnter();
      this.onEnterCompleted();
    }
    update() {
      document.title = this.title;
      this.wrapper.appendChild(this._DOM.firstElementChild);
      this.content = this.wrapper.lastElementChild;
      this._DOM = null;
    }
    createDom() {
      if (!this._DOM) {
        this._DOM = document.createElement("div");
        this._DOM.innerHTML = this._contentString;
      }
    }
    remove() {
      this.wrapper.firstElementChild.remove();
    }
    /**
     * Called when transitioning into the current page.
     * @param {Transition} transition
     * @param {string|HTMLElement|false} trigger
     * @return {Promise<null>}
     */
    enter(transition, trigger) {
      return new Promise((resolve) => {
        this.onEnter();
        transition.enter({ trigger, to: this.content }).then(() => {
          this.onEnterCompleted();
          resolve();
        });
      });
    }
    /**
     * Called when transitioning away from the current page.
     * @param {Transition} transition
     * @param {string|HTMLElement|false} trigger
     * @param {boolean} removeOldContent
     * @return {Promise<null>}
     */
    leave(transition, trigger, removeOldContent) {
      return new Promise((resolve) => {
        this.onLeave();
        transition.leave({ trigger, from: this.content }).then(() => {
          if (removeOldContent) {
            this.remove();
          }
          this.onLeaveCompleted();
          resolve();
        });
      });
    }
  }
  class RouteStore {
    /**
     * @type {Map<string, Map<string, string>>}
     */
    data = /* @__PURE__ */ new Map();
    /**
     * @type {Map<string, RegExp>}
     */
    regexCache = /* @__PURE__ */ new Map();
    /**
     *
     * @param {string} fromPattern
     * @param {string} toPattern
     * @param {string} transition
     */
    add(fromPattern, toPattern, transition) {
      if (!this.data.has(fromPattern)) {
        this.data.set(fromPattern, /* @__PURE__ */ new Map());
        this.regexCache.set(fromPattern, new RegExp(`^${fromPattern}$`));
      }
      this.data.get(fromPattern).set(toPattern, transition);
      this.regexCache.set(toPattern, new RegExp(`^${toPattern}$`));
    }
    /**
     *
     * @param {{ raw: string, href: string, hasHash: boolean, pathname: string }} currentUrl
     * @param {{ raw: string, href: string, hasHash: boolean, pathname: string }} nextUrl
     * @return {string|null}
     */
    findMatch(currentUrl, nextUrl) {
      for (const [fromPattern, potentialMatches] of this.data) {
        if (currentUrl.pathname.match(this.regexCache.get(fromPattern))) {
          for (const [toPattern, transition] of potentialMatches) {
            if (nextUrl.pathname.match(this.regexCache.get(toPattern))) {
              return transition;
            }
          }
          break;
        }
      }
      return null;
    }
  }
  const IN_PROGRESS = "A transition is currently in progress";
  class Core {
    isTransitioning = false;
    /**
     * @type {CacheEntry|null}
     */
    currentCacheEntry = null;
    /**
     * @type {Map<string, CacheEntry>}
     */
    cache = /* @__PURE__ */ new Map();
    /**
     * @private
     * @type {Map<string, Promise>}
     */
    activePromises = /* @__PURE__ */ new Map();
    /**
     * @param {{
     * 		links?: string,
     * 		removeOldContent?: boolean,
     * 		allowInterruption?: boolean,
     * 		bypassCache?: boolean,
     * 		enablePrefetch?: boolean,
     * 		renderers?: Object.<string, typeof Renderer>,
     * 		transitions?: Object.<string, typeof Transition>,
     * 		reloadJsFilter?: boolean|function(HTMLElement): boolean,
     * 		reloadCssFilter?: boolean|function(HTMLLinkElement): boolean
     * }} parameters
     */
    constructor(parameters = {}) {
      const {
        links = "a[href]:not([target]):not([href^=\\#]):not([data-taxi-ignore])",
        removeOldContent = true,
        allowInterruption = false,
        bypassCache = false,
        enablePrefetch = true,
        renderers = {
          default: Renderer
        },
        transitions = {
          default: Transition
        },
        reloadJsFilter = (element) => element.dataset.taxiReload !== void 0,
        reloadCssFilter = (element) => true
        //element.dataset.taxiReload !== undefined
      } = parameters;
      this.renderers = renderers;
      this.transitions = transitions;
      this.defaultRenderer = this.renderers.default || Renderer;
      this.defaultTransition = this.transitions.default || Transition;
      this.wrapper = document.querySelector("[data-taxi]");
      this.reloadJsFilter = reloadJsFilter;
      this.reloadCssFilter = reloadCssFilter;
      this.removeOldContent = removeOldContent;
      this.allowInterruption = allowInterruption;
      this.bypassCache = bypassCache;
      this.enablePrefetch = enablePrefetch;
      this.cache = /* @__PURE__ */ new Map();
      this.isPopping = false;
      this.attachEvents(links);
      this.currentLocation = processUrl(window.location.href);
      this.cache.set(this.currentLocation.href, this.createCacheEntry(document.cloneNode(true), window.location.href));
      this.currentCacheEntry = this.cache.get(this.currentLocation.href);
      this.currentCacheEntry.renderer.initialLoad();
    }
    /**
     * @param {string} renderer
     */
    setDefaultRenderer(renderer) {
      this.defaultRenderer = this.renderers[renderer];
    }
    /**
     * @param {string} transition
     */
    setDefaultTransition(transition) {
      this.defaultTransition = this.transitions[transition];
    }
    /**
     * Registers a route into the RouteStore
     *
     * @param {string} fromPattern
     * @param {string} toPattern
     * @param {string} transition
     */
    addRoute(fromPattern, toPattern, transition) {
      if (!this.router) {
        this.router = new RouteStore();
      }
      this.router.add(fromPattern, toPattern, transition);
    }
    /**
     * Prime the cache for a given URL
     *
     * @param {string} url
     * @param {boolean} [preloadAssets]
     * @return {Promise}
     */
    preload(url, preloadAssets = false) {
      url = processUrl(url).href;
      if (!this.cache.has(url)) {
        return this.fetch(url, false).then(async (response) => {
          this.cache.set(url, this.createCacheEntry(response.html, response.url));
          if (preloadAssets) {
            this.cache.get(url).renderer.createDom();
          }
        }).catch((err) => console.warn(err));
      }
      return Promise.resolve();
    }
    /**
     * Updates the HTML cache for a given URL.
     * If no URL is passed, then cache for the current page is updated.
     * Useful when adding/removing content via AJAX such as a search page or infinite loader.
     *
     * @param {string} [url]
     */
    updateCache(url) {
      const key = processUrl(url || window.location.href).href;
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }
      this.cache.set(key, this.createCacheEntry(document.cloneNode(true), key));
    }
    /**
     * Clears the cache for a given URL.
     * If no URL is passed, then cache for the current page is cleared.
     *
     * @param {string} [url]
     */
    clearCache(url) {
      const key = processUrl(url || window.location.href).href;
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }
    }
    /**
     * @param {string} url
     * @param {string|false} [transition]
     * @param {string|false|HTMLElement} [trigger]
     * @return {Promise<void|Error>}
     */
    navigateTo(url, transition = false, trigger = false) {
      return new Promise((resolve, reject) => {
        if (!this.allowInterruption && this.isTransitioning) {
          reject(new Error(IN_PROGRESS));
          return;
        }
        this.isTransitioning = true;
        this.isPopping = true;
        this.targetLocation = processUrl(url);
        this.popTarget = window.location.href;
        const TransitionClass = new (this.chooseTransition(transition))({ wrapper: this.wrapper });
        let navigationPromise;
        if (this.bypassCache || !this.cache.has(this.targetLocation.href) || this.cache.get(this.targetLocation.href).skipCache) {
          const fetched = this.fetch(this.targetLocation.href).then((response) => {
            this.cache.set(this.targetLocation.href, this.createCacheEntry(response.html, response.url));
            this.cache.get(this.targetLocation.href).renderer.createDom();
          }).catch((err) => {
            window.location.href = url;
          });
          navigationPromise = this.beforeFetch(this.targetLocation, TransitionClass, trigger).then(async () => {
            return fetched.then(async () => {
              return await this.afterFetch(this.targetLocation, TransitionClass, this.cache.get(this.targetLocation.href), trigger);
            });
          });
        } else {
          this.cache.get(this.targetLocation.href).renderer.createDom();
          navigationPromise = this.beforeFetch(this.targetLocation, TransitionClass, trigger).then(async () => {
            return await this.afterFetch(this.targetLocation, TransitionClass, this.cache.get(this.targetLocation.href), trigger);
          });
        }
        navigationPromise.then(() => {
          resolve();
        });
      });
    }
    /**
     * Add an event listener.
     * @param {string} event
     * @param {any} callback
     */
    on(event, callback) {
      instance.on(event, callback);
    }
    /**
     * Remove an event listener.
     * @param {string} event
     * @param {any} [callback]
     */
    off(event, callback) {
      instance.off(event, callback);
    }
    /**
     * @private
     * @param {{ raw: string, href: string, hasHash: boolean, pathname: string }} url
     * @param {Transition} TransitionClass
     * @param {string|HTMLElement|false} trigger
     * @return {Promise<void>}
     */
    beforeFetch(url, TransitionClass, trigger) {
      instance.emit("NAVIGATE_OUT", {
        from: this.currentCacheEntry,
        trigger
      });
      return new Promise((resolve) => {
        this.currentCacheEntry.renderer.leave(TransitionClass, trigger, this.removeOldContent).then(() => {
          if (trigger !== "popstate") {
            window.history.pushState({}, "", url.raw);
          }
          resolve();
        });
      });
    }
    /**
     * @private
     * @param {{ raw: string, href: string, host: string, hasHash: boolean, pathname: string }} url
     * @param {Transition} TransitionClass
     * @param {CacheEntry} entry
     * @param {string|HTMLElement|false} trigger
     * @return {Promise<void>}
     */
    afterFetch(url, TransitionClass, entry, trigger) {
      this.currentLocation = url;
      this.popTarget = this.currentLocation.href;
      return new Promise((resolve) => {
        entry.renderer.update();
        instance.emit("NAVIGATE_IN", {
          from: this.currentCacheEntry,
          to: entry,
          trigger
        });
        if (this.reloadJsFilter) {
          this.loadScripts(entry.scripts);
        }
        if (this.reloadCssFilter) {
          this.loadStyles(entry.styles);
        }
        if (trigger !== "popstate" && url.href !== entry.finalUrl) {
          window.history.replaceState({}, "", entry.finalUrl);
        }
        entry.renderer.enter(TransitionClass, trigger).then(() => {
          instance.emit("NAVIGATE_END", {
            from: this.currentCacheEntry,
            to: entry,
            trigger
          });
          this.currentCacheEntry = entry;
          this.isTransitioning = false;
          this.isPopping = false;
          resolve();
        });
      });
    }
    /**
     * Load up scripts from the target page if needed
     *
     * @param {HTMLElement[]} cachedScripts
     */
    loadScripts(cachedScripts) {
      const newScripts = [...cachedScripts];
      const currentScripts = Array.from(document.querySelectorAll("script")).filter(this.reloadJsFilter);
      for (let i = 0; i < currentScripts.length; i++) {
        for (let n = 0; n < newScripts.length; n++) {
          if (currentScripts[i].outerHTML === newScripts[n].outerHTML) {
            reloadElement(currentScripts[i], "SCRIPT");
            newScripts.splice(n, 1);
            break;
          }
        }
      }
      for (const script of newScripts) {
        appendElement(script, "SCRIPT");
      }
    }
    /**
     * Load up styles from the target page if needed
     *
     * @param {Array<HTMLLinkElement|HTMLStyleElement>} cachedStyles
     */
    loadStyles(cachedStyles) {
      const currentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(this.reloadCssFilter);
      const currentInlineStyles = Array.from(document.querySelectorAll("style")).filter(this.reloadCssFilter);
      const newInlineStyles = cachedStyles.filter((el) => {
        if (!el.href) {
          return true;
        } else if (!currentStyles.find((link) => link.href === el.href)) {
          document.body.append(el);
          return false;
        }
      });
      for (let i = 0; i < currentInlineStyles.length; i++) {
        for (let n = 0; n < newInlineStyles.length; n++) {
          if (currentInlineStyles[i].outerHTML === newInlineStyles[n].outerHTML) {
            reloadElement(currentInlineStyles[i], "STYLE");
            newInlineStyles.splice(n, 1);
            break;
          }
        }
      }
      for (const style of newInlineStyles) {
        appendElement(style, "STYLE");
      }
    }
    /**
     * @private
     * @param {string} links
     */
    attachEvents(links) {
      instance.delegate("click", links, this.onClick);
      instance.on("popstate", window, this.onPopstate);
      if (this.enablePrefetch) {
        instance.delegate("mouseenter focus", links, this.onPrefetch);
      }
    }
    /**
     * @private
     * @param {MouseEvent} e
     */
    onClick = (e) => {
      if (!(e.metaKey || e.ctrlKey)) {
        const target = processUrl(e.currentTarget.href);
        this.currentLocation = processUrl(window.location.href);
        if (this.currentLocation.host !== target.host) {
          return;
        }
        if (this.currentLocation.href !== target.href || this.currentLocation.hasHash && !target.hasHash) {
          e.preventDefault();
          this.navigateTo(target.raw, e.currentTarget.dataset.transition || false, e.currentTarget).catch((err) => console.warn(err));
          return;
        }
        if (!this.currentLocation.hasHash && !target.hasHash) {
          e.preventDefault();
        }
      }
    };
    /**
     * @private
     * @return {void|boolean}
     */
    onPopstate = () => {
      const target = processUrl(window.location.href);
      if (target.pathname === this.currentLocation.pathname && target.search === this.currentLocation.search && !this.isPopping) {
        return false;
      }
      if (!this.allowInterruption && (this.isTransitioning || this.isPopping)) {
        window.history.pushState({}, "", this.popTarget);
        console.warn(IN_PROGRESS);
        return false;
      }
      if (!this.isPopping) {
        this.popTarget = window.location.href;
      }
      this.isPopping = true;
      this.navigateTo(window.location.href, false, "popstate");
    };
    /**
     * @private
     * @param {MouseEvent} e
     */
    onPrefetch = (e) => {
      const target = processUrl(e.currentTarget.href);
      if (this.currentLocation.host !== target.host) {
        return;
      }
      this.preload(e.currentTarget.href, false);
    };
    /**
     * @private
     * @param {string} url
     * @param {boolean} [runFallback]
     * @return {Promise<{html: Document, url: string}>}
     */
    fetch(url, runFallback = true) {
      if (this.activePromises.has(url)) {
        return this.activePromises.get(url);
      }
      const request = new Promise((resolve, reject) => {
        let resolvedUrl;
        fetch(url, {
          mode: "same-origin",
          method: "GET",
          headers: { "X-Requested-With": "Taxi" },
          credentials: "same-origin"
        }).then((response) => {
          if (!response.ok) {
            reject("Taxi encountered a non 2xx HTTP status code");
            if (runFallback) {
              window.location.href = url;
            }
          }
          resolvedUrl = response.url;
          return response.text();
        }).then((htmlString) => {
          resolve({ html: parseDom(htmlString), url: resolvedUrl });
        }).catch((err) => {
          reject(err);
          if (runFallback) {
            window.location.href = url;
          }
        }).finally(() => {
          this.activePromises.delete(url);
        });
      });
      this.activePromises.set(url, request);
      return request;
    }
    /**
     * @private
     * @param {string|false} transition
     * @return {Transition|function}
     */
    chooseTransition(transition) {
      if (transition) {
        return this.transitions[transition];
      }
      const routeTransition = this.router?.findMatch(this.currentLocation, this.targetLocation);
      if (routeTransition) {
        return this.transitions[routeTransition];
      }
      return this.defaultTransition;
    }
    /**
     * @private
     * @param {Document|Node} page
     * @param {string} url
     * @return {CacheEntry}
     */
    createCacheEntry(page, url) {
      const content = page.querySelector("[data-taxi-view]");
      const Renderer2 = content.dataset.taxiView.length ? this.renderers[content.dataset.taxiView] : this.defaultRenderer;
      if (!Renderer2) {
        console.warn(`The Renderer "${content.dataset.taxiView}" was set in the data-taxi-view of the requested page, but not registered in Taxi.`);
      }
      return {
        page,
        content,
        finalUrl: url,
        skipCache: content.hasAttribute("data-taxi-nocache"),
        scripts: this.reloadJsFilter ? Array.from(page.querySelectorAll("script")).filter(this.reloadJsFilter) : [],
        styles: this.reloadCssFilter ? Array.from(page.querySelectorAll('link[rel="stylesheet"], style')).filter(this.reloadCssFilter) : [],
        title: page.title,
        renderer: new Renderer2({
          wrapper: this.wrapper,
          title: page.title,
          content,
          page
        })
      };
    }
  }
  const dispatch = (eventName, detail = {}) => {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      detail,
      cancelable: true
    });
    window.dispatchEvent(event);
  };
  const BREAKPOINTS = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536
  };
  const BREAKPOINTS_MAP = new Map(Object.entries(BREAKPOINTS).sort((a, b) => a[1] - b[1]));
  const _BreakpointsController = class _BreakpointsController {
    constructor() {
      this.currentKey = this.getKeyForWidth(window.innerWidth);
      this.mediaQueries = /* @__PURE__ */ new Map();
      this.onChange = this.onChange.bind(this);
      BREAKPOINTS_MAP.forEach((minWidth, key) => {
        const query = window.matchMedia(`(min-width: ${minWidth}px)`);
        query.addEventListener("change", this.onChange);
        this.mediaQueries.set(key, { minWidth, query });
      });
    }
    destroy() {
      this.mediaQueries.forEach(({ query }) => {
        query.removeEventListener("change", this.onChange);
      });
    }
    /**
     * Returns the key for one of the BREAKPOINTS_MAP, whichever has a value closest to but smaller to the passed in width
     * e.g. If we pass in a width between 'sm' and 'md', this will return 'sm'
     *
     * @param {number} w - width to search for
     * @return {undefined|string} foundKey
     */
    getKeyForWidth(w) {
      let foundKey = void 0;
      for (const [key, breakpoint] of BREAKPOINTS_MAP) {
        if (w >= breakpoint) {
          foundKey = key;
        } else {
          break;
        }
      }
      return foundKey;
    }
    onChange() {
      const oldKey = this.currentKey;
      const newKey = this.getKeyForWidth(window.innerWidth);
      if (oldKey !== newKey) {
        const breakpoint = this.mediaQueries.get(newKey).minWidth;
        const fromBreakpoint = this.mediaQueries.get(oldKey).minWidth;
        const direction = window.innerWidth > this.mediaQueries.get(oldKey).minWidth ? 1 : -1;
        dispatch(_BreakpointsController.EVENTS.CHANGE, {
          breakpoint,
          fromBreakpoint,
          direction
        });
        this.currentKey = newKey;
      }
    }
  };
  _BreakpointsController.EVENTS = {
    CHANGE: "change.breakpointsController"
  };
  let BreakpointsController = _BreakpointsController;
  function startCase(str) {
    if (!str || typeof str !== "string") return "";
    return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[^a-zA-Z0-9]+/g, " ").split(" ").filter((word) => word.length > 0).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  }
  function getAppString(key, fallback = "") {
    return window.app?.strings?.[key] || fallback;
  }
  function isObject$1(value) {
    const type = typeof value;
    return value != null && (type === "object" || type === "function");
  }
  function isThemeEditor() {
    return window.Shopify?.designMode ?? false;
  }
  function getQueryParams() {
    const queryParams = {};
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Array.from(params.entries())) {
      queryParams[key] = value || true;
    }
    return queryParams;
  }
  function postLink(t, e = {}) {
    const n = (e = e || {}).method || "post";
    const i = e.parameters || {};
    const o = document.createElement("form");
    for (const r in o.setAttribute("method", n), o.setAttribute("action", t), i) {
      const l = document.createElement("input");
      l.setAttribute("type", "hidden");
      l.setAttribute("name", r);
      l.setAttribute("value", i[r]);
      o.appendChild(l);
    }
    document.body.appendChild(o);
    o.submit();
    document.body.removeChild(o);
  }
  function clamp$1(num, a, b) {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
  }
  function targetBlankExternalLinks() {
    document.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && link.hostname !== location.hostname && !href.includes("mailto:")) {
        link.target = "_blank";
        link.setAttribute("aria-describedby", "a11y-new-window-message");
      }
    });
  }
  function isNumber$1(value) {
    return typeof value === "number" && !isNaN(value);
  }
  const isTouch = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };
  const SELECTOR = "img.lazy-image";
  const LOADED_CLASS = "is-loaded";
  const CACHED_CLASS = "is-cached";
  class LazyImageController {
    /**
     * @param el - Element containing all images
     */
    constructor(el) {
      this.el = el;
      this.observedElements = /* @__PURE__ */ new WeakSet();
      this.imageObserver = new IntersectionObserver(this.onIntersection.bind(this), {
        rootMargin: "0px 0px 50% 0px"
      });
      this.mutationObserver = new MutationObserver(this.onMutation.bind(this));
      this.mutationObserver.observe(this.el, { childList: true, subtree: true });
      this.el.querySelectorAll(SELECTOR).forEach((img) => this.observeImage(img));
    }
    destroy() {
      this.imageObserver.disconnect();
      this.mutationObserver.disconnect();
    }
    unobserveImage(img) {
      if (!this.observedElements.has(img)) {
        return;
      }
      this.imageObserver.unobserve(img);
      this.observedElements.delete(img);
    }
    observeImage(img) {
      if (this.observedElements.has(img)) {
        return;
      }
      this.imageObserver.observe(img);
      this.observedElements.add(img);
    }
    onImageLoad(img) {
      img.classList.add(LOADED_CLASS);
    }
    onIntersection(entries, observer) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const loadHandler = () => {
            this.onImageLoad(img);
            img.removeEventListener("load", loadHandler);
          };
          if (img.complete) {
            loadHandler();
            img.classList.add(CACHED_CLASS);
          } else {
            img.addEventListener("load", loadHandler);
          }
          observer.unobserve(img);
        }
      });
    }
    onMutation(mutationsList) {
      const processNodes = (nodes, handler) => {
        nodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches && node.matches(SELECTOR)) {
            handler(node);
          } else {
            node.querySelectorAll(SELECTOR).forEach((img) => handler(img));
          }
        });
      };
      mutationsList.forEach((mutation) => {
        if (mutation.type === "childList") {
          processNodes(mutation.removedNodes, this.unobserveImage.bind(this));
          processNodes(mutation.addedNodes, this.observeImage.bind(this));
        }
      });
    }
  }
  const CartAPI = {
    EVENTS: {
      UPDATE: "cartAPI.update",
      ADD: "cartAPI.add",
      CHANGE: "cartAPI.change",
      // WHen a single item quantity is changed (not removed)
      REMOVE: "cartAPI.remove"
    },
    routes: window.app.routes,
    dispatch(eventName, cart) {
      dispatch(eventName, { cart });
    },
    /**
     * Retrieve a JSON respresentation of the users cart
     *
     */
    async getCart() {
      try {
        const response = await fetch(`${this.routes.cart_url}?view=json`, {
          method: "GET"
        });
        let data = await response.text();
        data = data.replace(/<\/?[^>]+>/gi, "");
        const cart = JSON.parse(data);
        return cart;
      } catch (e) {
        throw new Error(`Could not retrieve cart items: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    },
    /**
     * AJAX submit an 'add to cart' form
     *
     * https://shopify.dev/docs/api/ajax/reference/cart#post--locale-cart-addjs
     * @param form - The "add to cart" form to submit
     */
    async addItemFromForm(form) {
      try {
        const body = new FormData(form);
        const response = await fetch(`${this.routes.cart_add_url}.js`, {
          method: "POST",
          body,
          headers: {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest"
          }
        });
        if (!response.ok) {
          throw new Error("The quantity you entered is not available.");
        }
        const cart = await this.getCart();
        this.dispatch(CartAPI.EVENTS.UPDATE, cart);
        this.dispatch(CartAPI.EVENTS.ADD, cart);
        return cart;
      } catch (error) {
        throw new Error(error.message || "An error occurred while adding the item to the cart.");
      }
    },
    /**
     * Change the quantity of an item in the users cart
     * Item is specified by line_item key
     * https://shopify.dev/api/ajax/reference/cart#post-locale-cart-change-js
     *
     * @param key - Cart line item key // https://shopify.dev/docs/api/liquid/objects/line_item#line_item-key
     * @param qty - New quantity of the line item
     */
    async changeLineItemQuantity(key, qty) {
      try {
        const body = JSON.stringify({
          quantity: qty,
          id: key
        });
        const response = await fetch(`${this.routes.cart_change_url}.js`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body
        });
        if (!response.ok) {
          throw new Error("Something went wrong.");
        }
        const cart = await this.getCart();
        const EVENT = qty === 0 ? CartAPI.EVENTS.REMOVE : CartAPI.EVENTS.CHANGE;
        this.dispatch(EVENT, cart);
        this.dispatch(CartAPI.EVENTS.UPDATE, cart);
        return cart;
      } catch (error) {
        return Promise.reject({ message: error.message });
      }
    }
  };
  const THEME_EDITOR_BLOCK_ATTR = "data-shopify-editor-block";
  const _BaseComponent = class _BaseComponent {
    constructor(el, options = {}) {
      __privateAdd(this, _settings);
      __privateAdd(this, _resizeObserver);
      __privateAdd(this, _intersectionObserver);
      __privateAdd(this, _onBlockSelect, (e) => {
        if (e.target === this.el) {
          this.onSelfBlockSelect(e);
        }
      });
      __privateAdd(this, _onBlockDeselect, (e) => {
        if (e.target === this.el) {
          this.onSelfBlockDeselect(e);
        }
      });
      __privateSet(this, _settings, {
        watchResize: false,
        watchBreakpoint: false,
        watchScroll: false,
        watchCartUpdate: false,
        watchIntersection: false,
        intersectionOptions: {
          rootMargin: "0px",
          threshold: 0.01
        },
        ...options
      });
      __privateSet(this, _resizeObserver, null);
      __privateSet(this, _intersectionObserver, null);
      this.el = el;
      this.type = this.constructor.TYPE;
      this.validateDom(this.el);
      if (this.type === "base") {
        console.warn("BaseComponent should not be used directly");
      }
      this.onResize = this.onResize.bind(this);
      this.onIntersection = this.onIntersection.bind(this);
      this.onBreakpointChange = this.onBreakpointChange.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onCartUpdate = this.onCartUpdate.bind(this);
      this.onSelfBlockSelect = this.onSelfBlockSelect.bind(this);
      this.onSelfBlockDeselect = this.onSelfBlockDeselect.bind(this);
      if (__privateGet(this, _settings).watchResize) {
        __privateSet(this, _resizeObserver, new ResizeObserver((entries) => this.onResize(entries)));
        __privateGet(this, _resizeObserver).observe(this.el);
      }
      if (__privateGet(this, _settings).watchIntersection) {
        __privateSet(this, _intersectionObserver, new IntersectionObserver(this.onIntersection, __privateGet(this, _settings).intersectionOptions));
        __privateGet(this, _intersectionObserver).observe(this.el);
      }
      if (__privateGet(this, _settings).watchBreakpoint) {
        window.addEventListener(BreakpointsController.EVENTS.CHANGE, this.onBreakpointChange);
      }
      if (__privateGet(this, _settings).watchScroll) {
        window.addEventListener("scroll", this.onScroll);
      }
      if (__privateGet(this, _settings).watchCartUpdate) {
        window.addEventListener(CartAPI.EVENTS.UPDATE, this.onCartUpdate);
      }
      if (this.el.hasAttribute(THEME_EDITOR_BLOCK_ATTR)) {
        window.addEventListener("shopify:block:select", __privateGet(this, _onBlockSelect));
        window.addEventListener("shopify:block:deselect", __privateGet(this, _onBlockDeselect));
      }
    }
    static get SELECTOR() {
      return `[data-component="${this.TYPE}"]`;
    }
    destroy() {
      if (__privateGet(this, _resizeObserver)) {
        __privateGet(this, _resizeObserver).disconnect();
        __privateSet(this, _resizeObserver, null);
      }
      if (__privateGet(this, _intersectionObserver)) {
        __privateGet(this, _intersectionObserver).disconnect();
        __privateSet(this, _intersectionObserver, null);
      }
      if (__privateGet(this, _settings).watchBreakpoint) {
        window.removeEventListener(BreakpointsController.EVENTS.CHANGE, this.onBreakpointChange);
      }
      if (__privateGet(this, _settings).watchScroll) {
        window.removeEventListener("scroll", this.onScroll);
      }
      if (__privateGet(this, _settings).watchCartUpdate) {
        window.removeEventListener(CartAPI.EVENTS.UPDATE, this.onCartUpdate);
      }
      if (this.el.hasAttribute(THEME_EDITOR_BLOCK_ATTR)) {
        window.removeEventListener("shopify:block:select", __privateGet(this, _onBlockSelect));
        window.removeEventListener("shopify:block:deselect", __privateGet(this, _onBlockDeselect));
      }
      doComponentCleanup(this);
    }
    get dataset() {
      return this.el.dataset;
    }
    get isAriaHidden() {
      return this.el.getAttribute("aria-hidden") === "true";
    }
    get ariaControlElements() {
      return [...document.querySelectorAll(`[aria-controls="${this.el.id}"]`)];
    }
    /**
     * Queries for the first element matching the given selector within the component's element,
     * excluding elements that belong to nested components.
     * 
     * @param selector - The CSS selector to query for an element.
     * @param dom - The DOM element to query within.  Defaults to the component's element.
     * @returns The first matching Element object within the component's scope, or undefined if no match is found.
     */
    qs(selector2, dom = this.el) {
      return this.qsa(selector2, dom)[0];
    }
    /**
     * Queries for all elements matching the given selector within the component's element,
     * excluding elements that belong to nested components.
     * 
     * @param selector - The CSS selector to query for elements
     * @param dom - The DOM element to query within. Defaults to the component's element
     * @returns An array of matching Element objects within the component's scope
     * 
     * @description
     * This method filters out elements that belong to nested components by checking if the
     * closest parent component is either the querying component itself or matches the
     * selector (which would make it a target of the query rather than a container to exclude).
     */
    qsa(selector2, dom = this.el) {
      return Array.from(dom.querySelectorAll(selector2)).filter((el) => {
        const closest = el.closest("[data-component]");
        return closest.isSameNode(this.el) || closest.matches(selector2);
      });
    }
    // Make sure we're working with a DOM element that matches the component selector
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateDom(dom) {
      if (dom instanceof HTMLElement && dom.matches(this.constructor.SELECTOR)) {
        return true;
      }
      console.warn(`[${this.type}] Invalid DOM: Must be an Element matching the component selector`);
      return false;
    }
    onResize(entries) {
    }
    onIntersection(entries) {
    }
    onBreakpointChange(e) {
    }
    onScroll() {
    }
    onCartUpdate(e) {
    }
    /**
     * Called if this component's block is selected in the theme editor
     * @param e - The event object
     */
    onSelfBlockSelect(e) {
    }
    /**
     * Called if this component's block is deselected in the theme editor
     * @param e - The event object
     */
    onSelfBlockDeselect(e) {
    }
  };
  _settings = new WeakMap();
  _resizeObserver = new WeakMap();
  _intersectionObserver = new WeakMap();
  _onBlockSelect = new WeakMap();
  _onBlockDeselect = new WeakMap();
  _BaseComponent.TYPE = "base";
  let BaseComponent = _BaseComponent;
  const doComponentCleanup = (instance2) => {
    if (!isObject$1(instance2)) {
      return;
    }
    Object.values(instance2).forEach((value) => {
      if (value instanceof BaseComponent) {
        value.destroy();
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item instanceof BaseComponent) {
            item.destroy();
          }
        });
      }
    });
  };
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function setAriaCurrent(link, currentPath) {
    if (!(link instanceof HTMLAnchorElement)) {
      console.warn("Invalid link element provided.");
      return;
    }
    if (typeof currentPath !== "string") {
      console.warn("Current path must be a string.");
      return;
    }
    if (!link.href) return;
    const isExactMatch = link.pathname === currentPath;
    if (isExactMatch) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
  function toAriaBoolean(value) {
    return value ? "true" : "false";
  }
  const classes$6 = {
    isReady: "is-ready"
  };
  const _GraphicCoverVideo = class _GraphicCoverVideo extends BaseComponent {
    constructor(el) {
      super(el, {
        watchIntersection: true
      });
      this.autoPlayEnabled = prefersReducedMotion() ? false : true;
      this.video = this.qs("video");
      this.inView = false;
      if (!this.video) {
        console.warn("No video found");
        return;
      }
      this.video.addEventListener("canplay", this.onCanPlay.bind(this));
      this.video.addEventListener("play", this.onPlay.bind(this));
      this.video.addEventListener("playing", this.onPlay.bind(this));
      this.video.addEventListener("pause", this.onPause.bind(this));
      this.video.addEventListener("error", this.onError.bind(this));
    }
    get isPlaying() {
      return this.video && !this.video.paused;
    }
    async attemptPlay() {
      if (this.isPlaying) {
        this.onPlay();
        return;
      }
      try {
        await this.video.play();
        if (!this.isPlaying) {
          throw new Error("Autoplay resolved but not advancing (likely blocked)");
        }
      } catch (e) {
        console.warn("Autoplay blocked or failed:", e);
      }
    }
    togglePlay() {
      if (this.isPlaying) {
        this.video.pause();
      } else {
        this.attemptPlay();
      }
    }
    onCanPlay() {
      if (this.inView && !this.isPlaying && this.autoPlayEnabled) {
        this.attemptPlay();
      }
    }
    onPlay() {
      this.video.classList.add(classes$6.isReady);
    }
    onPause() {
    }
    onError(e) {
      console.warn("Video error", e);
      this.video.style.display = "none";
    }
    async onVisibilityChange(visible = false) {
      this.inView = visible;
      if (this.inView) {
        this.video.preload = "auto";
        if (!this.autoPlayEnabled) return;
        await this.attemptPlay();
      } else {
        this.video.pause();
        this.video.preload = "metadata";
      }
    }
    onIntersection(entries) {
      this.onVisibilityChange(entries[0].isIntersecting);
    }
  };
  _GraphicCoverVideo.TYPE = "graphic-cover-video";
  let GraphicCoverVideo = _GraphicCoverVideo;
  class BaseSection {
    #settings;
    #intersectionObserver;
    constructor(container, options = {}) {
      this.#settings = {
        watchIntersection: false,
        intersectionOptions: {
          rootMargin: "0px",
          threshold: 0.01
        },
        ...options
      };
      this.#intersectionObserver = null;
      this.container = container;
      this.id = this.dataset.sectionId;
      this.type = this.constructor.TYPE;
      this.parent = this.container.parentElement;
      this.parentId = this.parent.id;
      if (!this.id) {
        console.warn("Section ID not found", this);
      }
      this.onNavigateOut = this.onNavigateOut.bind(this);
      this.onNavigateIn = this.onNavigateIn.bind(this);
      this.onNavigateEnd = this.onNavigateEnd.bind(this);
      this.onIntersection = this.onIntersection.bind(this);
      window.addEventListener("taxi.navigateOut", this.onNavigateOut);
      window.addEventListener("taxi.navigateIn", this.onNavigateIn);
      window.addEventListener("taxi.navigateEnd", this.onNavigateEnd);
      if (this.#settings.watchIntersection) {
        this.#intersectionObserver = new IntersectionObserver(this.onIntersection, this.#settings.intersectionOptions);
        this.#intersectionObserver.observe(this.container);
      }
      this.lazyImageController = new LazyImageController(this.container);
      this.graphicCoverVideos = this.qsa(GraphicCoverVideo.SELECTOR).map((el) => {
        return new GraphicCoverVideo(el);
      });
    }
    get dataset() {
      return this.container.dataset;
    }
    /**
     * Query selector helper that returns the first matching element within the section container
     * @param {string} selector - CSS selector string
     * @param {HTMLElement} [dom=this.container] - Parent element to query within (defaults to section container)
     * @returns {HTMLElement|undefined} First matching element or undefined if none found
     */
    qs(selector2, dom = this.container) {
      return this.qsa(selector2, dom)[0];
    }
    /**
     * Query selector all helper that returns an array of matching elements within the section container,
     * filtering out nested components that match the selector.
     * 
     * @param {string} selector - CSS selector string to match elements
     * @param {HTMLElement} [dom=this.container] - Parent element to query within (defaults to section container)
     * @returns {HTMLElement[]} Array of matching elements, excluding nested component matches
     *
     */
    qsa(selector2, dom = this.container) {
      return Array.from(dom.querySelectorAll(selector2)).filter((el) => {
        const closest = el.closest("[data-component]");
        return !closest || closest.isSameNode(el);
      });
    }
    onIntersection(entries) {
    }
    stopIntersectionObserver() {
      this.#intersectionObserver?.disconnect();
      this.#intersectionObserver = null;
    }
    /**
     * Called before the page transition begins to allow sections to run their own exit animations.
     * This method is awaited by the page transition system, so any async animations or cleanup
     * can delay the start of the main page transition until they complete.
     * 
     * the `transitionDuration` parameter is included to allow sections to sync their animations with the main page transition.
     * 
     * @param {number} transitionDuration - Duration of the main page transition in seconds
     * @returns {Promise<void>} Promise that resolves when section exit animations are complete
     *
     */
    async onRendererLeaveStart(transitionDuration) {
    }
    onUnload(e) {
      window.removeEventListener("taxi.navigateOut", this.onNavigateOut);
      window.removeEventListener("taxi.navigateIn", this.onNavigateIn);
      window.removeEventListener("taxi.navigateEnd", this.onNavigateEnd);
      this.lazyImageController.destroy();
      this.#intersectionObserver?.disconnect();
      doComponentCleanup(this);
    }
    onSectionSelect(e) {
    }
    onSectionDeselect(e) {
    }
    onSectionReorder(e) {
    }
    onBlockSelect(e) {
    }
    onBlockDeselect(e) {
    }
    onNavigateOut(e) {
    }
    onNavigateIn(e) {
    }
    onNavigateEnd(e) {
    }
  }
  const SECTION_TYPE_ATTR = "data-section-type";
  const THEME_EDITOR_EVENTS = [
    "shopify:section:load",
    "shopify:section:unload",
    "shopify:section:select",
    "shopify:section:deselect",
    "shopify:section:reorder",
    "shopify:block:select",
    "shopify:block:deselect"
    // Not hooking these up just yet....
    // 'shopify:inspector:activate',
    // 'shopify:inspector:deactivate',
  ];
  function getEventHandlerName(eventName) {
    const name = eventName.split(":").splice(1).map(startCase).join("");
    return `on${name}`;
  }
  class SectionManager {
    constructor() {
      this.constructors = {};
      this.instances = [];
      THEME_EDITOR_EVENTS.forEach((ev) => {
        const handlerName = getEventHandlerName(ev);
        if (this[handlerName]) {
          this[handlerName] = this[handlerName].bind(this);
        }
      });
      this.attachEvents();
    }
    destroy() {
      this.instances.forEach((section) => section.onUnload?.call(section));
      this.instances = [];
      this.removeEvents();
    }
    attachEvents() {
      if (!isThemeEditor()) return;
      THEME_EDITOR_EVENTS.forEach((ev) => {
        const handler = this[getEventHandlerName(ev)];
        if (handler) {
          window.document.addEventListener(ev, handler.bind(this));
        }
      });
    }
    removeEvents() {
      THEME_EDITOR_EVENTS.forEach((ev) => {
        const handler = this[getEventHandlerName(ev)];
        if (handler) {
          window.document.removeEventListener(ev, handler);
        }
      });
    }
    getInstanceById(id) {
      return this.instances.find((instance2) => instance2.id === id);
    }
    getSingleInstance(type) {
      return this.instances.find((instance2) => instance2.type === type);
    }
    load(container, constructor) {
      const type = container.getAttribute(SECTION_TYPE_ATTR);
      const Konstructor = constructor || this.constructors[type];
      if (typeof Konstructor === "undefined") {
        return;
      }
      const instance2 = new Konstructor(container);
      this.instances.push(instance2);
    }
    unload(id) {
      const index = this.instances.findIndex((instance2) => instance2.id === id);
      if (index !== -1) {
        this.instances.splice(index, 1);
      }
    }
    register(constructor) {
      if (!(constructor.prototype instanceof BaseSection)) {
        return;
      }
      const { TYPE } = constructor;
      if (!TYPE) {
        console.warn('Missing static "TYPE" property for constructor ', constructor);
        return;
      }
      if (this.constructors[TYPE]) {
        console.warn(`Constructor of type "${TYPE}" has already been registered`);
        return;
      }
      this.constructors[TYPE] = constructor;
      document.querySelectorAll(`[${SECTION_TYPE_ATTR}="${TYPE}"]`).forEach((container) => {
        this.load(container, constructor);
      });
    }
    // Generic event is a non section:{load/unload} event
    // Simply triggers the appropriate instance method if available
    onGenericEvent(e, func) {
      const instance2 = this.getInstanceById(e.detail.sectionId);
      if (instance2 && typeof instance2[func] === "function") {
        instance2[func].call(instance2, e);
      }
    }
    onSectionLoad(e) {
      const container = e.target.querySelector(`[${SECTION_TYPE_ATTR}]`);
      if (container) {
        this.load(container);
      }
    }
    onSectionUnload(e) {
      const instance2 = this.getInstanceById(e.detail.sectionId);
      if (!instance2) {
        return;
      }
      instance2.onUnload(e);
      this.unload(e.detail.sectionId);
    }
    onSectionSelect(e) {
      this.onGenericEvent(e, "onSectionSelect");
    }
    onSectionDeselect(e) {
      this.onGenericEvent(e, "onSectionDeselect");
    }
    onSectionReorder(e) {
      this.onGenericEvent(e, "onSectionReorder");
    }
    onBlockSelect(e) {
      this.onGenericEvent(e, "onBlockSelect");
    }
    onBlockDeselect(e) {
      this.onGenericEvent(e, "onBlockDeselect");
    }
  }
  const _ProductCard = class _ProductCard extends BaseComponent {
    constructor(el) {
      super(el);
    }
  };
  _ProductCard.TYPE = "product-card";
  let ProductCard = _ProductCard;
  const _FeaturedProductsSection = class _FeaturedProductsSection extends BaseSection {
    constructor(container) {
      super(container);
      this.productCards = this.qsa(ProductCard.SELECTOR).map((el) => new ProductCard(el));
    }
  };
  _FeaturedProductsSection.TYPE = "featured-products";
  let FeaturedProductsSection = _FeaturedProductsSection;
  const selectors$h = {
    toggleNew: "[data-toggle-new]",
    newForm: "[data-new]",
    toggleForm: "[data-toggle-form]",
    deleteAddress: "[data-delete-address]"
  };
  function toggle(el) {
    if (el.style.display == "none") {
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  }
  const _AddressesSection = class _AddressesSection extends BaseSection {
    constructor(container) {
      super(container);
      this.newForm = this.qs(selectors$h.newForm);
      this.container.addEventListener("click", (e) => {
        const target = e.target;
        if (target.matches(selectors$h.toggleNew)) {
          e.preventDefault();
          toggle(this.newForm);
          return;
        }
        if (target.matches(selectors$h.toggleForm)) {
          e.preventDefault();
          toggle(this.qs(`#edit-address-${target.dataset.id}`));
          return;
        }
        if (target.matches(selectors$h.deleteAddress)) {
          e.preventDefault();
          const id = target.dataset.id;
          if (confirm("Are you sure you wish to delete this address?")) {
            postLink("/account/addresses/" + id, { "parameters": { "_method": "delete" } });
          }
          return;
        }
      });
      new window.Shopify.CountryProvinceSelector("address-country-new", "address-province-new", {
        hideElement: "address-province-container-new"
      });
      this.qsa("[data-address-form]").forEach((el) => {
        const id = el.dataset.id;
        new window.Shopify.CountryProvinceSelector(`address-country-${id}`, `address-province-${id}`, {
          hideElement: `address-province-container-${id}`
        });
      });
    }
  };
  _AddressesSection.TYPE = "addresses";
  let AddressesSection = _AddressesSection;
  const _ArticleSection = class _ArticleSection extends BaseSection {
    constructor(container) {
      super(container);
    }
  };
  _ArticleSection.TYPE = "article";
  let ArticleSection = _ArticleSection;
  const _BlogSection = class _BlogSection extends BaseSection {
    constructor(container) {
      super(container);
    }
  };
  _BlogSection.TYPE = "blog";
  let BlogSection = _BlogSection;
  const isElement = (object) => {
    if (!object || typeof object !== "object") {
      return false;
    }
    return object instanceof Element || object instanceof Document;
  };
  const isDisabled = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains("disabled")) {
      return true;
    }
    if ("disabled" in element) {
      return element.disabled;
    }
    return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
  };
  const isVisible = (element) => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
    const closedDetails = element.closest("details:not([open])");
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest("summary");
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  const getFocusableChildren = (element) => {
    const focusables = [
      "a[href]",
      "button",
      "input",
      "textarea",
      "select",
      "details",
      '[tabindex]:not([tabindex^="-"])',
      '[contenteditable="true"]'
    ].join(",");
    const children = Array.from(element.querySelectorAll(focusables));
    return children.filter((el) => !isDisabled(el) && isVisible(el));
  };
  const getDomFromString = (string) => {
    return new DOMParser().parseFromString(string, "text/html");
  };
  const fetchDom = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const responseText = await response.text();
      const dom = getDomFromString(responseText);
      return dom;
    } catch (e) {
      console.warn("something went wrong...", e);
      return void 0;
    }
  };
  function _assertThisInitialized(self2) {
    if (self2 === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self2;
  }
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  /*!
   * GSAP 3.12.7
   * https://gsap.com
   *
   * @license Copyright 2008-2025, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license or for
   * Club GSAP members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */
  var _config = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: {
      lineHeight: ""
    }
  }, _defaults = {
    duration: 0.5,
    overwrite: false,
    delay: 0
  }, _suppressOverwrites, _reverting$1, _context, _bigNum$2 = 1e8, _tinyNum = 1 / _bigNum$2, _2PI = Math.PI * 2, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt$1 = Math.sqrt, _cos$1 = Math.cos, _sin$1 = Math.sin, _isString = function _isString2(value) {
    return typeof value === "string";
  }, _isFunction = function _isFunction2(value) {
    return typeof value === "function";
  }, _isNumber$1 = function _isNumber2(value) {
    return typeof value === "number";
  }, _isUndefined = function _isUndefined2(value) {
    return typeof value === "undefined";
  }, _isObject = function _isObject2(value) {
    return typeof value === "object";
  }, _isNotFalse = function _isNotFalse2(value) {
    return value !== false;
  }, _windowExists$1 = function _windowExists2() {
    return typeof window !== "undefined";
  }, _isFuncOrString = function _isFuncOrString2(value) {
    return _isFunction(value) || _isString(value);
  }, _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
  }, _isArray = Array.isArray, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp$1 = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, _globalTimeline, _win$1, _coreInitted$1, _doc$1, _globals = {}, _installScope = {}, _coreReady, _install = function _install2(scope) {
    return (_installScope = _merge(scope, _globals)) && gsap$1;
  }, _missingPlugin = function _missingPlugin2(property, value) {
    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
  }, _warn = function _warn2(message, suppress) {
    return !suppress && console.warn(message);
  }, _addGlobal = function _addGlobal2(name, obj) {
    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
  }, _emptyFunc = function _emptyFunc2() {
    return 0;
  }, _startAtRevertConfig = {
    suppressEvents: true,
    isStart: true,
    kill: false
  }, _revertConfigNoKill = {
    suppressEvents: true,
    kill: false
  }, _revertConfig = {
    suppressEvents: true
  }, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _lastRenderedFrame, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = function _harness2(targets) {
    var target = targets[0], harnessPlugin, i;
    _isObject(target) || _isFunction(target) || (targets = [targets]);
    if (!(harnessPlugin = (target._gsap || {}).harness)) {
      i = _harnessPlugins.length;
      while (i-- && !_harnessPlugins[i].targetTest(target)) {
      }
      harnessPlugin = _harnessPlugins[i];
    }
    i = targets.length;
    while (i--) {
      targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
    }
    return targets;
  }, _getCache = function _getCache2(target) {
    return target._gsap || _harness(toArray(target))[0]._gsap;
  }, _getProperty = function _getProperty2(target, property, v) {
    return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
  }, _forEachName = function _forEachName2(names, func) {
    return (names = names.split(",")).forEach(func) || names;
  }, _round$2 = function _round2(value) {
    return Math.round(value * 1e5) / 1e5 || 0;
  }, _roundPrecise = function _roundPrecise2(value) {
    return Math.round(value * 1e7) / 1e7 || 0;
  }, _parseRelative = function _parseRelative2(start, value) {
    var operator = value.charAt(0), end = parseFloat(value.substr(2));
    start = parseFloat(start);
    return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
  }, _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
    var l = toFind.length, i = 0;
    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
    }
    return i < l;
  }, _lazyRender = function _lazyRender2() {
    var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
    _lazyLookup = {};
    _lazyTweens.length = 0;
    for (i = 0; i < l; i++) {
      tween = a[i];
      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
    }
  }, _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
    _lazyTweens.length && !_reverting$1 && _lazyRender();
    animation.render(time, suppressEvents, _reverting$1 && time < 0 && (animation._initted || animation._startAt));
    _lazyTweens.length && !_reverting$1 && _lazyRender();
  }, _numericIfPossible = function _numericIfPossible2(value) {
    var n = parseFloat(value);
    return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
  }, _passThrough = function _passThrough2(p) {
    return p;
  }, _setDefaults = function _setDefaults2(obj, defaults) {
    for (var p in defaults) {
      p in obj || (obj[p] = defaults[p]);
    }
    return obj;
  }, _setKeyframeDefaults = function _setKeyframeDefaults2(excludeDuration) {
    return function(obj, defaults) {
      for (var p in defaults) {
        p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults[p]);
      }
    };
  }, _merge = function _merge2(base, toMerge) {
    for (var p in toMerge) {
      base[p] = toMerge[p];
    }
    return base;
  }, _mergeDeep = function _mergeDeep2(base, toMerge) {
    for (var p in toMerge) {
      p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
    }
    return base;
  }, _copyExcluding = function _copyExcluding2(obj, excluding) {
    var copy = {}, p;
    for (p in obj) {
      p in excluding || (copy[p] = obj[p]);
    }
    return copy;
  }, _inheritDefaults = function _inheritDefaults2(vars) {
    var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
    if (_isNotFalse(vars.inherit)) {
      while (parent) {
        func(vars, parent.vars.defaults);
        parent = parent.parent || parent._dp;
      }
    }
    return vars;
  }, _arraysMatch = function _arraysMatch2(a1, a2) {
    var i = a1.length, match = i === a2.length;
    while (match && i-- && a1[i] === a2[i]) {
    }
    return i < 0;
  }, _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
    var prev = parent[lastProp], t;
    if (sortBy) {
      t = child[sortBy];
      while (prev && prev[sortBy] > t) {
        prev = prev._prev;
      }
    }
    if (prev) {
      child._next = prev._next;
      prev._next = child;
    } else {
      child._next = parent[firstProp];
      parent[firstProp] = child;
    }
    if (child._next) {
      child._next._prev = child;
    } else {
      parent[lastProp] = child;
    }
    child._prev = prev;
    child.parent = child._dp = parent;
    return child;
  }, _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }
    if (lastProp === void 0) {
      lastProp = "_last";
    }
    var prev = child._prev, next = child._next;
    if (prev) {
      prev._next = next;
    } else if (parent[firstProp] === child) {
      parent[firstProp] = next;
    }
    if (next) {
      next._prev = prev;
    } else if (parent[lastProp] === child) {
      parent[lastProp] = prev;
    }
    child._next = child._prev = child.parent = null;
  }, _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
    child._act = 0;
  }, _uncache = function _uncache2(animation, child) {
    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
      var a = animation;
      while (a) {
        a._dirty = 1;
        a = a.parent;
      }
    }
    return animation;
  }, _recacheAncestors = function _recacheAncestors2(animation) {
    var parent = animation.parent;
    while (parent && parent.parent) {
      parent._dirty = 1;
      parent.totalDuration();
      parent = parent.parent;
    }
    return animation;
  }, _rewindStartAt = function _rewindStartAt2(tween, totalTime, suppressEvents, force) {
    return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
  }, _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
    return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
  }, _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
  }, _animationCycle = function _animationCycle2(tTime, cycleDuration) {
    var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
    return tTime && whole === tTime ? whole - 1 : whole;
  }, _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
  }, _setEnd = function _setEnd2(animation) {
    return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
  }, _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
    var parent = animation._dp;
    if (parent && parent.smoothChildTiming && animation._ts) {
      animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
      _setEnd(animation);
      parent._dirty || _uncache(parent, animation);
    }
    return animation;
  }, _postAddChecks = function _postAddChecks2(timeline, child) {
    var t;
    if (child._time || !child._dur && child._initted || child._start < timeline._time && (child._dur || !child.add)) {
      t = _parentToChildTotalTime(timeline.rawTime(), child);
      if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
        child.render(t, true);
      }
    }
    if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
      if (timeline._dur < timeline.duration()) {
        t = timeline;
        while (t._dp) {
          t.rawTime() >= 0 && t.totalTime(t._tTime);
          t = t._dp;
        }
      }
      timeline._zTime = -_tinyNum;
    }
  }, _addToTimeline = function _addToTimeline2(timeline, child, position, skipChecks) {
    child.parent && _removeFromParent(child);
    child._start = _roundPrecise((_isNumber$1(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
    child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
    _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);
    _isFromOrFromStart(child) || (timeline._recent = child);
    skipChecks || _postAddChecks(timeline, child);
    timeline._ts < 0 && _alignPlayhead(timeline, timeline._tTime);
    return timeline;
  }, _scrollTrigger = function _scrollTrigger2(animation, trigger) {
    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
  }, _attemptInitTween = function _attemptInitTween2(tween, time, force, suppressEvents, tTime) {
    _initTween(tween, time, tTime);
    if (!tween._initted) {
      return 1;
    }
    if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
      _lazyTweens.push(tween);
      tween._lazy = [tTime, suppressEvents];
      return 1;
    }
  }, _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
    var parent = _ref.parent;
    return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
  }, _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
    var data = _ref2.data;
    return data === "isFromStart" || data === "isStart";
  }, _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
    var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
    if (repeatDelay && tween._repeat) {
      tTime = _clamp(0, tween._tDur, totalTime);
      iteration = _animationCycle(tTime, repeatDelay);
      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
      if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
        prevRatio = 1 - ratio;
        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
      }
    }
    if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
        return;
      }
      prevIteration = tween._zTime;
      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
      suppressEvents || (suppressEvents = totalTime && !prevIteration);
      tween.ratio = ratio;
      tween._from && (ratio = 1 - ratio);
      tween._time = 0;
      tween._tTime = tTime;
      pt = tween._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
      tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
      tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
        ratio && _removeFromParent(tween, 1);
        if (!suppressEvents && !_reverting$1) {
          _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
          tween._prom && tween._prom();
        }
      }
    } else if (!tween._zTime) {
      tween._zTime = totalTime;
    }
  }, _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
    var child;
    if (time > prevTime) {
      child = animation._first;
      while (child && child._start <= time) {
        if (child.data === "isPause" && child._start > prevTime) {
          return child;
        }
        child = child._next;
      }
    } else {
      child = animation._last;
      while (child && child._start >= time) {
        if (child.data === "isPause" && child._start < prevTime) {
          return child;
        }
        child = child._prev;
      }
    }
  }, _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
    var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
    animation._dur = dur;
    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
    totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
    animation.parent && _setEnd(animation);
    skipUncache || _uncache(animation.parent, animation);
    return animation;
  }, _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
  }, _zeroPosition = {
    _start: 0,
    endTime: _emptyFunc,
    totalDuration: _emptyFunc
  }, _parsePosition = function _parsePosition2(animation, position, percentAnimation) {
    var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum$2 ? recent.endTime(false) : animation._dur, i, offset, isPercent;
    if (_isString(position) && (isNaN(position) || position in labels)) {
      offset = position.charAt(0);
      isPercent = position.substr(-1) === "%";
      i = position.indexOf("=");
      if (offset === "<" || offset === ">") {
        i >= 0 && (position = position.replace(/=/, ""));
        return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
      }
      if (i < 0) {
        position in labels || (labels[position] = clippedDuration);
        return labels[position];
      }
      offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
      if (isPercent && percentAnimation) {
        offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
      }
      return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
    }
    return position == null ? clippedDuration : +position;
  }, _createTweenType = function _createTweenType2(type, params, timeline) {
    var isLegacy = _isNumber$1(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
    isLegacy && (vars.duration = params[1]);
    vars.parent = timeline;
    if (type) {
      irVars = vars;
      parent = timeline;
      while (parent && !("immediateRender" in irVars)) {
        irVars = parent.vars.defaults || {};
        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
      }
      vars.immediateRender = _isNotFalse(irVars.immediateRender);
      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
    }
    return new Tween(params[0], vars, params[varsIndex + 1]);
  }, _conditionalReturn = function _conditionalReturn2(value, func) {
    return value || value === 0 ? func(value) : func;
  }, _clamp = function _clamp2(min, max, value) {
    return value < min ? min : value > max ? max : value;
  }, getUnit = function getUnit2(value, v) {
    return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
  }, clamp = function clamp2(min, max, value) {
    return _conditionalReturn(value, function(v) {
      return _clamp(min, max, v);
    });
  }, _slice = [].slice, _isArrayLike = function _isArrayLike2(value, nonEmpty) {
    return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win$1;
  }, _flatten = function _flatten2(ar, leaveStrings, accumulator) {
    if (accumulator === void 0) {
      accumulator = [];
    }
    return ar.forEach(function(value) {
      var _accumulator;
      return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
    }) || accumulator;
  }, toArray = function toArray2(value, scope, leaveStrings) {
    return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted$1 || !_wake()) ? _slice.call((scope || _doc$1).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
  }, selector = function selector2(value) {
    value = toArray(value)[0] || _warn("Invalid scope") || {};
    return function(v) {
      var el = value.current || value.nativeElement || value;
      return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$1.createElement("div") : value);
    };
  }, shuffle = function shuffle2(a) {
    return a.sort(function() {
      return 0.5 - Math.random();
    });
  }, distribute = function distribute2(v) {
    if (_isFunction(v)) {
      return v;
    }
    var vars = _isObject(v) ? v : {
      each: v
    }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
    if (_isString(from)) {
      ratioX = ratioY = {
        center: 0.5,
        edges: 0.5,
        end: 1
      }[from] || 0;
    } else if (!isDecimal && ratios) {
      ratioX = from[0];
      ratioY = from[1];
    }
    return function(i, target, a) {
      var l = (a || vars).length, distances = cache[l], originX, originY, x, y, d, j, max, min, wrapAt;
      if (!distances) {
        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$2])[1];
        if (!wrapAt) {
          max = -_bigNum$2;
          while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
          }
          wrapAt < l && wrapAt--;
        }
        distances = cache[l] = [];
        originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
        originY = wrapAt === _bigNum$2 ? 0 : ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
        max = 0;
        min = _bigNum$2;
        for (j = 0; j < l; j++) {
          x = j % wrapAt - originX;
          y = originY - (j / wrapAt | 0);
          distances[j] = d = !axis ? _sqrt$1(x * x + y * y) : Math.abs(axis === "y" ? y : x);
          d > max && (max = d);
          d < min && (min = d);
        }
        from === "random" && shuffle(distances);
        distances.max = max - min;
        distances.min = min;
        distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
        distances.b = l < 0 ? base - l : base;
        distances.u = getUnit(vars.amount || vars.each) || 0;
        ease = ease && l < 0 ? _invertEase(ease) : ease;
      }
      l = (distances[i] - distances.min) / distances.max || 0;
      return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
    };
  }, _roundModifier = function _roundModifier2(v) {
    var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
    return function(raw) {
      var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
      return (n - n % 1) / p + (_isNumber$1(raw) ? 0 : getUnit(raw));
    };
  }, snap = function snap2(snapTo, value) {
    var isArray = _isArray(snapTo), radius, is2D;
    if (!isArray && _isObject(snapTo)) {
      radius = isArray = snapTo.radius || _bigNum$2;
      if (snapTo.values) {
        snapTo = toArray(snapTo.values);
        if (is2D = !_isNumber$1(snapTo[0])) {
          radius *= radius;
        }
      } else {
        snapTo = _roundModifier(snapTo.increment);
      }
    }
    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
      is2D = snapTo(raw);
      return Math.abs(is2D - raw) <= radius ? is2D : raw;
    } : function(raw) {
      var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum$2, closest = 0, i = snapTo.length, dx, dy;
      while (i--) {
        if (is2D) {
          dx = snapTo[i].x - x;
          dy = snapTo[i].y - y;
          dx = dx * dx + dy * dy;
        } else {
          dx = Math.abs(snapTo[i] - x);
        }
        if (dx < min) {
          min = dx;
          closest = i;
        }
      }
      closest = !radius || min <= radius ? snapTo[closest] : raw;
      return is2D || closest === raw || _isNumber$1(raw) ? closest : closest + getUnit(raw);
    });
  }, random = function random2(min, max, roundingIncrement, returnFunction) {
    return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
      return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
    });
  }, pipe = function pipe2() {
    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
      functions[_key] = arguments[_key];
    }
    return function(value) {
      return functions.reduce(function(v, f) {
        return f(v);
      }, value);
    };
  }, unitize = function unitize2(func, unit) {
    return function(value) {
      return func(parseFloat(value)) + (unit || getUnit(value));
    };
  }, normalize = function normalize2(min, max, value) {
    return mapRange(min, max, 0, 1, value);
  }, _wrapArray = function _wrapArray2(a, wrapper, value) {
    return _conditionalReturn(value, function(index) {
      return a[~~wrapper(index)];
    });
  }, wrap = function wrap2(min, max, value) {
    var range = max - min;
    return _isArray(min) ? _wrapArray(min, wrap2(0, min.length), max) : _conditionalReturn(value, function(value2) {
      return (range + (value2 - min) % range) % range + min;
    });
  }, wrapYoyo = function wrapYoyo2(min, max, value) {
    var range = max - min, total = range * 2;
    return _isArray(min) ? _wrapArray(min, wrapYoyo2(0, min.length - 1), max) : _conditionalReturn(value, function(value2) {
      value2 = (total + (value2 - min) % total) % total || 0;
      return min + (value2 > range ? total - value2 : value2);
    });
  }, _replaceRandom = function _replaceRandom2(value) {
    var prev = 0, s = "", i, nums, end, isArray;
    while (~(i = value.indexOf("random(", prev))) {
      end = value.indexOf(")", i);
      isArray = value.charAt(i + 7) === "[";
      nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
      s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
      prev = end + 1;
    }
    return s + value.substr(prev, value.length - prev);
  }, mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
    var inRange = inMax - inMin, outRange = outMax - outMin;
    return _conditionalReturn(value, function(value2) {
      return outMin + ((value2 - inMin) / inRange * outRange || 0);
    });
  }, interpolate = function interpolate2(start, end, progress, mutate) {
    var func = isNaN(start + end) ? 0 : function(p2) {
      return (1 - p2) * start + p2 * end;
    };
    if (!func) {
      var isString2 = _isString(start), master = {}, p, i, interpolators, l, il;
      progress === true && (mutate = 1) && (progress = null);
      if (isString2) {
        start = {
          p: start
        };
        end = {
          p: end
        };
      } else if (_isArray(start) && !_isArray(end)) {
        interpolators = [];
        l = start.length;
        il = l - 2;
        for (i = 1; i < l; i++) {
          interpolators.push(interpolate2(start[i - 1], start[i]));
        }
        l--;
        func = function func2(p2) {
          p2 *= l;
          var i2 = Math.min(il, ~~p2);
          return interpolators[i2](p2 - i2);
        };
        progress = end;
      } else if (!mutate) {
        start = _merge(_isArray(start) ? [] : {}, start);
      }
      if (!interpolators) {
        for (p in end) {
          _addPropTween.call(master, start, p, "get", end[p]);
        }
        func = function func2(p2) {
          return _renderPropTweens(p2, master) || (isString2 ? start.p : start);
        };
      }
    }
    return _conditionalReturn(progress, func);
  }, _getLabelInDirection = function _getLabelInDirection2(timeline, fromTime, backward) {
    var labels = timeline.labels, min = _bigNum$2, p, distance, label;
    for (p in labels) {
      distance = labels[p] - fromTime;
      if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
        label = p;
        min = distance;
      }
    }
    return label;
  }, _callback = function _callback2(animation, type, executeLazyFirst) {
    var v = animation.vars, callback = v[type], prevContext = _context, context = animation._ctx, params, scope, result;
    if (!callback) {
      return;
    }
    params = v[type + "Params"];
    scope = v.callbackScope || animation;
    executeLazyFirst && _lazyTweens.length && _lazyRender();
    context && (_context = context);
    result = params ? callback.apply(scope, params) : callback.call(scope);
    _context = prevContext;
    return result;
  }, _interrupt = function _interrupt2(animation) {
    _removeFromParent(animation);
    animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
    animation.progress() < 1 && _callback(animation, "onInterrupt");
    return animation;
  }, _quickTween, _registerPluginQueue = [], _createPlugin = function _createPlugin2(config) {
    if (!config) return;
    config = !config.name && config["default"] || config;
    if (_windowExists$1() || config.headless) {
      var name = config.name, isFunc = _isFunction(config), Plugin = name && !isFunc && config.init ? function() {
        this._props = [];
      } : config, instanceDefaults = {
        init: _emptyFunc,
        render: _renderPropTweens,
        add: _addPropTween,
        kill: _killPropTweensOf,
        modifier: _addPluginModifier,
        rawVars: 0
      }, statics = {
        targetTest: 0,
        get: 0,
        getSetter: _getSetter,
        aliases: {},
        register: 0
      };
      _wake();
      if (config !== Plugin) {
        if (_plugins[name]) {
          return;
        }
        _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics));
        _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics)));
        _plugins[Plugin.prop = name] = Plugin;
        if (config.targetTest) {
          _harnessPlugins.push(Plugin);
          _reservedProps[name] = 1;
        }
        name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
      }
      _addGlobal(name, Plugin);
      config.register && config.register(gsap$1, Plugin, PropTween);
    } else {
      _registerPluginQueue.push(config);
    }
  }, _255 = 255, _colorLookup = {
    aqua: [0, _255, _255],
    lime: [0, _255, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, _255],
    navy: [0, 0, 128],
    white: [_255, _255, _255],
    olive: [128, 128, 0],
    yellow: [_255, _255, 0],
    orange: [_255, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [_255, 0, 0],
    pink: [_255, 192, 203],
    cyan: [0, _255, _255],
    transparent: [_255, _255, _255, 0]
  }, _hue = function _hue2(h, m1, m2) {
    h += h < 0 ? 1 : h > 1 ? -1 : 0;
    return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
  }, splitColor = function splitColor2(v, toHSL, forceAlpha) {
    var a = !v ? _colorLookup.black : _isNumber$1(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s, l, max, min, d, wasHSL;
    if (!a) {
      if (v.substr(-1) === ",") {
        v = v.substr(0, v.length - 1);
      }
      if (_colorLookup[v]) {
        a = _colorLookup[v];
      } else if (v.charAt(0) === "#") {
        if (v.length < 6) {
          r = v.charAt(1);
          g = v.charAt(2);
          b = v.charAt(3);
          v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
        }
        if (v.length === 9) {
          a = parseInt(v.substr(1, 6), 16);
          return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
        }
        v = parseInt(v.substr(1), 16);
        a = [v >> 16, v >> 8 & _255, v & _255];
      } else if (v.substr(0, 3) === "hsl") {
        a = wasHSL = v.match(_strictNumExp);
        if (!toHSL) {
          h = +a[0] % 360 / 360;
          s = +a[1] / 100;
          l = +a[2] / 100;
          g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
          r = l * 2 - g;
          a.length > 3 && (a[3] *= 1);
          a[0] = _hue(h + 1 / 3, r, g);
          a[1] = _hue(h, r, g);
          a[2] = _hue(h - 1 / 3, r, g);
        } else if (~v.indexOf("=")) {
          a = v.match(_numExp$1);
          forceAlpha && a.length < 4 && (a[3] = 1);
          return a;
        }
      } else {
        a = v.match(_strictNumExp) || _colorLookup.transparent;
      }
      a = a.map(Number);
    }
    if (toHSL && !wasHSL) {
      r = a[0] / _255;
      g = a[1] / _255;
      b = a[2] / _255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h *= 60;
      }
      a[0] = ~~(h + 0.5);
      a[1] = ~~(s * 100 + 0.5);
      a[2] = ~~(l * 100 + 0.5);
    }
    forceAlpha && a.length < 4 && (a[3] = 1);
    return a;
  }, _colorOrderData = function _colorOrderData2(v) {
    var values = [], c = [], i = -1;
    v.split(_colorExp).forEach(function(v2) {
      var a = v2.match(_numWithUnitExp) || [];
      values.push.apply(values, a);
      c.push(i += a.length + 1);
    });
    values.c = c;
    return values;
  }, _formatColors = function _formatColors2(s, toHSL, orderMatchData) {
    var result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
    if (!colors) {
      return s;
    }
    colors = colors.map(function(color) {
      return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
    });
    if (orderMatchData) {
      d = _colorOrderData(s);
      c = orderMatchData.c;
      if (c.join(result) !== d.c.join(result)) {
        shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
        l = shell.length - 1;
        for (; i < l; i++) {
          result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
        }
      }
    }
    if (!shell) {
      shell = s.split(_colorExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + colors[i];
      }
    }
    return result + shell[l];
  }, _colorExp = (function() {
    var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
    for (p in _colorLookup) {
      s += "|" + p + "\\b";
    }
    return new RegExp(s + ")", "gi");
  })(), _hslExp = /hsl[a]?\(/, _colorStringFilter = function _colorStringFilter2(a) {
    var combined = a.join(" "), toHSL;
    _colorExp.lastIndex = 0;
    if (_colorExp.test(combined)) {
      toHSL = _hslExp.test(combined);
      a[1] = _formatColors(a[1], toHSL);
      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
      return true;
    }
  }, _tickerActive, _ticker = (function() {
    var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners2 = [], _id, _req, _raf, _self, _delta, _i, _tick = function _tick2(v) {
      var elapsed = _getTime() - _lastUpdate, manual = v === true, overlap, dispatch2, time, frame;
      (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
      _lastUpdate += elapsed;
      time = _lastUpdate - _startTime;
      overlap = time - _nextTime;
      if (overlap > 0 || manual) {
        frame = ++_self.frame;
        _delta = time - _self.time * 1e3;
        _self.time = time = time / 1e3;
        _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
        dispatch2 = 1;
      }
      manual || (_id = _req(_tick2));
      if (dispatch2) {
        for (_i = 0; _i < _listeners2.length; _i++) {
          _listeners2[_i](time, _delta, frame, v);
        }
      }
    };
    _self = {
      time: 0,
      frame: 0,
      tick: function tick() {
        _tick(true);
      },
      deltaRatio: function deltaRatio(fps) {
        return _delta / (1e3 / (fps || 60));
      },
      wake: function wake() {
        if (_coreReady) {
          if (!_coreInitted$1 && _windowExists$1()) {
            _win$1 = _coreInitted$1 = window;
            _doc$1 = _win$1.document || {};
            _globals.gsap = gsap$1;
            (_win$1.gsapVersions || (_win$1.gsapVersions = [])).push(gsap$1.version);
            _install(_installScope || _win$1.GreenSockGlobals || !_win$1.gsap && _win$1 || {});
            _registerPluginQueue.forEach(_createPlugin);
          }
          _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
          _id && _self.sleep();
          _req = _raf || function(f) {
            return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
          };
          _tickerActive = 1;
          _tick(2);
        }
      },
      sleep: function sleep() {
        (_raf ? cancelAnimationFrame : clearTimeout)(_id);
        _tickerActive = 0;
        _req = _emptyFunc;
      },
      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
        _lagThreshold = threshold || Infinity;
        _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
      },
      fps: function fps(_fps) {
        _gap = 1e3 / (_fps || 240);
        _nextTime = _self.time * 1e3 + _gap;
      },
      add: function add(callback, once, prioritize) {
        var func = once ? function(t, d, f, v) {
          callback(t, d, f, v);
          _self.remove(func);
        } : callback;
        _self.remove(callback);
        _listeners2[prioritize ? "unshift" : "push"](func);
        _wake();
        return func;
      },
      remove: function remove(callback, i) {
        ~(i = _listeners2.indexOf(callback)) && _listeners2.splice(i, 1) && _i >= i && _i--;
      },
      _listeners: _listeners2
    };
    return _self;
  })(), _wake = function _wake2() {
    return !_tickerActive && _ticker.wake();
  }, _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = function _parseObjectInString2(value) {
    var obj = {}, split = value.substr(1, value.length - 3).split(":"), key = split[0], i = 1, l = split.length, index, val, parsedVal;
    for (; i < l; i++) {
      val = split[i];
      index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
      parsedVal = val.substr(0, index);
      obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
      key = val.substr(index + 1).trim();
    }
    return obj;
  }, _valueInParentheses = function _valueInParentheses2(value) {
    var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
  }, _configEaseFromString = function _configEaseFromString2(name) {
    var split = (name + "").split("("), ease = _easeMap[split[0]];
    return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
  }, _invertEase = function _invertEase2(ease) {
    return function(p) {
      return 1 - ease(1 - p);
    };
  }, _propagateYoyoEase = function _propagateYoyoEase2(timeline, isYoyo) {
    var child = timeline._first, ease;
    while (child) {
      if (child instanceof Timeline) {
        _propagateYoyoEase2(child, isYoyo);
      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
        if (child.timeline) {
          _propagateYoyoEase2(child.timeline, isYoyo);
        } else {
          ease = child._ease;
          child._ease = child._yEase;
          child._yEase = ease;
          child._yoyo = isYoyo;
        }
      }
      child = child._next;
    }
  }, _parseEase = function _parseEase2(ease, defaultEase) {
    return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
  }, _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
    if (easeOut === void 0) {
      easeOut = function easeOut2(p) {
        return 1 - easeIn(1 - p);
      };
    }
    if (easeInOut === void 0) {
      easeInOut = function easeInOut2(p) {
        return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
      };
    }
    var ease = {
      easeIn,
      easeOut,
      easeInOut
    }, lowercaseName;
    _forEachName(names, function(name) {
      _easeMap[name] = _globals[name] = ease;
      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
      for (var p in ease) {
        _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
      }
    });
    return ease;
  }, _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
    return function(p) {
      return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
    };
  }, _configElastic = function _configElastic2(type, amplitude, period) {
    var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p) {
      return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin$1((p - p3) * p2) + 1;
    }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);
    p2 = _2PI / p2;
    ease.config = function(amplitude2, period2) {
      return _configElastic2(type, amplitude2, period2);
    };
    return ease;
  }, _configBack = function _configBack2(type, overshoot) {
    if (overshoot === void 0) {
      overshoot = 1.70158;
    }
    var easeOut = function easeOut2(p) {
      return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
    }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);
    ease.config = function(overshoot2) {
      return _configBack2(type, overshoot2);
    };
    return ease;
  };
  _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
    var power = i < 5 ? i + 1 : i;
    _insertEase(name + ",Power" + (power - 1), i ? function(p) {
      return Math.pow(p, power);
    } : function(p) {
      return p;
    }, function(p) {
      return 1 - Math.pow(1 - p, power);
    }, function(p) {
      return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
    });
  });
  _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
  _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
  (function(n, c) {
    var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut2(p) {
      return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
    };
    _insertEase("Bounce", function(p) {
      return 1 - easeOut(1 - p);
    }, easeOut);
  })(7.5625, 2.75);
  _insertEase("Expo", function(p) {
    return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
  });
  _insertEase("Circ", function(p) {
    return -(_sqrt$1(1 - p * p) - 1);
  });
  _insertEase("Sine", function(p) {
    return p === 1 ? 1 : -_cos$1(p * _HALF_PI) + 1;
  });
  _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
  _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
    config: function config(steps, immediateStart) {
      if (steps === void 0) {
        steps = 1;
      }
      var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - _tinyNum;
      return function(p) {
        return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
      };
    }
  };
  _defaults.ease = _easeMap["quad.out"];
  _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
    return _callbackNames += name + "," + name + "Params,";
  });
  var GSCache = function GSCache2(target, harness) {
    this.id = _gsID++;
    target._gsap = this;
    this.target = target;
    this.harness = harness;
    this.get = harness ? harness.get : _getProperty;
    this.set = harness ? harness.getSetter : _getSetter;
  };
  var Animation = /* @__PURE__ */ (function() {
    function Animation2(vars) {
      this.vars = vars;
      this._delay = +vars.delay || 0;
      if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
        this._rDelay = vars.repeatDelay || 0;
        this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
      }
      this._ts = 1;
      _setDuration(this, +vars.duration, 1, 1);
      this.data = vars.data;
      if (_context) {
        this._ctx = _context;
        _context.data.push(this);
      }
      _tickerActive || _ticker.wake();
    }
    var _proto = Animation2.prototype;
    _proto.delay = function delay(value) {
      if (value || value === 0) {
        this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
        this._delay = value;
        return this;
      }
      return this._delay;
    };
    _proto.duration = function duration(value) {
      return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
    };
    _proto.totalDuration = function totalDuration(value) {
      if (!arguments.length) {
        return this._tDur;
      }
      this._dirty = 0;
      return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
    };
    _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
      _wake();
      if (!arguments.length) {
        return this._tTime;
      }
      var parent = this._dp;
      if (parent && parent.smoothChildTiming && this._ts) {
        _alignPlayhead(this, _totalTime);
        !parent._dp || parent.parent || _postAddChecks(parent, this);
        while (parent && parent.parent) {
          if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
            parent.totalTime(parent._tTime, true);
          }
          parent = parent.parent;
        }
        if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
          _addToTimeline(this._dp, this, this._start - this._delay);
        }
      }
      if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
        this._ts || (this._pTime = _totalTime);
        _lazySafeRender(this, _totalTime, suppressEvents);
      }
      return this;
    };
    _proto.time = function time(value, suppressEvents) {
      return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
    };
    _proto.totalProgress = function totalProgress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
    };
    _proto.progress = function progress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
    };
    _proto.iteration = function iteration(value, suppressEvents) {
      var cycleDuration = this.duration() + this._rDelay;
      return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
    };
    _proto.timeScale = function timeScale(value, suppressEvents) {
      if (!arguments.length) {
        return this._rts === -_tinyNum ? 0 : this._rts;
      }
      if (this._rts === value) {
        return this;
      }
      var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
      this._rts = +value || 0;
      this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
      this.totalTime(_clamp(-Math.abs(this._delay), this._tDur, tTime), suppressEvents !== false);
      _setEnd(this);
      return _recacheAncestors(this);
    };
    _proto.paused = function paused(value) {
      if (!arguments.length) {
        return this._ps;
      }
      if (this._ps !== value) {
        this._ps = value;
        if (value) {
          this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
          this._ts = this._act = 0;
        } else {
          _wake();
          this._ts = this._rts;
          this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
        }
      }
      return this;
    };
    _proto.startTime = function startTime(value) {
      if (arguments.length) {
        this._start = value;
        var parent = this.parent || this._dp;
        parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
        return this;
      }
      return this._start;
    };
    _proto.endTime = function endTime(includeRepeats) {
      return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
    };
    _proto.rawTime = function rawTime(wrapRepeats) {
      var parent = this.parent || this._dp;
      return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
    };
    _proto.revert = function revert(config) {
      if (config === void 0) {
        config = _revertConfig;
      }
      var prevIsReverting = _reverting$1;
      _reverting$1 = config;
      if (this._initted || this._startAt) {
        this.timeline && this.timeline.revert(config);
        this.totalTime(-0.01, config.suppressEvents);
      }
      this.data !== "nested" && config.kill !== false && this.kill();
      _reverting$1 = prevIsReverting;
      return this;
    };
    _proto.globalTime = function globalTime(rawTime) {
      var animation = this, time = arguments.length ? rawTime : animation.rawTime();
      while (animation) {
        time = animation._start + time / (Math.abs(animation._ts) || 1);
        animation = animation._dp;
      }
      return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time;
    };
    _proto.repeat = function repeat(value) {
      if (arguments.length) {
        this._repeat = value === Infinity ? -2 : value;
        return _onUpdateTotalDuration(this);
      }
      return this._repeat === -2 ? Infinity : this._repeat;
    };
    _proto.repeatDelay = function repeatDelay(value) {
      if (arguments.length) {
        var time = this._time;
        this._rDelay = value;
        _onUpdateTotalDuration(this);
        return time ? this.time(time) : this;
      }
      return this._rDelay;
    };
    _proto.yoyo = function yoyo(value) {
      if (arguments.length) {
        this._yoyo = value;
        return this;
      }
      return this._yoyo;
    };
    _proto.seek = function seek(position, suppressEvents) {
      return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
    };
    _proto.restart = function restart(includeDelay, suppressEvents) {
      this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
      this._dur || (this._zTime = -_tinyNum);
      return this;
    };
    _proto.play = function play(from, suppressEvents) {
      from != null && this.seek(from, suppressEvents);
      return this.reversed(false).paused(false);
    };
    _proto.reverse = function reverse(from, suppressEvents) {
      from != null && this.seek(from || this.totalDuration(), suppressEvents);
      return this.reversed(true).paused(false);
    };
    _proto.pause = function pause(atTime, suppressEvents) {
      atTime != null && this.seek(atTime, suppressEvents);
      return this.paused(true);
    };
    _proto.resume = function resume() {
      return this.paused(false);
    };
    _proto.reversed = function reversed(value) {
      if (arguments.length) {
        !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
        return this;
      }
      return this._rts < 0;
    };
    _proto.invalidate = function invalidate() {
      this._initted = this._act = 0;
      this._zTime = -_tinyNum;
      return this;
    };
    _proto.isActive = function isActive() {
      var parent = this.parent || this._dp, start = this._start, rawTime;
      return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
    };
    _proto.eventCallback = function eventCallback(type, callback, params) {
      var vars = this.vars;
      if (arguments.length > 1) {
        if (!callback) {
          delete vars[type];
        } else {
          vars[type] = callback;
          params && (vars[type + "Params"] = params);
          type === "onUpdate" && (this._onUpdate = callback);
        }
        return this;
      }
      return vars[type];
    };
    _proto.then = function then(onFulfilled) {
      var self2 = this;
      return new Promise(function(resolve) {
        var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve2() {
          var _then = self2.then;
          self2.then = null;
          _isFunction(f) && (f = f(self2)) && (f.then || f === self2) && (self2.then = _then);
          resolve(f);
          self2.then = _then;
        };
        if (self2._initted && self2.totalProgress() === 1 && self2._ts >= 0 || !self2._tTime && self2._ts < 0) {
          _resolve();
        } else {
          self2._prom = _resolve;
        }
      });
    };
    _proto.kill = function kill() {
      _interrupt(this);
    };
    return Animation2;
  })();
  _setDefaults(Animation.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: false,
    parent: null,
    _initted: false,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -_tinyNum,
    _prom: 0,
    _ps: false,
    _rts: 1
  });
  var Timeline = /* @__PURE__ */ (function(_Animation) {
    _inheritsLoose(Timeline2, _Animation);
    function Timeline2(vars, position) {
      var _this;
      if (vars === void 0) {
        vars = {};
      }
      _this = _Animation.call(this, vars) || this;
      _this.labels = {};
      _this.smoothChildTiming = !!vars.smoothChildTiming;
      _this.autoRemoveChildren = !!vars.autoRemoveChildren;
      _this._sort = _isNotFalse(vars.sortChildren);
      _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
      vars.reversed && _this.reverse();
      vars.paused && _this.paused(true);
      vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
      return _this;
    }
    var _proto2 = Timeline2.prototype;
    _proto2.to = function to(targets, vars, position) {
      _createTweenType(0, arguments, this);
      return this;
    };
    _proto2.from = function from(targets, vars, position) {
      _createTweenType(1, arguments, this);
      return this;
    };
    _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
      _createTweenType(2, arguments, this);
      return this;
    };
    _proto2.set = function set(targets, vars, position) {
      vars.duration = 0;
      vars.parent = this;
      _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
      vars.immediateRender = !!vars.immediateRender;
      new Tween(targets, vars, _parsePosition(this, position), 1);
      return this;
    };
    _proto2.call = function call(callback, params, position) {
      return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
    };
    _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.duration = duration;
      vars.stagger = vars.stagger || stagger;
      vars.onComplete = onCompleteAll;
      vars.onCompleteParams = onCompleteAllParams;
      vars.parent = this;
      new Tween(targets, vars, _parsePosition(this, position));
      return this;
    };
    _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.runBackwards = 1;
      _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
      return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
    };
    _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
      toVars.startAt = fromVars;
      _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
      return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
    };
    _proto2.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
      this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
      if (tTime !== this._tTime || force || crossingStart) {
        if (prevTime !== this._time && dur) {
          tTime += this._time - prevTime;
          totalTime += this._time - prevTime;
        }
        time = tTime;
        prevStart = this._start;
        timeScale = this._ts;
        prevPaused = !timeScale;
        if (crossingStart) {
          dur || (prevTime = this._zTime);
          (totalTime || !suppressEvents) && (this._zTime = totalTime);
        }
        if (this._repeat) {
          yoyo = this._yoyo;
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }
          time = _roundPrecise(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            prevIteration = _roundPrecise(tTime / cycleDuration);
            iteration = ~~prevIteration;
            if (iteration && iteration === prevIteration) {
              time = dur;
              iteration--;
            }
            time > dur && (time = dur);
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration);
          if (yoyo && iteration & 1) {
            time = dur - time;
            isYoyo = 1;
          }
          if (iteration !== prevIteration && !this._lock) {
            var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
            iteration < prevIteration && (rewinding = !rewinding);
            prevTime = rewinding ? 0 : tTime % dur ? dur : tTime;
            this._lock = 1;
            this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
            this._tTime = tTime;
            !suppressEvents && this.parent && _callback(this, "onRepeat");
            this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
            if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
              return this;
            }
            dur = this._dur;
            tDur = this._tDur;
            if (doesWrap) {
              this._lock = 2;
              prevTime = rewinding ? dur : -1e-4;
              this.render(prevTime, true);
              this.vars.repeatRefresh && !isYoyo && this.invalidate();
            }
            this._lock = 0;
            if (!this._ts && !prevPaused) {
              return this;
            }
            _propagateYoyoEase(this, isYoyo);
          }
        }
        if (this._hasPause && !this._forcing && this._lock < 2) {
          pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
          if (pauseTween) {
            tTime -= time - (time = pauseTween._start);
          }
        }
        this._tTime = tTime;
        this._time = time;
        this._act = !timeScale;
        if (!this._initted) {
          this._onUpdate = this.vars.onUpdate;
          this._initted = 1;
          this._zTime = totalTime;
          prevTime = 0;
        }
        if (!prevTime && time && !suppressEvents && !iteration) {
          _callback(this, "onStart");
          if (this._tTime !== tTime) {
            return this;
          }
        }
        if (time >= prevTime && totalTime >= 0) {
          child = this._first;
          while (child) {
            next = child._next;
            if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = -_tinyNum);
                break;
              }
            }
            child = next;
          }
        } else {
          child = this._last;
          var adjustedTime = totalTime < 0 ? totalTime : time;
          while (child) {
            next = child._prev;
            if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && (child._initted || child._startAt));
              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                break;
              }
            }
            child = next;
          }
        }
        if (pauseTween && !suppressEvents) {
          this.pause();
          pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
          if (this._ts) {
            this._start = prevStart;
            _setEnd(this);
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
        if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) {
          if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
            if (!this._lock) {
              (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
              if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
                _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
                this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
              }
            }
          }
        }
      }
      return this;
    };
    _proto2.add = function add(child, position) {
      var _this2 = this;
      _isNumber$1(position) || (position = _parsePosition(this, position, child));
      if (!(child instanceof Animation)) {
        if (_isArray(child)) {
          child.forEach(function(obj) {
            return _this2.add(obj, position);
          });
          return this;
        }
        if (_isString(child)) {
          return this.addLabel(child, position);
        }
        if (_isFunction(child)) {
          child = Tween.delayedCall(0, child);
        } else {
          return this;
        }
      }
      return this !== child ? _addToTimeline(this, child, position) : this;
    };
    _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
      if (nested === void 0) {
        nested = true;
      }
      if (tweens === void 0) {
        tweens = true;
      }
      if (timelines === void 0) {
        timelines = true;
      }
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = -_bigNum$2;
      }
      var a = [], child = this._first;
      while (child) {
        if (child._start >= ignoreBeforeTime) {
          if (child instanceof Tween) {
            tweens && a.push(child);
          } else {
            timelines && a.push(child);
            nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
          }
        }
        child = child._next;
      }
      return a;
    };
    _proto2.getById = function getById(id) {
      var animations = this.getChildren(1, 1, 1), i = animations.length;
      while (i--) {
        if (animations[i].vars.id === id) {
          return animations[i];
        }
      }
    };
    _proto2.remove = function remove(child) {
      if (_isString(child)) {
        return this.removeLabel(child);
      }
      if (_isFunction(child)) {
        return this.killTweensOf(child);
      }
      child.parent === this && _removeLinkedListItem(this, child);
      if (child === this._recent) {
        this._recent = this._last;
      }
      return _uncache(this);
    };
    _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
      if (!arguments.length) {
        return this._tTime;
      }
      this._forcing = 1;
      if (!this._dp && this._ts) {
        this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
      }
      _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
      this._forcing = 0;
      return this;
    };
    _proto2.addLabel = function addLabel(label, position) {
      this.labels[label] = _parsePosition(this, position);
      return this;
    };
    _proto2.removeLabel = function removeLabel(label) {
      delete this.labels[label];
      return this;
    };
    _proto2.addPause = function addPause(position, callback, params) {
      var t = Tween.delayedCall(0, callback || _emptyFunc, params);
      t.data = "isPause";
      this._hasPause = 1;
      return _addToTimeline(this, t, _parsePosition(this, position));
    };
    _proto2.removePause = function removePause(position) {
      var child = this._first;
      position = _parsePosition(this, position);
      while (child) {
        if (child._start === position && child.data === "isPause") {
          _removeFromParent(child);
        }
        child = child._next;
      }
    };
    _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
      while (i--) {
        _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
      }
      return this;
    };
    _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
      var a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber$1(onlyActive), children;
      while (child) {
        if (child instanceof Tween) {
          if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
            a.push(child);
          }
        } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
          a.push.apply(a, children);
        }
        child = child._next;
      }
      return a;
    };
    _proto2.tweenTo = function tweenTo(position, vars) {
      vars = vars || {};
      var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
        ease: vars.ease || "none",
        lazy: false,
        immediateRender: false,
        time: endTime,
        overwrite: "auto",
        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
        onStart: function onStart() {
          tl.pause();
          if (!initted) {
            var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            initted = 1;
          }
          _onStart && _onStart.apply(tween, onStartParams || []);
        }
      }, vars));
      return immediateRender ? tween.render(0) : tween;
    };
    _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
      return this.tweenTo(toPosition, _setDefaults({
        startAt: {
          time: _parsePosition(this, fromPosition)
        }
      }, vars));
    };
    _proto2.recent = function recent() {
      return this._recent;
    };
    _proto2.nextLabel = function nextLabel(afterTime) {
      if (afterTime === void 0) {
        afterTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, afterTime));
    };
    _proto2.previousLabel = function previousLabel(beforeTime) {
      if (beforeTime === void 0) {
        beforeTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
    };
    _proto2.currentLabel = function currentLabel(value) {
      return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
    };
    _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = 0;
      }
      var child = this._first, labels = this.labels, p;
      while (child) {
        if (child._start >= ignoreBeforeTime) {
          child._start += amount;
          child._end += amount;
        }
        child = child._next;
      }
      if (adjustLabels) {
        for (p in labels) {
          if (labels[p] >= ignoreBeforeTime) {
            labels[p] += amount;
          }
        }
      }
      return _uncache(this);
    };
    _proto2.invalidate = function invalidate(soft) {
      var child = this._first;
      this._lock = 0;
      while (child) {
        child.invalidate(soft);
        child = child._next;
      }
      return _Animation.prototype.invalidate.call(this, soft);
    };
    _proto2.clear = function clear(includeLabels) {
      if (includeLabels === void 0) {
        includeLabels = true;
      }
      var child = this._first, next;
      while (child) {
        next = child._next;
        this.remove(child);
        child = next;
      }
      this._dp && (this._time = this._tTime = this._pTime = 0);
      includeLabels && (this.labels = {});
      return _uncache(this);
    };
    _proto2.totalDuration = function totalDuration(value) {
      var max = 0, self2 = this, child = self2._last, prevStart = _bigNum$2, prev, start, parent;
      if (arguments.length) {
        return self2.timeScale((self2._repeat < 0 ? self2.duration() : self2.totalDuration()) / (self2.reversed() ? -value : value));
      }
      if (self2._dirty) {
        parent = self2.parent;
        while (child) {
          prev = child._prev;
          child._dirty && child.totalDuration();
          start = child._start;
          if (start > prevStart && self2._sort && child._ts && !self2._lock) {
            self2._lock = 1;
            _addToTimeline(self2, child, start - child._delay, 1)._lock = 0;
          } else {
            prevStart = start;
          }
          if (start < 0 && child._ts) {
            max -= start;
            if (!parent && !self2._dp || parent && parent.smoothChildTiming) {
              self2._start += start / self2._ts;
              self2._time -= start;
              self2._tTime -= start;
            }
            self2.shiftChildren(-start, false, -Infinity);
            prevStart = 0;
          }
          child._end > max && child._ts && (max = child._end);
          child = prev;
        }
        _setDuration(self2, self2 === _globalTimeline && self2._time > max ? self2._time : max, 1, 1);
        self2._dirty = 0;
      }
      return self2._tDur;
    };
    Timeline2.updateRoot = function updateRoot(time) {
      if (_globalTimeline._ts) {
        _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
        _lastRenderedFrame = _ticker.frame;
      }
      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame += _config.autoSleep || 120;
        var child = _globalTimeline._first;
        if (!child || !child._ts) {
          if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child && !child._ts) {
              child = child._next;
            }
            child || _ticker.sleep();
          }
        }
      }
    };
    return Timeline2;
  })(Animation);
  _setDefaults(Timeline.prototype, {
    _lock: 0,
    _hasPause: 0,
    _forcing: 0
  });
  var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start, end, setter, stringFilter, funcParam) {
    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a;
    pt.b = start;
    pt.e = end;
    start += "";
    end += "";
    if (hasRandom = ~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }
    if (stringFilter) {
      a = [start, end];
      stringFilter(a, target, prop);
      start = a[0];
      end = a[1];
    }
    startNums = start.match(_complexStringNumExp) || [];
    while (result = _complexStringNumExp.exec(end)) {
      endNum = result[0];
      chunk = end.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(") {
        color = 1;
      }
      if (endNum !== startNums[matchIndex++]) {
        startNum = parseFloat(startNums[matchIndex - 1]) || 0;
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
          m: color && color < 4 ? Math.round : 0
        };
        index = _complexStringNumExp.lastIndex;
      }
    }
    pt.c = index < end.length ? end.substring(index, end.length) : "";
    pt.fp = funcParam;
    if (_relExp.test(end) || hasRandom) {
      pt.e = 0;
    }
    this._pt = pt;
    return pt;
  }, _addPropTween = function _addPropTween2(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
    _isFunction(end) && (end = end(index || 0, target, targets));
    var currentValue = target[prop], parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
    if (_isString(end)) {
      if (~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }
      if (end.charAt(1) === "=") {
        pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
        if (pt || pt === 0) {
          end = pt;
        }
      }
    }
    if (!optional || parsedStart !== end || _forceAllPropTweens) {
      if (!isNaN(parsedStart * end) && end !== "") {
        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
        funcParam && (pt.fp = funcParam);
        modifier && pt.modifier(modifier, this, target);
        return this._pt = pt;
      }
      !currentValue && !(prop in target) && _missingPlugin(prop, end);
      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
    }
  }, _processVars = function _processVars2(vars, index, target, targets, tween) {
    _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
    if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
      return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
    }
    var copy = {}, p;
    for (p in vars) {
      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
    }
    return copy;
  }, _checkPlugin = function _checkPlugin2(property, vars, tween, index, target, targets) {
    var plugin, pt, ptLookup, i;
    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
      if (tween !== _quickTween) {
        ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
        i = plugin._props.length;
        while (i--) {
          ptLookup[plugin._props[i]] = pt;
        }
      }
    }
    return plugin;
  }, _overwritingTween, _forceAllPropTweens, _initTween = function _initTween2(tween, time, tTime) {
    var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
    tl && (!keyframes || !ease) && (ease = "none");
    tween._ease = _parseEase(ease, _defaults.ease);
    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;
    if (yoyoEase && tween._yoyo && !tween._repeat) {
      yoyoEase = tween._yEase;
      tween._yEase = tween._ease;
      tween._ease = yoyoEase;
    }
    tween._from = !tl && !!vars.runBackwards;
    if (!tl || keyframes && !vars.stagger) {
      harness = targets[0] ? _getCache(targets[0]).harness : 0;
      harnessVars = harness && vars[harness.prop];
      cleanVars = _copyExcluding(vars, _reservedProps);
      if (prevStartAt) {
        prevStartAt._zTime < 0 && prevStartAt.progress(1);
        time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
        prevStartAt._lazy = 0;
      }
      if (startAt) {
        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
          data: "isStart",
          overwrite: false,
          parent,
          immediateRender: true,
          lazy: !prevStartAt && _isNotFalse(lazy),
          startAt: null,
          delay: 0,
          onUpdate: onUpdate && function() {
            return _callback(tween, "onUpdate");
          },
          stagger: 0
        }, startAt)));
        tween._startAt._dp = 0;
        tween._startAt._sat = tween;
        time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
        if (immediateRender) {
          if (dur && time <= 0 && tTime <= 0) {
            time && (tween._zTime = time);
            return;
          }
        }
      } else if (runBackwards && dur) {
        if (!prevStartAt) {
          time && (immediateRender = false);
          p = _setDefaults({
            overwrite: false,
            data: "isFromStart",
            //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
            lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
            immediateRender,
            //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
            stagger: 0,
            parent
            //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
          }, cleanVars);
          harnessVars && (p[harness.prop] = harnessVars);
          _removeFromParent(tween._startAt = Tween.set(targets, p));
          tween._startAt._dp = 0;
          tween._startAt._sat = tween;
          time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
          tween._zTime = time;
          if (!immediateRender) {
            _initTween2(tween._startAt, _tinyNum, _tinyNum);
          } else if (!time) {
            return;
          }
        }
      }
      tween._pt = tween._ptCache = 0;
      lazy = dur && _isNotFalse(lazy) || lazy && !dur;
      for (i = 0; i < targets.length; i++) {
        target = targets[i];
        gsData = target._gsap || _harness(targets)[i]._gsap;
        tween._ptLookup[i] = ptLookup = {};
        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
        index = fullTargets === targets ? i : fullTargets.indexOf(target);
        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
          plugin._props.forEach(function(name) {
            ptLookup[name] = pt;
          });
          plugin.priority && (hasPriority = 1);
        }
        if (!harness || harnessVars) {
          for (p in cleanVars) {
            if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
              plugin.priority && (hasPriority = 1);
            } else {
              ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
            }
          }
        }
        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
        if (autoOverwrite && tween._pt) {
          _overwritingTween = tween;
          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
          overwritten = !tween.parent;
          _overwritingTween = 0;
        }
        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
      }
      hasPriority && _sortPropTweensByPriority(tween);
      tween._onInit && tween._onInit(tween);
    }
    tween._onUpdate = onUpdate;
    tween._initted = (!tween._op || tween._pt) && !overwritten;
    keyframes && time <= 0 && tl.render(_bigNum$2, true, true);
  }, _updatePropTweens = function _updatePropTweens2(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
    var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property], pt, rootPT, lookup, i;
    if (!ptCache) {
      ptCache = tween._ptCache[property] = [];
      lookup = tween._ptLookup;
      i = tween._targets.length;
      while (i--) {
        pt = lookup[i][property];
        if (pt && pt.d && pt.d._pt) {
          pt = pt.d._pt;
          while (pt && pt.p !== property && pt.fp !== property) {
            pt = pt._next;
          }
        }
        if (!pt) {
          _forceAllPropTweens = 1;
          tween.vars[property] = "+=0";
          _initTween(tween, time);
          _forceAllPropTweens = 0;
          return skipRecursion ? _warn(property + " not eligible for reset") : 1;
        }
        ptCache.push(pt);
      }
    }
    i = ptCache.length;
    while (i--) {
      rootPT = ptCache[i];
      pt = rootPT._pt || rootPT;
      pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
      pt.c = value - pt.s;
      rootPT.e && (rootPT.e = _round$2(value) + getUnit(rootPT.e));
      rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
    }
  }, _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
    var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
    if (!propertyAliases) {
      return vars;
    }
    copy = _merge({}, vars);
    for (p in propertyAliases) {
      if (p in copy) {
        aliases = propertyAliases[p].split(",");
        i = aliases.length;
        while (i--) {
          copy[aliases[i]] = copy[p];
        }
      }
    }
    return copy;
  }, _parseKeyframe = function _parseKeyframe2(prop, obj, allProps, easeEach) {
    var ease = obj.ease || easeEach || "power1.inOut", p, a;
    if (_isArray(obj)) {
      a = allProps[prop] || (allProps[prop] = []);
      obj.forEach(function(value, i) {
        return a.push({
          t: i / (obj.length - 1) * 100,
          v: value,
          e: ease
        });
      });
    } else {
      for (p in obj) {
        a = allProps[p] || (allProps[p] = []);
        p === "ease" || a.push({
          t: parseFloat(prop),
          v: obj[p],
          e: ease
        });
      }
    }
  }, _parseFuncOrString = function _parseFuncOrString2(value, tween, i, target, targets) {
    return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
  }, _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", _staggerPropsToSkip = {};
  _forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function(name) {
    return _staggerPropsToSkip[name] = 1;
  });
  var Tween = /* @__PURE__ */ (function(_Animation2) {
    _inheritsLoose(Tween2, _Animation2);
    function Tween2(targets, vars, position, skipInherit) {
      var _this3;
      if (typeof vars === "number") {
        position.duration = vars;
        vars = position;
        position = null;
      }
      _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
      var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber$1(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
      _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
      _this3._ptLookup = [];
      _this3._overwrite = overwrite;
      if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        vars = _this3.vars;
        tl = _this3.timeline = new Timeline({
          data: "nested",
          defaults: defaults || {},
          targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
        });
        tl.kill();
        tl.parent = tl._dp = _assertThisInitialized(_this3);
        tl._start = 0;
        if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
          l = parsedTargets.length;
          staggerFunc = stagger && distribute(stagger);
          if (_isObject(stagger)) {
            for (p in stagger) {
              if (~_staggerTweenProps.indexOf(p)) {
                staggerVarsToMerge || (staggerVarsToMerge = {});
                staggerVarsToMerge[p] = stagger[p];
              }
            }
          }
          for (i = 0; i < l; i++) {
            copy = _copyExcluding(vars, _staggerPropsToSkip);
            copy.stagger = 0;
            yoyoEase && (copy.yoyoEase = yoyoEase);
            staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
            curTarget = parsedTargets[i];
            copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
            copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
            if (!stagger && l === 1 && copy.delay) {
              _this3._delay = delay = copy.delay;
              _this3._start += delay;
              copy.delay = 0;
            }
            tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
            tl._ease = _easeMap.none;
          }
          tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
        } else if (keyframes) {
          _inheritDefaults(_setDefaults(tl.vars.defaults, {
            ease: "none"
          }));
          tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
          var time = 0, a, kf, v;
          if (_isArray(keyframes)) {
            keyframes.forEach(function(frame) {
              return tl.to(parsedTargets, frame, ">");
            });
            tl.duration();
          } else {
            copy = {};
            for (p in keyframes) {
              p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
            }
            for (p in copy) {
              a = copy[p].sort(function(a2, b) {
                return a2.t - b.t;
              });
              time = 0;
              for (i = 0; i < a.length; i++) {
                kf = a[i];
                v = {
                  ease: kf.e,
                  duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
                };
                v[p] = kf.v;
                tl.to(parsedTargets, v, time);
                time += v.duration;
              }
            }
            tl.duration() < duration && tl.to({}, {
              duration: duration - tl.duration()
            });
          }
        }
        duration || _this3.duration(duration = tl.duration());
      } else {
        _this3.timeline = 0;
      }
      if (overwrite === true && !_suppressOverwrites) {
        _overwritingTween = _assertThisInitialized(_this3);
        _globalTimeline.killTweensOf(parsedTargets);
        _overwritingTween = 0;
      }
      _addToTimeline(parent, _assertThisInitialized(_this3), position);
      vars.reversed && _this3.reverse();
      vars.paused && _this3.paused(true);
      if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
        _this3._tTime = -_tinyNum;
        _this3.render(Math.max(0, -delay) || 0);
      }
      scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
      return _this3;
    }
    var _proto3 = Tween2.prototype;
    _proto3.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline, yoyoEase;
      if (!dur) {
        _renderZeroDurationTween(this, totalTime, suppressEvents, force);
      } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
        time = tTime;
        timeline = this.timeline;
        if (this._repeat) {
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && isNegative) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }
          time = _roundPrecise(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            prevIteration = _roundPrecise(tTime / cycleDuration);
            iteration = ~~prevIteration;
            if (iteration && iteration === prevIteration) {
              time = dur;
              iteration--;
            } else if (time > dur) {
              time = dur;
            }
          }
          isYoyo = this._yoyo && iteration & 1;
          if (isYoyo) {
            yoyoEase = this._yEase;
            time = dur - time;
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          if (time === prevTime && !force && this._initted && iteration === prevIteration) {
            this._tTime = tTime;
            return this;
          }
          if (iteration !== prevIteration) {
            timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo);
            if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
              this._lock = force = 1;
              this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
            }
          }
        }
        if (!this._initted) {
          if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
            this._tTime = 0;
            return this;
          }
          if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
            return this;
          }
          if (dur !== this._dur) {
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._tTime = tTime;
        this._time = time;
        if (!this._act && this._ts) {
          this._act = 1;
          this._lazy = 0;
        }
        this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
        if (this._from) {
          this.ratio = ratio = 1 - ratio;
        }
        if (time && !prevTime && !suppressEvents && !iteration) {
          _callback(this, "onStart");
          if (this._tTime !== tTime) {
            return this;
          }
        }
        pt = this._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
        timeline && timeline.render(totalTime < 0 ? totalTime : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
        if (this._onUpdate && !suppressEvents) {
          isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
          _callback(this, "onUpdate");
        }
        this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
        if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
          isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
          (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
          if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
            _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }
      return this;
    };
    _proto3.targets = function targets() {
      return this._targets;
    };
    _proto3.invalidate = function invalidate(soft) {
      (!soft || !this.vars.runBackwards) && (this._startAt = 0);
      this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
      this._ptLookup = [];
      this.timeline && this.timeline.invalidate(soft);
      return _Animation2.prototype.invalidate.call(this, soft);
    };
    _proto3.resetTo = function resetTo(property, value, start, startIsRelative, skipRecursion) {
      _tickerActive || _ticker.wake();
      this._ts || this.play();
      var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts), ratio;
      this._initted || _initTween(this, time);
      ratio = this._ease(time / this._dur);
      if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
        return this.resetTo(property, value, start, startIsRelative, 1);
      }
      _alignPlayhead(this, 0);
      this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
      return this.render(0);
    };
    _proto3.kill = function kill(targets, vars) {
      if (vars === void 0) {
        vars = "all";
      }
      if (!targets && (!vars || vars === "all")) {
        this._lazy = this._pt = 0;
        this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting$1);
        return this;
      }
      if (this.timeline) {
        var tDur = this.timeline.totalDuration();
        this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
        this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
        return this;
      }
      var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
      if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
        vars === "all" && (this._pt = 0);
        return _interrupt(this);
      }
      overwrittenProps = this._op = this._op || [];
      if (vars !== "all") {
        if (_isString(vars)) {
          p = {};
          _forEachName(vars, function(name) {
            return p[name] = 1;
          });
          vars = p;
        }
        vars = _addAliasesToVars(parsedTargets, vars);
      }
      i = parsedTargets.length;
      while (i--) {
        if (~killingTargets.indexOf(parsedTargets[i])) {
          curLookup = propTweenLookup[i];
          if (vars === "all") {
            overwrittenProps[i] = vars;
            props = curLookup;
            curOverwriteProps = {};
          } else {
            curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
            props = vars;
          }
          for (p in props) {
            pt = curLookup && curLookup[p];
            if (pt) {
              if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                _removeLinkedListItem(this, pt, "_pt");
              }
              delete curLookup[p];
            }
            if (curOverwriteProps !== "all") {
              curOverwriteProps[p] = 1;
            }
          }
        }
      }
      this._initted && !this._pt && firstPT && _interrupt(this);
      return this;
    };
    Tween2.to = function to(targets, vars) {
      return new Tween2(targets, vars, arguments[2]);
    };
    Tween2.from = function from(targets, vars) {
      return _createTweenType(1, arguments);
    };
    Tween2.delayedCall = function delayedCall(delay, callback, params, scope) {
      return new Tween2(callback, 0, {
        immediateRender: false,
        lazy: false,
        overwrite: false,
        delay,
        onComplete: callback,
        onReverseComplete: callback,
        onCompleteParams: params,
        onReverseCompleteParams: params,
        callbackScope: scope
      });
    };
    Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
      return _createTweenType(2, arguments);
    };
    Tween2.set = function set(targets, vars) {
      vars.duration = 0;
      vars.repeatDelay || (vars.repeat = 0);
      return new Tween2(targets, vars);
    };
    Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      return _globalTimeline.killTweensOf(targets, props, onlyActive);
    };
    return Tween2;
  })(Animation);
  _setDefaults(Tween.prototype, {
    _targets: [],
    _lazy: 0,
    _startAt: 0,
    _op: 0,
    _onInit: 0
  });
  _forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
    Tween[name] = function() {
      var tl = new Timeline(), params = _slice.call(arguments, 0);
      params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
      return tl[name].apply(tl, params);
    };
  });
  var _setterPlain = function _setterPlain2(target, property, value) {
    return target[property] = value;
  }, _setterFunc = function _setterFunc2(target, property, value) {
    return target[property](value);
  }, _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
    return target[property](data.fp, value);
  }, _setterAttribute = function _setterAttribute2(target, property, value) {
    return target.setAttribute(property, value);
  }, _getSetter = function _getSetter2(target, property) {
    return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
  }, _renderPlain = function _renderPlain2(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
  }, _renderBoolean = function _renderBoolean2(ratio, data) {
    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
  }, _renderComplexString = function _renderComplexString2(ratio, data) {
    var pt = data._pt, s = "";
    if (!ratio && data.b) {
      s = data.b;
    } else if (ratio === 1 && data.e) {
      s = data.e;
    } else {
      while (pt) {
        s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s;
        pt = pt._next;
      }
      s += data.c;
    }
    data.set(data.t, data.p, s, data);
  }, _renderPropTweens = function _renderPropTweens2(ratio, data) {
    var pt = data._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
  }, _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
    var pt = this._pt, next;
    while (pt) {
      next = pt._next;
      pt.p === property && pt.modifier(modifier, tween, target);
      pt = next;
    }
  }, _killPropTweensOf = function _killPropTweensOf2(property) {
    var pt = this._pt, hasNonDependentRemaining, next;
    while (pt) {
      next = pt._next;
      if (pt.p === property && !pt.op || pt.op === property) {
        _removeLinkedListItem(this, pt, "_pt");
      } else if (!pt.dep) {
        hasNonDependentRemaining = 1;
      }
      pt = next;
    }
    return !hasNonDependentRemaining;
  }, _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
  }, _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
    var pt = parent._pt, next, pt2, first, last;
    while (pt) {
      next = pt._next;
      pt2 = first;
      while (pt2 && pt2.pr > pt.pr) {
        pt2 = pt2._next;
      }
      if (pt._prev = pt2 ? pt2._prev : last) {
        pt._prev._next = pt;
      } else {
        first = pt;
      }
      if (pt._next = pt2) {
        pt2._prev = pt;
      } else {
        last = pt;
      }
      pt = next;
    }
    parent._pt = first;
  };
  var PropTween = /* @__PURE__ */ (function() {
    function PropTween2(next, target, prop, start, change, renderer, data, setter, priority) {
      this.t = target;
      this.s = start;
      this.c = change;
      this.p = prop;
      this.r = renderer || _renderPlain;
      this.d = data || this;
      this.set = setter || _setterPlain;
      this.pr = priority || 0;
      this._next = next;
      if (next) {
        next._prev = this;
      }
    }
    var _proto4 = PropTween2.prototype;
    _proto4.modifier = function modifier(func, tween, target) {
      this.mSet = this.mSet || this.set;
      this.set = _setterWithModifier;
      this.m = func;
      this.mt = target;
      this.tween = tween;
    };
    return PropTween2;
  })();
  _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
    return _reservedProps[name] = 1;
  });
  _globals.TweenMax = _globals.TweenLite = Tween;
  _globals.TimelineLite = _globals.TimelineMax = Timeline;
  _globalTimeline = new Timeline({
    sortChildren: false,
    defaults: _defaults,
    autoRemoveChildren: true,
    id: "root",
    smoothChildTiming: true
  });
  _config.stringFilter = _colorStringFilter;
  var _media = [], _listeners = {}, _emptyArray = [], _lastMediaTime = 0, _contextID = 0, _dispatch = function _dispatch2(type) {
    return (_listeners[type] || _emptyArray).map(function(f) {
      return f();
    });
  }, _onMediaChange = function _onMediaChange2() {
    var time = Date.now(), matches2 = [];
    if (time - _lastMediaTime > 2) {
      _dispatch("matchMediaInit");
      _media.forEach(function(c) {
        var queries = c.queries, conditions = c.conditions, match, p, anyMatch, toggled;
        for (p in queries) {
          match = _win$1.matchMedia(queries[p]).matches;
          match && (anyMatch = 1);
          if (match !== conditions[p]) {
            conditions[p] = match;
            toggled = 1;
          }
        }
        if (toggled) {
          c.revert();
          anyMatch && matches2.push(c);
        }
      });
      _dispatch("matchMediaRevert");
      matches2.forEach(function(c) {
        return c.onMatch(c, function(func) {
          return c.add(null, func);
        });
      });
      _lastMediaTime = time;
      _dispatch("matchMedia");
    }
  };
  var Context = /* @__PURE__ */ (function() {
    function Context2(func, scope) {
      this.selector = scope && selector(scope);
      this.data = [];
      this._r = [];
      this.isReverted = false;
      this.id = _contextID++;
      func && this.add(func);
    }
    var _proto5 = Context2.prototype;
    _proto5.add = function add(name, func, scope) {
      if (_isFunction(name)) {
        scope = func;
        func = name;
        name = _isFunction;
      }
      var self2 = this, f = function f2() {
        var prev = _context, prevSelector = self2.selector, result;
        prev && prev !== self2 && prev.data.push(self2);
        scope && (self2.selector = selector(scope));
        _context = self2;
        result = func.apply(self2, arguments);
        _isFunction(result) && self2._r.push(result);
        _context = prev;
        self2.selector = prevSelector;
        self2.isReverted = false;
        return result;
      };
      self2.last = f;
      return name === _isFunction ? f(self2, function(func2) {
        return self2.add(null, func2);
      }) : name ? self2[name] = f : f;
    };
    _proto5.ignore = function ignore(func) {
      var prev = _context;
      _context = null;
      func(this);
      _context = prev;
    };
    _proto5.getTweens = function getTweens() {
      var a = [];
      this.data.forEach(function(e) {
        return e instanceof Context2 ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
      });
      return a;
    };
    _proto5.clear = function clear() {
      this._r.length = this.data.length = 0;
    };
    _proto5.kill = function kill(revert, matchMedia) {
      var _this4 = this;
      if (revert) {
        (function() {
          var tweens = _this4.getTweens(), i2 = _this4.data.length, t;
          while (i2--) {
            t = _this4.data[i2];
            if (t.data === "isFlip") {
              t.revert();
              t.getChildren(true, true, false).forEach(function(tween) {
                return tweens.splice(tweens.indexOf(tween), 1);
              });
            }
          }
          tweens.map(function(t2) {
            return {
              g: t2._dur || t2._delay || t2._sat && !t2._sat.vars.immediateRender ? t2.globalTime(0) : -Infinity,
              t: t2
            };
          }).sort(function(a, b) {
            return b.g - a.g || -Infinity;
          }).forEach(function(o) {
            return o.t.revert(revert);
          });
          i2 = _this4.data.length;
          while (i2--) {
            t = _this4.data[i2];
            if (t instanceof Timeline) {
              if (t.data !== "nested") {
                t.scrollTrigger && t.scrollTrigger.revert();
                t.kill();
              }
            } else {
              !(t instanceof Tween) && t.revert && t.revert(revert);
            }
          }
          _this4._r.forEach(function(f) {
            return f(revert, _this4);
          });
          _this4.isReverted = true;
        })();
      } else {
        this.data.forEach(function(e) {
          return e.kill && e.kill();
        });
      }
      this.clear();
      if (matchMedia) {
        var i = _media.length;
        while (i--) {
          _media[i].id === this.id && _media.splice(i, 1);
        }
      }
    };
    _proto5.revert = function revert(config) {
      this.kill(config || {});
    };
    return Context2;
  })();
  var MatchMedia = /* @__PURE__ */ (function() {
    function MatchMedia2(scope) {
      this.contexts = [];
      this.scope = scope;
      _context && _context.data.push(this);
    }
    var _proto6 = MatchMedia2.prototype;
    _proto6.add = function add(conditions, func, scope) {
      _isObject(conditions) || (conditions = {
        matches: conditions
      });
      var context = new Context(0, scope || this.scope), cond = context.conditions = {}, mq, p, active;
      _context && !context.selector && (context.selector = _context.selector);
      this.contexts.push(context);
      func = context.add("onMatch", func);
      context.queries = conditions;
      for (p in conditions) {
        if (p === "all") {
          active = 1;
        } else {
          mq = _win$1.matchMedia(conditions[p]);
          if (mq) {
            _media.indexOf(context) < 0 && _media.push(context);
            (cond[p] = mq.matches) && (active = 1);
            mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
          }
        }
      }
      active && func(context, function(f) {
        return context.add(null, f);
      });
      return this;
    };
    _proto6.revert = function revert(config) {
      this.kill(config || {});
    };
    _proto6.kill = function kill(revert) {
      this.contexts.forEach(function(c) {
        return c.kill(revert, true);
      });
    };
    return MatchMedia2;
  })();
  var _gsap = {
    registerPlugin: function registerPlugin() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      args.forEach(function(config) {
        return _createPlugin(config);
      });
    },
    timeline: function timeline(vars) {
      return new Timeline(vars);
    },
    getTweensOf: function getTweensOf(targets, onlyActive) {
      return _globalTimeline.getTweensOf(targets, onlyActive);
    },
    getProperty: function getProperty(target, property, unit, uncache) {
      _isString(target) && (target = toArray(target)[0]);
      var getter = _getCache(target || {}).get, format = unit ? _passThrough : _numericIfPossible;
      unit === "native" && (unit = "");
      return !target ? target : !property ? function(property2, unit2, uncache2) {
        return format((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
      } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    },
    quickSetter: function quickSetter(target, property, unit) {
      target = toArray(target);
      if (target.length > 1) {
        var setters = target.map(function(t) {
          return gsap$1.quickSetter(t, property, unit);
        }), l = setters.length;
        return function(value) {
          var i = l;
          while (i--) {
            setters[i](value);
          }
        };
      }
      target = target[0] || {};
      var Plugin = _plugins[property], cache = _getCache(target), p = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
        var p2 = new Plugin();
        _quickTween._pt = 0;
        p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
        p2.render(1, p2);
        _quickTween._pt && _renderPropTweens(1, _quickTween);
      } : cache.set(target, p);
      return Plugin ? setter : function(value) {
        return setter(target, p, unit ? value + unit : value, cache, 1);
      };
    },
    quickTo: function quickTo(target, property, vars) {
      var _setDefaults2;
      var tween = gsap$1.to(target, _setDefaults((_setDefaults2 = {}, _setDefaults2[property] = "+=0.1", _setDefaults2.paused = true, _setDefaults2.stagger = 0, _setDefaults2), vars || {})), func = function func2(value, start, startIsRelative) {
        return tween.resetTo(property, value, start, startIsRelative);
      };
      func.tween = tween;
      return func;
    },
    isTweening: function isTweening(targets) {
      return _globalTimeline.getTweensOf(targets, true).length > 0;
    },
    defaults: function defaults(value) {
      value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
      return _mergeDeep(_defaults, value || {});
    },
    config: function config(value) {
      return _mergeDeep(_config, value || {});
    },
    registerEffect: function registerEffect(_ref3) {
      var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
      (plugins || "").split(",").forEach(function(pluginName) {
        return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
      });
      _effects[name] = function(targets, vars, tl) {
        return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
      };
      if (extendTimeline) {
        Timeline.prototype[name] = function(targets, vars, position) {
          return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
        };
      }
    },
    registerEase: function registerEase(name, ease) {
      _easeMap[name] = _parseEase(ease);
    },
    parseEase: function parseEase(ease, defaultEase) {
      return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
    },
    getById: function getById(id) {
      return _globalTimeline.getById(id);
    },
    exportRoot: function exportRoot(vars, includeDelayedCalls) {
      if (vars === void 0) {
        vars = {};
      }
      var tl = new Timeline(vars), child, next;
      tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
      _globalTimeline.remove(tl);
      tl._dp = 0;
      tl._time = tl._tTime = _globalTimeline._time;
      child = _globalTimeline._first;
      while (child) {
        next = child._next;
        if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
          _addToTimeline(tl, child, child._start - child._delay);
        }
        child = next;
      }
      _addToTimeline(_globalTimeline, tl, 0);
      return tl;
    },
    context: function context(func, scope) {
      return func ? new Context(func, scope) : _context;
    },
    matchMedia: function matchMedia(scope) {
      return new MatchMedia(scope);
    },
    matchMediaRefresh: function matchMediaRefresh() {
      return _media.forEach(function(c) {
        var cond = c.conditions, found, p;
        for (p in cond) {
          if (cond[p]) {
            cond[p] = false;
            found = 1;
          }
        }
        found && c.revert();
      }) || _onMediaChange();
    },
    addEventListener: function addEventListener(type, callback) {
      var a = _listeners[type] || (_listeners[type] = []);
      ~a.indexOf(callback) || a.push(callback);
    },
    removeEventListener: function removeEventListener(type, callback) {
      var a = _listeners[type], i = a && a.indexOf(callback);
      i >= 0 && a.splice(i, 1);
    },
    utils: {
      wrap,
      wrapYoyo,
      distribute,
      random,
      snap,
      normalize,
      getUnit,
      clamp,
      splitColor,
      toArray,
      selector,
      mapRange,
      pipe,
      unitize,
      interpolate,
      shuffle
    },
    install: _install,
    effects: _effects,
    ticker: _ticker,
    updateRoot: Timeline.updateRoot,
    plugins: _plugins,
    globalTimeline: _globalTimeline,
    core: {
      PropTween,
      globals: _addGlobal,
      Tween,
      Timeline,
      Animation,
      getCache: _getCache,
      _removeLinkedListItem,
      reverting: function reverting() {
        return _reverting$1;
      },
      context: function context(toAdd) {
        if (toAdd && _context) {
          _context.data.push(toAdd);
          toAdd._ctx = _context;
        }
        return _context;
      },
      suppressOverwrites: function suppressOverwrites(value) {
        return _suppressOverwrites = value;
      }
    }
  };
  _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
    return _gsap[name] = Tween[name];
  });
  _ticker.add(Timeline.updateRoot);
  _quickTween = _gsap.to({}, {
    duration: 0
  });
  var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
    var pt = plugin._pt;
    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
      pt = pt._next;
    }
    return pt;
  }, _addModifiers = function _addModifiers2(tween, modifiers) {
    var targets = tween._targets, p, i, pt;
    for (p in modifiers) {
      i = targets.length;
      while (i--) {
        pt = tween._ptLookup[i][p];
        if (pt && (pt = pt.d)) {
          if (pt._pt) {
            pt = _getPluginPropTween(pt, p);
          }
          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
        }
      }
    }
  }, _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
    return {
      name,
      rawVars: 1,
      //don't pre-process function-based values or "random()" strings.
      init: function init2(target, vars, tween) {
        tween._onInit = function(tween2) {
          var temp, p;
          if (_isString(vars)) {
            temp = {};
            _forEachName(vars, function(name2) {
              return temp[name2] = 1;
            });
            vars = temp;
          }
          if (modifier) {
            temp = {};
            for (p in vars) {
              temp[p] = modifier(vars[p]);
            }
            vars = temp;
          }
          _addModifiers(tween2, vars);
        };
      }
    };
  };
  var gsap$1 = _gsap.registerPlugin({
    name: "attr",
    init: function init2(target, vars, tween, index, targets) {
      var p, pt, v;
      this.tween = tween;
      for (p in vars) {
        v = target.getAttribute(p) || "";
        pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
        pt.op = p;
        pt.b = v;
        this._props.push(p);
      }
    },
    render: function render(ratio, data) {
      var pt = data._pt;
      while (pt) {
        _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
        pt = pt._next;
      }
    }
  }, {
    name: "endArray",
    init: function init2(target, value) {
      var i = value.length;
      while (i--) {
        this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
      }
    }
  }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
  Tween.version = Timeline.version = gsap$1.version = "3.12.7";
  _coreReady = 1;
  _windowExists$1() && _wake();
  _easeMap.Power0;
  _easeMap.Power1;
  _easeMap.Power2;
  _easeMap.Power3;
  _easeMap.Power4;
  _easeMap.Linear;
  _easeMap.Quad;
  _easeMap.Cubic;
  _easeMap.Quart;
  _easeMap.Quint;
  _easeMap.Strong;
  _easeMap.Elastic;
  _easeMap.Back;
  _easeMap.SteppedEase;
  _easeMap.Bounce;
  _easeMap.Sine;
  _easeMap.Expo;
  _easeMap.Circ;
  /*!
   * CSSPlugin 3.12.7
   * https://gsap.com
   *
   * Copyright 2008-2025, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license or for
   * Club GSAP members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */
  var _win, _doc, _docElement, _pluginInitted, _tempDiv, _recentSetterPlugin, _reverting, _windowExists = function _windowExists2() {
    return typeof window !== "undefined";
  }, _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD$1 = Math.PI / 180, _atan2 = Math.atan2, _bigNum$1 = 1e8, _capsExp = /([A-Z])/g, _horizontalExp = /(left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
    autoAlpha: "opacity,visibility",
    scale: "scaleX,scaleY",
    alpha: "opacity"
  }, _renderCSSProp = function _renderCSSProp2(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
  }, _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
  }, _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
  }, _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
    var value = data.s + data.c * ratio;
    data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
  }, _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
  }, _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
  }, _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
    return target.style[property] = value;
  }, _setterCSSProp = function _setterCSSProp2(target, property, value) {
    return target.style.setProperty(property, value);
  }, _setterTransform = function _setterTransform2(target, property, value) {
    return target._gsap[property] = value;
  }, _setterScale = function _setterScale2(target, property, value) {
    return target._gsap.scaleX = target._gsap.scaleY = value;
  }, _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache.scaleX = cache.scaleY = value;
    cache.renderTransform(ratio, cache);
  }, _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache[property] = value;
    cache.renderTransform(ratio, cache);
  }, _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _saveStyle = function _saveStyle2(property, isNotCSS) {
    var _this = this;
    var target = this.target, style = target.style, cache = target._gsap;
    if (property in _transformProps && style) {
      this.tfm = this.tfm || {};
      if (property !== "transform") {
        property = _propertyAliases[property] || property;
        ~property.indexOf(",") ? property.split(",").forEach(function(a) {
          return _this.tfm[a] = _get(target, a);
        }) : this.tfm[property] = cache.x ? cache[property] : _get(target, property);
        property === _transformOriginProp && (this.tfm.zOrigin = cache.zOrigin);
      } else {
        return _propertyAliases.transform.split(",").forEach(function(p) {
          return _saveStyle2.call(_this, p, isNotCSS);
        });
      }
      if (this.props.indexOf(_transformProp) >= 0) {
        return;
      }
      if (cache.svg) {
        this.svgo = target.getAttribute("data-svg-origin");
        this.props.push(_transformOriginProp, isNotCSS, "");
      }
      property = _transformProp;
    }
    (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
  }, _removeIndependentTransforms = function _removeIndependentTransforms2(style) {
    if (style.translate) {
      style.removeProperty("translate");
      style.removeProperty("scale");
      style.removeProperty("rotate");
    }
  }, _revertStyle = function _revertStyle2() {
    var props = this.props, target = this.target, style = target.style, cache = target._gsap, i, p;
    for (i = 0; i < props.length; i += 3) {
      if (!props[i + 1]) {
        props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
      } else if (props[i + 1] === 2) {
        target[props[i]](props[i + 2]);
      } else {
        target[props[i]] = props[i + 2];
      }
    }
    if (this.tfm) {
      for (p in this.tfm) {
        cache[p] = this.tfm[p];
      }
      if (cache.svg) {
        cache.renderTransform();
        target.setAttribute("data-svg-origin", this.svgo || "");
      }
      i = _reverting();
      if ((!i || !i.isStart) && !style[_transformProp]) {
        _removeIndependentTransforms(style);
        if (cache.zOrigin && style[_transformOriginProp]) {
          style[_transformOriginProp] += " " + cache.zOrigin + "px";
          cache.zOrigin = 0;
          cache.renderTransform();
        }
        cache.uncache = 1;
      }
    }
  }, _getStyleSaver = function _getStyleSaver2(target, properties) {
    var saver = {
      target,
      props: [],
      revert: _revertStyle,
      save: _saveStyle
    };
    target._gsap || gsap$1.core.getCache(target);
    properties && target.style && target.nodeType && properties.split(",").forEach(function(p) {
      return saver.save(p);
    });
    return saver;
  }, _supports3D, _createElement = function _createElement2(type, ns) {
    var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type);
    return e && e.style ? e : _doc.createElement(type);
  }, _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
    var cs = getComputedStyle(target);
    return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
  }, _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = function _checkPropPrefix2(property, element, preferPrefix) {
    var e = element || _tempDiv, s = e.style, i = 5;
    if (property in s && !preferPrefix) {
      return property;
    }
    property = property.charAt(0).toUpperCase() + property.substr(1);
    while (i-- && !(_prefixes[i] + property in s)) {
    }
    return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
  }, _initCore$1 = function _initCore2() {
    if (_windowExists() && window.document) {
      _win = window;
      _doc = _win.document;
      _docElement = _doc.documentElement;
      _tempDiv = _createElement("div") || {
        style: {}
      };
      _createElement("div");
      _transformProp = _checkPropPrefix(_transformProp);
      _transformOriginProp = _transformProp + "Origin";
      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
      _supports3D = !!_checkPropPrefix("perspective");
      _reverting = gsap$1.core.reverting;
      _pluginInitted = 1;
    }
  }, _getReparentedCloneBBox = function _getReparentedCloneBBox2(target) {
    var owner = target.ownerSVGElement, svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), clone2 = target.cloneNode(true), bbox;
    clone2.style.display = "block";
    svg.appendChild(clone2);
    _docElement.appendChild(svg);
    try {
      bbox = clone2.getBBox();
    } catch (e) {
    }
    svg.removeChild(clone2);
    _docElement.removeChild(svg);
    return bbox;
  }, _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
    var i = attributesArray.length;
    while (i--) {
      if (target.hasAttribute(attributesArray[i])) {
        return target.getAttribute(attributesArray[i]);
      }
    }
  }, _getBBox = function _getBBox2(target) {
    var bounds, cloned;
    try {
      bounds = target.getBBox();
    } catch (error) {
      bounds = _getReparentedCloneBBox(target);
      cloned = 1;
    }
    bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target));
    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
      width: 0,
      height: 0
    } : bounds;
  }, _isSVG = function _isSVG2(e) {
    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
  }, _removeProperty = function _removeProperty2(target, property) {
    if (property) {
      var style = target.style, first2Chars;
      if (property in _transformProps && property !== _transformOriginProp) {
        property = _transformProp;
      }
      if (style.removeProperty) {
        first2Chars = property.substr(0, 2);
        if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
          property = "-" + property;
        }
        style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
      } else {
        style.removeAttribute(property);
      }
    }
  }, _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end, onlySetAtEnd) {
    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
    plugin._pt = pt;
    pt.b = beginning;
    pt.e = end;
    plugin._props.push(property);
    return pt;
  }, _nonConvertibleUnits = {
    deg: 1,
    rad: 1,
    turn: 1
  }, _nonStandardLayouts = {
    grid: 1,
    flex: 1
  }, _convertToUnit = function _convertToUnit2(target, property, value, unit) {
    var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache, isSVG;
    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
      return curValue;
    }
    curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
    isSVG = target.getCTM && _isSVG(target);
    if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
      px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
      return _round$2(toPercent ? curValue / px * amount : curValue / 100 * px);
    }
    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
    parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
    if (isSVG) {
      parent = (target.ownerSVGElement || {}).parentNode;
    }
    if (!parent || parent === _doc || !parent.appendChild) {
      parent = _doc.body;
    }
    cache = parent._gsap;
    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
      return _round$2(curValue / cache.width * amount);
    } else {
      if (toPercent && (property === "height" || property === "width")) {
        var v = target.style[property];
        target.style[property] = amount + unit;
        px = target[measureProperty];
        v ? target.style[property] = v : _removeProperty(target, property);
      } else {
        (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
        parent === target && (style.position = "static");
        parent.appendChild(_tempDiv);
        px = _tempDiv[measureProperty];
        parent.removeChild(_tempDiv);
        style.position = "absolute";
      }
      if (horizontal && toPercent) {
        cache = _getCache(parent);
        cache.time = _ticker.time;
        cache.width = parent[measureProperty];
      }
    }
    return _round$2(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
  }, _get = function _get2(target, property, unit, uncache) {
    var value;
    _pluginInitted || _initCore$1();
    if (property in _propertyAliases && property !== "transform") {
      property = _propertyAliases[property];
      if (~property.indexOf(",")) {
        property = property.split(",")[0];
      }
    }
    if (_transformProps[property] && property !== "transform") {
      value = _parseTransform(target, uncache);
      value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
    } else {
      value = target.style[property];
      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
      }
    }
    return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
  }, _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start, end) {
    if (!start || start === "none") {
      var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
      if (s && s !== start) {
        prop = p;
        start = s;
      } else if (prop === "borderColor") {
        start = _getComputedProperty(target, "borderTopColor");
      }
    }
    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues;
    pt.b = start;
    pt.e = end;
    start += "";
    end += "";
    if (end === "auto") {
      startValue = target.style[prop];
      target.style[prop] = end;
      end = _getComputedProperty(target, prop) || end;
      startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
    }
    a = [start, end];
    _colorStringFilter(a);
    start = a[0];
    end = a[1];
    startValues = start.match(_numWithUnitExp) || [];
    endValues = end.match(_numWithUnitExp) || [];
    if (endValues.length) {
      while (result = _numWithUnitExp.exec(end)) {
        endValue = result[0];
        chunk = end.substring(index, result.index);
        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
          color = 1;
        }
        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
          startNum = parseFloat(startValue) || 0;
          startUnit = startValue.substr((startNum + "").length);
          endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
          endNum = parseFloat(endValue);
          endUnit = endValue.substr((endNum + "").length);
          index = _numWithUnitExp.lastIndex - endUnit.length;
          if (!endUnit) {
            endUnit = endUnit || _config.units[prop] || startUnit;
            if (index === end.length) {
              end += endUnit;
              pt.e += endUnit;
            }
          }
          if (startUnit !== endUnit) {
            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
          }
          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: endNum - startNum,
            m: color && color < 4 || prop === "zIndex" ? Math.round : 0
          };
        }
      }
      pt.c = index < end.length ? end.substring(index, end.length) : "";
    } else {
      pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
    }
    _relExp.test(end) && (pt.e = 0);
    this._pt = pt;
    return pt;
  }, _keywordToPercent = {
    top: "0%",
    bottom: "100%",
    left: "0%",
    right: "100%",
    center: "50%"
  }, _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
    var split = value.split(" "), x = split[0], y = split[1] || "50%";
    if (x === "top" || x === "bottom" || y === "left" || y === "right") {
      value = x;
      x = y;
      y = value;
    }
    split[0] = _keywordToPercent[x] || x;
    split[1] = _keywordToPercent[y] || y;
    return split.join(" ");
  }, _renderClearProps = function _renderClearProps2(ratio, data) {
    if (data.tween && data.tween._time === data.tween._dur) {
      var target = data.t, style = target.style, props = data.u, cache = target._gsap, prop, clearTransforms, i;
      if (props === "all" || props === true) {
        style.cssText = "";
        clearTransforms = 1;
      } else {
        props = props.split(",");
        i = props.length;
        while (--i > -1) {
          prop = props[i];
          if (_transformProps[prop]) {
            clearTransforms = 1;
            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
          }
          _removeProperty(target, prop);
        }
      }
      if (clearTransforms) {
        _removeProperty(target, _transformProp);
        if (cache) {
          cache.svg && target.removeAttribute("transform");
          style.scale = style.rotate = style.translate = "none";
          _parseTransform(target, 1);
          cache.uncache = 1;
          _removeIndependentTransforms(style);
        }
      }
    }
  }, _specialProps = {
    clearProps: function clearProps(plugin, target, property, endValue, tween) {
      if (tween.data !== "isFromStart") {
        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
        pt.u = endValue;
        pt.pr = -10;
        pt.tween = tween;
        plugin._props.push(property);
        return 1;
      }
    }
    /* className feature (about 0.4kb gzipped).
    , className(plugin, target, property, endValue, tween) {
    	let _renderClassName = (ratio, data) => {
    			data.css.render(ratio, data.css);
    			if (!ratio || ratio === 1) {
    				let inline = data.rmv,
    					target = data.t,
    					p;
    				target.setAttribute("class", ratio ? data.e : data.b);
    				for (p in inline) {
    					_removeProperty(target, p);
    				}
    			}
    		},
    		_getAllStyles = (target) => {
    			let styles = {},
    				computed = getComputedStyle(target),
    				p;
    			for (p in computed) {
    				if (isNaN(p) && p !== "cssText" && p !== "length") {
    					styles[p] = computed[p];
    				}
    			}
    			_setDefaults(styles, _parseTransform(target, 1));
    			return styles;
    		},
    		startClassList = target.getAttribute("class"),
    		style = target.style,
    		cssText = style.cssText,
    		cache = target._gsap,
    		classPT = cache.classPT,
    		inlineToRemoveAtEnd = {},
    		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
    		changingVars = {},
    		startVars = _getAllStyles(target),
    		transformRelated = /(transform|perspective)/i,
    		endVars, p;
    	if (classPT) {
    		classPT.r(1, classPT.d);
    		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
    	}
    	target.setAttribute("class", data.e);
    	endVars = _getAllStyles(target, true);
    	target.setAttribute("class", startClassList);
    	for (p in endVars) {
    		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
    			changingVars[p] = endVars[p];
    			if (!style[p] && style[p] !== "0") {
    				inlineToRemoveAtEnd[p] = 1;
    			}
    		}
    	}
    	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
    	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
    		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
    	}
    	_parseTransform(target, true); //to clear the caching of transforms
    	data.css = new gsap.plugins.css();
    	data.css.init(target, changingVars, tween);
    	plugin._props.push(...data.css._props);
    	return 1;
    }
    */
  }, _identity2DMatrix = [1, 0, 0, 1, 0, 0], _rotationalProperties = {}, _isNullTransform = function _isNullTransform2(value) {
    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
  }, _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
    var matrixString = _getComputedProperty(target, _transformProp);
    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp$1).map(_round$2);
  }, _getMatrix = function _getMatrix2(target, force2D) {
    var cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
    if (cache.svg && target.getAttribute("transform")) {
      temp = target.transform.baseVal.consolidate().matrix;
      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
      temp = style.display;
      style.display = "block";
      parent = target.parentNode;
      if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
        addedToDOM = 1;
        nextSibling = target.nextElementSibling;
        _docElement.appendChild(target);
      }
      matrix = _getComputedTransformMatrixAsArray(target);
      temp ? style.display = temp : _removeProperty(target, "display");
      if (addedToDOM) {
        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
      }
    }
    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
  }, _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
    var cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
    if (!originIsAbsolute) {
      bounds = _getBBox(target);
      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
      x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
      y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
      xOrigin = x;
      yOrigin = y;
    }
    if (smooth || smooth !== false && cache.smooth) {
      tx = xOrigin - xOriginOld;
      ty = yOrigin - yOriginOld;
      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
    } else {
      cache.xOffset = cache.yOffset = 0;
    }
    cache.xOrigin = xOrigin;
    cache.yOrigin = yOrigin;
    cache.smooth = !!smooth;
    cache.origin = origin;
    cache.originIsAbsolute = !!originIsAbsolute;
    target.style[_transformOriginProp] = "0px 0px";
    if (pluginToAddPropTweensTo) {
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
    }
    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
  }, _parseTransform = function _parseTransform2(target, uncache) {
    var cache = target._gsap || new GSCache(target);
    if ("x" in cache && !uncache && !cache.uncache) {
      return cache;
    }
    var style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
    x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
    scaleX = scaleY = 1;
    cache.svg = !!(target.getCTM && _isSVG(target));
    if (cs.translate) {
      if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
        style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
      }
      style.scale = style.rotate = style.translate = "none";
    }
    matrix = _getMatrix(target, cache.svg);
    if (cache.svg) {
      if (cache.uncache) {
        t2 = target.getBBox();
        origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
        t1 = "";
      } else {
        t1 = !uncache && target.getAttribute("data-svg-origin");
      }
      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
    }
    xOrigin = cache.xOrigin || 0;
    yOrigin = cache.yOrigin || 0;
    if (matrix !== _identity2DMatrix) {
      a = matrix[0];
      b = matrix[1];
      c = matrix[2];
      d = matrix[3];
      x = a12 = matrix[4];
      y = a22 = matrix[5];
      if (matrix.length === 6) {
        scaleX = Math.sqrt(a * a + b * b);
        scaleY = Math.sqrt(d * d + c * c);
        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD$1)));
        if (cache.svg) {
          x -= xOrigin - (xOrigin * a + yOrigin * c);
          y -= yOrigin - (xOrigin * b + yOrigin * d);
        }
      } else {
        a32 = matrix[6];
        a42 = matrix[7];
        a13 = matrix[8];
        a23 = matrix[9];
        a33 = matrix[10];
        a43 = matrix[11];
        x = matrix[12];
        y = matrix[13];
        z = matrix[14];
        angle = _atan2(a32, a33);
        rotationX = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a12 * cos + a13 * sin;
          t2 = a22 * cos + a23 * sin;
          t3 = a32 * cos + a33 * sin;
          a13 = a12 * -sin + a13 * cos;
          a23 = a22 * -sin + a23 * cos;
          a33 = a32 * -sin + a33 * cos;
          a43 = a42 * -sin + a43 * cos;
          a12 = t1;
          a22 = t2;
          a32 = t3;
        }
        angle = _atan2(-c, a33);
        rotationY = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a * cos - a13 * sin;
          t2 = b * cos - a23 * sin;
          t3 = c * cos - a33 * sin;
          a43 = d * sin + a43 * cos;
          a = t1;
          b = t2;
          c = t3;
        }
        angle = _atan2(b, a);
        rotation = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(angle);
          sin = Math.sin(angle);
          t1 = a * cos + b * sin;
          t2 = a12 * cos + a22 * sin;
          b = b * cos - a * sin;
          a22 = a22 * cos - a12 * sin;
          a = t1;
          a12 = t2;
        }
        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
          rotationX = rotation = 0;
          rotationY = 180 - rotationY;
        }
        scaleX = _round$2(Math.sqrt(a * a + b * b + c * c));
        scaleY = _round$2(Math.sqrt(a22 * a22 + a32 * a32));
        angle = _atan2(a12, a22);
        skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
      }
      if (cache.svg) {
        t1 = target.getAttribute("transform");
        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
        t1 && target.setAttribute("transform", t1);
      }
    }
    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
      if (invertedScaleX) {
        scaleX *= -1;
        skewX += rotation <= 0 ? 180 : -180;
        rotation += rotation <= 0 ? 180 : -180;
      } else {
        scaleY *= -1;
        skewX += skewX <= 0 ? 180 : -180;
      }
    }
    uncache = uncache || cache.uncache;
    cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
    cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
    cache.z = z + px;
    cache.scaleX = _round$2(scaleX);
    cache.scaleY = _round$2(scaleY);
    cache.rotation = _round$2(rotation) + deg;
    cache.rotationX = _round$2(rotationX) + deg;
    cache.rotationY = _round$2(rotationY) + deg;
    cache.skewX = skewX + deg;
    cache.skewY = skewY + deg;
    cache.transformPerspective = perspective + px;
    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache.zOrigin || 0) {
      style[_transformOriginProp] = _firstTwoOnly(origin);
    }
    cache.xOffset = cache.yOffset = 0;
    cache.force3D = _config.force3D;
    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
    cache.uncache = 0;
    return cache;
  }, _firstTwoOnly = function _firstTwoOnly2(value) {
    return (value = value.split(" "))[0] + " " + value[1];
  }, _addPxTranslate = function _addPxTranslate2(target, start, value) {
    var unit = getUnit(start);
    return _round$2(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
  }, _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache) {
    cache.z = "0px";
    cache.rotationY = cache.rotationX = "0deg";
    cache.force3D = 0;
    _renderCSSTransforms(ratio, cache);
  }, _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache) {
    var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
      var angle = parseFloat(rotationY) * _DEG2RAD$1, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
      angle = parseFloat(rotationX) * _DEG2RAD$1;
      cos = Math.cos(angle);
      x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
      z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
    }
    if (transformPerspective !== _zeroPx) {
      transforms += "perspective(" + transformPerspective + _endParenthesis;
    }
    if (xPercent || yPercent) {
      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
    }
    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
      transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
    }
    if (rotation !== _zeroDeg) {
      transforms += "rotate(" + rotation + _endParenthesis;
    }
    if (rotationY !== _zeroDeg) {
      transforms += "rotateY(" + rotationY + _endParenthesis;
    }
    if (rotationX !== _zeroDeg) {
      transforms += "rotateX(" + rotationX + _endParenthesis;
    }
    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
    }
    target.style[_transformProp] = transforms || "translate(0, 0)";
  }, _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache) {
    var _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
    rotation = parseFloat(rotation);
    skewX = parseFloat(skewX);
    skewY = parseFloat(skewY);
    if (skewY) {
      skewY = parseFloat(skewY);
      skewX += skewY;
      rotation += skewY;
    }
    if (rotation || skewX) {
      rotation *= _DEG2RAD$1;
      skewX *= _DEG2RAD$1;
      a11 = Math.cos(rotation) * scaleX;
      a21 = Math.sin(rotation) * scaleX;
      a12 = Math.sin(rotation - skewX) * -scaleY;
      a22 = Math.cos(rotation - skewX) * scaleY;
      if (skewX) {
        skewY *= _DEG2RAD$1;
        temp = Math.tan(skewX - skewY);
        temp = Math.sqrt(1 + temp * temp);
        a12 *= temp;
        a22 *= temp;
        if (skewY) {
          temp = Math.tan(skewY);
          temp = Math.sqrt(1 + temp * temp);
          a11 *= temp;
          a21 *= temp;
        }
      }
      a11 = _round$2(a11);
      a21 = _round$2(a21);
      a12 = _round$2(a12);
      a22 = _round$2(a22);
    } else {
      a11 = scaleX;
      a22 = scaleY;
      a21 = a12 = 0;
    }
    if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
      tx = _convertToUnit(target, "x", x, "px");
      ty = _convertToUnit(target, "y", y, "px");
    }
    if (xOrigin || yOrigin || xOffset || yOffset) {
      tx = _round$2(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
      ty = _round$2(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
    }
    if (xPercent || yPercent) {
      temp = target.getBBox();
      tx = _round$2(tx + xPercent / 100 * temp.width);
      ty = _round$2(ty + yPercent / 100 * temp.height);
    }
    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
    target.setAttribute("transform", temp);
    forceCSS && (target.style[_transformProp] = temp);
  }, _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue) {
    var cap = 360, isString2 = _isString(endValue), endNum = parseFloat(endValue) * (isString2 && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
    if (isString2) {
      direction = endValue.split("_")[1];
      if (direction === "short") {
        change %= cap;
        if (change !== change % (cap / 2)) {
          change += change < 0 ? cap : -cap;
        }
      }
      if (direction === "cw" && change < 0) {
        change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      } else if (direction === "ccw" && change > 0) {
        change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      }
    }
    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
    pt.e = finalValue;
    pt.u = "deg";
    plugin._props.push(property);
    return pt;
  }, _assign = function _assign2(target, source) {
    for (var p in source) {
      target[p] = source[p];
    }
    return target;
  }, _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
    var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
    if (startCache.svg) {
      startValue = target.getAttribute("transform");
      target.setAttribute("transform", "");
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      _removeProperty(target, _transformProp);
      target.setAttribute("transform", startValue);
    } else {
      startValue = getComputedStyle(target)[_transformProp];
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      style[_transformProp] = startValue;
    }
    for (p in _transformProps) {
      startValue = startCache[p];
      endValue = endCache[p];
      if (startValue !== endValue && exclude.indexOf(p) < 0) {
        startUnit = getUnit(startValue);
        endUnit = getUnit(endValue);
        startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
        endNum = parseFloat(endValue);
        plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
        plugin._pt.u = endUnit || 0;
        plugin._props.push(p);
      }
    }
    _assign(endCache, startCache);
  };
  _forEachName("padding,margin,Width,Radius", function(name, index) {
    var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
      return index < 2 ? name + side : "border" + side + name;
    });
    _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
      var a, vars;
      if (arguments.length < 4) {
        a = props.map(function(prop) {
          return _get(plugin, prop, property);
        });
        vars = a.join(" ");
        return vars.split(a[0]).length === 5 ? a[0] : vars;
      }
      a = (endValue + "").split(" ");
      vars = {};
      props.forEach(function(prop, i) {
        return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
      });
      plugin.init(target, vars, tween);
    };
  });
  var CSSPlugin = {
    name: "css",
    register: _initCore$1,
    targetTest: function targetTest(target) {
      return target.style && target.nodeType;
    },
    init: function init2(target, vars, tween, index, targets) {
      var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority, inlineProps;
      _pluginInitted || _initCore$1();
      this.styles = this.styles || _getStyleSaver(target);
      inlineProps = this.styles.props;
      this.tween = tween;
      for (p in vars) {
        if (p === "autoRound") {
          continue;
        }
        endValue = vars[p];
        if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
          continue;
        }
        type = typeof endValue;
        specialProp = _specialProps[p];
        if (type === "function") {
          endValue = endValue.call(tween, index, target, targets);
          type = typeof endValue;
        }
        if (type === "string" && ~endValue.indexOf("random(")) {
          endValue = _replaceRandom(endValue);
        }
        if (specialProp) {
          specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
        } else if (p.substr(0, 2) === "--") {
          startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
          endValue += "";
          _colorExp.lastIndex = 0;
          if (!_colorExp.test(startValue)) {
            startUnit = getUnit(startValue);
            endUnit = getUnit(endValue);
          }
          endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
          this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
          props.push(p);
          inlineProps.push(p, 0, style[p]);
        } else if (type !== "undefined") {
          if (startAt && p in startAt) {
            startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
            _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
            getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
            (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
          } else {
            startValue = _get(target, p);
          }
          startNum = parseFloat(startValue);
          relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
          relative && (endValue = endValue.substr(2));
          endNum = parseFloat(endValue);
          if (p in _propertyAliases) {
            if (p === "autoAlpha") {
              if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                startNum = 0;
              }
              inlineProps.push("visibility", 0, style.visibility);
              _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
            }
            if (p !== "scale" && p !== "transform") {
              p = _propertyAliases[p];
              ~p.indexOf(",") && (p = p.split(",")[0]);
            }
          }
          isTransformRelated = p in _transformProps;
          if (isTransformRelated) {
            this.styles.save(p);
            if (!transformPropTween) {
              cache = target._gsap;
              cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
              smooth = vars.smoothOrigin !== false && cache.smooth;
              transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
              transformPropTween.dep = 1;
            }
            if (p === "scale") {
              this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
              this._pt.u = 0;
              props.push("scaleY", p);
              p += "X";
            } else if (p === "transformOrigin") {
              inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
              endValue = _convertKeywordsToPercentages(endValue);
              if (cache.svg) {
                _applySVGOrigin(target, endValue, 0, smooth, 0, this);
              } else {
                endUnit = parseFloat(endValue.split(" ")[2]) || 0;
                endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
                _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
              }
              continue;
            } else if (p === "svgOrigin") {
              _applySVGOrigin(target, endValue, 1, smooth, 0, this);
              continue;
            } else if (p in _rotationalProperties) {
              _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
              continue;
            } else if (p === "smoothOrigin") {
              _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
              continue;
            } else if (p === "force3D") {
              cache[p] = endValue;
              continue;
            } else if (p === "transform") {
              _addRawTransformPTs(this, endValue, target);
              continue;
            }
          } else if (!(p in style)) {
            p = _checkPropPrefix(p) || p;
          }
          if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
            startUnit = (startValue + "").substr((startNum + "").length);
            endNum || (endNum = 0);
            endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
            startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
            this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
            this._pt.u = endUnit || 0;
            if (startUnit !== endUnit && endUnit !== "%") {
              this._pt.b = startValue;
              this._pt.r = _renderCSSPropWithBeginning;
            }
          } else if (!(p in style)) {
            if (p in target) {
              this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
            } else if (p !== "parseTransform") {
              _missingPlugin(p, endValue);
              continue;
            }
          } else {
            _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
          }
          isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
          props.push(p);
        }
      }
      hasPriority && _sortPropTweensByPriority(this);
    },
    render: function render(ratio, data) {
      if (data.tween._time || !_reverting()) {
        var pt = data._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
      } else {
        data.styles.revert();
      }
    },
    get: _get,
    aliases: _propertyAliases,
    getSetter: function getSetter(target, property, plugin) {
      var p = _propertyAliases[property];
      p && p.indexOf(",") < 0 && (property = p);
      return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
    },
    core: {
      _removeProperty,
      _getMatrix
    }
  };
  gsap$1.utils.checkPrefix = _checkPropPrefix;
  gsap$1.core.getStyleSaver = _getStyleSaver;
  (function(positionAndScale, rotation, others, aliases) {
    var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
      _transformProps[name] = 1;
    });
    _forEachName(rotation, function(name) {
      _config.units[name] = "deg";
      _rotationalProperties[name] = 1;
    });
    _propertyAliases[all[13]] = positionAndScale + "," + rotation;
    _forEachName(aliases, function(name) {
      var split = name.split(":");
      _propertyAliases[split[1]] = all[split[0]];
    });
  })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
  _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
    _config.units[name] = "px";
  });
  gsap$1.registerPlugin(CSSPlugin);
  var gsapWithCSS = gsap$1.registerPlugin(CSSPlugin) || gsap$1;
  gsapWithCSS.core.Tween;
  /*!
   * paths 3.12.7
   * https://gsap.com
   *
   * Copyright 2008-2025, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license or for
   * Club GSAP members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */
  var _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig, _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig, _DEG2RAD = Math.PI / 180, _sin = Math.sin, _cos = Math.cos, _abs = Math.abs, _sqrt = Math.sqrt, _isNumber = function _isNumber2(value) {
    return typeof value === "number";
  }, _roundingNum = 1e5, _round$1 = function _round2(value) {
    return Math.round(value * _roundingNum) / _roundingNum || 0;
  };
  function transformRawPath(rawPath, a, b, c, d, tx, ty) {
    var j = rawPath.length, segment, l, i, x, y;
    while (--j > -1) {
      segment = rawPath[j];
      l = segment.length;
      for (i = 0; i < l; i += 2) {
        x = segment[i];
        y = segment[i + 1];
        segment[i] = x * a + y * c + tx;
        segment[i + 1] = x * b + y * d + ty;
      }
    }
    rawPath._dirty = 1;
    return rawPath;
  }
  function arcToSegment(lastX, lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
    if (lastX === x && lastY === y) {
      return;
    }
    rx = _abs(rx);
    ry = _abs(ry);
    var angleRad = angle % 360 * _DEG2RAD, cosAngle = _cos(angleRad), sinAngle = _sin(angleRad), PI = Math.PI, TWOPI = PI * 2, dx2 = (lastX - x) / 2, dy2 = (lastY - y) / 2, x1 = cosAngle * dx2 + sinAngle * dy2, y1 = -sinAngle * dx2 + cosAngle * dy2, x1_sq = x1 * x1, y1_sq = y1 * y1, radiiCheck = x1_sq / (rx * rx) + y1_sq / (ry * ry);
    if (radiiCheck > 1) {
      rx = _sqrt(radiiCheck) * rx;
      ry = _sqrt(radiiCheck) * ry;
    }
    var rx_sq = rx * rx, ry_sq = ry * ry, sq = (rx_sq * ry_sq - rx_sq * y1_sq - ry_sq * x1_sq) / (rx_sq * y1_sq + ry_sq * x1_sq);
    if (sq < 0) {
      sq = 0;
    }
    var coef = (largeArcFlag === sweepFlag ? -1 : 1) * _sqrt(sq), cx1 = coef * (rx * y1 / ry), cy1 = coef * -(ry * x1 / rx), sx2 = (lastX + x) / 2, sy2 = (lastY + y) / 2, cx = sx2 + (cosAngle * cx1 - sinAngle * cy1), cy = sy2 + (sinAngle * cx1 + cosAngle * cy1), ux = (x1 - cx1) / rx, uy = (y1 - cy1) / ry, vx = (-x1 - cx1) / rx, vy = (-y1 - cy1) / ry, temp = ux * ux + uy * uy, angleStart = (uy < 0 ? -1 : 1) * Math.acos(ux / _sqrt(temp)), angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos((ux * vx + uy * vy) / _sqrt(temp * (vx * vx + vy * vy)));
    isNaN(angleExtent) && (angleExtent = PI);
    if (!sweepFlag && angleExtent > 0) {
      angleExtent -= TWOPI;
    } else if (sweepFlag && angleExtent < 0) {
      angleExtent += TWOPI;
    }
    angleStart %= TWOPI;
    angleExtent %= TWOPI;
    var segments = Math.ceil(_abs(angleExtent) / (TWOPI / 4)), rawPath = [], angleIncrement = angleExtent / segments, controlLength = 4 / 3 * _sin(angleIncrement / 2) / (1 + _cos(angleIncrement / 2)), ma = cosAngle * rx, mb = sinAngle * rx, mc = sinAngle * -ry, md = cosAngle * ry, i;
    for (i = 0; i < segments; i++) {
      angle = angleStart + i * angleIncrement;
      x1 = _cos(angle);
      y1 = _sin(angle);
      ux = _cos(angle += angleIncrement);
      uy = _sin(angle);
      rawPath.push(x1 - controlLength * y1, y1 + controlLength * x1, ux + controlLength * uy, uy - controlLength * ux, ux, uy);
    }
    for (i = 0; i < rawPath.length; i += 2) {
      x1 = rawPath[i];
      y1 = rawPath[i + 1];
      rawPath[i] = x1 * ma + y1 * mc + cx;
      rawPath[i + 1] = x1 * mb + y1 * md + cy;
    }
    rawPath[i - 2] = x;
    rawPath[i - 1] = y;
    return rawPath;
  }
  function stringToRawPath(d) {
    var a = (d + "").replace(_scientific, function(m) {
      var n = +m;
      return n < 1e-4 && n > -1e-4 ? 0 : n;
    }).match(_svgPathExp) || [], path = [], relativeX = 0, relativeY = 0, twoThirds = 2 / 3, elements = a.length, points = 0, errorMessage = "ERROR: malformed path: " + d, i, j, x, y, command, isRelative, segment, startX, startY, difX, difY, beziers, prevCommand, flag1, flag2, line = function line2(sx, sy, ex, ey) {
      difX = (ex - sx) / 3;
      difY = (ey - sy) / 3;
      segment.push(sx + difX, sy + difY, ex - difX, ey - difY, ex, ey);
    };
    if (!d || !isNaN(a[0]) || isNaN(a[1])) {
      console.log(errorMessage);
      return path;
    }
    for (i = 0; i < elements; i++) {
      prevCommand = command;
      if (isNaN(a[i])) {
        command = a[i].toUpperCase();
        isRelative = command !== a[i];
      } else {
        i--;
      }
      x = +a[i + 1];
      y = +a[i + 2];
      if (isRelative) {
        x += relativeX;
        y += relativeY;
      }
      if (!i) {
        startX = x;
        startY = y;
      }
      if (command === "M") {
        if (segment) {
          if (segment.length < 8) {
            path.length -= 1;
          } else {
            points += segment.length;
          }
        }
        relativeX = startX = x;
        relativeY = startY = y;
        segment = [x, y];
        path.push(segment);
        i += 2;
        command = "L";
      } else if (command === "C") {
        if (!segment) {
          segment = [0, 0];
        }
        if (!isRelative) {
          relativeX = relativeY = 0;
        }
        segment.push(x, y, relativeX + a[i + 3] * 1, relativeY + a[i + 4] * 1, relativeX += a[i + 5] * 1, relativeY += a[i + 6] * 1);
        i += 6;
      } else if (command === "S") {
        difX = relativeX;
        difY = relativeY;
        if (prevCommand === "C" || prevCommand === "S") {
          difX += relativeX - segment[segment.length - 4];
          difY += relativeY - segment[segment.length - 3];
        }
        if (!isRelative) {
          relativeX = relativeY = 0;
        }
        segment.push(difX, difY, x, y, relativeX += a[i + 3] * 1, relativeY += a[i + 4] * 1);
        i += 4;
      } else if (command === "Q") {
        difX = relativeX + (x - relativeX) * twoThirds;
        difY = relativeY + (y - relativeY) * twoThirds;
        if (!isRelative) {
          relativeX = relativeY = 0;
        }
        relativeX += a[i + 3] * 1;
        relativeY += a[i + 4] * 1;
        segment.push(difX, difY, relativeX + (x - relativeX) * twoThirds, relativeY + (y - relativeY) * twoThirds, relativeX, relativeY);
        i += 4;
      } else if (command === "T") {
        difX = relativeX - segment[segment.length - 4];
        difY = relativeY - segment[segment.length - 3];
        segment.push(relativeX + difX, relativeY + difY, x + (relativeX + difX * 1.5 - x) * twoThirds, y + (relativeY + difY * 1.5 - y) * twoThirds, relativeX = x, relativeY = y);
        i += 2;
      } else if (command === "H") {
        line(relativeX, relativeY, relativeX = x, relativeY);
        i += 1;
      } else if (command === "V") {
        line(relativeX, relativeY, relativeX, relativeY = x + (isRelative ? relativeY - relativeX : 0));
        i += 1;
      } else if (command === "L" || command === "Z") {
        if (command === "Z") {
          x = startX;
          y = startY;
          segment.closed = true;
        }
        if (command === "L" || _abs(relativeX - x) > 0.5 || _abs(relativeY - y) > 0.5) {
          line(relativeX, relativeY, x, y);
          if (command === "L") {
            i += 2;
          }
        }
        relativeX = x;
        relativeY = y;
      } else if (command === "A") {
        flag1 = a[i + 4];
        flag2 = a[i + 5];
        difX = a[i + 6];
        difY = a[i + 7];
        j = 7;
        if (flag1.length > 1) {
          if (flag1.length < 3) {
            difY = difX;
            difX = flag2;
            j--;
          } else {
            difY = flag2;
            difX = flag1.substr(2);
            j -= 2;
          }
          flag2 = flag1.charAt(1);
          flag1 = flag1.charAt(0);
        }
        beziers = arcToSegment(relativeX, relativeY, +a[i + 1], +a[i + 2], +a[i + 3], +flag1, +flag2, (isRelative ? relativeX : 0) + difX * 1, (isRelative ? relativeY : 0) + difY * 1);
        i += j;
        if (beziers) {
          for (j = 0; j < beziers.length; j++) {
            segment.push(beziers[j]);
          }
        }
        relativeX = segment[segment.length - 2];
        relativeY = segment[segment.length - 1];
      } else {
        console.log(errorMessage);
      }
    }
    i = segment.length;
    if (i < 6) {
      path.pop();
      i = 0;
    } else if (segment[0] === segment[i - 2] && segment[1] === segment[i - 1]) {
      segment.closed = true;
    }
    path.totalPoints = points + i;
    return path;
  }
  function rawPathToString(rawPath) {
    if (_isNumber(rawPath[0])) {
      rawPath = [rawPath];
    }
    var result = "", l = rawPath.length, sl, s, i, segment;
    for (s = 0; s < l; s++) {
      segment = rawPath[s];
      result += "M" + _round$1(segment[0]) + "," + _round$1(segment[1]) + " C";
      sl = segment.length;
      for (i = 2; i < sl; i++) {
        result += _round$1(segment[i++]) + "," + _round$1(segment[i++]) + " " + _round$1(segment[i++]) + "," + _round$1(segment[i++]) + " " + _round$1(segment[i++]) + "," + _round$1(segment[i]) + " ";
      }
      if (segment.closed) {
        result += "z";
      }
    }
    return result;
  }
  /*!
   * CustomEase 3.12.7
   * https://gsap.com
   *
   * @license Copyright 2008-2025, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license or for
   * Club GSAP members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */
  var gsap, _coreInitted, _getGSAP = function _getGSAP2() {
    return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
  }, _initCore = function _initCore2() {
    gsap = _getGSAP();
    if (gsap) {
      gsap.registerEase("_CE", CustomEase.create);
      _coreInitted = 1;
    } else {
      console.warn("Please gsap.registerPlugin(CustomEase)");
    }
  }, _bigNum = 1e20, _round = function _round2(value) {
    return ~~(value * 1e3 + (value < 0 ? -0.5 : 0.5)) / 1e3;
  }, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/gi, _needsParsingExp = /[cLlsSaAhHvVtTqQ]/g, _findMinimum = function _findMinimum2(values) {
    var l = values.length, min = _bigNum, i;
    for (i = 1; i < l; i += 6) {
      +values[i] < min && (min = +values[i]);
    }
    return min;
  }, _normalize = function _normalize2(values, height, originY) {
    if (!originY && originY !== 0) {
      originY = Math.max(+values[values.length - 1], +values[1]);
    }
    var tx = +values[0] * -1, ty = -originY, l = values.length, sx = 1 / (+values[l - 2] + tx), sy = -height || (Math.abs(+values[l - 1] - +values[1]) < 0.01 * (+values[l - 2] - +values[0]) ? _findMinimum(values) + ty : +values[l - 1] + ty), i;
    if (sy) {
      sy = 1 / sy;
    } else {
      sy = -sx;
    }
    for (i = 0; i < l; i += 2) {
      values[i] = (+values[i] + tx) * sx;
      values[i + 1] = (+values[i + 1] + ty) * sy;
    }
  }, _bezierToPoints = function _bezierToPoints2(x1, y1, x2, y2, x3, y3, x4, y4, threshold, points, index) {
    var x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2, x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2, x34 = (x3 + x4) / 2, y34 = (y3 + y4) / 2, x123 = (x12 + x23) / 2, y123 = (y12 + y23) / 2, x234 = (x23 + x34) / 2, y234 = (y23 + y34) / 2, x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2, dx = x4 - x1, dy = y4 - y1, d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx), d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx), length;
    if (!points) {
      points = [{
        x: x1,
        y: y1
      }, {
        x: x4,
        y: y4
      }];
      index = 1;
    }
    points.splice(index || points.length - 1, 0, {
      x: x1234,
      y: y1234
    });
    if ((d2 + d3) * (d2 + d3) > threshold * (dx * dx + dy * dy)) {
      length = points.length;
      _bezierToPoints2(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, points, index);
      _bezierToPoints2(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, points, index + 1 + (points.length - length));
    }
    return points;
  };
  var CustomEase = /* @__PURE__ */ (function() {
    function CustomEase2(id, data, config) {
      _coreInitted || _initCore();
      this.id = id;
      this.setData(data, config);
    }
    var _proto = CustomEase2.prototype;
    _proto.setData = function setData(data, config) {
      config = config || {};
      data = data || "0,0,1,1";
      var values = data.match(_numExp), closest = 1, points = [], lookup = [], precision = config.precision || 1, fast = precision <= 1, l, a1, a2, i, inc, j, point, prevPoint, p;
      this.data = data;
      if (_needsParsingExp.test(data) || ~data.indexOf("M") && data.indexOf("C") < 0) {
        values = stringToRawPath(data)[0];
      }
      l = values.length;
      if (l === 4) {
        values.unshift(0, 0);
        values.push(1, 1);
        l = 8;
      } else if ((l - 2) % 6) {
        throw "Invalid CustomEase";
      }
      if (+values[0] !== 0 || +values[l - 2] !== 1) {
        _normalize(values, config.height, config.originY);
      }
      this.segment = values;
      for (i = 2; i < l; i += 6) {
        a1 = {
          x: +values[i - 2],
          y: +values[i - 1]
        };
        a2 = {
          x: +values[i + 4],
          y: +values[i + 5]
        };
        points.push(a1, a2);
        _bezierToPoints(a1.x, a1.y, +values[i], +values[i + 1], +values[i + 2], +values[i + 3], a2.x, a2.y, 1 / (precision * 2e5), points, points.length - 1);
      }
      l = points.length;
      for (i = 0; i < l; i++) {
        point = points[i];
        prevPoint = points[i - 1] || point;
        if ((point.x > prevPoint.x || prevPoint.y !== point.y && prevPoint.x === point.x || point === prevPoint) && point.x <= 1) {
          prevPoint.cx = point.x - prevPoint.x;
          prevPoint.cy = point.y - prevPoint.y;
          prevPoint.n = point;
          prevPoint.nx = point.x;
          if (fast && i > 1 && Math.abs(prevPoint.cy / prevPoint.cx - points[i - 2].cy / points[i - 2].cx) > 2) {
            fast = 0;
          }
          if (prevPoint.cx < closest) {
            if (!prevPoint.cx) {
              prevPoint.cx = 1e-3;
              if (i === l - 1) {
                prevPoint.x -= 1e-3;
                closest = Math.min(closest, 1e-3);
                fast = 0;
              }
            } else {
              closest = prevPoint.cx;
            }
          }
        } else {
          points.splice(i--, 1);
          l--;
        }
      }
      l = 1 / closest + 1 | 0;
      inc = 1 / l;
      j = 0;
      point = points[0];
      if (fast) {
        for (i = 0; i < l; i++) {
          p = i * inc;
          if (point.nx < p) {
            point = points[++j];
          }
          a1 = point.y + (p - point.x) / point.cx * point.cy;
          lookup[i] = {
            x: p,
            cx: inc,
            y: a1,
            cy: 0,
            nx: 9
          };
          if (i) {
            lookup[i - 1].cy = a1 - lookup[i - 1].y;
          }
        }
        j = points[points.length - 1];
        lookup[l - 1].cy = j.y - a1;
        lookup[l - 1].cx = j.x - lookup[lookup.length - 1].x;
      } else {
        for (i = 0; i < l; i++) {
          if (point.nx < i * inc) {
            point = points[++j];
          }
          lookup[i] = point;
        }
        if (j < points.length - 1) {
          lookup[i - 1] = points[points.length - 2];
        }
      }
      this.ease = function(p2) {
        var point2 = lookup[p2 * l | 0] || lookup[l - 1];
        if (point2.nx < p2) {
          point2 = point2.n;
        }
        return point2.y + (p2 - point2.x) / point2.cx * point2.cy;
      };
      this.ease.custom = this;
      this.id && gsap && gsap.registerEase(this.id, this.ease);
      return this;
    };
    _proto.getSVGData = function getSVGData(config) {
      return CustomEase2.getSVGData(this, config);
    };
    CustomEase2.create = function create(id, data, config) {
      return new CustomEase2(id, data, config).ease;
    };
    CustomEase2.register = function register(core) {
      gsap = core;
      _initCore();
    };
    CustomEase2.get = function get(id) {
      return gsap.parseEase(id);
    };
    CustomEase2.getSVGData = function getSVGData(ease, config) {
      config = config || {};
      var width = config.width || 100, height = config.height || 100, x = config.x || 0, y = (config.y || 0) + height, e = gsap.utils.toArray(config.path)[0], a, slope, i, inc, tx, ty, precision, threshold, prevX, prevY;
      if (config.invert) {
        height = -height;
        y = 0;
      }
      if (typeof ease === "string") {
        ease = gsap.parseEase(ease);
      }
      if (ease.custom) {
        ease = ease.custom;
      }
      if (ease instanceof CustomEase2) {
        a = rawPathToString(transformRawPath([ease.segment], width, 0, 0, -height, x, y));
      } else {
        a = [x, y];
        precision = Math.max(5, (config.precision || 1) * 200);
        inc = 1 / precision;
        precision += 2;
        threshold = 5 / precision;
        prevX = _round(x + inc * width);
        prevY = _round(y + ease(inc) * -height);
        slope = (prevY - y) / (prevX - x);
        for (i = 2; i < precision; i++) {
          tx = _round(x + i * inc * width);
          ty = _round(y + ease(i * inc) * -height);
          if (Math.abs((ty - prevY) / (tx - prevX) - slope) > threshold || i === precision - 1) {
            a.push(prevX, prevY);
            slope = (ty - prevY) / (tx - prevX);
          }
          prevX = tx;
          prevY = ty;
        }
        a = "M" + a.join(",");
      }
      e && e.setAttribute("d", a);
      return a;
    };
    return CustomEase2;
  })();
  CustomEase.version = "3.12.7";
  CustomEase.headless = true;
  _getGSAP() && gsap.registerPlugin(CustomEase);
  const easings = {
    slideEnter: "slideEnter",
    slideLeave: "slideLeave",
    easeInOutCubic: "easeInOutCubic"
  };
  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
  const RECIPROCAL_GR = 1 / GOLDEN_RATIO;
  const DURATION = RECIPROCAL_GR;
  gsapWithCSS.config({
    autoSleep: 60,
    nullTargetWarn: false
  });
  gsapWithCSS.registerPlugin(CustomEase);
  CustomEase.create(easings.slideEnter, "M0,0 C0.636,0.103 0.237,1 1,1");
  CustomEase.create(easings.slideLeave, "M0,0 C0.379,0.029 0.124,0.983 1,1");
  CustomEase.create(easings.easeInOutCubic, "M0,0 C0.636,0.103 0.237,1 1,1");
  gsapWithCSS.defaults({
    duration: DURATION
  });
  const slideUp = (el, options = {}) => {
    const duration = options.duration || 0.5;
    const tl = gsapWithCSS.timeline({
      onStart: () => {
        options.onStart?.();
      },
      onInterrupt: () => {
        options.onInterrupt?.();
      },
      onComplete: () => {
        el.style.display = "none";
        options.onComplete?.();
      }
    });
    gsapWithCSS.killTweensOf(el);
    if (!isVisible(el)) {
      return tl;
    }
    tl.to(el, {
      opacity: 0,
      ease: "power2.out",
      duration: duration * 0.85
    }).to(el, {
      height: 0,
      ease: easings.slideLeave,
      duration,
      onStart: () => {
        el.style.overflow = "hidden";
      },
      onComplete: () => {
        el.style.overflow = "";
        el.style.height = "";
      }
    }, "<");
    return tl;
  };
  const _A11yStatus = class _A11yStatus extends BaseComponent {
    static generate(parent) {
      if (!parent) {
        console.warn("A11yStatus: No parent element provided");
        return;
      }
      const el = document.createElement("div");
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("data-component", _A11yStatus.TYPE);
      el.classList.add("sr-only");
      parent.appendChild(el);
      return new _A11yStatus(el);
    }
    constructor(el) {
      super(el);
    }
    set text(text) {
      this.el.textContent = text;
    }
  };
  _A11yStatus.TYPE = "a11y-status";
  let A11yStatus = _A11yStatus;
  const selectors$g = {
    list: "ul",
    more: "a[data-more]"
  };
  const _ResultsDisplay = class _ResultsDisplay extends BaseComponent {
    constructor(el, options = {}) {
      super(el);
      this.settings = {
        ...options
      };
      this.productCards = [];
      this.list = null;
      this.a11yStatus = null;
      this.more = null;
      this.moreObserver = null;
      this.replacementTl = null;
      this.onMoreIntersection = this.onMoreIntersection.bind(this);
      this.setup();
    }
    setup() {
      this.productCards = this.qsa(ProductCard.SELECTOR).map((el) => new ProductCard(el));
      this.list = this.qs(selectors$g.list);
      this.more = this.qs(selectors$g.more);
      if (this.more) {
        const rootMargin = window.innerWidth < BREAKPOINTS.md ? "1000px" : `${Math.max(window.innerHeight * 2, 1500)}px`;
        this.moreObserver = new IntersectionObserver(this.onMoreIntersection, {
          root: null,
          rootMargin,
          threshold: 0.1
        });
        requestAnimationFrame(() => {
          this.moreObserver.observe(this.more);
        });
      }
      this.a11yStatus = A11yStatus.generate(this.el);
    }
    teardown() {
      this.productCards.forEach((card) => card.destroy());
      this.productCards = [];
      this.list = null;
      this.more = null;
      this.moreObserver?.disconnect();
      this.moreObserver = null;
      this.a11yStatus.el?.remove();
      this.a11yStatus.destroy();
      this.a11yStatus = null;
    }
    destroy() {
      this.replacementTl?.kill();
      this.replacementTl = null;
      this.teardown();
      super.destroy();
    }
    // Replace the entire contents of the results display
    replace(dom) {
      if (!this.validateDom(dom)) return;
      this.replacementTl = gsapWithCSS.timeline({ paused: true });
      this.replacementTl.to(this.el, {
        duration: 0.4,
        opacity: 0,
        ease: "power2.out",
        onStart: () => {
          this.settings.onReplaceStart?.(this);
        },
        onComplete: () => {
          this.teardown();
          this.el.innerHTML = dom.innerHTML;
          this.setup();
          gsapWithCSS.set(this.el, { clearProps: true });
          this.settings.onReplaceComplete?.(this);
        }
      });
      this.replacementTl.to(this.el, {
        duration: 1,
        delay: 0.25,
        opacity: 1,
        ease: "power2.in"
      });
      this.replacementTl.play();
    }
    add(dom) {
      if (!this.validateDom(dom)) return;
      const newList = dom.querySelector(selectors$g.list);
      const newItems = newList ? [...newList.children] : [];
      if (newItems.length) {
        const fragment = document.createDocumentFragment();
        newItems.forEach((el) => {
          fragment.append(el);
          const card = el.querySelector(ProductCard.SELECTOR);
          if (card) {
            this.productCards.push(new ProductCard(card));
          }
        });
        this.list.append(fragment);
        this.a11yStatus.text = `${newItems.length} items loaded`;
        const newMore = dom.querySelector(selectors$g.more);
        if (this.more && newMore) {
          this.more.href = newMore.href;
        } else {
          this.onNoMoreResults();
        }
      }
    }
    onNoMoreResults() {
      this.more.remove();
      this.more = null;
      this.moreObserver?.disconnect();
      this.moreObserver = null;
    }
    onMoreIntersection(entries) {
      if (!this.more) return;
      this.settings.onMoreIntersection?.(entries);
    }
  };
  _ResultsDisplay.TYPE = "results-display";
  let ResultsDisplay = _ResultsDisplay;
  const _ResultsSection = class _ResultsSection extends BaseSection {
    constructor(container) {
      super(container);
      this.isFetching = false;
      this.resultsDisplay = new ResultsDisplay(this.qs(ResultsDisplay.SELECTOR), {
        onMoreIntersection: this.onMoreIntersection.bind(this),
        onReplaceComplete: this.onReplaceComplete.bind(this)
      });
    }
    async fetchResults(url) {
      if (this.isFetching) return;
      try {
        this.isFetching = true;
        const fetchUrl = new URL(url, window.location.origin);
        fetchUrl.searchParams.set("t", Date.now().toString());
        fetchUrl.searchParams.set("section_id", this.id);
        const dom = await fetchDom(fetchUrl);
        return dom.getElementById(this.parentId)?.querySelector(ResultsDisplay.SELECTOR);
      } catch (e) {
        console.warn("something went wrong...", e);
      } finally {
        this.isFetching = false;
      }
    }
    async onMoreIntersection(entries) {
      const entry = entries[0];
      if (!entry.isIntersecting) return;
      try {
        const target = entry.target;
        const newResults = await this.fetchResults(target.href);
        this.resultsDisplay.add(newResults);
      } catch (e) {
        console.warn("something went wrong...", e);
      } finally {
        this.isFetching = false;
      }
    }
    onReplaceComplete(resultsDisplay) {
    }
  };
  _ResultsSection.TYPE = "results";
  let ResultsSection = _ResultsSection;
  const _CollectionSection = class _CollectionSection extends ResultsSection {
    constructor(container) {
      super(container);
    }
  };
  _CollectionSection.TYPE = "collection";
  let CollectionSection = _CollectionSection;
  const selectors$f = {
    price: "[data-price]",
    compare: "[data-compare]",
    comparePrice: "[data-compare-price]"
  };
  const _ProductPrice = class _ProductPrice extends BaseComponent {
    constructor(el) {
      super(el);
      this.price = this.qs(selectors$f.price);
      this.compare = this.qs(selectors$f.compare);
      this.comparePrice = this.qs(selectors$f.comparePrice);
    }
    /**
     * Updates the product price display based on the given variant.
     *
     * @param variant - The product variant object.
     * @param variant.price_formatted - The formatted price of the variant.
     * @param variant.price - The price of the variant.
     * @param variant.compare_at_price - The compare at price of the variant.
     * @param variant.compare_at_price_formatted - The formatted compare at price of the variant.
     */
    update(variant) {
      if (variant) {
        const onSale = variant.compare_at_price > variant.price;
        if (this.price) {
          this.price.textContent = variant.price_formatted;
        }
        if (this.compare) {
          this.comparePrice.textContent = onSale ? variant.compare_at_price_formatted : "";
          this.comparePrice.style.display = onSale ? "" : "none";
        }
        this.el.style.display = "";
      } else {
        this.el.style.display = "none";
      }
    }
  };
  _ProductPrice.TYPE = "product-price";
  let ProductPrice = _ProductPrice;
  const selectors$e = {
    label: "[data-label]"
  };
  const _ATCButton = class _ATCButton extends BaseComponent {
    constructor(el) {
      super(el);
      this.tempText = null;
      this.successTimeoutId = null;
      this.label = this.qs(selectors$e.label);
      if (!this.label) {
        console.warn("No label found");
      }
    }
    destroy() {
      window.clearTimeout(this.successTimeoutId);
      super.destroy();
    }
    /**
     * Updates the DOM state of the add to cart button based on the given variant.
     *
     * @param variant - LiteVariant object
     */
    update(variant) {
      let isDisabled2 = true;
      let labelText = getAppString("unavailable", "Unavailable");
      if (variant) {
        if (variant.available) {
          isDisabled2 = false;
          labelText = getAppString("addToCart", "Add To Cart");
        } else {
          isDisabled2 = true;
          labelText = getAppString("soldOut", "Sold Out");
        }
      }
      this.el.disabled = isDisabled2;
      this.label.textContent = labelText;
    }
    onAddStart() {
      this.tempText = this.label.innerText;
      this.label.innerText = getAppString("adding", "Adding...");
    }
    onAddSuccess() {
      this.label.innerText = getAppString("added", "Added!");
      this.successTimeoutId = setTimeout(() => {
        this.label.innerText = this.tempText;
        this.tempText = null;
      }, 1e3);
    }
    onAddFail(e) {
      this.label.innerText = this.tempText;
    }
  };
  _ATCButton.TYPE = "atc-button";
  let ATCButton = _ATCButton;
  const _VariantPickerOption = class _VariantPickerOption extends BaseComponent {
    constructor(el, options = {}) {
      super(el);
      this.settings = {
        ...options
      };
      this.name = this.dataset.name;
      if (!this.name) {
        console.warn("No name attribute found");
      }
      this.select = this.qs("select") || null;
      this.inputs = this.qsa("input");
      this.el.addEventListener("change", this.onChange.bind(this));
    }
    get selectedOption() {
      let name;
      let value;
      if (this.select) {
        name = this.select.name;
        value = this.select.value;
      } else {
        const selectedInput = this.inputs.find((input) => input.checked);
        if (selectedInput) {
          name = selectedInput.name;
          value = selectedInput.value;
        }
      }
      return name && value ? { name, value } : void 0;
    }
    updateValueAvailability(value, available) {
      if (this.select) {
        [...this.select.children].forEach((option) => {
          if (option.value === value) {
            option.disabled = !available;
          }
        });
      } else {
        const input = this.inputs.find((input2) => input2.value === value);
        if (!input) return;
        input.disabled = !available;
      }
    }
    onChange() {
      this.settings.onChange?.();
    }
  };
  _VariantPickerOption.TYPE = "variant-picker-option";
  let VariantPickerOption = _VariantPickerOption;
  const _VariantPicker = class _VariantPicker extends BaseComponent {
    constructor(el, options = {}) {
      super(el);
      this.settings = {
        product: null,
        ...options
      };
      this.product = this.settings.product;
      if (!this.product) {
        console.warn("Product required");
        return;
      }
      this.availableVariants = this.product.variants.filter((v) => v.available);
      this.onVariantPickerOptionChange = this.onVariantPickerOptionChange.bind(this);
      this.pickerOptions = this.qsa(VariantPickerOption.SELECTOR).map((el2) => {
        return new VariantPickerOption(el2, {
          onChange: this.onVariantPickerOptionChange
        });
      });
    }
    updateOptionValues(selectedOptions) {
      const checkOption = (idx, availableVariantsArray) => {
        const option = this.product.options_with_values[idx];
        if (!option) return;
        const pickerOption = this.pickerOptions.find((pO) => pO.name === option.name);
        option.values.forEach((value) => {
          const availableVariantsForValue = availableVariantsArray.filter((v) => v.options[idx] === value && v.available);
          pickerOption?.updateValueAvailability(value, availableVariantsForValue.length > 0);
          if (selectedOptions[idx]?.value === value && this.product.options_with_values[idx + 1]) {
            checkOption(idx + 1, availableVariantsForValue);
          }
        });
      };
      checkOption(0, this.availableVariants);
    }
    onVariantChange(e) {
      this.updateOptionValues(e.selectedOptions);
      this.settings.onVariantChange?.(e);
    }
    onVariantPickerOptionChange() {
      const selectedOptions = this.pickerOptions.map((pO) => pO.selectedOption).filter(Boolean);
      const variant = this.product.variants.find((variant2) => {
        return variant2.options.every((value, index) => value === selectedOptions[index]?.value);
      });
      this.onVariantChange({ variant, selectedOptions });
    }
  };
  _VariantPicker.TYPE = "variant-picker";
  let VariantPicker = _VariantPicker;
  const selectors$d = {
    form: 'form[action*="/cart/add"]',
    submit: '[type="submit"]',
    productJSON: "[data-product-json]",
    masterSelect: 'select[name="id"]'
  };
  const _ProductDetailForm = class _ProductDetailForm extends BaseComponent {
    /**
     * ProductDetailForm constructor
     *
     * @param el
     * @param options
     * @param options.onVariantChange -  Called when a new variant has been selected from the form,
     * @param options.enableHistoryState - If set to "true", turns on URL updating when switching variant
     */
    constructor(el, options = {}) {
      super(el);
      this.settings = {
        enableHistoryState: true,
        ...options
      };
      this.submitInProgress = false;
      this.form = this.qs(selectors$d.form);
      this.masterSelect = this.qs(selectors$d.masterSelect);
      this.product = JSON.parse(this.qs(selectors$d.productJSON).textContent);
      this.price = new ProductPrice(this.qs(ProductPrice.SELECTOR));
      this.atcButton = new ATCButton(this.qs(ATCButton.SELECTOR));
      this.variantPicker = new VariantPicker(this.qs(VariantPicker.SELECTOR), {
        product: this.product,
        onVariantChange: this.onVariantChange.bind(this)
      });
      this.a11yStatus = A11yStatus.generate(this.form);
      this.form.addEventListener("submit", this.onFormSubmit.bind(this));
    }
    updateHistoryState(variant) {
      if (!this.settings.enableHistoryState) return;
      const newurl = new URL(window.location.href);
      if (variant) {
        newurl.searchParams.set("variant", variant.id.toString());
      } else {
        newurl.searchParams.delete("variant");
      }
      window.history.replaceState({ path: newurl.href }, "", newurl.href);
    }
    onVariantChange(e) {
      const { variant } = e;
      this.masterSelect.value = variant?.id.toString() || "";
      this.updateHistoryState(variant);
      this.atcButton.update(variant);
      this.price.update(variant);
      if (variant) {
        this.a11yStatus.text = `Variant changed to ${variant.title}`;
      }
      this.settings.onVariantChange?.(e);
    }
    onFormSubmit(e) {
      e.preventDefault();
      if (this.submitInProgress) return;
      const submit = this.form.querySelector(selectors$d.submit);
      submit.disabled = true;
      this.submitInProgress = true;
      this.onAddStart();
      CartAPI.addItemFromForm(this.form).then(() => {
        this.onAddSuccess();
      }).catch((e2) => {
        this.onAddFail(e2);
      }).finally(() => {
        submit.disabled = false;
        this.submitInProgress = false;
      });
    }
    onAddStart() {
      this.a11yStatus.text = "Adding item to cart";
      this.form.setAttribute("aria-busy", toAriaBoolean(true));
      this.atcButton.onAddStart();
    }
    onAddSuccess() {
      this.a11yStatus.text = "Item added to cart";
      this.form.removeAttribute("aria-busy");
      this.atcButton.onAddSuccess();
    }
    onAddFail(e) {
      this.a11yStatus.text = e.message || "Error adding to cart";
      this.form.removeAttribute("aria-busy");
      this.atcButton.onAddFail(e);
    }
  };
  _ProductDetailForm.TYPE = "product-detail-form";
  let ProductDetailForm = _ProductDetailForm;
  function isNumber(subject) {
    return typeof subject === "number";
  }
  function isString(subject) {
    return typeof subject === "string";
  }
  function isBoolean(subject) {
    return typeof subject === "boolean";
  }
  function isObject(subject) {
    return Object.prototype.toString.call(subject) === "[object Object]";
  }
  function mathAbs(n) {
    return Math.abs(n);
  }
  function mathSign(n) {
    return Math.sign(n);
  }
  function deltaAbs(valueB, valueA) {
    return mathAbs(valueB - valueA);
  }
  function factorAbs(valueB, valueA) {
    if (valueB === 0 || valueA === 0) return 0;
    if (mathAbs(valueB) <= mathAbs(valueA)) return 0;
    const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA));
    return mathAbs(diff / valueB);
  }
  function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
  }
  function arrayKeys(array) {
    return objectKeys(array).map(Number);
  }
  function arrayLast(array) {
    return array[arrayLastIndex(array)];
  }
  function arrayLastIndex(array) {
    return Math.max(0, array.length - 1);
  }
  function arrayIsLastIndex(array, index) {
    return index === arrayLastIndex(array);
  }
  function arrayFromNumber(n, startAt = 0) {
    return Array.from(Array(n), (_, i) => startAt + i);
  }
  function objectKeys(object) {
    return Object.keys(object);
  }
  function objectsMergeDeep(objectA, objectB) {
    return [objectA, objectB].reduce((mergedObjects, currentObject) => {
      objectKeys(currentObject).forEach((key) => {
        const valueA = mergedObjects[key];
        const valueB = currentObject[key];
        const areObjects = isObject(valueA) && isObject(valueB);
        mergedObjects[key] = areObjects ? objectsMergeDeep(valueA, valueB) : valueB;
      });
      return mergedObjects;
    }, {});
  }
  function isMouseEvent(evt, ownerWindow) {
    return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
  }
  function Alignment(align, viewSize) {
    const predefined = {
      start,
      center,
      end
    };
    function start() {
      return 0;
    }
    function center(n) {
      return end(n) / 2;
    }
    function end(n) {
      return viewSize - n;
    }
    function measure(n, index) {
      if (isString(align)) return predefined[align](n);
      return align(viewSize, n, index);
    }
    const self2 = {
      measure
    };
    return self2;
  }
  function EventStore() {
    let listeners2 = [];
    function add(node, type, handler, options = {
      passive: true
    }) {
      let removeListener;
      if ("addEventListener" in node) {
        node.addEventListener(type, handler, options);
        removeListener = () => node.removeEventListener(type, handler, options);
      } else {
        const legacyMediaQueryList = node;
        legacyMediaQueryList.addListener(handler);
        removeListener = () => legacyMediaQueryList.removeListener(handler);
      }
      listeners2.push(removeListener);
      return self2;
    }
    function clear() {
      listeners2 = listeners2.filter((remove) => remove());
    }
    const self2 = {
      add,
      clear
    };
    return self2;
  }
  function Animations(ownerDocument, ownerWindow, update, render) {
    const documentVisibleHandler = EventStore();
    const fixedTimeStep = 1e3 / 60;
    let lastTimeStamp = null;
    let accumulatedTime = 0;
    let animationId = 0;
    function init2() {
      documentVisibleHandler.add(ownerDocument, "visibilitychange", () => {
        if (ownerDocument.hidden) reset();
      });
    }
    function destroy() {
      stop();
      documentVisibleHandler.clear();
    }
    function animate(timeStamp) {
      if (!animationId) return;
      if (!lastTimeStamp) {
        lastTimeStamp = timeStamp;
        update();
        update();
      }
      const timeElapsed = timeStamp - lastTimeStamp;
      lastTimeStamp = timeStamp;
      accumulatedTime += timeElapsed;
      while (accumulatedTime >= fixedTimeStep) {
        update();
        accumulatedTime -= fixedTimeStep;
      }
      const alpha = accumulatedTime / fixedTimeStep;
      render(alpha);
      if (animationId) {
        animationId = ownerWindow.requestAnimationFrame(animate);
      }
    }
    function start() {
      if (animationId) return;
      animationId = ownerWindow.requestAnimationFrame(animate);
    }
    function stop() {
      ownerWindow.cancelAnimationFrame(animationId);
      lastTimeStamp = null;
      accumulatedTime = 0;
      animationId = 0;
    }
    function reset() {
      lastTimeStamp = null;
      accumulatedTime = 0;
    }
    const self2 = {
      init: init2,
      destroy,
      start,
      stop,
      update,
      render
    };
    return self2;
  }
  function Axis(axis, contentDirection) {
    const isRightToLeft = contentDirection === "rtl";
    const isVertical = axis === "y";
    const scroll = isVertical ? "y" : "x";
    const cross = isVertical ? "x" : "y";
    const sign = !isVertical && isRightToLeft ? -1 : 1;
    const startEdge = getStartEdge();
    const endEdge = getEndEdge();
    function measureSize(nodeRect) {
      const {
        height,
        width
      } = nodeRect;
      return isVertical ? height : width;
    }
    function getStartEdge() {
      if (isVertical) return "top";
      return isRightToLeft ? "right" : "left";
    }
    function getEndEdge() {
      if (isVertical) return "bottom";
      return isRightToLeft ? "left" : "right";
    }
    function direction(n) {
      return n * sign;
    }
    const self2 = {
      scroll,
      cross,
      startEdge,
      endEdge,
      measureSize,
      direction
    };
    return self2;
  }
  function Limit(min = 0, max = 0) {
    const length = mathAbs(min - max);
    function reachedMin(n) {
      return n < min;
    }
    function reachedMax(n) {
      return n > max;
    }
    function reachedAny(n) {
      return reachedMin(n) || reachedMax(n);
    }
    function constrain(n) {
      if (!reachedAny(n)) return n;
      return reachedMin(n) ? min : max;
    }
    function removeOffset(n) {
      if (!length) return n;
      return n - length * Math.ceil((n - max) / length);
    }
    const self2 = {
      length,
      max,
      min,
      constrain,
      reachedAny,
      reachedMax,
      reachedMin,
      removeOffset
    };
    return self2;
  }
  function Counter(max, start, loop) {
    const {
      constrain
    } = Limit(0, max);
    const loopEnd = max + 1;
    let counter = withinLimit(start);
    function withinLimit(n) {
      return !loop ? constrain(n) : mathAbs((loopEnd + n) % loopEnd);
    }
    function get() {
      return counter;
    }
    function set(n) {
      counter = withinLimit(n);
      return self2;
    }
    function add(n) {
      return clone2().set(get() + n);
    }
    function clone2() {
      return Counter(max, get(), loop);
    }
    const self2 = {
      get,
      set,
      add,
      clone: clone2
    };
    return self2;
  }
  function DragHandler(axis, rootNode, ownerDocument, ownerWindow, target, dragTracker, location2, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, baseFriction, watchDrag) {
    const {
      cross: crossAxis,
      direction
    } = axis;
    const focusNodes = ["INPUT", "SELECT", "TEXTAREA"];
    const nonPassiveEvent = {
      passive: false
    };
    const initEvents = EventStore();
    const dragEvents = EventStore();
    const goToNextThreshold = Limit(50, 225).constrain(percentOfView.measure(20));
    const snapForceBoost = {
      mouse: 300,
      touch: 400
    };
    const freeForceBoost = {
      mouse: 500,
      touch: 600
    };
    const baseSpeed = dragFree ? 43 : 25;
    let isMoving = false;
    let startScroll = 0;
    let startCross = 0;
    let pointerIsDown = false;
    let preventScroll = false;
    let preventClick = false;
    let isMouse = false;
    function init2(emblaApi) {
      if (!watchDrag) return;
      function downIfAllowed(evt) {
        if (isBoolean(watchDrag) || watchDrag(emblaApi, evt)) down(evt);
      }
      const node = rootNode;
      initEvents.add(node, "dragstart", (evt) => evt.preventDefault(), nonPassiveEvent).add(node, "touchmove", () => void 0, nonPassiveEvent).add(node, "touchend", () => void 0).add(node, "touchstart", downIfAllowed).add(node, "mousedown", downIfAllowed).add(node, "touchcancel", up).add(node, "contextmenu", up).add(node, "click", click, true);
    }
    function destroy() {
      initEvents.clear();
      dragEvents.clear();
    }
    function addDragEvents() {
      const node = isMouse ? ownerDocument : rootNode;
      dragEvents.add(node, "touchmove", move, nonPassiveEvent).add(node, "touchend", up).add(node, "mousemove", move, nonPassiveEvent).add(node, "mouseup", up);
    }
    function isFocusNode(node) {
      const nodeName = node.nodeName || "";
      return focusNodes.includes(nodeName);
    }
    function forceBoost() {
      const boost = dragFree ? freeForceBoost : snapForceBoost;
      const type = isMouse ? "mouse" : "touch";
      return boost[type];
    }
    function allowedForce(force, targetChanged) {
      const next = index.add(mathSign(force) * -1);
      const baseForce = scrollTarget.byDistance(force, !dragFree).distance;
      if (dragFree || mathAbs(force) < goToNextThreshold) return baseForce;
      if (skipSnaps && targetChanged) return baseForce * 0.5;
      return scrollTarget.byIndex(next.get(), 0).distance;
    }
    function down(evt) {
      const isMouseEvt = isMouseEvent(evt, ownerWindow);
      isMouse = isMouseEvt;
      preventClick = dragFree && isMouseEvt && !evt.buttons && isMoving;
      isMoving = deltaAbs(target.get(), location2.get()) >= 2;
      if (isMouseEvt && evt.button !== 0) return;
      if (isFocusNode(evt.target)) return;
      pointerIsDown = true;
      dragTracker.pointerDown(evt);
      scrollBody.useFriction(0).useDuration(0);
      target.set(location2);
      addDragEvents();
      startScroll = dragTracker.readPoint(evt);
      startCross = dragTracker.readPoint(evt, crossAxis);
      eventHandler.emit("pointerDown");
    }
    function move(evt) {
      const isTouchEvt = !isMouseEvent(evt, ownerWindow);
      if (isTouchEvt && evt.touches.length >= 2) return up(evt);
      const lastScroll = dragTracker.readPoint(evt);
      const lastCross = dragTracker.readPoint(evt, crossAxis);
      const diffScroll = deltaAbs(lastScroll, startScroll);
      const diffCross = deltaAbs(lastCross, startCross);
      if (!preventScroll && !isMouse) {
        if (!evt.cancelable) return up(evt);
        preventScroll = diffScroll > diffCross;
        if (!preventScroll) return up(evt);
      }
      const diff = dragTracker.pointerMove(evt);
      if (diffScroll > dragThreshold) preventClick = true;
      scrollBody.useFriction(0.3).useDuration(0.75);
      animation.start();
      target.add(direction(diff));
      evt.preventDefault();
    }
    function up(evt) {
      const currentLocation = scrollTarget.byDistance(0, false);
      const targetChanged = currentLocation.index !== index.get();
      const rawForce = dragTracker.pointerUp(evt) * forceBoost();
      const force = allowedForce(direction(rawForce), targetChanged);
      const forceFactor = factorAbs(rawForce, force);
      const speed = baseSpeed - 10 * forceFactor;
      const friction = baseFriction + forceFactor / 50;
      preventScroll = false;
      pointerIsDown = false;
      dragEvents.clear();
      scrollBody.useDuration(speed).useFriction(friction);
      scrollTo.distance(force, !dragFree);
      isMouse = false;
      eventHandler.emit("pointerUp");
    }
    function click(evt) {
      if (preventClick) {
        evt.stopPropagation();
        evt.preventDefault();
        preventClick = false;
      }
    }
    function pointerDown() {
      return pointerIsDown;
    }
    const self2 = {
      init: init2,
      destroy,
      pointerDown
    };
    return self2;
  }
  function DragTracker(axis, ownerWindow) {
    const logInterval = 170;
    let startEvent;
    let lastEvent;
    function readTime(evt) {
      return evt.timeStamp;
    }
    function readPoint(evt, evtAxis) {
      const property = evtAxis || axis.scroll;
      const coord = `client${property === "x" ? "X" : "Y"}`;
      return (isMouseEvent(evt, ownerWindow) ? evt : evt.touches[0])[coord];
    }
    function pointerDown(evt) {
      startEvent = evt;
      lastEvent = evt;
      return readPoint(evt);
    }
    function pointerMove(evt) {
      const diff = readPoint(evt) - readPoint(lastEvent);
      const expired = readTime(evt) - readTime(startEvent) > logInterval;
      lastEvent = evt;
      if (expired) startEvent = evt;
      return diff;
    }
    function pointerUp(evt) {
      if (!startEvent || !lastEvent) return 0;
      const diffDrag = readPoint(lastEvent) - readPoint(startEvent);
      const diffTime = readTime(evt) - readTime(startEvent);
      const expired = readTime(evt) - readTime(lastEvent) > logInterval;
      const force = diffDrag / diffTime;
      const isFlick = diffTime && !expired && mathAbs(force) > 0.1;
      return isFlick ? force : 0;
    }
    const self2 = {
      pointerDown,
      pointerMove,
      pointerUp,
      readPoint
    };
    return self2;
  }
  function NodeRects() {
    function measure(node) {
      const {
        offsetTop,
        offsetLeft,
        offsetWidth,
        offsetHeight
      } = node;
      const offset = {
        top: offsetTop,
        right: offsetLeft + offsetWidth,
        bottom: offsetTop + offsetHeight,
        left: offsetLeft,
        width: offsetWidth,
        height: offsetHeight
      };
      return offset;
    }
    const self2 = {
      measure
    };
    return self2;
  }
  function PercentOfView(viewSize) {
    function measure(n) {
      return viewSize * (n / 100);
    }
    const self2 = {
      measure
    };
    return self2;
  }
  function ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects) {
    const observeNodes = [container].concat(slides);
    let resizeObserver;
    let containerSize;
    let slideSizes = [];
    let destroyed = false;
    function readSize(node) {
      return axis.measureSize(nodeRects.measure(node));
    }
    function init2(emblaApi) {
      if (!watchResize) return;
      containerSize = readSize(container);
      slideSizes = slides.map(readSize);
      function defaultCallback(entries) {
        for (const entry of entries) {
          if (destroyed) return;
          const isContainer = entry.target === container;
          const slideIndex = slides.indexOf(entry.target);
          const lastSize = isContainer ? containerSize : slideSizes[slideIndex];
          const newSize = readSize(isContainer ? container : slides[slideIndex]);
          const diffSize = mathAbs(newSize - lastSize);
          if (diffSize >= 0.5) {
            emblaApi.reInit();
            eventHandler.emit("resize");
            break;
          }
        }
      }
      resizeObserver = new ResizeObserver((entries) => {
        if (isBoolean(watchResize) || watchResize(emblaApi, entries)) {
          defaultCallback(entries);
        }
      });
      ownerWindow.requestAnimationFrame(() => {
        observeNodes.forEach((node) => resizeObserver.observe(node));
      });
    }
    function destroy() {
      destroyed = true;
      if (resizeObserver) resizeObserver.disconnect();
    }
    const self2 = {
      init: init2,
      destroy
    };
    return self2;
  }
  function ScrollBody(location2, offsetLocation, previousLocation, target, baseDuration, baseFriction) {
    let scrollVelocity = 0;
    let scrollDirection = 0;
    let scrollDuration = baseDuration;
    let scrollFriction = baseFriction;
    let rawLocation = location2.get();
    let rawLocationPrevious = 0;
    function seek() {
      const displacement = target.get() - location2.get();
      const isInstant = !scrollDuration;
      let scrollDistance = 0;
      if (isInstant) {
        scrollVelocity = 0;
        previousLocation.set(target);
        location2.set(target);
        scrollDistance = displacement;
      } else {
        previousLocation.set(location2);
        scrollVelocity += displacement / scrollDuration;
        scrollVelocity *= scrollFriction;
        rawLocation += scrollVelocity;
        location2.add(scrollVelocity);
        scrollDistance = rawLocation - rawLocationPrevious;
      }
      scrollDirection = mathSign(scrollDistance);
      rawLocationPrevious = rawLocation;
      return self2;
    }
    function settled() {
      const diff = target.get() - offsetLocation.get();
      return mathAbs(diff) < 1e-3;
    }
    function duration() {
      return scrollDuration;
    }
    function direction() {
      return scrollDirection;
    }
    function velocity() {
      return scrollVelocity;
    }
    function useBaseDuration() {
      return useDuration(baseDuration);
    }
    function useBaseFriction() {
      return useFriction(baseFriction);
    }
    function useDuration(n) {
      scrollDuration = n;
      return self2;
    }
    function useFriction(n) {
      scrollFriction = n;
      return self2;
    }
    const self2 = {
      direction,
      duration,
      velocity,
      seek,
      settled,
      useBaseFriction,
      useBaseDuration,
      useFriction,
      useDuration
    };
    return self2;
  }
  function ScrollBounds(limit, location2, target, scrollBody, percentOfView) {
    const pullBackThreshold = percentOfView.measure(10);
    const edgeOffsetTolerance = percentOfView.measure(50);
    const frictionLimit = Limit(0.1, 0.99);
    let disabled = false;
    function shouldConstrain() {
      if (disabled) return false;
      if (!limit.reachedAny(target.get())) return false;
      if (!limit.reachedAny(location2.get())) return false;
      return true;
    }
    function constrain(pointerDown) {
      if (!shouldConstrain()) return;
      const edge = limit.reachedMin(location2.get()) ? "min" : "max";
      const diffToEdge = mathAbs(limit[edge] - location2.get());
      const diffToTarget = target.get() - location2.get();
      const friction = frictionLimit.constrain(diffToEdge / edgeOffsetTolerance);
      target.subtract(diffToTarget * friction);
      if (!pointerDown && mathAbs(diffToTarget) < pullBackThreshold) {
        target.set(limit.constrain(target.get()));
        scrollBody.useDuration(25).useBaseFriction();
      }
    }
    function toggleActive(active) {
      disabled = !active;
    }
    const self2 = {
      shouldConstrain,
      constrain,
      toggleActive
    };
    return self2;
  }
  function ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance) {
    const scrollBounds = Limit(-contentSize + viewSize, 0);
    const snapsBounded = measureBounded();
    const scrollContainLimit = findScrollContainLimit();
    const snapsContained = measureContained();
    function usePixelTolerance(bound, snap2) {
      return deltaAbs(bound, snap2) <= 1;
    }
    function findScrollContainLimit() {
      const startSnap = snapsBounded[0];
      const endSnap = arrayLast(snapsBounded);
      const min = snapsBounded.lastIndexOf(startSnap);
      const max = snapsBounded.indexOf(endSnap) + 1;
      return Limit(min, max);
    }
    function measureBounded() {
      return snapsAligned.map((snapAligned, index) => {
        const {
          min,
          max
        } = scrollBounds;
        const snap2 = scrollBounds.constrain(snapAligned);
        const isFirst = !index;
        const isLast = arrayIsLastIndex(snapsAligned, index);
        if (isFirst) return max;
        if (isLast) return min;
        if (usePixelTolerance(min, snap2)) return min;
        if (usePixelTolerance(max, snap2)) return max;
        return snap2;
      }).map((scrollBound) => parseFloat(scrollBound.toFixed(3)));
    }
    function measureContained() {
      if (contentSize <= viewSize + pixelTolerance) return [scrollBounds.max];
      if (containScroll === "keepSnaps") return snapsBounded;
      const {
        min,
        max
      } = scrollContainLimit;
      return snapsBounded.slice(min, max);
    }
    const self2 = {
      snapsContained,
      scrollContainLimit
    };
    return self2;
  }
  function ScrollLimit(contentSize, scrollSnaps, loop) {
    const max = scrollSnaps[0];
    const min = loop ? max - contentSize : arrayLast(scrollSnaps);
    const limit = Limit(min, max);
    const self2 = {
      limit
    };
    return self2;
  }
  function ScrollLooper(contentSize, limit, location2, vectors) {
    const jointSafety = 0.1;
    const min = limit.min + jointSafety;
    const max = limit.max + jointSafety;
    const {
      reachedMin,
      reachedMax
    } = Limit(min, max);
    function shouldLoop(direction) {
      if (direction === 1) return reachedMax(location2.get());
      if (direction === -1) return reachedMin(location2.get());
      return false;
    }
    function loop(direction) {
      if (!shouldLoop(direction)) return;
      const loopDistance = contentSize * (direction * -1);
      vectors.forEach((v) => v.add(loopDistance));
    }
    const self2 = {
      loop
    };
    return self2;
  }
  function ScrollProgress(limit) {
    const {
      max,
      length
    } = limit;
    function get(n) {
      const currentLocation = n - max;
      return length ? currentLocation / -length : 0;
    }
    const self2 = {
      get
    };
    return self2;
  }
  function ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll) {
    const {
      startEdge,
      endEdge
    } = axis;
    const {
      groupSlides
    } = slidesToScroll;
    const alignments = measureSizes().map(alignment.measure);
    const snaps = measureUnaligned();
    const snapsAligned = measureAligned();
    function measureSizes() {
      return groupSlides(slideRects).map((rects) => arrayLast(rects)[endEdge] - rects[0][startEdge]).map(mathAbs);
    }
    function measureUnaligned() {
      return slideRects.map((rect) => containerRect[startEdge] - rect[startEdge]).map((snap2) => -mathAbs(snap2));
    }
    function measureAligned() {
      return groupSlides(snaps).map((g) => g[0]).map((snap2, index) => snap2 + alignments[index]);
    }
    const self2 = {
      snaps,
      snapsAligned
    };
    return self2;
  }
  function SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes) {
    const {
      groupSlides
    } = slidesToScroll;
    const {
      min,
      max
    } = scrollContainLimit;
    const slideRegistry = createSlideRegistry();
    function createSlideRegistry() {
      const groupedSlideIndexes = groupSlides(slideIndexes);
      const doNotContain = !containSnaps || containScroll === "keepSnaps";
      if (scrollSnaps.length === 1) return [slideIndexes];
      if (doNotContain) return groupedSlideIndexes;
      return groupedSlideIndexes.slice(min, max).map((group, index, groups) => {
        const isFirst = !index;
        const isLast = arrayIsLastIndex(groups, index);
        if (isFirst) {
          const range = arrayLast(groups[0]) + 1;
          return arrayFromNumber(range);
        }
        if (isLast) {
          const range = arrayLastIndex(slideIndexes) - arrayLast(groups)[0] + 1;
          return arrayFromNumber(range, arrayLast(groups)[0]);
        }
        return group;
      });
    }
    const self2 = {
      slideRegistry
    };
    return self2;
  }
  function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
    const {
      reachedAny,
      removeOffset,
      constrain
    } = limit;
    function minDistance(distances) {
      return distances.concat().sort((a, b) => mathAbs(a) - mathAbs(b))[0];
    }
    function findTargetSnap(target) {
      const distance = loop ? removeOffset(target) : constrain(target);
      const ascDiffsToSnaps = scrollSnaps.map((snap2, index2) => ({
        diff: shortcut(snap2 - distance, 0),
        index: index2
      })).sort((d1, d2) => mathAbs(d1.diff) - mathAbs(d2.diff));
      const {
        index
      } = ascDiffsToSnaps[0];
      return {
        index,
        distance
      };
    }
    function shortcut(target, direction) {
      const targets = [target, target + contentSize, target - contentSize];
      if (!loop) return target;
      if (!direction) return minDistance(targets);
      const matchingTargets = targets.filter((t) => mathSign(t) === direction);
      if (matchingTargets.length) return minDistance(matchingTargets);
      return arrayLast(targets) - contentSize;
    }
    function byIndex(index, direction) {
      const diffToSnap = scrollSnaps[index] - targetVector.get();
      const distance = shortcut(diffToSnap, direction);
      return {
        index,
        distance
      };
    }
    function byDistance(distance, snap2) {
      const target = targetVector.get() + distance;
      const {
        index,
        distance: targetSnapDistance
      } = findTargetSnap(target);
      const reachedBound = !loop && reachedAny(target);
      if (!snap2 || reachedBound) return {
        index,
        distance
      };
      const diffToSnap = scrollSnaps[index] - targetSnapDistance;
      const snapDistance = distance + shortcut(diffToSnap, 0);
      return {
        index,
        distance: snapDistance
      };
    }
    const self2 = {
      byDistance,
      byIndex,
      shortcut
    };
    return self2;
  }
  function ScrollTo(animation, indexCurrent, indexPrevious, scrollBody, scrollTarget, targetVector, eventHandler) {
    function scrollTo(target) {
      const distanceDiff = target.distance;
      const indexDiff = target.index !== indexCurrent.get();
      targetVector.add(distanceDiff);
      if (distanceDiff) {
        if (scrollBody.duration()) {
          animation.start();
        } else {
          animation.update();
          animation.render(1);
          animation.update();
        }
      }
      if (indexDiff) {
        indexPrevious.set(indexCurrent.get());
        indexCurrent.set(target.index);
        eventHandler.emit("select");
      }
    }
    function distance(n, snap2) {
      const target = scrollTarget.byDistance(n, snap2);
      scrollTo(target);
    }
    function index(n, direction) {
      const targetIndex = indexCurrent.clone().set(n);
      const target = scrollTarget.byIndex(targetIndex.get(), direction);
      scrollTo(target);
    }
    const self2 = {
      distance,
      index
    };
    return self2;
  }
  function SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus) {
    const focusListenerOptions = {
      passive: true,
      capture: true
    };
    let lastTabPressTime = 0;
    function init2(emblaApi) {
      if (!watchFocus) return;
      function defaultCallback(index) {
        const nowTime = (/* @__PURE__ */ new Date()).getTime();
        const diffTime = nowTime - lastTabPressTime;
        if (diffTime > 10) return;
        eventHandler.emit("slideFocusStart");
        root.scrollLeft = 0;
        const group = slideRegistry.findIndex((group2) => group2.includes(index));
        if (!isNumber(group)) return;
        scrollBody.useDuration(0);
        scrollTo.index(group, 0);
        eventHandler.emit("slideFocus");
      }
      eventStore.add(document, "keydown", registerTabPress, false);
      slides.forEach((slide, slideIndex) => {
        eventStore.add(slide, "focus", (evt) => {
          if (isBoolean(watchFocus) || watchFocus(emblaApi, evt)) {
            defaultCallback(slideIndex);
          }
        }, focusListenerOptions);
      });
    }
    function registerTabPress(event) {
      if (event.code === "Tab") lastTabPressTime = (/* @__PURE__ */ new Date()).getTime();
    }
    const self2 = {
      init: init2
    };
    return self2;
  }
  function Vector1D(initialValue) {
    let value = initialValue;
    function get() {
      return value;
    }
    function set(n) {
      value = normalizeInput(n);
    }
    function add(n) {
      value += normalizeInput(n);
    }
    function subtract(n) {
      value -= normalizeInput(n);
    }
    function normalizeInput(n) {
      return isNumber(n) ? n : n.get();
    }
    const self2 = {
      get,
      set,
      add,
      subtract
    };
    return self2;
  }
  function Translate(axis, container) {
    const translate = axis.scroll === "x" ? x : y;
    const containerStyle = container.style;
    let previousTarget = null;
    let disabled = false;
    function x(n) {
      return `translate3d(${n}px,0px,0px)`;
    }
    function y(n) {
      return `translate3d(0px,${n}px,0px)`;
    }
    function to(target) {
      if (disabled) return;
      const newTarget = roundToTwoDecimals(axis.direction(target));
      if (newTarget === previousTarget) return;
      containerStyle.transform = translate(newTarget);
      previousTarget = newTarget;
    }
    function toggleActive(active) {
      disabled = !active;
    }
    function clear() {
      if (disabled) return;
      containerStyle.transform = "";
      if (!container.getAttribute("style")) container.removeAttribute("style");
    }
    const self2 = {
      clear,
      to,
      toggleActive
    };
    return self2;
  }
  function SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, location2, slides) {
    const roundingSafety = 0.5;
    const ascItems = arrayKeys(slideSizesWithGaps);
    const descItems = arrayKeys(slideSizesWithGaps).reverse();
    const loopPoints = startPoints().concat(endPoints());
    function removeSlideSizes(indexes, from) {
      return indexes.reduce((a, i) => {
        return a - slideSizesWithGaps[i];
      }, from);
    }
    function slidesInGap(indexes, gap) {
      return indexes.reduce((a, i) => {
        const remainingGap = removeSlideSizes(a, gap);
        return remainingGap > 0 ? a.concat([i]) : a;
      }, []);
    }
    function findSlideBounds(offset) {
      return snaps.map((snap2, index) => ({
        start: snap2 - slideSizes[index] + roundingSafety + offset,
        end: snap2 + viewSize - roundingSafety + offset
      }));
    }
    function findLoopPoints(indexes, offset, isEndEdge) {
      const slideBounds = findSlideBounds(offset);
      return indexes.map((index) => {
        const initial = isEndEdge ? 0 : -contentSize;
        const altered = isEndEdge ? contentSize : 0;
        const boundEdge = isEndEdge ? "end" : "start";
        const loopPoint = slideBounds[index][boundEdge];
        return {
          index,
          loopPoint,
          slideLocation: Vector1D(-1),
          translate: Translate(axis, slides[index]),
          target: () => location2.get() > loopPoint ? initial : altered
        };
      });
    }
    function startPoints() {
      const gap = scrollSnaps[0];
      const indexes = slidesInGap(descItems, gap);
      return findLoopPoints(indexes, contentSize, false);
    }
    function endPoints() {
      const gap = viewSize - scrollSnaps[0] - 1;
      const indexes = slidesInGap(ascItems, gap);
      return findLoopPoints(indexes, -contentSize, true);
    }
    function canLoop() {
      return loopPoints.every(({
        index
      }) => {
        const otherIndexes = ascItems.filter((i) => i !== index);
        return removeSlideSizes(otherIndexes, viewSize) <= 0.1;
      });
    }
    function loop() {
      loopPoints.forEach((loopPoint) => {
        const {
          target,
          translate,
          slideLocation
        } = loopPoint;
        const shiftLocation = target();
        if (shiftLocation === slideLocation.get()) return;
        translate.to(shiftLocation);
        slideLocation.set(shiftLocation);
      });
    }
    function clear() {
      loopPoints.forEach((loopPoint) => loopPoint.translate.clear());
    }
    const self2 = {
      canLoop,
      clear,
      loop,
      loopPoints
    };
    return self2;
  }
  function SlidesHandler(container, eventHandler, watchSlides) {
    let mutationObserver;
    let destroyed = false;
    function init2(emblaApi) {
      if (!watchSlides) return;
      function defaultCallback(mutations) {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            emblaApi.reInit();
            eventHandler.emit("slidesChanged");
            break;
          }
        }
      }
      mutationObserver = new MutationObserver((mutations) => {
        if (destroyed) return;
        if (isBoolean(watchSlides) || watchSlides(emblaApi, mutations)) {
          defaultCallback(mutations);
        }
      });
      mutationObserver.observe(container, {
        childList: true
      });
    }
    function destroy() {
      if (mutationObserver) mutationObserver.disconnect();
      destroyed = true;
    }
    const self2 = {
      init: init2,
      destroy
    };
    return self2;
  }
  function SlidesInView(container, slides, eventHandler, threshold) {
    const intersectionEntryMap = {};
    let inViewCache = null;
    let notInViewCache = null;
    let intersectionObserver;
    let destroyed = false;
    function init2() {
      intersectionObserver = new IntersectionObserver((entries) => {
        if (destroyed) return;
        entries.forEach((entry) => {
          const index = slides.indexOf(entry.target);
          intersectionEntryMap[index] = entry;
        });
        inViewCache = null;
        notInViewCache = null;
        eventHandler.emit("slidesInView");
      }, {
        root: container.parentElement,
        threshold
      });
      slides.forEach((slide) => intersectionObserver.observe(slide));
    }
    function destroy() {
      if (intersectionObserver) intersectionObserver.disconnect();
      destroyed = true;
    }
    function createInViewList(inView) {
      return objectKeys(intersectionEntryMap).reduce((list, slideIndex) => {
        const index = parseInt(slideIndex);
        const {
          isIntersecting
        } = intersectionEntryMap[index];
        const inViewMatch = inView && isIntersecting;
        const notInViewMatch = !inView && !isIntersecting;
        if (inViewMatch || notInViewMatch) list.push(index);
        return list;
      }, []);
    }
    function get(inView = true) {
      if (inView && inViewCache) return inViewCache;
      if (!inView && notInViewCache) return notInViewCache;
      const slideIndexes = createInViewList(inView);
      if (inView) inViewCache = slideIndexes;
      if (!inView) notInViewCache = slideIndexes;
      return slideIndexes;
    }
    const self2 = {
      init: init2,
      destroy,
      get
    };
    return self2;
  }
  function SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow) {
    const {
      measureSize,
      startEdge,
      endEdge
    } = axis;
    const withEdgeGap = slideRects[0] && readEdgeGap;
    const startGap = measureStartGap();
    const endGap = measureEndGap();
    const slideSizes = slideRects.map(measureSize);
    const slideSizesWithGaps = measureWithGaps();
    function measureStartGap() {
      if (!withEdgeGap) return 0;
      const slideRect = slideRects[0];
      return mathAbs(containerRect[startEdge] - slideRect[startEdge]);
    }
    function measureEndGap() {
      if (!withEdgeGap) return 0;
      const style = ownerWindow.getComputedStyle(arrayLast(slides));
      return parseFloat(style.getPropertyValue(`margin-${endEdge}`));
    }
    function measureWithGaps() {
      return slideRects.map((rect, index, rects) => {
        const isFirst = !index;
        const isLast = arrayIsLastIndex(rects, index);
        if (isFirst) return slideSizes[index] + startGap;
        if (isLast) return slideSizes[index] + endGap;
        return rects[index + 1][startEdge] - rect[startEdge];
      }).map(mathAbs);
    }
    const self2 = {
      slideSizes,
      slideSizesWithGaps,
      startGap,
      endGap
    };
    return self2;
  }
  function SlidesToScroll(axis, viewSize, slidesToScroll, loop, containerRect, slideRects, startGap, endGap, pixelTolerance) {
    const {
      startEdge,
      endEdge,
      direction
    } = axis;
    const groupByNumber = isNumber(slidesToScroll);
    function byNumber(array, groupSize) {
      return arrayKeys(array).filter((i) => i % groupSize === 0).map((i) => array.slice(i, i + groupSize));
    }
    function bySize(array) {
      if (!array.length) return [];
      return arrayKeys(array).reduce((groups, rectB, index) => {
        const rectA = arrayLast(groups) || 0;
        const isFirst = rectA === 0;
        const isLast = rectB === arrayLastIndex(array);
        const edgeA = containerRect[startEdge] - slideRects[rectA][startEdge];
        const edgeB = containerRect[startEdge] - slideRects[rectB][endEdge];
        const gapA = !loop && isFirst ? direction(startGap) : 0;
        const gapB = !loop && isLast ? direction(endGap) : 0;
        const chunkSize = mathAbs(edgeB - gapB - (edgeA + gapA));
        if (index && chunkSize > viewSize + pixelTolerance) groups.push(rectB);
        if (isLast) groups.push(array.length);
        return groups;
      }, []).map((currentSize, index, groups) => {
        const previousSize = Math.max(groups[index - 1] || 0);
        return array.slice(previousSize, currentSize);
      });
    }
    function groupSlides(array) {
      return groupByNumber ? byNumber(array, slidesToScroll) : bySize(array);
    }
    const self2 = {
      groupSlides
    };
    return self2;
  }
  function Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler) {
    const {
      align,
      axis: scrollAxis,
      direction,
      startIndex,
      loop,
      duration,
      dragFree,
      dragThreshold,
      inViewThreshold,
      slidesToScroll: groupSlides,
      skipSnaps,
      containScroll,
      watchResize,
      watchSlides,
      watchDrag,
      watchFocus
    } = options;
    const pixelTolerance = 2;
    const nodeRects = NodeRects();
    const containerRect = nodeRects.measure(container);
    const slideRects = slides.map(nodeRects.measure);
    const axis = Axis(scrollAxis, direction);
    const viewSize = axis.measureSize(containerRect);
    const percentOfView = PercentOfView(viewSize);
    const alignment = Alignment(align, viewSize);
    const containSnaps = !loop && !!containScroll;
    const readEdgeGap = loop || !!containScroll;
    const {
      slideSizes,
      slideSizesWithGaps,
      startGap,
      endGap
    } = SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow);
    const slidesToScroll = SlidesToScroll(axis, viewSize, groupSlides, loop, containerRect, slideRects, startGap, endGap, pixelTolerance);
    const {
      snaps,
      snapsAligned
    } = ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll);
    const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps);
    const {
      snapsContained,
      scrollContainLimit
    } = ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance);
    const scrollSnaps = containSnaps ? snapsContained : snapsAligned;
    const {
      limit
    } = ScrollLimit(contentSize, scrollSnaps, loop);
    const index = Counter(arrayLastIndex(scrollSnaps), startIndex, loop);
    const indexPrevious = index.clone();
    const slideIndexes = arrayKeys(slides);
    const update = ({
      dragHandler,
      scrollBody: scrollBody2,
      scrollBounds,
      options: {
        loop: loop2
      }
    }) => {
      if (!loop2) scrollBounds.constrain(dragHandler.pointerDown());
      scrollBody2.seek();
    };
    const render = ({
      scrollBody: scrollBody2,
      translate,
      location: location3,
      offsetLocation: offsetLocation2,
      previousLocation: previousLocation2,
      scrollLooper,
      slideLooper,
      dragHandler,
      animation: animation2,
      eventHandler: eventHandler2,
      scrollBounds,
      options: {
        loop: loop2
      }
    }, alpha) => {
      const shouldSettle = scrollBody2.settled();
      const withinBounds = !scrollBounds.shouldConstrain();
      const hasSettled = loop2 ? shouldSettle : shouldSettle && withinBounds;
      const hasSettledAndIdle = hasSettled && !dragHandler.pointerDown();
      if (hasSettledAndIdle) animation2.stop();
      const interpolatedLocation = location3.get() * alpha + previousLocation2.get() * (1 - alpha);
      offsetLocation2.set(interpolatedLocation);
      if (loop2) {
        scrollLooper.loop(scrollBody2.direction());
        slideLooper.loop();
      }
      translate.to(offsetLocation2.get());
      if (hasSettledAndIdle) eventHandler2.emit("settle");
      if (!hasSettled) eventHandler2.emit("scroll");
    };
    const animation = Animations(ownerDocument, ownerWindow, () => update(engine), (alpha) => render(engine, alpha));
    const friction = 0.68;
    const startLocation = scrollSnaps[index.get()];
    const location2 = Vector1D(startLocation);
    const previousLocation = Vector1D(startLocation);
    const offsetLocation = Vector1D(startLocation);
    const target = Vector1D(startLocation);
    const scrollBody = ScrollBody(location2, offsetLocation, previousLocation, target, duration, friction);
    const scrollTarget = ScrollTarget(loop, scrollSnaps, contentSize, limit, target);
    const scrollTo = ScrollTo(animation, index, indexPrevious, scrollBody, scrollTarget, target, eventHandler);
    const scrollProgress = ScrollProgress(limit);
    const eventStore = EventStore();
    const slidesInView = SlidesInView(container, slides, eventHandler, inViewThreshold);
    const {
      slideRegistry
    } = SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes);
    const slideFocus = SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus);
    const engine = {
      ownerDocument,
      ownerWindow,
      eventHandler,
      containerRect,
      slideRects,
      animation,
      axis,
      dragHandler: DragHandler(axis, root, ownerDocument, ownerWindow, target, DragTracker(axis, ownerWindow), location2, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, friction, watchDrag),
      eventStore,
      percentOfView,
      index,
      indexPrevious,
      limit,
      location: location2,
      offsetLocation,
      previousLocation,
      options,
      resizeHandler: ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects),
      scrollBody,
      scrollBounds: ScrollBounds(limit, offsetLocation, target, scrollBody, percentOfView),
      scrollLooper: ScrollLooper(contentSize, limit, offsetLocation, [location2, offsetLocation, previousLocation, target]),
      scrollProgress,
      scrollSnapList: scrollSnaps.map(scrollProgress.get),
      scrollSnaps,
      scrollTarget,
      scrollTo,
      slideLooper: SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, offsetLocation, slides),
      slideFocus,
      slidesHandler: SlidesHandler(container, eventHandler, watchSlides),
      slidesInView,
      slideIndexes,
      slideRegistry,
      slidesToScroll,
      target,
      translate: Translate(axis, container)
    };
    return engine;
  }
  function EventHandler() {
    let listeners2 = {};
    let api;
    function init2(emblaApi) {
      api = emblaApi;
    }
    function getListeners(evt) {
      return listeners2[evt] || [];
    }
    function emit(evt) {
      getListeners(evt).forEach((e) => e(api, evt));
      return self2;
    }
    function on(evt, cb) {
      listeners2[evt] = getListeners(evt).concat([cb]);
      return self2;
    }
    function off(evt, cb) {
      listeners2[evt] = getListeners(evt).filter((e) => e !== cb);
      return self2;
    }
    function clear() {
      listeners2 = {};
    }
    const self2 = {
      init: init2,
      emit,
      off,
      on,
      clear
    };
    return self2;
  }
  const defaultOptions = {
    align: "center",
    axis: "x",
    container: null,
    slides: null,
    containScroll: "trimSnaps",
    direction: "ltr",
    slidesToScroll: 1,
    inViewThreshold: 0,
    breakpoints: {},
    dragFree: false,
    dragThreshold: 10,
    loop: false,
    skipSnaps: false,
    duration: 25,
    startIndex: 0,
    active: true,
    watchDrag: true,
    watchResize: true,
    watchSlides: true,
    watchFocus: true
  };
  function OptionsHandler(ownerWindow) {
    function mergeOptions(optionsA, optionsB) {
      return objectsMergeDeep(optionsA, optionsB || {});
    }
    function optionsAtMedia(options) {
      const optionsAtMedia2 = options.breakpoints || {};
      const matchedMediaOptions = objectKeys(optionsAtMedia2).filter((media) => ownerWindow.matchMedia(media).matches).map((media) => optionsAtMedia2[media]).reduce((a, mediaOption) => mergeOptions(a, mediaOption), {});
      return mergeOptions(options, matchedMediaOptions);
    }
    function optionsMediaQueries(optionsList) {
      return optionsList.map((options) => objectKeys(options.breakpoints || {})).reduce((acc, mediaQueries) => acc.concat(mediaQueries), []).map(ownerWindow.matchMedia);
    }
    const self2 = {
      mergeOptions,
      optionsAtMedia,
      optionsMediaQueries
    };
    return self2;
  }
  function PluginsHandler(optionsHandler) {
    let activePlugins = [];
    function init2(emblaApi, plugins) {
      activePlugins = plugins.filter(({
        options
      }) => optionsHandler.optionsAtMedia(options).active !== false);
      activePlugins.forEach((plugin) => plugin.init(emblaApi, optionsHandler));
      return plugins.reduce((map, plugin) => Object.assign(map, {
        [plugin.name]: plugin
      }), {});
    }
    function destroy() {
      activePlugins = activePlugins.filter((plugin) => plugin.destroy());
    }
    const self2 = {
      init: init2,
      destroy
    };
    return self2;
  }
  function EmblaCarousel(root, userOptions, userPlugins) {
    const ownerDocument = root.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    const optionsHandler = OptionsHandler(ownerWindow);
    const pluginsHandler = PluginsHandler(optionsHandler);
    const mediaHandlers = EventStore();
    const eventHandler = EventHandler();
    const {
      mergeOptions,
      optionsAtMedia,
      optionsMediaQueries
    } = optionsHandler;
    const {
      on,
      off,
      emit
    } = eventHandler;
    const reInit = reActivate;
    let destroyed = false;
    let engine;
    let optionsBase = mergeOptions(defaultOptions, EmblaCarousel.globalOptions);
    let options = mergeOptions(optionsBase);
    let pluginList = [];
    let pluginApis;
    let container;
    let slides;
    function storeElements() {
      const {
        container: userContainer,
        slides: userSlides
      } = options;
      const customContainer = isString(userContainer) ? root.querySelector(userContainer) : userContainer;
      container = customContainer || root.children[0];
      const customSlides = isString(userSlides) ? container.querySelectorAll(userSlides) : userSlides;
      slides = [].slice.call(customSlides || container.children);
    }
    function createEngine(options2) {
      const engine2 = Engine(root, container, slides, ownerDocument, ownerWindow, options2, eventHandler);
      if (options2.loop && !engine2.slideLooper.canLoop()) {
        const optionsWithoutLoop = Object.assign({}, options2, {
          loop: false
        });
        return createEngine(optionsWithoutLoop);
      }
      return engine2;
    }
    function activate(withOptions, withPlugins) {
      if (destroyed) return;
      optionsBase = mergeOptions(optionsBase, withOptions);
      options = optionsAtMedia(optionsBase);
      pluginList = withPlugins || pluginList;
      storeElements();
      engine = createEngine(options);
      optionsMediaQueries([optionsBase, ...pluginList.map(({
        options: options2
      }) => options2)]).forEach((query) => mediaHandlers.add(query, "change", reActivate));
      if (!options.active) return;
      engine.translate.to(engine.location.get());
      engine.animation.init();
      engine.slidesInView.init();
      engine.slideFocus.init(self2);
      engine.eventHandler.init(self2);
      engine.resizeHandler.init(self2);
      engine.slidesHandler.init(self2);
      if (engine.options.loop) engine.slideLooper.loop();
      if (container.offsetParent && slides.length) engine.dragHandler.init(self2);
      pluginApis = pluginsHandler.init(self2, pluginList);
    }
    function reActivate(withOptions, withPlugins) {
      const startIndex = selectedScrollSnap();
      deActivate();
      activate(mergeOptions({
        startIndex
      }, withOptions), withPlugins);
      eventHandler.emit("reInit");
    }
    function deActivate() {
      engine.dragHandler.destroy();
      engine.eventStore.clear();
      engine.translate.clear();
      engine.slideLooper.clear();
      engine.resizeHandler.destroy();
      engine.slidesHandler.destroy();
      engine.slidesInView.destroy();
      engine.animation.destroy();
      pluginsHandler.destroy();
      mediaHandlers.clear();
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      mediaHandlers.clear();
      deActivate();
      eventHandler.emit("destroy");
      eventHandler.clear();
    }
    function scrollTo(index, jump, direction) {
      if (!options.active || destroyed) return;
      engine.scrollBody.useBaseFriction().useDuration(jump === true ? 0 : options.duration);
      engine.scrollTo.index(index, direction || 0);
    }
    function scrollNext(jump) {
      const next = engine.index.add(1).get();
      scrollTo(next, jump, -1);
    }
    function scrollPrev(jump) {
      const prev = engine.index.add(-1).get();
      scrollTo(prev, jump, 1);
    }
    function canScrollNext() {
      const next = engine.index.add(1).get();
      return next !== selectedScrollSnap();
    }
    function canScrollPrev() {
      const prev = engine.index.add(-1).get();
      return prev !== selectedScrollSnap();
    }
    function scrollSnapList() {
      return engine.scrollSnapList;
    }
    function scrollProgress() {
      return engine.scrollProgress.get(engine.offsetLocation.get());
    }
    function selectedScrollSnap() {
      return engine.index.get();
    }
    function previousScrollSnap() {
      return engine.indexPrevious.get();
    }
    function slidesInView() {
      return engine.slidesInView.get();
    }
    function slidesNotInView() {
      return engine.slidesInView.get(false);
    }
    function plugins() {
      return pluginApis;
    }
    function internalEngine() {
      return engine;
    }
    function rootNode() {
      return root;
    }
    function containerNode() {
      return container;
    }
    function slideNodes() {
      return slides;
    }
    const self2 = {
      canScrollNext,
      canScrollPrev,
      containerNode,
      internalEngine,
      destroy,
      off,
      on,
      emit,
      plugins,
      previousScrollSnap,
      reInit,
      rootNode,
      scrollNext,
      scrollPrev,
      scrollProgress,
      scrollSnapList,
      scrollTo,
      selectedScrollSnap,
      slideNodes,
      slidesInView,
      slidesNotInView
    };
    activate(userOptions, userPlugins);
    setTimeout(() => eventHandler.emit("init"), 0);
    return self2;
  }
  EmblaCarousel.globalOptions = void 0;
  const selectors$c = {
    buttonNext: "button[data-next]",
    buttonPrevious: "button[data-previous]",
    pagination: "[data-pagination]"
  };
  const _ProductDetailGallery = class _ProductDetailGallery extends BaseComponent {
    constructor(el) {
      super(el);
      this.color = this.dataset.color;
      this.productTitle = this.dataset.productTitle;
      this.isActive = this.el.getAttribute("aria-current") === "true";
      this.emblaNode = this.qs(".embla");
      this.emblaViewport = this.qs(".embla__viewport");
      this.emblaPaginationNode = this.qs(".embla__pagination");
      this.slides = this.qsa(".embla__slide");
      if (!this.emblaNode) {
        console.warn("ProductDetailGallery: Embla node not found");
        return;
      }
      this.pagination = this.qs(selectors$c.pagination);
      this.buttonNext = this.qs(selectors$c.buttonNext);
      this.buttonPrevious = this.qs(selectors$c.buttonPrevious);
      this.slideshowDisabled = this.slideCount <= 1;
      this.emblaA11yStatus = A11yStatus.generate(this.emblaNode);
      this.emblaApi = EmblaCarousel(this.emblaViewport, {
        loop: this.slideCount > 1,
        watchDrag: !this.slideshowDisabled
      });
      const setCurrentStatus = () => {
        this.updatePagination();
        this.updateCurrentStatus();
      };
      this.emblaApi.on("init", setCurrentStatus);
      this.emblaApi.on("reInit", setCurrentStatus);
      this.emblaApi.on("select", setCurrentStatus);
      this.buttonNext?.addEventListener("click", this.onButtonNextClick.bind(this));
      this.buttonPrevious?.addEventListener("click", this.onButtonPreviousClick.bind(this));
    }
    get activeIndex() {
      return this.emblaApi?.selectedScrollSnap() ?? 0;
    }
    get slideCount() {
      return this.slides?.length ?? 0;
    }
    destroy() {
      this.emblaApi?.destroy();
      super.destroy();
    }
    activate() {
      if (this.isActive) return;
      this.qsa("img").forEach((img) => img.setAttribute("loading", "eager"));
      this.el.setAttribute("aria-current", "true");
      this.emblaApi?.reInit();
      this.isActive = true;
    }
    deactivate() {
      this.el.removeAttribute("aria-current");
      this.isActive = false;
    }
    updatePagination() {
      if (!this.pagination) return;
      this.pagination.innerHTML = `${this.emblaApi?.selectedScrollSnap() + 1} / ${this.emblaApi?.scrollSnapList().length}`;
    }
    updateAriaCurrent(items, activeIndex) {
      items?.forEach((item, index) => {
        if (index === activeIndex) {
          item.setAttribute("aria-current", "true");
        } else {
          item.removeAttribute("aria-current");
        }
      });
    }
    updateCurrentStatus() {
      let msg = `Image ${this.activeIndex + 1} of ${this.slideCount} for ${this.productTitle}`;
      if (this.color) {
        msg = `${msg} in ${this.color}`;
      }
      this.emblaA11yStatus.text = msg;
      this.updateAriaCurrent(this.slides, this.activeIndex);
    }
    onButtonNextClick(e) {
      e.preventDefault();
      this.emblaApi?.scrollNext();
    }
    onButtonPreviousClick(e) {
      e.preventDefault();
      this.emblaApi?.scrollPrev();
    }
  };
  _ProductDetailGallery.TYPE = "product-detail-gallery";
  let ProductDetailGallery = _ProductDetailGallery;
  const _ProductSection = class _ProductSection extends BaseSection {
    constructor(container) {
      super(container);
      this.productDetailForm = new ProductDetailForm(this.qs(ProductDetailForm.SELECTOR), {
        onVariantChange: this.onVariantChange.bind(this)
      });
      this.galleries = this.qsa(ProductDetailGallery.SELECTOR).map((el) => {
        return new ProductDetailGallery(el);
      });
    }
    onUnload(e) {
      this.productDetailForm.destroy();
      this.galleries.forEach((g) => g.destroy());
      super.onUnload(e);
    }
    /**
     * Look for a gallery matching one of the selected variant's options and switch to that gallery
     * If a matching gallery doesn't exist, look for the variant's featured image in the main gallery and switch to that
     */
    onVariantChange(e) {
      this.updateGalleries(e.selectedOptions);
    }
    updateGalleries(currentOptions) {
      const currentColorOption = currentOptions.find((opt) => opt.name?.toLowerCase() === "color");
      const selectedColor = currentColorOption?.value;
      if (this.galleries.length > 1) {
        if (selectedColor !== void 0) {
          const activeGallery = this.galleries.find((g) => g.isActive);
          const selectedColorGallery = this.galleries.find((g) => g.color === selectedColor);
          if (activeGallery !== selectedColorGallery) {
            activeGallery.el.style.opacity = "0";
            activeGallery.deactivate();
            selectedColorGallery.el.style.opacity = "0";
            selectedColorGallery.activate();
            selectedColorGallery.el.style.opacity = "";
          }
        }
      }
    }
  };
  _ProductSection.TYPE = "product";
  let ProductSection = _ProductSection;
  const selectors$b = {
    contentTarget: "[data-content-target]",
    content: "[data-content]"
  };
  const _ProductRelatedSection = class _ProductRelatedSection extends BaseSection {
    constructor(container) {
      super(container, {
        watchIntersection: true,
        intersectionOptions: {
          rootMargin: "0px 0px 1000px 0px"
        }
      });
      this.productCards = [];
      this.contentTarget = this.qs(selectors$b.contentTarget);
      this.content = this.qs(selectors$b.content);
      this.recommendationsUrl = this.dataset.url;
    }
    onIntersection(entries) {
      if (!entries[0].isIntersecting) return;
      this.stopIntersectionObserver();
      this.getRecommendations();
    }
    async getRecommendations() {
      try {
        const dom = await fetchDom(this.recommendationsUrl);
        const content = dom.querySelector(selectors$b.content);
        this.contentTarget.replaceChildren(content);
        this.productCards = this.qsa(ProductCard.SELECTOR, this.contentTarget).map((el) => new ProductCard(el));
      } catch (e) {
        console.warn(e);
        this.container.style.display = "none";
        this.container.setAttribute("aria-hidden", "true");
      }
    }
  };
  _ProductRelatedSection.TYPE = "product-related";
  let ProductRelatedSection = _ProductRelatedSection;
  const selectors$a = {
    loginForm: "#customer-login-form",
    recoverForm: "#recover-password-form",
    toggleRecover: "[data-toggle-recover]"
  };
  const _LoginSection = class _LoginSection extends BaseSection {
    constructor(container) {
      super(container);
      this.loginForm = this.qs(selectors$a.loginForm);
      this.recoverForm = this.qs(selectors$a.recoverForm);
      this.container.addEventListener("click", this.onClick.bind(this));
      if (window.location.hash == "#recover") {
        this.showRecoverForm();
      }
    }
    onClick(e) {
      if (e.target.closest(selectors$a.toggleRecover)) {
        e.target.dataset.toggleRecover === "true" ? this.showRecoverForm() : this.hideRecoverForm();
      }
    }
    showRecoverForm() {
      this.loginForm.style.display = "none";
      this.recoverForm.style.display = "";
    }
    hideRecoverForm() {
      this.loginForm.style.display = "";
      this.recoverForm.style.display = "none";
    }
  };
  _LoginSection.TYPE = "login";
  let LoginSection = _LoginSection;
  const selectors$9 = {
    input: 'input[name="q"]',
    icon: "[data-icon]"
  };
  const _SearchInline = class _SearchInline extends BaseComponent {
    constructor(el, options = {}) {
      super(el);
      this.settings = {
        ...options
      };
      if (this.el.tagName !== "FORM") {
        console.warn("SearchInline: Form element required");
        return;
      }
      this.input = this.el.querySelector(selectors$9.input);
      this.icon = this.el.querySelector(selectors$9.icon);
      this.action = this.el.getAttribute("action");
      this.onSubmit = this.onSubmit.bind(this);
      this.onKeyup = this.onKeyup.bind(this);
      this.el.addEventListener("submit", this.onSubmit);
      this.input.addEventListener("keyup", this.onKeyup);
    }
    reset() {
      this.input.value = "";
    }
    onSubmit(e) {
      const data = new FormData(this.el);
      const q = data.get("q")?.toString().trim();
      const type = data.get("type")?.toString() || "product";
      if (!q) {
        return;
      }
      const params = new URLSearchParams({
        type,
        q: encodeURIComponent(q)
      });
      const url = `${this.action}?${params.toString()}`;
      if (this.settings.onSubmit?.(e, url) === false) {
        return;
      }
      if (!window.app.taxi) {
        return;
      }
      e.preventDefault();
      window.app.taxi.navigateTo(url);
      return false;
    }
    onKeyup(e) {
      this.settings.onKeyup?.(e);
    }
  };
  _SearchInline.TYPE = "search-inline";
  let SearchInline = _SearchInline;
  const _SearchSection = class _SearchSection extends ResultsSection {
    constructor(container) {
      super(container);
      __privateAdd(this, _isLoading);
      __privateSet(this, _isLoading, false);
      this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR), {
        onSubmit: this.onSubmit.bind(this)
      });
    }
    async runSearch(url) {
      try {
        __privateSet(this, _isLoading, true);
        const results = await this.fetchResults(url);
        this.resultsDisplay.replace(results);
        window.history.replaceState({}, "", url);
      } catch (e) {
        console.warn("something went wrong...", e);
      } finally {
        __privateSet(this, _isLoading, false);
      }
    }
    // @NOTE - This must be a synchronous function and return false to prevent the default form submission behavior
    onSubmit(e, url) {
      e.preventDefault();
      if (__privateGet(this, _isLoading)) return false;
      this.runSearch(url);
      return false;
    }
  };
  _isLoading = new WeakMap();
  _SearchSection.TYPE = "search";
  let SearchSection = _SearchSection;
  const _PageHeroSection = class _PageHeroSection extends BaseSection {
    constructor(container) {
      super(container);
    }
  };
  _PageHeroSection.TYPE = "page-hero";
  let PageHeroSection = _PageHeroSection;
  const redirect = (url) => {
    setTimeout(() => {
      window.app?.taxi ? window.app.taxi.navigateTo(url) : window.location.href = url;
    }, 50);
  };
  class BaseRenderer extends Renderer {
    constructor(properties) {
      super(properties);
    }
    // NOTE: If initialLoad is defined, "onEnter" will not be called for sections that exist on page load
    // initialLoad() {
    // }
    onEnter() {
      this.sectionManager = new SectionManager();
      [
        FeaturedProductsSection,
        AddressesSection,
        ArticleSection,
        BlogSection,
        CollectionSection,
        ProductSection,
        ProductRelatedSection,
        LoginSection,
        SearchSection,
        PageHeroSection
      ].forEach((section) => {
        this.sectionManager.register(section);
      });
    }
    onEnterCompleted() {
      this.redirectIfNecessary();
    }
    onLeave() {
    }
    /**
     * This method is called by the page transition class and
     * waits for all section onRendererLeaveStart methods to complete before allowing the main page transition to proceed.
     * 
     * @param {number} transitionDuration - Duration of the main page transition in seconds
     * @returns {Promise<void>}
     * 
     * @remarks
     * - Not inherited from the base Taxi Renderer class - this is a custom method
     * - Called from transition.onLeave method to coordinate section-level animations
     */
    async onLeaveStart(transitionDuration) {
      if (!this.sectionManager || this.sectionManager.instances.length === 0) return;
      const results = await Promise.allSettled(
        this.sectionManager.instances.map((section) => section.onRendererLeaveStart(transitionDuration))
      );
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(`Section ${index} onRendererLeaveStart failed:`, result.reason);
        }
      });
    }
    onLeaveCompleted() {
      if (this.sectionManager) {
        this.sectionManager.destroy();
        this.sectionManager = null;
      }
    }
    redirectIfNecessary() {
      if (window.location.pathname === "/cart") {
        redirect("/?cart");
      }
    }
  }
  const DURATION_LEAVE = 0.2;
  const DURATION_ENTER = 0.5;
  const DELAY_ENTER = 0.15;
  const _PageTransition = class _PageTransition extends Transition {
    constructor(args) {
      super(args);
      this.fromHeight = 0;
      this.toHeight = 0;
      this.autoScrollCompleteFlag = false;
      this.autoScrollCleanup = null;
      this.autoScrollTimeoutId = null;
    }
    /**
     * Sets or removes height style on wrapper element
     * Only sets numeric height if autoScrollCompleteFlag is false
     * @param [height] - Optional height in pixels. If omitted, height style is removed
     */
    setWrapperHeightIfNeeded(height) {
      if (height !== void 0 && !this.autoScrollCompleteFlag) {
        this.wrapper.style.height = `${height}px`;
      } else {
        this.wrapper.style.height = "";
      }
    }
    /**
     * Smoothly scrolls the window to the top and returns a Promise that resolves when the scroll animation completes.
     * Uses the native scrollend event when available, otherwise falls back to a timeout-based approach.
     * 
     * @returns Resolves when the scroll animation completes
     */
    autoScrollToTop() {
      this.autoScrollCleanup?.();
      if (window.scrollY === 0) {
        this.autoScrollCompleteFlag = true;
        return Promise.resolve();
      }
      const p = new Promise((resolve) => {
        const onComplete = () => {
          this.autoScrollCompleteFlag = true;
          resolve();
        };
        if ("onscrollend" in window) {
          const handleScrollEnd = () => {
            window.removeEventListener("scrollend", handleScrollEnd);
            onComplete();
          };
          window.addEventListener("scrollend", handleScrollEnd, { once: true });
          this.autoScrollCleanup = () => {
            window.removeEventListener("scrollend", handleScrollEnd);
            this.autoScrollCompleteFlag = false;
          };
        } else {
          this.autoScrollTimeoutId = setTimeout(onComplete, 500);
          this.autoScrollCleanup = () => {
            clearTimeout(this.autoScrollTimeoutId);
            this.autoScrollCompleteFlag = false;
          };
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return p;
    }
    /**
     * Handle the transition leaving the previous page.
     */
    async onLeave(e) {
      const { from, done } = e;
      const renderer = window.app?.taxi?.currentCacheEntry?.renderer;
      if (renderer && renderer.onLeaveStart) {
        try {
          await renderer.onLeaveStart(DURATION_LEAVE);
        } catch (error) {
          console.warn("Renderer onLeaveStart failed:", error);
        }
      }
      this.fromHeight = from.clientHeight;
      this.autoScrollCleanup?.();
      this.autoScrollToTop().then(() => {
        this.setWrapperHeightIfNeeded();
      });
      const onStart = () => {
        dispatch(_PageTransition.EVENTS.LEAVE);
      };
      const onComplete = () => {
        this.setWrapperHeightIfNeeded(this.fromHeight);
        dispatch(_PageTransition.EVENTS.AFTER_LEAVE);
        done();
      };
      if (prefersReducedMotion()) {
        onStart();
        return onComplete();
      }
      gsapWithCSS.killTweensOf(from);
      gsapWithCSS.to(from, {
        duration: DURATION_LEAVE,
        ease: "power1.out",
        opacity: 0,
        onStart,
        onComplete
      });
    }
    /**
     * Handle the transition entering the next page.
     */
    onEnter(e) {
      const { to, done } = e;
      this.toHeight = to.clientHeight;
      if (this.toHeight > this.fromHeight) {
        this.setWrapperHeightIfNeeded(this.toHeight);
      }
      const onStart = () => {
        dispatch(_PageTransition.EVENTS.ENTER);
      };
      const onComplete = () => {
        this.autoScrollCleanup?.();
        gsapWithCSS.set(to, {
          clearProps: true
        });
        this.wrapper.style.height = "";
        done();
      };
      if (prefersReducedMotion()) {
        onStart();
        return onComplete();
      }
      gsapWithCSS.killTweensOf(to);
      gsapWithCSS.fromTo(to, { opacity: 0 }, {
        duration: DURATION_ENTER,
        delay: DELAY_ENTER,
        ease: "power3.out",
        y: 0,
        opacity: 1,
        onStart,
        onComplete
      });
    }
  };
  _PageTransition.EVENTS = {
    ENTER: "enter.transition",
    AFTER_ENTER: "afterEnter.transition",
    LEAVE: "leave.transition",
    AFTER_LEAVE: "afterLeave.transition"
  };
  let PageTransition = _PageTransition;
  const selectors$8 = {
    count: "[data-count]"
  };
  const classes$5 = {
    hasItems: "has-items"
  };
  const _HeaderCartControl = class _HeaderCartControl extends BaseComponent {
    constructor(el) {
      super(el, {
        watchCartUpdate: true
      });
      this.count = this.qs(selectors$8.count);
    }
    onCartUpdate(e) {
      const { cart } = e.detail;
      this.count.innerText = cart.item_count.toString();
      this.el.classList.toggle(classes$5.hasItems, cart.item_count > 0);
    }
  };
  _HeaderCartControl.TYPE = "header-cart-control";
  let HeaderCartControl = _HeaderCartControl;
  const _HeaderSection = class _HeaderSection extends BaseSection {
    constructor(container) {
      super(container);
      this.headerCartControl = new HeaderCartControl(this.qs(HeaderCartControl.SELECTOR));
    }
    onNavigateIn(e) {
      const currentPath = new URL(e.detail.to.finalUrl).pathname;
      const links = this.container.querySelectorAll("nav a");
      links.forEach((link) => setAriaCurrent(link, currentPath));
    }
  };
  _HeaderSection.TYPE = "header";
  let HeaderSection = _HeaderSection;
  const companyId = window.app?.klaviyo?.companyId;
  const listId = window.app?.klaviyo?.listId;
  if (!companyId) {
    console.warn("[KlaviyoAPI] - Klaviyo company ID not found");
  }
  if (!listId) {
    console.warn("[KlaviyoAPI] - Klaviyo list ID not found");
  }
  const KlaviyoAPI = {
    async makeRequest(path, data) {
      try {
        const response = await fetch(`https://a.klaviyo.com${path}?company_id=${companyId}`, {
          method: "POST",
          headers: {
            "revision": "2024-07-15",
            "content-type": "application/json",
            "cache-control": "no-cache"
          },
          body: JSON.stringify(data)
        });
        const success = response.ok || response.status === 202;
        return success;
      } catch (error) {
        return {
          message: "Something went wrong",
          errors: [error]
        };
      }
    },
    // See: https://developers.klaviyo.com/en/reference/create_client_subscription
    createClientSubscription({ email, source }) {
      if (!email || !listId) {
        return;
      }
      const profileAttributes = {
        email
      };
      const data = {
        data: {
          type: "subscription",
          attributes: {
            custom_source: source || null,
            profile: {
              data: {
                type: "profile",
                attributes: profileAttributes
              }
            }
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: listId
              }
            }
          }
        }
      };
      return this.makeRequest("/client/subscriptions", data);
    },
    // see: https://developers.klaviyo.com/en/reference/create_client_back_in_stock_subscription
    createBackInStockSubscription({ email, variant, external_id }) {
      if (!email || !variant) {
        return;
      }
      const channels = ["EMAIL"];
      const profileAttributes = {
        email
      };
      if (external_id) {
        profileAttributes.external_id = external_id;
      }
      const data = {
        data: {
          type: "back-in-stock-subscription",
          attributes: {
            channels,
            profile: {
              data: {
                type: "profile",
                attributes: profileAttributes
              }
            }
          },
          relationships: {
            variant: {
              data: {
                type: "catalog-variant",
                id: `$shopify:::$default:::${variant}`
              }
            }
          }
        }
      };
      return this.makeRequest("/client/back-in-stock-subscriptions", data);
    }
  };
  class AJAXKlaviyoForm {
    constructor(el, options = {}) {
      this.name = "ajaxKlaviyoForm";
      this.settings = {
        source: "Shopify Form",
        ...options
      };
      this.el = el;
      this.form = this.el.tagName === "FORM" ? this.el : this.el.querySelector("form");
      if (!this.form) {
        console.warn(`[${this.name}] - Form element required to initialize`);
        return;
      }
      if (this.form.dataset.source) {
        this.setSource(this.form.dataset.source);
      }
      this.input = this.form.querySelector('input[type="email"]');
      this.submit = this.form.querySelector('[type="submit"]');
      this.isSubmitting = false;
      if (!this.input) {
        console.warn(`[${this.name}] - Email input missing`);
        return;
      }
      this.onFormSubmit = this.onFormSubmit.bind(this);
      this.form.addEventListener("submit", this.onFormSubmit);
      this.settings.onInit?.();
    }
    destroy() {
      this.form.removeEventListener("submit", this.onFormSubmit);
    }
    logErrors(errors) {
      if (Array.isArray(errors) && errors.length) {
        for (let i = errors.length - 1; i >= 0; i--) {
          console.warn(`[${this.name}] - onSubmitFail error: ${errors[i].message}`);
        }
      }
    }
    setSource(source = "") {
      this.settings.source = source;
    }
    onBeforeSend() {
      if (this.settings.onBeforeSend?.() === false) {
        return false;
      }
      if (this.input.value && this.input.value.length) {
        return true;
      }
      return false;
    }
    onSubscribeSuccess() {
      this.settings.onSubscribeSuccess?.();
    }
    onSubscribeFail(errors) {
      this.submit.removeAttribute("disabled");
      this.logErrors(errors);
      this.settings.onSubscribeFail?.();
    }
    // This is when something goes wrong with the form submissions / network request, not the subscription itself
    onSubmitFail(errors) {
      this.submit.removeAttribute("disabled");
      this.logErrors(errors);
      this.settings.onSubmitFail?.(errors);
    }
    async onFormSubmit(e) {
      e.preventDefault();
      if (this.isSubmitting || this.onBeforeSend() === false) {
        return false;
      }
      const email = this.input.value;
      if (!email) {
        console.warn(`[${this.name}] - Email is required`);
        return;
      }
      try {
        this.isSubmitting = true;
        this.submit.setAttribute("disabled", "true");
        this.settings.onSubmitStart?.();
        const success = await KlaviyoAPI.createClientSubscription({
          email,
          source: this.settings.source
        });
        if (success) {
          this.onSubscribeSuccess();
        } else {
          this.onSubscribeFail([
            new Error("Subscription failed")
          ]);
        }
      } catch (e2) {
        const error = e2 instanceof Error ? e2 : new Error(String(e2));
        this.onSubmitFail([error]);
      } finally {
        this.submit.removeAttribute("disabled");
        this.isSubmitting = false;
      }
      return false;
    }
  }
  const selectors$7 = {
    form: "form",
    formContents: "[data-form-contents]",
    formMessage: "[data-form-message]"
    // needs data-success, data-already-subscribed, data-fail
  };
  const classes$4 = {
    showContents: "show-contents",
    showMessage: "show-message"
  };
  const _NewsletterForm = class _NewsletterForm extends BaseComponent {
    /**
     * NewsletterForm constructor
     */
    constructor(el) {
      super(el);
      this.timeoutId = null;
      this.form = this.el.tagName === "FORM" ? this.el : this.qs(selectors$7.form);
      if (!this.form) {
        console.warn(`[${this.type}] - Form element required to initialize`);
        return;
      }
      this.formInput = this.form.querySelector('input[type="email"]');
      this.formContents = this.form.querySelector(selectors$7.formContents);
      this.formMessage = this.form.querySelector(selectors$7.formMessage);
    }
    destroy() {
      window.clearTimeout(this.timeoutId);
      super.destroy();
    }
    /**
     * Temporarily shows the form message
     *
     * @param message - The message to show
     * @param reset - If true, will call this.reset when finished
     */
    showMessageWithTimeout(message, reset = false) {
      this.formMessage.innerHTML = message;
      this.formContents.classList.add(classes$4.showMessage);
      window.clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout((function() {
        if (reset) {
          this.reset();
        }
        this.formContents.classList.remove(classes$4.showMessage);
      }).bind(this), 3e3);
    }
    showFormContents() {
      this.form.classList.add(classes$4.showContents);
      setTimeout(() => {
        this.focusInput();
      }, 100);
    }
    hideFormContents() {
      this.form.classList.remove(classes$4.showContents);
    }
    // Allow external components to focus the input
    focusInput() {
      this.formInput.focus();
    }
    /**
     * Resets everything to it's initial state.  Only call when form content isn't visible
     */
    reset() {
      this.formInput.value = "";
      this.formInput.dispatchEvent(new Event("change"));
    }
    onSubscribeSuccess() {
      this.showMessageWithTimeout(this.formMessage.dataset.success, true);
    }
    onSubmitStart() {
      this.showMessageWithTimeout("Submitting...", false);
    }
    onSubmitFail(errors) {
      const msg = Array.isArray(errors) ? errors.join("  ") : errors;
      this.showMessageWithTimeout(msg, false);
    }
    onSubscribeFail() {
      this.showMessageWithTimeout(this.formMessage.dataset.fail, false);
    }
  };
  _NewsletterForm.TYPE = "newsletter-form";
  let NewsletterForm = _NewsletterForm;
  const _FooterSection = class _FooterSection extends BaseSection {
    constructor(container) {
      super(container);
      this.newsletterFormEl = this.qs(NewsletterForm.SELECTOR);
      this.newsletterForm = null;
      this.ajaxForm = null;
      if (this.newsletterFormEl) {
        this.newsletterForm = new NewsletterForm(this.newsletterFormEl);
        this.ajaxForm = new AJAXKlaviyoForm(this.newsletterFormEl, {
          onSubmitStart: () => this.newsletterForm.onSubmitStart(),
          onSubmitFail: (errors) => this.newsletterForm.onSubmitFail(errors),
          onSubscribeSuccess: () => this.newsletterForm.onSubscribeSuccess(),
          onSubscribeFail: () => this.newsletterForm.onSubscribeFail()
        });
      }
    }
    onUnload(e) {
      this.newsletterForm?.destroy();
      this.ajaxForm?.destroy();
      super.onUnload(e);
    }
    onNavigateIn(e) {
      const currentPath = new URL(e.detail.to.finalUrl).pathname;
      const links = this.container.querySelectorAll("a");
      links.forEach((link) => setAriaCurrent(link, currentPath));
    }
  };
  _FooterSection.TYPE = "footer";
  let FooterSection = _FooterSection;
  const classes$3 = {
    backdrop: "backdrop",
    open: "is-open"
  };
  const _Backdrop = class _Backdrop extends BaseComponent {
    static generate(parent, options = {}) {
      const el = document.createElement("button");
      const settings = {
        title: "Close",
        ariaLabel: "Close",
        ariaExpanded: false,
        ...options
      };
      el.classList.add(classes$3.backdrop);
      el.setAttribute("type", "button");
      el.setAttribute("title", settings.title);
      el.setAttribute("aria-label", settings.ariaLabel || settings.title);
      el.setAttribute("aria-expanded", toAriaBoolean(!!settings.ariaExpanded));
      el.setAttribute("aria-hidden", toAriaBoolean(!settings.ariaExpanded));
      if (settings.ariaControls) {
        el.setAttribute("aria-controls", settings.ariaControls);
      }
      el.setAttribute("data-component", _Backdrop.TYPE);
      const appendTo = parent || document.body;
      appendTo.appendChild(el);
      return new _Backdrop(el);
    }
    constructor(el) {
      super(el);
    }
    destroy() {
      this.el.remove();
      super.destroy();
    }
    show() {
      this.el.classList.add(classes$3.open);
      this.el.setAttribute("aria-hidden", toAriaBoolean(false));
    }
    hide() {
      this.el.classList.remove(classes$3.open);
      this.el.setAttribute("aria-hidden", toAriaBoolean(true));
    }
  };
  _Backdrop.TYPE = "backdrop";
  let Backdrop = _Backdrop;
  class FocusTrap {
    constructor(el, options = {}) {
      this.settings = {
        autofocus: true,
        returnFocus: true,
        preventScroll: false,
        ...options
      };
      if (!el || !(el instanceof Element)) {
        throw new Error("Invalid element provided");
      }
      this.el = el;
      this.isActive = false;
      this.lastTabNavDirection = null;
      this.focusableElements = [];
      this.previouslyFocusedElement = null;
      this.onFocusin = this.onFocusin.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
    }
    destroy() {
      this.deactivate();
    }
    activate() {
      if (this.isActive) {
        return;
      }
      this.previouslyFocusedElement = document.activeElement;
      this.focusableElements = getFocusableChildren(this.el);
      if (this.settings.autofocus) {
        if (this.focusableElements.length) {
          this.focusableElements[0].focus();
        } else {
          this.el.focus();
        }
      }
      document.addEventListener("focusin", this.onFocusin);
      document.addEventListener("keydown", this.onKeydown);
      this.isActive = true;
    }
    deactivate() {
      this.isActive = false;
      document.removeEventListener("focusin", this.onFocusin);
      document.removeEventListener("keydown", this.onKeydown);
      if (this.settings.returnFocus && this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
      }
    }
    onFocusin(event) {
      if (event.target === document || event.target === this.el) {
        return;
      }
      let focusEl = null;
      if (event.target instanceof HTMLElement && this.el.contains(event.target)) {
        focusEl = event.target;
      } else {
        if (this.focusableElements.length === 0) {
          focusEl = this.el;
        } else if (this.lastTabNavDirection === "backward") {
          focusEl = this.focusableElements[this.focusableElements.length - 1];
        } else {
          focusEl = this.focusableElements[0];
        }
        focusEl.focus({
          preventScroll: this.settings.preventScroll
        });
      }
      this.settings.onFocusin?.(focusEl);
    }
    onKeydown(event) {
      if (event.key !== "Tab") {
        return;
      }
      this.lastTabNavDirection = event.shiftKey ? "backward" : "forward";
    }
  }
  const selectors$6 = {
    scroller: "[data-scroller]",
    close: "[data-close]"
  };
  const classes$2 = {
    isOpen: "is-open",
    bodyIsOpen: "drawer-open"
  };
  const _Drawer = class _Drawer extends BaseComponent {
    constructor(el, options = {}) {
      super(el, {
        watchBreakpoint: options.maxBreakpoint ? true : false,
        ...options
      });
      this.settings = {
        maxBreakpoint: null,
        backdrop: true,
        ...options
      };
      this.role = this.el.getAttribute("role");
      this.focusTrap = new FocusTrap(this.el, {
        autofocus: false,
        returnFocus: false,
        preventScroll: true
      });
      this.scroller = this.qs(selectors$6.scroller);
      this.backdrop = null;
      this.onClick = this.onClick.bind(this);
      this.onBodyClick = this.onBodyClick.bind(this);
      this.el.addEventListener("click", this.onClick);
      document.body.addEventListener("click", this.onBodyClick);
      if (this.settings.backdrop) {
        this.backdrop = Backdrop.generate(document.body, {
          ariaControls: this.el.id,
          ariaExpanded: false
        });
      }
      if (this.role) {
        this.ariaControlElements.forEach((el2) => el2.setAttribute("aria-haspopup", this.role));
      }
    }
    destroy() {
      this.focusTrap.destroy();
      document.body.removeEventListener("click", this.onBodyClick);
      this.ariaControlElements.forEach((el) => el.removeAttribute("aria-haspopup"));
      super.destroy();
    }
    get isOpen() {
      return !this.isAriaHidden;
    }
    open() {
      if (this.isOpen) return;
      this.el.classList.add(classes$2.isOpen);
      this.el.setAttribute("aria-hidden", toAriaBoolean(false));
      this.el.setAttribute("aria-modal", toAriaBoolean(true));
      document.body.classList.add(classes$2.bodyIsOpen);
      this.ariaControlElements.forEach((el) => el.setAttribute("aria-expanded", toAriaBoolean(true)));
      this.backdrop?.show();
      this.el.removeAttribute("inert");
      this.focusTrap.activate();
      if (this.scroller) this.scroller.scrollTop = 0;
    }
    close() {
      if (!this.isOpen) return;
      this.el.classList.remove(classes$2.isOpen);
      this.el.setAttribute("aria-hidden", toAriaBoolean(true));
      this.el.setAttribute("aria-modal", toAriaBoolean(false));
      this.backdrop?.hide();
      document.body.classList.remove(classes$2.bodyIsOpen);
      this.ariaControlElements.forEach((el) => el.setAttribute("aria-expanded", toAriaBoolean(false)));
      this.el.setAttribute("inert", toAriaBoolean(true));
      this.focusTrap.deactivate();
    }
    toggle() {
      this.isOpen ? this.close() : this.open();
    }
    onBreakpointChange(e) {
      const { detail: { breakpoint } } = e;
      if (!this.isOpen || !this.settings.maxBreakpoint) return;
      if (breakpoint > this.settings.maxBreakpoint) {
        this.close();
      }
    }
    onClick(e) {
      const target = e.target;
      if (target?.closest(selectors$6.close)) {
        e.preventDefault();
        this.close();
      }
    }
    onBodyClick(e) {
      const target = e.target;
      if (this.ariaControlElements.some(
        (el) => el.isSameNode(target) || el.contains(target)
      )) {
        e.preventDefault();
        this.toggle();
      }
    }
  };
  _Drawer.TYPE = "drawer";
  let Drawer = _Drawer;
  const _MobileMenuDrawer = class _MobileMenuDrawer extends Drawer {
    constructor(el) {
      super(el, {
        maxBreakpoint: BREAKPOINTS.md
      });
      this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR));
    }
  };
  _MobileMenuDrawer.TYPE = "mobile-menu-drawer";
  let MobileMenuDrawer = _MobileMenuDrawer;
  const _MobileMenuSection = class _MobileMenuSection extends BaseSection {
    constructor(container) {
      super(container);
      this.drawer = new MobileMenuDrawer(this.qs(MobileMenuDrawer.SELECTOR));
    }
    onSectionSelect() {
      this.drawer.open();
    }
    onSectionDeselect() {
      this.drawer.close();
    }
    onNavigateIn(e) {
      const currentPath = new URL(e.detail.to.finalUrl).pathname;
      const links = this.drawer.el.querySelectorAll("nav a");
      links.forEach((link) => setAriaCurrent(link, currentPath));
    }
    onNavigateOut() {
      this.drawer.close();
    }
  };
  _MobileMenuSection.TYPE = "mobile-menu";
  let MobileMenuSection = _MobileMenuSection;
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var lodash_debounce;
  var hasRequiredLodash_debounce;
  function requireLodash_debounce() {
    if (hasRequiredLodash_debounce) return lodash_debounce;
    hasRequiredLodash_debounce = 1;
    var FUNC_ERROR_TEXT = "Expected a function";
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var nativeMax = Math.max, nativeMin = Math.min;
    var now = function() {
      return root.Date.now();
    };
    function debounce2(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject2(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
        return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    function isObject2(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject2(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject2(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    lodash_debounce = debounce2;
    return lodash_debounce;
  }
  var lodash_debounceExports = requireLodash_debounce();
  const debounce = /* @__PURE__ */ getDefaultExportFromCjs(lodash_debounceExports);
  const selectors$5 = {
    increment: "button[data-increment]",
    decrement: "button[data-decrement]"
  };
  const DEFAULT_MIN = 0;
  const DEFAULT_MAX = 999;
  const DEFAULT_STEP = 1;
  const _QuantityAdjuster = class _QuantityAdjuster extends BaseComponent {
    constructor(el, options = {}) {
      super(el);
      this.settings = {
        ...options
      };
      this.changeEvent = new Event("change", { bubbles: true });
      this.input = this.el.querySelector('input[type="number"]');
      this.increment = this.el.querySelector(selectors$5.increment);
      this.decrement = this.el.querySelector(selectors$5.decrement);
      this.input.addEventListener("change", this.onChange.bind(this));
      this.increment.addEventListener("click", this.onStepClick.bind(this));
      this.decrement.addEventListener("click", this.onStepClick.bind(this));
      this.observer = new MutationObserver(this.onInputMutation.bind(this));
      this.observer.observe(this.input, {
        attributes: true,
        attributeFilter: ["min", "max", "step"]
      });
      this.validate();
    }
    destroy() {
      this.observer.disconnect();
      super.destroy();
    }
    parseAttribute(value, defaultValue) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    get min() {
      return this.parseAttribute(this.input.min, DEFAULT_MIN);
    }
    get max() {
      return this.parseAttribute(this.input.max, DEFAULT_MAX);
    }
    get step() {
      return this.parseAttribute(this.input.step, DEFAULT_STEP);
    }
    set min(value) {
      isNumber$1(value) ? this.input.min = value.toString() : this.input.removeAttribute("min");
    }
    set max(value) {
      isNumber$1(value) ? this.input.max = value.toString() : this.input.removeAttribute("max");
    }
    set step(value) {
      isNumber$1(value) ? this.input.step = value.toString() : this.input.removeAttribute("step");
    }
    get value() {
      return parseInt(this.input.value, 10);
    }
    set value(q) {
      if (q === this.value) return;
      this.input.value = q.toString();
    }
    get disabled() {
      return this.input.disabled;
    }
    set disabled(isDisabled2) {
      this.input.disabled = isDisabled2;
      this.increment.disabled = isDisabled2;
      this.decrement.disabled = isDisabled2;
    }
    validate() {
      this.decrement.disabled = this.value <= this.min;
      this.increment.disabled = this.value >= this.max;
      if (this.value < this.min) {
        this.value = this.min;
      } else if (this.value > this.max) {
        this.value = this.max;
      }
    }
    onChange() {
      if (this.value < this.min) {
        this.value = this.min;
      } else if (this.value > this.max) {
        this.value = this.max;
      } else if (this.value % this.step !== 0) {
        const v = Math.round(this.value / this.step) * this.step;
        this.value = clamp$1(v, this.min, this.max);
      }
      this.validate();
      this.settings.onChange?.(this.value);
    }
    onStepClick(e) {
      const previousValue = this.value;
      if (e.currentTarget === this.increment) {
        if (this.min > this.step && previousValue == 0) {
          this.value = this.min;
        } else {
          this.input.stepUp();
        }
      } else if (e.currentTarget === this.decrement) {
        if (this.min === previousValue) {
          this.value = this.min;
        } else {
          this.input.stepDown();
        }
      }
      if (previousValue !== this.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }
    onInputMutation() {
      this.validate();
    }
  };
  _QuantityAdjuster.TYPE = "quantity-adjuster";
  let QuantityAdjuster = _QuantityAdjuster;
  const selectors$4 = {
    remove: "button[data-remove]",
    price: "[data-price]"
  };
  const classes$1 = {
    removing: "is-removing",
    updating: "is-updating"
  };
  const _CartItem = class _CartItem extends BaseComponent {
    constructor(el, itemData, options = {}) {
      super(el);
      __privateAdd(this, _state);
      __privateSet(this, _state, void 0);
      this.settings = {
        ...options
      };
      this.itemData = itemData;
      this.id = this.itemData.id;
      this.remove = this.qs(selectors$4.remove);
      this.price = this.qs(selectors$4.price);
      this.debouncedOnQuantityAdjusterChange = debounce(this.onQuantityAdjusterChange.bind(this), isTouch() ? 500 : 250);
      this.quantityAdjuster = new QuantityAdjuster(this.el.querySelector(QuantityAdjuster.SELECTOR), {
        onChange: (qty) => {
          if (qty === 0) {
            this.debouncedOnQuantityAdjusterChange?.cancel();
            this.onQuantityAdjusterChange(qty);
            return;
          }
          this.debouncedOnQuantityAdjusterChange(qty);
        }
      });
      this.remove.addEventListener("click", this.onRemoveClick.bind(this));
    }
    get key() {
      return this.itemData.key;
    }
    set state(state) {
      switch (state) {
        case "removing":
          this.remove.disabled = true;
          this.remove.setAttribute("aria-disabled", "true");
          this.el.classList.add(classes$1.removing);
          break;
        case "updating":
          this.remove.disabled = true;
          this.remove.setAttribute("aria-disabled", "true");
          this.el.classList.add(classes$1.updating);
          break;
        case void 0:
        default:
          this.remove.disabled = false;
          this.remove.removeAttribute("aria-disabled");
          this.el.classList.remove(classes$1.removing, classes$1.updating);
          break;
      }
      __privateSet(this, _state, state);
    }
    get state() {
      return __privateGet(this, _state);
    }
    /**
     * Updates the item with new data
     * @param {Object} item - The updated item data
     * @param {number} item.quantity - The new quantity of the item
     * @param {string} item.item_price_html - The HTML string representing the updated price
     */
    update(itemData) {
      if (!itemData || typeof itemData !== "object") {
        console.error("Invalid item data provided to update method");
        return;
      }
      if (itemData.quantity !== void 0) {
        this.quantityAdjuster.value = itemData.quantity;
      }
      const temp = document.createElement("div");
      temp.innerHTML = itemData.item_price_html;
      const newPrice = temp.firstElementChild;
      this.price.replaceWith(newPrice);
      this.price = newPrice;
      this.itemData = itemData;
    }
    async onQuantityAdjusterChange(q) {
      if (this.state !== void 0) return;
      this.settings.onQuantityAdjusterChange?.(this, q);
    }
    async onRemoveClick(e) {
      e.preventDefault();
      if (this.state !== void 0) return;
      this.settings.onRemoveClick?.(this);
    }
  };
  _state = new WeakMap();
  _CartItem.TYPE = "cart-item";
  let CartItem = _CartItem;
  const selectors$3 = {
    list: "[data-list]"
  };
  const _CartBody = class _CartBody extends BaseComponent {
    constructor(el, cartData) {
      super(el, {
        watchCartUpdate: true
      });
      __privateAdd(this, _muteUpdateSync);
      __privateSet(this, _muteUpdateSync, false);
      this.cartData = cartData;
      this.list = this.qs(selectors$3.list);
      this.onItemRemoveClick = this.onItemRemoveClick.bind(this);
      this.onItemQuantityAdjusterChange = this.onItemQuantityAdjusterChange.bind(this);
      this.itemInstances = this.qsa(CartItem.SELECTOR).map((el2, i) => this.createCartItemInstance(el2, this.cartData.items[i]));
    }
    createCartItemInstance(el, itemData) {
      return new CartItem(el, itemData, {
        onRemoveClick: this.onItemRemoveClick,
        onQuantityAdjusterChange: this.onItemQuantityAdjusterChange
      });
    }
    cleanupItemInstance(item) {
      item.destroy();
      item.el.remove();
    }
    performItemInstanceRemoval(removalInstance) {
      if (!removalInstance) return;
      this.itemInstances = this.itemInstances.filter((instance2) => instance2 !== removalInstance);
      slideUp(removalInstance.el, {
        duration: 0.45,
        onInterrupt: () => {
          this.cleanupItemInstance(removalInstance);
        },
        onComplete: () => {
          this.cleanupItemInstance(removalInstance);
        }
      });
    }
    performItemInstanceUpdate(updateInstance, newItemData) {
      if (!updateInstance) return;
      updateInstance.update(newItemData);
    }
    performItemInstanceAddition(newItemData, newIndex) {
      if (!newItemData) return;
      const newItemEl = getDomFromString(newItemData.item_html).querySelector(CartItem.SELECTOR);
      const newItemInstance = this.createCartItemInstance(newItemEl, newItemData);
      this.list.insertBefore(newItemInstance.el, this.itemInstances[newIndex]?.el || null);
      this.itemInstances.splice(newIndex, 0, newItemInstance);
    }
    onItemChangeSuccess(updatedItem, newCartData) {
      const itemIndex = this.itemInstances.indexOf(updatedItem);
      const newItemData = newCartData.items[itemIndex];
      if (newItemData) {
        this.performItemInstanceUpdate(updatedItem, newItemData);
      }
      this.cartData = newCartData;
    }
    onItemRemoveSuccess(removedItem, newCartData) {
      this.performItemInstanceRemoval(removedItem);
      this.cartData = newCartData;
    }
    /**
     * Synchronizes the cart UI with new cart data received from an update event
     * @param e - Cart update event containing new cart data
     * @param e.detail.cart - The new cart data
     * @param e.detail.cart.items - Array of cart items
     * @param e.detail.cart.items[].id - Unique identifier for cart item
     * @param e.detail.cart.items[].item_html - HTML string representation of cart item
     */
    syncCart(e) {
      const newCartData = e.detail.cart;
      newCartData.items.forEach((newItemData, newIndex) => {
        let found = false;
        this.itemInstances.forEach((itemInstance) => {
          if (newItemData.id === itemInstance.id) {
            found = true;
            this.performItemInstanceUpdate(itemInstance, newItemData);
          }
        });
        if (!found) {
          this.performItemInstanceAddition(newItemData, newIndex);
        }
      });
      this.itemInstances.forEach((itemInstance) => {
        const stillExists = newCartData.items.some((newItemData) => newItemData.id === itemInstance.id);
        if (!stillExists) {
          this.performItemInstanceRemoval(itemInstance);
        }
      });
      this.cartData = newCartData;
    }
    onCartUpdate(e) {
      if (__privateGet(this, _muteUpdateSync)) return;
      this.syncCart(e);
    }
    async onItemRemoveClick(item) {
      item.state = "removing";
      try {
        __privateSet(this, _muteUpdateSync, true);
        const cart = await CartAPI.changeLineItemQuantity(item.key, 0);
        this.onItemRemoveSuccess(item, cart);
      } catch (error) {
        console.error("Error removing item", error);
      } finally {
        __privateSet(this, _muteUpdateSync, false);
      }
    }
    async onItemQuantityAdjusterChange(item, q) {
      item.state = q === 0 ? "removing" : "updating";
      try {
        __privateSet(this, _muteUpdateSync, true);
        const cart = await CartAPI.changeLineItemQuantity(item.key, q);
        if (q === 0) {
          this.onItemRemoveSuccess(item, cart);
        } else {
          this.onItemChangeSuccess(item, cart);
        }
      } catch (error) {
        item.state = void 0;
        item.quantityAdjuster.value = item.itemData.quantity;
        console.error("Error updating item quantity", error);
      } finally {
        if (q > 0) {
          item.state = void 0;
        }
        __privateSet(this, _muteUpdateSync, false);
      }
    }
  };
  _muteUpdateSync = new WeakMap();
  _CartBody.TYPE = "cart-body";
  let CartBody = _CartBody;
  const selectors$2 = {
    submit: '[type="submit"]',
    subtotalPrice: "[data-subtotal-price]"
  };
  const _CartFooter = class _CartFooter extends BaseComponent {
    constructor(el) {
      super(el, {
        watchCartUpdate: true
      });
      this.submit = this.qs(selectors$2.submit);
      this.subtotalPrice = this.qs(selectors$2.subtotalPrice);
    }
    onCartUpdate(e) {
      const { cart } = e.detail;
      this.subtotalPrice.textContent = cart.items_subtotal_price_formatted;
      if (cart.items.length === 0) {
        this.submit.setAttribute("disabled", "true");
      } else {
        this.submit.removeAttribute("disabled");
      }
    }
  };
  _CartFooter.TYPE = "cart-footer";
  let CartFooter = _CartFooter;
  const selectors$1 = {
    close: "[data-ajax-cart-close]"
  };
  const classes = {
    open: "is-open",
    empty: "is-empty",
    bodyCartOpen: "ajax-cart-open"
  };
  const _AJAXCart = class _AJAXCart extends BaseComponent {
    constructor(el, cartData) {
      super(el, {
        watchCartUpdate: true
      });
      this.isOpen = false;
      this.requestInProgress = false;
      this.role = this.el.getAttribute("role");
      this.cartBody = new CartBody(this.qs(CartBody.SELECTOR), cartData);
      this.cartFooter = new CartFooter(this.qs(CartFooter.SELECTOR));
      this.focusTrap = new FocusTrap(this.el, {
        autofocus: false,
        returnFocus: false,
        preventScroll: true
      });
      this.backdrop = Backdrop.generate(document.body, {
        ariaControls: this.el.id,
        ariaExpanded: false
      });
      this.onBodyClick = this.onBodyClick.bind(this);
      document.body.addEventListener("click", this.onBodyClick);
      this.setEmpty(cartData.item_count === 0);
      if (this.role) {
        this.ariaControlElements.forEach((el2) => el2.setAttribute("aria-haspopup", this.role));
      }
    }
    destroy() {
      this.focusTrap.destroy();
      document.body.classList.remove(classes.bodyCartOpen);
      document.body.removeEventListener("click", this.onBodyClick);
      super.destroy();
    }
    setEmpty(isEmpty) {
      this.el.classList.toggle(classes.empty, isEmpty);
    }
    toggle() {
      return this.isOpen ? this.close() : this.open();
    }
    open() {
      if (this.isOpen) return;
      this.el.classList.add(classes.open);
      this.el.setAttribute("aria-hidden", toAriaBoolean(false));
      this.el.removeAttribute("inert");
      this.backdrop.show();
      this.ariaControlElements.forEach((el) => el.setAttribute("aria-expanded", toAriaBoolean(true)));
      document.body.classList.add(classes.bodyCartOpen);
      this.focusTrap.activate();
      this.isOpen = true;
    }
    close() {
      if (!this.isOpen) return;
      this.el.classList.remove(classes.open);
      this.el.setAttribute("aria-hidden", toAriaBoolean(true));
      this.el.setAttribute("inert", toAriaBoolean(true));
      this.backdrop.hide();
      this.ariaControlElements.forEach((el) => el.setAttribute("aria-expanded", toAriaBoolean(false)));
      document.body.classList.remove(classes.bodyCartOpen);
      this.focusTrap.deactivate();
      this.isOpen = false;
    }
    onCartUpdate(e) {
      const { cart } = e.detail;
      this.setEmpty(cart.item_count === 0);
      this.open();
    }
    onBodyClick(e) {
      const target = e.target;
      if (target?.closest(selectors$1.close)) {
        return this.onCloseClick(e);
      } else if (this.ariaControlElements.some(
        (el) => el.isSameNode(target) || el.contains(target)
      )) {
        e.preventDefault();
        this.toggle();
      }
    }
    onToggleClick(e) {
      e.preventDefault();
      this.toggle();
    }
    onCloseClick(e) {
      e.preventDefault();
      this.close();
    }
  };
  _AJAXCart.TYPE = "ajax-cart";
  let AJAXCart = _AJAXCart;
  const selectors = {
    cartJson: "[data-cart-json]"
  };
  const _AJAXCartSection = class _AJAXCartSection extends BaseSection {
    constructor(container) {
      super(container);
      const cartJsonEl = this.qs(selectors.cartJson);
      if (!cartJsonEl?.textContent) {
        throw new Error("Cart JSON element not found");
      }
      const cartData = JSON.parse(cartJsonEl.textContent);
      this.ajaxCart = new AJAXCart(this.qs(AJAXCart.SELECTOR), cartData);
      if (getQueryParams().cart) {
        this.open({ delay: true });
      }
    }
    open({ delay = false } = {}) {
      setTimeout(() => {
        this.ajaxCart.open();
      }, delay ? 500 : 0);
    }
    close() {
      this.ajaxCart.close();
    }
    onSectionSelect() {
      this.open();
    }
    onSectionDeselect() {
      this.close();
    }
    onNavigateOut() {
      this.close();
    }
    onNavigateIn() {
      if (getQueryParams().cart) {
        this.open({ delay: true });
      }
    }
  };
  _AJAXCartSection.TYPE = "ajax-cart";
  let AJAXCartSection = _AJAXCartSection;
  window.app = window.app || {};
  window.app.taxi = null;
  function init() {
    const viewContainer = document.querySelector("main#view-container");
    const TEMPLATE_REGEX = /\btemplate-\w*/;
    window.app.breakpointsController = new BreakpointsController();
    const sectionManager = new SectionManager();
    sectionManager.register(HeaderSection);
    sectionManager.register(FooterSection);
    sectionManager.register(MobileMenuSection);
    sectionManager.register(AJAXCartSection);
    if (isThemeEditor()) {
      Array.from(document.getElementsByTagName("a")).forEach((a) => a.setAttribute("data-taxi-ignore", "true"));
    }
    const taxi = new Core({
      renderers: {
        default: BaseRenderer
      },
      transitions: {
        default: PageTransition
      },
      reloadJsFilter: (element) => {
        return element.dataset.taxiReload !== void 0 || viewContainer.contains(element);
      },
      allowInterruption: true,
      enablePrefetch: true
    });
    taxi.on("NAVIGATE_OUT", (e) => {
      dispatch("taxi.navigateOut", e);
    });
    taxi.on("NAVIGATE_IN", (e) => {
      const toPage = e.to.page;
      const body = document.body;
      Array.from(body.classList).forEach((cn) => {
        if (TEMPLATE_REGEX.test(cn)) {
          body.classList.remove(cn);
        }
      });
      Array.from(toPage.body.classList).forEach((cn) => {
        if (TEMPLATE_REGEX.test(cn)) {
          body.classList.add(cn);
        }
      });
      dispatch("taxi.navigateIn", e);
    });
    taxi.on("NAVIGATE_END", (e) => {
      taxi.clearCache("/cart");
      taxi.cache.forEach((_, key) => {
        if (key.includes("products") || key.includes("account") || key.includes("cart")) {
          taxi.cache.delete(key);
        }
      });
      targetBlankExternalLinks();
      dispatch("taxi.navigateEnd", e);
    });
    window.app.taxi = taxi;
    targetBlankExternalLinks();
    if (window.history && window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    document.body.classList.add("is-loaded");
    if (isThemeEditor()) {
      document.documentElement.classList.add("is-theme-editor");
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=app.bundle.js.map
