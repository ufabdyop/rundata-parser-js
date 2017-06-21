"use strict";

class RundataParser {
  constructor() {
      this.raw = {};
  }    
  parse(rawObject) {
      this.raw = rawObject;
  }
}

// export {RundataParser};
module.exports = RundataParser;