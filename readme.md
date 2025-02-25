# Cloud Function Endpoint - Stock Price

This is a basic template for a cloud function that fetches stock prices from Yahoo Finance. The endpoint is built using **Node.js** and **Google Cloud Functions**.

## Requirements

Before deploying this function, make sure you have the following installed:

- [Google Cloud SDK](https://cloud.google.com/sdk)
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Typescript](https://www.typescriptlang.org/)

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>

   ```

2. **Install dependencies:**
   npm install

3. **Set Gcp api key:**
   set GCP api key name in src/auth.ts

4. **Set up Google Cloud:**
   gcloud auth login
   gcloud services enable cloudfunctions.googleapis.com secretmanager.googleapis.com

5. **Deploy the function:**
   gcloud functions deploy getStockPriceFunction --runtime=nodejs22 --trigger-http --allow-unauthenticated

   function name must be same as src/index.ts function name in functions.http
