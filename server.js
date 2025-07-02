const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
var hsts = require('hsts');
const path = require('path');
var xssFilter = require('x-xss-protection');
var nosniff = require('dont-sniff-mimetype');
const request = require('request');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(xssFilter());
app.use(nosniff());
app.set('etag', false);
app.use(
  helmet({
    noCache: true
  })
);
app.use(
  hsts({
    maxAge: 15552000 // 180 days in seconds
  })
);

app.use(
  express.static(path.join(__dirname, 'dist/trexis-racing'), {
    etag: false
  })
);


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};


app.get('/api/members', authenticateToken, (req, res) => {
  request('http://localhost:3000/members', (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });
});


app.get('/api/teams', authenticateToken, (req, res) => {
  request('http://localhost:3000/teams', (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });
});

app.get('/api/members/:id', authenticateToken, (req, res) => {
  let options = {
    url: 'http://localhost:3000/members/' + req.params.id
  };
  request.get(options, (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });

});


// Submit Form!
app.post('/api/addMember', authenticateToken, (req, res) => {
  let options = {
    url: 'http://localhost:3000/members',
    form: req.body
  };

  request.post(options, (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });
});

app.put('/api/members/:id', authenticateToken, (req, res) => {

  let options = {
    url: 'http://localhost:3000/members/' + req.params.id,
    form: req.body
  };

  request.put(options, (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });

});

app.delete('/api/members/:id', authenticateToken, (req, res) => {

  let options = {
    url: 'http://localhost:3000/members/' + req.params.id,
  };

  request.delete(options, (err, response, body) => {
    if (response.statusCode <= 500) {
      res.send(body);
    }
  });

});


app.post('/api/login', (req, res) => {

  const { username, password } = req.body;

  request('http://localhost:3000/users', (err, response, body) => {
    if (response.statusCode <= 500) {

      if (err) return res.status(500).json({
        message: 'Error fetching users'
      });

      const users = JSON.parse(body);

      const user = users.find(u => u.username === username);
      if (!user) return res.status(401).json({
        message: 'Invalid Username'
      });

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) return res.status(401).json({
        message: 'Invalid Password'
      });

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    }
  });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/trexis-racing/index.html'));
});

app.listen('8000', () => {
  console.log('Vrrrum Vrrrum! Server starting!');
});
