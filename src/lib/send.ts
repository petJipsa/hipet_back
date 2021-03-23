import plivo from 'plivo';
  
const client = new plivo.Client(process.env.authID, process.env.authToken);//sms 서비스에 접속
const phone = ctx.request.body.phone;//핸드폰 번호를 국제번호로 받아옴
let num;
let rows;
let check;


  await client.messages.create(
    process.env.phoneNum,
    `${phone}`,
    `code is ${num}`
  ).then((message_created) => {
    console.log(message_created)});
  ctx.status = 201;