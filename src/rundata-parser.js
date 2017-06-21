"use strict";

if (typeof require == 'function') { 
  var DOMParser = require('xmldom').DOMParser;
}
if (typeof module == 'undefined') { 
    var module = {};
}


class RundataParser {
  constructor() {
      this.raw = {};
      this.xml = "";
      this.xmlDoc = {};
  }    
  parse(rawObject) {
    this.raw = rawObject;
    var domParser = new DOMParser();
    this.xml = rawObject["xmlDefinition"];
    this.description = rawObject["description"];
    this.name = rawObject["name"];
    this.xmlDoc = domParser.parseFromString(this.xml,"text/xml");
    this.comment = this.xmlDoc.getElementsByTagName('comment')[0].childNodes[0].data;
    /*
    var description = xmlDoc.getElementsByTagName('description')[0].innerHTML;
    var comment = xmlDoc.getElementsByTagName('comment')[0].innerHTML;
    */
    return {
        "dom": this.xmlDoc,
        "description": this.description,
        "comment": this.comment,
        "name": this.name
    };
  }
}

// export {RundataParser};
module.exports = RundataParser;