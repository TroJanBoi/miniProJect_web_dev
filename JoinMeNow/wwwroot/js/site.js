document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById('loading');
    const content = document.getElementById('content');

    function hideLoadingScreen() {
        loadingScreen.classList.add('hidden'); 
        content.classList.add('show'); 
    }

    window.onload = function () {
        loadingScreen.classList.remove('hidden');
        content.classList.remove('show');
        setTimeout(hideLoadingScreen, 500);
    };
});


connection.on("UpdateNotifications", function () {
    //console.log("UpdateNotifications");
    displayNotification(selectedDate);
});


const notificationBtn = document.getElementById('notification-btn');
const notificationPopup = document.getElementById('notification-popup');
const overlay = document.getElementById('overlay');
const body = document.body;


if (notificationBtn) {
    notificationBtn.addEventListener('click', function () {
        notificationPopup.classList.add('show'); 
        overlay.style.display = 'block';
        body.classList.add('lock-scroll');
    });
}

if (overlay) {
    overlay.addEventListener('click', function () {
        notificationPopup.classList.remove('show');
        overlay.style.display = 'none';
        body.classList.remove('lock-scroll');
    });
}

async function displayNotification() {
    console.log("UpdateNotifications");
    const notificationPopup = document.getElementById("notification-popup");
    const popupContent = notificationPopup.querySelector(".popup-content");
    const notificationCounter = document.querySelector('.notification-counter');

    const notifications = await fetchNotifications();
    if (!notificationPopup || !notificationCounter) {
        return;
    }

    if (!notifications) {
        popupContent.innerHTML = '<p>Error fetching notifications.</p>';
        return;
    }

    popupContent.innerHTML = '';

    const unreadNotifications = notifications.filter(notification => notification.status === 'unread');
    const unreadCount = unreadNotifications.length;

    if (unreadCount > 0) {
        notificationCounter.textContent = unreadCount;
        notificationCounter.style.display = 'inline'; 
    } else {
        notificationCounter.style.display = 'none';
    }

    if (notifications.length === 0) {
        popupContent.innerHTML = '<p>No notifications available.</p>';
    } else {
        notifications.forEach(notification => {
            const notificationItem = document.createElement("div");
            notificationItem.className = `notification-item ${notification.status}`;

            notificationItem.innerHTML = `
                <div>
                    <span>From</span>
                    <span class="username"> ${notification.sourceOwnerName}</span>
                </div>
                <span class="detail">
                    <span>${notification.detail}</span>
                </span>
                <span class="time">${new Date(notification.timestamp).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })}</span>
            `;
            popupContent.appendChild(notificationItem);
            popupContent.appendChild(document.createElement("hr"));
        });
    }
}


displayNotification();

// ########################### fetch Data ########################### //
async function fetchNotifications() {
    try {
        const response = await fetch('/Dashboard/GetNotifications');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const notifications = await response.json();
        //console.log(notifications);
        const reversedData = [...notifications].reverse();
        return reversedData;
    } catch (error) {
        //console.error('Error fetching notifications:', error);
        return null;
    }
}

async function markAllAsRead() {
    try {
        const response = await fetch('/Dashboard/MarkAllAsRead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        displayNotification();
    } catch (error) {
        //console.error('Error marking notifications as read:', error);
    }
}