const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutSchema = new Schema({
    name: {type: String, required: true}, 
    sets: {type: Number, required: false},
    reps: {type: Number, required: false},
    weight: {type: Number},
    duration: {type: String},
    comments: {type: String},
    isFavorite: { type: Boolean, default: false },
}, {timestamps: true});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;