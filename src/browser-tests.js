var afmRundata = [
    {
        "description": "AFM",
        "name": "afm-bruker-dimension-icon",
        "xmlDefinition": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<process xmlns=\"http://snf.stanford.edu/rmconfig1\" id=\"afm-bruker-dimension-icon\">\n    <comment>AFM</comment>\n    <comment>$augmented</comment>\n    <description>AFM</description>\n    <inputChoice id=\"mode-used\" type=\"string\">\n        <description>Mode Used:</description>\n        <choice id=\"10\">ScanAsyst</choice>\n        <choice id=\"1\">Tapping</choice>\n        <choice id=\"2\">Contact</choice>\n        <choice id=\"3\">Peak Force QNM</choice>\n    </inputChoice>\n    <inputInt id=\"tips-used\">\n        <description>Tips Used: (enter number)</description>\n    </inputInt>\n    <inputString id=\"comments\" cat=\"optional\">\n        <description>Comments</description>\n    </inputString>\n    <inputImg id=\"staff-only\"\n        src=\"http://coral.nanofab.utah.edu/images/staff-only.gif\" alt=\"staff only\">\n        <description>The following fields are to be filled out by staff.</description>\n    </inputImg>\n    <inputTime id=\"tech-time\" cat=\"optional\">\n        <description>Technician Time</description>\n        <units>HH:MM:SS</units>\n    </inputTime>\n    <inputChoice id=\"tech-name\" cat=\"optional\" type=\"string\">\n        <description>Technician Name</description>\n        <choice id=\"0\">NA</choice>\n        <choice id=\"1\">Baker, Brian : bbaker</choice>\n        <choice id=\"2\">Cole, Paul : pcole</choice>\n        <choice id=\"3\">Fisher, Charles : cfisher</choice>\n        <choice id=\"4\">Olsen, Tony : tolsen</choice>\n        <choice id=\"5\">Perez, Paulo : jperez</choice>\n        <choice id=\"6\">Polson, Randy : rpolson</choice>\n        <choice id=\"7\">Pritchett, Steve : spritchett</choice>\n        <choice id=\"8\">Taylor, Ryan : ryant</choice>\n        <choice id=\"9\">Van Devener, Brian : vandeven</choice>\n        <choice id=\"10\">Other Staff, Add to Comments</choice>\n    </inputChoice>\n    <inputTime id=\"student-tech-time\" cat=\"optional\">\n        <description>Student Technician Time</description>\n        <units>HH:MM:SS</units>\n    </inputTime>\n    <inputChoice id=\"student-tech-name\" cat=\"optional\" type=\"string\">\n        <description>Student Technician Name</description>\n        <choice id=\"0\">NA</choice>\n        <choice id=\"1\">Burton, Dakota : dakotab</choice>\n        <choice id=\"2\">Cockrell, Jade : jadec</choice>\n        <choice id=\"3\">Earl, Brian : briane</choice>\n        <choice id=\"4\">Heaton, Tysen : tysenh</choice>\n        <choice id=\"5\">Linquata, Tyler : linquata</choice>\n        <choice id=\"6\">Meyers, John : jmeyers</choice>\n        <choice id=\"7\">Peterson, Nick : npeter</choice>\n        <choice id=\"8\">Roberts, Katherine : katherir</choice>\n        <choice id=\"9\">Shaw, Haley : haleys</choice>\n        <choice id=\"10\">Twede, Chris : ctwede</choice>\n        <choice id=\"11\">VanWeerd, Myles : vanweerd</choice>\n        <choice id=\"12\">Other Staff, Add to Comments</choice>\n    </inputChoice>\n    <inputChoice id=\"all-enable-time-is-tech-time\" cat=\"optional\"\n        displayVariable=\"true\" type=\"string\">\n        <description>Tech time includes the entire time this tool was enabled.</description>\n        <choice id=\"0\">NA</choice>\n        <choice id=\"1\">Yes</choice>\n        <choice id=\"2\">No</choice>\n    </inputChoice>\n</process>\n<!--@CLASSNAME:org.opencoral.runtime.xml.Process-->",
        "version":"2.54"
    },
    {
        "description": "Service",
        "name": "service",
        "xmlDefinition": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<process xmlns=\"http://snf.stanford.edu/rmconfig1\" id=\"service\">\n    <comment>Use this process if you are doing a quick service on the machine and do not wish to collect any data. Staff only, or by permission.</comment>\n    <comment>$augmented</comment>\n    <description>Service</description>\n    <inputString id=\"service-comments\" cat=\"optional\">\n        <description>Comments</description>\n    </inputString>\n</process>\n<!--@CLASSNAME:org.opencoral.runtime.xml.Process-->",
        "version":"2.54"
    },
    {
        "description": "Run Aborted",
        "name": "aborted",
        "xmlDefinition": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<process xmlns=\"http://snf.stanford.edu/rmconfig1\" id=\"aborted\">\n    <comment>Use this process if your run was aborted.</comment>\n    <comment>$augmented</comment>\n    <description>Run Aborted</description>\n    <inputString id=\"aborted-comments\">\n        <description>Comments</description>\n    </inputString>\n</process>\n<!--@CLASSNAME:org.opencoral.runtime.xml.Process-->",
        "version":"2.54"
    }
];

