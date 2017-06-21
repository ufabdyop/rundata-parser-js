"use strict";

class RundataParser {
  constructor() {
      this.raw = {};
  }    
  parse(rawObject) {
      this.raw = rawObject;
      const parsed = {};
      return parsed;
  }
}

// export {RundataParser};
module.exports = RundataParser;