// client.express.js JavaScript Routing, version: 0.7.4
// (c) 2011 Mark Nijhof
//
//  Released under MIT license.
//
require.modules["ejs_original.js"]=require.modules["ejs.js"];
require.register("ejs.js",function(i,f,g){function h(){if(typeof XMLHttpRequest!="undefined")return new XMLHttpRequest;else if(window.ActiveXObject)for(var a=["Microsoft.XmlHttp","MSXML2.XmlHttp","MSXML2.XmlHttp.3.0","MSXML2.XmlHttp.4.0","MSXML2.XmlHttp.5.0"],b=a.length-1;b>=0;b--)try{return httpObj=new ActiveXObject(a[b])}catch(d){}throw Error("XMLHttp (AJAX) not supported");}f.compile=function(a,b){var d=this,c=d.template_cache.get(a);if(c==""){var e=h();e.open("GET",a,!1);e.onreadystatechange=
function(){if(this.readyState==4&&this.status==200)c=this.responseText,d.template_cache.set(a,c)};e.send()}return g("ejs_original").render(c,{locals:b})};f.template_cache={get:function(a){return this.templates.hasOwnProperty(a)?this.templates[a]:""},set:function(a,b){this.templates[a]=b},templates:{}}});
