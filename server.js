const express = require('express');
const axios = require('axios');
const expressHandlebars = require('express-handlebars')
const path = require('path');
const crypto = require('crypto');

const app = express();

app.engine('handlebars',expressHandlebars.engine({
  defaultLayout: 'main',
}))
app.set('view engine', 'handlebars');

const port = process.env.port || 8080

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/',(req, res) => {
    res.render('home');
  });

app.post('/check-password', async (req, res) => {
  const password = req.body.password;
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    const data = response.data;
    const regex = new RegExp(`${suffix}:\\d+`, 'i');

    if (regex.test(data)) {
        res.render('result', { compromised: true });
    } else {
        res.render('result', { compromised: false });
    }
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

if(require.main === module) 
{
    app.listen(port, () => 
    {
    console.log( `Express started on http://localhost:${port}` +
    '; press Ctrl-C to terminate.' )
    })
} 
else 
{
    module.exports = app
}