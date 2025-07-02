
// ------------------ ↓ GLOBAL VARIABLES (ALLOWED TO BE USED IN EVERY FUNCTION ONWARDS) ↓ ------------------

    const taskForm = document.getElementById("taskForm");

    const editTaskForm = document.getElementById("editTaskForm");

    const url = "http://localhost:3000";

   

// ----------------------------------------- ↓ GENERAL FUNCTIONS ↓ -----------------------------------------

    function resetForm() {
       taskForm.reset();
                }

// ----------------------------- ↓ GENERAL EVENT LISTENERS (TRIGGERS) ↓ ---------------------------------

    const sortButton = document.getElementById("sortSelect");

    window.addEventListener("DOMContentLoaded", () => {
        sortButton.value = "default";
    });

    sortButton.addEventListener("change", () => {
        displayTasks();
    })

    window.addEventListener("DOMContentLoaded", () => {
    displayTasks();
})


// ----------------------------- ↓ EVENT LISTENERS (TRIGGERS) FOR TASKS ↓ ---------------------------------

    const toDoList = document.getElementById("toDoList");
    const completedList = document.getElementById("completedList");
    


    taskForm.addEventListener("submit", (event) => {
            event.preventDefault();
            createNewTask();
        });


        //to complete a task

        toDoList.addEventListener("click", (event) => {
            if (event.target.classList.contains("done")) {
                const taskId = event.target.getAttribute("data-id");
                completeTask(taskId);
            }
        })

         completedList.addEventListener("click", (event) => {
            if (event.target.classList.contains("notDone")) {
                const taskId = event.target.getAttribute("data-id");
                taskNotCompleted(taskId);
            }
        })



         document.addEventListener("click", (event) => {
             if (event.target.classList.contains("delete")) {
                 const taskId = event.target.getAttribute("data-id");
                 deleteTask(taskId);
            }
});


    

    //Editing the task


    toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit")) {
        const taskId = event.target.getAttribute("data-id");
        const taskTitle = event.target.getAttribute("data-title");
        const taskDescription = event.target.getAttribute("data-description");
        const taskDueDate = new Date(event.target.getAttribute("data-due-date"));

        document.getElementById("editTaskName").value = taskTitle;
        document.getElementById("editTaskDescription").value = taskDescription;
        
        const formattedDueDate = taskDueDate.toISOString().split("T")[0];
        document.getElementById("editDueDate").value = formattedDueDate;

        // Store the task ID in the save button
        document.getElementById("saveChangesButton").setAttribute("data-id", taskId);
    }
});

// Handle save button click separately
    document.getElementById("saveChangesButton").addEventListener("click", async (event) => {
     const taskId = event.target.getAttribute("data-id");
     await editTask(taskId);
    
// Close the modal
     const editTaskModal = bootstrap.Modal.getInstance(document.getElementById("editTaskWindow"));
     editTaskModal.hide();
});


