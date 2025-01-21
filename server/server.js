const express = require('express'); 
const cors = require('cors');

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'dbuser',
  password: 's3kreee7',
  database: 'students'
})

connection.connect()

connection.query('SELECT *', (err, rows, fields) => {
  if (err) throw err

  console.log('The solution is: ', rows)
})

connection.end()

const app = express();  

app.use(cors());
app.use(express.json());

app.get('/HA', (req, res) => {
    res.json({ message: 'Hello from server!' });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});