# Consent Manager

The Prometheus-X Consent Manager is a service for managing consent within the Prometheus-X ecosystem. It empowers ecosystem administrators to oversee and enforce consent agreements, data/service providers to adhere to consent regulations, and users to manage their consent preferences seamlessly.

## Installation

### Locally

```sh
git clone https://github.com/Prometheus-X-association/consent-manager.git
cd consent-manager
npm install
cp .env.sample .env
# Configure your environment variables in .env
```

### Docker

1. Clone the repository from GitHub: `git clone https://github.com/Prometheus-X-association/consent-manager.git`
2. Navigate to the project directory: `cd consent-manager` and copy the .env.sample to .env `cp .env.sample .env`
3. Configure the application by setting up the necessary environment variables. You will need to specify database connection details and other relevant settings.
4. Generate the needed key with `npm run generatePrivateKey && npm run generateAES && npm run generatePublicKey`
5. Start the application: `docker-compose up -d`
6. If you need to rebuild the image `docker-compose build` and restart with: `docker-compose up -d`
7. If you don't want to use the mongodb container from the docker compose you can use the command `docker run -d -p your-port:3000 --name consent-manager consent-manager` after running `docker-compose build`

The consent manager is a work in progress, evolving alongside developments of the Contract and Catalog components of the Prometheus-X Ecosystem.

## Endpoints

For a complete list of all available endpoints, along with their request and response schemas, refer to the [JSON Swagger Specification](./docs/swagger.json) provided or visit the [github-pages](https://prometheus-x-association.github.io/consent-manager/) of this repository which displays the swagger specification with the Swagger UI.

## Contributing

We welcome contributions to the Prometheus-X Consent Manager. If you encounter a bug or wish to propose a new feature, kindly open an issue in the GitHub repository. For code contributions, fork the repository, create a new branch, make your changes, and submit a pull request.

## License

The Prometheus-X Consent Manager is open-source software licensed under the [MIT License](LICENSE).