// --------------------------------------------- ↓ TASK FUNCTIONS ↓ ---------------------------------------------

    async function displayTasks() {
         try {

            const sortSelect = document.getElementById("sortSelect");
            const sortBy = sortSelect.value;

            let query = "";
            if(sortBy !== "dafault") {
                query = `?sortBy=${sortBy}`;
            }



            const response = await fetch(`${url}/tasks${query}`);
            const data = await response.json();

            function formatTask(task) {
                const li = document.createElement("li");
                li.classList.add("p-3", "shadow-lg", "mt-2", "card"); 
                li.innerHTML = task.completed ?
            `
            <div class="d-flex justify-content-between align-items-start">
                <h4 class="col-11 text-decoration-line-through opacity-50">${task.title}</h4>
                <button data-id= "${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
            </div>
            <p class="mb-2 text-decoration-line-through opacity-50">${task.description}</p>
            <p class="mb-3 text-decoration-line-through opacity-50"><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="d-flex justify-content-between">
                <div>                                         
                    <button data-id="${task._id}"type="button" class="btn btn-dark shadow-sm notDone color">Not Done</button>                                        
                </div>
                <p class="m-0"><strong>Created on: </strong>${new Date(task.createdOn).toLocaleDateString()}</p> 
            </div>                
            `
            :
            `
            <div class="d-flex justify-content-between align-items-start">
                <h4 class="col-11">${task.title}</h4>
                <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close" ></button>
            </div>
            <p class="mb-2">${task.description}</p>
            <p class="mb-3"><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="d-flex justify-content-between">
                <div>
                    <button data-id="${task._id}" data-title="${task.title}" data-description="${task.description}" data-due-date="${task.dueDate}" data-bs-toggle="modal" data-bs-target="#editTaskWindow" class="btn colorEdit  shadow-sm edit" type="button">Edit</button>

                    <button data-id="${task._id}" type="button" class="btn  px-4 shadow-sm done color">Done</button>
                </div>
                <p class="m-0"><strong>Created on: </strong>${new Date(task.createdOn).toLocaleDateString()}</p>                                        
            </div>
            `;
            return li;
        }

    toDoList.innerHTML = "";
    completedList.innerHTML = "";


    const tasks = data;
        

    tasks.forEach(task => {
        if (task.completed) {
            completedList.appendChild(formatTask(task));
        } else {
            toDoList.appendChild(formatTask(task));
        }
    });

    resetForm();

    } catch (error) {
        console.error("Error:", error);
    }

    }


   
   async function createNewTask() {
   
    
    try {
        const taskDetails = {
            title: document.getElementById("taskName").value.trim(),
            description: document.getElementById("taskDescription").value.trim(),
            dueDate: document.getElementById("dueDate").value.trim(),           
        }

        if (!taskDetails.title || !taskDetails.description || !taskDetails.dueDate) {
            return alert ('All Fields required')
        }

        
        const response = await fetch(`${url}/tasks/todo`, {
            method: "POST", 
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(taskDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to create task!: ${response.status} `);
        }

        
        const data = await response.json();
        console.log("New Task Created", data);
        alert('Task created successfully!');
        
        displayTasks(); 

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to create task. Please try again.");
    }
}


    
    async function completeTask(taskId) {
        try {
            const response = await fetch(`${url}/tasks/${taskId}/complete`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: true})
            });

            if (!response.ok){
                throw new Error(`Failed to complete the task: ${response.status}`);
            }

            const data = await response.json();
            console.log("Task completed", data);
            displayTasks();

        } catch (error) {
            console.error("Error:", error);
        }
    }



    async function taskNotCompleted(taskId) {
        try {
            const response = await fetch(`${url}/tasks/${taskId}/notComplete`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: false})
            });

            if (!response.ok){
                throw new Error(`Failed to set the task to not complete: ${response.status}`);
            }

            const data = await response.json();
            console.log("Task set to 'not complete'", data);
            displayTasks();
        } catch (error) {
            console.error("Error:", error);
        }
    }



    async function deleteTask(taskId) {
        try {
            const response = await fetch(`${url}/tasks/delete/${taskId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

             if (!response.ok){
                throw new Error(`Failed to delete the task: ${response.status}`);
            }

            const data = await response.json();
            console.log("Task deleted", data);
            displayTasks();

        } catch (error) {
            console.error("Error:", error);
        }
    }


    
   async function editTask(taskId) {
    const updatedTitle = document.getElementById("editTaskName").value;
    const updateDescription = document.getElementById("editTaskDescription").value;
    const updatedDueDate = document.getElementById("editDueDate").value;

    const updatedDetails = {
        title: updatedTitle,
        description: updateDescription,
        dueDate: updatedDueDate        
    };

    try {
        const response = await fetch(`${url}/tasks/update/${taskId}`, {
            method: 'PUT',
            headers: {  
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedDetails)    
        });

        if (!response.ok) {
            throw new Error(`Failed to edit task: ${response.status}`);
        }

        const data = await response.json();
        console.log("Edited task ", data);
        displayTasks();

    } catch (error) {
        console.error("Error", error);
    }
}














        






           
            