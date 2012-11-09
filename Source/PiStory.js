/*
--- 
description: PiStory
authors: 
- David Chan CK
license:
- MIT-style license
requires: 
- core/1.4.5: '*'
- more/1.4.0.1: [Types.URI]
provides: [PiStory]
...
*/
var PiStory = new Class
({
  Implements: [Events, Options],
  options:
  {
  /*
    onLoad: $empty(thisElement, event),
    onProcessStart: $empty(thisElement, event),
    onProcessEnd: $empty(thisElement, event),
  */
    watched: null,       // Watched parent (optional); if used, uses delegation, else, will use $$.
    dataAttributes: {
      title: 'data-title',
      source: 'data-source',
      destination: 'data-destination'
    }
  }
});

// Static vars and functions
PiStory.extend({
	_elements: [],
	findElementByKey: function(key) {
		var _found = null;
		PiStory._elements.some(function(_element) {
			if (_element.retrieve('PiStoryKey') == key) {
				_found = _element;
				return true;
			}
			return false;
		});
		return _found;
	}
});

PiStory.implement({
  initialize: function(elements, options)
  {
	if (window.history && window.history.pushState) {
	    this.setOptions(options);
	    var opts = this.options;

	    PiStory._elements = $$(elements);
	    if (PiStory._elements && PiStory._elements.length) {
	      this.build();
	    }	
	}
	else {
		return;
	}
  },
  build: function() {

	  var dataOpts = this.options.dataAttributes;
	  history.pushState({
		url: location.href,
	    source: document.body.getAttribute(dataOpts.source),
	    destination: document.body.getAttribute(dataOpts.destination)
	  }, "", location.href);
	
      this.buildPushState();
	  this.buildPopState();
      return;

  },
  buildPushState: function() {
    PiStory._elements.each(function(_anchor, i) {
	  _anchor.store('PiStoryKey', i);
      _anchor.addEvent('click', this.handlePushState.bind(this, _anchor));
    }.bind(this));
  },
  buildPopState: function() {
	Element.NativeEvents.popstate = 2;
    window.addEvent('popstate', this.handlePopState.bind(this));
  },
  handlePopState: function(obj) {
	if (obj.event.state) {
		var _element = PiStory.findElementByKey(obj.event.state.key) || document.body;

	    new Request.HTML({
	      url: obj.event.state.url,
	      evalScripts: false,
	      onSuccess: this.replaceContent.bind(this, _element)
	    }).get();	
	}
  },
  handlePushState: function(_anchor, e) {
    e.stop();
    var dataOpts = this.options.dataAttributes;
    var stateObj = {
      key: _anchor.retrieve('PiStoryKey'),
      url: _anchor.get('href'),
      source: _anchor.getAttribute(dataOpts.source),
      destination: _anchor.getAttribute(dataOpts.destination)
    };
	history.pushState(stateObj, "", _anchor.get('href'));
    
    new Request.HTML({
      url: _anchor.get('href'),
      evalScripts: false,
      onSuccess: this.replaceContent.bind(this, _anchor)
    }).get();
  },
  replaceContent: function(_element, responseTree, responseElements, responseHTML, responseJavaScript) {
    var dataOpts = this.options.dataAttributes;
    var sourceSelector = _element.getAttribute(dataOpts.source);
    var sourceContent = responseElements.getElement(sourceSelector);
    sourceContent = (sourceContent) ? sourceContent[0].get('html') : '';
    
    var destinationSelector = _element.getAttribute(dataOpts.destination);
    if (!destinationSelector) {
      destinationSelector = sourceSelector;
    }
    
    var _destination = document.body.getElement(destinationSelector);
    _destination.set('html', sourceContent);
    
    this.fireEvent('replace', _element);
  }
});
