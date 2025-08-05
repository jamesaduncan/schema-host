
/**
 * Convert a schema URL to a type & context.
 * For example, "http://schema.org/Person" becomes:
 * {
 *     "@type": "Person",
 *     "@context": "http://schema.org/"
 * }
 * @param {string} url - The schema URL to convert.
 * @returns {Object} An object containing "@type" and "@context".
 */
function ldifyUrl( url ) {
    const match = url.match(/^(.+\/)([^\/]+$)/);
    if ( match ) return { "@type": match[2], "@context": match[1] };
    return {};
}

/**
 * Ensure a property is added to an object as an array or a single value.
 * @param {Object} obj - The target object.
 * @param {string} prop - The property name.
 * @param {*} value - The value to inject.
 */
function injectProp( obj, prop, value ) {
    if ( obj[prop] ) {
        if ( Array.isArray( obj[prop] ) ) {
            obj[prop].push( value );
        } else {
            obj[prop] = [ obj[prop], value ];
        }
    } else {
        obj[prop] = value;
    }
}

/**
 * Extract the microdata from an element and its children.
 * The element must have the "itemscope" attribute.
 * Returns an object with the properties defined by the "itemprop" attributes.
 * @param {Object} doc - The Cheerio document object.
 * @param {Object} el - The element to extract data from.
 * @param {Object} obj - The object to populate with extracted data.
 * @returns {Object} The populated object.
 */
function extractThing( doc, el, obj ) {    
    if ( el.tagName.toLowerCase() == 'script' && el.getAttribute('type') === 'application/json') {
        try {
            const json = JSON.parse(el.textContent || el.innerText);
            if (json && json instanceof Object) {
                Object.assign(obj, json);
            }
        } catch (e) {
            console.error(`Error parsing JSON-LD script:`, e);
        }
        return obj;
    }

    /*
        Get the properties of the thing, but only those that aren't below another itemscope.
        This is to avoid duplicating properties from nested items.
    */
    const unfiltered = Array.from( el.querySelectorAll("[itemprop]") );
    const props = unfiltered.filter( (prop) => {
        return prop.parentNode.closest('[itemscope]') == el
    } ); 
    //console.log(`EL:`, el,`UNFILTERED PROPS: ${Array.from( unfiltered ).map( p => p.getAttribute('itemprop') )}\nFILTERED PROPS: ${Array.from( props ).map( p => p.getAttribute('itemprop') )}`);
    for ( const prop of Array.from( props ) ) {
        const propname = prop.getAttribute('itemprop');
        injectProp( obj, propname, extractProperty( doc, prop ));
    }

    /*
        If we have an itemid, then we use it to set the @id
        property of the JSON-LD object.
    */
    if ( el.getAttribute('id') || el.getAttribute('itemid') ) {
        let id;
        if ( el.getAttribute('id' ) ) {
            id = new URL('#' + el.getAttribute('id').trim(), el.baseURI).href;
        } else {
            id = el.getAttribute('itemid');
        }
        obj["@id"] = id.trim();
    }

    if ( el.getAttribute('itemref') ) {
        // If the element has an "itemref" attribute, extract properties from referenced elements
        const refs = el.getAttribute('itemref').split(/\s+/);
        for ( const ref of refs ) {
            // Each ref is an ID of an element in the document
            doc.querySelectorAll( `#${ref}` ).forEach( ( refEl ) => {
                const propname = refEl.getAttribute('itemprop');
                injectProp( obj, propname, extractProperty( doc, refEl ));
            });
        }
    }

    return obj;
} 

/**
 * Extract the value of a property from an element.
 * If the element has an "itemtype" attribute, it is treated as a nested item.
 * Otherwise, it returns the text content of the element.
 * @param {Object} doc - The document object
 * @param {Object} prop - The property element to extract data from.
 * @returns {*} The extracted property value.
 */
function extractProperty( doc, item ) {
    if ( item.getAttribute('itemtype') ) {
        return extractThing( doc, item, ldifyUrl( item.getAttribute('itemtype') ) );
    } else {
        switch (item.tagName.toLowerCase()) {
            case 'meta':
                return item.getAttribute('content').trim() || '';
            case 'link':
                return item.getAttribute('href').trim() || '';
            case 'input':
                return item.getAttribute('value').trim() || '';
            case 'select':
                return item.querySelector('[selected]').innerText.trim() || '';
            case 'base':
                const attr = item.getAttribute('href').trim() || '';
                return attr;
            default:
                return item.innerText.trim();
            /* ... there are more of these to support ... */
        }
    }
}

function extractForm(form) {
    const data = new FormData( form );
    return [ formData.forEach((value, key) => object[key] = value) ];
}

