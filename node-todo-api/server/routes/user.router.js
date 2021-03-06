const express = require('express');
const userRouter = express.Router();
const _ = require('lodash');

const { User } = require('../models/user');
const { authenticate } = require('../middleware/authenticate');

userRouter.post('/', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

userRouter.post('/login', (req, res) => {
  let login = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(login.email, login.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((err) => {
    res.status(400).send();
  });
});

userRouter.get('/me', authenticate, (req, res) => {
  res.send(req.user);
});

userRouter.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((err) => {
    res.status(400).send();
  });
});

module.exports = { userRouter };