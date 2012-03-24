# LooseLeaf

This branch will ad the ability to have e blog run at a set baseURL.
Using this version together with nginx reverse_proxy will allow you to run multiple blog instances on one port ( e.g. port 80 )
<pre>
  nginx.conf 
  worker_processes 1;
  events { 
    worker_connections 1024;
    use epoll;
  }
  http {
    include conf.d/*.conf
    server {
      listen 80;
      server_name localhost;
      
      location /blog {
        proxy_pass http://127.0.0.1:3000/blog;
        proxy_redirect off;
        proxy_set_header $host;
      }
      location /blog2 {
        proxy_pass http://127.0.0.1:3001/blog2;
        reverse_proxy off;
        proxy_set_header $host;
      }
    }
  }

  conf.json
  {
    "site" : {
      "title" : "AstraNOS blog"
    },
   "copyright" : {
       "title" : "AstraNOS",
      "uri" : "http://www.AstraNOS.org/"
    },
    "session" : {
      "secret" : "AstraNOS"
    },
    "process" : {
      "port"  : "3000",
      "loc"   : "/blog",
      "logging" : true
    },
    "analytics_id" : "",
    "disqus_shortname" : "",
    "usersNav": {
      "enable" : true,
    "lead" : []  
   }
 }

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

