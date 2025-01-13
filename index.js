document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        // Redirect to the login page if the user is not authenticated
        window.location.href = 'login.html';
    }
    if (localStorage.getItem('userGroup') == 'TeamMember') {
        document.getElementById('createTaskTab').style.display = 'none';
        document.getElementById('listTasks').textContent = 'My Tasks';
    }
})





async function fetchTasks() {
    const userGroup = localStorage.getItem('userGroup'); // Retrieve the user group from localStorage

    // Define the URL to fetch tasks
    let url = 'https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/';

    // If the user is a TeamMember, add a query parameter to filter tasks assigned to the user
    if (userGroup === 'TeamMember') {
        const username = localStorage.getItem('username'); // the username is stored in localStorage after login
        url += `?assigned_to=${username}`;
        
    }

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        const tasks = data.tasks;
        

        const tasksContainer = document.getElementById('mainContent');
        tasksContainer.innerHTML = '';
        tasksContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 px-2';

        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'bg-white shadow p-4 hover:shadow-2xl rounded w-80 h-48 shrink-0 overflow-hidden'; // Fixed size
            taskCard.innerHTML = `
                <h3 class="font-bold text-lg truncate">${task.title}</h3>
                <p class="text-sm mt-4 text-gray-600">Status: ${task.status}</p>
                <p class="text-sm text-gray-600">Assigned to: ${task.assigned_to}</p>
                <p class="text-sm text-gray-600">Deadline: ${task.due_date}</p>
            `;

            taskCard.addEventListener('click', () => loadTaskDetails(task.task_id));

            tasksContainer.appendChild(taskCard);
        });
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching tasks.');
    }
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
    tabContent.className = '';
    tabContent.innerHTML = '';
    members.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'bg-white my-4 shadow p-4 hover:shadow-xl rounded w-54 shrink-0';
        memberCard.innerHTML = `
        <h3 class="font-semibold text-lg truncate">${member.attributes.email}</h3>
        `;
        tabContent.appendChild(memberCard);
    })
}

document.getElementById('listTeamMembers').addEventListener('click', getTeamMembers)


