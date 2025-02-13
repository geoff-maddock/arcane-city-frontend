# Arcane City Frontend

This is a frontend for the Arcane City project, which leverages the [Events-Tracker API](https://github.com/geoff-maddock/events-tracker).  

It is built using React, TypeScript and Tailwind.

# Getting Started

To get started, clone the repository and run `npm install` to install the dependencies.  
Copy the `.env.example` file to `.env` and update the variable to point to the Events-Tracker API.
Run `npm run dev` to start the development server.

# Deployment to Digital Ocean

To deploy the application to Digital Ocean, follow these steps:

1. **Create a Digital Ocean account**: If you don't have one, sign up at [Digital Ocean](https://www.digitalocean.com/).

2. **Install doctl**: Digital Ocean's command-line tool. Follow the instructions [here](https://docs.digitalocean.com/reference/doctl/how-to/install/).

3. **Authenticate doctl**: Run `doctl auth init` and follow the prompts to authenticate.

4. **Create a Digital Ocean App**: You can create an app via the Digital Ocean dashboard or using the `doctl` command-line tool. Make sure to note down the `DIGITALOCEAN_APP_ID`.

5. **Set up environment variables**: Copy the `.env.example` file to `.env` and update the variables, including `DIGITALOCEAN_API_TOKEN` and `DIGITALOCEAN_APP_ID`.

6. **Build and deploy the application**: Run the following command to build and deploy the application:
   ```sh
   npm run deploy:do
   ```

7. **Access your application**: Once the deployment is complete, you can access your application at the specified domain.

For more detailed instructions, refer to the [Digital Ocean App Platform documentation](https://www.digitalocean.com/docs/app-platform/).
