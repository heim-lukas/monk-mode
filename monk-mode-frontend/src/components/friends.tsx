import { useEffect, useState } from "react";
import { AddFriend } from "./add-friend";
import { FriendList } from "./friend-list";
import { FriendRequests } from "./friend-requests";
import { signalRService } from "@/services";

export function Friends() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Start SignalR connection
    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();
        
        // Register event handlers
        signalRService.onFriendRequest((userId, username) => {
          const notification = `${username} sent you a friend request`;
          setNotifications(prev => [...prev, notification]);
          refreshData();
        });
        
        signalRService.onFriendRequestAccepted((userId) => {
          const notification = "Friend request accepted";
          setNotifications(prev => [...prev, notification]);
          refreshData();
        });
        
        signalRService.onFriendRequestRejected((userId) => {
          const notification = "Friend request rejected";
          setNotifications(prev => [...prev, notification]);
        });
      } catch (error) {
        console.error("Failed to initialize SignalR:", error);
      }
    };

    initializeSignalR();

    // Cleanup on unmount
    return () => {
      signalRService.stopConnection();
    };
  }, []);

  const refreshData = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <AddFriend onFriendRequestSent={refreshData} />
      </div>
      
      {notifications.length > 0 && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Notifications</h3>
          <ul className="space-y-1">
            {notifications.map((notification, index) => (
              <li key={index} className="text-sm">
                {notification}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FriendRequests key={`requests-${refreshKey}`} onRequestAction={refreshData} />
        <FriendList key={`friends-${refreshKey}`} onFriendRemoved={refreshData} />
      </div>
    </div>
  );
}