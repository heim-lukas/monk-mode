import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Friendship, getFriends, removeFriend } from "@/services";

interface FriendListProps {
  onFriendRemoved: () => void;
}

export function FriendList({ onFriendRemoved }: FriendListProps) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
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
  };

  const handleRemoveFriend = async (id: number) => {
    try {
      await removeFriend(id);
      setFriends(friends.filter(friend => friend.id !== id));
      onFriendRemoved();
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
      <CardHeader>
        <CardTitle>Friends</CardTitle>
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