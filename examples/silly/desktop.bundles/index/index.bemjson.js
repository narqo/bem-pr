({
    block : 'page',
    title : 'Title of the "Page"',
    head : [
        { elem : 'css', url : '_index.css', ie : false },
        { elem : 'css', url : '_index', ie : true },
        { elem : 'js', url : '_index.js' }
    ],
    content : [
        { block : 'header', content : [
            'header content goes here'
        ] },
        { block: 'content', content : [
            'main content',
            { block : 'block1', content : '"block1" has some content' }
        ] },
        { block : 'footer', content : [
            'footer content goes here'
        ] }
    ]
})
