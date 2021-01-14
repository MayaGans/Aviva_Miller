
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
    			attr_dev(a, "class", "nav-link light-color svelte-jrc4xe");
    			attr_dev(a, "href", a_href_value = /*list*/ ctx[1].url);
    			add_location(a, file, 24, 12, 812);
    			attr_dev(li, "class", "nav-item svelte-jrc4xe");
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
    			attr_dev(ul, "class", "navbar-nav ml-auto svelte-jrc4xe");
    			add_location(ul, file, 21, 6, 703);
    			attr_dev(div, "class", "collapse navbar-collapse");
    			attr_dev(div, "id", "navbarNav");
    			add_location(div, file, 20, 4, 643);
    			attr_dev(nav, "class", "navbar navbar-expand-md navbar-dark svelte-jrc4xe");
    			add_location(nav, file, 8, 2, 240);
    			attr_dev(section, "id", "nav-bar");
    			attr_dev(section, "class", "svelte-jrc4xe");
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
    			attr_dev(img, "class", "service-img svelte-1e3dy8h");
    			add_location(img, file$1, 14, 45, 538);
    			attr_dev(a, "href", a_href_value = /*list*/ ctx[4].SRC);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 14, 10, 503);
    			attr_dev(div, "class", "col-sm-3 service col-centered svelte-1e3dy8h");
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

    			attr_dev(h2, "class", "svelte-1e3dy8h");
    			add_location(h2, file$1, 10, 4, 352);
    			attr_dev(div0, "class", "row section-body");
    			add_location(div0, file$1, 11, 4, 375);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$1, 9, 2, 312);
    			attr_dev(section, "id", "services");
    			attr_dev(section, "class", "section grey-bgcolor svelte-1e3dy8h");
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

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:10) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*list*/ ctx[4].IMG)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1panb9o");
    			add_location(img, file$2, 26, 12, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(26:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:10) {#if list.VIDEO }
    function create_if_block(ctx) {
    	let t;
    	let br;
    	let each_value_1 = /*list*/ ctx[4].VIDEO;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			br = element("br");
    			add_location(br, file$2, 24, 10, 830);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*SERVICE_LIST*/ 2) {
    				each_value_1 = /*list*/ ctx[4].VIDEO;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:10) {#if list.VIDEO }",
    		ctx
    	});

    	return block;
    }

    // (22:10) {#each list.VIDEO as video}
    function create_each_block_1(ctx) {
    	let video;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			attr_dev(video, "class", "videoInsert svelte-1panb9o");
    			video.controls = "controls";
    			attr_dev(video, "name", "Video Name");
    			if (video.src !== (video_src_value = /*video*/ ctx[7])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "type", "video/mp4");
    			add_location(video, file$2, 22, 10, 699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(22:10) {#each list.VIDEO as video}",
    		ctx
    	});

    	return block;
    }

    // (15:6) {#each SERVICE_LIST as list}
    function create_each_block$2(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let t0_value = /*list*/ ctx[4].LABEL + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*list*/ ctx[4].VIDEO) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			if_block.c();
    			t2 = space();
    			attr_dev(span, "class", "svelte-1panb9o");
    			add_location(span, file$2, 17, 10, 550);
    			attr_dev(div0, "class", "card-header svelte-1panb9o");
    			add_location(div0, file$2, 16, 8, 514);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$2, 19, 8, 599);
    			attr_dev(div2, "class", "card svelte-1panb9o");
    			add_location(div2, file$2, 15, 6, 487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if_block.m(div1, null);
    			append_dev(div2, t2);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(15:6) {#each SERVICE_LIST as list}",
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

    			add_location(h2, file$2, 12, 4, 392);
    			attr_dev(div0, "class", "flex-container svelte-1panb9o");
    			add_location(div0, file$2, 13, 6, 417);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$2, 11, 2, 352);
    			attr_dev(section, "id", "recipes");
    			attr_dev(section, "class", "section grey-bgcolor svelte-1panb9o");
    			add_location(section, file$2, 10, 0, 298);
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
    	let br3;
    	let br4;
    	let t8;
    	let br5;
    	let br6;
    	let t9;
    	let br7;
    	let br8;
    	let t10;

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
    			t7 = text("\n          Aviva Miller is an entertainment attorney with over 25 years of experience in film,\ntelevision, theatre, and live event production. She is currently utilizing her creative talent\nin the development of several TV and Film projects in addition to consulting and\nfundraising for non-profit organizations. In recent years, Aviva has worked as a top-level\nexecutive building the brands of several new and iconic entertainment-related non-profit\ninstitutions including Creative Community for Peace, Jewish Agency For Israel, National\nYiddish Theatre Folksbiene and the Gold Coast International Film Festival.  \n\nPreviously, Ms. Miller was Of Counsel to the law firm of Daniel, Siegel and Bimbler,\nLLP, which concentrated its practice in all aspects of entertainment law.  Ms. Miller\nacted as a legal advisor to filmmakers and film productions, television\nproducers, theatrical producers and Broadway productions, recording artists,\nwriters, concert promoters.  \n");
    			br3 = element("br");
    			br4 = element("br");
    			t8 = text("\nPrior to her tenure at Daniel, Siegel and Bimbler, Ms. Miller headed creative\ndevelopment for Moonglow Entertainment and served as Executive in Charge of\nProduction for two independently produced television series that aired on major\nnetworks. \n");
    			br5 = element("br");
    			br6 = element("br");
    			t9 = text("\nAt Radio City Music Hall Productions, Aviva was Senior Attorney of Business Affairs,\nwhere she joined the production team to advise, negotiate and draft agreements for\nmajor theatricals, including The Radio City Music Hall Christmas Spectacular, The\nRockettes,\nConcert Series and other Special Events including the MTV Video Music Awards, The\nGrammy Awards, Comic Relief, two Super Bowl Half-Time Shows and the World Cup\nSoccer Closing Ceremony.\n");
    			br7 = element("br");
    			br8 = element("br");
    			t10 = text("\nMs. Miller began her legal career on Wall Street as an Associate in the Structured\nFinance Group of Cadwalader, Wickersham & Taft.  She attended Cardozo School of\nLaw, is admitted to practice in New York, and is a member of the Bar of the Supreme\nCourt of the United States.  Ms. Miller has served on the boards of several non-\nprofits and has been honored for her charitable work. Aviva speaks fluent Hebrew and\nlived in Israel for 3+ years.");
    			if (img.src !== (img_src_value = /*IMAGE_URL*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "img-fluid svelte-pwcej2");
    			add_location(img, file$3, 12, 8, 435);
    			add_location(br0, file$3, 13, 8, 492);
    			attr_dev(h2, "class", "svelte-pwcej2");
    			add_location(h2, file$3, 14, 8, 505);
    			attr_dev(h4, "class", "svelte-pwcej2");
    			add_location(h4, file$3, 15, 8, 535);
    			set_style(div0, "text-align", "center");
    			set_style(div0, "display", "inline");
    			add_location(div0, file$3, 11, 6, 379);
    			add_location(br1, file$3, 19, 8, 651);
    			add_location(br2, file$3, 20, 8, 665);
    			add_location(br3, file$3, 34, 0, 1637);
    			add_location(br4, file$3, 34, 4, 1641);
    			add_location(br5, file$3, 39, 0, 1891);
    			add_location(br6, file$3, 39, 4, 1895);
    			add_location(br7, file$3, 47, 0, 2346);
    			add_location(br8, file$3, 47, 4, 2350);
    			set_style(div1, "display", "inline");
    			set_style(div1, "line-height", "2");
    			add_location(div1, file$3, 18, 6, 599);
    			attr_dev(div2, "class", "section-body svelte-pwcej2");
    			add_location(div2, file$3, 9, 4, 345);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$3, 8, 2, 317);
    			attr_dev(section, "id", "about-us");
    			attr_dev(section, "class", "section grey-bgcolor svelte-pwcej2");
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
    			append_dev(div1, br3);
    			append_dev(div1, br4);
    			append_dev(div1, t8);
    			append_dev(div1, br5);
    			append_dev(div1, br6);
    			append_dev(div1, t9);
    			append_dev(div1, br7);
    			append_dev(div1, br8);
    			append_dev(div1, t10);
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
    	let br0;
    	let t2;
    	let p1;
    	let b;
    	let t3_value = /*list*/ ctx[3].NAME + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = /*list*/ ctx[3].TITLE + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			p1 = element("p");
    			b = element("b");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			add_location(p0, file$4, 14, 10, 492);
    			add_location(br0, file$4, 15, 10, 528);
    			attr_dev(b, "class", "bigger svelte-1yr80ew");
    			add_location(b, file$4, 17, 12, 580);
    			add_location(br1, file$4, 18, 12, 626);
    			attr_dev(p1, "class", "user-details svelte-1yr80ew");
    			add_location(p1, file$4, 16, 10, 543);
    			attr_dev(div, "class", "testimonial svelte-1yr80ew");
    			add_location(div, file$4, 13, 8, 456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, b);
    			append_dev(b, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div, t7);
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

    			attr_dev(h2, "class", "title text-center svelte-1yr80ew");
    			add_location(h2, file$4, 10, 4, 329);
    			attr_dev(div0, "class", "row section-body");
    			add_location(div0, file$4, 11, 4, 378);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$4, 9, 2, 301);
    			attr_dev(section, "id", "testimonials");
    			attr_dev(section, "class", "section svelte-1yr80ew");
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
    			attr_dev(div, "class", "container svelte-29on80");
    			add_location(div, file$5, 7, 2, 204);
    			attr_dev(section, "class", "footerbg svelte-29on80");
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
      { id: 5, url: "#footer", label: "Contact" },
    ];

    const BANNER_DATA = {
      HEADING: "Go digital with nixalar",
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
      HEADING: "Non-Profit Consulting",
      ALL_SERVICES: "All Services",
      SERVICE_LIST: [
        {
          LABEL: "Tree of Life Synagogue",
          SRC: "https://www.treeoflifepgh.org/",
          IMG: "images/tols.png"
        },
        {
          LABEL: "American Society for Yad Vashem",
          SRC: "https://www.yadvashem.org/",
          VIDEO: ["images/Video1.mov", "images/Video2.mov"]
        },
        {
          LABEL: "Bnai Zion Medical Center",
          SRC: "https://www.b-zion.org.il/default_e.aspx",
          IMG: "images/bzmc.png"

        }
      ]
    };

    const ABOUT_DATA = {
      HEADING: "Aviva Miller",
      TITLE: "Why we're different",
      IMAGE_URL: "images/avivamiller.jpg"
    };

    const TESTIMONIAL_DATA = {
      HEADING: "Testimonials",
      TESTIMONIAL_LIST: [
        {
          DESCRIPTION:
            "You'll find in Aviva one of the most fearless door-openers and connectors. We met when we both worked on the Fundraising Team at The Jewish Agency for Israel. Aviva is based in NYC and appears to know or have a connection to everyone significant in NY and beyond. The same goes for the entertainment industry where she is deeply connected. She is an innovative event planner and thinks big. Her energy is contagious. She was always generous in sharing her contacts with me and believes in win-win partnerships.",
          IMAGE_URL: "images/user1.jpg",
          URL: "",
          NAME: "Michael Lawrence",
          TITLE: "Chief Development Officer of The Jewish Agency For Israel"

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
