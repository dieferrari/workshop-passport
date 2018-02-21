const crypto = require('crypto');
const Sequelize = require('sequelize');
const db = require('../db');


const User = db.define('users', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        }
    },

    password: {
        type: Sequelize.STRING,   
        set(value) {
            const rSalt = User.randomSalt()
            this.setDataValue('salt', rSalt);
            this.setDataValue('password', crypto.createHmac('sha1', this.salt).update(value).digest('hex'))
        }
    },

    salt: {
        type: Sequelize.STRING,
    },

    facebookId: {
        type: Sequelize.STRING,
    }
    
})

User.randomSalt = function(){
    return crypto.randomBytes(20).toString('hex')
}

User.prototype.checkPassword = function (password){
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex') === this.password
}

module.exports = User