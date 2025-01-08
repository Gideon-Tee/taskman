document.addEventListener('DOMContentLoaded', () => {
const authToken = localStorage.getItem('authToken');

if (!authToken) {
    // Redirect to the login page if the user is not authenticated
    window.location.href = 'login.html';
}
})

async function fetchTasks() {
const response = await fetch('https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/', {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
});
const data = await response.json();
const bodyData = JSON.parse(data.body);
const tasks = bodyData.tasks || [];


const tasksContainer = document.getElementById('mainContent');
tasksContainer.innerHTML = '';
tasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = 'bg-white shadow p-4 hover:shadow-lg rounded w-80 h-48 shrink-0 overflow-hidden'; // Fixed size
    taskCard.innerHTML = `
    
    <h3 class="font-bold text-lg truncate">${task.title}</h3>
    <p class="text-sm text-gray-600">Status: ${task.status}</p>
    <p class="text-sm text-gray-600">Assigned to: ${task.assigned_to}</p>
    `;

    taskCard.addEventListener('click', () => loadTaskDetails(task.task_id));

    tasksContainer.appendChild(taskCard);
});
}

fetchTasks();

document.getElementById('listTasks').addEventListener('click', fetchTasks);

async function getTeamMembers() {
    const response = await fetch('https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    });
    const data = await response.json();
    console.log(data);
    
    const members = data.users || [];

    const tabContent = document.getElementById('mainContent');
    tabContent.innerHTML = '';
    members.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'bg-white shadow p-4 rounded w-54 shrink-0';
        memberCard.innerHTML = `
        <h3 class="font-bold text-lg truncate">${member.attributes.email}</h3>
        `;
        tabContent.appendChild(memberCard);
    })
}

document.getElementById('listTeamMembers').addEventListener('click', getTeamMembers)


document.getElementById('createTaskTab').addEventListener('click', () => {
    // Clear the main content
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '';

    // Create the form
    const form = document.createElement('form');
    form.className = 'flex flex-col gap-4 mt-12 pt-5 w-full mx-auto';

    // Title input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title';
    titleInput.id = 'title';
    titleInput.placeholder = 'Task Title';
    titleInput.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';
    form.appendChild(titleInput);

    // Description input
    const descriptionInput = document.createElement('textarea');
    descriptionInput.name = 'description';
    descriptionInput.id = 'description';
    descriptionInput.placeholder = 'Task Description';
    descriptionInput.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';
    form.appendChild(descriptionInput);


    // Assigned To dropdown
    const assignedToLabel = document.createElement('label');
    assignedToLabel.textContent = 'Assign to:';
    assignedToLabel.className = 'text-gray-700';
    form.appendChild(assignedToLabel);


    const assignedToSelect = document.createElement('select');
    assignedToSelect.name = 'assigned_to';
    assignedToSelect.id = 'assigned_to';
    assignedToSelect.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';

    // Fetch team members and populate dropdown
    async function fetchMembersAndPopulateDropdown() {
        try {
            const response = await fetch('https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/team', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                
                const members = data.users || []; 
    
                // Populate the dropdown
                members.forEach((member) => {
                    const option = document.createElement('option');
                    option.value = member.attributes.email; // Replace with the actual field for the username
                    option.textContent = member.attributes.email; // Replace with the actual field for display name
                    assignedToSelect.appendChild(option);
                });
            } else {
                alert('Failed to fetch team members.');
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            alert('Error fetching team members.');
        }
    
        form.appendChild(assignedToSelect);
    }
    

    fetchMembersAndPopulateDropdown();


    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Create Task';
    submitButton.className = 'bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-500';
    form.appendChild(submitButton);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const taskData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            assigned_to: document.getElementById('assigned_to').value,
            "user_id": "gideon@777",
        };

        try {
            const response = await fetch('https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                alert('Task created successfully!');
                window.location.href='index.html'
            } else {
                const error = await response.json();
                alert(`Failed to create task: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Append the form to the main content
    mainContent.appendChild(form);
});



// Function to fetch and display task details
async function loadTaskDetails(taskId) {
    const response = await fetch(`https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    });
    const data = await response.json();

    const tasksContainer = document.getElementById('mainContent');
    tasksContainer.innerHTML = ''; // Clear the mainContent section

    // Create a detailed view for the task
    const taskDetails = document.createElement('div');
    taskDetails.className = 'bg-white mt-6 shadow p-5 space-y-4 rounded w-full'; // Styling for detailed view
    taskDetails.innerHTML = `
        <h2 class="font-bold text-xl">${data.task.title}</h2>
        <p class="text-gray-700">Description: ${data.task.description}</p>
        <p class="text-gray-600">Status: ${data.task.status}</p>
        <p class="text-gray-600">Assigned to: ${data.task.assigned_to}</p>
        <p class="text-gray-600">Due Date: ${data.task.due_date}</p>
        <div class="flex mt-6 justify-around">
            <button class="hover:bg-teal-600 px-2 py-2 bg-teal-700 text-white text-sm rounded" onclick="">Update</button>
            <button class="hover:bg-red-600 px-2 py-2 bg-red-700 text-white text-sm rounded" onclick="deleteTask('${data.task.task_id}')">Delete</button>
        </div>
    `;
    
    tasksContainer.appendChild(taskDetails);
}


async function deleteTask(taskId) {
    const confirmation = confirm('Are you sure you want to delete this task?')
    if (!confirmation) return;


    try {
        const response = await fetch(`https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/${taskId}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        if (response.ok) {
            alert('Task successfully deleted.');
            fetchTasks();
        } else {
            const error = await response.json();
            alert(`Failed to delete task: ${error.message || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error('Error deletingt task:', error);
        alert('Could not delete task, an error occured.');
    }
}