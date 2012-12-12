/**
 * @fileoverview Externs for backbone-0.9.1.js
 *
 * built with http://www.dotnetwise.com/Code/Externs/index.html see
 * also:
 * http://blog.dotnetwise.com/2009/11/closure-compiler-externs-extractor.html
 * via:
 * http://code.google.com/p/closure-compiler/wiki/FAQ#How_do_I_write_an_externs_file?
 *
 * Note: when building via that page, you first need to load in
 *       underscrore.js, as that's a dependency.  also, after running
 *       the extern for Backbone, you need to manually run it for:
 *       Backbone.Model.prototype, Backbone.Collection.prototype,
 *       Backbone.Router.prototype, Backbone.History.prototype, and
 *       Backbone.View.prototype because these objects are modified
 *       using _.extend(Backbone.Model.prototype ...)

 * @see http://documentcloud.github.com/backbone/
 * @externs
 */

var Backbone = {
    "VERSION": {},
    "setDomLibrary": function () {},
    "noConflict": function () {},
    "emulateHTTP": {},
    "emulateJSON": {},
    "Events": {
        "on": function () {},
        "off": function () {},
        "trigger": function () {},
        "bind": function () {},
        "unbind": function () {}
    },
    "Model": function () {},
    "Collection": function () {},
    "Router": function () {},
    "History": function () {},
    "View": function () {},
    "sync": function () {},
    "wrapError": function () {}
};
Backbone.Model.prototype = {
    "on": function () {},
    "off": function () {},
    "trigger": function () {},
    "bind": function () {},
    "unbind": function () {},
    "idAttribute": {},
    "initialize": function () {},
    "toJSON": function () {},
    "get": function () {},
    "escape": function () {},
    "has": function () {},
    "set": function () {},
    "unset": function () {},
    "clear": function () {},
    "fetch": function () {},
    "save": function () {},
    "destroy": function () {},
    "url": function () {},
    "parse": function () {},
    "clone": function () {},
    "isNew": function () {},
    "change": function () {},
    "hasChanged": function () {},
    "changedAttributes": function () {},
    "previous": function () {},
    "previousAttributes": function () {},
    "isValid": function () {},
    "_validate": function () {}
};
Backbone.Collection.prototype = {
    "on": function () {},
    "off": function () {},
    "trigger": function () {},
    "bind": function () {},
    "unbind": function () {},
    "model": function () {},
    "initialize": function () {},
    "toJSON": function () {},
    "add": function () {},
    "remove": function () {},
    "get": function () {},
    "getByCid": function () {},
    "at": function () {},
    "sort": function () {},
    "pluck": function () {},
    "reset": function () {},
    "fetch": function () {},
    "create": function () {},
    "parse": function () {},
    "chain": function () {},
    "_reset": function () {},
    "_prepareModel": function () {},
    "_removeReference": function () {},
    "_onModelEvent": function () {},
    "forEach": function () {},
    "each": function () {},
    "map": function () {},
    "reduce": function () {},
    "reduceRight": function () {},
    "find": function () {},
    "detect": function () {},
    "filter": function () {},
    "select": function () {},
    "reject": function () {},
    "every": function () {},
    "all": function () {},
    "some": function () {},
    "any": function () {},
    "include": function () {},
    "contains": function () {},
    "invoke": function () {},
    "max": function () {},
    "min": function () {},
    "sortBy": function () {},
    "sortedIndex": function () {},
    "toArray": function () {},
    "size": function () {},
    "first": function () {},
    "initial": function () {},
    "rest": function () {},
    "last": function () {},
    "without": function () {},
    "indexOf": function () {},
    "shuffle": function () {},
    "lastIndexOf": function () {},
    "isEmpty": function () {},
    "groupBy": function () {}
};
Backbone.Router.prototype = {
    "on": function () {},
    "off": function () {},
    "trigger": function () {},
    "bind": function () {},
    "unbind": function () {},
    "initialize": function () {},
    "route": function () {},
    "navigate": function () {},
    "_bindRoutes": function () {},
    "_routeToRegExp": function () {},
    "_extractParameters": function () {}
};
Backbone.History.prototype = {
    "on": function () {},
    "off": function () {},
    "trigger": function () {},
    "bind": function () {},
    "unbind": function () {},
    "interval": {},
    "getFragment": function () {},
    "start": function () {},
    "stop": function () {},
    "route": function () {},
    "checkUrl": function () {},
    "loadUrl": function () {},
    "navigate": function () {},
    "_updateHash": function () {}
};
Backbone.View.prototype = {
    "on": function () {},
    "off": function () {},
    "trigger": function () {},
    "bind": function () {},
    "unbind": function () {},
    "tagName": {},
    "$": function () {},
    "initialize": function () {},
    "render": function () {},
    "remove": function () {},
    "make": function () {},
    "setElement": function () {},
    "delegateEvents": function () {},
    "undelegateEvents": function () {},
    "_configure": function () {},
    "_ensureElement": function () {}
};
