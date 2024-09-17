<<<<<<< HEAD
=======

//Dashboard ############################## 
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
let currentDate = new Date();
let currentFilter = 'all';

function formatData(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

<<<<<<< HEAD
=======
function formatToDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(timeString) {
    return timeString.split(':').slice(0, 2).join(':');
}
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
function showWeek(startDate) {
    const dateNav = document.getElementById("navItem");
    dateNav.innerHTML = "";

<<<<<<< HEAD
    for (let i = 0; i < 7; i++) {
=======
    for (let i = 0; i < 8; i++) {
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        const dateItem = document.createElement("button");
        dateItem.className = i === 0 ? "active" : "";
        dateItem.textContent = formatData(newDate);
        dateItem.setAttribute('data-date', newDate.toISOString());

        dateItem.addEventListener("click", (e) => {
            document.querySelectorAll('#navItem button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
<<<<<<< HEAD
            displayDateData(new Date(e.target.getAttribute('data-date')));
=======
            const selectedDate = new Date(e.target.getAttribute('data-date'));
            loadDashboardData(selectedDate);
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
        });

        dateNav.appendChild(dateItem);
    }
}

<<<<<<< HEAD
function displayDateData(selectedDate) {
    const contentDashboard = document.getElementById("contentDashboard");
    contentDashboard.innerHTML = '';

    const data = [
        { head: "study", topic: "Game Night", time: "20:00 - 22:00", participants: "8 Participants", info: "Join us for a fun night of board games and snacks!"},
        { head: "study", topic: "Coding Workshop", time: "18:30 - 20:00", participants: "15 Participants", info: "Learn the basics of JavaScript in this beginner-friendly workshop." },
        { head: "games", topic: "Book Club Meeting", time: "19:00 - 20:30", participants: "12 Participants", info: "We'll be discussing 'The Hitchhiker's Guide to the Galaxy' this week." }
    ];

    const filteredData = filterData(data);
=======

function displayDateData(postData ,selectedDate) {
    const contentDashboard = document.getElementById("contentDashboard");
    contentDashboard.innerHTML = '';

    const filteredData = filterData(postData);
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311

    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-dashboard';
<<<<<<< HEAD
    
        card.innerHTML = `
            <h3 class='card-dashboard-topic'>${item.topic}</h3>
            <div class='card-dashboard-content'>
                <p class='font-13'>${formatData(selectedDate)}</p>
                <p class='font-13'>${item.time}</p>
                <p class='font-12'>${item.participants}</p>
            </div>
            <p class='font-12'>${item.info}</p>
            <div class='card-dashboard-footer'>
                <button class='btn-dashboard'>Join</button>
            </div>
        `;

        card.querySelector('.btn-dashboard').addEventListener('click', function() {
            this.classList.toggle('active');
            this.textContent = this.classList.contains('active') ? "Joined" : "Join";
=======
        const buttonClass = item.status === 'Joined' ? ' active' : '';
        const buttonDisabled = item.status === 'Joined' ? 'disabled' : '';
        const buttonText = item.status === 'Joined' ? 'Joined' : 'Join';

        card.innerHTML = `
            <h3 class='card-dashboard-topic'>${item.title}</h3>
            <div class='card-dashboard-content'>
                <p class='font-13'>${formatData(selectedDate)}</p>
                <p class='font-13'>${formatTime(item.startTime)} - ${formatTime(item.endTime)}</p>
                <p class='font-12'>${item.maxParticipants} Participants</p>
            </div>
            <p class='font-12'>${item.description}</p>
            
            <div class='card-dashboard-footer'>
                <button class='btn-dashboard ${buttonClass}' data-status=${item.status} ${buttonDisabled} data-post-id='${item.postID}'>${buttonText}</button>
            </div>
        `;

        card.querySelector('.btn-dashboard').addEventListener('click', async function () {
            if (this.hasAttribute('disabled')) return;
            const postID = this.getAttribute('data-post-id');
            const joinStat = await sendParticipationData(postID);

            if (joinStat === "Joined") {
                const isActive = this.classList.toggle('active');
                this.textContent = isActive ? 'Joined' : 'Join';
                this.setAttribute('disabled', 'true');
            }
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
        });

        contentDashboard.appendChild(card);
    });
}

<<<<<<< HEAD
=======
async function sendParticipationData(postID) {
    try {
        const response = await fetch('/Dashboard/AddPostParticipant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postID: parseInt(postID) })
        });

        const data = await response.json();
        if (data.success) {
            return "Joined";
        } else {
            alert("User not logged in.")
            //console.log('Error:', data.message);
            return "Error";
        }

    } catch (error) {
        console.error('Error:', error);
        return "Error";
    }
}

async function fetchPosts(selectedDate) {
    try {
        const response = await fetch('/Dashboard/GetPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: formatToDateString(selectedDate) })
        });

        const postData = await response.json();
        //console.log(postData);
        return postData;
    } catch (error) {
        //console.error('Error fetching posts:', error);
        return [];
    }
}

async function loadDashboardData(selectedDate) {
    const postData = await fetchPosts(selectedDate);
    displayDateData(postData, selectedDate);
}

>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
function filterData(data) {
    if (currentFilter === 'all') {
        return data;
    }
<<<<<<< HEAD
    return data.filter(item => item.head === currentFilter);
=======
    return data.filter(item => item.eventType === currentFilter);
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
}

function setupFilter() {
    const filterSelect = document.getElementById('filter');
<<<<<<< HEAD
    filterSelect.addEventListener('change', function() {
        currentFilter = this.value;
        displayDateData(currentDate);
=======
    filterSelect.addEventListener('change', function () {
        currentFilter = this.value;
        loadDashboardData(currentDate);
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
    });
}

showWeek(currentDate);
setupFilter();
<<<<<<< HEAD
displayDateData(currentDate);
=======
loadDashboardData(currentDate);
>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311

window.addEventListener('resize', () => {
    const navDash = document.querySelector('.nav-dash');
    const activeButton = navDash.querySelector('button.active');
    if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
});

window.addEventListener('load', () => {
    const activeButton = document.querySelector('.nav-dash button.active');
    if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
<<<<<<< HEAD
});
=======
});


>>>>>>> a36b432c93e49074c93febd54b4aefeb2e4fd311
