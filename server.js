require('dotenv').config();

const express = require('express');
const expressHandlebars = require('express-handlebars')
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const port = process.env.port || 8080
const Workout = require('./models/workout');
mongoose.connect(process.env.dbURI)
  .then((result) => {if(require.main === module) 
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
    }})
  .catch((err) => console.log(err));

app.engine('handlebars',expressHandlebars.engine({
  defaultLayout: 'main',
}))
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find().lean();
    res.render('home', { workouts });
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
});

app.get('/add-workout', (req, res) => {
  res.render('add-workout');
});

app.post('/add-workout', async (req, res) => {
  const { name, sets, reps } = req.body;

  try {
      const workout = new Workout({
          name,
          sets,
          reps,
      });

      await workout.save();
      res.redirect('/add-workout');
  } catch (error) {
      console.error(error);
      res.status(500).render('500');
  }
});

app.post('/delete-workout/:id', async (req, res) => {
  const workoutId = req.params.id;
  try {
    const deletedWorkout = await Workout.findByIdAndDelete(workoutId);

    if (!deletedWorkout) {
        console.log("Failed to delete workout");
    }

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});



