var atom = require('../lib/atom');

var a = '<?xml version="1.0" encoding="utf-8" ?>\n'
+ '<feed xmlns="http://www.w3.org/2005/Atom">\n'
+ '<title>Title</title>\n'
+ '<link href="http://localhost/" />\n'
+ '<updated>2011-02-14T00:00:00+09:00</updated>\n'
+ '<author><name>Author</name></author>\n'
+ '<id>urn:uuid:86cbbdfe-fec0-4c8b-8519-c4f56fdefb80</id>\n'
+ '<entry>\n'
+ '<title>entry1</title>\n'
+ '<link href="http://localhost/entry1" />\n'
+ '<id>urn:uuid:412003af-911d-4fd4-9133-a6a4a1a37871</id>\n'
+ '<updated>2011-02-14T00:00:00+09:00</updated>\n'
+ '<summary>summary1</summary>\n'
+ '</entry>\n'
+ '<entry>\n'
+ '<title>entry2</title>\n'
+ '<link href="http://localhost/entry2" />\n'
+ '<id>urn:uuid:f94aba6c-950f-4216-9ea7-e4d32b504fd1</id>\n'
+ '<updated>2011-02-15T00:00:00+09:00</updated>\n'
+ '<summary>summar2</summary>\n'
+ '</entry>\n'
+ '</feed>';

var obj = {
	title: 'Title',
	href: 'http://localhost/',
	author: {
		name: 'Author'
	},
	entries: [
		{
			title: 'entry1',
			href: 'http://localhost/entry1',
			updated: new Date('2011/02/14'),
			summary: 'summary1'
		},
		{
			title: 'entry2',
			href: 'http://localhost/entry2',
			updated: new Date('2011/02/15'),
			summary: 'summar2'
		}
	]
}
    console.log(atom.generate(obj));
    console.log(a)

exports["atom.generate()"] = function (test) {
    test.equal(atom.generate(obj), a);
    test.done();
};
