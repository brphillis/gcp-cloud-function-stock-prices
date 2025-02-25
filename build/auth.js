"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApiKey = void 0;
const axios_1 = __importDefault(require("axios"));
const secret_manager_1 = require("@google-cloud/secret-manager");
const secretClient = new secret_manager_1.SecretManagerServiceClient();
const GCP_SECRET_NAME = "CLOUD_FUNCTION_STOCK_PRICE";
// Function to fetch the Google Cloud project ID dynamically
const getProjectId = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get("http://metadata.google.internal/computeMetadata/v1/project/project-id", {
            headers: {
                "Metadata-Flavor": "Google", // This header is required when making requests to the metadata server
            },
        });
        return response.data; // Returns project ID as string
    }
    catch (error) {
        console.error("Error fetching project ID:", error);
        throw new Error("Failed to fetch the project ID");
    }
});
// Function to fetch the secret value from Google Cloud Secret Manager
const getSecretValue = (secretName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const projectId = yield getProjectId(); // Get the project ID dynamically
        const [version] = yield secretClient.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretName}/versions/latest`, // Use the dynamic project ID
        });
        if (!((_a = version === null || version === void 0 ? void 0 : version.payload) === null || _a === void 0 ? void 0 : _a.data)) {
            throw new Error("Secret payload is missing or corrupted");
        }
        // No need to pass 'utf8' as an argument to `toString()`
        const payload = version.payload.data.toString(); // Converts Buffer to string (UTF-8 by default)
        return payload; // Return the secret value (e.g., API Key)
    }
    catch (error) {
        console.error("Error accessing secret:", error);
        throw new Error("Failed to access secret. Please check if the secret exists and permissions are correctly set.");
    }
});
// Middleware to validate API key from request headers
const checkApiKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === "development") {
        return next();
    }
    try {
        const SECRET_KEY = yield getSecretValue(GCP_SECRET_NAME); // Fetch the secret (API Key)
        const apiKey = req.headers["x-api-key"]; // Get API Key from request headers
        if (!apiKey || apiKey !== SECRET_KEY) {
            res.status(403).json({ error: "Forbidden: Invalid or missing API key" });
            return; // Important: Stop further execution after sending the response
        }
        next(); // If the key is valid, move on to the next middleware/handler
    }
    catch (error) {
        // Check if the error is an instance of Error
        if (error instanceof Error) {
            res
                .status(500)
                .json({ error: "Error accessing secret: " + error.message });
        }
        else {
            // If it's not an instance of Error, handle it gracefully
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
});
exports.checkApiKey = checkApiKey;
