
/*
 * onDOMReady
 * Copyright (c) 2010 Ryan Morr (ryanmorr.com)
 * Licensed under the MIT license.
 */


ClientExpress.onDomReady = function(fn, ctx){

	//Responsible for handling events and each tick of the interval
	var onStateChange = function (event){
		//IE compatibility
		event = event || window.event;
		//Mozilla, Opera, & Legacy
		if(event && event.type && (/DOMContentLoaded|load/).test(event.type)) {
			fireDOMReady();
		//Legacy	
		} else if(document.readyState) {
			if ((/loaded|complete/).test(doc.readyState)) {
				fireDOMReady();
			//IE, courtesy of Diego Perini (http://javascript.nwbox.com/IEContentLoaded/)
			} else if(document.documentElement.doScroll) {
				try {
					ready || document.documentElement.doScroll('left');
				} catch(ex) {
					return;
				}
				//If no error was thrown, the DOM must be ready
				fireDOMReady();
			}
		}
	};
	
	//Fires all the functions and cleans up memory
	var fireDOMReady = function() {
		if (!ready) {
			ready = true;
			//Call the stack of onload functions in given context or window object
			for (var i=0, len=stack.length; i < len; i++) {
				stack[i][0].call(stack[i][1]);	
			}
			//Clean up after the DOM is ready
			if (document.removeEventListener) {
				document.removeEventListener("DOMContentLoaded", onStateChange, false);
			}
			//Clear the interval	
			clearInterval(timer);
			//Null the timer and event handlers to release memory
			document.onreadystatechange = window.onload = timer = null;
		}
	};



	var timer, doc = window.document, ready = false, setup = false, stack = [];
	//Normalize the context of the callback
	ctx = ctx || window;
	if(ready){
		//If the DOM is ready, call the function and return
		fn.call(ctx);
		return;
	}
	if(!setup){
		//We only need to do this once
		setup = true;
		//Mozilla & Opera
		if(document.addEventListener) {
			document.addEventListener("DOMContentLoaded", onStateChange, false);
		}
		//Safari & IE
		timer = setInterval(onStateChange, 5);
		//IE & Legacy
		document.onreadystatechange = window.onload = onStateChange;
	}
	//Add the function to the stack
	stack.push([fn, ctx]);


};
