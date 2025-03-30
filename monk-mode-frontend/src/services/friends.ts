import { API_BASE_URL } from "@/config/api";

export interface Friendship {
  id: number;
  userId: string;
  friendId: string;
  friendUsername: string;
  status: string;
  createdAt: string;
}

export interface FriendshipResponse {
  status: string;
  message: string;
  friendship?: Friendship;
}

// Get all friends
export async function getFriends(): Promise<Friendship[]> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Friendship`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to fetch friends");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
}

// Get friend requests
export async function getFriendRequests(): Promise<Friendship[]> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Friendship/requests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to fetch friend requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    throw error;
  }
}

// Send friend request
export async function sendFriendRequest(friendId: string): Promise<FriendshipResponse> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Friendship/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send friend request");
    }

    return data;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
}

// Accept friend request
export async function acceptFriendRequest(friendshipId: number): Promise<FriendshipResponse> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Friendship/accept/${friendshipId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to accept friend request");
    }

    return data;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
}

// Reject friend request
export async function rejectFriendRequest(friendshipId: number): Promise<FriendshipResponse> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Friendship/reject/${friendshipId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reject friend request");
    }

    return data;
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    throw error;
  }
}

// Remove friend
export async function removeFriend(friendshipId: number): Promise<{ status: string; message: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Friendship/${friendshipId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to remove friend");
    }

    return data;
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
}