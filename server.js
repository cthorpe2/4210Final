require('dotenv').config();
const express = require('express');
const expressHandlebars = require('express-handlebars')
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const port = process.env.port || 8080
const Workout = require('./models/workout');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.fields([
  { name: 'name', maxCount: 1 },
  { name: 'sets', maxCount: 1 },
  { name: 'reps', maxCount: 1 },
]));
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

app.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ isFavorite: 'desc' }).lean();
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
  const { name, sets, reps, weight, duration, comments } = req.body;

  try {
      const workout = new Workout({
          name,
          sets,
          reps,
          weight, 
          duration,
          comments
      });

      await workout.save();

      res.status(200).json({ message: 'Workout saved successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to save workout' });
  }
});

app.post('/delete-workout/:id', async (req, res) => {
  const workoutId = req.params.id;
  try {
    const deletedWorkout = await Workout.findByIdAndDelete(workoutId);

    if (!deletedWorkout) {
      console.log("Failed to delete workout");
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/toggle-favorite/:id', async (req, res) => {
  const workoutId = req.params.id;
  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    workout.isFavorite = !workout.isFavorite;
    await workout.save();

    res.json({ isFavorite: workout.isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/edit-workout/:id', async (req, res) => {
  const workoutId = req.params.id;

  try {
      const workout = await Workout.findById(workoutId).lean();

      res.render('edit-workout', { workout });
  } catch (error) {
      console.error(error);
      res.status(500).render('500');
  }
});

app.post('/edit-workout/:id', async (req, res) => {
  const workoutId = req.params.id;
  const { name, sets, reps, weight, duration, comments } = req.body;

  try {
      const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, {
          name,
          sets,
          reps,
          weight,
          duration,
          comments
      }, { new: true });

      if (!updatedWorkout) {
          console.log("Failed to update workout");
          res.status(404).json({ message: 'Workout not found' });
          return;
      }

      res.status(200).json({ message: 'Workout updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update workout' });
  }
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});



