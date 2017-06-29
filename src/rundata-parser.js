"use strict";

if (typeof require == 'function') { 
  var DOMParser = require('xmldom').DOMParser;
  var XMLSerializer = require('xmldom').XMLSerializer;
}
if (typeof module == 'undefined') { 
    var module = {
        "exports": {}
    };
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
    this.src = this.getAttributeOrEmpty('src');
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
        "src": this.src,
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
      
      if (element.units === false) {
          element.units = "";
      }
      buffer += "\t<span class=\"rundata-units\">" + element.units + "</span>\n";
      
      buffer += "</div>\n";
      return buffer;      
  }
}

class InputImageRenderer {
  constructor() {
      this.output = "";
  }
  render(element) {
      var buffer = "";
      buffer += "<div class=\"rundata-input\" data-type=\"" + element.type + "\">\n";
      buffer += "\t<label for=\"" + element.id + "\">" + element.description + "</label>\n";
      buffer += "\t<img id=\"" + element.id + "\" src=\"" + element.src + "\"/>";
      if (element.units === false) {
          element.units = "";
      }      
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
      buffer += "\t\t<option></option>\n";
      for( var i in element.choices) {
          buffer += "\t\t<option data-index=\"" + i + "\"" +
                            " value=\"" + element.choices[i] + "\">" +
                    element.choices[i] +
                    "</option>\n";
      }
      buffer += "\t</select>\n";
      
      if (element.units === false) {
          element.units = "";
      }      
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
      if (element.type == 'Int' || 
          element.type == 'Float'|| 
          element.type == 'String'|| 
          element.type == 'Time') {
          helper = new GenericRenderer();
          return helper.render(element);
      } else if (element.type == 'Choice') {
          helper = new DropdownRenderer();
          return helper.render(element);
      } else if (element.type == 'Img') {
          helper = new InputImageRenderer();
          return helper.render(element);
      }
      return "";
  }
}

class RundataParser {
  constructor(rundataObject) {
      this.raw = {};
      this.xml = "";
      this.xmlDoc = {};
      this.inputs = [];
      this.parsedObject = {};
      if (rundataObject) {
        this.parsedObject = this.parse(rundataObject);
      }
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
        }
      }
      return inputs;
  }
  getHtml() {
      var buffer = "";
      var renderer = new ElementRenderer();
      
      buffer += "<div class=\"rundata-container\" " +
                    "data-name=\"" + this.name + "\" " + 
                    "data-comment=\"" + this.comment + "\" " + 
                    "data-description=\"" + this.description + "\">\n";
      console.log(this);
      for( var i in this.inputs ) {
          buffer += renderer.render(this.inputs[i]);
      }
      buffer += "</div>\n";
      return buffer;
  }
}

// export {RundataParser};
module.exports.RundataParser = RundataParser;
module.exports.ElementParser = ElementParser;
module.exports.ElementRenderer = ElementRenderer;
