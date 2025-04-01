import { useState, useEffect } from "react";
import { signalRService } from "./signalr";

// Singleton for notifications
let notifications: string[] = [];
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(callback => callback());
}

export const notificationService = {
  init: async function() {
    // SignalR connection setup
    await signalRService.startConnection();
    
    if (signalRService.hubConnection) {
      // Remove existing handlers first
      signalRService.hubConnection.off("ReceiveFriendRequest");
      signalRService.hubConnection.off("FriendRequestAccepted");
      signalRService.hubConnection.off("FriendRequestRejected");
      
      // Register new handlers correctly
      signalRService.hubConnection.on("ReceiveFriendRequest", (userId: string, username: string) => {
        console.log(`Notification: Friend request from ${username}`);
        notifications = [...notifications, `${username} sent you a friend request`];
        notifyListeners();
      });
      
      signalRService.hubConnection.on("FriendRequestAccepted", (userId: string) => {
        console.log(`Notification: Friend request accepted`);
        notifications = [...notifications, `Friend request accepted`];
        notifyListeners();
      });
      
      signalRService.hubConnection.on("FriendRequestRejected", (userId: string) => {
        console.log(`Notification: Friend request rejected`);
        notifications = [...notifications, `Friend request rejected`];
        notifyListeners();
      });
    }
  },
  
  getNotifications: function(): string[] {
    return notifications;
  },
  
  addListener: function(callback: () => void): () => void {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  },
  
  clearNotifications: function(): void {
    notifications = [];
    notifyListeners();
  }
};

// React Hook for notifications
export function useNotifications(): {
  notifications: string[];
  clearNotifications: () => void;
} {
  const [list, setList] = useState<string[]>(notifications);
  
  useEffect(() => {
    const removeListener = notificationService.addListener(() => {
      setList([...notifications]);
    });
    
    notificationService.init().catch(err => 
      console.error("Failed to initialize notification service:", err)
    );
    
    return removeListener;
  }, []);
  
  return {
    notifications: list,
    clearNotifications: notificationService.clearNotifications
  };
}