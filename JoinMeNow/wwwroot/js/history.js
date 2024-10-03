document.addEventListener('DOMContentLoaded', function () {
    fetchInactivePosts();
});

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();


function renderPosts(posts) {
    const historyPage = document.querySelector('.historyPage');
    historyPage.innerHTML = ''; // Clear any previous content

    posts.forEach(post => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.dataset.status = post.status === 'Your' ? 'My Post' : 'Join Post';

        eventDiv.innerHTML = `
                <div class="history-type">
                    <span class="${post.status === 'Your' ? 'your' : 'join'}">
                        ${post.status === 'Your' ? 'My Post' : 'Join Post'}
                    </span>
                </div>
                <div class="event-status">
                    <span class="card-time">${formatTime(post.startTime)} - ${formatTime(post.endTime)}</span>
                    <span class="card-date">${formatDate(post.startDate)}</span>
                    <span class="card-title"><strong>${post.title}</strong></span>
                    <p>${post.description}</p>
                </div>
            `;

        historyPage.appendChild(eventDiv);
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeString) {
    return timeString.split(':').slice(0, 2).join(':');
}






// ########################### fetch Data ########################### //

async function fetchInactivePosts() {
    try {
        const response = await fetch('/History/GetInactivePosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (data.success === false) {
            return;
        }
        console.log(data);
        renderPosts(data);
    } catch (error) {
        console.error('Error:', error);
    }
}