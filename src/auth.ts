import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import axios from "axios"; // We will use axios to fetch the project ID from the metadata server

const secretClient = new SecretManagerServiceClient();

// Type definition for Express middleware
import { Request, Response, NextFunction } from "express";

// Function to fetch the Google Cloud project ID dynamically
const getProjectId = async (): Promise<string> => {
  try {
    const response = await axios.get<string>(
      "http://metadata.google.internal/computeMetadata/v1/project/project-id",
      {
        headers: {
          "Metadata-Flavor": "Google", // This header is required when making requests to the metadata server
        },
      }
    );
    return response.data; // Returns project ID as string
  } catch (error) {
    console.error("Error fetching project ID:", error);
    throw new Error("Failed to fetch the project ID");
  }
};

// Function to fetch the secret value from Google Cloud Secret Manager
const getSecretValue = async (secretName: string): Promise<string> => {
  try {
    const projectId = await getProjectId(); // Get the project ID dynamically

    const [version] = await secretClient.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`, // Use the dynamic project ID
    });

    if (!version?.payload?.data) {
      throw new Error("Secret payload is missing or corrupted");
    }

    // No need to pass 'utf8' as an argument to `toString()`
    const payload = version.payload.data.toString(); // Converts Buffer to string (UTF-8 by default)
    return payload; // Return the secret value (e.g., API Key)
  } catch (error) {
    console.error("Error accessing secret:", error);
    throw new Error(
      "Failed to access secret. Please check if the secret exists and permissions are correctly set."
    );
  }
};

// Middleware to validate API key from request headers
const checkApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const SECRET_KEY = await getSecretValue("MY_SECRET_KEY"); // Fetch the secret (API Key)
    const apiKey = req.headers["x-api-key"]; // Get API Key from request headers

    if (!apiKey || apiKey !== SECRET_KEY) {
      res.status(403).json({ error: "Forbidden: Invalid or missing API key" });
      return; // Important: Stop further execution after sending the response
    }

    next(); // If the key is valid, move on to the next middleware/handler
  } catch (error: unknown) {
    // Check if the error is an instance of Error
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Error accessing secret: " + error.message });
    } else {
      // If it's not an instance of Error, handle it gracefully
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

export { checkApiKey };