var rundataParser = new RundataParser(afmRundata[0]);

describe('DOM tests - Signup form', function() {
  var rundataContainer = document.getElementById('container');

  it('Form exists in the DOM', function() {
    expect(rundataContainer).to.not.equal(null);
  });

  it('Rundata Form renders in the DOM', function() {
    rundataParser.writeHtmlToDomId('container');
    var tag = document.getElementById("mode-used").tagName;
    expect(tag.toUpperCase()).to.equal("SELECT");
  });

  it('Rundata Form input can be filled and retrieved', function() {
    rundataParser.writeHtmlToDomId('container');
    var tipsUsed = document.getElementById("tips-used");
    tipsUsed.value = "345";
    var values = rundataParser.pullValuesFromDocument();
    expect(values[1].id).to.equal("tips-used");
    expect(values[1].value).to.equal("345");
  });
    
  it('Complete Rundata Form input can be filled and then transformed to XML', function() {
    document.getElementById("container").innerHTML = "";
    rundataParser = new RundataParser(rundataDefinitionForService);
    rundataParser.writeHtmlToDomId('container');
    var comments = document.getElementById("service-comments");
    comments.value = "Here is my comment";
    var xmlString = rundataParser.pullValuesAsXml({"agent": "coral", "item": "House Vacuum", "id": "FAKEID", "name": "service"});
    expect(xmlString).to.equal(rundataResponseForService);
  });
  
  it('only allows ints in InputInt and floats in InputFloat', function() {
    document.getElementById("container").innerHTML = "";
    rundataParser = new RundataParser(afmRundata[0]);
    rundataParser.writeHtmlToDomId('container');
    var tips = document.getElementById("tips-used");
    tips.value = "Not a number";
    var valid = rundataParser.isValid();   
    expect(valid).to.equal(false);
  });
  
  it('only HH:MM:SS in Time fields', function() {
    document.getElementById("container").innerHTML = "";
    rundataParser = new RundataParser(afmRundata[0]);
    rundataParser.writeHtmlToDomId('container');

      document.getElementById("tips-used").value = "1"; //just to pass required check
      document.getElementById("mode-used").selectedIndex = 1; //just to pass required check
    
    var field = document.getElementById("tech-time");
    field.value = "Not a number";
    var valid = rundataParser.isValid();   
    expect(valid).to.equal(false);

    field.value = "12:14:01";
    var valid = rundataParser.isValid();   
    expect(valid).to.equal(true);
  });
  
  it('checks required fields', function() {
    document.getElementById("container").innerHTML = "";
    rundataParser = new RundataParser(afmRundata[0]);
    rundataParser.writeHtmlToDomId('container');
    var field = document.getElementById("tips-used");
    field.value = "";
    var valid = rundataParser.isValid();   
    expect(valid).to.equal(false);
  });
    
  it('AFM Rundata Form input can be filled and then transformed to XML', function() {
    document.getElementById("container").innerHTML = "";
    rundataParser = new RundataParser(afmRundata[0]);
    rundataParser.writeHtmlToDomId('container');
    var comments = document.getElementById("comments");
    comments.value = "Here is my comment";

    var mode = document.getElementById("mode-used");
    mode.selectedIndex = 1;
          
    var xmlString = rundataParser.pullValuesAsXml({"agent": "coral", "item": "House Vacuum", "id": "FAKEID"});

    var dp = new DOMParser();
    var indexValue = dp.parseFromString(xmlString, "text/xml").getElementsByTagName('element')[0].children[2].childNodes[0].data;
    
    expect(indexValue).to.equal("10");
  });
    
    
});

var rundataDefinitionForService = {"name":"service","version":"2.54","description":"Service","xmlDefinition":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<process xmlns=\"http://snf.stanford.edu/rmconfig1\" id=\"service\">\n    <comment>Use this process if you are doing a quick service on the machine and do not wish to collect any data. Staff only, or by permission.</comment>\n    <comment>$augmented</comment>\n    <description>Service</description>\n    <inputString id=\"service-comments\" cat=\"optional\">\n        <description>Comments</description>\n    </inputString>\n</process>\n<!--@CLASSNAME:org.opencoral.runtime.xml.Process-->"};
var rundataResponseForService = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
<rmRunData xmlns=\"http://snf.stanford.edu/rmconfig1\" name=\"service\"\n\
    version=\"2.54\" agent=\"coral\" item=\"House Vacuum\" lot=\"not assigned\"\n\
    viewlock=\"not locked\"\n\
    id=\"FAKEID\"\n\
    autosaved=\"false\" active=\"false\">\n\
    <element>\n\
        <key>service-comments</key>\n\
        <stringValue>Here is my comment</stringValue>\n\
        <fieldType>InputString</fieldType>\n\
    </element>\n\
</rmRunData>\n\
<!--@CLASSNAME:org.opencoral.runtime.xml.RmRunData-->";

