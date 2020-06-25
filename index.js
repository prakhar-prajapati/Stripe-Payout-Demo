const express = require('express')
var stripe = require('stripe')('sk_test_AbHZixFQutesTkh40YqCUjfl00xyymYrwS');
const app = express()
 
app.get('/', function (req, res) {
  res.send('Hello World')
})
 
app.listen(3000)

app.post('/payout',(req,res)=>{
    stripe.payouts.create(
      {amount: 100,
       currency: 'usd',
       method: 'instant',
       source_type:'card',
       destination:'card_1Gk3XBAaf3EX2XJtXdruEv9N'
      },{
        
        stripeAccount: 'acct_1GjKMqCpjAiF3DpZ',
      },
      function(err, payout) {
        if(err){
            res.send(err);
            console.log(err);
        }
        res.send(payout);
      });
})


app.post('/transfer',(req,res)=>{
    stripe.transfers.create(
        {
          amount: 1000,
          currency: 'usd',
          destination: 'acct_1Giz8XAaf3EX2XJt',
          transfer_group: 'ORDER_95',
        },
        function(err, transfer) {
          // asynchronously called
          if(err){
            res.send(err);
            console.log(err);
        }
        res.send(transfer);
        });
})

app.post('/balance',async (re,res)=>{
    stripe.balance.retrieve(function(err, balance) {
        // asynchronously called
        if(err)res.send(err)
        res.send(balance)
      });
})

app.post('/addcard',(req,res)=>{
  stripe.accounts.createExternalAccount(
    'acct_1GjKMqCpjAiF3DpZ',
    { external_account: {
        object:'card',
        number:'4000056655665556',
								exp_month:5,
								exp_year:2021,
								currency:'usd'
              }},
    function(err, card) {
      // asynchronously called
      if(err)return res.send(err);
      res.send(card)
    }
  );
})

app.post('/createAccount',(req,res)=>{
    stripe.accounts.create(
        {
          type: 'custom',
          country: 'US',
          email: 'prakhar.prajapati@mindcrewtech.com',
          requested_capabilities: [
            'card_payments',
            'transfers',
          ],
          business_type:'individual',
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: '1.23.121.84', // Assumes you're not using a proxy
          },
          individual:{
              address:{
                line1:'address_full_match',
                postal_code:"12345",
                state:"Texas",
                city:'Texas'
              },
              dob:{
                  day:'01',
                  month:'01',
                  year:'1901'
              },
              email:'prakhar.prajapati@mindcrewtech.com',
              first_name:'Prakhar',
              last_name:'prajapati',
              phone:'5556781212',
              id_number:'000000000'
         },
         business_profile:{
             url:'http://testSage.com',
             mcc:7512
         },
         settings:{
           payouts:{
             schedule:{
              delay_days:'minimum',   
            interval:'weekly',
            weekly_anchor:'saturday',
            }, 
          statement_descriptor:'automatic payout check'
          }
         }

        },
        function(err, account) {
          // asynchronously called
          err ? res.send(err) : res.send(account)
        }
      );
})



app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  let event;
  
  try {
    event = JSON.parse(request.body);
    console.log(event)
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payout.failed':
      const paypal = event.data.object;
      console.log("failed",event)
      break;
    case 'payout.updated':
      const payoutUpdated = event.data.object;
      console.log("updated",event)
      break;
    case 'payout.paid':
      const payoutPaid = event.data.object;
      console.log("paid",event)
      break;
    default:
      // Unexpected event type
      return response.status(400).end();
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});
