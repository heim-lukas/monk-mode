import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Friendship, getFriends, removeFriend } from "@/services";
import { signalRService } from "@/services";

export function FriendList() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFriends = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getFriends();
      setFriends(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load friends");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();

    const setupRealtime = async () => {
      try {
        await signalRService.startConnection();
        
        if (signalRService.hubConnection) {
          console.log("Setting up realtime for friend list");
          
          signalRService.hubConnection.on("FriendRequestAccepted", () => {
            console.log("Friend request accepted event in FriendList");
            loadFriends();
          });
        }
      } catch (error) {
        console.error("Error setting up realtime for friend list:", error);
      }
    };
    
    setupRealtime();
    
    return () => {
      if (signalRService.hubConnection) {
        signalRService.hubConnection.off("FriendRequestAccepted");
      }
    };
  }, [loadFriends]);

  const handleRemoveFriend = async (id: number) => {
    try {
      await removeFriend(id);
      await loadFriends();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to remove friend");
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Friends ({friends.length})</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadFriends}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading friends...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        {!isLoading && friends.length === 0 && (
          <p className="text-sm text-muted-foreground">You don't have any friends yet.</p>
        )}
        
        {friends.length > 0 && (
          <ul className="space-y-3">
            {friends.map((friend) => (
              <li key={friend.id} className="flex items-center justify-between border-b pb-2">
                <span>{friend.friendUsername}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFriend(friend.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}