async function loadTaskForm(taskId) {
    const userGroup = localStorage.getItem('userGroup');
    // Clear the main content
    const mainContent = document.getElementById('mainContent');
    mainContent.className = 'w-2/3 mx-auto';
    mainContent.innerHTML = `<p class="text-2xl text-center text-teal-700 font-light">${taskId ? 'Update Task' : 'Create New Task'}</p>`;

    // Create the form
    const form = document.createElement('form');
    form.className = 'flex flex-col gap-4 mt-2 pt-5 w-full mx-auto';

    // Title input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title';
    titleInput.id = 'title';
    titleInput.placeholder = 'Task Title';
    titleInput.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500';
    titleInput.readOnly = userGroup == "TeamMember"? true:false;
    form.appendChild(titleInput);

    // Description input
    const descriptionInput = document.createElement('textarea');
    descriptionInput.name = 'description';
    descriptionInput.id = 'description';
    descriptionInput.placeholder = 'Task Description';
    descriptionInput.readOnly = userGroup == "TeamMember"? true:false;
    descriptionInput.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500';
    form.appendChild(descriptionInput);

    // Due Date input
    const dueDateLabel = document.createElement('label');
    dueDateLabel.textContent = 'Due Date:';
    dueDateLabel.className = 'text-gray-700';
    form.appendChild(dueDateLabel);

    const dueDateInput = document.createElement('input');
    dueDateInput.type = 'date';
    dueDateInput.name = 'due_date';
    dueDateInput.id = 'due_date';
    dueDateInput.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500';
    dueDateInput.readOnly = userGroup == 'TeamMember'? true:false;
    form.appendChild(dueDateInput);

    // Status dropdown
    const statusLabel = document.createElement('label');
    statusLabel.textContent = 'Status:';
    statusLabel.className = 'text-gray-700';
    form.appendChild(statusLabel);

    const statusSelect = document.createElement('select');
    statusSelect.name = 'status';
    statusSelect.id = 'status';
    statusSelect.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500';

    const statusOptions = ['Assigned', 'Completed', 'In-Progress'];
    statusOptions.forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
    form.appendChild(statusSelect);

    // Assigned To dropdown
    const assignedToLabel = document.createElement('label');
    assignedToLabel.textContent = 'Assign to:';
    assignedToLabel.className = 'text-gray-700';
    form.appendChild(assignedToLabel);

    const assignedToSelect = document.createElement('select');
    assignedToSelect.name = 'assigned_to';
    assignedToSelect.id = 'assigned_to';
    assignedToSelect.className = 'border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500';
    form.appendChild(assignedToSelect);

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
                const members = data.users || [];

                members.forEach((member) => {
                    const option = document.createElement('option');
                    option.value = member.attributes.email;
                    option.textContent = member.attributes.email;
                    assignedToSelect.appendChild(option);
                });
            } else {
                alert('Failed to fetch team members.');
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            alert('Error fetching team members.');
        }
    }

    if (userGroup == 'Admin') {
        await fetchMembersAndPopulateDropdown();

    }

    if (taskId) {
        // Fetch the task details and populate the form
        console.log(taskId);
        
        try {
            const response = await fetch(`https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/${taskId}`, {
                method: "GET", headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });

            if (response.ok) {
                const { task } = await response.json();
                titleInput.value = task.title;
                descriptionInput.value = task.description;
                dueDateInput.value = task.due_date.split('T')[0]; // Format to yyyy-MM-dd
                assignedToSelect.value = task.assigned_to;
            } else {
                alert('Failed to fetch task details.');
            }
        } catch (error) {
            console.error('Error fetching task details:', error);
        }
    }

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = taskId ? 'Update Task' : 'Create Task';
    submitButton.className = 'bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-500';
    form.appendChild(submitButton);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const taskData = {
            title: titleInput.value,
            description: descriptionInput.value,
            assigned_to: assignedToSelect.value,
            status: statusSelect.value,
            due_date: dueDateInput.value,
        };

        const url = taskId
            ? `https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/${taskId}`
            : 'https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks';

        const method = taskId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                alert(taskId ? 'Task updated successfully!' : 'Task created successfully!');
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                alert(`Failed to ${taskId ? 'update' : 'create'} task: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Append the form to the main content
    mainContent.appendChild(form);
}

document.getElementById('createTaskTab').addEventListener('click', () => loadTaskForm(null)); // For create


// Function to fetch and display task details
async function loadTaskDetails(taskId) {
    userGroup = localStorage.getItem('userGroup');
    const response = await fetch(`https://5m8co26l97.execute-api.eu-west-1.amazonaws.com/dev/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    });
    const data = await response.json();

    const tasksContainer = document.getElementById('mainContent');
    tasksContainer.className = 'px-8 bg-white mt-6 shadow-lg px-4 py-6 rounded-lg';
    tasksContainer.innerHTML = `
                <div class="">
                    <p class='text-xl text-teal-700 my-6 text-bold'>${data.task.title}</p>
                </div>
                `;


    // Create a detailed view for the task
    const table = document.createElement('table');
    table.className = 'table-auto mb-6 border-collapse border border-gray-300 w-full';

    // Header Row
    const headerRow = document.createElement('tr');
    headerRow.className = 'border border-gray-300 bg-gray-100';

    const taskDetailsHeaders = [
        'Title',
        'Description',
        'Status',
        'Assigned To',
        'Created At',
        'Due Date',
    ];

    taskDetailsHeaders.forEach((header) => {
        const headerCell = document.createElement('th');
        headerCell.className = 'px-4 py-2 font-bold text-teal-700 text-left';
        headerCell.textContent = header;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    // Detail Row
    const detailRow = document.createElement('tr');
    detailRow.className = 'border border-gray-300';

    const taskDetailsData = [
        data.task.title || 'N/A',
        data.task.description || 'N/A',
        data.task.status || 'N/A',
        data.task.assigned_to || 'N/A',
        new Date(data.task.created_at).toLocaleDateString() || 'N/A',
        new Date(data.task.due_date).toLocaleDateString() || 'N/A',
    ];
    console.log(data.task.due_date);
    taskDetailsData.forEach((detail) => {
        const detailCell = document.createElement('td');
        detailCell.className = 'px-4 py-2 text-gray-600';
        detailCell.textContent = detail;
        detailRow.appendChild(detailCell);
    });
    table.appendChild(detailRow);

    tasksContainer.appendChild(table);

    // Create a container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex w-full justify-end mt-6 gap-4'; // Flexbox to align buttons horizontally

    // Create the Update button
    const updateButton = document.createElement('button');
    updateButton.id = 'updateTaskButton';
    updateButton.className = 'bg-teal-700 text-white text-sm rounded p-2';
    updateButton.textContent = localStorage.getItem('userGroup') == 'Admin'? 'Update': 'Update Status';
    updateButton.addEventListener('click', () => {
        loadTaskForm(data.task.task_id); // Call the update form function
    });

    // Create the Delete button
    const deleteButton = document.createElement('button');
    deleteButton.id = 'deleteTaskButton';
    deleteButton.className = 'bg-red-700 ml-6 text-white text-sm rounded p-2';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {deleteTask(data.task.task_id)});

    tasksContainer.appendChild(updateButton);
    if (userGroup == 'Admin') {
        tasksContainer.appendChild(deleteButton);
        
    }

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
        console.error('Error deleting task:', error);
        alert('Could not delete task, an error occured.');
    }
}
