# EverVest Investment Application

## Description 

EverVest is a powerful investment application designed to empower users with tools for financial planning and investment management. The platform offers features such as automated investment plans, personalized insights based on user preferences, and seamless integration with financial data sources. With EverVest, users can redefine their financial planning and investment decisions through automation and data integration.

## Features

- User authentication with Supabase
- Investment plan generation using LLaMA API
- User-friendly interface for managing investments
- Responsive design for mobile and desktop
- Secure data handling and storage

## Technologies Used

- **Frontend**: Javascript, React, React Router, CSS
- **Backend**: Supabase (for authentication and database)
- **API Integration**: LLaMA API for investment plan generation
- **Deployment**: Vercel

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Supabase account and project
- Access to the LLaMA API

### Cloning the Repository

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the repository.
3. Run the following command:

   ```bash
   git clone https://github.com/aadamgough/evervest-app.git
   ```

4. Navigate into the cloned directory:

   ```bash
   cd evervest-app
   ```

### Setting Up Environment Variables

1. Create a `.env` file in the `client` directory:

   ```bash
   touch client/.env
   ```

2. Add the following environment variables to the `.env` file:

   ```plaintext
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_SCHWAB_CLIENT_ID=your_schwab_client_id
   REACT_APP_REDIRECT_URI=your_redirect_uri
   LLAMA_API_KEY=your_llama_api_key
   ```

3. Replace the placeholder values with your actual API keys and URLs.

### Installing Dependencies

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:

   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

### Building for Production

To create a production build of the application, run:

bash
npm run build

This will generate a `build` directory containing the optimized production files.

### Deployment

You can deploy the application to Vercel or any other hosting service of your choice. Follow the respective service's documentation for deployment instructions.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for providing the backend services.
- [LLaMA API](https://llama-api.com/) for investment plan generation.
- [React](https://reactjs.org/) for building the user interface.