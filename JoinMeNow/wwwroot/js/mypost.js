function toggleDropdown(id) {
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    allDropdowns.forEach(function (dropdown) {
        if (dropdown.id !== id) {
            dropdown.classList.remove('active');
        }
    });

    var dropdown = document.getElementById(id);
    dropdown.classList.toggle('active');
}

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();
connection.on("UpdateParticipant", function (userID, postID) {
    console.log("UpdateParticipant : ", userID, postID);
    updateParticipant(userID, postID);
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

function joinMe(form) {
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            var label = checkbox.parentElement;
            label.innerHTML = label.textContent.trim() + " - Joined Me";
        }
    });
}
function denyParticipants(form) {
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            checkbox.parentElement.remove();
        }
    });
}
function removeEvent(button) {
    var eventContainer = button.closest('.event');
    eventContainer.remove();
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const posts = await fetchUserPosts();
        console.log(posts)
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
});

async function updateParticipant(userID, postID) {
    try {
        const user = await fetchUser(userID);
        const postElement = document.querySelector(`.mypost-content[data-post-id="${postID}"]`);
        if (postElement) {
            const form = postElement.querySelector('.participants-name form');
            if (form) {
                const newUserCheckbox = document.createElement('label');
                newUserCheckbox.innerHTML = `<input type="checkbox" name="participants" value="${user.userID}"> ${user.username} <span class="status"></span>`;
                form.appendChild(newUserCheckbox);
            }
        }
        console.log("sucess")
    } catch (error) {
        console.error('Error updating participant:', error);
    }
}

function selectAllParticipants(dropdownId) {
    const dropdownContent = document.getElementById(dropdownId);
    const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = !allChecked;
    });
    console.log(dropdownId, allChecked ? "Unselecting all" : "Selecting all");
}


function displayPosts(posts) {
    const postsContainer = document.querySelector('.event-list');
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts available.</p>';
        return;
    }
    let dropdownCounter = 1;
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'event';

        const dropdownId = `dropdown${dropdownCounter++}`;
        postElement.innerHTML = `
            <div class="mypost-content" data-post-id="${post.postID}">
                <span class="card-time">${formatTime(post.startTime)} - ${formatTime(post.endTime)}</span>
                <span class="card-date">${new Date(post.startDate).toLocaleDateString()}</span>
                <span class="card-title">${post.title}</span>
                <p>${post.description}</p>

                <div class="event-controls">
                    <div onclick="toggleDropdown('${dropdownId}')" class="dropdown-button">Participant will join &#9662;</div>
                    <button type="button" class="button-remove" onclick="removeEvent(this)">Cancel Post</button>
                </div>
                <div id="${dropdownId}" class="dropdown-content">
                    <div class="participants-name">
                        <form>
                            ${post.participants.map(p => `
                                <label><input type="checkbox" name="participants" value="${p.userID}"> ${p.username} <span class="status"></span></label>
                            `).join('')}
                        </form>
                    </div>
                    <div class="button-container">
                        <button type="button" class="button-select-all" onclick="selectAllParticipants('${dropdownId}')">Select All</button>
                        <button type="button" class="button-join" onclick="joinMe(this.form)">Join Me</button>
                        <button type="button" class="button-deny" onclick="denyParticipants(this.form)">Deny</button>
                    </div>
                </div>
            </div>
        `;

        postsContainer.appendChild(postElement);
    });
}

function formatTime(timeString) {
    return timeString.split(':').slice(0, 2).join(':');
}



// ########################### fetch Data ########################### //
async function fetchUser(userID) {
    try {
        const response = await fetch(`/GetUser/${userID}`);
        if (!response.ok) throw new Error('Network response was not ok.');

        const data = await response.json();

        if (!data.success) throw new Error(data.message);

        return data.user;

    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

async function fetchUserPosts() {
    try {
        const response = await fetch('/Mypost/GetUserPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Date: new Date().toISOString().split('T')[0] })
        });

        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json(); 
        const reversedPosts = [...data].reverse();
        return reversedPosts;

    } catch (error) {
        console.error('Error in fetchPosts:', error);
        throw error;
    }
}