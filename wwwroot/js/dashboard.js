let currentDate = new Date();
let currentFilter = 'all';

function formatData(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function showWeek(startDate) {
    const dateNav = document.getElementById("navItem");
    dateNav.innerHTML = "";

    for (let i = 0; i < 7; i++) {
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        const dateItem = document.createElement("button");
        dateItem.className = i === 0 ? "active" : "";
        dateItem.textContent = formatData(newDate);
        dateItem.setAttribute('data-date', newDate.toISOString());

        dateItem.addEventListener("click", (e) => {
            document.querySelectorAll('#navItem button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            displayDateData(new Date(e.target.getAttribute('data-date')));
        });

        dateNav.appendChild(dateItem);
    }
}

function displayDateData(selectedDate) {
    const contentDashboard = document.getElementById("contentDashboard");
    contentDashboard.innerHTML = '';

    const data = [
        { head: "study", topic: "Game Night", time: "20:00 - 22:00", participants: "8 Participants", info: "Join us for a fun night of board games and snacks!"},
        { head: "study", topic: "Coding Workshop", time: "18:30 - 20:00", participants: "15 Participants", info: "Learn the basics of JavaScript in this beginner-friendly workshop." },
        { head: "games", topic: "Book Club Meeting", time: "19:00 - 20:30", participants: "12 Participants", info: "We'll be discussing 'The Hitchhiker's Guide to the Galaxy' this week." }
    ];

    const filteredData = filterData(data);

    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-dashboard';
    
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
        });

        contentDashboard.appendChild(card);
    });
}

function filterData(data) {
    if (currentFilter === 'all') {
        return data;
    }
    return data.filter(item => item.head === currentFilter);
}

function setupFilter() {
    const filterSelect = document.getElementById('filter');
    filterSelect.addEventListener('change', function() {
        currentFilter = this.value;
        displayDateData(currentDate);
    });
}

showWeek(currentDate);
setupFilter();
displayDateData(currentDate);

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