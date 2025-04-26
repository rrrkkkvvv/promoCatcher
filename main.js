const WebSocket = require('ws');
const tmi = require('tmi.js');
const pkg = require("dotenv");

pkg.config();

const dotenvVars = {
  password: process.env.PASSWORD,
  username: process.env.DB_USER_NAMEHOST,
   
};
 
const wss = new WebSocket.Server({ port: 8080 });
let sockets = [];

wss.on('connection', ws => {
  sockets.push(ws);
  ws.on('close', () => {
    sockets = sockets.filter(s => s !== ws);
  });
});

const promoRegex = /^[0-9A-F()+-]+$/;
const couponRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
 
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: dotenvVars.username ,
    password:  dotenvVars.password,
  },
  channels: [  "megarush51", "k0chet", "j05k1y","casebattle_official" ],
 });

client.connect();

client.on("message", (channel, tags, message, self) => {
  if (self) return;
  let trimedMessage = message.trim()
  if((tags.username === "g1fl_"|| tags.username ==="casebattle_official" || tags.username ==="ggayci") && couponRegex.test(trimedMessage)){
    sockets.forEach(ws => ws.send(JSON.stringify({type:"coupon", text: trimedMessage})));
  }else if ((tags.username === "g1fl_" ||tags.username === "k0chet" || tags.username === "megarush51" || tags.username === "j05k1y")  && promoRegex.test(trimedMessage)) {

      console.log("Promo found:", trimedMessage);
      const rebuslessMessage = message.replace(/\(([^()]+)\)/g, (match, expression) => {
        try {
          const result = eval(expression);  
          return result.toString();
        } catch (e) {
          return match;  
        }
      });
      sockets.forEach(ws => ws.send(JSON.stringify({type:"promo", text: rebuslessMessage})));
 
  }
});