# LooseLeaf

This branch will ad the ability to have e blog run at a set baseURL.
Using this version together with nginx reverse_proxy will allow you to run multiple blog instances on one port ( e.g. port 80 )
<pre>
  nginx.conf 
  http {
    server {
    location /blog {
      reverse_proxy 127.0.0.1:3000;
    }
    location /blog2 {
      reverse_proxy 127.0.0.1:3001;
    }
    }
  }

  conf.json
    "loc": "/blog", ...

</pre>

Lightweight blog engine running on [node.js][] and [express][].

	$ npm install -g looseleaf
	$ looseleaf yourblog
	$ node ./yourblog/app.js
	"yourblog" server listening on port 3000

[node.js]: http://nodejs.org/
[express]: http://expressjs.com/

## Demo

* [http://blog.looseleafjs.org/][] (v0.3, Developer's blog written in Japanese)
* [http://blog2.looseleafjs.org/][] (v0.4, Sandbox for everyone)

[http://blog.looseleafjs.org/]: http://blog.looseleafjs.org/
[http://blog2.looseleafjs.org/]: http://blog2.looseleafjs.org/

## License 

The MIT License

