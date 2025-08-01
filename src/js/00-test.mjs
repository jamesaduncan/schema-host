import { microdata } from "/js/index.mjs";

const t = {
    counter: 1,
    test: ( name, fn ) => {
        try {
            fn( t );
        } catch(e) {
            console.error(`Test "${name}" failed:`, e);
        }
    },
    ok: ( condition, message ) => {
        if ( condition ) {
            console.log(`✓ ${t.counter++} ${message}`);
        } else {
            console.error(`✗ ${t.counter++} ${message}`);
        }
    },
    equal: ( actual, expected, message ) => {
        if ( actual === expected ) {
            console.log(`✓ ${t.counter++} ${message}`);
        } else {
            console.error(`✗ ${t.counter++} ${message} - Expected: ${expected}, Actual: ${actual}`);
        }
    },
    end: () => {
        console.log("Test ended.");
    }
}

t.test( "simple microdata", ( t ) => {
    t.ok( microdata, "microdata function exists" );
    const results = microdata(`<div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">John Doe</span>
    </div>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.ok( results.length > 0, "got some results from microdata");
    t.equal( results[0].name, "John Doe", "got the correct name from microdata");
    t.equal( results[0]['@type'], "Person", "got the correct type from microdata");
    t.equal( results[0]['@context'], "http://schema.org/", "got the correct context from microdata");
    t.end();
});

t.test("microdata with multiple items", (t) => {
    const results = microdata(`<div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">John Doe</span>
    </div>
    <div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">Jane Smith</span>
    </div>`); 
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.equal( results.length, 2, "got two items from microdata");
    t.equal( results[0].name, "John Doe", "got the correct name for first item");
    t.equal( results[1].name, "Jane Smith", "got the correct name for second item");
    t.equal( results[1]["@type"], "Person", "got the correct type for second item");
    t.equal( results[1]["@context"], "http://schema.org/", "got the correct context for second item");
    t.end();
});

t.test("microdata with nested items", (t) => {
    const results = microdata(`<article itemscope itemtype="http://schema.org/BlogPosting">
        <h1 itemprop="headline">My Blog Post</h1>
        <div itemprop="author" itemscope itemtype="http://schema.org/Person">
            <span itemprop="name">John Doe</span>
        </div>
        <ul>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">Great post!</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Jane Smith</span>
                </div>
            </li>
        </ul>
    </article>`);
    console.log( results )
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.equal( results.length, 4, "got one item from microdata");
    t.equal( results[0].headline, "My Blog Post", "got the correct headline from microdata");
    t.equal( results[0].author.name, "John Doe", "got the correct author name from microdata");
    t.equal( results[0]['@type'], "BlogPosting", "got the correct type for blog post");
    t.equal( results[0]['@context'], "http://schema.org/", "got the correct context for blog post");
        console.log( results )
    t.end();
});

t.test("microdata with multiple values for a property", (t) => {
    const results = microdata(`<article itemscope itemtype="http://schema.org/BlogPosting">
        <h1 itemprop="headline">My Blog Post</h1>
        <div itemprop="author" itemscope itemtype="http://schema.org/Person">
            <span itemprop="name">John Doe</span>
        </div>
        <ul>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">Great post!</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Jane Smith</span>
                </div>
            </li>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">I didn't like it</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Abe Downer</span>
                </div>
            </li>
        </ul>
    </article>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.end();
});

t.test("fancytags", ( t ) => {
    const results = microdata(`<div itemscope itemtype="http://schema.org/Person">
        <meta itemprop="name" content="John Doe">
        <link itemprop="url" href="http://example.com/johndoe">
        <input itemprop="age" value="30" name="foo">
    </div>`);
    t.ok( results, "got results from microdata with fancy tags");
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.ok( results.length > 0, "got some results from microdata with fancy tags");
    t.equal( results[0].name, "John Doe", "got the correct name from microdata with fancy tags");
    t.equal( results[0].url, "http://example.com/johndoe", "got the correct URL from microdata with fancy tags");
    t.equal( results[0].age, "30", "got the correct age from microdata with fancy tags");
    t.end();
});

t.test("microdata with itemref", (t) => {
    const results = microdata(`<article itemref="a" itemscope itemtype="http://schema.org/BlogPosting">
        <h1 itemprop="headline">My Blog Post</h1>
        <div itemprop="author" itemscope itemtype="http://schema.org/Person">
            <span itemprop="name">John Doe</span>
        </div>
        <ul>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">Great post!</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Jane Smith</span>
                </div>
            </li>
        </ul>
    </article>
    <div id="a" itemscope itemprop="editor" itemtype="http://schema.org/Person">
        <span itemprop="name">Brian</span>
    </div>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    console.log( results );
    t.equal( results[0].editor.name, "Brian", "got the correct editor name from microdata with itemref");
    t.end();
} );

t.test("microdata with multiple itemrefs", ( t ) => {
    const results = microdata(`<article itemref="a b" itemscope itemtype="http://schema.org/BlogPosting">
        <h1 itemprop="headline">My Blog Post</h1>
    </article>
    <ul>
        <li id="a" itemscope itemprop="comment" itemtype="http://schema.org/Comment">
            <span itemprop="text">Good post!</span>
        </li>
        <li id="a" itemscope itemprop="comment" itemtype="http://schema.org/Comment">
            <span itemprop="text">Bad post!</span>
        </li>
    </ul>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results[0].comment[0].text, "Good post!", "multi itemref worked for first comment");
    t.equal( results[0].comment[1].text, "Bad post!", "multi itemref worked for first comment");
    t.end();
});

t.test("microdata with itemref to individual prop", ( t ) => {
    const results = microdata(`<article itemref="a" itemscope itemtype="http://schema.org/BlogPosting">   
    </article>
    <h1 id="a" itemprop="headline">My Blog Post</h1>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results[0].headline, "My Blog Post", "itemref to individual prop worked");
    t.end();
})

t.test("microdata extracts id sensibly", ( t ) => {
    const results = microdata(`<article id="foo" itemscope itemtype="http://schema.org/BlogPosting"  itemid="#post-id">   
        <h1 itemprop="headline">My Blog Post</h1>
    </article>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results[0]['@id'], "#post-id", "get post id from itemid");
    t.end();
});

t.test("microdata gets a sensible item id when there is none", ( t ) => {
    const results = microdata(`<article id="foo" itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">My Blog Post</h1>
    </article>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results[0]['@id'], "http://localhost:8080/DataType/#foo", "get post magic id from element id");
    t.end();
});

t.test("microdata with a limiting selector", ( t ) => {
    const results = microdata(`<article id="foo" itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">My Blog Post</h1>
    </article>
    <article itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">Non-Authoritative Blog post!</h1>
    </article>    
    `, [ '[id]' ]); 
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results.length, 1 , "got one item from microdata with limiting selector");
    t.end();
})

t.test("microdata with a limiting selector and base uri", ( t ) => {
    const results = microdata(`<article id="foo" itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">My Blog Post</h1>
    </article>
    <article itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">Non-Authoritative Blog post!</h1>
    </article>    
    `, { limiter: [ '[id]' ], base: "http://example.com/"}); 
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results.length, 1 , "got one item from microdata with limiting selector");
    t.equal( results[0]['@id'], "http://example.com/#foo", "got the correct fully qualified url for the item id");
    t.end();
})

t.test("microdata with a limiting selector and base uri where the base uri is already set", ( t ) => {
    const results = microdata(`<base href="http://www.foo.com/">
    <article id="foo" itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">My Blog Post</h1>
    </article>
    <article itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">Non-Authoritative Blog post!</h1>
    </article>    
    `, { limiter: [ '[id]' ], base: "http://example.com/"}); 
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results.length, 1 , "got one item from microdata with limiting selector");
    t.equal( results[0]['@id'], "http://example.com/#foo", "got the correct fully qualified url for the item id");
    t.end();
})

t.test("microdata with a limiting selector and NO base uri where the base uri is already set", ( t ) => {
    const results = microdata(`<base href="http://www.foo.com/">
    <article id="foo" itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">My Blog Post</h1>
    </article>
    <article itemscope itemtype="http://schema.org/BlogPosting">   
        <h1 itemprop="headline">Non-Authoritative Blog post!</h1>
    </article>    
    `, { limiter: [ '[id]' ] }); 
    t.ok( Array.isArray( results ), "got an array of results from microdata with itemref");
    t.equal( results.length, 1 , "got one item from microdata with limiting selector");
    t.equal( results[0]['@id'], "http://www.foo.com/#foo", "got the correct fully qualified url for the item id");
    t.end();
});

t.test("microdata with a stupid select box", ( t ) => {
    const results = microdata(`<div itemscope itemtype="http://schema.org/Person">
        <select itemprop="name">
            <option value="John Doe" selected>John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
        </select    
    </div>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata with select box");
    t.ok( results.length > 0, "got some results from microdata with select box");
    t.equal( results[0].name, "John Doe", "got the correct name from microdata with select box");
    t.end();
        console.log( results );
});
