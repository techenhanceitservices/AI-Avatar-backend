
// async function aadharVerification({aadharNumber}) {
//   console.log('aadharVerification', aadharNumber);
//   return {response: 'OTP sent to your registered mobile number'};
// };

// async function OTPVerification({otp}) {
//   console.log('OTPVerification', otp);
//   return {response: 'OTP verified successfully'};
// };

const axios = require('axios');
const xml2js = require('xml2js');

async function aadharVerification (aadhaarNumber) {
  const panNumber = `6080220${aadhaarNumber}`;
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<OtpRequest>
    <TransactionInfo>
        <Pan>${panNumber}</Pan>
        <Proc_Code>130000</Proc_Code>
        <Transm_Date_time>0720013030</Transm_Date_time>
        <Stan>242796</Stan>
        <Local_Trans_Time>013030</Local_Trans_Time>
        <Local_date>0720</Local_date>
        <Mcc>6012</Mcc>
        <Pos_entry_mode>019</Pos_entry_mode>
        <Pos_code>05</Pos_code>
        <AcqId>200217</AcqId>
        <RRN>24202242796</RRN>
        <CA_Tid>register</CA_Tid>
        <CA_ID>SRY000000008000</CA_ID>
        <CA_TA>Koramangala 2nd Block BANGALORE KAIN</CA_TA>
    </TransactionInfo>
    <Otp uid="${aadhaarNumber}" ac="STGSSFB001" sa="STGSSFB001" ver="2.5" txn="242796" lk="MEcN0q-g7xMyQdSHv48wQ7Kpdg5x4nxa3j9incv9wGCVxD2_cbxG2Uc" type="A">
        <Opts ch="01"/>
    </Otp>
</OtpRequest>`;

    try {
        const response = await axios.post(
            'http://137.117.104.94:80/api/ekyc-otp?api_key=kyqak5muymxcrjhc5q57vz9v',
            xmlData,
            {
                headers: {
                    'Accept': 'application/xml',
                    'Content-Type': 'application/xml'
                }
            }
        );
        console.log('---------', response.data);
        let responseMessage;
        xml2js.parseString(response.data, (err, result) => {          
          responseMessage = result.Response.ResponseMessage[0];
        }
        );
      console.log('---------', responseMessage);
      if (responseMessage === 'Approved') {
        console.log('---------Approved', aadhaarNumber);
        return {response: 'OTP sent to your registered mobile number'};
      } if (responseMessage === 'Data Error') {
        console.log('---------Failed', aadhaarNumber);
        return {response: 'Failed to send OTP. Please try again with correct aadhar card number.'};
      } if (responseMessage == 'OTP Flooding - Please avoid trying to generate the OTP multiple times within short time.'){
        console.log('---------OTP Flooding', aadhaarNumber);
        return {response: 'OTP Flooding - Please avoid trying to generate the OTP multiple times within short time.'};
      }
    } catch (error) {
        console.error('Error sending OTP request:', error);
    }
};

async function OTPVerification(aadhaarNumber,otp) {
    const jsonData = {
        "otp": `${otp}`,
        "stan": "242796",
        "aadhaarNumber": `${aadhaarNumber}`,
    };
    console.log('----------OTPVerification', jsonData);

    try {
        const response = await axios.post(
            'http://137.117.104.94:8080/api/ekyc/v2?api_key=kyqak5muymxcrjhc5q57vz9v',
            jsonData,
            {
                headers: {
                    'X-Request-ID': 'TNC',
                    'X-Correlation-ID': '789456123789456',
                    'X-User-ID': '12345',
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('eKYC Request Response:', response.status);
        if (response.status === 200){
        return {response: 'OTP verified successfully'};
        } else {
          return {response: 'The OTP you entered is incorrect. Please try again.'};
        }
    } catch (error) {
      return {response: 'The OTP you entered is incorrect. Please try again.'};
    }
};

module.exports = {
  aadharVerification,
  OTPVerification
};

