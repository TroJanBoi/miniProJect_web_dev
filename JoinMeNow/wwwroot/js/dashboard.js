
//Dashboard ############################## 
let currentDate = new Date();
let currentFilter = 'all';

function formatData(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatToDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(timeString) {
    return timeString.split(':').slice(0, 2).join(':');
}
function showWeek(startDate) {
    const dateNav = document.getElementById("navItem");
    dateNav.innerHTML = "";

    for (let i = 0; i < 8; i++) {
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        const dateItem = document.createElement("button");
        dateItem.className = i === 0 ? "active" : "";
        dateItem.textContent = formatData(newDate);
        dateItem.setAttribute('data-date', newDate.toISOString());

        dateItem.addEventListener("click", (e) => {
            document.querySelectorAll('#navItem button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const selectedDate = new Date(e.target.getAttribute('data-date'));
            loadDashboardData(selectedDate);
        });

        dateNav.appendChild(dateItem);
    }
}


function displayDateData(postData ,selectedDate) {
    const contentDashboard = document.getElementById("contentDashboard");
    contentDashboard.innerHTML = '';

    const filteredData = filterData(postData);

    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-dashboard';
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
        });

        contentDashboard.appendChild(card);
    });
}

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

function filterData(data) {
    if (currentFilter === 'all') {
        return data;
    }
    return data.filter(item => item.eventType === currentFilter);
}

function setupFilter() {
    const filterSelect = document.getElementById('filter');
    filterSelect.addEventListener('change', function () {
        currentFilter = this.value;
        loadDashboardData(currentDate);
    });
}

showWeek(currentDate);
setupFilter();
loadDashboardData(currentDate);

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
});


