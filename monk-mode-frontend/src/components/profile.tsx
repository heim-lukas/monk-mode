import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "./mode-toggle";
import { Separator } from "@/components/ui/separator";
import { getFriends } from "@/services";
import { Friendship } from "@/services/friends";
import { getUserProfile, UserProfile } from "@/services/profile";

export function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };
    
    const loadFriends = async () => {
      setIsLoading(true);
      try {
        const loadedFriends = await getFriends();
        setFriends(loadedFriends);
      } catch (err) {
        console.error("Error loading friends:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load friends");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
    loadFriends();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Benutzerprofil-Karte */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.username || "Loading..."}</h3>
              <p className="text-muted-foreground">{user?.email || "Loading..."}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-2">
            <ModeToggle />
            <p>Toggle Theme</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistik-Karte */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground">Today's Focus Time</h4>
              <p className="text-2xl font-bold">0h 0m</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground">This Week</h4>
              <p className="text-2xl font-bold">0h 0m</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground">All Time Focus</h4>
              <p className="text-2xl font-bold">0h 0m</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground">Completed Tasks</h4>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Freunde-Karte */}
      <Card>
        <CardHeader>
          <CardTitle>Friends ({friends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading friends...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          {!isLoading && friends.length === 0 && (
            <p className="text-sm text-muted-foreground">You don't have any friends yet.</p>
          )}
          
          {friends.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-2 p-2 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {friend.friendUsername.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{friend.friendUsername}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}