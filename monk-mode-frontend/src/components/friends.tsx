import { useEffect } from "react";
import { AddFriend } from "./add-friend";
import { FriendList } from "./friend-list";
import { FriendRequests } from "./friend-requests";
import { notificationService, useNotifications } from "@/services/notifications";

export function Friends() {
  const { notifications, clearNotifications } = useNotifications();

  useEffect(() => {
    // Initialisiere den NotificationService
    notificationService.init();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <AddFriend />
      </div>
      
      {notifications.length > 0 && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium mb-2">Notifications</h3>
            <button 
              onClick={clearNotifications} 
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-1">
          {notifications.map((notification: string, index: number) => (
            <li key={index} className="text-sm">
              {notification}
            </li>
          ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FriendRequests />
        <FriendList />
      </div>
    </div>
  );
}