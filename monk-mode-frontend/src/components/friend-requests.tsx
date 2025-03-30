import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Friendship, acceptFriendRequest, getFriendRequests, rejectFriendRequest } from "@/services";

interface FriendRequestsProps {
  onRequestAction: () => void;
}

export function FriendRequests({ onRequestAction }: FriendRequestsProps) {
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const loadFriendRequests = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getFriendRequests();
      setRequests(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load friend requests");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await acceptFriendRequest(id);
      setRequests(requests.filter(request => request.id !== id));
      onRequestAction();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to accept friend request");
      }
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectFriendRequest(id);
      setRequests(requests.filter(request => request.id !== id));
      onRequestAction();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reject friend request");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading requests...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        {!isLoading && requests.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending friend requests</p>
        )}
        
        {requests.length > 0 && (
          <ul className="space-y-3">
            {requests.map((request) => (
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
      </CardContent>
    </Card>
  );
}