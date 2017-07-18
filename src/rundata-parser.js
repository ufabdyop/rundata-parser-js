"use strict";
var RundataParserVersion = "1.0.0";

if (typeof require == 'function') { 
  var DOMParser = require('xmldom').DOMParser;
  var XMLSerializer = require('xmldom').XMLSerializer;
}
if (typeof module == 'undefined') { 
    var module = {
        "exports": {}
    };
}

function escapeXml(unsafe) {
    if (typeof unsafe == 'undefined') {
        return "";
    }
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
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
    this.subtype = this.xmlDoc.firstChild.getAttribute("type");
    this.tag = this.xmlDoc.firstChild.tagName;
    this.type = this.tag.replace('input', '');
    this.units = this.getTagOrEmpty('units');
    this.staffOnly = this.getAttributeOrEmpty('staffOnly');
    this.min = this.getAttributeOrEmpty('min');
    this.max = this.getAttributeOrEmpty('max');
    this.cat = this.getAttributeOrEmpty('cat');
    this.src = this.getAttributeOrEmpty('src');
    this.required = (this.cat != "optional");
    this.choices = this.getTagsOrEmpty('choice');
    
    
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
        "staffOnly": this.staffOnly,
        "subtype": this.subtype,
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
      var returnValue = [];
      var elems = this.xmlDoc.getElementsByTagName(tag);
       if (elems) {
            for(var i = 0; i < elems.length; i++) {
                if (elems[i]) {
                    var id = elems[i].getAttribute("id");
                    if (elems[i].firstChild) {
                        returnValue.push({"id": id, "value": elems[i].firstChild.data});
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
      buffer += "<div class=\"rundata-input\" data-type=\"" + element.type + "\""; 
      if (element.staffOnly) {
          buffer += " data-staff-only=\"true\"";
      }
      buffer += ">\n";
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
      buffer += "<div class=\"rundata-input\" data-type=\"" + element.type + "\""; 
      if (element.staffOnly) {
          buffer += " data-staff-only=\"true\"";
      }
      buffer += ">\n";
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
      buffer += "<div class=\"rundata-input\" data-type=\"" + element.type + "\""; 
      if (element.staffOnly) {
          buffer += " data-staff-only=\"true\"";
      }
      buffer += ">\n";
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
          buffer += "\t\t<option data-index=\"" + element.choices[i].id + "\"" +
                            " value=\"" + element.choices[i].value + "\">" +
                    element.choices[i].value +
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
    this.version = (rawObject["version"] ? rawObject["version"] : "") ;
    this.name = rawObject["name"];
    this.xmlDoc = domParser.parseFromString(this.xml,"text/xml");
    this.comment = this.xmlDoc.getElementsByTagName('comment')[0].childNodes[0].data;
    this.inputs = this.parseChildren(this.xmlDoc);
    
    return {
        "dom": this.xmlDoc,
        "description": this.description,
        "comment": this.comment,
        "name": this.name,
        "inputs": this.inputs,
        "version": this.version
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
      for( var i in this.inputs ) {
          buffer += renderer.render(this.inputs[i]);
      }
      buffer += "</div>\n";
      return buffer;
  }
  writeHtmlToDomId(id) {
      var html = this.getHtml();
      document.getElementById(id).innerHTML = html;
  }
  pullValuesFromDocument() {
      var returnArray = [];
      for( var i in this.inputs) {
          var id = this.inputs[i].id;
          var element = document.getElementById(id);
          var value = element.value;
          returnArray.push({"id": id, "value": value});
      }
      return returnArray;
  }
  
  /**
   * 
   * @param {type} options
   *    expecting keys of: name, version, agent (or username), item, and optionally id
   * @returns {RundataParser.pullValuesAsXml.buffer|String}
   */
  pullValuesAsXml(options) {
        if (!options.id) {
            options.id = "not assigned";
        }
        if (!options.agent) {
            options.agent = options.username;
        }
      var buffer = "";
      buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<rmRunData xmlns=\"http://snf.stanford.edu/rmconfig1\" name=\"" + options.name + "\"\n" +
                    "    version=\"" + this.version + "\" agent=\"" + options.agent + "\" item=\"" + options.item + "\" lot=\"not assigned\"\n" +
                    "    viewlock=\"not locked\"\n" +
                    "    id=\"" + options.id + "\"\n" +
                    "    autosaved=\"false\" active=\"false\">\n";
      for( var i in this.inputs) {
          var id = this.inputs[i].id;
          var element = document.getElementById(id);
          var value = element.value;
          //console.log(this.inputs[i]);
          if (this.inputs[i].type == 'Choice') {
            var integerIndex = element.options[element.selectedIndex].dataset.index;
            if (!integerIndex) {
                integerIndex = "";
            }

            buffer += "    <element>\n" +
                    "        <key>" + id + "</key>\n" +
                    "        <stringValue>" + escapeXml(value) + "</stringValue>\n" +
                    "        <intValue>" + integerIndex + "</intValue>\n" +
                    "        <fieldType>Input" + this.inputs[i].type + "</fieldType>\n" +
                    "        <fieldSubtype>" + this.inputs[i].subtype + "</fieldSubtype>\n" +
                    "    </element>\n";  
          } else if (this.inputs[i].type == 'Int') {
            buffer += "    <element>\n" +
                    "        <key>" + id + "</key>\n" +
                    "        <intValue>" + escapeXml(value) + "</intValue>\n" +
                    "        <fieldType>Input" + this.inputs[i].type + "</fieldType>\n" +
                    "    </element>\n";
          } else {
            buffer += "    <element>\n" +
                    "        <key>" + id + "</key>\n" +
                    "        <stringValue>" + escapeXml(value) + "</stringValue>\n" +
                    "        <fieldType>Input" + this.inputs[i].type + "</fieldType>\n" +
                    "    </element>\n";
          }
      }
      buffer += "</rmRunData>\n" +
                "<!--@CLASSNAME:org.opencoral.runtime.xml.RmRunData-->";
      
      return buffer;
  }
  
  /**
   * 
   * @param {type} options
   *    expecting keys of: name, version, agent, item, and optionally id
   * @returns {RundataParser.pullValuesAsXml.buffer|String}
   */
  pullValuesForApi(options) {
      var xml = this.pullValuesAsXml(options);
      var ob = {
          "description": options.description,
          "name": options.name,
          "version": options.version,
          "xmlDefinition": xml
      };
      return ob;
  }
  
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}


// export {RundataParser};
module.exports.RundataParser = RundataParser;
module.exports.ElementParser = ElementParser;
module.exports.ElementRenderer = ElementRenderer;
