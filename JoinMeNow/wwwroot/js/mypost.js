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
connection.on("UpdateParticipant", function (userID, postID , status) {
    //console.log("UpdateParticipant : ", userID, postID);
    updateParticipant(userID, postID , status);
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const posts = await fetchUserPosts();
        //console.log(posts)
        displayPosts(posts);
    } catch (error) {
        //console.error('Error fetching posts:', error);
    }
});

async function updateParticipant(userID, postID ,status) {
    try {
        const user = await fetchUser(userID);
        const postElement = document.querySelector(`.mypost-content[data-post-id="${postID}"]`);
        if (postElement) {
            const form = postElement.querySelector('.participants-name form');
            const newUserCheckbox = document.createElement('label');
            newUserCheckbox.innerHTML = `<span class="${status}"></span><input type="checkbox" name="participants" value="${user.userID}"> ${user.username} <span class="status"></span>`;
            form.appendChild(newUserCheckbox);
            //if (form) {
            //    renderParticipants([{userID: userID, username: user.username, status: status}], form);
            //    //const newUserCheckbox = document.createElement('label');
            //    //newUserCheckbox.innerHTML = `<span class="${status}"></span><input type="checkbox" name="participants" value="${user.userID}"> ${user.username} <span class="status"></span>`;
            //    //form.appendChild(newUserCheckbox);
            //}
        }
        //console.log("sucess")
    } catch (error) {
        //console.error('Error updating participant:', error);
    }
}

function selectAllParticipants(dropdownId) {
    const dropdownContent = document.getElementById(dropdownId);
    const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]:not([disabled])');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = !allChecked;
    });
    //console.log(dropdownId, allChecked ? "Unselecting all" : "Selecting all");
}

function updateParticipantsStatus(form, postId , status) {
    const selectedParticipants = [];
    form.querySelectorAll('input[name="participants"]:checked').forEach(participant => {
        selectedParticipants.push(participant.value);
    });
    if (selectedParticipants.length > 0) {
        updateStatus(postId, selectedParticipants, status)
            .then(response => response.ok ? response.json() : Promise.reject("Failed to update participants status."))
            .then(data => renderParticipants(data.participants, form))
            .catch(console.error);
    } else {
        alert("Please select at least one participant.");
    }
}

function renderParticipants(participants, form) {
    //console.log(participants)

    if (!form) {
        //console.error("Participants container not found");
        return;
    }

    form.innerHTML = '';
    if (participants.length === 0) {
        //form.innerHTML = '<p>No participants available.</p>';
        return;
    }

    const pendingParticipants = participants.filter(p => p.status === 'pending');
    const joinedParticipants = participants.filter(p => p.status === 'joined');
    const deniedParticipants = participants.filter(p => p.status === 'denied');

    pendingParticipants.forEach(p => {
        const label = document.createElement('label');
        label.innerHTML = `
            <span class="${p.status}"></span><input type="checkbox" name="participants" value="${p.userID}"> ${p.username} <span class="status"></span>
        `;
        form.appendChild(label);
    });
    joinedParticipants.forEach(p => {
        const label = document.createElement('label');
        label.innerHTML = `
           <span class="${p.status}"></span><input type="checkbox" name="participants" value="${p.userID}" disabled="true"> ${p.username} <span class="status"></span>
        `;
        form.appendChild(label);
    });
    deniedParticipants.forEach(p => {
        const label = document.createElement('label');
        label.innerHTML = `
            <span class="${p.status}"></span><input type="checkbox" name="participants" value="${p.userID}" disabled="true"> ${p.username} <span class="status"></span>
        `;
        form.appendChild(label);
    });
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

        let paticipantType = post.maxParticipants === 0 ? `<span class="participant-nonlimit">Non Limit Participant</span>` : `<span class="participant-limit">${post.maxParticipants} Participant</span>`

        let buttonContainerHTML;
        if (post.maxParticipants === 0) {
            buttonContainerHTML = `
            <div class="button-container">
                <button type="button" class="button-select-all" onclick="selectAllParticipants('${dropdownId}')">Select All</button>
                <button type="button" class="button-join" onclick="updateParticipantsStatus(document.querySelector('#${dropdownId} form'), ${post.postID}, 'joined')">Join Me</button>
                <button type="button" class="button-deny" onclick="updateParticipantsStatus(document.querySelector('#${dropdownId} form'), ${post.postID}, 'denied')">Deny</button>
            </div>
        `;
        } else {
            buttonContainerHTML = `<div class="button-container"></div>`;
        }

        postElement.innerHTML = `
            <div class="mypost-content" data-post-id="${post.postID}">
                <span class="card-time">${formatTime(post.startTime)} - ${formatTime(post.endTime)}</span>
                <span class="card-date">${new Date(post.startDate).toLocaleDateString()}</span>
                ${paticipantType}
                <span class="card-title">${post.title}</span>
                <p>${post.description}</p>

                <div class="event-controls">
                    <div onclick="toggleDropdown('${dropdownId}')" class="dropdown-button">Participant will join &#9662;</div>
                    <button type="button" class="button-remove" onclick="removeEvent(this)">Delete Post</button>
                </div>
                <div id="${dropdownId}" class="dropdown-content" dropdown-post-id="">
                    <div class="participants-name">
                        <form>
                        </form>
                    </div>
                    ${buttonContainerHTML}
                </div>
            </div>
        `;

        postsContainer.appendChild(postElement);
        form = document.querySelector(`#${dropdownId} form`)
        renderParticipants(post.participants, form);
    });
}

function formatTime(timeString) {
    return timeString.split(':').slice(0, 2).join(':');
}


function removeEvent(button) {
    const postElement = button.closest('.mypost-content');
    const postID = postElement.getAttribute('data-post-id');

    const modal = document.getElementById('confirmDeleteModal');
    modal.classList.add('show');

    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');

    confirmDeleteButton.onclick = function () {
        //console.log("Delete Post ID : ", parseInt(postID))
        modal.style.display = 'none'; 
        deletePost(parseInt(postID))
            .then(() => {
                modal.classList.remove('show');
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };


    cancelDeleteButton.onclick = function () {
        modal.classList.remove('show');
    };
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
        //console.error('Error fetching user:', error);
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
        //console.error('Error in fetchPosts:', error);
        throw error;
    }
}

function updateStatus(postId, selectedParticipants, status) {
    //console.log(postId, selectedParticipants, status);
    return fetch('/Mypost/UpdateStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            PostId: postId,
            Participants: selectedParticipants,
            Status: status
        })
    });
}

function deletePost(postID) {
    return fetch(`/DeletePost/${postID}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
        });
}