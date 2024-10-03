const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();

document.getElementById("postForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        console.log("Form Data before sending:", Array.from(formData.entries()));
        try {
            await submitPostData(formData);
            window.location.href = '/';
        } catch (error) {
            console.error("Error:", error);
        }

    });

document.getElementById("limit").addEventListener("change", function () {
    document.querySelector(".number").disabled = !this.checked;
});
document.getElementById("non-limit").addEventListener("change", function () {
    document.querySelector(".number").disabled = this.checked;
});

document.addEventListener("DOMContentLoaded", () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const closeDateInput = document.getElementById('closeDate');

    const today = new Date().toISOString().split('T')[0];
    startDateInput.value = today;
    endDateInput.value = today;
    closeDateInput.value = today;

    startDateInput.min = today;
    closeDateInput.min = today;

    const updateEndDateMin = (startDate) => {
        endDateInput.min = startDate;
        if (endDateInput.value && new Date(endDateInput.value) < new Date(startDate)) {
            endDateInput.value = '';
        }
    };

    startDateInput.addEventListener('change', () => {
        updateEndDateMin(startDateInput.value);
    });

    endDateInput.addEventListener('change', () => {
        //if (endDateInput.value && startDateInput.value && new Date(endDateInput.value) < new Date(startDateInput.value)) {
        //    alert("End Date must be equal to or later than Start Date");
        //    endDateInput.value = '';
        //}
    });
})

async function ShowEvenType() {
    var eventSelectBox = document.getElementsByName("eventType")[0];
    eventSelectBox.innerHTML = "";

    eventSelectBox.innerHTML = `<option value="">Please select type</option>`;

    const evenType = await GetEvenType();

    if (Array.isArray(evenType)) {
        evenType.forEach(item => {
            const option = document.createElement("option");
            option.value = item.eventTypeID;
            option.text = item.typeName;
            eventSelectBox.appendChild(option);
        });
    }
}

ShowEvenType();


// ########################### fetch Data ########################### //

async function GetEvenType() {
    try {
        const response = await fetch("/Post/GetEvenType");
        const data = await response.json();
        return data;
        console.log("Success:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function submitPostData(formData) {
    try {
        const response = await fetch("/Post/CreatePost", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error creating post");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}