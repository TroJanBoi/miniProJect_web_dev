//Dashboard ############################## 

let currentDate = new Date();
let currentFilter = 'all';
let selectedDate;
let postData;

selectedDate = new Date();
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();
connection.on("UpdatePosts", function () {
    //console.log("UpdatePosts");
    loadDashboardData(selectedDate);
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

connection.on("UpdatePostsID", (postID) => {
    //console.log("UpdatePostsID", postID);
    const updatedPost = postData.find(item => item.postID === postID);

    if (updatedPost && updatedPost.maxParticipants !== 0) {
        const cardToUpdate = document.querySelector(`[data-post-id='${postID}']`).closest('.card-dashboard');
        const participantsElement = cardToUpdate.querySelector('.participants-message');
        updatedPost.participantsCount = updatedPost.participantsCount + 1;
        //console.log(updatedPost.participantsCount);
        if (updatedPost.maxParticipants === 0) {
            participantsElement.textContent = 'Non limit Participants';
        } else if (updatedPost.participantsCount >= updatedPost.maxParticipants) {
            participantsElement.textContent = 'Full Participants';
        } else {
            participantsElement.textContent = `${updatedPost.participantsCount}/${updatedPost.maxParticipants} Participants`;
        }


        const button = cardToUpdate.querySelector('.btn-dashboard');
        if (button.textContent === 'Join') {
            button.disabled = updatedPost.participantsCount >= updatedPost.maxParticipants;
            button.textContent = button.disabled ? 'Full Participant' : 'Join';
            button.className = button.disabled ? 'btn-dashboard full' : 'btn-dashboard';
        }
    }
});
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

let calendar = null;
let isCalendarOpen = false;

document.getElementById('calendarIcon').addEventListener('click', function () {
    const calendarContainer = document.getElementById("calendarContainer");

    if (!calendar) {
        calendar = flatpickr(calendarContainer, {
            inline: true,
            onChange: function (selectedDates) {
                const selectedDate = new Date(selectedDates[0]);
                showWeek(selectedDate);
                loadDashboardData(selectedDate);
                closeCalendar();
            }
        });
    }

    if (isCalendarOpen) {
        closeCalendar();
    } else {
        isCalendarOpen = true;
    }
});

function closeCalendar() {
    if (calendar) {
        calendar.destroy();
        calendar = null;
        isCalendarOpen = false;
    }
}

document.addEventListener('click', function (event) {
    if (isCalendarOpen && !event.target.closest('.flatpickr-calendar') && !event.target.closest('#calendarIcon')) {
        closeCalendar();
    }
});

function handleResize() {
    if (isCalendarOpen) {
        calendar.destroy();
        calendar = null;
        isCalendarOpen = false;
    }
}

window.addEventListener('resize', handleResize);

function showWeek(startDate) {
    const dateNav = document.getElementById("navItem");
    dateNav.innerHTML = "";

    function addDateClick(date, isActive = false, prepend = false) {
        const dateItem = document.createElement("button");
        dateItem.className = isActive ? "active" : "";
        dateItem.textContent = formatData(date);
        dateItem.setAttribute('data-date', date.toISOString());

        dateItem.addEventListener("click", handlerDateClick);

        if (prepend) {
            dateNav.prepend(dateItem);
        } else {
            dateNav.appendChild(dateItem);
        }
    }
    function handlerDateClick(e) {
        document.querySelectorAll('#navItem button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        selectedDate = new Date(e.target.getAttribute('data-date'));
        loadDashboardData(selectedDate);

        if (e.target === dateNav.lastElementChild) {
            const nextDate = new Date(selectedDate);
            nextDate.setDate(selectedDate.getDate() + 1);
            addDateClick(nextDate);

            if (dateNav.children.length > 8) {
                dateNav.removeChild(dateNav.firstElementChild);
            }
        } else if (e.target === dateNav.firstElementChild) {
            const prevDate = new Date(selectedDate);
            prevDate.setDate(selectedDate.getDate() - 1);
            addDateClick(prevDate, false, true);

            if (dateNav.children.length > 8) {
                dateNav.removeChild(dateNav.lastElementChild);
            }
        }
    }

    for (let i = 0; i < 8; i++) {
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        addDateClick(newDate, i === 0);
    }
}

function displayDateData(postData, selectedDate) {
    const contentDashboard = document.getElementById("contentDashboard");
    contentDashboard.innerHTML = '';

    const filteredData = filterData(postData);
    console.log(filteredData);

    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-dashboard';
        let buttonClass = '';
        let buttonDisabled = '';
        let buttonText = '';
        let participantsCount = item.participantsCount;
        const ExpiringDate = item.closeDate;
        const ExpiringDateOnly = ExpiringDate.slice(0, 10);

        let participantsMessage;

        if (item.status === 'Joined') {
            buttonClass = ' active';
            //buttonDisabled = 'disabled';
            buttonText = 'Joined';
        } else if (item.status === 'Your') {
            buttonClass = 'your';
            buttonDisabled = 'disabled';
            buttonText = 'Your Post';
        } else if (participantsCount === item.maxParticipants && item.status === "active" && item.maxParticipants != 0) {
            buttonClass = 'full';
            buttonDisabled = 'disabled';
            buttonText = 'Full Participant';
        } else {
            buttonClass = '';
            buttonDisabled = '';
            buttonText = 'Join';
        }

        if (item.maxParticipants === 0) {
            participantsMessage = `${participantsCount}`;
        } else if (participantsCount >= item.maxParticipants) {
            participantsMessage = 'Full';
            //buttonDisabled = 'disabled';
        } else {
            participantsMessage = `${participantsCount}/${item.maxParticipants}`;
        }



        card.innerHTML = `
            <img src="${item.img}" alt="image for ${item.title}"/>
            <div class="dashboard-container">
                <div><h3 class='card-dashboard-topic'>${item.title}</h3></div>
                <div class='card-dashboard-content'>
                    <p class='font-13'>${formatData(selectedDate)}</p>
                    <p class='font-13'>${formatTime(item.startTime)} - ${formatTime(item.endTime)}</p>
                    <p class='font-12 participants-message'>${participantsMessage} Participants</p>
                </div>
                <div class="dashboard-description">
                    <p class='font-12'>${item.description}</p>
                </div>
                <div class='card-dashboard-footer'>
                    <button class='btn-dashboard ${buttonClass}' data-status=${item.status} ${buttonDisabled} data-post-id='${item.postID}'>${buttonText}</button>
                </div>
                <div>
                    <span class="expiring-date">Expiring Post Date : ${ExpiringDateOnly}</span>
                </div>
            </div>
        `;

        card.querySelector('.btn-dashboard').addEventListener('click', async function () {
            if (this.hasAttribute('disabled')) return;

            const postID = this.getAttribute('data-post-id');

            if (this.textContent === 'Joined' && this.textContent !== 'Your Post') {
                showCancelJoinModal(postID)
                //console.log("cancel")
                //const confirmCancel = confirm('Are you sure you want to cancel your join?');
                //if (confirmCancel) {
                //    const cancelStat = await sendCancellationData(postID);
                //    if (cancelStat === 'Cancelled') {
                //        //alert('You have successfully cancelled your join.');
                //        location.reload();
                //    }
                //}
            } else {
                const joinStat = await sendParticipationData(postID);
                if (joinStat === "Joined") {
                    const isActive = this.classList.toggle('active');
                    this.textContent = isActive ? 'Joined' : 'Join';
                    //this.setAttribute('disabled', 'true');
                    this.classList.remove('full');
                    //item.participantsCount += 1;

                    let updatedParticipantsMessage;
                    if (item.maxParticipants === 0) {
                        console.log("non limit")
                        item.participantsCount += 1;
                        updatedParticipantsMessage = `${item.participantsCount} Participants`;
                    } else if (item.participantsCount >= item.maxParticipants) {
                        updatedParticipantsMessage = 'Full Participants';
                        this.removeAttribute('disabled');
                        console.log("limit")
                        //this.setAttribute('disabled', 'true');
                    } else {
                        updatedParticipantsMessage = `${item.participantsCount}/${item.maxParticipants} Participants`;
                    }

                    const participantsElement = card.querySelector('.participants-message');
                    participantsElement.textContent = updatedParticipantsMessage;

                    //if (participantsCount >= item.maxParticipants) {
                    //    //this.setAttribute('disabled', 'true');
                    //}
                }
            }
        });
        contentDashboard.appendChild(card);
    });
}

async function loadDashboardData(selectedDate) {
    postData = await fetchPosts(selectedDate);
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

function showModalNotLoggedIn() {
    const modal = document.getElementById('notLogin');
    modal.classList.add('show');

    const closeButton = document.getElementById('closeNotLogin');
    closeButton.addEventListener('click', function () {
        modal.classList.remove('show');
    });
}

function showCancelJoinModal(postID) {
    const modal = document.getElementById('unJoin');
    modal.classList.add('show');

    const closeButton = document.getElementById('cancelUnjoin');
    closeButton.addEventListener('click', function () {
        modal.classList.remove('show');
    });

    document.getElementById('confirmUnjoin').onclick = async function () {
        const cancelStat = await sendCancellationData(postID);
        if (cancelStat === 'Cancelled') {
            location.reload();
        }
    };
}

const createPostBtn = document.getElementById('createPostBtn');

if (createPostBtn) {
    createPostBtn.addEventListener('click', function () {
        showModalNotLoggedIn();
    });
}
// ########################### fetch Data ########################### //

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
        } else if (data.message === "NotLogin"){
            //alert("User not logged in....")
            //console.log('Error:', data.message);
            showModalNotLoggedIn();
            return "Error";
        }

    } catch (error) {
        //console.error('Error:', error);
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
        const reversedPostsData = [...postData].reverse();
        return reversedPostsData;
    } catch (error) {
        //console.error('Error fetching posts:', error);
        return [];
    }
}

async function sendCancellationData(postID) {
    //console.log("cancel Post ", postID);
    try {
        const response = await fetch(`/Dashboard/cancel-join/${postID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            return 'Cancelled';
        } else {
            return 'Error';
        }
    } catch (error) {
        //console.error('Error:', error);
        return 'Error';
    }
}