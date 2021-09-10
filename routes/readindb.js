const express = require('express');
const constcwm = require('../model/bseConfig');
const router = express.Router();

constcwm.aggregate([{$project:{"bseProd.MFD.password":1,"_id":0}}]).then((result)=>{
  console.log(result);
}).catch((err)=>{
  console.log(err);
})


// var a = bseConfig.find({})
// console.log(a)
// bseConfig.find({},(err,bseConfig)=>{
//   console.log(bseConfig);
// })
// constcwm.find({}).then(result=>{
//   console.log("Result",result)
// })
