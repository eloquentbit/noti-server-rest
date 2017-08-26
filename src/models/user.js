import { env } from '../config/config'
import mongoose from 'mongoose'
import validator from 'validator'
import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
})

UserSchema.methods.toJSON = function() {
  let user = this
  let userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
UserSchema.methods.generateAuthToken = function() {
  let user = this
  let access = 'auth'
  let token = jwt
    .sign({ _id: user._id.toHexString(), access }, env.JWT_SECRET)
    .toString()

  user.tokens.push({
    access,
    token
  })

  return user.save().then(() => {
    return token
  })
}

/* eslint func-names: ["error", "never"] */
UserSchema.pre('save', function(next) {
  const user = this

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', UserSchema)

export { User }
