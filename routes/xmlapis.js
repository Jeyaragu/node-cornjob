const express = require('express');
const soapRequest = require('easy-soap-request');
const xml2json = require('xml-js');
const router    = express.Router();

let d = new Date();
var transNo=`${d.getFullYear()}${d.getMonth()}${d.getDate()}${d.getSeconds()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}`;

let uid = 1043805;
const url ='https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc/Secure';
const header = {
    'Content-Type':'application/soap+xml'
}
const xmlbody = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:bses="http://bsestarmf.in/">
<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Action>http://bsestarmf.in/MFOrderEntry/getPassword</wsa:Action><wsa:To>https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc/Secure</wsa:To></soap:Header>
<soap:Body>
   <bses:getPassword>
      <!--Optional:-->
      <bses:UserId>${uid}</bses:UserId>
      <!--Optional:-->
      <bses:Password>chola@123</bses:Password>
      <!--Optional:-->
      <bses:PassKey>ragu@123</bses:PassKey>
   </bses:getPassword>
</soap:Body>
</soap:Envelope>`;

const xmlresponse = soapRequest({url:url,headers:header,xml:xmlbody}).then(({response:{body,statusCode}})=>{
    // console.log(statusCode);
    let jsondata = xml2json.xml2json(body,{compact: true, spaces: 4});
    jsondata = JSON.parse(jsondata)
    const code = jsondata['s:Envelope']['s:Body']['getPasswordResponse']['getPasswordResult']['_text'];
    var status = code.slice(0,3);
    // var status = code.substring(4);
    // console.log(status);
    if(status == '100'){
        let password = code.substring(4);
        console.log(password);
      const orderEntryBody = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:bses="http://bsestarmf.in/">
      <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Action>http://bsestarmf.in/MFOrderEntry/orderEntryParam</wsa:Action><wsa:To>https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc/Secure</wsa:To></soap:Header>
      <soap:Body>
         <bses:orderEntryParam>
            <!--Optional:-->
            <bses:TransCode>NEW</bses:TransCode>
            <!--Optional:-->
            <bses:TransNo>${transNo}</bses:TransNo>
            <!--Optional:-->
            <bses:OrderId></bses:OrderId>
            <!--Optional:-->
            <bses:UserID>1043805</bses:UserID>
            <!--Optional:-->
            <bses:MemberId>10438</bses:MemberId>
            <!--Optional:-->
            <bses:ClientCode>P00051</bses:ClientCode>
            <!--Optional:-->
            <bses:SchemeCd>02</bses:SchemeCd>
            <!--Optional:-->
            <bses:BuySell>P</bses:BuySell>
            <!--Optional:-->
            <bses:BuySellType>FRESH</bses:BuySellType>
            <!--Optional:-->
            <bses:DPTxn>P</bses:DPTxn>
            <!--Optional:-->
            <bses:OrderVal>10000</bses:OrderVal>
            <!--Optional:-->
            <bses:Qty></bses:Qty>
            <!--Optional:-->
            <bses:AllRedeem>N</bses:AllRedeem>
            <!--Optional:-->
            <bses:FolioNo></bses:FolioNo>
            <!--Optional:-->
            <bses:Remarks></bses:Remarks>
            <!--Optional:-->
            <bses:KYCStatus>Y</bses:KYCStatus>
            <!--Optional:-->
            <bses:RefNo></bses:RefNo>
            <!--Optional:-->
            <bses:SubBrCode></bses:SubBrCode>
            <!--Optional:-->
            <bses:EUIN>E026424</bses:EUIN>
            <!--Optional:-->
            <bses:EUINVal>N</bses:EUINVal>
            <!--Optional:-->
            <bses:MinRedeem>N</bses:MinRedeem>
            <!--Optional:-->
            <bses:DPC>Y</bses:DPC>
            <!--Optional:-->
            <bses:IPAdd></bses:IPAdd>
            <!--Optional:-->
            <bses:Password>${password}</bses:Password>
            <!--Optional:-->
            <bses:PassKey>ragu@123</bses:PassKey>
            <!--Optional:-->
            <bses:Parma1></bses:Parma1>
            <!--Optional:-->
            <bses:Param2></bses:Param2>
            <!--Optional:-->
            <bses:Param3></bses:Param3>
         </bses:orderEntryParam>
      </soap:Body>
   </soap:Envelope>`;
    const orderEntryResponse =soapRequest({url:url,headers:header,xml:orderEntryBody}).then(({response:{body,orderStatusCode}})=>{
        console.log(body);
        let orderResponseToJson = xml2json.xml2json(body,{compact: true, spaces: 4});
        console.log(orderResponseToJson)
        orderResponseToJson = JSON.parse(orderResponseToJson)
        const orderResponse = orderResponseToJson['s:Envelope']['s:Body']["orderEntryParamResponse"]["orderEntryParamResult"]['_text'];
        let orderStatus = orderResponse.slice(-1);
        if(orderStatus =='0'){
            console.log('Order Number is '+ orderResponse.substring(21,29));
            // console.log(b.substring(51,1000)) -- Printing the message.
        }
    }).catch((orderail)=>{
        console.log(orderail);
    })
} 
}).catch((errorxml)=>{
    console.log(errorxml)
});

module.exports = router;