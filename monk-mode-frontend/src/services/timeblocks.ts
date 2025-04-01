import { API_BASE_URL } from "@/config/api";
import { TimeBlock } from "@/types/types";

interface ErrorResponse {
  status: string;
  message: string;
}

export async function getTimeBlocks(token: string): Promise<TimeBlock[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/TimeBlock`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ErrorResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching time blocks:", error);
    throw error;
  }
}

export async function getTimeBlockById(
  token: string,
  id: string | number
): Promise<TimeBlock> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/TimeBlock/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ErrorResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching time block with ID ${id}:`, error);
    throw error;
  }
}

export async function createTimeBlock(
  token: string,
  timeBlock: TimeBlock
): Promise<TimeBlock> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/TimeBlock`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...timeBlock,
        date: new Date(timeBlock.date).toISOString(), // Ensure proper format
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ErrorResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error creating time block:", error);
    throw error;
  }
}

export async function updateTimeBlock(
  token: string,
  timeBlock: TimeBlock
): Promise<TimeBlock | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/TimeBlock/${timeBlock.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...timeBlock,
          date: new Date(timeBlock.date).toISOString(), // Ensure ISO format
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      if (errorData) {
        const parsedError = JSON.parse(errorData) as ErrorResponse;
        throw new Error(parsedError.message);
      } else {
        throw new Error("An unknown error occurred.");
      }
    }

    // If response has no content (204 No Content)
    if (response.status === 204) {
      console.log("Time block updated successfully, but no content returned.");
      return null;
    }

    // If response has a body, parse and return the updated time block
    return response.json();
  } catch (error) {
    console.error(`Error updating time block with ID ${timeBlock.id}:`, error);
    throw error;
  }
}

export async function deleteTimeBlock(
  token: string,
  id: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/TimeBlock/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ErrorResponse;
      throw new Error(parsedError.message);
    }

    console.log(`Time block with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting time block with ID ${id}:`, error);
    throw error;
  }
}
