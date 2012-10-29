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
});

PiStory.implement({
  initialize: function(elements, options)
  {
    this.setOptions(options);
    var opts = this.options;

    this._elements = $$(elements);
    if (this._elements && this._elements.length) {
      this.build();
    }
  },
  build: function() {
    if (window.history && window.history.pushState) {
      this.buildPushState();
      return;
    }
    
  },
  buildPushState: function() {
    this._elements.each(function(_anchor) {
      _anchor.addEvent('click', this.handlePushState.bind(this, _anchor));
    }.bind(this));
  },
  handlePushState: function(_anchor, e) {
    e.stop();
    var dataOpts = this.options.dataAttributes;
    var stateObj = {
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
  replaceContent: function(_anchor, responseTree, responseElements, responseHTML, responseJavaScript) {
    var dataOpts = this.options.dataAttributes;
    var sourceSelector = _anchor.getAttribute(dataOpts.source);
    var sourceContent = responseElements.getElement(sourceSelector);
    sourceContent = (sourceContent) ? sourceContent[0].get('html') : '';
    
    var destinationSelector = _anchor.getAttribute(dataOpts.destination);
    if (!destinationSelector) {
      destinationSelector = sourceSelector;
    }
    
    var _destination = document.body.getElement(destinationSelector);
    _destination.set('html', sourceContent);
    
    eval(_anchor.getAttribute('data-callback'));
  }
});
