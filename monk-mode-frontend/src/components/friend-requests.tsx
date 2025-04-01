import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Friendship, 
  acceptFriendRequest, 
  getFriendRequests, 
  getSentFriendRequests, 
  rejectFriendRequest 
} from "@/services";
import { Separator } from "@/components/ui/separator";
import { signalRService } from "@/services";

export function FriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllRequests = useCallback(async () => {
    console.log("Loading all friend requests...");
    setIsLoading(true);
    setError("");

    try {
      const [receivedData, sentData] = await Promise.all([
        getFriendRequests(),
        getSentFriendRequests()
      ]);
      
      setReceivedRequests(receivedData);
      setSentRequests(sentData);
    } catch (err) {
      console.error("Error loading requests:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load friend requests");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllRequests();
    
    const setupRealtime = async () => {
      try {
        await signalRService.startConnection();
        
        if (signalRService.hubConnection) {
          console.log("Setting up realtime for friend requests");
          
          // Function to handle updates
          const handleUpdate = () => {
            console.log("Received friend request update");
            loadAllRequests();
          };
          
          // Register for events
          signalRService.hubConnection.on("ReceiveFriendRequest", handleUpdate);
          signalRService.hubConnection.on("FriendRequestAccepted", handleUpdate);
          signalRService.hubConnection.on("FriendRequestRejected", handleUpdate);
        }
      } catch (error) {
        console.error("Error setting up realtime for friend requests:", error);
      }
    };
    
    setupRealtime();
    
    // Cleanup
    return () => {
      if (signalRService.hubConnection) {
        signalRService.hubConnection.off("ReceiveFriendRequest");
        signalRService.hubConnection.off("FriendRequestAccepted");
        signalRService.hubConnection.off("FriendRequestRejected");
      }
    };
  }, [loadAllRequests]);

  const handleAccept = async (id: number) => {
    try {
      await acceptFriendRequest(id);
      
      setReceivedRequests(prev => prev.filter(request => request.id !== id));
    } catch (err) {
      console.error("Error accepting request:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to accept friend request");
      }
      // Reload on error to ensure correct state
      loadAllRequests();
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectFriendRequest(id);
      
      setReceivedRequests(prev => prev.filter(request => request.id !== id));
    } catch (err) {
      console.error("Error rejecting request:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reject friend request");
      }
      // Reload on error to ensure correct state
      loadAllRequests();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Friend Requests</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadAllRequests}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <div>
          <h3 className="text-md font-medium mb-2">Received Requests</h3>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && receivedRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending friend requests</p>
          )}
          
          {receivedRequests.length > 0 && (
            <ul className="space-y-3">
              {receivedRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between border-b pb-2">
                  <span>{request.friendUsername}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-md font-medium mb-2">Sent Requests</h3>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && sentRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending sent requests</p>
          )}
          
          {sentRequests.length > 0 && (
            <ul className="space-y-3">
              {sentRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between border-b pb-2">
                  <span>{request.friendUsername}</span>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}