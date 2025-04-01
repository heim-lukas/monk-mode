import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "@/config/api";

class SignalRService {
  public hubConnection: signalR.HubConnection | null = null;
  
  public async startConnection(): Promise<void> {
    if (this.hubConnection) {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        console.log("SignalR already connected");
        return;
      }
      
      try {
        await this.hubConnection.stop();
        console.log("Stopped existing SignalR connection");
      } catch (err) {
        console.error("Error stopping existing connection:", err);
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Create a new connection
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}hubs/notifications?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    // Start the connection
    try {
      await this.hubConnection.start();
      console.log("SignalR connection started successfully");
    } catch (err) {
      console.error("Error starting SignalR connection:", err);
      this.hubConnection = null;
      throw err;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log("SignalR connection stopped");
      } catch (err) {
        console.error("Error stopping SignalR connection:", err);
      } finally {
        this.hubConnection = null;
      }
    }
  }
}

export const signalRService = new SignalRService();