
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Components/Navbar/Navbar.svelte generated by Svelte v3.16.7 */

    const { console: console_1 } = globals;
    const file = "src/Components/Navbar/Navbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (23:8) {#each navlists as list}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0_value = /*list*/ ctx[1].label + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "nav-link light-color svelte-ab96dq");
    			attr_dev(a, "href", a_href_value = /*list*/ ctx[1].url);
    			add_location(a, file, 24, 12, 812);
    			attr_dev(li, "class", "nav-item svelte-ab96dq");
    			add_location(li, file, 23, 10, 778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlists*/ 1 && t0_value !== (t0_value = /*list*/ ctx[1].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*navlists*/ 1 && a_href_value !== (a_href_value = /*list*/ ctx[1].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:8) {#each navlists as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let nav;
    	let span0;
    	let strong;
    	let t1;
    	let button;
    	let span1;
    	let t2;
    	let div;
    	let ul;
    	let each_value = /*navlists*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			nav = element("nav");
    			span0 = element("span");
    			strong = element("strong");
    			strong.textContent = "aviva miller";
    			t1 = space();
    			button = element("button");
    			span1 = element("span");
    			t2 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(strong, file, 9, 36, 326);
    			set_style(span0, "font-size", "25px");
    			add_location(span0, file, 9, 6, 296);
    			attr_dev(span1, "class", "navbar-toggler-icon");
    			add_location(span1, file, 18, 6, 588);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarNav");
    			attr_dev(button, "aria-controls", "navbarNav");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 10, 4, 367);
    			attr_dev(ul, "class", "navbar-nav ml-auto svelte-ab96dq");
    			add_location(ul, file, 21, 6, 703);
    			attr_dev(div, "class", "collapse navbar-collapse");
    			attr_dev(div, "id", "navbarNav");
    			add_location(div, file, 20, 4, 643);
    			attr_dev(nav, "class", "navbar navbar-expand-md navbar-dark svelte-ab96dq");
    			add_location(nav, file, 8, 2, 240);
    			attr_dev(section, "id", "nav-bar");
    			attr_dev(section, "class", "svelte-ab96dq");
    			add_location(section, file, 7, 0, 215);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, nav);
    			append_dev(nav, span0);
    			append_dev(span0, strong);
    			append_dev(nav, t1);
    			append_dev(nav, button);
    			append_dev(button, span1);
    			append_dev(nav, t2);
    			append_dev(nav, div);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navlists*/ 1) {
    				each_value = /*navlists*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { navlists = [] } = $$props;
    	console.log(navlists);
    	const writable_props = ["navlists"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("navlists" in $$props) $$invalidate(0, navlists = $$props.navlists);
    	};

    	$$self.$capture_state = () => {
    		return { navlists };
    	};

    	$$self.$inject_state = $$props => {
    		if ("navlists" in $$props) $$invalidate(0, navlists = $$props.navlists);
    	};

    	return [navlists];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { navlists: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get navlists() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navlists(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Services/Services.svelte generated by Svelte v3.16.7 */

    const file$1 = "src/Components/Services/Services.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (13:6) {#each SERVICE_LIST as list}
    function create_each_block$1(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let a_href_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = /*list*/ ctx[4].URL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*list*/ ctx[4].LABEL);
    			attr_dev(img, "class", "service-img svelte-1gbh4se");
    			add_location(img, file$1, 14, 45, 538);
    			attr_dev(a, "href", a_href_value = /*list*/ ctx[4].SRC);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 14, 10, 503);
    			attr_dev(div, "class", "col-sm-3 service col-centered svelte-1gbh4se");
    			add_location(div, file$1, 13, 8, 449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(13:6) {#each SERVICE_LIST as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let each_value = /*SERVICE_LIST*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*HEADING*/ ctx[0]}`;
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$1, 10, 4, 352);
    			attr_dev(div0, "class", "row section-body");
    			add_location(div0, file$1, 11, 4, 375);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$1, 9, 2, 312);
    			attr_dev(section, "id", "services");
    			attr_dev(section, "class", "section grey-bgcolor svelte-1gbh4se");
    			add_location(section, file$1, 8, 0, 257);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*SERVICE_LIST*/ 2) {
    				each_value = /*SERVICE_LIST*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { serviceData = {} } = $$props;
    	const { HEADING, ALL_SERVICES, SERVICE_LIST } = serviceData;
    	const writable_props = ["serviceData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("serviceData" in $$props) $$invalidate(2, serviceData = $$props.serviceData);
    	};

    	$$self.$capture_state = () => {
    		return { serviceData };
    	};

    	$$self.$inject_state = $$props => {
    		if ("serviceData" in $$props) $$invalidate(2, serviceData = $$props.serviceData);
    	};

    	return [HEADING, SERVICE_LIST, serviceData];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { serviceData: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get serviceData() {
    		throw new Error("<Services>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set serviceData(value) {
    		throw new Error("<Services>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Services/Recipes.svelte generated by Svelte v3.16.7 */

    const file$2 = "src/Components/Services/Recipes.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (13:6) {#each SERVICE_LIST as list}
    function create_each_block$2(ctx) {
    	let div;
    	let t0_value = /*list*/ ctx[4].LABEL + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "box svelte-8sb4b1");
    			add_location(div, file$2, 13, 8, 446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(13:6) {#each SERVICE_LIST as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let each_value = /*SERVICE_LIST*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*HEADING*/ ctx[0]}`;
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$2, 10, 4, 349);
    			attr_dev(div0, "class", "flex-container svelte-8sb4b1");
    			add_location(div0, file$2, 11, 6, 374);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$2, 9, 2, 309);
    			attr_dev(section, "id", "recipes");
    			attr_dev(section, "class", "section grey-bgcolor svelte-8sb4b1");
    			add_location(section, file$2, 8, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*SERVICE_LIST*/ 2) {
    				each_value = /*SERVICE_LIST*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { recipeData = {} } = $$props;
    	const { HEADING, ALL_SERVICES, SERVICE_LIST } = recipeData;
    	const writable_props = ["recipeData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Recipes> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("recipeData" in $$props) $$invalidate(2, recipeData = $$props.recipeData);
    	};

    	$$self.$capture_state = () => {
    		return { recipeData };
    	};

    	$$self.$inject_state = $$props => {
    		if ("recipeData" in $$props) $$invalidate(2, recipeData = $$props.recipeData);
    	};

    	return [HEADING, SERVICE_LIST, recipeData];
    }

    class Recipes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { recipeData: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recipes",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get recipeData() {
    		throw new Error("<Recipes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set recipeData(value) {
    		throw new Error("<Recipes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/About/About.svelte generated by Svelte v3.16.7 */

    const file$3 = "src/Components/About/About.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let br0;
    	let t1;
    	let h2;
    	let t3;
    	let h4;
    	let t5;
    	let div1;
    	let br1;
    	let t6;
    	let br2;
    	let t7;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Aviva Miller";
    			t3 = space();
    			h4 = element("h4");
    			h4.textContent = "Entertainment Attorney & Executive";
    			t5 = space();
    			div1 = element("div");
    			br1 = element("br");
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			p = element("p");
    			p.textContent = "Under this I will explain and fill in with parts of my bio";
    			if (img.src !== (img_src_value = /*IMAGE_URL*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "img-fluid svelte-9c9d3t");
    			add_location(img, file$3, 11, 8, 440);
    			add_location(br0, file$3, 12, 8, 497);
    			attr_dev(h2, "class", "svelte-9c9d3t");
    			add_location(h2, file$3, 13, 8, 510);
    			attr_dev(h4, "class", "svelte-9c9d3t");
    			add_location(h4, file$3, 14, 8, 540);
    			attr_dev(div0, "class", "col-md-6");
    			set_style(div0, "text-align", "center");
    			add_location(div0, file$3, 10, 6, 382);
    			add_location(br1, file$3, 17, 8, 634);
    			add_location(br2, file$3, 18, 8, 648);
    			add_location(p, file$3, 19, 8, 662);
    			attr_dev(div1, "class", "col-md-6");
    			add_location(div1, file$3, 16, 6, 603);
    			attr_dev(div2, "class", "row section-body");
    			add_location(div2, file$3, 9, 4, 345);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$3, 8, 2, 317);
    			attr_dev(section, "id", "about-us");
    			attr_dev(section, "class", "section grey-bgcolor svelte-9c9d3t");
    			add_location(section, file$3, 7, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(div0, t3);
    			append_dev(div0, h4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, br1);
    			append_dev(div1, t6);
    			append_dev(div1, br2);
    			append_dev(div1, t7);
    			append_dev(div1, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { aboutData = {} } = $$props;
    	const { HEADING, TITLE, IMAGE_URL, WHY_CHOOSE_US_LIST } = aboutData;
    	const writable_props = ["aboutData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("aboutData" in $$props) $$invalidate(1, aboutData = $$props.aboutData);
    	};

    	$$self.$capture_state = () => {
    		return { aboutData };
    	};

    	$$self.$inject_state = $$props => {
    		if ("aboutData" in $$props) $$invalidate(1, aboutData = $$props.aboutData);
    	};

    	return [IMAGE_URL, aboutData];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { aboutData: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get aboutData() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aboutData(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Testimonials/Testimonials.svelte generated by Svelte v3.16.7 */

    const file$4 = "src/Components/Testimonials/Testimonials.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (13:6) {#each TESTIMONIAL_LIST as list}
    function create_each_block$3(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*list*/ ctx[3].DESCRIPTION + "";
    	let t0;
    	let t1;
    	let p1;
    	let b;
    	let t2_value = /*list*/ ctx[3].NAME + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			b = element("b");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(p0, file$4, 14, 10, 510);
    			add_location(b, file$4, 16, 12, 583);
    			attr_dev(p1, "class", "user-details svelte-yjy5gi");
    			add_location(p1, file$4, 15, 10, 546);
    			attr_dev(div, "class", "col-md-5 testimonial svelte-yjy5gi");
    			add_location(div, file$4, 13, 8, 465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, b);
    			append_dev(b, t2);
    			append_dev(div, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(13:6) {#each TESTIMONIAL_LIST as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let each_value = /*TESTIMONIAL_LIST*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*HEADING*/ ctx[0]}`;
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "title text-center");
    			add_location(h2, file$4, 10, 4, 329);
    			attr_dev(div0, "class", "row offset-1 section-body");
    			add_location(div0, file$4, 11, 4, 378);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$4, 9, 2, 301);
    			attr_dev(section, "id", "testimonials");
    			attr_dev(section, "class", "section svelte-yjy5gi");
    			add_location(section, file$4, 8, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*TESTIMONIAL_LIST*/ 2) {
    				each_value = /*TESTIMONIAL_LIST*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { testimonialData = {} } = $$props;
    	const { HEADING, TESTIMONIAL_LIST } = testimonialData;
    	const writable_props = ["testimonialData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testimonials> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("testimonialData" in $$props) $$invalidate(2, testimonialData = $$props.testimonialData);
    	};

    	$$self.$capture_state = () => {
    		return { testimonialData };
    	};

    	$$self.$inject_state = $$props => {
    		if ("testimonialData" in $$props) $$invalidate(2, testimonialData = $$props.testimonialData);
    	};

    	return [HEADING, TESTIMONIAL_LIST, testimonialData];
    }

    class Testimonials extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { testimonialData: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonials",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get testimonialData() {
    		throw new Error("<Testimonials>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set testimonialData(value) {
    		throw new Error("<Testimonials>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Footer/Footer.svelte generated by Svelte v3.16.7 */

    const file$5 = "src/Components/Footer/Footer.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			div.textContent = "Aviva Miller, Esq. ● avivamf@gmail.com ● 516.635.2100";
    			attr_dev(div, "class", "container svelte-b5wec");
    			add_location(div, file$5, 7, 2, 204);
    			attr_dev(section, "class", "footerbg svelte-b5wec");
    			attr_dev(section, "id", "footer");
    			add_location(section, file$5, 6, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const HEADER = "Aviva Miller";

    const NAVBAR_DATA = [
      { id: 4, url: "#about-us", label: "About" },
      { id: 3, url: "#services", label: "Services" },
      { id: 5, url: "#testimonials", label: "Testimonials" },
    ];

    const BANNER_DATA = {
      HEADING: "Go digital with nixalar",
      DECRIPTION: "Board Certified Rheumatologist with local hospital privileges. Practicing in South Florida for over 20 years."
    };

    const SERVICE_DATA = {
      HEADING: "Non-Profit Executive, Consultant & Fundraiser",
      ALL_SERVICES: "All Services",
      SERVICE_LIST: [
        {
          URL: "images/gold_coast.jpg",
          SRC: "https://goldcoastarts.org/film10/",
        },
        {
          URL: "images/ccfp.jpg",
          SRC: "https://www.creativecommunityforpeace.com/"
        },
        {
          URL: "images/NYTF_logo.jpg",
          SRC: "https://nytf.org/"
        },
        {
          URL: "images/jafi.jpg",
          SRC: "https://www.jewishagency.org/"
        }
      ]
    };

    const RECIPE_DATA = {
      HEADING: "Non-Profit Executive, Consultant & Fundraiser",
      ALL_SERVICES: "All Services",
      SERVICE_LIST: [
        {
          LABEL: "Tree of Life Synagogue"
        },
        {
          LABEL: "Yad Vashem"
        },
        {
          LABEL: "Bnai Zion Medical Center"
        }
      ]
    };

    const ABOUT_DATA = {
      HEADING: "Aviva Miller",
      TITLE: "Why we're different",
      IMAGE_URL: "images/avivamiller.jpg",
      WHY_CHOOSE_US_LIST: [
        "We provides Cost-Effective Digital Marketing than Others.",
        "High customer statisfaction and experience.",
        "Marketing efficiency and quick time to value.",
        "Clear & transparent fee structure.",
        "We provides Marketing automation which is an integral platform that ties all of your digital marketing together.",
        "A strong desire to establish long lasting business partnerships.",
        "Provide digital marketing to mobile consumer.",
        "We provides wide range to services in reasonable prices"
      ]
    };
    const TESTIMONIAL_DATA = {
      HEADING: "Testimonials",
      TESTIMONIAL_LIST: [
        {
          DESCRIPTION:
            "Testimonal 1",
          IMAGE_URL: "images/user1.jpg",
          URL: "",
          NAME: "Mike"

        },
        {
          DESCRIPTION:
            "Testimonal 2",
          IMAGE_URL: "images/user2.jpg",
          URL: "",
          NAME: "Wendy"
        }
      ]
    };

    const SOCIAL_DATA = {
      HEADING: "Find us on social media",
      IMAGES_LIST: [
        "images/front.png",
        "images/inside.png",
        "images/waitingroom.jpeg",
      ]
    };

    const FOOTER_DATA = {
      DESCRIPTION:
        "We are typically focused on result-based maketing in the digital world. Also, we evaluate your brand’s needs and develop a powerful strategy that maximizes profits.",
      CONTACT_DETAILS: {
        HEADING: "Contact us",
        ADDRESS: "La trobe street docklands, Melbourne",
        MOBILE: "+1 61234567890",
        EMAIL: "nixalar@gmail.com"
      },
      SUBSCRIBE_NEWSLETTER: "Subscribe newsletter",
      SUBSCRIBE: "Subscribe"
    };

    const MOCK_DATA = {
      HEADER,
      NAVBAR_DATA,
      BANNER_DATA,
      SERVICE_DATA,
      ABOUT_DATA,
      TESTIMONIAL_DATA,
      SOCIAL_DATA,
      FOOTER_DATA,
      RECIPE_DATA
    };

    /* src/App.svelte generated by Svelte v3.16.7 */

    function create_fragment$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const navbar = new Navbar({
    			props: {
    				navlists: MOCK_DATA.NAVBAR_DATA,
    				header: MOCK_DATA.HEADER
    			},
    			$$inline: true
    		});

    	const about = new About({
    			props: { aboutData: MOCK_DATA.ABOUT_DATA },
    			$$inline: true
    		});

    	const services = new Services({
    			props: { serviceData: MOCK_DATA.SERVICE_DATA },
    			$$inline: true
    		});

    	const recipes = new Recipes({
    			props: { recipeData: MOCK_DATA.RECIPE_DATA },
    			$$inline: true
    		});

    	const testimonials = new Testimonials({
    			props: { testimonialData: MOCK_DATA.TESTIMONIAL_DATA },
    			$$inline: true
    		});

    	const footer = new Footer({
    			props: {
    				footerData: MOCK_DATA.FOOTER_DATA,
    				header: MOCK_DATA.HEADER
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(services.$$.fragment);
    			t2 = space();
    			create_component(recipes.$$.fragment);
    			t3 = space();
    			create_component(testimonials.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(about, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(services, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(recipes, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(testimonials, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(recipes.$$.fragment, local);
    			transition_in(testimonials.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(recipes.$$.fragment, local);
    			transition_out(testimonials.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(about, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(services, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(recipes, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(testimonials, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
