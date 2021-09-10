const mongose = require('mongoose');
// const connection = mongoose.createConnection('mongodb://localhost:27017/node_db', {useNewUrlParser: true});


var bseConfig = new mongose.Schema({
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
})

module.exports = mongoose.model('bseConfig',bseConfig);

// const mongose = require('mongoose');

// var configcwm = new mongose.Schema({
// 	bseUserId:String,
// 	bseMemberId:String,
// 	password: String
// })

// module.exports = mongose.model('cwmconfig',configcwm)


// const mongose = require('mongoose');

// var configcwm = new mongose.Schema({
// 	"name" : String,
// 	"email" : String,
// 	"mobile" : String,
// 	"dob" : String,
// 	"pan" : String,
// })

// module.exports = mongose.model('basicdetails',configcwm)