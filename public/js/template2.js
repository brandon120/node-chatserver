/**
 * Template v2.0.1
 * https://github.com/Voliware/Template2
 * By Anthony Agostino - anthagostino|at|gmail[dot]com
 * GPL 3.0 license
 */

 // helpers

/**
 * Set all properties of an object from
 * another object, if both objects have
 * matching properties.
 * @param {object} obj - the object to alter
 * @param {object} data - an object of data
 * @return {object} the original object
 */
Object.setProperties = function(obj, data){
    for(let k in data){
        if(obj.hasOwnProperty(k)){
            obj[k] = data[k];
        }
    }
    return obj;
}

/**
 * Check if an object is empty
 * @param {object} obj - the object to check
 * @return {boolean}
 */
Object.isEmpty = function(obj){
    return !Object.keys(obj).length;
}

/**
 * Extends an object into another
 * @return {object}
 * @example
 * let o = Object.extend({}, {a:1}, {a:2, b:3});
 * console.log(o); // {a:2, b:3};
 */
Object.extend = function(){
    for(let i = 1; i < arguments.length; i++) {
        for(let key in arguments[i]) {
            if(arguments[i].hasOwnProperty(key)) { 
                if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
                    Object.extend(arguments[0][key], arguments[i][key]);
                }
                else {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
    }
    return arguments[0];	
}

/**
 * Flatten a nested object into a more simple object.
 * https://tinyurl.com/y6oe2ebq
 * @param {object} obj
 * @return {object}
 * @example 
 * Object.flatten({a: {b: 1, c: 2}}); // {"a.b": 1, "a.c": 2}
 */
Object.flatten = function(obj){
    var toReturn = {};

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if ((typeof obj[i]) == 'object' && obj[i] !== null) {
            var flatObject = Object.flatten(obj[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = obj[i];
        }
    }
    return toReturn;
}

/**
 * Unflatten an object into a nested object
 * https://tinyurl.com/y536fqrf
 * @param {object} obj
 * @return {object}
 * @example
 * Object.unflatten({"a.b": 1, "a.c": 2}); // {a: {b: 1, c: 2}}
 */
Object.unflatten = function(obj){
    let result = {};
    for (let i in obj) {
        let keys = i.split('.');
        keys.reduce(function(r, e, j) {
            return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? obj[i] : {}) : []);
        }, result);
    }
    return result;
};

/**
 * Creates a random string of characters
 * @param {number} len - length of the string
 * @return {string}
 */
String.random = function(len){
    var s = '';
    var randomchar = function() {
      var n = Math.floor(Math.random() * 62);
      if (n < 10) return n; //1-10
      if (n < 36) return String.fromCharCode(n + 55); //A-Z
      return String.fromCharCode(n + 61); //a-z
    }
    while (s.length < len) s += randomchar();
    return s;
}

/**
 * Get a set of matching elements by data-name attribute
 * @param {string} dataname - the data-name attribute value
 * @return {HTMLElement[]}
 */
document.getElementsByDataName = function(dataName){
    return document.querySelectorAll(`[data-name="${dataName}"]`);
};

/**
 * Get the first matching element by data-name attribute
 * @param {string} dataname - the data-name attribute value
 * @return {HTMLElement}
 */
document.getElementByDataName = function(dataName){
    let elements = document.getElementsByDataName(dataName);
    if(elements.length){
        return elements[0];
    }
    return null;
};

/**
 * Generates a unique id based on the 
 * timestamp and an internal counter.
 */
class IdGenerator {

    /**
     * Constructor
     * @return {IdGenerator}
     */
    constructor(){
        this.counter = 0;
        this.lastTime = 0;
        return this;
    }

    /**
     * Generates a unique id based on the timestamp,
     * a prefix, and an internal counter.
     * @return {string}
     */
    generateId(){
        let now = microtime.now();
        // if an ID is being generated with the same timestamp as the
        // last request to generate an ID, then increment the counter 
        if(this.lastTime === now){
            this.counter++;
        }
        else {
            this.counter = 0;
        }
        this.lastTime = now;
        return `${now}${this.counter}`;
    }
}
  
/**
 * Element Manager.
 * Can create and manage HTMLElements and Templates.
 * Must be passed a cloneable HTMLElement element 
 * in the constructor to be of any use.
 * @extends {EventSystem}
 * @example
 * // ElementManager would create 3 elements,
 * // render them, and append them to itself
 * let userTempalte = document.getElementById('userTemplate');
 * let userList = document.getElementById('userList');
 * let userElementManager = new ElementManager(userList, userTemplate);
 * userElementManager.render([
 *    {id:0, name: "Jim H", status: "online"},
 *    {id:1, name: "Pam B", status: "offline"},
 *    {id:2, name: "Michael S", status: "online"},
 * ]);
 * // ElementManager would update Jim and Pam, 
 * // but, since Michael no longer exists in the data,
 * // it would remove the element/template with that data.
 * // What is important is that the "id" is matched.
 * userElementManager.render([
 *    {id:0, name: "Jim H", status: "online"},
 *    {id:1, name: "Pam H", status: "online"},
 * ]);
 */
class ElementManager extends EventSystem {

    /**
     * Constructor
     * @param {HTLMElement} wrapper - wrapper element where elements are appended
     * @param {HTMLElement} template - a cloneable HTMLElement or Template
     * @param {object} [options]
     * @param {string} [options.primaryKey="id"] - necessary for rendering data from
     *                  arrays of objects. Otherwise, ElementManager will just empty
     *                  itself and rebuild from scratch.
     * @param {number} [options.maxElements=0] - max element count
     * @param {boolean} [options.cloneTemplate=true] - whether to clone the initial
     *                  template from the DOM. Most of the time, you want to do this.   
     * @param {boolean} [options.removeTemplate=true] - whether to remove the initial
     *                  template on the DOM. Most of the time, you want to do this,
     *                  unless there are many ElementManagers using the same template.                  
     * @param {boolean} [options.removeDeadTemplates=true] - whether to remove dead 
     *                  templates. A template is dead when it does not exist 
     *                  in new data passed to render()
     * @return {ElementManager}
     */
    constructor(wrapper, template, options){
        super();
        let defaults = {
            primaryKey: "id",
            maxElements: 0,
            cloneTemplate: true,
            removeTemplate: true,
            removeDeadTemplates: true
        };
        this.options = Object.extend(defaults, options);

        /**
         * The element in which all templates will be appended to.
         * @type {HTMLElement}
         */
        this.wrapper = wrapper;

        /**
         * A Template HTMLElement to create new templates from.
         * @type {HTMLElement}
         */
        this.template = this.options.cloneTemplate ? template.cloneNode(true) : template
        this.template.removeAttribute('id');
        this.template.classList.remove('template');

        /**
         * A Map of Templates, such as
         * { "User1" => UserRowTemplate,
         *   "User2" => UserRowTemplate.. }
         * @type {Map}
         */
        this.elements = new Map();

        // remove the original template from the DOM
        // it will always be cloneable from this.template
        if(this.options.removeTemplate){
            template.remove();
        }

        this.cachedData = {};
        this.processedRenderData = {};

        return this;
    }

    /**
     * Cache data as-is in case the 
     * original data is required.
     * @param {object} data 
     */
    cacheData(data){
        return Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {object} data 
     * @return {object}
     */
    processRenderData(data){
        return data;
    }
    
    /**
     * Empty the contents of the template manager
     * @return {ElementManager}
     */
    empty(){
        while (this.wrapper.firstChild) {
            this.wrapper.removeChild(this.wrapper.firstChild);
        }
        this.elements = new Map();
        return this;
    }

    /**
     * Attach handlers to an element
     * @param {HTLMElement} element 
     * @return {ElementManager}
     */
    attachElementHandlers(element){
        return this;
    }

    /**
     * Create a new clone of the template.
     * Attach handlers to it.
     * @return {HTLMElement}
     */
    cloneTemplate(){
        let element = this.template.cloneNode(true);
        this.attachElementHandlers(element);
        return element;
    }

    /**
     * Append an element to the wrapper
     * @param {HTLMElement} element 
     * @return {ElementManager}
     */
    appendElement(element){
        this.wrapper.appendChild(element);
        return this;
    }

    /**
     * Append an element before an element
     * @param {HTLMElement} element 
     * @param {HTMLElement} elementTo
     * @return {ElementManager}
     */
    appendElementBefore(element, elementTo){
        elementTo.before(element);
        return this;
    }

    /**
     * Append an element after an element
     * @param {HTLMElement} element 
     * @param {HTMLElement} elementTo
     * @return {ElementManager}
     */
    appendElementAfter(element, elementTo){
        elementTo.after(element);
        return this;
    }

    /**
     * Remove an element by id.
     * Removes from the DOM and collection.
     * @param {string} id 
     * @return {ElementManager}
     */
    removeElement(id){
        let element = this.elements.get(id);
        if(element){
            this.wrapper.removeChild(element);
            this.elements.delete(id);
        }
        return this;
    }

    /**
     * Remove dead elements. 
     * Cross reference the list of current elements
     * with an object of data. If the template object's name
     * is not found in the data, then the template is considered dead (old).
     * @example // The following objects currently exists in this.elements
     *           { user1:Template, user2:Template, user3:Template }
     *          // The following objects exist in the passed in data object
     *           { user2: {...}, user3: {...} }
     *          // user1 is missing in the data. Therefore, the template named
     *          // "user1" is no longer relevant, and is removed.
     * @param {object} data
     * @return {ElementManager}
     */
    removeDeadElements(data){
        for(let [key, element] of this.elements){
            if(!this.getData(data, key)){
                element.remove();
                this.elements.delete(key);
            }
        }
        return this;
    }

    /**
     * Get the type of the data parameter.
     * @param {object[]|object|Map} data 
     * @return {string}
     */
    getDataType(data){
        if(data instanceof Map){
            return "map";
        }
        else if(Array.isArray(data)){
            return "array";
        }
        else if(typeof data === "object"){
            return "object";
        }
        return null;
    }

    /**
     * Get an object of data from a data
     * parameter based on a key. 
     * If the data is an array of objects,
     * match the key with an object.id property.
     * Otherwise, just match the name of the key
     * in a map of objects or object of objects.
     * todo: rename.. to something better
     * @param {object[]|object|Map} data 
     * @param {string} key 
     * @return {null|object}
     */
    getData(data, key){
        switch(this.getDataType(data)){
            case "array":
                let el = data.filter(function(e){
                    return e.id === key;
                });
                return el && el.length ? el[0] : null;
            case "map":
                return data.get(key);
            case "object":
                return data[key];
            default:
                return null;   
        }
    }

    /**
     * Run through each object of data and render the object
     * into an element. If the data is new, the
     * element will be appended to the wrapper.
     * @param {object[]|object|Map} data 
     * @return {ElementManager}
     */
    render(data){
        this.cachedData = this.cacheData(data);
        this.processedRenderData = this.processRenderData(data);
        switch(this.getDataType(data)){
            case "array":
                this.renderArray(data);
                break;
            case "map":
                this.renderMap(data);
                break;
            default:
            case "object":
                this.renderObject(data);
                break;
        }
        if(this.options.removeDeadTemplates){
            this.removeDeadElements(data);
        }
        return this;
    }

    /**
     * Render elements from an array of data.
     * Each object must have an "id" property.
     * @param {object[]} data 
     * @return {ElementManager}
     */
    renderArray(data){
        for(let i = 0; i < data.length; i++){
            let id = data[i][this.options.primaryKey];
            if(typeof id === "undefined"){
                console.error("ElementManager.renderArray: data must have a primary key property");
                return;
            }
            this.renderElement(id, data[i], i);
        }
        return this;
    }

    /**
     * Render elements from a map of objects.
     * @param {Map} data 
     * @return {ElementManager}
     */
    renderMap(data){
        let i = 0;
        for(let [key, value] of data){
            this.renderElement(key, value, i);
            i++;
        }
        return this;
    }

    /**
     * Render elements from an object of objects.
     * @param {object} data 
     * @return {ElementManager}
     */
    renderObject(data){
        let i = 0;
        for(let k in data){
            this.renderElement(k, data[k], i);
            i++;
        }
        return this;
    }

    /**
     * Render a single object of data by faking
     * it as an object of objects.
     * Note that if removeDeadElements is 
     * set to true (by default), this will 
     * remove all other elements.
     * @param {string} id 
     * @param {object} object 
     * @return {ElementManager}
     */
    renderSingle(id, object){
        let obj = {};
        obj[id] = object;
        this.render(obj);
        return this;
    }

    /**
     * Render an element found in the element collection.
     * If the element does not exist, create it.
     * @param {number|string} id - element and data identifier
     * @param {object} data - object of data
     * @param {number} index - the numerical index of the element
     * @return {ElementManager}
     */
    renderElement(id, data, index){
        let isNew =  false;
        let element = this.elements.get(id);
        if(!element){
            isNew = true;
            element = this.cloneTemplate();
        }
        
        if(element){
            if(isNew){
                this.elements.set(id, element);
                this.appendElement(element);              
            }
            if(element instanceof Template){
                element.render(data);
            }
            else {
                Template.render(element, data);
            }  
        }

        return this;
    }

    /**
     * Convert an array of objects into an 
     * object of objects. Each object in the
     * array must have a primary key.
     * @param {object[]} dataArr 
     * @param {string} [primaryKey="id"] - the key that identifies each data object
     * @return {object}
     */
    static dataArrayToDataObject(dataArr, primaryKey = 'id'){
        let dataObj = {};
        for(let i = 0; i < dataArr.length; i++){
            let id = dataArr[i][primaryKey];
            dataObj[id] = dataArr[i];
        }
        return dataObj;
    }
}

/**
 * An enhanced HTMLElement.
 * Has more control over its child elements
 * by capturing them during initialization 
 * into the local "elements" object. Each child element
 * is captured by any desired element attribute and,
 * if named appropriately, can be rendered with data via render().
 * Provides a namespaced EventSystem with on/off handlers.
 * Has a render function that takes in an object of data and
 * populates child elements with same-named attributes.
 * @extends {HTMLElement}
 */
class Template extends HTMLElement {

    /**
     * Constructor
     * @param {object} [options={}]
     * @param {object} [options.elements={}] - a collection of element selectors
     *                  to capture child elements of the Template
     * @param {string} [options.renderAttribute="data-name"] - the attribute of
     *                  each child element to match data in render() with
     * @param {boolean} [options.displayBlock=true] - whether to add the 
     *                  'template-block' class to the template on connectedCallback()
     * @return {Template}
     */
    constructor(options = {}){
        super();
        let defaults = {
            elements: {},
            renderAttribute: 'data-name',
            displayBlock: true
        };
        this.options = Object.extend(defaults, options);
        this.eventSystem = new EventSystem();
        this.elements = {};
        this.cachedData = {};
        this.renderData = {};
        this.isFirstRender = true;
        this.observer = new MutationObserver(this.mutationObserverCallback.bind(this));
        return this;
    }

    /**
     * 
     * @param {} mutations 
     * @param {*} observer 
     */
    mutationObserverCallback(mutations, observer){
        mutations.forEach((mutation) => {
            switch(mutation.type) {
                case 'childList':
                case 'subtree':
                    console.log('mutated');
                    return;
            }
        });
    }

    /**
     * This callback is fired when the element is appended
     * to the DOM, or when it is loaded if it's already there.
     * This is where HTML can be modified, and attributes
     * can be modified. That cannot happen in the constructor.
     */
    connectedCallback(){
        this.findNamedElements();
        this.findElements(this.options.elements);
        // by default, templates have no display
        if(this.options.displayBlock){
            this.classList.add('template-block');
        }
    }

    /**
     * Add an event handler an elements event system.
     * @param {HTMLElement} element 
     * @param {string} event 
     * @param {function} callback
     * @example
     * Template.on(form, "submit", SubmitFunction);
     * @example
     * Template.on(form, "reset.tab1", ResetTab1Function);
     */
    static on(element, event, callback){
        let baseEvent = event.split('.')[0];

        // if it doesn't have one, create an event system for this element
        if(!(element.eventSystem instanceof EventSystem)){
            element.eventSystem = new EventSystem();
        }

        // add all base events, ie the "click" in "click.namespace",
        // to the elements native event listener. If the event does 
        // not actually exist natively, it will simply not fire.
        if(element.eventSystem.getHandlersCount(baseEvent) === 0){
            element.addEventListener(baseEvent, function(e){
                element.eventSystem.emit(baseEvent, e);
            });
        }

        element.eventSystem.on(event, callback);
    }

    /**
     * Add an event handler an elements event system
     * that after emitting once, is removed.
     * @param {HTMLElement} element 
     * @param {string} event 
     * @param {function} callback
     * @example
     * Template.one(form, "submit", SubmitFunction);
     * @example
     * Template.one(form, "reset.tab1", ResetTab1Function);
     */
    static one(element, event, callback){
        let baseEvent = event.split('.')[0];

        if(!(element.eventSystem instanceof EventSystem)){
            element.eventSystem = new EventSystem();
        }

        if(this.eventSystem.getHandlersCount(baseEvent) === 0){
            this.addEventListener(baseEvent, function(e){
                self.emit(baseEvent, e);
                self.removeEventListener(baseEvent, callback);
            });
        }

        this.eventSystem.one(event, callback);
    }

    /**
     * Remove an event. Also removes it from the native event system.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {HTMLElement} element 
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @return {Template}
     */
    static off(element, event, removeAllChildHandlers = true){
        let baseEvent = event.split('.')[0];
        this.eventSystem.off(event, removeAllChildHandlers);
        if(this.eventSystem.getHandlersCount(baseEvent) > 0){
            this.removeEventListener(baseEvent);
        }
    }

    /**
     * Emit an event.
     * @param {HTMLElement} element 
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @return {EventSystem}
     */
    static emit(element, event, data){
        if(element.eventSystem instanceof EventSystem){
            element.eventSystem.emit(event, data);
        }
    }

    /**
     * Add an event handler. If this is a native
     * DOM event, such as click, it will be added to
     * and called by the native event system.
     * @param {string} event 
     * @param {function} callback 
     * @return {Template}
     */
    on(event, callback) {
        Template.on(this, event, callback);
        return this;
    }

    /**
     * Add an event handler that firwa once.
     * @param {string} event 
     * @param {function} callback 
     * @return {Template}
     */
    one(event, callback) {
        Template.one(this, event, callback);
        return this;
    }
  
    /**
     * Remove an event. Also removes it from the native event system.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @return {Template}
     */
    off(event, removeAllChildHandlers = true) {
        Template.off(this, event, removeAllChildHandlers);
        return this;
    }

    /**
     * Emit an event.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @return {EventSystem}
     */
    emit(event, data){
        Template.emit(this, event, data);
        return this;
    }

    /**
     * Set attributes from a NamedNodeMap
     * @param {NamedNodeMap} attributes 
     * @return {Template}
     */
    setAttributes(attributes){
        for(let i = 0; i < attributes.length; i++){
            let attr = attributes[i];
            this.setAttribute(attr.name, attr.value);
        }
        return this;
    }
        
    // tree

    /**
     * Find and register elements into the elements object.
     * @return {object}
     */
    findElements(elements){
        for(let k in elements){
            this.elements[k] = this.querySelector(elements[k]);
        }
        return this.elements;
    }

    /**
     * Find all elements that have name or data-name attributes.
     * @param {HTMLElement} element - HTMLElement to search through
     * @return {object}
     */
    static findNamedElements(element){
        let elements = {};
        let found = element.querySelectorAll('[name], [data-name]');
        for(let i = 0; i < found.length; i++){
            let name = found[i].getAttribute('name');
            if(!name){
                name = found[i].getAttribute('data-name');
            }
            if(name){
                elements[name] = found[i];
            }
        }
        return elements;
    }

    /**
     * Find all elements that have name or data-name attributes.
     * @return {Template}
     */
    findNamedElements(){
        let elements = Template.findNamedElements(this);
        Object.extend(this.elements, elements);
        return this;
    }

    /**
     * Get registered child elements of the Template.
     * @return {object}
     */
    getElements(){
        return this.elements;
    }

    /**
     * Find the first matching child element of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    static find(element, selector){
        return element.querySelectorAll(selector)[0];
    }

    /**
     * Find the first matching child element of another element.
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    find(selector){
        return Template.find(this, selector);
    }

    /**
     * Find all matching child elements of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    static findAll(element, selector){
        return element.querySelectorAll(selector);
    }

    /**
     * Find all matching child elements of another element.
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    findAll(selector){
        return Template.findAll(this, selector);
    }

    /**
     * Find the last matching child element of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    static findLast(element, selector){
        let el = element.querySelectorAll(selector);
        return el[el.length - 1];
    }

    /**
     * Find the last matching child element of another element.
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    findLast(selector){
        return Template.findLast(selector);
    }

    /**
     * Append one element to another element
     * @param {HTMLElement} element - the element to append
     * @param {HTMLElement} toElement - the element to append to
     * @return {Template}
     */
    static append(element, toElement){
        toElement.appendChild(element);
    }

    /**
     * Append an element 
     * @param {HTMLElement} element 
     * @return {Template}
     */
    append(element){
        Template.append(element, this);
        return this;
    }

    /**
     * Append to another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    appendTo(element){
        Template.append(this, element);
        return this;
    }

    /**
     * Prepend an element to another element
     * @param {HTMLElement} element - the element to prepend
     * @param {HTMLElement} toElement - the element to prepend to
     */
    static prepend(element, toElement){
        toElement.insertBefore(element, toElement.firstChild);
    }

    /**
     * Prepend another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    prepend(element){
        Template.prepend(element, this);
        return this;
    }

    /**
     * Prepend to another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    prependTo(element){
        Template.prepend(this, element);
        return this;
    }

    /**
     * Empty the contents of an element
     * @param {HTMLElement} element 
     */
    static empty(element){
        while (this.element) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Empty the contents of the Template
     * @return {Template}
     */
    empty(){
        Template.empty(this);
        return this;
    }

    // visibility

    /**
     * Determine if an element is visible
     * @param {HTMLElemet} element 
     * @return {boolean}
     */
    static isVisible(element){
        // taken from jquery
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    /**
     * Determine if the Template is visible
     * @return {boolean}
     */
    isVisible(){
        return Template.isVisible(this);
    }

    /**
     * Hide an element 
     * @param {HTMLElemet} element 
     */
    static hide(element){
        if(element.style.display !== "none"){
            element.previousDisplay = element.style.display;
        }
        element.style.display = "none";
    }

    /**
     * Hide the Template
     * @return {Template}
     */
    hide(){
        Template.hide(this);
        return this;
    }

    /**
     * Show an element 
     * @param {HTMLElemet} element 
     */
    static show(element){
        element.style.display = element.previousDisplay || "block";
    }

    /**
     * Show the Template 
     * @return {Template}
     */
    show(){
        Template.show(this);
        return this;
    }

    /**
     * Toggle the display of an element by 
     * adding or removing the hidden class
     * @param {HTMLElement} element 
     * @param {boolean} state 
     */
    static display(element, state){
        if(typeof state === "undefined"){
            state = !Template.isVisible(element);
        }
        return state ? Template.show(element) : Template.hide(element);
    }

    /**
     * Toggle the display of the Template by 
     * adding or removing the hidden class
     * @param {boolean} state 
     * @return {Template}
     */
    display(state){
        Template.display(this, state);
        return this;
    }

    // styles

    /**
     * Get the value of a style of an element
     * @param {HTMLElement} element 
     * @param {string} style - style such as opacity, height, etc
     * @return {string}
     */
    static getStyle(element, style){
        return window.getComputedStyle(element).getPropertyValue(style);
    }

    /**
     * Get the value of a style of the Template
     * @param {string} style - style such as opacity, height, etc
     * @return {string}
     */
    getStyle(style){
        return Template.getStyle(this, style);
    }

    // dimensions

    /**
     * Set the height of an element
     * @param {HTMLElement} element 
     * @param {number} height 
     */
    static setHeight(element, height){
        element.style.height = height + 'px';
    }

    /**
     * Set the height of the Template
     * @param {number} height 
     * @return {Template}
     */
    setHeight(height){
        Template.setHeight(this, height);
        return this;
    }

    /**
     * Set the width of an element
     * @param {HTMLElement} element 
     * @param {number} width 
     */
    static setWidth(element, width){
        element.style.width = width + 'px';
    }

    /**
     * Set the width of the Template
     * @param {number} width 
     * @return {Template}
     */
    setWidth(width){
        Template.setWidth(this, width);
        return this;
    }

    // class

    /**
     * Add a class to an element
     * @param {HTMLElement} element 
     * @param {string} clazz 
     */
    static addClass(element, clazz){
        element.classList.add(clazz);
    }

    /**
     * Add a class to the Template
     * @param {string} clazz 
     * @return {Template}
     */
    addClass(clazz){
        Template.addClass(this, clazz);
        return this;
    }

    /**
     * Determine if an element has a class
     * @param {HTMLElement} element 
     * @param {string} clazz 
     * @return {boolean}
     */
    static hasClass(element, clazz){
        return element.classList.contains(clazz);
    }

    /**
     * Determine if the Template has a class
     * @param {string} clazz 
     * @return {boolean}
     */
    hasClass(clazz){
        return Template.hasClass(this, clazz);
    }

    /**
     * Remove a class from an element
     * @param {HTMLElement} element 
     * @param {string} clazz 
     */
    static removeClass(element, clazz){
        element.classList.remove(clazz);
    }

    /**
     * Remove a class from the Template
     * @param {string} clazz 
     * @return {Template}
     */
    removeClass(clazz){
        Template.removeClass(this, clazz);
        return this;
    }

    /**
     * Replace a class of an element with another
     * @param {HTMLElement} element 
     * @param {string} oldClass - class to replace
     * @param {string} newClass - class to add
     */
    static replaceClass(element, oldClass, newClass){
        element.classList.replace(oldClass, newClass);
    }

    /**
     * Replace a class of the Template with another
     * @param {string} oldClass - class to replace
     * @param {string} newClass - class to add
     * @return {Template}
     */
    replaceClass(oldClass, newClass){
        Template.replaceClass(this, oldClass, newClass);
        return this;
    }

    /**
     * Toggle a class of an element.
     * If no state boolean is passed, set the
     * class state to its opposite
     * @param {HTMLElement} element 
     * @param {string} clazz 
     * @param {boolean} [state]
     */
    static toggleClass(element, clazz, state){
        element.classList.toggle(clazz, state);
    }
    
    /**
     * Toggle a class of the Template.
     * If no state boolean is passed, set the
     * class state to its opposite
     * @param {string} clazz 
     * @param {boolean} [state]
     * @return {Template}
     */
    toggleClass(clazz, state){
        Template.toggleClass(this, clazz, state);
        return this;
    }

    // value

    static getValue(element){
        return element.value;
    }

    getValue(){
        return Template.getValue(this);
    }

    static setValue(element, value){
        element.value = value;
    }

    setValue(value){
        Template.setValue(this, value);
        return this;
    }

    // enable/disable

    /**
     * Set an element to enabled by
     * setting the disabled state to false.
     * @param {HTMLElement} element 
     */
    static enable(element){
        element.disabled = false;
    }

    /**
     * Set the Template to enabled by
     * setting the disabled state to false.
     * @return {Template}
     */
    enable(){
        Template.enable(this);
        return this;
    }

    /**
     * Set an element to disabled.
     * @param {HTMLElement} element 
     */
    static disable(element){
        element.disabled = true;
    }

    /**
     * Set the Template to disabled.
     * @return {Template}
     */
    disable(){
        Template.disable(this);
        return this;
    }

    // render

    /**
     * Cache data as-is in case the 
     * original data is required.
     * @param {object} data 
     */
    cacheData(data){
        return this.cachedData = Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {object} data 
     * @return {object}
     */
    processRenderData(data){
        return this.renderData = data;
    }

    /**
     * Render all child elements of an element using an object of data.
     * In this case, render means set an input value, or set the 
     * innerhtml of a basic HTMLElement, or call the render() function
     * if the element has one, as it would for a Tempalte element.
     * If htmlElement is not a Template element, all elements with a 
     * [name] or [data-name] attribute whose value matches a key name 
     * in the data object will have their value or HTML set accordingly.
     * @param {HTMLElement} element - the element - which should have 1 or more 
     *                      child elements - to render. Otherwise, nothing happens.
     * @param {object} data - the data to render with. This object should have 
     *                      keys that would match [name] or [data-name] element attributes.
     * @param {boolean} [isTemplate=false] - whether the htmlElement is a Template
     *                      or not. If it is, renders using the elements already 
     *                      registered within the Template object - for speed.
     * @example
     * // fill a div with data
     * // <div id="myDiv">
     * //    <span data-name="name">Bob</span>
     * //    <span data-name="status">online</span>
     * // </div>
     * let myDiv = document.getElementById('myDiv');
     * Template.render(myDiv, {name: "Bob", status: "online"});
     * @example
     * // fill a form with data
     * // <form id="myForm">
     * //     <input name="name" type="text">
     * //     <select name="status">
     * //         <option value="offline">Offline</option>
     * //         <option value="online">Online</option>
     * //     </select>
     * // </form>
     * let myForm = document.getElementById('myForm');
     * Template.render(myForm, {name: "Bob", status: "online"});
     */
    static render(element, data, isTemplate = false){
        // if this is a Template, get the already registered child elements
        let elements = null;
        if(isTemplate){
            elements = element.getElements();
        }
        // otherwise, find all child elements with name or data-name attributes
        else {
            elements = Template.findNamedElements(element);
        } 

        let _data = Object.flatten(data);
        for(let k in _data){
            let value = _data[k];
            let element = elements[k];
            if(!element){
                continue;
            }
            
            if(element.render){
                element.render(value);
                continue;
            }
            
            if(element.tagName === "INPUT"){
                let type = element.getAttribute('type');
                if(type){
                    if(type === 'checkbox' && value){
                        element.checked = true;
                    }
                    else if(type === 'radio' && element.getAttribute('value') === value){
                        element.checked = true;
                    }
                    else {
                        element.value = value;
                    }
                }
            }
            else if (element.tagName === "SELECT"){
                element.value = value;
            }
            else {
                element.innerHTML = value;
            }
        }
    }

    /**
     * Render the Template.
     * Cache and process the render data.
     * @param {object} data 
     * @return {Template}
     */
    render(data){
        this.cacheData(data);
        this.processRenderData(Object.extend({}, data));
        this.observer.observe(this, {
            childList: true,
            subtree: true
        });
        Template.render(this, this.renderData, true);
        this.observer.disconnect();
        this.isFirstRender = false;
        return this;
    }
}
customElements.define('template-element', Template);

const Status = {
    none: "none",
    error: "error",
    success: "success",
    processing: "processing",
    info: "info",
    warning: "warning"
};
Status.class = {};
Status.class[Status.none] = "status-none";
Status.class[Status.error] = "status-error";
Status.class[Status.success] = "status-success";
Status.class[Status.processing] = "status-processing";
Status.class[Status.info] = "status-info";
Status.class[Status.warning] = "status-warning";
Status.classArray = [
    Status.class.none,
    Status.class.error,
    Status.class.success,
    Status.class.processing,
    Status.class.info,
    Status.class.warning
];
// background class
Status.bgclass = {};
Status.bgclass[Status.none] = "status-bg-none";
Status.bgclass[Status.error] = "status-bg-error";
Status.bgclass[Status.success] = "status-bg-success";
Status.bgclass[Status.processing] = "status-bg-processing";
Status.bgclass[Status.info] = "status-bg-info";
Status.bgclass[Status.warning] = "status-bg-warning";
Status.bgclassArray = [
    Status.bgclass.none,
    Status.bgclass.error,
    Status.bgclass.success,
    Status.bgclass.processing,
    Status.bgclass.info,
    Status.bgclass.warning
];
Status.icon = {};
Status.icon[Status.none] = "";
Status.icon[Status.error] = '';
Status.icon[Status.info] = '';
Status.icon[Status.processing] = '<div class="spinner-container"><div class="spinner-wheel"></div></div>';
Status.icon[Status.success] = '';
Status.icon[Status.warning] = '';