const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session')
const MongodbStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error');
const User = require('./models/user');

const mgURI = 'mongodb+srv://test:bJYVI29LEAjl147U@cluster0.ti4jx.mongodb.net/shop'

const app = express();
const store = new MongodbStore({
  uri : mgURI,
  collection : 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'abc', 
  resave: false, 
  saveuninitialized: false,
  store : store
}))

app.use((req, res, next) => {
  console.log(req.session.user)
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id)
  .then(user => {
      req.user = user // bc ss mw only fetch data from db without go through mgs M -> need to re-add the whole M to use methods in there
      next()
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(mgURI)
  .then(() => app.listen(3000))
  .catch(err => console.log(err))

