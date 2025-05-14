const apiUrl = 'http://localhost:5000/api/data';

// Fetch all data
const fetchAllData = async () => {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        populateTable(data);
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
    }
};

// Fetch data by ID
const fetchById = async (id) => {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        const data = await response.json();
        populateTable([data]);
    } catch (error) {
        console.error(`Error fetching data by ID: ${error.message}`);
    }
};

// Search data by name
const searchByName = async () => {
    try {
        const name = document.getElementById('search-name').value.toLowerCase();
        const response = await fetch(apiUrl);
        const data = await response.json();
        const filteredData = data.filter((item) => item.name.toLowerCase().includes(name));
        populateTable(filteredData);
    } catch (error) {
        console.error(`Error searching by name: ${error.message}`);
    }
};

// Add or update data
const handleFormSubmit = async (event) => {
    event.preventDefault();
    const id = document.getElementById('record-id').value;
    const data = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        pro: document.getElementById('pro').value,
        isMarried: document.getElementById('is-married').value === 'true',
        email: document.getElementById('email').value,
    };

    try {
        const response = await fetch(id ? `${apiUrl}/${id}` : apiUrl, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        alert(result.message);
        fetchAllData();
    } catch (error) {
        console.error(`Error submitting data: ${error.message}`);
    }
};

// Populate the table
const populateTable = (data) => {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    data.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.age}</td>
            <td>${item.gender}</td>
            <td>${item.pro}</td>
            <td>${item.isMarried ? 'Yes' : 'No'}</td>
            <td>${item.email}</td>
            <td>
                <button class="edit" onclick="editData(${item.id})">Edit</button>
                <button class="delete" onclick="deleteData(${item.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

// Delete data
const deleteData = async (id) => {
    try {
        const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        fetchAllData();
    } catch (error) {
        console.error(`Error deleting data: ${error.message}`);
    }
};

// Edit data (populate form with data for editing)
const editData = (id) => {
    fetchById(id).then((data) => {
        const item = data[0];
        document.getElementById('record-id').value = item.id;
        document.getElementById('name').value = item.name;
        document.getElementById('age').value = item.age;
        document.getElementById('gender').value = item.gender;
        document.getElementById('pro').value = item.pro;
        document.getElementById('is-married').value = item.isMarried;
        document.getElementById('email').value = item.email;
    });
};

// Event Listeners
document.getElementById('fetch-all').addEventListener('click', fetchAllData);
document.getElementById('fetch-by-id').addEventListener('click', () => {
    const id = document.getElementById('fetch-id').value;
    fetchById(id);
});
document.getElementById('fetch-by-name').addEventListener('click', searchByName);
document.getElementById('data-form').addEventListener('submit', handleFormSubmit);

// Initial fetch
fetchAllData();
