 // setting up dependencies

const express = require('express');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
const mongoose = require('mongoose'); // MongoDB library -- > enable to conect to database//
require("dotenv").config(); // enables use of .env file

// initial app configuration

const port = process.env.PORT || 3000;
const app = express();


// middleware setup

app.use(express.json());
app.use(cors('*')); // Enable CORS for all routes

// DATABASE CONNECTION + APP STARTUP// 

(async () => {
    try {

        mongoose.set("autoIndex", false);


        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected!");

        await Task.syncIndexes(); 
        console.log("Indexes created!");

        app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
});

    } catch (error) {
        console.error("Startup error", error);
        process.exit(1);
    }

})();


// Define the task Schema 

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    dueDate: {type: Date, required: true},
    createdOn: {type: Date, required: true, default: Date.now},
    completed: {type: Boolean, required: true, default: false}
});



taskSchema.index({ dueDate: 1});
taskSchema.index({ dateCreated: 1});



// From the Schema we will create a database model.

const Task = mongoose.model("Task", taskSchema);


// TASK ROUTES //


// Get all tasks
app.get('/tasks', async (req, res) => {
    try {

        const { sortBy } = req.query; 

        let sortOption = {};

        if (sortBy === "dueDate") {
            sortOption = { dueDate: 1} // ascending order            
        } else if (sortBy === "dateCreated") {
            sortOption = { dateCreated: 1};
        }

        const tasks = await Task.find({}).sort(sortOption);
        res.json(tasks);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error grabbing tasks"})
    }
});



app.post('/tasks/todo', async (req, res) => {
    try {
        const {title, description, dueDate} = req.body;

        const taskData = { title, description, dueDate};

        const createTask = new Task(taskData);

        const newTask = await createTask.save();

        res.json(newTask);
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error creating a task!"});
    }

});


app.patch('/tasks/:id/complete', async (req, res) => {
    
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const completedTask = await Task.findByIdAndUpdate(taskId, { completed }, { new: true});

        if (!completedTask) {
            return res.status(404).json({message: "Task not found!"});
        }

         res.json({ task: completedTask, message: "Task set to complete!"});


    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error setting task to complete!"});
    }
   
              
    });



// // Uncomplete a task
app.patch('/tasks/:id/notComplete', async (req, res) => {

    try {

        const { completed } = req.body;
        const taskId = req.params.id;
   
        const taskNotCompleted = await Task.findByIdAndUpdate(taskId, { completed }, { new: true});

            if (!taskNotCompleted) {
            return res.status(404).json({message: "Task not found!"});
        }

         res.json({ task: taskNotCompleted, message: "Task set to not complete!"});
        

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error setting task to complete!"});
    }
    
    }
);



// // Delete a task

app.delete('/tasks/delete/:id/', async (req, res) => {
    try {
        const taskId = req.params.id;
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if(!deletedTask) {
            return res.status(404).json({message: "Task not found!"});
        }

        res.json({ task: deletedTask, message: "Task deleted successfully!"})
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error deleting the task!"});
    }
    
    });



    // to edit the task

    app.put('/tasks/update/:id', async (req, res) => {
        try {
            const taskId = req.params.id;
            const { title, description, dueDate} = req.body;

            const taskData = { title, description, dueDate }
            const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true});

            if(!updatedTask) {
                return res.status(404).json({ message: "Task not found"});
            }

            res.json({ task: updatedTask, message: "Task updated successfully"});

        } catch (error) {
             console.error("Error:", error);
        res.status(500).json({message: "Error updating the task!"});
        }
    });










//Test endpoint
// app.get('/get/example', async (req, res) => {
//     res.send("Hello! I am a message from the backend!");
// });



//  //APP STARTUP 
//  app.listen(port, () => {
//     console.log(`✔ to do app listening on port ${port}`);
//  } );



 
