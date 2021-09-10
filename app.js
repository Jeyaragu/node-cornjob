const express   = require('express');
const mongoose  = require('mongoose');
const cron      = require('node-cron');

const app = express();
const port = process.env.port || 8080;

// const stocks = require('./routes/stocks');
// const test = require('./routes/testing');
// const xmlapi = require('./routes/xmlapis');
// const datadb = require('./routes/readindb');
const entirefund = require('./routes/entirefunds')

mongoose.connect('mongodb://localhost:27017/node_db',{useNewUrlParser: true,
useUnifiedTopology: true}).then(()=>{
  app.listen(port);
  console.log('App Listing With Port '+port);
}).catch((err)=>{
  console.log(err);
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use('/',schemeMaster);
// app.use('/',test);

// let d = new Date();
// console.log(`${d.getFullYear()}${d.getMonth()}${d.getDate()}${d.getSeconds()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}`);
module.exports = app;