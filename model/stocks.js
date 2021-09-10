const mongoose  = require('mongoose');

var stocks = new mongoose.Schema({
      "AveragePrice": Number,
      "Exchange": String,
      "ExpiryDate": String,
      "FolioNumber": String,
      "Gain": Number,
      "Gainper": Number,
      "HoldingSubType": String,
      "HoldingType": String,
      "InstName": String,
      "InvestEndDate": String,
      "InvestStartDate": String,
      "InvestedAmount": Number,
      "InvestedAmountOrg": Number,
      "LivePrice": Number,
      "MarketValue": Number,
      "OptionType": String,
      "PrevClose": Number,
      "Product": String,
      "Quantity": Number,
      "ScripCode": String,
      "StrikePrice": String,
      "TransactionDate": String,
      "sector": String,
      "stockname": String
})

module.exports  = mongoose.model('stocks',stocks);