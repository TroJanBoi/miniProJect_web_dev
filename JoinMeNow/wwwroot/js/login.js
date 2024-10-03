const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();