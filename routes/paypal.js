
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Verify = require('./verify');
var paypal = require('paypal-rest-sdk');
var PaypalPlan = require('../models/paypalPlan')
var url = require('url');

paypal.configure({
  mode: 'sandbox', // Sandbox or live
  client_id: 'AZCly9EqwMk_Xu4QDe1Su7d6nwaYtRTU3XY4YxJCqbD0MFjVvKyUyWTC_l3V7O0BC2_QKAvLfPNdwM_v',
  client_secret: 'EJ1B3SnQmsKLb2ciYXnay8P0X5vicye4cDi_1sFLJuQDdlyGg4-2UGB6dwpmuMDmBLrPHYnVZ7sQI3b3'});

//var billingAgreementId = "I-08413VDRU6DE";



// BILLING AGREEMENT
var cancel_note = {
    "note": "Canceling the agreement"
};

var billingPlanAttributes = {
    "description": "Create Plan for Regular",
    "merchant_preferences": {
        "auto_bill_amount": "yes",
        "cancel_url": "http://www.cancel.com",
        "initial_fail_amount_action": "continue",
        "max_fail_attempts": "1",
        "return_url": "http://www.success.com",
        "setup_fee": {
            "currency": "USD",
            "value": "10"
        }
    },
    "name": "Testing1-Regular1",
    "payment_definitions": [
        {
            "amount": {
                "currency": "USD",
                "value": "10"
            },
            "cycles": "12",
            "frequency": "MONTH",
            "frequency_interval": "1",
            "name": "Regular 1",
            "type": "REGULAR"
        }
    ],
    "type": "FIXED"
};

var billingPlanUpdateAttributes = [
    {
        "op": "replace",
        "path": "/",
        "value": {
            "state": "ACTIVE"
        }
    }
];

var billingAgreementAttributes = {
    "name": "Fast Speed Agreement",
    "description": "Agreement for Fast Speed Plan",
    "start_date": new Date(),
    "plan": {
        "id": "P-0NJ10521L3680291SOAQIVTQ"
    },
    "payer": {
        "payment_method": "paypal"
    },
    "shipping_address": {
        "line1": "StayBr111idge Suites",
        "line2": "Cro12ok Street",
        "city": "San Jose",
        "state": "CA",
        "postal_code": "95112",
        "country_code": "US"
    }
}

 options = { upsert: true, new: true, setDefaultsOnInsert: true };
// Create the billing plan
router.route('/:userId')
  .get(Verify.verifyOrdinaryUser, function (req, res, next){
    PaypalPlan.find({}, function (err, user)
    {
      if (err) throw err;
      res.json(user);
    });
  })
router.route('/')
  .get(Verify.verifyAdmin, function (req, res, next){
    PaypalPlan.find({}, function (err, user)
    {
      if (err) throw err;
      res.json(user);
    });
  })
  .post(Verify.verifyAdmin, function(req, res, next){
    paypal.billingPlan.create(billingPlanAttributes, function (err, billingPlan) {
    if (err) { return res.status(500).send({ msg: err.message }); }
     else {
        console.log("Create Billing Plan Response");
        console.log(billingPlan);

        PaypalPlan.findOneAndUpdate({ id: billingPlan.id}, billingPlan, options, function(error, paypalPlan) {
                if (error) { return res.status(500).send({ msg: error.message }); }
                    // Activate the plan by changing status to Active

                        billingAgreementAttributes.plan.id = billingPlan.id
                        billingAgreementAttributes.start_date = new Date(new Date().getTime() + 1000 * 60 * 60)

                        paypal.billingPlan.update(billingAgreementAttributes.plan.id, billingPlanUpdateAttributes, function (error, response) {
                            if (error) { return res.status(500).send({ msg: error.message }); }
                             else {
                                console.log('response from updating billinPlan', response)
                                console.log("Billing Plan state changed to " + billingPlan.state);

                                // Use activated billing plan to create agreement
                                paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
                                    if (error) { return res.status(500).send({ msg: error }); }
                                     else {
                                        console.log("Create Billing Agreement Response");
                                        //console.log(billingAgreement);
                                        for (var index = 0; index < billingAgreement.links.length; index++) {
                                            if (billingAgreement.links[index].rel === 'approval_url') {
                                                var approval_url = billingAgreement.links[index].href;
                                                console.log("For approving subscription via Paypal, first redirect user to");
                                                console.log(approval_url);

                                                console.log("Payment token is");
                                                console.log(url.parse(approval_url, true).query.token);
                                                
                                                PaypalPlan.findOneAndUpdate({ id: billingPlan.id } , { token:url.parse(approval_url, true).query.token, redirect_url: approval_url}, options, function(error, paypalPlan) {
                                                    if (error) { return res.status(500).send({ msg: error.message }); }
                                                    res.json(paypalPlan)
                                                })
                                            }
                                        }
                                    }

                                });
                            }
                        });
            });
        
    }
})
  })


router.route('/cancel')
  .post(Verify.verifyAdmin, function (req, res, next){
    PaypalPlan.find({}, function (err, paypalPlan){
      if (err) throw err;
      paypal.billingAgreement.cancel(paypalPlan.id, cancel_note, function (error, response) {
                if (error) {
                    console.log(error);
                    throw error;
                } else {
                    console.log("Cancel Billing Agreement Response");
                    console.log(response);

                    paypal.billingAgreement.get(paypalPlan.id, function (error, billingAgreement) {
                        if (error) {
                            console.log(error.response);
                            throw error;
                        } else {
                             res.json(billingAgreement);
                            
                        }
                    });
                }
            });
     
    });
  })
module.exports = router;
