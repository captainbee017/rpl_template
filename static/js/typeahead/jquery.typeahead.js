/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("bloodhound", [ "jquery" ], function(a0) {
            return root["Bloodhound"] = factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root["Bloodhound"] = factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.11.1";
    var tokenizers = function() {
        "use strict";
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey(keys) {
                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(keys, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        "use strict";
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                    this.size--;
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        "use strict";
        var LOCAL_STORAGE;
        try {
            LOCAL_STORAGE = window.localStorage;
            LOCAL_STORAGE.setItem("~~~", "!");
            LOCAL_STORAGE.removeItem("~~~");
        } catch (err) {
            LOCAL_STORAGE = null;
        }
        function PersistentStorage(namespace, override) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            this.ls = override || LOCAL_STORAGE;
            !this.ls && this._noop();
        }
        _.mixin(PersistentStorage.prototype, {
            _prefix: function(key) {
                return this.prefix + key;
            },
            _ttlKey: function(key) {
                return this._prefix(key) + this.ttlKey;
            },
            _noop: function() {
                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
            },
            _safeSet: function(key, val) {
                try {
                    this.ls.setItem(key, val);
                } catch (err) {
                    if (err.name === "QuotaExceededError") {
                        this.clear();
                        this._noop();
                    }
                }
            },
            get: function(key) {
                if (this.isExpired(key)) {
                    this.remove(key);
                }
                return decode(this.ls.getItem(this._prefix(key)));
            },
            set: function(key, val, ttl) {
                if (_.isNumber(ttl)) {
                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
                } else {
                    this.ls.removeItem(this._ttlKey(key));
                }
                return this._safeSet(this._prefix(key), encode(val));
            },
            remove: function(key) {
                this.ls.removeItem(this._ttlKey(key));
                this.ls.removeItem(this._prefix(key));
                return this;
            },
            clear: function() {
                var i, keys = gatherMatchingKeys(this.keyMatcher);
                for (i = keys.length; i--; ) {
                    this.remove(keys[i]);
                }
                return this;
            },
            isExpired: function(key) {
                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
                return _.isNumber(ttl) && now() > ttl ? true : false;
            }
        });
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return $.parseJSON(val);
        }
        function gatherMatchingKeys(keyMatcher) {
            var i, key, keys = [], len = LOCAL_STORAGE.length;
            for (i = 0; i < len; i++) {
                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
                    keys.push(key.replace(keyMatcher, ""));
                }
            }
            return keys;
        }
    }();
    var Transport = function() {
        "use strict";
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastReq = null;
            this._send = o.transport;
            this._get = o.limiter ? o.limiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _fingerprint: function fingerprint(o) {
                o = o || {};
                return o.url + o.type + $.param(o.data || {});
            },
            _get: function(o, cb) {
                var that = this, fingerprint, jqXhr;
                fingerprint = this._fingerprint(o);
                if (this.cancelled || fingerprint !== this.lastReq) {
                    return;
                }
                if (jqXhr = pendingRequests[fingerprint]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb(null, resp);
                    that._cache.set(fingerprint, resp);
                }
                function fail() {
                    cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[fingerprint];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(o, cb) {
                var resp, fingerprint;
                cb = cb || $.noop;
                o = _.isString(o) ? {
                    url: o
                } : o || {};
                fingerprint = this._fingerprint(o);
                this.cancelled = false;
                this.lastReq = fingerprint;
                if (resp = this._cache.get(fingerprint)) {
                    cb(null, resp);
                } else {
                    this._get(o, cb);
                }
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
    }();
    var SearchIndex = window.SearchIndex = function() {
        "use strict";
        var CHILDREN = "c", IDS = "i";
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.identify = o.identify || _.stringify;
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    that.datums[id = that.identify(datum)] = datum;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
                            node[IDS].push(id);
                        }
                    });
                });
            },
            get: function get(ids) {
                var that = this;
                return _.map(ids, function(id) {
                    return that.datums[id];
                });
            },
            search: function search(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node[CHILDREN][ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node[IDS].slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            all: function all() {
                var values = [];
                for (var key in this.datums) {
                    values.push(this.datums[key]);
                }
                return values;
            },
            reset: function reset() {
                this.datums = {};
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            var node = {};
            node[IDS] = [];
            node[CHILDREN] = {};
            return node;
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort();
            arrayB = arrayB.sort();
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
        }
    }();
    var Prefetch = function() {
        "use strict";
        var keys;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        function Prefetch(o) {
            this.url = o.url;
            this.ttl = o.ttl;
            this.cache = o.cache;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = o.transport;
            this.thumbprint = o.thumbprint;
            this.storage = new PersistentStorage(o.cacheKey);
        }
        _.mixin(Prefetch.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            store: function store(data) {
                if (!this.cache) {
                    return;
                }
                this.storage.set(keys.data, data, this.ttl);
                this.storage.set(keys.protocol, location.protocol, this.ttl);
                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
            },
            fromCache: function fromCache() {
                var stored = {}, isExpired;
                if (!this.cache) {
                    return null;
                }
                stored.data = this.storage.get(keys.data);
                stored.protocol = this.storage.get(keys.protocol);
                stored.thumbprint = this.storage.get(keys.thumbprint);
                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            fromNetwork: function(cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                settings = this.prepare(this._settings());
                this.transport(settings).fail(onError).done(onResponse);
                function onError() {
                    cb(true);
                }
                function onResponse(resp) {
                    cb(null, that.transform(resp));
                }
            },
            clear: function clear() {
                this.storage.clear();
                return this;
            }
        });
        return Prefetch;
    }();
    var Remote = function() {
        "use strict";
        function Remote(o) {
            this.url = o.url;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = new Transport({
                cache: o.cache,
                limiter: o.limiter,
                transport: o.transport
            });
        }
        _.mixin(Remote.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            get: function get(query, cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                query = query || "";
                settings = this.prepare(query, this._settings());
                return this.transport.get(settings, onResponse);
                function onResponse(err, resp) {
                    err ? cb([]) : cb(that.transform(resp));
                }
            },
            cancelLastRequest: function cancelLastRequest() {
                this.transport.cancel();
            }
        });
        return Remote;
    }();
    var oParser = function() {
        "use strict";
        return function parse(o) {
            var defaults, sorter;
            defaults = {
                initialize: true,
                identify: _.stringify,
                datumTokenizer: null,
                queryTokenizer: null,
                sufficient: 5,
                sorter: null,
                local: [],
                prefetch: null,
                remote: null
            };
            o = _.mixin(defaults, o || {});
            !o.datumTokenizer && $.error("datumTokenizer is required");
            !o.queryTokenizer && $.error("queryTokenizer is required");
            sorter = o.sorter;
            o.sorter = sorter ? function(x) {
                return x.sort(sorter);
            } : _.identity;
            o.local = _.isFunction(o.local) ? o.local() : o.local;
            o.prefetch = parsePrefetch(o.prefetch);
            o.remote = parseRemote(o.remote);
            return o;
        };
        function parsePrefetch(o) {
            var defaults;
            if (!o) {
                return null;
            }
            defaults = {
                url: null,
                ttl: 24 * 60 * 60 * 1e3,
                cache: true,
                cacheKey: null,
                thumbprint: "",
                prepare: _.identity,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("prefetch requires url to be set");
            o.transform = o.filter || o.transform;
            o.cacheKey = o.cacheKey || o.url;
            o.thumbprint = VERSION + o.thumbprint;
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            return o;
        }
        function parseRemote(o) {
            var defaults;
            if (!o) {
                return;
            }
            defaults = {
                url: null,
                cache: true,
                prepare: null,
                replace: null,
                wildcard: null,
                limiter: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("remote requires url to be set");
            o.transform = o.filter || o.transform;
            o.prepare = toRemotePrepare(o);
            o.limiter = toLimiter(o);
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            delete o.replace;
            delete o.wildcard;
            delete o.rateLimitBy;
            delete o.rateLimitWait;
            return o;
        }
        function toRemotePrepare(o) {
            var prepare, replace, wildcard;
            prepare = o.prepare;
            replace = o.replace;
            wildcard = o.wildcard;
            if (prepare) {
                return prepare;
            }
            if (replace) {
                prepare = prepareByReplace;
            } else if (o.wildcard) {
                prepare = prepareByWildcard;
            } else {
                prepare = idenityPrepare;
            }
            return prepare;
            function prepareByReplace(query, settings) {
                settings.url = replace(settings.url, query);
                return settings;
            }
            function prepareByWildcard(query, settings) {
                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
                return settings;
            }
            function idenityPrepare(query, settings) {
                return settings;
            }
        }
        function toLimiter(o) {
            var limiter, method, wait;
            limiter = o.limiter;
            method = o.rateLimitBy;
            wait = o.rateLimitWait;
            if (!limiter) {
                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
            }
            return limiter;
            function debounce(wait) {
                return function debounce(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function throttle(wait) {
                return function throttle(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
        function callbackToDeferred(fn) {
            return function wrapper(o) {
                var deferred = $.Deferred();
                fn(o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var Bloodhound = function() {
        "use strict";
        var old;
        old = window && window.Bloodhound;
        function Bloodhound(o) {
            o = oParser(o);
            this.sorter = o.sorter;
            this.identify = o.identify;
            this.sufficient = o.sufficient;
            this.local = o.local;
            this.remote = o.remote ? new Remote(o.remote) : null;
            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
            this.index = new SearchIndex({
                identify: this.identify,
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            o.initialize !== false && this.initialize();
        }
        Bloodhound.noConflict = function noConflict() {
            window && (window.Bloodhound = old);
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            __ttAdapter: function ttAdapter() {
                var that = this;
                return this.remote ? withAsync : withoutAsync;
                function withAsync(query, sync, async) {
                    return that.search(query, sync, async);
                }
                function withoutAsync(query, sync) {
                    return that.search(query, sync);
                }
            },
            _loadPrefetch: function loadPrefetch() {
                var that = this, deferred, serialized;
                deferred = $.Deferred();
                if (!this.prefetch) {
                    deferred.resolve();
                } else if (serialized = this.prefetch.fromCache()) {
                    this.index.bootstrap(serialized);
                    deferred.resolve();
                } else {
                    this.prefetch.fromNetwork(done);
                }
                return deferred.promise();
                function done(err, data) {
                    if (err) {
                        return deferred.reject();
                    }
                    that.add(data);
                    that.prefetch.store(that.index.serialize());
                    deferred.resolve();
                }
            },
            _initialize: function initialize() {
                var that = this, deferred;
                this.clear();
                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
                return this.initPromise;
                function addLocalToIndex() {
                    that.add(that.local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
                return this;
            },
            get: function get(ids) {
                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
                return this.index.get(ids);
            },
            search: function search(query, sync, async) {
                var that = this, local;
                local = this.sorter(this.index.search(query));
                sync(this.remote ? local.slice() : local);
                if (this.remote && local.length < this.sufficient) {
                    this.remote.get(query, processRemote);
                } else if (this.remote) {
                    this.remote.cancelLastRequest();
                }
                return this;
                function processRemote(remote) {
                    var nonDuplicates = [];
                    _.each(remote, function(r) {
                        !_.some(local, function(l) {
                            return that.identify(r) === that.identify(l);
                        }) && nonDuplicates.push(r);
                    });
                    async && async(nonDuplicates);
                }
            },
            all: function all() {
                return this.index.all();
            },
            clear: function clear() {
                this.index.reset();
                return this;
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.prefetch && this.prefetch.clear();
                return this;
            },
            clearRemoteCache: function clearRemoteCache() {
                Transport.resetCache();
                return this;
            },
            ttAdapter: function ttAdapter() {
                return this.__ttAdapter();
            }
        });
        return Bloodhound;
    }();
    return Bloodhound;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("typeahead.js", [ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var WWW = function() {
        "use strict";
        var defaultClassNames = {
            wrapper: "twitter-typeahead",
            input: "tt-input",
            hint: "tt-hint",
            menu: "tt-menu",
            dataset: "tt-dataset",
            suggestion: "tt-suggestion",
            selectable: "tt-selectable",
            empty: "tt-empty",
            open: "tt-open",
            cursor: "tt-cursor",
            highlight: "tt-highlight"
        };
        return build;
        function build(o) {
            var www, classes;
            classes = _.mixin({}, defaultClassNames, o);
            www = {
                css: buildCss(),
                classes: classes,
                html: buildHtml(classes),
                selectors: buildSelectors(classes)
            };
            return {
                css: www.css,
                html: www.html,
                classes: www.classes,
                selectors: www.selectors,
                mixin: function(o) {
                    _.mixin(o, www);
                }
            };
        }
        function buildHtml(c) {
            return {
                wrapper: '<span class="' + c.wrapper + '"></span>',
                menu: '<div class="' + c.menu + '"></div>'
            };
        }
        function buildSelectors(classes) {
            var selectors = {};
            _.each(classes, function(v, k) {
                selectors[k] = "." + v;
            });
            return selectors;
        }
        function buildCss() {
            var css = {
                wrapper: {
                    position: "relative",
                    display: "inline-block"
                },
                hint: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    borderColor: "transparent",
                    boxShadow: "none",
                    opacity: "1"
                },
                input: {
                    position: "relative",
                    verticalAlign: "top",
                    backgroundColor: "transparent"
                },
                inputWithNoHint: {
                    position: "relative",
                    verticalAlign: "top"
                },
                menu: {
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    zIndex: "100",
                    display: "none"
                },
                ltr: {
                    left: "0",
                    right: "auto"
                },
                rtl: {
                    left: "auto",
                    right: " 0"
                }
            };
            if (_.isMsie()) {
                _.mixin(css.input, {
                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
                });
            }
            return css;
        }
    }();
    var EventBus = function() {
        "use strict";
        var namespace, deprecationMap;
        namespace = "typeahead:";
        deprecationMap = {
            render: "rendered",
            cursorchange: "cursorchanged",
            select: "selected",
            autocomplete: "autocompleted"
        };
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            _trigger: function(type, args) {
                var $e;
                $e = $.Event(namespace + type);
                (args = args || []).unshift($e);
                this.$el.trigger.apply(this.$el, args);
                return $e;
            },
            before: function(type) {
                var args, $e;
                args = [].slice.call(arguments, 1);
                $e = this._trigger("before" + type, args);
                return $e.isDefaultPrevented();
            },
            trigger: function(type) {
                var deprecatedType;
                this._trigger(type, [].slice.call(arguments, 1));
                if (deprecatedType = deprecationMap[type]) {
                    this._trigger(deprecatedType, [].slice.call(arguments, 1));
                }
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        "use strict";
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        "use strict";
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        "use strict";
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o, www) {
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            www.mixin(this);
            this.$hint = $(o.hint);
            this.$input = $(o.input);
            this.query = this.$input.val();
            this.queryWhenFocused = this.hasFocus() ? this.query : null;
            this.$overflowHelper = buildOverflowHelper(this.$input);
            this._checkLanguageDirection();
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
        }
        Input.normalizeQuery = function(str) {
            return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.queryWhenFocused = this.query;
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._setQuery(this.getInputValue());
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault;
                switch (keyName) {
                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkLanguageDirection: function checkLanguageDirection() {
                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.$hint.attr("dir", dir);
                    this.trigger("langDirChanged", dir);
                }
            },
            _setQuery: function setQuery(val, silent) {
                var areEquivalent, hasDifferentWhitespace;
                areEquivalent = areQueriesEquivalent(val, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
                this.query = val;
                if (!silent && !areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (!silent && hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            bind: function() {
                var that = this, onBlur, onFocus, onKeydown, onInput;
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (!_.isMsie() || _.isMsie() > 9) {
                    this.$input.on("input.tt", onInput);
                } else {
                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                            return;
                        }
                        _.defer(_.bind(that._onInput, that, $e));
                    });
                }
                return this;
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getLangDir: function getLangDir() {
                return this.dir;
            },
            getQuery: function getQuery() {
                return this.query || "";
            },
            setQuery: function setQuery(val, silent) {
                this.setInputValue(val);
                this._setQuery(val, silent);
            },
            hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
                return this.query !== this.queryWhenFocused;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value) {
                this.$input.val(value);
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            hasFocus: function hasFocus() {
                return this.$input.is(":focus");
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$overflowHelper.remove();
                this.$hint = this.$input = this.$overflowHelper = $("<div>");
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        "use strict";
        var keys, nameGenerator;
        keys = {
            val: "tt-selectable-display",
            obj: "tt-selectable-object"
        };
        nameGenerator = _.getIdGenerator();
        function Dataset(o, www) {
            o = o || {};
            o.templates = o.templates || {};
            o.templates.notFound = o.templates.notFound || o.templates.empty;
            if (!o.source) {
                $.error("missing source");
            }
            if (!o.node) {
                $.error("missing node");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            www.mixin(this);
            this.highlight = !!o.highlight;
            this.name = o.name || nameGenerator();
            this.limit = o.limit || 5;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
            this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
            this._resetLastSuggestion();
            this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
        }
        Dataset.extractData = function extractData(el) {
            var $el = $(el);
            if ($el.data(keys.obj)) {
                return {
                    val: $el.data(keys.val) || "",
                    obj: $el.data(keys.obj) || null
                };
            }
            return null;
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _overwrite: function overwrite(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (this.async && this.templates.pending) {
                    this._renderPending(query);
                } else if (!this.async && this.templates.notFound) {
                    this._renderNotFound(query);
                } else {
                    this._empty();
                }
                this.trigger("rendered", this.name, suggestions, false);
            },
            _append: function append(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length && this.$lastSuggestion.length) {
                    this._appendSuggestions(query, suggestions);
                } else if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (!this.$lastSuggestion.length && this.templates.notFound) {
                    this._renderNotFound(query);
                }
                this.trigger("rendered", this.name, suggestions, true);
            },
            _renderSuggestions: function renderSuggestions(query, suggestions) {
                var $fragment;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                this.$lastSuggestion = $fragment.children().last();
                this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
            },
            _appendSuggestions: function appendSuggestions(query, suggestions) {
                var $fragment, $lastSuggestion;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                $lastSuggestion = $fragment.children().last();
                this.$lastSuggestion.after($fragment);
                this.$lastSuggestion = $lastSuggestion;
            },
            _renderPending: function renderPending(query) {
                var template = this.templates.pending;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _renderNotFound: function renderNotFound(query) {
                var template = this.templates.notFound;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _empty: function empty() {
                this.$el.empty();
                this._resetLastSuggestion();
            },
            _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
                var that = this, fragment;
                fragment = document.createDocumentFragment();
                _.each(suggestions, function getSuggestionNode(suggestion) {
                    var $el, context;
                    context = that._injectQuery(query, suggestion);
                    $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
                    fragment.appendChild($el[0]);
                });
                this.highlight && highlight({
                    className: this.classes.highlight,
                    node: fragment,
                    pattern: query
                });
                return $(fragment);
            },
            _getFooter: function getFooter(query, suggestions) {
                return this.templates.footer ? this.templates.footer({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _getHeader: function getHeader(query, suggestions) {
                return this.templates.header ? this.templates.header({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _resetLastSuggestion: function resetLastSuggestion() {
                this.$lastSuggestion = $();
            },
            _injectQuery: function injectQuery(query, obj) {
                return _.isObject(obj) ? _.mixin({
                    _query: query
                }, obj) : obj;
            },
            update: function update(query) {
                var that = this, canceled = false, syncCalled = false, rendered = 0;
                this.cancel();
                this.cancel = function cancel() {
                    canceled = true;
                    that.cancel = $.noop;
                    that.async && that.trigger("asyncCanceled", query);
                };
                this.source(query, sync, async);
                !syncCalled && sync([]);
                function sync(suggestions) {
                    if (syncCalled) {
                        return;
                    }
                    syncCalled = true;
                    suggestions = (suggestions || []).slice(0, that.limit);
                    rendered = suggestions.length;
                    that._overwrite(query, suggestions);
                    if (rendered < that.limit && that.async) {
                        that.trigger("asyncRequested", query);
                    }
                }
                function async(suggestions) {
                    suggestions = suggestions || [];
                    if (!canceled && rendered < that.limit) {
                        that.cancel = $.noop;
                        rendered += suggestions.length;
                        that._append(query, suggestions.slice(0, that.limit - rendered));
                        that.async && that.trigger("asyncReceived", query);
                    }
                }
            },
            cancel: $.noop,
            clear: function clear() {
                this._empty();
                this.cancel();
                this.trigger("cleared");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = $("<div>");
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || _.stringify;
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                notFound: templates.notFound && _.templatify(templates.notFound),
                pending: templates.pending && _.templatify(templates.pending),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return $("<div>").text(displayFn(context));
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Menu = function() {
        "use strict";
        function Menu(o, www) {
            var that = this;
            o = o || {};
            if (!o.node) {
                $.error("node is required");
            }
            www.mixin(this);
            this.$node = $(o.node);
            this.query = null;
            this.datasets = _.map(o.datasets, initializeDataset);
            function initializeDataset(oDataset) {
                var node = that.$node.find(oDataset.node).first();
                oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
                return new Dataset(oDataset, www);
            }
        }
        _.mixin(Menu.prototype, EventEmitter, {
            _onSelectableClick: function onSelectableClick($e) {
                this.trigger("selectableClicked", $($e.currentTarget));
            },
            _onRendered: function onRendered(type, dataset, suggestions, async) {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetRendered", dataset, suggestions, async);
            },
            _onCleared: function onCleared() {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetCleared");
            },
            _propagate: function propagate() {
                this.trigger.apply(this, arguments);
            },
            _allDatasetsEmpty: function allDatasetsEmpty() {
                return _.every(this.datasets, isDatasetEmpty);
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _getSelectables: function getSelectables() {
                return this.$node.find(this.selectors.selectable);
            },
            _removeCursor: function _removeCursor() {
                var $selectable = this.getActiveSelectable();
                $selectable && $selectable.removeClass(this.classes.cursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, nodeScrollTop, nodeHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                nodeScrollTop = this.$node.scrollTop();
                nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$node.scrollTop(nodeScrollTop + elTop);
                } else if (nodeHeight < elBottom) {
                    this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
                }
            },
            bind: function() {
                var that = this, onSelectableClick;
                onSelectableClick = _.bind(this._onSelectableClick, this);
                this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
                _.each(this.datasets, function(dataset) {
                    dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
                });
                return this;
            },
            isOpen: function isOpen() {
                return this.$node.hasClass(this.classes.open);
            },
            open: function open() {
                this.$node.addClass(this.classes.open);
            },
            close: function close() {
                this.$node.removeClass(this.classes.open);
                this._removeCursor();
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.attr("dir", dir);
            },
            selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
                var $selectables, $oldCursor, oldIndex, newIndex;
                $oldCursor = this.getActiveSelectable();
                $selectables = this._getSelectables();
                oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
                newIndex = oldIndex + delta;
                newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
                newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
                return newIndex === -1 ? null : $selectables.eq(newIndex);
            },
            setCursor: function setCursor($selectable) {
                this._removeCursor();
                if ($selectable = $selectable && $selectable.first()) {
                    $selectable.addClass(this.classes.cursor);
                    this._ensureVisible($selectable);
                }
            },
            getSelectableData: function getSelectableData($el) {
                return $el && $el.length ? Dataset.extractData($el) : null;
            },
            getActiveSelectable: function getActiveSelectable() {
                var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
                return $selectable.length ? $selectable : null;
            },
            getTopSelectable: function getTopSelectable() {
                var $selectable = this._getSelectables().first();
                return $selectable.length ? $selectable : null;
            },
            update: function update(query) {
                var isValidUpdate = query !== this.query;
                if (isValidUpdate) {
                    this.query = query;
                    _.each(this.datasets, updateDataset);
                }
                return isValidUpdate;
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.query = null;
                this.$node.addClass(this.classes.empty);
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            destroy: function destroy() {
                this.$node.off(".tt");
                this.$node = $("<div>");
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Menu;
    }();
    var DefaultMenu = function() {
        "use strict";
        var s = Menu.prototype;
        function DefaultMenu() {
            Menu.apply(this, [].slice.call(arguments, 0));
        }
        _.mixin(DefaultMenu.prototype, Menu.prototype, {
            open: function open() {
                !this._allDatasetsEmpty() && this._show();
                return s.open.apply(this, [].slice.call(arguments, 0));
            },
            close: function close() {
                this._hide();
                return s.close.apply(this, [].slice.call(arguments, 0));
            },
            _onRendered: function onRendered() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onRendered.apply(this, [].slice.call(arguments, 0));
            },
            _onCleared: function onCleared() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onCleared.apply(this, [].slice.call(arguments, 0));
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
                return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
            },
            _hide: function hide() {
                this.$node.hide();
            },
            _show: function show() {
                this.$node.css("display", "block");
            }
        });
        return DefaultMenu;
    }();
    var Typeahead = function() {
        "use strict";
        function Typeahead(o, www) {
            var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            if (!o.menu) {
                $.error("missing menu");
            }
            if (!o.eventBus) {
                $.error("missing event bus");
            }
            www.mixin(this);
            this.eventBus = o.eventBus;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.input = o.input;
            this.menu = o.menu;
            this.enabled = true;
            this.active = false;
            this.input.hasFocus() && this.activate();
            this.dir = this.input.getLangDir();
            this._hacks();
            this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
            onFocused = c(this, "activate", "open", "_onFocused");
            onBlurred = c(this, "deactivate", "_onBlurred");
            onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
            onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
            onEscKeyed = c(this, "isActive", "_onEscKeyed");
            onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
            onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
            onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
            onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
            onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
            onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
            this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
        }
        _.mixin(Typeahead.prototype, {
            _hacks: function hacks() {
                var $input, $menu;
                $input = this.input.$input || $("<div>");
                $menu = this.menu.$node || $("<div>");
                $input.on("blur.tt", function($e) {
                    var active, isActive, hasActive;
                    active = document.activeElement;
                    isActive = $menu.is(active);
                    hasActive = $menu.has(active).length > 0;
                    if (_.isMsie() && (isActive || hasActive)) {
                        $e.preventDefault();
                        $e.stopImmediatePropagation();
                        _.defer(function() {
                            $input.focus();
                        });
                    }
                });
                $menu.on("mousedown.tt", function($e) {
                    $e.preventDefault();
                });
            },
            _onSelectableClicked: function onSelectableClicked(type, $el) {
                this.select($el);
            },
            _onDatasetCleared: function onDatasetCleared() {
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
                this._updateHint();
                this.eventBus.trigger("render", suggestions, async, dataset);
            },
            _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
                this.eventBus.trigger("asyncrequest", query, dataset);
            },
            _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
                this.eventBus.trigger("asynccancel", query, dataset);
            },
            _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
                this.eventBus.trigger("asyncreceive", query, dataset);
            },
            _onFocused: function onFocused() {
                this._minLengthMet() && this.menu.update(this.input.getQuery());
            },
            _onBlurred: function onBlurred() {
                if (this.input.hasQueryChangedSinceLastFocus()) {
                    this.eventBus.trigger("change", this.input.getQuery());
                }
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                } else if ($selectable = this.menu.getTopSelectable()) {
                    this.autocomplete($selectable) && $e.preventDefault();
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.close();
            },
            _onUpKeyed: function onUpKeyed() {
                this.moveCursor(-1);
            },
            _onDownKeyed: function onDownKeyed() {
                this.moveCursor(+1);
            },
            _onLeftKeyed: function onLeftKeyed() {
                if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onRightKeyed: function onRightKeyed() {
                if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
            },
            _onLangDirChanged: function onLangDirChanged(e, dir) {
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.menu.setLanguageDirection(dir);
                }
            },
            _openIfActive: function openIfActive() {
                this.isActive() && this.open();
            },
            _minLengthMet: function minLengthMet(query) {
                query = _.isString(query) ? query : this.input.getQuery() || "";
                return query.length >= this.minLength;
            },
            _updateHint: function updateHint() {
                var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
                $selectable = this.menu.getTopSelectable();
                data = this.menu.getSelectableData($selectable);
                val = this.input.getInputValue();
                if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(data.val);
                    match && this.input.setHint(val + match[1]);
                } else {
                    this.input.clearHint();
                }
            },
            isEnabled: function isEnabled() {
                return this.enabled;
            },
            enable: function enable() {
                this.enabled = true;
            },
            disable: function disable() {
                this.enabled = false;
            },
            isActive: function isActive() {
                return this.active;
            },
            activate: function activate() {
                if (this.isActive()) {
                    return true;
                } else if (!this.isEnabled() || this.eventBus.before("active")) {
                    return false;
                } else {
                    this.active = true;
                    this.eventBus.trigger("active");
                    return true;
                }
            },
            deactivate: function deactivate() {
                if (!this.isActive()) {
                    return true;
                } else if (this.eventBus.before("idle")) {
                    return false;
                } else {
                    this.active = false;
                    this.close();
                    this.eventBus.trigger("idle");
                    return true;
                }
            },
            isOpen: function isOpen() {
                return this.menu.isOpen();
            },
            open: function open() {
                if (!this.isOpen() && !this.eventBus.before("open")) {
                    this.menu.open();
                    this._updateHint();
                    this.eventBus.trigger("open");
                }
                return this.isOpen();
            },
            close: function close() {
                if (this.isOpen() && !this.eventBus.before("close")) {
                    this.menu.close();
                    this.input.clearHint();
                    this.input.resetInputValue();
                    this.eventBus.trigger("close");
                }
                return !this.isOpen();
            },
            setVal: function setVal(val) {
                this.input.setQuery(_.toStr(val));
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            select: function select($selectable) {
                var data = this.menu.getSelectableData($selectable);
                if (data && !this.eventBus.before("select", data.obj)) {
                    this.input.setQuery(data.val, true);
                    this.eventBus.trigger("select", data.obj);
                    this.close();
                    return true;
                }
                return false;
            },
            autocomplete: function autocomplete($selectable) {
                var query, data, isValid;
                query = this.input.getQuery();
                data = this.menu.getSelectableData($selectable);
                isValid = data && query !== data.val;
                if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
                    this.input.setQuery(data.val);
                    this.eventBus.trigger("autocomplete", data.obj);
                    return true;
                }
                return false;
            },
            moveCursor: function moveCursor(delta) {
                var query, $candidate, data, payload, cancelMove;
                query = this.input.getQuery();
                $candidate = this.menu.selectableRelativeToCursor(delta);
                data = this.menu.getSelectableData($candidate);
                payload = data ? data.obj : null;
                cancelMove = this._minLengthMet() && this.menu.update(query);
                if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
                    this.menu.setCursor($candidate);
                    if (data) {
                        this.input.setInputValue(data.val);
                    } else {
                        this.input.resetInputValue();
                        this._updateHint();
                    }
                    this.eventBus.trigger("cursorchange", payload);
                    return true;
                }
                return false;
            },
            destroy: function destroy() {
                this.input.destroy();
                this.menu.destroy();
            }
        });
        return Typeahead;
        function c(ctx) {
            var methods = [].slice.call(arguments, 1);
            return function() {
                var args = [].slice.call(arguments);
                _.each(methods, function(method) {
                    return ctx[method].apply(ctx, args);
                });
            };
        }
    }();
    (function() {
        "use strict";
        var old, keys, methods;
        old = $.fn.typeahead;
        keys = {
            www: "tt-www",
            attrs: "tt-attrs",
            typeahead: "tt-typeahead"
        };
        methods = {
            initialize: function initialize(o, datasets) {
                var www;
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                www = WWW(o.classNames);
                return this.each(attach);
                function attach() {
                    var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    $input = $(this);
                    $wrapper = $(www.html.wrapper);
                    $hint = $elOrNull(o.hint);
                    $menu = $elOrNull(o.menu);
                    defaultHint = o.hint !== false && !$hint;
                    defaultMenu = o.menu !== false && !$menu;
                    defaultHint && ($hint = buildHintFromInput($input, www));
                    defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
                    $hint && $hint.val("");
                    $input = prepInput($input, www);
                    if (defaultHint || defaultMenu) {
                        $wrapper.css(www.css.wrapper);
                        $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
                        $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
                    }
                    MenuConstructor = defaultMenu ? DefaultMenu : Menu;
                    eventBus = new EventBus({
                        el: $input
                    });
                    input = new Input({
                        hint: $hint,
                        input: $input
                    }, www);
                    menu = new MenuConstructor({
                        node: $menu,
                        datasets: datasets
                    }, www);
                    typeahead = new Typeahead({
                        input: input,
                        menu: menu,
                        eventBus: eventBus,
                        minLength: o.minLength
                    }, www);
                    $input.data(keys.www, www);
                    $input.data(keys.typeahead, typeahead);
                }
            },
            isEnabled: function isEnabled() {
                var enabled;
                ttEach(this.first(), function(t) {
                    enabled = t.isEnabled();
                });
                return enabled;
            },
            enable: function enable() {
                ttEach(this, function(t) {
                    t.enable();
                });
                return this;
            },
            disable: function disable() {
                ttEach(this, function(t) {
                    t.disable();
                });
                return this;
            },
            isActive: function isActive() {
                var active;
                ttEach(this.first(), function(t) {
                    active = t.isActive();
                });
                return active;
            },
            activate: function activate() {
                ttEach(this, function(t) {
                    t.activate();
                });
                return this;
            },
            deactivate: function deactivate() {
                ttEach(this, function(t) {
                    t.deactivate();
                });
                return this;
            },
            isOpen: function isOpen() {
                var open;
                ttEach(this.first(), function(t) {
                    open = t.isOpen();
                });
                return open;
            },
            open: function open() {
                ttEach(this, function(t) {
                    t.open();
                });
                return this;
            },
            close: function close() {
                ttEach(this, function(t) {
                    t.close();
                });
                return this;
            },
            select: function select(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.select($el);
                });
                return success;
            },
            autocomplete: function autocomplete(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.autocomplete($el);
                });
                return success;
            },
            moveCursor: function moveCursoe(delta) {
                var success = false;
                ttEach(this.first(), function(t) {
                    success = t.moveCursor(delta);
                });
                return success;
            },
            val: function val(newVal) {
                var query;
                if (!arguments.length) {
                    ttEach(this.first(), function(t) {
                        query = t.getVal();
                    });
                    return query;
                } else {
                    ttEach(this, function(t) {
                        t.setVal(newVal);
                    });
                    return this;
                }
            },
            destroy: function destroy() {
                ttEach(this, function(typeahead, $input) {
                    revert($input);
                    typeahead.destroy();
                });
                return this;
            }
        };
        $.fn.typeahead = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
        function ttEach($els, fn) {
            $els.each(function() {
                var $input = $(this), typeahead;
                (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
            });
        }
        function buildHintFromInput($input, www) {
            return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
        }
        function prepInput($input, www) {
            $input.data(keys.attrs, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass(www.classes.input).attr({
                autocomplete: "off",
                spellcheck: false
            });
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input;
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function revert($input) {
            var www, $wrapper;
            www = $input.data(keys.www);
            $wrapper = $input.parent().filter(www.selectors.wrapper);
            _.each($input.data(keys.attrs), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
            if ($wrapper.length) {
                $input.detach().insertAfter($wrapper);
                $wrapper.remove();
            }
        }
        function $elOrNull(obj) {
            var isValid, $el;
            isValid = _.isJQuery(obj) || _.isElement(obj);
            $el = isValid ? $(obj).first() : [];
            return $el.length ? $el : null;
        }
    })();
});















// /*!
//  * jQuery Typeahead
//  * Copyright (C) 2017 RunningCoder.org
//  * Licensed under the MIT license
//  *
//  * @author Tom Bertrand
//  * @version 2.8.0 (2017-3-1)
//  * @link http://www.runningcoder.org/jquerytypeahead/
//  */
// ;(function (factory) {
//     if (typeof define === 'function' && define.amd) {
//         define('jquery-typeahead', ['jquery'], function (jQuery) {
//             return factory(jQuery);
//         });
//     } else if (typeof module === 'object' && module.exports) {
//         module.exports = function (jQuery, root) {
//             if (jQuery === undefined) {
//                 if (typeof window !== 'undefined') {
//                     jQuery = require('jquery');
//                 }
//                 else {
//                     jQuery = require('jquery')(root);
//                 }
//             }
//             return factory(jQuery);
//         }();
//     } else {
//         factory(jQuery);
//     }
// }(function ($) {

//     "use strict";

//     window.Typeahead = {
//         version: '2.8.0'
//     };

//     /**
//      * @private
//      * Default options
//      *
//      * @link http://www.runningcoder.org/jquerytypeahead/documentation/
//      */
//     var _options = {
//         input: null,            // *RECOMMENDED*, jQuery selector to reach Typeahead's input for initialization
//         minLength: 2,           // Accepts 0 to search on focus, minimum character length to perform a search
//         maxLength: false,       // False as "Infinity" will not put character length restriction for searching results
//         maxItem: 8,             // Accepts 0 / false as "Infinity" meaning all the results will be displayed
//         dynamic: false,         // When true, Typeahead will get a new dataset from the source option on every key press
//         delay: 300,             // delay in ms when dynamic option is set to true
//         order: null,            // "asc" or "desc" to sort results
//         offset: false,          // Set to true to match items starting from their first character
//         hint: false,            // Added support for excessive "space" characters
//         accent: false,          // Will allow to type accent and give letter equivalent results, also can define a custom replacement object
//         highlight: true,        // Added "any" to highlight any word in the template, by default true will only highlight display keys
//         group: false,           // Improved feature, Boolean,string,object(key, template (string, function))
//         groupOrder: null,       // New feature, order groups "asc", "desc", Array, Function
//         maxItemPerGroup: null,  // Maximum number of result per Group
//         dropdownFilter: false,  // Take group options string and create a dropdown filter
//         dynamicFilter: null,    // Filter the typeahead results based on dynamic value, Ex: Players based on TeamID
//         backdrop: false,        // Add a backdrop behind Typeahead results
//         backdropOnFocus: false, // Display the backdrop option as the Typeahead input is :focused
//         cache: false,           // Improved option, true OR 'localStorage' OR 'sessionStorage'
//         ttl: 3600000,           // Cache time to live in ms
//         compression: false,     // Requires LZString library
//         searchOnFocus: false,   // Display search results on input focus
//         blurOnTab: true,        // Blur Typeahead when Tab key is pressed, if false Tab will go though search results
//         resultContainer: null,  // List the results inside any container string or jQuery object
//         generateOnLoad: null,   // Forces the source to be generated on page load even if the input is not focused!
//         mustSelectItem: false,  // The submit function only gets called if an item is selected
//         href: null,             // String or Function to format the url for right-click & open in new tab on link results
//         display: ["display"],   // Allows search in multiple item keys ["display1", "display2"]
//         template: null,         // Display template of each of the result list
//         templateValue: null,    // Set the input value template when an item is clicked
//         groupTemplate: null,    // Set a custom template for the groups
//         correlativeTemplate: false, // Compile display keys, enables multiple key search from the template string
//         emptyTemplate: false,   // Display an empty template if no result
//         cancelButton: true,     // If text is detected in the input, a cancel button will be available to reset the input (pressing ESC also cancels)
//         loadingAnimation: true, // Display a loading animation when typeahead is doing request / searching for results
//         filter: true,           // Set to false or function to bypass Typeahead filtering. WARNING: accent, correlativeTemplate, offset & matcher will not be interpreted
//         matcher: null,          // Add an extra filtering function after the typeahead functions
//         source: null,           // Source of data for Typeahead to filter
//         callback: {
//             onInit: null,               // When Typeahead is first initialized (happens only once)
//             onReady: null,              // When the Typeahead initial preparation is completed
//             onShowLayout: null,         // Called when the layout is shown
//             onHideLayout: null,         // Called when the layout is hidden
//             onSearch: null,             // When data is being fetched & analyzed to give search results
//             onResult: null,             // When the result container is displayed
//             onLayoutBuiltBefore: null,  // When the result HTML is build, modify it before it get showed
//             onLayoutBuiltAfter: null,   // Modify the dom right after the results gets inserted in the result container
//             onNavigateBefore: null,     // When a key is pressed to navigate the results, before the navigation happens
//             onNavigateAfter: null,      // When a key is pressed to navigate the results
//             onMouseEnter: null,         // When the mouse enter an item in the result list
//             onMouseLeave: null,         // When the mouse leaves an item in the result list
//             onClickBefore: null,        // Possibility to e.preventDefault() to prevent the Typeahead behaviors
//             onClickAfter: null,         // Happens after the default clicked behaviors has been executed
//             onDropdownFilter: null,     // When the dropdownFilter is changed, trigger this callback
//             onSendRequest: null,        // Gets called when the Ajax request(s) are sent
//             onReceiveRequest: null,     // Gets called when the Ajax request(s) are all received
//             onPopulateSource: null,     // Perform operation on the source data before it gets in Typeahead data
//             onCacheSave: null,          // Perform operation on the source data before it gets in Typeahead cache
//             onSubmit: null,             // When Typeahead form is submitted
//             onCancel: null              // Triggered if the typeahead had text inside and is cleared
//         },
//         selector: {
//             container: "typeahead__container",
//             result: "typeahead__result",
//             list: "typeahead__list",
//             group: "typeahead__group",
//             item: "typeahead__item",
//             empty: "typeahead__empty",
//             display: "typeahead__display",
//             query: "typeahead__query",
//             filter: "typeahead__filter",
//             filterButton: "typeahead__filter-button",
//             dropdown: "typeahead__dropdown",
//             dropdownItem: "typeahead__dropdown-item",
//             button: "typeahead__button",
//             backdrop: "typeahead__backdrop",
//             hint: "typeahead__hint",
//             cancelButton: "typeahead__cancel-button"
//         },
//         debug: false                    // Display debug information (RECOMMENDED for dev environment)
//     };

//     /**
//      * @private
//      * Event namespace
//      */
//     var _namespace = ".typeahead";

//     /**
//      * @private
//      * Accent equivalents
//      */
//     var _accent = {
//         from: "ãàáäâẽèéëêìíïîõòóöôùúüûñç",
//         to: "aaaaaeeeeeiiiiooooouuuunc"
//     };

//     /**
//      * #62 IE9 doesn't trigger "input" event when text gets removed (backspace, ctrl+x, etc)
//      * @private
//      */
//     var _isIE9 = ~window.navigator.appVersion.indexOf("MSIE 9.");

//     /**
//      * #193 Clicking on a suggested option does not select it on IE10/11
//      * @private
//      */
//     var _isIE10 = ~window.navigator.appVersion.indexOf("MSIE 10");
//     var _isIE11 = ~window.navigator.userAgent.indexOf("Trident") && ~window.navigator.userAgent.indexOf("rv:11");

//     // SOURCE GROUP RESERVED WORDS: ajax, data, url
//     // SOURCE ITEMS RESERVED KEYS: group, display, data, matchedKey, compiled, href

//     /**
//      * @constructor
//      * Typeahead Class
//      *
//      * @param {object} node jQuery input object
//      * @param {object} options User defined options
//      */
//     var Typeahead = function (node, options) {

//         this.rawQuery = node.val() || '';   // Unmodified input query
//         this.query = node.val() || '';      // Input query
//         this.selector = node[0].selector;   // Typeahead instance selector (to reach from window.Typeahead[SELECTOR])
//         this.deferred = null;               // Promise when "input" event in triggered, this.node.triggerHandler('input').then(() => {})
//         this.tmpSource = {};                // Temp var to preserve the source order for the searchResult function
//         this.source = {};                   // The generated source kept in memory
//         this.dynamicGroups = [];            // Store the source groups that are defined as dynamic
//         this.hasDynamicGroups = false;      // Boolean if at least one of the groups has a dynamic source
//         this.generatedGroupCount = 0;       // Number of groups generated, if limit reached the search can be done
//         this.groupBy = "group";             // This option will change according to filtering or custom grouping
//         this.groups = [];                   // Array of all the available groups, used to build the groupTemplate
//         this.searchGroups = [];             // Array of groups to generate when Typeahead searches data
//         this.generateGroups = [];           // Array of groups to generate when Typeahead requests data
//         this.requestGroups = [];            // Array of groups to request via Ajax
//         this.result = {};                   // Results based on Source-query match (only contains the displayed elements)
//         this.groupTemplate = '';            // Result template at the {{group}} level
//         this.resultHtml = null;             // HTML Results (displayed elements)
//         this.resultCount = 0;               // Total results based on Source-query match
//         this.resultCountPerGroup = {};      // Total results based on Source-query match per group
//         this.options = options;             // Typeahead options (Merged default & user defined)
//         this.node = node;                   // jQuery object of the Typeahead <input>
//         this.namespace = '.' +              // Every Typeahead instance gets its own namespace for events
//             this.helper.slugify.call(this, this.selector) +
//             _namespace;                     // Every Typeahead instance gets its own namespace for events
//         this.container = null;              // Typeahead container, usually right after <form>
//         this.resultContainer = null;        // Typeahead result container (html)
//         this.item = null;                   // The selected item
//         this.xhr = {};                      // Ajax request(s) stack
//         this.hintIndex = null;              // Numeric value of the hint index in the result list
//         this.filters = {                    // Filter list for searching, dropdown and dynamic(s)
//             dropdown: {},                   // Dropdown menu if options.dropdownFilter is set
//             dynamic: {}                     // Checkbox / Radio / Select to filter the source data
//         };
//         this.dropdownFilter = {
//             static: [],                     // Objects that has a value
//             dynamic: []
//         };
//         this.dropdownFilterAll = null;      // The last "all" definition
//         this.isDropdownEvent = false;       // If a dropdownFilter is clicked, this will be true to trigger the callback

//         this.requests = {};                 // Store the group:request instead of generating them every time

//         this.backdrop = {};                 // The backdrop object
//         this.hint = {};                     // The hint object
//         this.hasDragged = false;            // Will cancel mouseend events if true
//         this.focusOnly = false;             // Focus the input preventing any operations

//         this.__construct();

//     };

//     Typeahead.prototype = {

//         _validateCacheMethod: function (cache) {

//             var supportedCache = ['localStorage', 'sessionStorage'],
//                 supported;

//             if (cache === true) {
//                 cache = 'localStorage';
//             } else if (typeof cache === "string" && !~supportedCache.indexOf(cache)) {
//                 // {debug}
//                 if (this.options.debug) {
//                     _debug.log({
//                         'node': this.selector,
//                         'function': 'extendOptions()',
//                         'message': 'Invalid options.cache, possible options are "localStorage" or "sessionStorage"'
//                     });

//                     _debug.print();
//                 }
//                 // {/debug}
//                 return false;
//             }

//             supported = typeof window[cache] !== "undefined";

//             try {
//                 window[cache].setItem("typeahead", "typeahead");
//                 window[cache].removeItem("typeahead");
//             } catch (e) {
//                 supported = false;
//             }

//             return supported && cache || false;

//         },

//         extendOptions: function () {

//             this.options.cache = this._validateCacheMethod(this.options.cache);

//             if (this.options.compression) {
//                 if (typeof LZString !== 'object' || !this.options.cache) {
//                     // {debug}
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'extendOptions()',
//                             'message': 'Missing LZString Library or options.cache, no compression will occur.'
//                         });

//                         _debug.print();
//                     }
//                     // {/debug}
//                     this.options.compression = false;
//                 }
//             }

//             if (!this.options.maxLength || isNaN(this.options.maxLength)) {
//                 this.options.maxLength = Infinity;
//             }

//             if (typeof this.options.maxItem !== "undefined" && ~[0, false].indexOf(this.options.maxItem)) {
//                 this.options.maxItem = Infinity;
//             }

//             if (this.options.maxItemPerGroup && !/^\d+$/.test(this.options.maxItemPerGroup)) {
//                 this.options.maxItemPerGroup = null;
//             }

//             if (this.options.display && !Array.isArray(this.options.display)) {
//                 this.options.display = [this.options.display];
//             }

//             if (this.options.group) {
//                 if (!Array.isArray(this.options.group)) {
//                     if (typeof this.options.group === "string") {
//                         this.options.group = {
//                             key: this.options.group
//                         };
//                     } else if (typeof this.options.group === "boolean") {
//                         this.options.group = {
//                             key: 'group'
//                         };
//                     }

//                     this.options.group.key = this.options.group.key || "group";
//                 }
//                 // {debug}
//                 else {
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'extendOptions()',
//                             'message': 'options.group must be a boolean|string|object as of 2.5.0'
//                         });

//                         _debug.print();
//                     }
//                 }
//                 // {/debug}
//             }

//             if (this.options.highlight && !~["any", true].indexOf(this.options.highlight)) {
//                 this.options.highlight = false;
//             }

//             if (this.options.dropdownFilter && this.options.dropdownFilter instanceof Object) {
//                 if (!Array.isArray(this.options.dropdownFilter)) {
//                     this.options.dropdownFilter = [this.options.dropdownFilter];
//                 }
//                 for (var i = 0, ii = this.options.dropdownFilter.length; i < ii; ++i) {
//                     this.dropdownFilter[this.options.dropdownFilter[i].value ? 'static' : 'dynamic'].push(this.options.dropdownFilter[i]);
//                 }
//             }

//             if (this.options.dynamicFilter && !Array.isArray(this.options.dynamicFilter)) {
//                 this.options.dynamicFilter = [this.options.dynamicFilter];
//             }

//             if (this.options.accent) {
//                 if (typeof this.options.accent === "object") {
//                     if (this.options.accent.from && this.options.accent.to && this.options.accent.from.length === this.options.accent.to.length) {

//                     }
//                     // {debug}
//                     else {
//                         if (this.options.debug) {
//                             _debug.log({
//                                 'node': this.selector,
//                                 'function': 'extendOptions()',
//                                 'message': 'Invalid "options.accent", from and to must be defined and same length.'
//                             });

//                             _debug.print();
//                         }
//                     }
//                     // {/debug}
//                 } else {
//                     this.options.accent = _accent;
//                 }
//             }

//             if (this.options.groupTemplate) {
//                 this.groupTemplate = this.options.groupTemplate;
//             }

//             if (this.options.resultContainer) {
//                 if (typeof this.options.resultContainer === "string") {
//                     this.options.resultContainer = $(this.options.resultContainer);
//                 }

//                 if (!(this.options.resultContainer instanceof $) || !this.options.resultContainer[0]) {
//                     // {debug}
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'extendOptions()',
//                             'message': 'Invalid jQuery selector or jQuery Object for "options.resultContainer".'
//                         });

//                         _debug.print();
//                     }
//                     // {/debug}
//                 } else {
//                     this.resultContainer = this.options.resultContainer;
//                 }
//             }

//             if (this.options.maxItemPerGroup && this.options.group && this.options.group.key) {
//                 this.groupBy = this.options.group.key;
//             }

//             // Compatibility onClick callback
//             if (this.options.callback && this.options.callback.onClick) {
//                 this.options.callback.onClickBefore = this.options.callback.onClick;
//                 delete this.options.callback.onClick;
//             }

//             // Compatibility onNavigate callback
//             if (this.options.callback && this.options.callback.onNavigate) {
//                 this.options.callback.onNavigateBefore = this.options.callback.onNavigate;
//                 delete this.options.callback.onNavigate;
//             }

//             this.options = $.extend(
//                 true,
//                 {},
//                 _options,
//                 this.options
//             );

//         },

//         unifySourceFormat: function () {
//             this.dynamicGroups = [];

//             // source: ['item1', 'item2', 'item3']
//             if (Array.isArray(this.options.source)) {
//                 this.options.source = {
//                     group: {
//                         data: this.options.source
//                     }
//                 };
//             }

//             // source: "http://www.test.com/url.json"
//             if (typeof this.options.source === "string") {
//                 this.options.source = {
//                     group: {
//                         ajax: {
//                             url: this.options.source
//                         }
//                     }
//                 };
//             }

//             if (this.options.source.ajax) {
//                 this.options.source = {
//                     group: {
//                         ajax: this.options.source.ajax
//                     }
//                 };
//             }

//             // source: {data: ['item1', 'item2'], url: "http://www.test.com/url.json"}
//             if (this.options.source.url || this.options.source.data) {
//                 this.options.source = {
//                     group: this.options.source
//                 };
//             }

//             var group,
//                 groupSource,
//                 tmpAjax;

//             for (group in this.options.source) {
//                 if (!this.options.source.hasOwnProperty(group)) continue;

//                 groupSource = this.options.source[group];

//                 // source: {group: "http://www.test.com/url.json"}
//                 if (typeof groupSource === "string") {
//                     groupSource = {
//                         ajax: {
//                             url: groupSource
//                         }
//                     };
//                 }

//                 // source: {group: {url: ["http://www.test.com/url.json", "json.path"]}}
//                 tmpAjax = groupSource.url || groupSource.ajax;
//                 if (Array.isArray(tmpAjax)) {
//                     groupSource.ajax = typeof tmpAjax[0] === "string" ? {
//                             url: tmpAjax[0]
//                         } : tmpAjax[0];
//                     groupSource.ajax.path = groupSource.ajax.path || tmpAjax[1] || null;
//                     delete groupSource.url;
//                 } else {
//                     // source: {group: {url: {url: "http://www.test.com/url.json", method: "GET"}}}
//                     // source: {group: {url: "http://www.test.com/url.json", dataType: "jsonp"}}
//                     if (typeof groupSource.url === "object") {
//                         groupSource.ajax = groupSource.url;
//                     } else if (typeof groupSource.url === "string") {
//                         groupSource.ajax = {
//                             url: groupSource.url
//                         };
//                     }
//                     delete groupSource.url;
//                 }

//                 if (!groupSource.data && !groupSource.ajax) {

//                     // {debug}
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'unifySourceFormat()',
//                             'arguments': JSON.stringify(this.options.source),
//                             'message': 'Undefined "options.source.' + group + '.[data|ajax]" is Missing - Typeahead dropped'
//                         });

//                         _debug.print();
//                     }
//                     // {/debug}

//                     return false;
//                 }

//                 if (groupSource.display && !Array.isArray(groupSource.display)) {
//                     groupSource.display = [groupSource.display];
//                 }

//                 groupSource.minLength = typeof groupSource.minLength === "number" ?
//                     groupSource.minLength :
//                     this.options.minLength;
//                 groupSource.maxLength = typeof groupSource.maxLength === "number" ?
//                     groupSource.maxLength :
//                     this.options.maxLength;
//                 groupSource.dynamic = typeof groupSource.dynamic === "boolean" || this.options.dynamic;

//                 if (groupSource.minLength > groupSource.maxLength) {
//                     groupSource.minLength = groupSource.maxLength;
//                 }
//                 this.options.source[group] = groupSource;

//                 if (this.options.source[group].dynamic) {
//                     this.dynamicGroups.push(group);
//                 }

//                 groupSource.cache = typeof groupSource.cache !== "undefined" ?
//                     this._validateCacheMethod(groupSource.cache) :
//                     this.options.cache;

//                 if (groupSource.compression) {
//                     if (typeof LZString !== 'object' || !groupSource.cache) {
//                         // {debug}
//                         if (this.options.debug) {
//                             _debug.log({
//                                 'node': this.selector,
//                                 'function': 'unifySourceFormat()',
//                                 'message': 'Missing LZString Library or group.cache, no compression will occur on group: ' + group
//                             });

//                             _debug.print();
//                         }
//                         // {/debug}
//                         groupSource.compression = false;
//                     }
//                 }
//             }

//             this.hasDynamicGroups = this.options.dynamic || !!this.dynamicGroups.length;

//             return true;
//         },

//         init: function () {

//             this.helper.executeCallback.call(this, this.options.callback.onInit, [this.node]);

//             this.container = this.node.closest('.' + this.options.selector.container);

//             // {debug}
//             if (this.options.debug) {
//                 _debug.log({
//                     'node': this.selector,
//                     'function': 'init()',
//                     //'arguments': JSON.stringify(this.options),
//                     'message': 'OK - Typeahead activated on ' + this.selector
//                 });

//                 _debug.print();
//             }
//             // {/debug}

//         },

//         delegateEvents: function () {

//             var scope = this,
//                 events = [
//                     'focus' + this.namespace,
//                     'input' + this.namespace,
//                     'propertychange' + this.namespace,  // IE8 Fix
//                     'keydown' + this.namespace,
//                     'keyup' + this.namespace,           // IE9 Fix
//                     'search' + this.namespace,
//                     'generate' + this.namespace
//                 ];

//             // #149 - Adding support for Mobiles
//             $('html').on("touchmove", function () {
//                 scope.hasDragged = true;
//             }).on("touchstart", function () {
//                 scope.hasDragged = false;
//             });

//             this.node.closest('form').on("submit", function (e) {
//                 if (scope.options.mustSelectItem && scope.helper.isEmpty(scope.item)) {
//                     e.preventDefault();
//                     return;
//                 }

//                 if (!scope.options.backdropOnFocus) {
//                     scope.hideLayout();
//                 }

//                 if (scope.options.callback.onSubmit) {
//                     return scope.helper.executeCallback.call(scope, scope.options.callback.onSubmit, [scope.node, this, scope.item, e]);
//                 }
//             }).on("reset", function () {
//                 // #221 - Reset Typeahead on form reset.
//                 // setTimeout to re-queue the `input.typeahead` event at the end
//                 setTimeout(function () {
//                     scope.node.trigger('input' + scope.namespace);
//                     // #243 - minLength: 0 opens the Typeahead results
//                     scope.hideLayout();
//                 });
//             });

//             // IE8 fix
//             var preventNextEvent = false;

//             // IE10/11 fix
//             if (this.node.attr('placeholder') && (_isIE10 || _isIE11)) {
//                 var preventInputEvent = true;

//                 this.node.on("focusin focusout", function () {
//                     preventInputEvent = !!(!this.value && this.placeholder);
//                 });

//                 this.node.on("input", function (e) {
//                     if (preventInputEvent) {
//                         e.stopImmediatePropagation();
//                         preventInputEvent = false;
//                     }
//                 });
//             }

//             this.node.off(this.namespace).on(events.join(' '), function (e, originalEvent) {
//                 switch (e.type) {
//                     case "generate":
//                         scope.generateSource(Object.keys(scope.options.source));
//                         break;
//                     case "focus":
//                         if (scope.focusOnly) {
//                             scope.focusOnly = false;
//                             break;
//                         }
//                         if (scope.options.backdropOnFocus) {
//                             scope.buildBackdropLayout();
//                             scope.showLayout();
//                         }
//                         if (scope.options.searchOnFocus) {
//                             scope.deferred = $.Deferred();
//                             scope.generateSource();
//                         }
//                         break;
//                     case "keydown":
//                         if (e.keyCode && ~[9, 13, 27, 38, 39, 40].indexOf(e.keyCode)) {
//                             preventNextEvent = true;
//                             scope.navigate(e);
//                         }
//                         break;
//                     case "keyup":
//                         if (_isIE9 && scope.node[0].value.replace(/^\s+/, '').toString().length < scope.query.length) {
//                             scope.node.trigger('input' + scope.namespace);
//                         }
//                         break;
//                     case "propertychange":
//                         if (preventNextEvent) {
//                             preventNextEvent = false;
//                             break;
//                         }
//                     case "input":
//                         scope.deferred = $.Deferred();
//                         scope.rawQuery = scope.node[0].value.toString();
//                         scope.query = scope.rawQuery.replace(/^\s+/, '');

//                         // #195 Trigger an onCancel event if the Typeahead is cleared
//                         if (scope.rawQuery === "" && scope.query === "") {
//                             e.originalEvent = originalEvent || {};
//                             scope.helper.executeCallback.call(scope, scope.options.callback.onCancel, [scope.node, e]);
//                         }

//                         scope.options.cancelButton && scope.toggleCancelButtonVisibility();

//                         if (scope.options.hint && scope.hint.container && scope.hint.container.val() !== '') {
//                             if (scope.hint.container.val().indexOf(scope.rawQuery) !== 0) {
//                                 scope.hint.container.val('');
//                             }
//                         }

//                         if (scope.hasDynamicGroups) {
//                             scope.helper.typeWatch(function () {
//                                 scope.generateSource();
//                             }, scope.options.delay);
//                         } else {
//                             scope.generateSource();
//                         }
//                         break;
//                     case "search":
//                         scope.searchResult();
//                         scope.buildLayout();

//                         if (scope.result.length || (scope.searchGroups.length && scope.options.emptyTemplate && scope.query.length)) {
//                             scope.showLayout();
//                         } else {
//                             scope.hideLayout();
//                         }

//                         //@TODO fix onDropdownFilter + tests

//                         scope.deferred && scope.deferred.resolve();
//                         break;
//                 }

//                 return scope.deferred && scope.deferred.promise();
//             });

//             if (this.options.generateOnLoad) {
//                 this.node.trigger('generate' + this.namespace);
//             }

//         },

//         filterGenerateSource: function () {
//             this.searchGroups = [];
//             this.generateGroups = [];

//             for (var group in this.options.source) {
//                 if (!this.options.source.hasOwnProperty(group)) continue;
//                 if (this.query.length >= this.options.source[group].minLength &&
//                     this.query.length <= this.options.source[group].maxLength) {

//                     this.searchGroups.push(group);
//                     if (!this.options.source[group].dynamic && this.source[group]) {
//                         continue;
//                     }
//                     this.generateGroups.push(group);
//                 }
//             }
//         },

//         generateSource: function (generateGroups) {
//             this.filterGenerateSource();
//             if (Array.isArray(generateGroups) && generateGroups.length) {
//                 this.generateGroups = generateGroups;
//             } else if (!this.generateGroups.length) {
//                 this.node.trigger('search' + this.namespace);
//                 return;
//             }

//             this.requestGroups = [];
//             this.generatedGroupCount = 0;
//             this.options.loadingAnimation && this.container.addClass('loading');

//             if (!this.helper.isEmpty(this.xhr)) {
//                 for (var i in this.xhr) {
//                     if (!this.xhr.hasOwnProperty(i)) continue;
//                     this.xhr[i].abort();
//                 }
//                 this.xhr = {};
//             }

//             var scope = this,
//                 group,
//                 groupData,
//                 groupSource,
//                 cache,
//                 compression,
//                 dataInStorage,
//                 isValidStorage;

//             for (var i = 0, ii = this.generateGroups.length; i < ii; ++i) {
//                 group = this.generateGroups[i];
//                 groupSource = this.options.source[group];
//                 cache = groupSource.cache;
//                 compression = groupSource.compression;

//                 if (cache) {
//                     dataInStorage = window[cache].getItem('TYPEAHEAD_' + this.selector + ":" + group);
//                     if (dataInStorage) {
//                         if (compression) {
//                             dataInStorage = LZString.decompressFromUTF16(dataInStorage);
//                         }

//                         isValidStorage = false;
//                         try {
//                             dataInStorage = JSON.parse(dataInStorage + "");

//                             if (dataInStorage.data && dataInStorage.ttl > new Date().getTime()) {

//                                 this.populateSource(dataInStorage.data, group);
//                                 isValidStorage = true;

//                                 // {debug}
//                                 if (this.options.debug) {
//                                     _debug.log({
//                                         'node': this.selector,
//                                         'function': 'generateSource()',
//                                         'message': 'Source for group "' + group + '" found in ' + cache
//                                     });
//                                     _debug.print();
//                                 }
//                                 // {/debug}

//                             } else {
//                                 window[cache].removeItem('TYPEAHEAD_' + this.selector + ":" + group);
//                             }
//                         } catch (error) {
//                         }

//                         if (isValidStorage) continue;
//                     }
//                 }

//                 if (groupSource.data && !groupSource.ajax) {
//                     // #198 Add support for async data source
//                     if (typeof groupSource.data === "function") {
//                         groupData = groupSource.data.call(this);
//                         if (Array.isArray(groupData)) {
//                             scope.populateSource(groupData, group);
//                         } else if (typeof groupData.promise === "function") {
//                             (function (group) {
//                                 $.when(groupData).then(function (deferredData) {
//                                     if (deferredData && Array.isArray(deferredData)) {
//                                         scope.populateSource(deferredData, group);
//                                     }
//                                 });
//                             })(group);
//                         }
//                     } else {
//                         this.populateSource(
//                             $.extend(true, [], groupSource.data),
//                             group
//                         );
//                     }
//                     continue;
//                 }

//                 if (groupSource.ajax) {
//                     if (!this.requests[group]) {
//                         this.requests[group] = this.generateRequestObject(group);
//                     }
//                     this.requestGroups.push(group);
//                 }
//             }

//             if (this.requestGroups.length) {
//                 this.handleRequests();
//             }

//             return !!this.generateGroups.length;
//         },

//         generateRequestObject: function (group) {

//             var scope = this,
//                 groupSource = this.options.source[group];

//             var xhrObject = {
//                 request: {
//                     url: groupSource.ajax.url || null,
//                     dataType: 'json',
//                     beforeSend: function (jqXHR, options) {
//                         // Important to call .abort() in case of dynamic requests
//                         scope.xhr[group] = jqXHR;

//                         var beforeSend = scope.requests[group].callback.beforeSend || groupSource.ajax.beforeSend;
//                         typeof beforeSend === "function" && beforeSend.apply(null, arguments);
//                     }
//                 },
//                 callback: {
//                     beforeSend: null,
//                     done: null,
//                     fail: null,
//                     then: null,
//                     always: null
//                 },
//                 extra: {
//                     path: groupSource.ajax.path || null,
//                     group: group
//                 },
//                 validForGroup: [group]
//             };

//             if (typeof groupSource.ajax !== "function") {
//                 if (groupSource.ajax instanceof Object) {
//                     xhrObject = this.extendXhrObject(xhrObject, groupSource.ajax);
//                 }

//                 if (Object.keys(this.options.source).length > 1) {
//                     for (var _group in this.requests) {
//                         if (!this.requests.hasOwnProperty(_group)) continue;
//                         if (this.requests[_group].isDuplicated) continue;

//                         if (xhrObject.request.url && xhrObject.request.url === this.requests[_group].request.url) {
//                             this.requests[_group].validForGroup.push(group);
//                             xhrObject.isDuplicated = true;
//                             delete xhrObject.validForGroup;
//                         }
//                     }
//                 }
//             }

//             return xhrObject;
//         },

//         extendXhrObject: function (xhrObject, groupRequest) {

//             if (typeof groupRequest.callback === "object") {
//                 xhrObject.callback = groupRequest.callback;
//                 delete groupRequest.callback;
//             }

//             // #132 Fixed beforeSend when using a function as the request object
//             if (typeof groupRequest.beforeSend === "function") {
//                 xhrObject.callback.beforeSend = groupRequest.beforeSend;
//                 delete groupRequest.beforeSend;
//             }

//             // Fixes #105 Allow user to define their beforeSend function.
//             // Fixes #181 IE8 incompatibility
//             xhrObject.request = $.extend(
//                 true,
//                 xhrObject.request,
//                 groupRequest
//             );

//             // JSONP needs a unique jsonpCallback to run concurrently
//             if (xhrObject.request.dataType.toLowerCase() === 'jsonp' && !xhrObject.request.jsonpCallback) {
//                 xhrObject.request.jsonpCallback = 'callback_' + xhrObject.extra.group;
//             }

//             return xhrObject;
//         },

//         handleRequests: function () {
//             var scope = this,
//                 group,
//                 requestsCount = this.requestGroups.length;

//             if (this.helper.executeCallback.call(this, this.options.callback.onSendRequest, [this.node, this.query]) === false) {
//                 return;
//             }

//             for (var i = 0, ii = this.requestGroups.length; i < ii; ++i) {
//                 group = this.requestGroups[i];
//                 if (this.requests[group].isDuplicated) continue;

//                 (function (group, xhrObject) {
//                     if (typeof scope.options.source[group].ajax === "function") {

//                         var _groupRequest = scope.options.source[group].ajax.call(scope, scope.query);

//                         // Fixes #271 Data is cached inside the xhrObject
//                         xhrObject = scope.extendXhrObject(
//                             scope.generateRequestObject(group),
//                             (typeof _groupRequest === "object") ? _groupRequest : {}
//                         );

//                         if (typeof xhrObject.request !== "object" || !xhrObject.request.url) {
//                             // {debug}
//                             if (scope.options.debug) {
//                                 _debug.log({
//                                     'node': scope.selector,
//                                     'function': 'handleRequests',
//                                     'message': 'Source function must return an object containing ".url" key for group "' + group + '"'
//                                 });
//                                 _debug.print();
//                             }
//                             // {/debug}
//                             scope.populateSource([], group);
//                             return;
//                         }
//                         scope.requests[group] = xhrObject;
//                     }

//                     var _request,
//                         _isExtended = false, // Prevent the main request from being changed
//                         _data; // New data array in case it is modified inside callback.done

//                     if (~xhrObject.request.url.indexOf('{{query}}')) {
//                         if (!_isExtended) {
//                             xhrObject = $.extend(true, {}, xhrObject);
//                             _isExtended = true;
//                         }
//                         // #184 Invalid encoded characters on dynamic requests for `{{query}}`
//                         xhrObject.request.url = xhrObject.request.url.replace('{{query}}', encodeURIComponent(scope.query));
//                     }

//                     if (xhrObject.request.data) {
//                         for (var i in xhrObject.request.data) {
//                             if (!xhrObject.request.data.hasOwnProperty(i)) continue;
//                             if (~String(xhrObject.request.data[i]).indexOf('{{query}}')) {
//                                 if (!_isExtended) {
//                                     xhrObject = $.extend(true, {}, xhrObject);
//                                     _isExtended = true;
//                                 }
//                                 // jQuery handles encodeURIComponent when the query is inside the data object
//                                 xhrObject.request.data[i] = xhrObject.request.data[i].replace('{{query}}', scope.query);
//                                 break;
//                             }
//                         }
//                     }

//                     $.ajax(xhrObject.request).done(function (data, textStatus, jqXHR) {
//                         _data = null;

//                         for (var i = 0, ii = xhrObject.validForGroup.length; i < ii; i++) {

//                             _request = scope.requests[xhrObject.validForGroup[i]];

//                             if (_request.callback.done instanceof Function) {
//                                 _data = _request.callback.done.call(scope, data, textStatus, jqXHR);

//                                 // {debug}
//                                 if (!Array.isArray(_data) || typeof _data !== "object") {
//                                     if (scope.options.debug) {
//                                         _debug.log({
//                                             'node': scope.selector,
//                                             'function': 'Ajax.callback.done()',
//                                             'message': 'Invalid returned data has to be an Array'
//                                         });
//                                         _debug.print();
//                                     }
//                                 }
//                                 // {/debug}
//                             }
//                         }

//                     }).fail(function (jqXHR, textStatus, errorThrown) {

//                         for (var i = 0, ii = xhrObject.validForGroup.length; i < ii; i++) {
//                             _request = scope.requests[xhrObject.validForGroup[i]];
//                             _request.callback.fail instanceof Function && _request.callback.fail.call(scope, jqXHR, textStatus, errorThrown);
//                         }

//                         // {debug}
//                         if (scope.options.debug) {
//                             _debug.log({
//                                 'node': scope.selector,
//                                 'function': 'Ajax.callback.fail()',
//                                 'arguments': JSON.stringify(xhrObject.request),
//                                 'message': textStatus
//                             });

//                             console.log(errorThrown);

//                             _debug.print();
//                         }
//                         // {/debug}

//                     }).always(function (data, textStatus, jqXHR) {

//                         for (var i = 0, ii = xhrObject.validForGroup.length; i < ii; i++) {
//                             _request = scope.requests[xhrObject.validForGroup[i]];
//                             _request.callback.always instanceof Function && _request.callback.always.call(scope, data, textStatus, jqXHR);

//                             // #248, #303 Aborted requests would call populate with invalid data
//                             if (typeof jqXHR !== "object") return;

//                             // #265 Modified data from ajax.callback.done is not being registred (use of _data)
//                             scope.populateSource(
//                                 typeof data.promise === "function" && [] || _data || data,
//                                 _request.extra.group,
//                                 _request.extra.path || _request.request.path
//                             );

//                             requestsCount -= 1;
//                             if (requestsCount === 0) {
//                                 scope.helper.executeCallback.call(scope, scope.options.callback.onReceiveRequest, [scope.node, scope.query]);
//                             }

//                         }

//                     }).then(function (jqXHR, textStatus) {

//                         for (var i = 0, ii = xhrObject.validForGroup.length; i < ii; i++) {
//                             _request = scope.requests[xhrObject.validForGroup[i]];
//                             _request.callback.then instanceof Function && _request.callback.then.call(scope, jqXHR, textStatus);
//                         }

//                     });

//                 }(group, this.requests[group]));

//             }

//         },

//         /**
//          * Build the source groups to be cycled for matched results
//          *
//          * @param {Array} data Array of Strings or Array of Objects
//          * @param {String} group
//          * @param {String} [path]
//          * @return {*}
//          */
//         populateSource: function (data, group, path) {
//             var scope = this,
//                 groupSource = this.options.source[group],
//                 extraData = groupSource.ajax && groupSource.data;

//             if (path && typeof path === "string") {
//                 data = this.helper.namespace.call(this, path, data);
//             }

//             if (typeof data === 'undefined') {
//                 // {debug}
//                 if (this.options.debug) {
//                     _debug.log({
//                         'node': this.selector,
//                         'function': 'populateSource()',
//                         'arguments': path,
//                         'message': 'Invalid data path.'
//                     });

//                     _debug.print();
//                 }
//                 // {/debug}
//             }

//             if (!Array.isArray(data)) {
//                 // {debug}
//                 if (this.options.debug) {
//                     _debug.log({
//                         'node': this.selector,
//                         'function': 'populateSource()',
//                         'arguments': JSON.stringify({group: group}),
//                         'message': 'Invalid data type, must be Array type.'
//                     });
//                     _debug.print();
//                 }
//                 // {/debug}
//                 data = [];
//             }

//             if (extraData) {
//                 if (typeof extraData === "function") {
//                     extraData = extraData();
//                 }

//                 if (Array.isArray(extraData)) {
//                     data = data.concat(extraData);
//                 }
//                 // {debug}
//                 else {
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'populateSource()',
//                             'arguments': JSON.stringify(extraData),
//                             'message': 'WARNING - this.options.source.' + group + '.data Must be an Array or a function that returns an Array.'
//                         });

//                         _debug.print();
//                     }
//                 }
//                 // {/debug}
//             }

//             var tmpObj,
//                 display = groupSource.display ?
//                     (groupSource.display[0] === 'compiled' ? groupSource.display[1] : groupSource.display[0]) :
//                     (this.options.display[0] === 'compiled' ? this.options.display[1] : this.options.display[0]);

//             for (var i = 0, ii = data.length; i < ii; i++) {
//                 if (data[i] === null || typeof data[i] === "boolean") {
//                     // {debug}
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'populateSource()',
//                             'message': 'WARNING - NULL/BOOLEAN value inside ' + group + '! The data was skipped.'
//                         });

//                         _debug.print();
//                     }
//                     // {/debug}
//                     continue;
//                 }
//                 if (typeof data[i] === "string") {
//                     tmpObj = {};
//                     tmpObj[display] = data[i];
//                     data[i] = tmpObj;
//                 }
//                 data[i].group = group;
//             }

//             if (!this.hasDynamicGroups && this.dropdownFilter.dynamic.length) {

//                 var key,
//                     value,
//                     tmpValues = {};

//                 for (var i = 0, ii = data.length; i < ii; i++) {
//                     for (var k = 0, kk = this.dropdownFilter.dynamic.length; k < kk; k++) {
//                         key = this.dropdownFilter.dynamic[k].key;

//                         value = data[i][key];
//                         if (!value) continue;
//                         if (!this.dropdownFilter.dynamic[k].value) {
//                             this.dropdownFilter.dynamic[k].value = [];
//                         }
//                         if (!tmpValues[key]) {
//                             tmpValues[key] = [];
//                         }
//                         if (!~tmpValues[key].indexOf(value.toLowerCase())) {
//                             tmpValues[key].push(value.toLowerCase());
//                             this.dropdownFilter.dynamic[k].value.push(value);
//                         }
//                     }
//                 }
//             }

//             if (this.options.correlativeTemplate) {

//                 var template = groupSource.template || this.options.template,
//                     compiledTemplate = "";

//                 if (typeof template === "function") {
//                     template = template.call(this, '', {});
//                 }

//                 if (!template) {
//                     // {debug}
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'populateSource()',
//                             'arguments': String(group),
//                             'message': 'WARNING - this.options.correlativeTemplate is enabled but no template was found.'
//                         });

//                         _debug.print();
//                     }
//                     // {/debug}
//                 } else {

//                     // #109 correlativeTemplate can be an array of display keys instead of the complete template
//                     if (Array.isArray(this.options.correlativeTemplate)) {
//                         for (var i = 0, ii = this.options.correlativeTemplate.length; i < ii; i++) {
//                             compiledTemplate += "{{" + this.options.correlativeTemplate[i] + "}} ";
//                         }
//                     } else {
//                         compiledTemplate = template
//                             .replace(/<.+?>/g, '');
//                     }

//                     for (var i = 0, ii = data.length; i < ii; i++) {
//                         data[i].compiled = compiledTemplate.replace(/\{\{([\w\-\.]+)(?:\|(\w+))?}}/g, function (match, index) {
//                                 return scope.helper.namespace.call(scope, index, data[i], 'get', '');
//                             }
//                         ).trim();
//                     }

//                     if (groupSource.display) {
//                         if (!~groupSource.display.indexOf('compiled')) {
//                             groupSource.display.unshift('compiled');
//                         }
//                     } else if (!~this.options.display.indexOf('compiled')) {
//                         this.options.display.unshift('compiled');
//                     }

//                 }
//             }

//             if (this.options.callback.onPopulateSource) {
//                 data = this.helper.executeCallback.call(this, this.options.callback.onPopulateSource, [this.node, data, group, path]);

//                 // {debug}
//                 if (this.options.debug) {
//                     if (!data || !Array.isArray(data)) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'callback.populateSource()',
//                             'message': 'callback.onPopulateSource must return the "data" parameter'
//                         });

//                         _debug.print();
//                     }
//                 }
//                 // {/debug}
//             }

//             // Save the data inside tmpSource to re-order once every requests are completed
//             this.tmpSource[group] = Array.isArray(data) && data || [];

//             var cache = this.options.source[group].cache,
//                 compression = this.options.source[group].compression,
//                 ttl = this.options.source[group].ttl || this.options.ttl;

//             if (cache && !window[cache].getItem('TYPEAHEAD_' + this.selector + ":" + group)) {

//                 if (this.options.callback.onCacheSave) {
//                     data = this.helper.executeCallback.call(this, this.options.callback.onCacheSave, [this.node, data, group, path]);

//                     // {debug}
//                     if (this.options.debug) {
//                         if (!data || !Array.isArray(data)) {
//                             _debug.log({
//                                 'node': this.selector,
//                                 'function': 'callback.populateSource()',
//                                 'message': 'callback.onCacheSave must return the "data" parameter'
//                             });

//                             _debug.print();
//                         }
//                     }
//                     // {/debug}
//                 }

//                 var storage = JSON.stringify({
//                     data: data,
//                     ttl: new Date().getTime() + ttl
//                 });

//                 if (compression) {
//                     storage = LZString.compressToUTF16(storage);
//                 }

//                 window[cache].setItem(
//                     'TYPEAHEAD_' + this.selector + ":" + group,
//                     storage
//                 );
//             }

//             this.incrementGeneratedGroup();
//         },

//         incrementGeneratedGroup: function () {

//             this.generatedGroupCount++;
//             if (this.generatedGroupCount !== this.generateGroups.length) {
//                 return;
//             }

//             this.xhr = {};

//             for (var i = 0, ii = this.generateGroups.length; i < ii; i++) {
//                 this.source[this.generateGroups[i]] = this.tmpSource[this.generateGroups[i]];
//             }

//             if (!this.hasDynamicGroups) {
//                 this.buildDropdownItemLayout('dynamic');
//             }

//             this.options.loadingAnimation && this.container.removeClass('loading');

//             this.node.trigger('search' + this.namespace);
//         },

//         /**
//          * Key Navigation
//          * tab 9: if option is enabled, blur Typeahead
//          * Up 38: select previous item, skip "group" item
//          * Down 40: select next item, skip "group" item
//          * Right 39: change charAt, if last char fill hint (if options is true)
//          * Esc 27: clears input (is not empty) / blur (if empty)
//          * Enter 13: Select item + submit search
//          *
//          * @param {Object} e Event object
//          * @returns {*}
//          */
//         navigate: function (e) {

//             this.helper.executeCallback.call(this, this.options.callback.onNavigateBefore, [this.node, this.query, e]);

//             if (e.keyCode === 27) {
//                 // #166 Different browsers do not have the same behaviors by default, lets enforce what we want instead
//                 e.preventDefault();
//                 if (this.query.length) {
//                     this.resetInput();
//                     this.node.trigger('input' + this.namespace, [e]);
//                 } else {
//                     this.node.blur();
//                     this.hideLayout();
//                 }
//                 return;
//             }

//             // #284 Blur Typeahead when "Tab" key is pressed
//             if (this.options.blurOnTab && e.keyCode === 9) {
//                 this.node.blur();
//                 this.hideLayout();
//                 return;
//             }

//             if (!this.result.length) return;

//             var itemList = this.resultContainer.find('.' + this.options.selector.item),
//                 activeItem = itemList.filter('.active'),
//                 activeItemIndex = activeItem[0] && itemList.index(activeItem) || null,
//                 newActiveItemIndex = null;

//             if (e.keyCode === 13) {
//                 if (activeItem.length > 0) {
//                     // Prevent form submit if an element is selected
//                     e.preventDefault();
//                     activeItem.find('a:first').trigger('click', e);
//                 }
//                 return;
//             }

//             if (e.keyCode === 39) {
//                 if (activeItemIndex) {
//                     itemList.eq(activeItemIndex).find('a:first')[0].click();
//                 } else if (this.options.hint &&
//                     this.hint.container.val() !== "" &&
//                     this.helper.getCaret(this.node[0]) >= this.query.length) {

//                     itemList.find('a[data-index="' + this.hintIndex + '"]')[0].click();

//                 }
//                 return;
//             }

//             if (itemList.length > 0) {
//                 activeItem.removeClass('active');
//             }

//             if (e.keyCode === 38) {

//                 e.preventDefault();

//                 if (activeItem.length > 0) {
//                     if (activeItemIndex - 1 >= 0) {
//                         newActiveItemIndex = activeItemIndex - 1;
//                         itemList.eq(newActiveItemIndex).addClass('active');
//                     }
//                 } else {
//                     newActiveItemIndex = itemList.length - 1;
//                     itemList.last().addClass('active');
//                 }

//             } else if (e.keyCode === 40) {

//                 e.preventDefault();

//                 if (activeItem.length > 0) {
//                     if (activeItemIndex + 1 < itemList.length) {
//                         newActiveItemIndex = activeItemIndex + 1;
//                         itemList.eq(newActiveItemIndex).addClass('active');
//                     }
//                 } else {
//                     newActiveItemIndex = 0;
//                     itemList.first().addClass('active');
//                 }
//             }

//             // #115 Prevent the input from changing when navigating (arrow up / down) the results
//             if (e.preventInputChange && ~[38, 40].indexOf(e.keyCode)) {
//                 this.buildHintLayout(
//                     newActiveItemIndex !== null && newActiveItemIndex < this.result.length ?
//                         [this.result[newActiveItemIndex]] :
//                         null
//                 );
//             }

//             if (this.options.hint && this.hint.container) {
//                 this.hint.container.css(
//                     'color',
//                     e.preventInputChange ?
//                         this.hint.css.color :
//                         newActiveItemIndex === null && this.hint.css.color || this.hint.container.css('background-color') || 'fff'
//                 );
//             }

//             this.node.val(
//                 newActiveItemIndex !== null && !e.preventInputChange ?
//                     this.result[newActiveItemIndex][this.result[newActiveItemIndex].matchedKey] :
//                     this.rawQuery
//             );

//             this.helper.executeCallback.call(this, this.options.callback.onNavigateAfter, [
//                 this.node,
//                 itemList,
//                 newActiveItemIndex !== null && itemList.eq(newActiveItemIndex).find('a:first') || undefined,
//                 newActiveItemIndex !== null && this.result[newActiveItemIndex] || undefined,
//                 this.query,
//                 e
//             ]);

//         },

//         searchResult: function (preserveItem) {

//             // #54 In case the item is being clicked, preserve it for onSubmit callback
//             if (!preserveItem) {
//                 this.item = {};
//             }

//             this.resetLayout();

//             if (this.helper.executeCallback.call(this, this.options.callback.onSearch, [this.node, this.query]) === false) return;

//             if (this.searchGroups.length) {
//                 this.searchResultData();
//             }

//             this.helper.executeCallback.call(this, this.options.callback.onResult, [this.node, this.query, this.result, this.resultCount, this.resultCountPerGroup]);

//             if (this.isDropdownEvent) {
//                 this.helper.executeCallback.call(this, this.options.callback.onDropdownFilter, [this.node, this.query, this.filters.dropdown, this.result]);
//                 this.isDropdownEvent = false;
//             }
//         },

//         searchResultData: function () {

//             var scope = this,
//                 group,
//                 groupBy = this.groupBy,
//                 groupReference = null,
//                 item,
//                 match,
//                 comparedDisplay,
//                 comparedQuery = this.query.toLowerCase(),
//                 maxItem = this.options.maxItem,
//                 maxItemPerGroup = this.options.maxItemPerGroup,
//                 hasDynamicFilters = this.filters.dynamic && !this.helper.isEmpty(this.filters.dynamic),
//                 displayKeys,
//                 displayValue,
//                 missingDisplayKey = {},
//                 groupFilter,
//                 groupFilterResult,
//                 groupMatcher,
//                 groupMatcherResult,
//                 matcher = typeof this.options.matcher === "function" && this.options.matcher,
//                 correlativeMatch,
//                 correlativeQuery,
//                 correlativeDisplay;

//             if (this.options.accent) {
//                 comparedQuery = this.helper.removeAccent.call(this, comparedQuery);
//             }

//             for (var i = 0, ii = this.searchGroups.length; i < ii; ++i) {
//                 group = this.searchGroups[i];

//                 if (this.filters.dropdown && this.filters.dropdown.key === "group" && this.filters.dropdown.value !== group) continue;

//                 groupFilter = typeof this.options.source[group].filter !== "undefined" ? this.options.source[group].filter : this.options.filter;
//                 groupMatcher = typeof this.options.source[group].matcher === "function" && this.options.source[group].matcher || matcher;

//                 for (var k = 0, kk = this.source[group].length; k < kk; k++) {
//                     if (this.resultItemCount >= maxItem && !this.options.callback.onResult) break;
//                     if (hasDynamicFilters && !this.dynamicFilter.validate.apply(this, [this.source[group][k]])) continue;

//                     item = this.source[group][k];
//                     // Validation over null item
//                     if (item === null || typeof item === "boolean") continue;

//                     // dropdownFilter by custom groups
//                     if (this.filters.dropdown && (item[this.filters.dropdown.key] || "").toLowerCase() !== (this.filters.dropdown.value || "").toLowerCase()) continue;

//                     groupReference = groupBy === "group" ? group : item[groupBy] ? item[groupBy] : item.group;

//                     if (groupReference && !this.result[groupReference]) {
//                         this.result[groupReference] = [];
//                         this.resultCountPerGroup[groupReference] = 0;
//                     }

//                     if (maxItemPerGroup) {
//                         if (groupBy === "group" && this.result[groupReference].length >= maxItemPerGroup && !this.options.callback.onResult) {
//                             break;
//                         }
//                     }

//                     displayKeys = this.options.source[group].display || this.options.display;
//                     for (var v = 0, vv = displayKeys.length; v < vv; ++v) {

//                         // #286 option.filter: false shouldn't bother about the option.display keys
//                         if (groupFilter !== false) {
//                             // #183 Allow searching for deep source object keys
//                             displayValue = /\./.test(displayKeys[v]) ?
//                                 this.helper.namespace.call(this, displayKeys[v], item) :
//                                 item[displayKeys[v]];

//                             // #182 Continue looping if empty or undefined key
//                             if (typeof displayValue === 'undefined' || displayValue === '') {
//                                 // {debug}
//                                 if (this.options.debug) {
//                                     missingDisplayKey[v] = {
//                                         display: displayKeys[v],
//                                         data: item
//                                     };
//                                 }
//                                 // {/debug}
//                                 continue;
//                             }

//                             displayValue = this.helper.cleanStringFromScript(displayValue);
//                         }

//                         if (typeof groupFilter === "function") {
//                             groupFilterResult = groupFilter.call(this, item, displayValue);

//                             // return undefined to skip to next item
//                             // return false to attempt the matching function on the next displayKey
//                             // return true to add the item to the result list
//                             // return item object to modify the item and add it to the result list

//                             if (groupFilterResult === undefined) break;
//                             if (!groupFilterResult) continue;
//                             if (typeof groupFilterResult === "object") {
//                                 item = groupFilterResult;
//                             }
//                         }

//                         if (~[undefined, true].indexOf(groupFilter)) {
//                             comparedDisplay = displayValue;
//                             comparedDisplay = comparedDisplay.toString().toLowerCase();

//                             if (this.options.accent) {
//                                 comparedDisplay = this.helper.removeAccent.call(this, comparedDisplay);
//                             }

//                             match = comparedDisplay.indexOf(comparedQuery);

//                             if (this.options.correlativeTemplate && displayKeys[v] === 'compiled' && match < 0 && /\s/.test(comparedQuery)) {
//                                 correlativeMatch = true;
//                                 correlativeQuery = comparedQuery.split(' ');
//                                 correlativeDisplay = comparedDisplay;
//                                 for (var x = 0, xx = correlativeQuery.length; x < xx; x++) {
//                                     if (correlativeQuery[x] === "") continue;
//                                     if (!~correlativeDisplay.indexOf(correlativeQuery[x])) {
//                                         correlativeMatch = false;
//                                         break;
//                                     }
//                                     correlativeDisplay = correlativeDisplay.replace(correlativeQuery[x], '');
//                                 }
//                             }

//                             if (match < 0 && !correlativeMatch) continue;
//                             // @TODO Deprecate these? use matcher instead?
//                             if (this.options.offset && match !== 0) continue;

//                             if (groupMatcher) {
//                                 groupMatcherResult = groupMatcher.call(this, item, displayValue);

//                                 // return undefined to skip to next item
//                                 // return false to attempt the matching function on the next displayKey
//                                 // return true to add the item to the result list
//                                 // return item object to modify the item and add it to the result list

//                                 if (groupMatcherResult === undefined) break;
//                                 if (!groupMatcherResult) continue;
//                                 if (typeof groupMatcherResult === "object") {
//                                     item = groupMatcherResult;
//                                 }
//                             }
//                         }

//                         this.resultCount++;
//                         this.resultCountPerGroup[groupReference]++;

//                         if (this.resultItemCount < maxItem) {
//                             if (maxItemPerGroup && this.result[groupReference].length >= maxItemPerGroup) {
//                                 break;
//                             }

//                             this.result[groupReference].push($.extend(true, {matchedKey: displayKeys[v]}, item));
//                             this.resultItemCount++;
//                         }
//                         break;
//                     }

//                     if (!this.options.callback.onResult) {
//                         if (this.resultItemCount >= maxItem) {
//                             break;
//                         }
//                         if (maxItemPerGroup && this.result[groupReference].length >= maxItemPerGroup) {
//                             if (groupBy === "group") {
//                                 break;
//                             }
//                         }
//                     }
//                 }
//             }

//             // {debug}
//             if (this.options.debug) {
//                 if (!this.helper.isEmpty(missingDisplayKey)) {
//                     _debug.log({
//                         'node': this.selector,
//                         'function': 'searchResult()',
//                         'arguments': JSON.stringify(missingDisplayKey),
//                         'message': 'Missing keys for display, make sure options.display is set properly.'
//                     });

//                     _debug.print();
//                 }
//             }
//             // {/debug}

//             if (this.options.order) {
//                 var displayKeys = [],
//                     displayKey;

//                 for (var group in this.result) {
//                     if (!this.result.hasOwnProperty(group)) continue;
//                     for (var i = 0, ii = this.result[group].length; i < ii; i++) {
//                         displayKey = this.options.source[this.result[group][i].group].display || this.options.display;
//                         if (!~displayKeys.indexOf(displayKey[0])) {
//                             displayKeys.push(displayKey[0]);
//                         }
//                     }
//                     this.result[group].sort(
//                         scope.helper.sort(
//                             displayKeys,
//                             scope.options.order === "asc",
//                             function (a) {
//                                 return a.toString().toUpperCase();
//                             }
//                         )
//                     );
//                 }
//             }

//             var concatResults = [],
//                 groupOrder = [];

//             if (typeof this.options.groupOrder === "function") {
//                 groupOrder = this.options.groupOrder.apply(this, [this.node, this.query, this.result, this.resultCount, this.resultCountPerGroup]);
//             } else if (Array.isArray(this.options.groupOrder)) {
//                 groupOrder = this.options.groupOrder;
//             } else if (typeof this.options.groupOrder === "string" && ~["asc", "desc"].indexOf(this.options.groupOrder)) {
//                 groupOrder = Object.keys(this.result).sort(
//                     scope.helper.sort(
//                         [],
//                         scope.options.groupOrder === "asc",
//                         function (a) {
//                             return a.toString().toUpperCase();
//                         }
//                     )
//                 );
//             } else {
//                 groupOrder = Object.keys(this.result);
//             }

//             for (var i = 0, ii = groupOrder.length; i < ii; i++) {
//                 concatResults = concatResults.concat(this.result[groupOrder[i]] || []);
//             }


//             // #286 groupTemplate option was deleting group reference Array
//             this.groups = JSON.parse(JSON.stringify(groupOrder));

//             this.result = concatResults;
//         },

//         buildLayout: function () {

//             this.buildHtmlLayout();

//             this.buildBackdropLayout();

//             this.buildHintLayout();

//             if (this.options.callback.onLayoutBuiltBefore) {
//                 var tmpResultHtml = this.helper.executeCallback.call(this, this.options.callback.onLayoutBuiltBefore, [this.node, this.query, this.result, this.resultHtml]);

//                 if (tmpResultHtml instanceof $) {
//                     this.resultHtml = tmpResultHtml;
//                 }
//                 // {debug}
//                 else {
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.selector,
//                             'function': 'callback.onLayoutBuiltBefore()',
//                             'message': 'Invalid returned value - You must return resultHtmlList jQuery Object'
//                         });

//                         _debug.print();
//                     }
//                 }
//                 // {/debug}
//             }

//             this.resultHtml && this.resultContainer.html(this.resultHtml);

//             if (this.options.callback.onLayoutBuiltAfter) {
//                 this.helper.executeCallback.call(this, this.options.callback.onLayoutBuiltAfter, [this.node, this.query, this.result]);
//             }
//         },

//         buildHtmlLayout: function () {
//             // #150 Add the option to have no resultList but still perform the search and trigger the callbacks
//             if (this.options.resultContainer === false) return;

//             if (!this.resultContainer) {
//                 this.resultContainer = $("<div/>", {
//                     "class": this.options.selector.result
//                 });

//                 this.container.append(this.resultContainer);
//             }

//             var emptyTemplate;
//             if (!this.result.length) {
//                 if (this.options.emptyTemplate && this.query !== "") {
//                     emptyTemplate = typeof this.options.emptyTemplate === "function" ?
//                         this.options.emptyTemplate.call(this, this.query) :
//                         this.options.emptyTemplate.replace(/\{\{query}}/gi, this.helper.cleanStringFromScript(this.query));

//                 } else {
//                     return;
//                 }
//             }

//             var _query = this.query.toLowerCase();
//             if (this.options.accent) {
//                 _query = this.helper.removeAccent.call(this, _query);
//             }

//             var scope = this,
//                 groupTemplate = this.groupTemplate || '<ul></ul>',
//                 hasEmptyTemplate = false;

//             if (this.groupTemplate) {
//                 groupTemplate = $(groupTemplate.replace(/<([^>]+)>\{\{(.+?)}}<\/[^>]+>/g, function (match, tag, group, offset, string) {
//                     var template = '',
//                         groups = group === "group" ? scope.groups : [group];

//                     if (!scope.result.length) {
//                         if (hasEmptyTemplate === true) return '';
//                         hasEmptyTemplate = true;

//                         return '<' + tag + ' class="' + scope.options.selector.empty + '"><a href="javascript:;">' + emptyTemplate + '</a></' + tag + '>';
//                     }

//                     for (var i = 0, ii = groups.length; i < ii; ++i) {
//                         template += '<' + tag + ' data-group-template="' + groups[i] + '"><ul></ul></' + tag + '>';
//                     }

//                     return template;
//                 }));
//             } else {
//                 groupTemplate = $(groupTemplate);
//                 if (!this.result.length) {
//                     groupTemplate.append(
//                         emptyTemplate instanceof $ ?
//                             emptyTemplate :
//                             '<li class="' + scope.options.selector.empty + '"><a href="javascript:;">' + emptyTemplate + '</a></li>'
//                     );
//                 }
//             }

//             groupTemplate.addClass(this.options.selector.list + (this.helper.isEmpty(this.result) ? ' empty' : ''));

//             var _group,
//                 _groupTemplate,
//                 _item,
//                 _href,
//                 _liHtml,
//                 _template,
//                 _templateValue,
//                 _aHtml,
//                 _display,
//                 _displayKeys,
//                 _displayValue,
//                 _unusedGroups = this.groupTemplate && this.result.length && scope.groups || [],
//                 _tmpIndexOf;

//             for (var i = 0, ii = this.result.length; i < ii; ++i) {

//                 _item = this.result[i];
//                 _group = _item.group;
//                 _href = this.options.source[_item.group].href || this.options.href;
//                 _display = [];
//                 _displayKeys = this.options.source[_item.group].display || this.options.display;

//                 // @TODO Optimize this, shouldn't occur on every looped item?
//                 if (this.options.group) {
//                     _group = _item[this.options.group.key];
//                     if (this.options.group.template) {
//                         if (typeof this.options.group.template === "function") {
//                             _groupTemplate = this.options.group.template(_item);
//                         } else if (typeof this.options.template === "string") {
//                             _groupTemplate = this.options.group.template.replace(/\{\{([\w\-\.]+)}}/gi, function (match, index) {
//                                 return scope.helper.namespace.call(scope, index, _item, 'get', '');
//                             });
//                         }
//                     }

//                     if (!groupTemplate.find('[data-search-group="' + _group + '"]')[0]) {
//                         (this.groupTemplate ? groupTemplate.find('[data-group-template="' + _group + '"] ul') : groupTemplate).append(
//                             $("<li/>", {
//                                 "class": scope.options.selector.group,
//                                 "html": $("<a/>", {
//                                     "href": "javascript:;",
//                                     "html": _groupTemplate || _group,
//                                     "tabindex": -1
//                                 }),
//                                 "data-search-group": _group
//                             })
//                         );
//                     }
//                 }

//                 if (this.groupTemplate && _unusedGroups.length) {
//                     _tmpIndexOf = _unusedGroups.indexOf(_group || _item.group);
//                     if (~_tmpIndexOf) {
//                         _unusedGroups.splice(_tmpIndexOf, 1);
//                     }
//                 }

//                 _liHtml = $("<li/>", {
//                     "class": scope.options.selector.item + " " + scope.options.selector.group + '-' + this.helper.slugify.call(this, _group),
//                     "html": $("<a/>", {
//                         // #190 Strange JS-code fragment in href attribute using jQuery version below 1.10
//                         "href": (function () {
//                             if (_href) {
//                                 if (typeof _href === "string") {
//                                     _href = _href.replace(/\{\{([^\|}]+)(?:\|([^}]+))*}}/gi, function (match, index, options) {

//                                         var value = scope.helper.namespace.call(scope, index, _item, 'get', '');

//                                         // #151 Slugify should be an option, not enforced
//                                         options = options && options.split("|") || [];
//                                         if (~options.indexOf('slugify')) {
//                                             value = scope.helper.slugify.call(scope, value);
//                                         }

//                                         return value;
//                                     });
//                                 } else if (typeof _href === "function") {
//                                     _href = _href(_item);
//                                 }
//                                 _item.href = _href;
//                             }
//                             return _href || "javascript:;";
//                         }()),
//                         "data-group": _group,
//                         "data-index": i,
//                         "html": function () {

//                             _template = (_item.group && scope.options.source[_item.group].template) || scope.options.template;

//                             if (_template) {
//                                 if (typeof _template === "function") {
//                                     _template = _template.call(scope, scope.query, _item);
//                                 }

//                                 _aHtml = _template.replace(/\{\{([^\|}]+)(?:\|([^}]+))*}}/gi, function (match, index, options) {

//                                     var value = scope.helper.cleanStringFromScript(String(scope.helper.namespace.call(scope, index, _item, 'get', '')));

//                                     // #151 Slugify should be an option, not enforced
//                                     options = options && options.split("|") || [];
//                                     if (~options.indexOf('slugify')) {
//                                         value = scope.helper.slugify.call(scope, value);
//                                     }

//                                     if (!~options.indexOf('raw')) {
//                                         if (scope.options.highlight === true && _query && ~_displayKeys.indexOf(index)) {
//                                             value = scope.helper.highlight.call(scope, value, _query.split(" "), scope.options.accent);
//                                         }
//                                     }
//                                     return value;
//                                 });
//                             } else {
//                                 for (var i = 0, ii = _displayKeys.length; i < ii; i++) {
//                                     _displayValue = /\./.test(_displayKeys[i]) ?
//                                         scope.helper.namespace.call(scope, _displayKeys[i], _item, 'get', '') :
//                                         _item[_displayKeys[i]];

//                                     if (typeof _displayValue === 'undefined' || _displayValue === '') continue;

//                                     _display.push(_displayValue);
//                                 }

//                                 _aHtml = '<span class="' + scope.options.selector.display + '">' + scope.helper.cleanStringFromScript(String(_display.join(" "))) + '</span>';
//                             }

//                             if ((scope.options.highlight === true && _query && !_template) || scope.options.highlight === "any") {
//                                 _aHtml = scope.helper.highlight.call(scope, _aHtml, _query.split(" "), scope.options.accent);
//                             }

//                             $(this).append(_aHtml);

//                         }
//                     })
//                 });

//                 (function (i, item, liHtml) {
//                     liHtml.on('click', function (e, originalEvent) {
//                         // #208 - Attach "keyboard Enter" original event
//                         if (originalEvent && typeof originalEvent === "object") {
//                             e.originalEvent = originalEvent;
//                         }

//                         if (scope.options.mustSelectItem && scope.helper.isEmpty(item)) {
//                             e.preventDefault();
//                             return;
//                         }

//                         scope.item = item;

//                         if (scope.helper.executeCallback.call(scope, scope.options.callback.onClickBefore, [scope.node, $(this), item, e]) === false) return;
//                         if ((e.originalEvent && e.originalEvent.defaultPrevented) || e.isDefaultPrevented()) {
//                             return;
//                         }

//                         _templateValue = (item.group && scope.options.source[item.group].templateValue) || scope.options.templateValue;
//                         if (typeof _templateValue === "function") {
//                             _templateValue = _templateValue.call(scope);
//                         }

//                         scope.query = scope.rawQuery = _templateValue ?
//                             _templateValue.replace(/\{\{([\w\-\.]+)}}/gi, function (match, index) {
//                                 return scope.helper.namespace.call(scope, index, item, 'get', '');
//                             }) : scope.helper.namespace.call(scope, item.matchedKey, item).toString();

//                         scope.focusOnly = true;
//                         scope.node.val(scope.query).focus();

//                         scope.searchResult(true);
//                         scope.buildLayout();
//                         scope.hideLayout();

//                         scope.helper.executeCallback.call(scope, scope.options.callback.onClickAfter, [scope.node, $(this), item, e]);
//                     });
//                     liHtml.on('mouseenter', function (e) {
//                         scope.helper.executeCallback.call(scope, scope.options.callback.onMouseEnter, [scope.node, $(this), item, e]);
//                     });
//                     liHtml.on('mouseleave', function (e) {
//                         scope.helper.executeCallback.call(scope, scope.options.callback.onMouseLeave, [scope.node, $(this), item, e]);
//                     });
//                 }(i, _item, _liHtml));

//                 (this.groupTemplate ? groupTemplate.find('[data-group-template="' + _group + '"] ul') : groupTemplate).append(_liHtml);
//             }

//             if (this.result.length && _unusedGroups.length) {
//                 for (var i = 0, ii = _unusedGroups.length; i < ii; ++i) {
//                     groupTemplate.find('[data-group-template="' + _unusedGroups[i] + '"]').remove();
//                 }
//             }

//             this.resultHtml = groupTemplate;

//         },

//         buildBackdropLayout: function () {

//             if (!this.options.backdrop) return;

//             if (!this.backdrop.container) {
//                 this.backdrop.css = $.extend(
//                     {
//                         "opacity": 0.6,
//                         "filter": 'alpha(opacity=60)',
//                         "position": 'fixed',
//                         "top": 0,
//                         "right": 0,
//                         "bottom": 0,
//                         "left": 0,
//                         "z-index": 1040,
//                         "background-color": "#000"
//                     },
//                     this.options.backdrop
//                 );

//                 this.backdrop.container = $("<div/>", {
//                     "class": this.options.selector.backdrop,
//                     "css": this.backdrop.css
//                 }).insertAfter(this.container);

//             }
//             this.container
//                 .addClass('backdrop')
//                 .css({
//                     "z-index": this.backdrop.css["z-index"] + 1,
//                     "position": "relative"
//                 });

//         },

//         buildHintLayout: function (result) {
//             if (!this.options.hint) return;
//             // #144 hint doesn't overlap with the input when the query is too long
//             if (this.node[0].scrollWidth > Math.ceil(this.node.innerWidth())) {
//                 this.hint.container && this.hint.container.val("");
//                 return;
//             }

//             var scope = this,
//                 hint = "",
//                 result = result || this.result,
//                 query = this.query.toLowerCase();

//             if (this.options.accent) {
//                 query = this.helper.removeAccent.call(this, query);
//             }

//             this.hintIndex = null;

//             if (this.searchGroups.length) {

//                 if (!this.hint.container) {

//                     this.hint.css = $.extend({
//                             "border-color": "transparent",
//                             "position": "absolute",
//                             "top": 0,
//                             "display": "inline",
//                             "z-index": -1,
//                             "float": "none",
//                             "color": "silver",
//                             "box-shadow": "none",
//                             "cursor": "default",
//                             "-webkit-user-select": "none",
//                             "-moz-user-select": "none",
//                             "-ms-user-select": "none",
//                             "user-select": "none"
//                         },
//                         this.options.hint
//                     );

//                     this.hint.container = $('<input/>', {
//                         'type': this.node.attr('type'),
//                         'class': this.node.attr('class'),
//                         'readonly': true,
//                         'unselectable': 'on',
//                         'aria-hidden': 'true',
//                         'tabindex': -1,
//                         'click': function () {
//                             // IE8 Fix
//                             scope.node.focus();
//                         }
//                     }).addClass(this.options.selector.hint)
//                         .css(this.hint.css)
//                         .insertAfter(this.node);

//                     this.node.parent().css({
//                         "position": "relative"
//                     });
//                 }

//                 this.hint.container.css('color', this.hint.css.color);

//                 // Do not display hint for empty query
//                 if (query) {
//                     var _displayKeys,
//                         _group,
//                         _comparedValue;

//                     for (var i = 0, ii = result.length; i < ii; i++) {

//                         _group = result[i].group;
//                         _displayKeys = this.options.source[_group].display || this.options.display;

//                         for (var k = 0, kk = _displayKeys.length; k < kk; k++) {

//                             _comparedValue = String(result[i][_displayKeys[k]]).toLowerCase();
//                             if (this.options.accent) {
//                                 _comparedValue = this.helper.removeAccent.call(this, _comparedValue);
//                             }

//                             if (_comparedValue.indexOf(query) === 0) {
//                                 hint = String(result[i][_displayKeys[k]]);
//                                 this.hintIndex = i;
//                                 break;
//                             }
//                         }
//                         if (this.hintIndex !== null) {
//                             break;
//                         }
//                     }
//                 }

//                 this.hint.container
//                     .val(hint.length > 0 && this.rawQuery + hint.substring(this.query.length) || "");

//             }

//         },

//         buildDropdownLayout: function () {

//             if (!this.options.dropdownFilter) return;

//             var scope = this;

//             $('<span/>', {
//                 "class": this.options.selector.filter,
//                 "html": function () {

//                     $(this).append(
//                         $('<button/>', {
//                             "type": "button",
//                             "class": scope.options.selector.filterButton,
//                             "style": "display: none;",
//                             "click": function (e) {
//                                 e.stopPropagation();
//                                 scope.container.toggleClass('filter');

//                                 var _ns = scope.namespace + '-dropdown-filter';

//                                 $('html').off(_ns);

//                                 if (scope.container.hasClass('filter')) {
//                                     $('html').on("click" + _ns + " touchend" + _ns, function (e) {
//                                         if ($(e.target).closest('.' + scope.options.selector.filter)[0] || scope.hasDragged) return;
//                                         scope.container.removeClass('filter');
//                                     });
//                                 }
//                             }
//                         })
//                     );

//                     $(this).append(
//                         $('<ul/>', {
//                             "class": scope.options.selector.dropdown
//                         })
//                     );
//                 }
//             }).insertAfter(scope.container.find('.' + scope.options.selector.query));

//         },

//         buildDropdownItemLayout: function (type) {

//             if (!this.options.dropdownFilter) return;

//             var scope = this,
//                 template,
//                 all = typeof this.options.dropdownFilter === 'string' && this.options.dropdownFilter || 'All',
//                 ulScope = this.container.find('.' + this.options.selector.dropdown),
//                 filter;

//             // Use regular groups defined in options.source
//             if (type === 'static' && (this.options.dropdownFilter === true || typeof this.options.dropdownFilter === 'string')) {
//                 this.dropdownFilter.static.push({
//                     key: 'group',
//                     template: '{{group}}',
//                     all: all,
//                     value: Object.keys(this.options.source)
//                 });
//             }

//             for (var i = 0, ii = this.dropdownFilter[type].length; i < ii; i++) {

//                 filter = this.dropdownFilter[type][i];

//                 if (!Array.isArray(filter.value)) {
//                     filter.value = [filter.value];
//                 }

//                 if (filter.all) {
//                     this.dropdownFilterAll = filter.all;
//                 }

//                 for (var k = 0, kk = filter.value.length; k <= kk; k++) {

//                     // Only add "all" at the last filter iteration
//                     if (k === kk && (i !== ii - 1)) {
//                         continue;
//                     } else if (k === kk && (i === ii - 1)) {
//                         if (type === 'static' && this.dropdownFilter.dynamic.length) {
//                             continue;
//                         }
//                     }

//                     template = this.dropdownFilterAll || all;
//                     if (filter.value[k]) {
//                         if (filter.template) {
//                             template = filter.template.replace(new RegExp('\{\{' + filter.key + '}}', 'gi'), filter.value[k]);
//                         } else {
//                             template = filter.value[k];
//                         }
//                     } else {
//                         this.container.find('.' + scope.options.selector.filterButton).html(template);
//                     }

//                     (function (k, filter, template) {

//                         ulScope.append(
//                             $("<li/>", {
//                                 "class": scope.options.selector.dropdownItem + ' ' + scope.helper.slugify.call(scope, filter.key + '-' + (filter.value[k] || all)),
//                                 "html": $("<a/>", {
//                                     "href": "javascript:;",
//                                     "html": template,
//                                     "click": function (e) {
//                                         e.preventDefault();
//                                         _selectFilter.call(scope, {
//                                             key: filter.key,
//                                             value: filter.value[k] || '*',
//                                             template: template
//                                         });
//                                     }
//                                 })
//                             })
//                         );

//                     }(k, filter, template));
//                 }
//             }

//             if (this.dropdownFilter[type].length) {
//                 this.container.find('.' + scope.options.selector.filterButton).removeAttr('style');
//             }

//             /**
//              * @private
//              * Select the filter and rebuild the result group
//              *
//              * @param {object} item
//              */
//             function _selectFilter(item) {
//                 if (item.value === "*") {
//                     delete this.filters.dropdown;
//                 } else {
//                     this.filters.dropdown = item;
//                 }

//                 this.container
//                     .removeClass('filter')
//                     .find('.' + this.options.selector.filterButton)
//                     .html(item.template);

//                 this.isDropdownEvent = true;
//                 this.node.trigger('search' + this.namespace);

//                 this.node.focus();
//             }
//         },

//         dynamicFilter: {
//             isEnabled: false,
//             init: function () {

//                 if (!this.options.dynamicFilter) return;

//                 this.dynamicFilter.bind.call(this);
//                 this.dynamicFilter.isEnabled = true;

//             },

//             validate: function (item) {

//                 var isValid,
//                     softValid = null,
//                     hardValid = null,
//                     itemValue;

//                 for (var key in this.filters.dynamic) {
//                     if (!this.filters.dynamic.hasOwnProperty(key)) continue;
//                     if (!!~key.indexOf('.')) {
//                         itemValue = this.helper.namespace.call(this, key, item, 'get');
//                     } else {
//                         itemValue = item[key];
//                     }

//                     if (this.filters.dynamic[key].modifier === '|' && !softValid) {
//                         softValid = itemValue == this.filters.dynamic[key].value || false;
//                     }

//                     if (this.filters.dynamic[key].modifier === '&') {
//                         // Leaving "==" in case of comparing number with string
//                         if (itemValue == this.filters.dynamic[key].value) {
//                             hardValid = true;
//                         } else {
//                             hardValid = false;
//                             break;
//                         }
//                     }
//                 }

//                 isValid = softValid;
//                 if (hardValid !== null) {
//                     isValid = hardValid;
//                     if (hardValid === true && softValid !== null) {
//                         isValid = softValid;
//                     }
//                 }

//                 return !!isValid;

//             },

//             set: function (key, value) {

//                 var matches = key.match(/^([|&])?(.+)/);

//                 if (!value) {
//                     delete this.filters.dynamic[matches[2]];
//                 } else {
//                     this.filters.dynamic[matches[2]] = {
//                         modifier: matches[1] || '|',
//                         value: value
//                     };
//                 }

//                 if (this.dynamicFilter.isEnabled) {
//                     this.generateSource();
//                 }

//             },
//             bind: function () {

//                 var scope = this,
//                     filter;

//                 for (var i = 0, ii = this.options.dynamicFilter.length; i < ii; i++) {

//                     filter = this.options.dynamicFilter[i];

//                     if (typeof filter.selector === "string") {
//                         filter.selector = $(filter.selector);
//                     }

//                     if (!(filter.selector instanceof $) || !filter.selector[0] || !filter.key) {
//                         // {debug}
//                         if (this.options.debug) {
//                             _debug.log({
//                                 'node': this.selector,
//                                 'function': 'buildDynamicLayout()',
//                                 'message': 'Invalid jQuery selector or jQuery Object for "filter.selector" or missing filter.key'
//                             });

//                             _debug.print();
//                         }
//                         // {/debug}
//                         continue;
//                     }

//                     (function (filter) {
//                         filter.selector.off(scope.namespace).on('change' + scope.namespace, function () {
//                             scope.dynamicFilter.set.apply(scope, [filter.key, scope.dynamicFilter.getValue(this)]);
//                         }).trigger('change' + scope.namespace);
//                     }(filter));

//                 }
//             },

//             getValue: function (tag) {
//                 var value;
//                 if (tag.tagName === "SELECT") {
//                     value = tag.value;
//                 } else if (tag.tagName === "INPUT") {
//                     if (tag.type === "checkbox") {
//                         value = tag.checked && tag.getAttribute('value') || tag.checked || null;
//                     } else if (tag.type === "radio" && tag.checked) {
//                         value = tag.value;
//                     }
//                 }
//                 return value;
//             }
//         },

//         showLayout: function () {

//             // Means the container is already visible
//             if (this.container.hasClass('result')) return;

//             // Do not add display classes if there are no results
//             if (!this.result.length && !this.options.emptyTemplate && !this.options.backdropOnFocus) {
//                 return;
//             }

//             _addHtmlListeners.call(this);

//             this.container.addClass([
//                 this.result.length || (this.searchGroups.length && this.options.emptyTemplate && this.query.length) ? 'result ' : '',
//                 this.options.hint && this.searchGroups.length ? 'hint' : '',
//                 this.options.backdrop || this.options.backdropOnFocus ? 'backdrop' : ''].join(' ')
//             );

//             this.helper.executeCallback.call(this, this.options.callback.onShowLayout, [this.node, this.query]);

//             function _addHtmlListeners() {
//                 var scope = this;

//                 // If Typeahead is blured by pressing the "Tab" Key, hide the results
//                 $('html').off("keydown" + this.namespace)
//                     .on("keydown" + this.namespace, function (e) {
//                         if (!e.keyCode || e.keyCode !== 9) return;
//                         setTimeout(function () {
//                             if (!$(':focus').closest(scope.container).find(scope.node)[0]) {
//                                 scope.hideLayout();
//                             }
//                         }, 0);
//                     });

//                 // If Typeahead is blured by clicking outside, hide the results
//                 $('html').off("click" + this.namespace + " touchend" + this.namespace)
//                     .on("click" + this.namespace + " touchend" + this.namespace, function (e) {
//                         if ($(e.target).closest(scope.container)[0] || scope.hasDragged) return;
//                         scope.hideLayout();
//                     });
//             }
//         },

//         hideLayout: function () {

//             // Means the container is already hidden
//             if (!this.container.hasClass('result') && !this.container.hasClass('backdrop')) return;

//             this.container.removeClass('result hint filter' + (this.options.backdropOnFocus && $(this.node).is(':focus') ? '' : ' backdrop'));

//             if (this.options.backdropOnFocus && this.container.hasClass('backdrop')) return;

//             // Make sure the event HTML gets cleared
//             $('html').off(this.namespace);

//             this.helper.executeCallback.call(this, this.options.callback.onHideLayout, [this.node, this.query]);

//         },

//         resetLayout: function () {

//             this.result = {};
//             this.groups = [];
//             this.resultCount = 0;
//             this.resultCountPerGroup = {};
//             this.resultItemCount = 0;
//             this.resultHtml = null;

//             if (this.options.hint && this.hint.container) {
//                 this.hint.container.val('');
//             }

//         },

//         resetInput: function () {

//             this.node.val('');
//             this.item = null;
//             this.query = '';
//             this.rawQuery = '';

//         },

//         buildCancelButtonLayout: function () {
//             if (!this.options.cancelButton) return;
//             var scope = this;

//             $('<span/>', {
//                 "class": this.options.selector.cancelButton,
//                 "mousedown": function (e) {
//                     // Don't blur the input
//                     e.stopImmediatePropagation();
//                     e.preventDefault();

//                     scope.resetInput();
//                     scope.node.trigger('input' + scope.namespace, [e]);
//                 }
//             }).insertBefore(this.node);

//         },

//         toggleCancelButtonVisibility: function () {
//             this.container.toggleClass('cancel', !!this.query.length);
//         },

//         __construct: function () {
//             this.extendOptions();

//             if (!this.unifySourceFormat()) {
//                 return;
//             }

//             this.dynamicFilter.init.apply(this);

//             this.init();
//             this.buildDropdownLayout();
//             this.buildDropdownItemLayout('static');

//             this.delegateEvents();
//             this.buildCancelButtonLayout();

//             this.helper.executeCallback.call(this, this.options.callback.onReady, [this.node]);
//         },

//         helper: {

//             isEmpty: function (obj) {
//                 for (var prop in obj) {
//                     if (obj.hasOwnProperty(prop))
//                         return false;
//                 }

//                 return true;
//             },

//             /**
//              * Remove every accent(s) from a string
//              *
//              * @param {String} string
//              * @returns {*}
//              */
//             removeAccent: function (string) {
//                 if (typeof string !== "string") {
//                     return;
//                 }

//                 var accent = _accent;

//                 if (typeof this.options.accent === "object") {
//                     accent = this.options.accent;
//                 }

//                 string = string.toLowerCase().replace(new RegExp('[' + accent.from + ']', 'g'), function (match) {
//                     return accent.to[accent.from.indexOf(match)];
//                 });

//                 return string;
//             },

//             /**
//              * Creates a valid url from string
//              *
//              * @param {String} string
//              * @returns {string}
//              */
//             slugify: function (string) {

//                 string = String(string);

//                 if (string !== "") {
//                     string = this.helper.removeAccent.call(this, string);
//                     string = string.replace(/[^-a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
//                 }

//                 return string;
//             },

//             /**
//              * Sort list of object by key
//              *
//              * @param {String|Array} field
//              * @param {Boolean} reverse
//              * @param {Function} primer
//              * @returns {Function}
//              */
//             sort: function (field, reverse, primer) {
//                 var key = function (x) {
//                     for (var i = 0, ii = field.length; i < ii; i++) {
//                         if (typeof x[field[i]] !== 'undefined') {
//                             return primer(x[field[i]]);
//                         }
//                     }
//                     return x;
//                 };

//                 reverse = [-1, 1][+!!reverse];

//                 return function (a, b) {
//                     return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
//                 };
//             },

//             /**
//              * Replace a string from-to index
//              *
//              * @param {String} string The complete string to replace into
//              * @param {Number} offset The cursor position to start replacing from
//              * @param {Number} length The length of the replacing string
//              * @param {String} replace The replacing string
//              * @returns {String}
//              */
//             replaceAt: function (string, offset, length, replace) {
//                 return string.substring(0, offset) + replace + string.substring(offset + length);
//             },

//             /**
//              * Adds <strong> html around a matched string
//              *
//              * @param {String} string The complete string to match from
//              * @param {String} key
//              * @param {Boolean} [accents]
//              * @returns {*}
//              */
//             highlight: function (string, keys, accents) {

//                 string = String(string);

//                 var searchString = accents && this.helper.removeAccent.call(this, string) || string,
//                     matches = [];

//                 if (!Array.isArray(keys)) {
//                     keys = [keys];
//                 }

//                 keys.sort(function (a, b) {
//                     return b.length - a.length;
//                 });

//                 // Make sure the '|' join will be safe!
//                 for (var i = keys.length - 1; i >= 0; i--) {
//                     if (keys[i].trim() === "") {
//                         keys.splice(i, 1);
//                         continue;
//                     }
//                     keys[i] = keys[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
//                 }

//                 searchString.replace(
//                     new RegExp('(?:' + keys.join('|') + ')(?!([^<]+)?>)', 'gi'),
//                     function (match, index, offset) {
//                         matches.push({
//                             offset: offset,
//                             length: match.length
//                         });
//                     }
//                 );

//                 for (var i = matches.length - 1; i >= 0; i--) {
//                     string = this.helper.replaceAt(
//                         string,
//                         matches[i].offset,
//                         matches[i].length,
//                         "<strong>" + string.substr(matches[i].offset, matches[i].length) + "</strong>"
//                     );
//                 }

//                 return string;
//             },

//             /**
//              * Get carret position, mainly used for right arrow navigation
//              * @param element
//              * @returns {*}
//              */
//             getCaret: function (element) {
//                 if (element.selectionStart) {
//                     return element.selectionStart;
//                 } else if (document.selection) {
//                     element.focus();

//                     var r = document.selection.createRange();
//                     if (r === null) {
//                         return 0;
//                     }

//                     var re = element.createTextRange(),
//                         rc = re.duplicate();
//                     re.moveToBookmark(r.getBookmark());
//                     rc.setEndPoint('EndToStart', re);

//                     return rc.text.length;
//                 }
//                 return 0;
//             },

//             /**
//              * Clean strings from possible XSS (script and iframe tags)
//              * @param string
//              * @returns {string}
//              */
//             cleanStringFromScript: function (string) {
//                 return typeof string === "string" &&
//                     string.replace(/<\/?(?:script|iframe)\b[^>]*>/gm, '') ||
//                     string;
//             },

//             /**
//              * Executes an anonymous function or a string reached from the window scope.
//              *
//              * @example
//              * Note: These examples works with every configuration callbacks
//              *
//              * // An anonymous function inside the "onInit" option
//              * onInit: function() { console.log(':D'); };
//              *
//              * // myFunction() located on window.coucou scope
//              * onInit: 'window.coucou.myFunction'
//              *
//              * // myFunction(a,b) located on window.coucou scope passing 2 parameters
//              * onInit: ['window.coucou.myFunction', [':D', ':)']];
//              *
//              * // Anonymous function to execute a local function
//              * onInit: function () { myFunction(':D'); }
//              *
//              * @param {String|Array} callback The function to be called
//              * @param {Array} [extraParams] In some cases the function can be called with Extra parameters (onError)
//              * @returns {*}
//              */
//             executeCallback: function (callback, extraParams) {

//                 if (!callback) {
//                     return;
//                 }

//                 var _callback;

//                 if (typeof callback === "function") {

//                     _callback = callback;

//                 } else if (typeof callback === "string" || Array.isArray(callback)) {

//                     if (typeof callback === "string") {
//                         callback = [callback, []];
//                     }

//                     _callback = this.helper.namespace.call(this, callback[0], window);

//                     if (typeof _callback !== "function") {
//                         // {debug}
//                         if (this.options.debug) {
//                             _debug.log({
//                                 'node': this.selector,
//                                 'function': 'executeCallback()',
//                                 'arguments': JSON.stringify(callback),
//                                 'message': 'WARNING - Invalid callback function"'
//                             });

//                             _debug.print();
//                         }
//                         // {/debug}
//                         return;
//                     }

//                 }

//                 return _callback.apply(this, (callback[1] || []).concat(extraParams ? extraParams : []));

//             },

//             namespace: function (string, object, method, defaultValue) {

//                 if (typeof string !== "string" || string === "") {
//                     // {debug}
//                     if (this.options.debug) {
//                         _debug.log({
//                             'node': this.options.input || this.selector,
//                             'function': 'helper.namespace()',
//                             'arguments': string,
//                             'message': 'ERROR - Missing string"'
//                         });

//                         _debug.print();
//                     }
//                     // {/debug}
//                     return false;
//                 }

//                 var value = typeof defaultValue !== "undefined" ? defaultValue : undefined;

//                 // Exit before looping if the string doesn't contain an object reference
//                 if (!~string.indexOf('.')) {
//                     return object[string] || value;
//                 }

//                 var parts = string.split('.'),
//                     parent = object || window,
//                     method = method || 'get',
//                     currentPart = '';

//                 for (var i = 0, length = parts.length; i < length; i++) {
//                     currentPart = parts[i];

//                     if (typeof parent[currentPart] === "undefined") {
//                         if (~['get', 'delete'].indexOf(method)) {
//                             return typeof defaultValue !== "undefined" ? defaultValue : undefined;
//                         }
//                         parent[currentPart] = {};
//                     }

//                     if (~['set', 'create', 'delete'].indexOf(method)) {
//                         if (i === length - 1) {
//                             if (method === 'set' || method === 'create') {
//                                 parent[currentPart] = value;
//                             } else {

//                                 delete parent[currentPart];
//                                 return true;
//                             }
//                         }
//                     }

//                     parent = parent[currentPart];

//                 }
//                 return parent;
//             },

//             typeWatch: (function () {
//                 var timer = 0;
//                 return function (callback, ms) {
//                     clearTimeout(timer);
//                     timer = setTimeout(callback, ms);
//                 };
//             })()

//         }
//     };

//     /**
//      * @public
//      * Implement Typeahead on the selected input node.
//      *
//      * @param {Object} options
//      * @return {Object} Modified DOM element
//      */
//     $.fn.typeahead = $.typeahead = function (options) {
//         return _api.typeahead(this, options);
//     };

//     /**
//      * @private
//      * API to handles Typeahead methods via jQuery.
//      */
//     var _api = {

//         /**
//          * Enable Typeahead
//          *
//          * @param {Object} node
//          * @param {Object} options
//          * @returns {*}
//          */
//         typeahead: function (node, options) {

//             if (!options || !options.source || typeof options.source !== 'object') {

//                 // {debug}
//                 _debug.log({
//                     'node': node.selector || options && options.input,
//                     'function': '$.typeahead()',
//                     'arguments': JSON.stringify(options && options.source || ''),
//                     'message': 'Undefined "options" or "options.source" or invalid source type - Typeahead dropped'
//                 });

//                 _debug.print();
//                 // {/debug}

//                 return;
//             }

//             if (typeof node === "function") {
//                 if (!options.input) {

//                     // {debug}
//                     _debug.log({
//                         'node': node.selector,
//                         'function': '$.typeahead()',
//                         //'arguments': JSON.stringify(options),
//                         'message': 'Undefined "options.input" - Typeahead dropped'
//                     });

//                     _debug.print();
//                     // {/debug}

//                     return;
//                 }

//                 node = $(options.input);
//             }

//             if (!node.length || node[0].nodeName !== "INPUT") {

//                 // {debug}
//                 _debug.log({
//                     'node': node.selector,
//                     'function': '$.typeahead()',
//                     'arguments': JSON.stringify(options.input),
//                     'message': 'Unable to find jQuery input element - Typeahead dropped'
//                 });

//                 _debug.print();
//                 // {/debug}

//                 return;
//             }

//             // #270 Forcing node.selector, the property was deleted from jQuery3
//             // In case of multiple init, each of the instances needs it's own selector!
//             if (node.length === 1) {
//                 node[0].selector = node.selector || options.input || node[0].nodeName.toLowerCase();

//                 /*jshint boss:true */
//                 return window.Typeahead[node[0].selector] = new Typeahead(node, options);
//             } else {

//                 var instances = {},
//                     instanceName;

//                 for (var i = 0, ii = node.length; i < ii; ++i) {
//                     instanceName = node[i].nodeName.toLowerCase();
//                     if (typeof instances[instanceName] !== "undefined") {
//                         instanceName += i;
//                     }
//                     node[i].selector = instanceName;

//                     window.Typeahead[instanceName] = instances[instanceName] = new Typeahead(node.eq(i), options);
//                 }

//                 return instances;
//             }
//         }
//     };

// // {debug}
//     var _debug = {

//         table: {},
//         log: function (debugObject) {

//             if (!debugObject.message || typeof debugObject.message !== "string") {
//                 return;
//             }

//             this.table[debugObject.message] = $.extend({
//                 'node': '',
//                 'function': '',
//                 'arguments': ''
//             }, debugObject);

//         },
//         print: function () {

//             if (Typeahead.prototype.helper.isEmpty(this.table) || !console || !console.table) {
//                 return;
//             }

//             if (console.group !== undefined || console.table !== undefined) {
//                 console.groupCollapsed('--- jQuery Typeahead Debug ---');
//                 console.table(this.table);
//                 console.groupEnd();
//             }

//             this.table = {};

//         }

//     };
//     _debug.log({
//         'message': 'WARNING - You are using the DEBUG version. Use /dist/jquery.typeahead.min.js in production.'
//     });

//     _debug.print();
// // {/debug}

// // IE8 Shims
//     window.console = window.console || {
//             log: function () {
//             }
//         };

//     if (!Array.isArray) {
//         Array.isArray = function (arg) {
//             return Object.prototype.toString.call(arg) === '[object Array]';
//         };
//     }

//     if (!('trim' in String.prototype)) {
//         String.prototype.trim = function () {
//             return this.replace(/^\s+/, '').replace(/\s+$/, '');
//         };
//     }
//     if (!('indexOf' in Array.prototype)) {
//         Array.prototype.indexOf = function (find, i /*opt*/) {
//             if (i === undefined) i = 0;
//             if (i < 0) i += this.length;
//             if (i < 0) i = 0;
//             for (var n = this.length; i < n; i++)
//                 if (i in this && this[i] === find)
//                     return i;
//             return -1;
//         };
//     }
//     if (!Object.keys) {
//         Object.keys = function (obj) {
//             var keys = [],
//                 k;
//             for (k in obj) {
//                 if (Object.prototype.hasOwnProperty.call(obj, k)) {
//                     keys.push(k);
//                 }
//             }
//             return keys;
//         };
//     }

//     return Typeahead;

// }));
