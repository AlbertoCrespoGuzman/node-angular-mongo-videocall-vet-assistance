var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var PaypalPlan = new Schema({
    id: {
      type: String,
      default: ''
    },
    name:{
      type:String
    },
    description:{
      type: String
    },
    type:{
      type: String  
    },
    state:{
      type: String
    },
    create_time:{
      type: String
    }, 
    update_time:{
      type: String
    },
    terms:{
      id:String,
      type:String,
      max_billing_amount: {
        currency: String,
        value:String
      },
      occurrences: String,
      amount_range:{
        currency: String,
        value:String
      },
      buyer_editable:String 
    },
    payment_definitions:{
      id: String, 
      name:String,
      type: String,
      frequency_interval: String,
      frequency: String,
      cycles: String,
      amount: {
        currency: String,
        value: String
      },
      charge_models:[{
        id: String,
        type: String,
        amount:{
          currency: String,
          value: String
        }
      }]
    },
    merchant_preferences:{
      setup_fee:{
          currency: String,
          value: String
        },
        cancel_url: String,
        return_url: String,
        notify_url: String,
        max_fail_attempts: String,
        auto_bill_amount: String,
        initial_fail_amount_action: String,
        accepted_payment_type: String,
        char_set: String

    },
    links: [{
      href: String,
      rel: String, 
      method: String
    }],
    token: String,
    redirect_url: String
});

module.exports = mongoose.model('PaypalPlan', PaypalPlan);