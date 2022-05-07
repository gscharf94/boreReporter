const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');

const indexRouter = require('./routes/index');
const inputRouter = require('./routes/input');
const viewJobsRouter = require('./routes/viewJobs');
const inputDataRouter = require('./routes/inputData');
const loginRouter = require('./routes/login');


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true,
}));

app.use('/', loginRouter);
app.use('/input', inputRouter);
app.use('/viewJobs', viewJobsRouter);
app.use('/inputData', inputDataRouter);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});