import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "@/config/api";

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;

  // Initialize and start the connection
  public async startConnection(): Promise<void> {
    if (this.hubConnection && 
        this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    this.connectionPromise = this.hubConnection.start();
    
    try {
      await this.connectionPromise;
      console.log("SignalR connection established");
    } catch (error) {
      console.error("Error establishing SignalR connection:", error);
      throw error;
    }
  }

  // Register event handlers
  public onFriendRequest(callback: (userId: string, username: string) => void): void {
    if (!this.hubConnection) {
      console.error("Hub connection not initialized");
      return;
    }

    this.hubConnection.on("ReceiveFriendRequest", callback);
  }

  public onFriendRequestAccepted(callback: (userId: string) => void): void {
    if (!this.hubConnection) {
      console.error("Hub connection not initialized");
      return;
    }

    this.hubConnection.on("FriendRequestAccepted", callback);
  }

  public onFriendRequestRejected(callback: (userId: string) => void): void {
    if (!this.hubConnection) {
      console.error("Hub connection not initialized");
      return;
    }

    this.hubConnection.on("FriendRequestRejected", callback);
  }

  // Disconnect the hub
  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      console.log("SignalR connection stopped");
    }
  }
}

export const signalRService = new SignalRService();