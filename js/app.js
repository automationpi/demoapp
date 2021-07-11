const datapi = require('pidata');
const crypto = require("crypto");
const helper = require('./helper');
var faker = require('faker');

//generate integer in a range
function intInRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


  //capitalize first character of a string
  function sentanceCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//generate unique number of specified length
datapi.dataHandler.get('/random', async (request, reply) => {
    var randomNumber = Math.ceil(Math.random() * ((request.query.max == undefined) ? 1000 : parseInt(request.query.max))) + 1; 
    return  (JSON.stringify({random: randomNumber}));
  })

  //generated uniqueid
  datapi.dataHandler.get('/uuid', async (request, reply) => {
    const uid = crypto.randomBytes( ((request.query.length == undefined) ? 16 : parseInt(request.query.length))).toString("hex");
    return (JSON.stringify({uuid :uid }));
  })

   //generated uniqueid
  datapi.dataHandler.get('/faker', async (request, reply) => {
    const uid = faker.internet.email();
    return (JSON.stringify({uuid :uid }));
  })

  //generates random names can be configured in helper.js
  datapi.dataHandler.get('/emails', async (request, reply) => {
  var name1 = helper.firstName;
  var name2 = helper.lastName;
  var domains = helper.domains;

  var firstName = (name1[intInRange(0, name1.length + 1)]);
  var lastName = (name2[intInRange(0, name2.length + 1)]);
  var domain = (domains[intInRange(0, domains.length)]);
  var randomNumber = intInRange(400,99999);
  var email = firstName + '.' + lastName+randomNumber+'@'+domain;
return (JSON.stringify({emails : email}));
}) 




  //generates random names can be configured in helper.js
  datapi.dataHandler.get('/nationality', async (request, reply) => {
  var nationalities = helper.nationality;

  var nationality = (nationalities[intInRange(0, nationalities.length + 1)]);  
return (JSON.stringify({nationality : nationality}));
}) 




  //generates random  country be configured in helper.js
  datapi.dataHandler.get('/country', async (request, reply) => {   
      country =  faker.address.country();;
  return (JSON.stringify({country : country}));
  })


    //generates random  country be configured in helper.js
  datapi.dataHandler.get('/age', async (request, reply) => {   
      var age =  intInRange(10,90);
  return (JSON.stringify({age : age}));
  })

  
  //generates random  state be configured in helper.js
  datapi.dataHandler.get('/state', async (request, reply) => {
  var state =  faker.address.state();
return (JSON.stringify({state : state}));
  })

   //generates random  state be configured in helper.js
  datapi.dataHandler.get('/street', async (request, reply) => {
  var street = faker.address.streetName();   
return (JSON.stringify({street : street}));
})


//generates random names can be configured in helper.js 
datapi.dataHandler.get('/name', async (request, reply) => {
    var name = faker.name.findName();
     return (JSON.stringify({  name  }));
})
 

//generates random phone number can be configured in helper.js 
datapi.dataHandler.get('/phonenumber', async (request, reply) => {
    var phone = faker.phone.phoneNumber();
     return (JSON.stringify({  phone  }));
 })


//generates random gender can be configured in helper.js 
datapi.dataHandler.get('/gender', async (request, reply) => {
    var gender = faker.name.gender('binray');
     return (JSON.stringify({  gender  }));
 })



//generates random names can be configured in helper.js 
 datapi.dataHandler.get('/creaditcard', async (request, reply) => {
  var ccnumber = '8969445598003000';
  var expiry = '0226';
  var cvv = '598';

   if (request.query.q == 'cardnumber')
     return (JSON.stringify({  card: ccnumber } ));
   else if (request.query.q == 'expiry')
     return (JSON.stringify({ firstname: expiry } ));
   else if (request.query.q == 'cvv')
     return (JSON.stringify({ lastname: cvv }));
   else
     return (JSON.stringify({ name: { card: ccnumber, firstname: expiry, lastname: cvv } }));
    
 })

  
  



datapi.start();