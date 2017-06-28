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
    this.choices =  this.getTagsOrEmpty('choice');
    
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
        "choices": this.choices,
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
  getTagsOrEmpty(tag) {
      var returnValue = {};
      var elems = this.xmlDoc.getElementsByTagName(tag);
       if (elems) {
            for(var i = 0; i < elems.length; i++) {
                if (elems[i]) {
                    var id = elems[i].getAttribute("id");
                    if (elems[i].firstChild) {
                        returnValue[id] = elems[i].firstChild.data;
                    }
                }
            }
       }
       return returnValue;
  }
  getAttributeOrEmpty(attr) {
    var candidate = this.xmlDoc.firstChild.getAttribute(attr);
    if (candidate) {
        return candidate;
    }
    return false;
  }
}

class GenericRenderer {
  constructor() {
      this.output = "";
  }
  render(element) {
      var buffer = "";
      buffer += "<div class=\"rundata-input\" data-type=\"" + element.type + "\">\n";
      buffer += "\t<label for=\"" + element.id + "\">" + element.description + "</label>\n";
      buffer += "\t<input id=\"" + element.id + "\" name=\"" + element.id + "\"";
      if (element.min) {
          buffer += " data-min=\"" + element.min + "\""; 
      }
      if (element.max) {
          buffer += " data-max=\"" + element.max + "\""; 
      }
      if (element.required) {
          buffer += " data-required=\"true\""; 
      }
      buffer += "></input>\n";
      buffer += "\t<span class=\"rundata-units\">" + element.units + "</span>\n";
      buffer += "</div>\n";
      return buffer;      
  }
}

class DropdownRenderer {
  constructor() {
      this.output = "";
  }
  render(element) {
      var buffer = "";
      buffer += "<div class=\"rundata-input\" data-type=\"" + element.type + "\">\n";
      buffer += "\t<label for=\"" + element.id + "\">" + element.description + "</label>\n";
      buffer += "\t<select id=\"" + element.id + "\" name=\"" + element.id + "\"";
      if (element.min) {
          buffer += " data-min=\"" + element.min + "\""; 
      }
      if (element.max) {
          buffer += " data-max=\"" + element.max + "\""; 
      }
      if (element.required) {
          buffer += " data-required=\"true\""; 
      }
      buffer += ">\n";
      for( var i in element.choices) {
          buffer += "\t\t<option data-index=\"" + i + "\"" +
                            " value=\"" + element.choices[i] + "\">" +
                    element.choices[i] +
                    "</option>\n";
      }
      buffer += "\t</select>\n";
      buffer += "\t<span class=\"rundata-units\">" + element.units + "</span>\n";
      buffer += "</div>\n";
      return buffer;      
  }
}

class ElementRenderer {
  constructor() {
      this.output = "";
  }
  render(element) {
      var helper = null
      if (element.type == 'Int') {
          helper = new GenericRenderer();
          return helper.render(element);
      } else if (element.type == 'Choice') {
          helper = new DropdownRenderer();
          return helper.render(element);
      }
      return "";
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
      var recognizedTags = [
          'inputInt', 
          'inputFloat', 
          'inputString', 
          'inputChoice',
          'inputImg',
          'inputTime',
      ];
      var kids = xml.getElementsByTagName('process')[0].childNodes;
      var tempXml = "";
      var tmpInput = {};
      var serializer = new XMLSerializer();
      var elementParser = new ElementParser();
      for( var i = 0; i < kids.length; i++) {
        if (recognizedTags.indexOf(kids[i].tagName) !== -1) {
            tempXml = serializer.serializeToString(kids[i]);
            tmpInput = elementParser.parse(tempXml);
            inputs.push(tmpInput);
        } else {
            //console.log("*" + kids[i].tagName + "*");
        }
      }
      return inputs;
  }
  getHtml(xml) {
      var buffer = "";
      var renderer = new ElementRenderer();
      var parsedData = this.parse(xml);
      var xmlDoc = parsedData['dom'];
      var inputs = this.parseChildren(xmlDoc);
      for( var i in inputs ) {
          buffer += renderer.render(inputs[i]);
      }
      return buffer;
  }
}

// export {RundataParser};
module.exports.RundataParser = RundataParser;
module.exports.ElementParser = ElementParser;
module.exports.ElementRenderer = ElementRenderer;
