"use strict";

if (typeof require == 'function') { 
  var DOMParser = require('xmldom').DOMParser;
  var XMLSerializer = require('xmldom').XMLSerializer;
}
if (typeof module == 'undefined') { 
    var module = {};
}

class ElementParser {
  constructor() {
      this.xml = "";
      this.original = "";
      this.xmlDoc = {};
      this.id = "";
      this.description = false;
      this.tag = false;
      this.type = false;
      this.units = false;
      this.cat = false;
      this.min = false;
      this.max = false;
  }
  parse(xml) {
    var domParser = new DOMParser();
    this.xml = xml;
    this.original = xml; //alias
    this.xmlDoc = domParser.parseFromString(this.xml,"text/xml");
    this.description = this.getTagOrEmpty('description');
    this.id = this.xmlDoc.firstChild.getAttribute("id");
    this.tag = this.xmlDoc.firstChild.tagName;
    this.type = this.tag.replace('input', '');
    this.units = this.getTagOrEmpty('units');
    this.min = this.getAttributeOrEmpty('min');
    this.max = this.getAttributeOrEmpty('max');
    this.cat = this.getAttributeOrEmpty('cat');
    this.required = (this.cat != "optional");
    
    return {
        "id": this.id,
        "original": this.original,
        "tag": this.tag,
        "type": this.type,
        "units": this.units,
        "description": this.description,
        "min": this.min,
        "max": this.max,
        "cat": this.cat,
        "required": this.required
    }
  }
  getTagOrEmpty(tag) {
      var elems = this.xmlDoc.getElementsByTagName(tag);
       if (elems) {
           if (elems[0]) {
               if (elems[0].firstChild) {
                   return elems[0].firstChild.data;
               }
           }
       }
       return false;
  }
  getAttributeOrEmpty(attr) {
    var candidate = this.xmlDoc.firstChild.getAttribute(attr);
    if (candidate) {
        return candidate;
    }
    return false;
  }
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
      var tempXml = "";
      var tmpInput = {};
      var serializer = new XMLSerializer();
      var elementParser = new ElementParser();
      for( var i = 0; i < kids.length; i++) {
        if (recognizedTags.indexOf(kids[i].tagName) === 0) {
            tempXml = serializer.serializeToString(kids[i]);
            tmpInput = elementParser.parse(tempXml);
            inputs.push(tmpInput);
        }
      }
      return inputs;
  }
}

// export {RundataParser};
module.exports.RundataParser = RundataParser;
module.exports.ElementParser = ElementParser;