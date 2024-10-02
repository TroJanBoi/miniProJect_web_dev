const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();
connection.on("UpdateMeetup", function () {
    console.log("UpdateMeetup");
    displayEvents();
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});


const all = document.createElement('div');
all.className = 'all';

const meetup_body = document.createElement('div');
meetup_body.className = "meetup-body";


const up = document.createElement('h2');
up.className = 'up';
up.textContent = 'Upcoming Events';

const uppost = document.createElement('div');
uppost.className = 'uppost';
uppost.style.width = 'auto';
uppost.style.height = 'auto';
uppost.id = "uppost";

const alljoin = document.createElement('h2');
alljoin.className = 'alljoin';
alljoin.textContent = "Events You've Joined";


const alljoinpost = document.createElement('div');
alljoinpost.className = 'alljoinpost';
alljoinpost.style.width = 'auto';
alljoinpost.style.height = 'auto';
alljoinpost.id = "alljoin";


const meetupContentDiv = document.getElementById("events-root")

//document.body.appendChild(all)
meetupContentDiv.appendChild(all);
all.appendChild(meetup_body);
meetup_body.appendChild(up);
meetup_body.appendChild(uppost);
meetup_body.appendChild(alljoin);
meetup_body.appendChild(alljoinpost);





function formatTime(startTime, endTime) {
    const start = startTime.split(':').slice(0, 2).join(':');
    const end = endTime.split(':').slice(0, 2).join(':')
    return `${start} - ${end}`;
}


// Function เเปลง เป็น AM/PM
//function formatTime(startTime, endTime) {
//    // Parse start and end times
//    let [startHours, startMinutes] = startTime.split(':').map(Number);
//    let [endHours, endMinutes] = endTime.split(':').map(Number);

//    // Determine AM/PM for start and end times
//    const startAMPM = formatAMPM(startHours);
//    const endAMPM = formatAMPM(endHours);

//    // Convert 24-hour to 12-hour format (use modulus and handle midnight/noon)
//    startHours = startHours % 12 || 12;
//    endHours = endHours % 12 || 12;

//    // Format times with leading zeros for hours and minutes
//    const startFormatted = ${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')} ${startAMPM};
//    const endFormatted = ${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endAMPM};

//    return ${startFormatted} - ${endFormatted};
//}



async function displayEvents() {
    const UpcomingEvents = document.getElementById("uppost");
    const EventsJoined = document.getElementById("alljoin");

    UpcomingEvents.innerHTML = "";
    EventsJoined.innerHTML = "";

    const postData = await fetchPosts();
    if (Array.isArray(postData)) {
        postData.forEach(item => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';

            const eventTime = document.createElement('p');
            eventTime.className = 'event-time';
            eventTime.textContent = formatTime(item.startTime, item.endTime);

            const eventTitle = document.createElement('p');
            eventTitle.textContent = item.title;

            const eventDescription = document.createElement('p');
            eventDescription.textContent = item.description;

            const eventDetails = document.createElement('p');
            eventDetails.textContent = `Start Date: ${new Date(item.startDate).toLocaleDateString()} | End Date: ${new Date(item.endDate).toLocaleDateString()}`;

            const cancelButton = document.createElement('button');
            cancelButton.textContent = " Cancel";
            cancelButton.className = 'cancel-btn';


            eventCard.appendChild(eventTime);
            eventCard.appendChild(eventDetails);
            eventCard.appendChild(eventTitle);
            eventCard.appendChild(eventDescription);
            //eventCard.appendChild(cancelButton);


            const currentDate = new Date();
            const currentTime = currentDate.toTimeString().slice(0, 9)
            const time1 = new Date();
            const time2 = new Date();


            time1.setHours(currentTime.slice(0, 2), currentTime.slice(3, 5), currentTime.slice(6, 9));
            time2.setHours(item.startTime.slice(0, 2), item.startTime.slice(3, 5), item.startTime.slice(6, 9));


            const dateCheck = (currentDate.toISOString().split('T')[0] == item.startDate.split('T')[0]);
            const timeCheck = ((time2 - time1) / (1000 * 60));

            console.log(timeCheck);
            if (timeCheck <= 30 && timeCheck >= 0 && dateCheck) {
                eventCard.style.backgroundColor = '#FFFBEB';
                eventTime.style.color = "#BF6A02";
                eventDetails.style.color = "#BF6A02";
                eventTime.style.fontSize = '24px';
                uppost.appendChild(eventCard);
            } else {
                eventCard.style.backgroundColor = "#F2F2F7";
                alljoinpost.appendChild(eventCard);
            }
        });
    } else {
        console.error('Expected postData to be an array, but received:', postData);
    }
}


displayEvents();



async function fetchPosts() {
    try {
        const response = await fetch('/Meetup/GetPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(null)
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('API Error:', errorResponse);
            return [];
        }

        const postData = await response.json();
        console.log('Post Data:', postData);
        const reversedPostsData = [...postData].reverse();
        return reversedPostsData;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}