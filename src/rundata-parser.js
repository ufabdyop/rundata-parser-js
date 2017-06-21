"use strict";

if (typeof require == 'function') { 
  var DOMParser = require('xmldom').DOMParser;
  var XMLSerializer = require('xmldom').XMLSerializer;
}
if (typeof module == 'undefined') { 
    var module = {};
}

class RundataParser {
  constructor() {
      this.raw = {};
      this.xml = "";
      this.xmlDoc = {};
      this.inputs = [];
  }    
  parse(rawObject) {
    this.raw = rawObject;
    var domParser = new DOMParser();
    this.xml = rawObject["xmlDefinition"];
    this.description = rawObject["description"];
    this.name = rawObject["name"];
    this.xmlDoc = domParser.parseFromString(this.xml,"text/xml");
    this.comment = this.xmlDoc.getElementsByTagName('comment')[0].childNodes[0].data;
    this.inputs = this.parseChildren(this.xmlDoc);
    /*
    var description = xmlDoc.getElementsByTagName('description')[0].innerHTML;
    var comment = xmlDoc.getElementsByTagName('comment')[0].innerHTML;
    */
    return {
        "dom": this.xmlDoc,
        "description": this.description,
        "comment": this.comment,
        "name": this.name,
        "inputs": this.inputs
    };
  }
  parseChildren(xml) {
      var inputs = [];
      var recognizedTags = ['inputInt'];
      var kids = xml.getElementsByTagName('process')[0].childNodes;
      var tmpInput = {};
      var serializer = new XMLSerializer();
      for( var i = 0; i < kids.length; i++) {
        if (recognizedTags.indexOf(kids[i].tagName) === 0) {
            tmpInput = {
                "id": kids[i].id,
                "dom": kids[i],
                "original": serializer.serializeToString(kids[i]),
                "tag": kids[i].tagName,
                "type": kids[i].tagName.replace('input', '')
            };
            inputs.push(tmpInput);
        }
      }
      return inputs;
  }
}

// export {RundataParser};
module.exports = RundataParser;