/**
 * Extract microdata from HTML.
 * Takes an HTML string and optionally, either an array with a list of selectors that
 *  limits the selection, or an options object that can contain a limiter property that does the same.
 * The options object can also contain a base property to help fully qualify relative URLs.
 * Returns an array of objects, each representing an item with its properties.
 * @param {string} html - The HTML string to parse.
 * @param {Object|Array} [options] - Optional settings or limiter array.
 * @param {Array} [options.limiter] - Array of selectors to limit the scope.
 * @param {string} [options.base] - Base URL for resolving relative URLs.
 * @returns {Array<Object>} An array of extracted microdata objects.
 */
export function microdata( doc, options ) {
    const limiter = ( options && options.limiter ) ? options.limiter : Array.isArray( options ) ? options : [];
    const base    = ( options && options.base ) ? options.base : "";

    if ( typeof doc === 'string' ) {
        // If the doc is a string, we assume it's HTML and parse it.
        const parser = new DOMParser();
        doc = parser.parseFromString(doc, 'text/html');
        console.log(`Parsed HTML string into a document object.`, doc);
    }

    if ( doc instanceof HTMLFormElement ) {
        console.log(`this is a form, totally different`);
        return extractForm( doc, options );
    }
    
    if ( base ) {
        if ( doc.querySelector('base') ) {
            doc.querySelector('base').remove();
        }
        const b = document.createElement('base');
        b.setAttribute('href', base);
        doc.body.insertBefore(b, doc.body.firstChild);
    }

    const results = [];
    const selector = limiter.join("") + '[itemscope]';

    const items = doc.querySelectorAll( selector );
    items.forEach( ( item ) => {
        const obj = {};
        if ( item.getAttribute('itemtype') ) {
            Object.assign( obj, ldifyUrl( item.getAttribute('itemtype') ) );
        }
        results.push( extractThing( doc, item, obj ) );
    });

    return results;
};


if (!window.schemaRegistry) {
    window.schemaRegistry = {
        'registryData': {},

        'has': function( url ) {
            return !!this.registryData.hasOwnProperty(url);
        },

        'get': function( url ) {
            return this.registryData[url] || null;
        },

        'add': async function( ...urls ) {
            for ( const url of urls ) {
                const response = await fetch( url );
                if ( response.ok ) {
                    const data = await response.text();
                    const doc = new DOMParser().parseFromString(data, 'text/html');
                    const md  = microdata( doc )[0];
                    if ( md.validator ) {
                        const src = md.validator;
                        const { validator } = await import( src );
                        md.validator = validator;
                        console.log(`Imported validator for ${url} from ${src}`);
                    } else {
                        md.validator = () => { return true; }; // Default validator if none is provided
                    }
                    window.schemaRegistry.registryData[ url ] = md;
                } else {
                    console.error(`Failed to fetch schema from ${url}:`, response.statusText);
                }
            }
        },
        'validate': async function( data ) {
            if ( !data || typeof data !== 'object' ) {
                throw new Error('Invalid data provided for validation');
            }
            const type = data['@context'] + data['@type'] 
            if ( !type ) {
                throw new Error('Data must have a type to validate against schema');
            }

            const schema = this.registryData[type];
            if ( !schema ) {
                await this.add( type );
            }

            if ( typeof schema.validator === 'function' ) {
                try {
                    return await schema.validator(data);
                } catch(e) {
                    throw new Error(`Validation failed for ${type}: ${e.message}`);
                }
            } else {
                return true; // If no validator function, assume valid
            }
        }
    };

    class Microdata {
        constructor( elem ) {
            Object.assign( this, microdata( elem )[0] )
        }
    
        async validate() {
            window.schemaRegistry.validate( this );
        }
    }
    
    window.Microdata = Microdata;    
}


const schemaRegistry = window.schemaRegistry;

document.addEventListener('DOMContentLoaded', () => {
    const types = Array.from( document.querySelectorAll('[itemtype]') ).map( el => { return el.getAttribute('itemtype') } );
    console.log( `adding types to schema registry:`, types );
    const knownSchema = [
        "https://schema.host/Schema",
        "https://schema.host/Property",        
        "https://schema.host/Thing",
        "https://schema.host/Text",
        "https://schema.host/Number",
        "https://schema.host/DateTime",
        "https://schema.host/URL",
        "https://schema.host/Date",
        "https://schema.host/Boolean",
        "https://schema.host/Cardinal",
    ]
    window.schemaRegistry.add(...knownSchema);
    window.schemaRegistry.add(...types)
    document.microdata = microdata(document)
});

export { schemaRegistry };

