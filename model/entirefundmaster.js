const mongoose = require('mongoose')

var entrieFundSchema = new mongoose.Schema({
  "SCHEME_ISIN":String
},{collection:'entrieFundMaster'});

module.exports = mongoose.model('entrieFundMaster',entrieFundSchema);