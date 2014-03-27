(function(g) {
  var __bem_xjst = (function(exports) {
     /// -------------------------------------
/// ---------- Bootstrap start ----------
/// -------------------------------------
var __$$globalCtx = {"mode":"","block":"","elem":"","elemMods":null,"mods":null};
function run(templates, context) {
  var ignore = context.$ignore;
  var globalCtx = __$$globalCtx;
  if (!ignore) {
    context.$ignore = [];
    ignore = context.$ignore;
  }

  var index = 0;
  var currentId = null;
  var last = null;

  function template() {
    var id = index++;
    var match = !context.$override &&
                Array.prototype.every.call(arguments, function(cond) {
      try {
        return typeof cond === 'function' ? cond.call(context) : cond;
      } catch (e) {
        if (/Cannot read property/.test(e.message))
          return false;
      }
    });

    // Respect applyNext
    if (match && ignore.indexOf(id) !== -1) match = false;

    // Ignore body if match failed
    if (!match) return function() {};

    // Set current id
    currentId = id;

    return function bodyHandler(body) {
      last = {
        id: id,
        body: typeof body === 'function' ? body.bind(context)
                                         : function() { return body }
      };

      return null;
    };
  };

  function local() {
    var backup = [];
    var args = Array.prototype.slice.call(arguments);

    args.forEach(function(change) {
      if (change === null)
        return;

      Object.keys(change).forEach(function(key) {
        var parts = key.split('.'),
            newValue = change[key],
            oldValue,
            isGlobal = parts[0] === '$$global',
            subContext = isGlobal ? globalCtx : context;

        if (isGlobal) {
          parts.shift();
        }

        // Dive inside
        for (var i = 0; i < parts.length - 1; i++) {
          subContext = subContext[parts[i]];
        }

        // Set property and remember old value
        oldValue = subContext[parts[i]];
        subContext[parts[i]] = newValue;

        // Push old value to backup list
        backup.push({
          isGlobal: isGlobal,
          key: parts,
          value: oldValue
        });
      });
    });

    return function bodyHandler(body) {
      var result = typeof body === 'function' ? body.call(context) : body;

      // Rollback old values
      for (var i = backup.length - 1; i >= 0; i--) {
        var subContext = backup[i].isGlobal ? globalCtx : context,
            change = backup[i];

        // Dive inside
        for (var j = 0; j < change.key.length - 1; j++) {
          subContext = subContext[change.key[j]];
        }

        // Restore value
        subContext[change.key[j]] = change.value;
      }

      return result;
    };
  };

  function apply() {
    return local.apply(this, arguments)(function() {
      return run(templates, context);
    });
  };

  function applyNext() {
    return local.apply(this, arguments)(function() {
      var len = ignore.push(currentId);
      var ret = run(templates, context);
      if (len === ignore.length)
        ignore.pop();
      return ret;
    });
  };

  function oninit(cb) {
    if (context.$init) {
      if (context.$context && !context.$context.resetApplyNext) {
        context.$context.resetApplyNext = function(context) {
          context.$ignore.length = 0;
        };
      }

      cb(exports, context.$context);
    }
  }

  function fetch(name) {
    var parts = name.split('.'),
        value = globalCtx;

    // Dive inside
    for (var i = 0; i < parts.length; i++) {
      value = value[parts[i]];
    }

    return value;
  }

  function set(name, val) {
    var parts = name.split('.'),
        value = globalCtx;

    // Dive inside
    for (var i = 0; i < parts.length - 1; i++) {
      value = value[parts[i]];
    }
    value[parts[i]] = val;

    return value;
  };

  templates.call(context, template, local, apply, applyNext, oninit, fetch,
                 set);

  if (!last) {
    if (context.$init) return;
    throw new Error('Match failed');
  }

  return last.body();
};
exports.apply = function apply(ctx) {
  try {
    return applyc(ctx || this);
  } catch (e) {
    e.xjstContext = ctx || this;
    throw e;
  }
};function applyc(ctx) {
  return run(templates, ctx);
};
try {
  applyc({
    $init: true,
    $exports: exports,
    $context: {
      recordExtensions: function() {}
    }
  });
} catch (e) {
  // Just ignore any errors
}
function templates(template, local, apply, applyNext, oninit, __$$fetch, __$$set) {
/// -------------------------------------
/// ---------- Bootstrap end ------------
/// -------------------------------------

/// -------------------------------------
/// ---------- User code start ----------
/// -------------------------------------
/// -------------------------------------
/// --------- BEM-XJST Runtime Start ----
/// -------------------------------------

  var __$that = this,
      __$blockRef = {},
      __$elemRef = {},
      __$queue = [];

  // Called after all matches
  function __$flush() {
    __$queue.filter(function(item) {
      return !item.__$parent;
    }).forEach(function(item) {
      function apply(conditions, item) {
        if (item && item.__$children) {
          // Sub-template
          var subcond = conditions.concat(item.__$cond);
          item.__$children.forEach(function(child) {
            apply(subcond, child);
          });
        } else {
          var hasBlock = false;
          var hasElem = false;
          conditions = conditions.filter(function(cond) {
            if (cond === __$blockRef) {
              hasBlock = true;
              return false;
            }
            if (cond === __$elemRef) {
              hasElem = true;
              return false;
            }
            return true;
          });
          if (hasBlock && !hasElem) conditions.push(!__$that.elem);

          // Body
          template.apply(null, conditions)(item);
        }
      }
      apply([], item);
    });
  };

  // Matching
  function match() {
    function fn() {
      var args = Array.prototype.slice.call(arguments);

      args.forEach(function(arg) {
        if (arg && arg.__$children) {
          // Sub-template
          arg.__$parent = fn;
        }
        fn.__$children.push(arg);
      });

      // Handle match().match()
      var res = fn;
      while (res.__$parent) res = res.__$parent;
      return res;
    };
    __$queue.push(fn);
    fn.__$children = [];
    fn.__$parent = null;
    fn.__$cond = Array.prototype.slice.call(arguments);

    fn.match = match;
    fn.elemMatch = elemMatch;
    fn.block = block;
    fn.elem = elem;
    fn.mode = mode;
    fn.mod = mod;
    fn.elemMod = elemMod;
    fn.def = def;
    fn.tag = tag;
    fn.attrs = attrs;
    fn.cls = cls;
    fn.js = js;
    fn.jsAttr = jsAttr;
    fn.bem = bem;
    fn.mix = mix;
    fn.content = content;

    // match().match()
    if (this && this.__$children) {
      this.__$children.push(fn);
      fn.__$parent = this;
    }

    return fn;
  };

  function block(name) {
    return match.call(this, __$blockRef, __$that.block === name);
  };

  function elemMatch() {
    var args = Array.prototype.slice.call(arguments);
    return match.apply(this, [__$elemRef].concat(args));
  }

  function elem(name) {
    return match.call(this, __$elemRef, __$that.elem === name);
  };

  function mode(name) {
    return match.call(this, __$that._mode === name);
  };

  function mod(name, value) {
    return match.call(this, __$that.mods, function() {
      return __$that.mods[name] === value;
    });
  }

  function elemMod(name, value) {
    return match.call(this, __$that.elemMods, function() {
      return __$that.elemMods[name] === value;
    });
  }

  function def() { return mode.call(this, 'default'); };
  function tag() { return mode.call(this, 'tag'); };
  function attrs() { return mode.call(this,'attrs'); };
  function cls() { return mode.call(this, 'cls'); };
  function js() { return mode.call(this, 'js'); };
  function jsAttr() { return mode.call(this, 'jsAttr'); };
  function bem() { return mode.call(this, 'bem'); };
  function mix() { return mode.call(this, 'mix'); };
  function content() { return mode.call(this, 'content'); };

  // Apply by mode, local by mode and applyCtx
  apply = function(apply) {
    return function bemApply() {
      var args = Array.prototype.map.call(arguments, function(arg) {
        if (typeof arg === 'string') {
          return { _mode: arg };
        } else {
          return arg;
        }
      });
      return apply.apply(null, args);
    };
  }(apply);

  applyNext = function(applyNext) {
    return function bemApplyNext() {
      var args = Array.prototype.map.call(arguments, function(arg) {
        if (typeof arg === 'string') {
          return { _mode: arg };
        } else {
          return arg;
        }
      });
      return applyNext.apply(null, args);
    };
  }(applyNext);

  local = function(local) {
    return function bemLocal() {
      var args = Array.prototype.map.call(arguments, function(arg) {
        if (typeof arg === 'string') {
          return { _mode: arg };
        } else {
          return arg;
        }
      });
      return local.apply(null, args);
    };
  }(local);

  function applyCtx() {
    var context = arguments[arguments.length - 1];
    var rest = Array.prototype.slice.call(arguments, 0, -1);
    return applyNext.apply(this, [{ _mode: '', ctx: context }].concat(rest));
  };
;
;
/// -------------------------------------
/// --------- BEM-XJST Runtime End ------
/// -------------------------------------

/// -------------------------------------
/// ------ BEM-XJST User-code Start -----
/// -------------------------------------
var log = function() {}; //console.error.bind(console);

match(!this.jsdocType)(function() {
    log('⇢ ANY');
    return '';
});

match(this.jsdocType === 'root')(
    function() {
        // Fallback if no modules exports
        return '';
    },
    match(this.modules)(function() {
        var res = '';

        local({ depth : 0 })(function() {
            this.modules.forEach(function(ctx) {
                res += apply({ depth : this.depth + 1, modules : undefined }, ctx);
            }, this);
        });

        return res;
    }),
    function() {
        log('⇢ root');
        return applyNext();
    }
);

match(this.jsdocType === 'module')(function() {
    log('⇢ module', '@depth', this.depth);

    var name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : this.depth }, content : name });

    local({
        _moduleName : this.name,
        _moduleDesc : this.description,
        name : undefined,
        description : undefined,
        depth : this.depth + 1
    })(function() {
        var _res = '';

        this._moduleDesc && (_res += apply({ block : 'para', content : this._moduleDesc }));
        this.exports && (_res += apply(this.exports));

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'class')(function() {
    log('⇢ class', '@depth', this.depth);

    var depth = this.depth,
        classSign = apply('signature'),
        res = apply({ block : 'headline', mods : { level : depth++ }, content : classSign });

    var cons = this.cons,
        clsAugments = this.augments,
        clsProto = this.proto,
        clsStatic = this.static,
        clsMembers = this.members;

    if(clsAugments) {
        var augmentsJsType = clsAugments.jsType;
        res += apply({
            block : 'para',
            content : 'Aughtments ' +
                (Array.isArray(augmentsJsType)?
                    augmentsJsType.join(' | ') :
                    augmentsJsType)
        });
    }

    this.description && (res += apply({ block : 'para', content : this.description }));

    if(cons) {
        // TODO: constructor's description is the same as Function's
        local({ depth : depth })(function() {
            var _res = '',
                depth = this.depth,
                consSign = apply('signature', { name : this.name }, cons);

            _res += apply({ block : 'headline', mods : { level : depth++ }, content : 'Constructor' });
            _res += apply({ block : 'headline', mods : { level : depth++ }, content : consSign });

            if(cons.params) {
                _res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
                cons.params.forEach(function(ctx) { _res += apply({ params : undefined }, ctx) });
                _res += '\n'
            }

            res += _res;
        });
    }

    local({ depth : depth })(function() {
        var _res = '',
            depth = this.depth;

        if(clsMembers) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Properties:' });
            _res += apply(clsMembers, { depth : depth + 1 });
        }

        if(clsProto) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Methods:' });
            _res += apply(clsProto, { depth : depth + 1 });
        }

        if(clsStatic) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Static:' });
            _res += apply(clsStatic, { depth : depth + 1 });
        }

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'type')(
    match(this.jsType)(
        function() {
            var res = '';

            if(this.jsType !== 'Function') {
                // `Function`'s signature will be processed within `jsType === 'Function'`
                var objectSign = apply('signature');
                res += apply({ block : 'headline', mods : { level : this.depth }, content : objectSign });
            }

            this.description &&
                (res += apply({ block : 'para', content : this.description }));

            this.jsValue &&
                (res += apply({ block : 'para', content : 'Value: "' + this.jsValue + '"' }));

            return res;
        },
        match(function() { return this.classes && this.classes.hasOwnProperty(this.jsType) })(function() {
            log('⇢ type (custom classes)', this.jsType, '@depth', this.depth);
            return apply(this.classes[this.jsType]);
        })
    ),
    match(this.jsType === 'Object', this.props)(function() {
        var res = '';

        this.props.forEach(function(ctx) {
            local({ props : undefined })(function() {
                var val = ctx.val,
                    valJsdocType = val.jsdocType;

                if(valJsdocType === 'class') {
                    res += apply(val);
                    return;
                }

                res += apply({ name : ctx.key }, val);
            });
        });

        return res;
    }),
    match(this.jsType === 'Function')(function() {
        var res = '',
            funcSing = apply('signature');

        res += apply({ block : 'headline', mods : { level : this.depth }, content : funcSing });

        this.description && (res += apply({ block : 'para', content : this.description }));

        var params = this.params,
            returns = this.returns,
            depth = this.depth + 1;

        if(params) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
            params.forEach(function(ctx) { res += apply({ params : undefined }, ctx) });
            res += '\n';
        }

        if(returns) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Returns:' });
            res += apply(returns);
        }

        return res;
    }),
    function() {
        log('⇢ type', this.jsType, '@depth', this.depth);
        return applyNext();
    }
);

match(this.jsdocType === 'param')(
    match(this.jsType)(function() {
        var name = apply('jstype-name'),
            type = apply('jstype-type');
        return name + ' ' + type;
    }),
//    match(this.jsType === 'Function')(function() {
//        // TODO: proper function's signature, e.g. `Function(filePath)`
//        return local({ name : undefined })(apply('signature'));
//    }),
    function() {
        log('⇢ param', this.jsType, '@depth', this.depth);

        var res = applyNext();
        this.description && (res += '<br/>\n  ' + this.description);

        return apply({ block : 'ulist', content : res });
    }
);

match(this.jsdocType === 'returns')(function() {
    log('⇢ returns', '@depth', this.depth);

    var jsType = this.jsType,
        res = apply({ block : 'para', content : Array.isArray(jsType)? jsType.join(' | ') : jsType });

    this.description &&
        (res += apply({ block : 'para', content : this.description }));

    return res;
});

// ---

match(this._mode === 'signature')(
    match(this.jsdocType === 'module')(function() {
        return this.name + ' Module';
    }),
    match(this.jsdocType === 'class')(function() {
        return this.name + ' Class';
    }),
    match(this.jsdocType === 'param')(function() {
        return apply('jstype-name');
    }),
    match(this.jsdocType === 'returns')(function() {
        return apply('jstype-type');
    }),
    match(this.jsdocType === 'type')(
        match(this.jsType)(function() {
            var res = apply('jstype-name') || '',
                type = apply('jstype-type'),
                access = apply('jstype-access'),
                readonly = apply('jstype-readonly');

            return res +
                (type? ' ' + type : '') +
                (access? '  ' + access : '') +
                (readonly? '  ' + readonly : '');
        }),
        match(this.jsType === 'Function')(function() {
            var res;

            Array.isArray(this.params) &&
                (res = this.params.map(function(ctx) {
                    return apply('signature', { params : undefined }, ctx);
                }).join(', '));

            res = (this.name || '\<Function\>') + ' (' + (res? ' ' + res + ' ' : '') + ')';

            this.returns && (res += ' → ' + apply('signature', this.returns, { name : undefined }));

            var access = apply('jstype-access'),
                readonly = apply('jstype-readonly');

            return res +
                (access? '  ' + access : '') +
                (readonly? '  ' + readonly : '');
        })
    ),
    function() {
        log('⇢', this.jsdocType, '(signature)', '@depth', this.depth);
        return applyNext();
    }
);

match(this._mode === 'jstype')(function() {
    log('⇢ (jstype)');
    return apply('jstype-type') + ' ' + apply('jstype-name');
});

match(this._mode === 'jstype-name')(function() {
    log('⇢ (jstype / name)');

    if(!this.name) return '\<Type\>';

    var res = this.name;

    this.default && (res = res + '=' + this.default);
    this.isOptional && (res = '[' + res + ']');

    return res;
});

match(this._mode === 'jstype-type')(function() {
    log('⇢ (jstype / type)');

    var jsType = this.jsType;
    return jsType?
        '{' + (Array.isArray(jsType)? jsType.join(' | ') : jsType) + '}' :
        '';
});

match(this._mode === 'jstype-access')(function() {
    log('⇢ (jstype / access)');
    return this.accessLevel;
});

match(this._mode === 'jstype-readonly')(function() {
    log('⇢ (jstype / readonly)');
    return this.isReadOnly? '(readonly)' : '';
});

// ---

block('headline')(
    function() { return apply({ block : 'bold', content : this.content }) + '\n\n' },
    mod('level', 1)(function() { return '# ' + this.content + '\n\n' }),
    mod('level', 2)(function() { return '## ' + this.content + '\n\n' }),
    mod('level', 3)(function() { return '### ' + this.content + '\n\n' }),
    mod('level', 4)(function() { return '#### ' + this.content + '\n\n' }),
    mod('level', 5)(function() { return '##### ' + this.content + '\n\n' }),
    mod('level', 6)(function() { return '###### ' + this.content + '\n\n' })
);

block('para')(function() { return this.content + '\n\n' });

block('bold')(function() { return '**' + this.content + '**' });

block('italic')(function() { return '*' + this.content + '*' });

block('link')(function() {
    var res = this.url;
    this.content && (res = '[' + this.content + '](' + res + ')');
    return res;
});

block('ulist')(function() {
    return '* ' + this.content + '\n';
});

block('olist')(function() {
    return '1. ' + this.content + '\n';
});

block('code')(function() {
    return '`' + this.content + '`';
});
;
/// -------------------------------------
/// ------ BEM-XJST User-code End -------
/// -------------------------------------
__$flush();
/// -------------------------------------
/// ---------- User code end ------------
/// -------------------------------------
};;
     return exports;
  })({});
  var defineAsGlobal = true;
  if(typeof exports === "object") {
    exports["JSDTMD"] = __bem_xjst;
    defineAsGlobal = false;
  }
  if(typeof modules === "object") {
    modules.define("JSDTMD",
                   function(provide) { provide(__bem_xjst) });
    defineAsGlobal = false;
  }
  defineAsGlobal && (g["JSDTMD"] = __bem_xjst);
})(this);

