module.exports = {
    'secretKey': 'xxx',
    'mongoUrl' : 'mongodb://127.0.0.1/godrpet?maxPoolSize=200',
    'mongoOptions' : {
    	useMongoClient: true
    },
    'facebook': {
        clientID: 'xxx',
        clientSecret: 'xxx',
        callbackURL: 'https://localhost:3443/users/facebook/callback'
    },
    'nodemailer': {
        service: 'gmail',
        user : 'xxx',
        password: 'xxx'
    },
    'master': {
        username: 'xxx',
        password: 'xxx'
    },
    'waitingRoom': {
        removeUserAt: 1000 * 6
    },
    'videoCall': {
        removeAt: 1000 * 60,
        defaultCreditCost: 1,
        urgentCreditCost: 3 
    }

}