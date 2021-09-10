const mongose = require('mongoose');

var configcwm = new mongose.Schema({
	"version" : String,
	"mediamiseIPV" : {
		"BrokCode" : String,
		"ApiKey" : String
	},
	"bseProd" : {
		"passKey" : String,
		"euin" : String,
		"MFD" : {
			"userId" : String,
			"memberId" : String,
			"password" : String
		},
		"MFI" : {
			"userId" : String,
			"memberId" : String,
			"password" : String
		},
		"MFOrder" : {
			"baseURL" : String
		},
		"StarMFPaymentGatewayService" : {
			"baseURL" : String
		},
		"StarMFWebService" : {
			"baseURL" : String
		}
	}
},{collection : 'bseConfig'})

module.exports = mongose.model('bseConfig',configcwm)