# EventHive
This is a small ticket selling and buying platform. It works on a micro-service based arcitecture that all combined provide a platform to sell tickets, place orders and make real-time payments for them.

## Application Features

- Autherise a user to sell and buy tickets.
- See all the tickets that are available to purchase.
- See all the orders a user has created.
- On attempt to purchase a ticket provide a 1 minute window to make payment, else cancel the order.
- Keep track of all the payments and their corresponding orders.

## Design overview

To achieve this application requirement in a way that the application is easily scalable and less coupled on these features we followed a micro-service architecture based approach. 

All in all we have implemented 5 different services exposed for each type of requirement.

- `Authentication Service`: Autherization related business logic.
- `Server Side Rendered Client`: For SEO and less client side depended rendering we used a server side client that renders the required components and their data and sends it over to the actual client.
- `Tickets Service`: Ticket CRUD operation business logic.
- `Orders Service`: Orders CRUD operation business logic.
- `Payments Service`: Payment operation business logic.

Internally have further 2 services that support the application and extends other features and communications between different services.

- `Expiration Service`: Monitors the created orders and handles expiration events on these orders.
- `NATS streaming server`: An event bus for fluent communication between different services.

To avoid duplication of middlewares, error handlers and event interfaces, npm package is created which holds this common code to all the services.

- `Common Module`: Holds the reusable code for different services. It is published as a npm package. It is a sub-module to this repository. Actual repository for it can be found [here](https://github.com/Pranshu-Tripathi/Event-Hive-Common)

Third Party library

- `react-stripe-checkout`: Used for retrieving API based payment tokens from stripe.com and then storing them in payment service.

# Architecture Diagram

![Untitled Diagram](https://github.com/user-attachments/assets/46bdebbc-5249-441a-92de-5c5e217c4833)

# Google Cloud k8s Context Setup

In [this](https://github.com/Pranshu-Tripathi/EventHive/pull/1) pull request the GKE setup was established for working with cloud clusters for development phase as well. This way no local system setup of skaffold and k8s was needed. Locally only the kubernetes engine needs to be running and we can set the context to the gke based clusters. 

# Testing

All the services except the expiration service are thoroughly unit tested for all the routes and their corresponding business logic. We used jest for testing the services and supertest libraries to simulate the request and response logic.

# CI / CD

We used github workflows to set up the CI / CD pipelines for this application. The workflows can be defined as below.

1. Raise a pull request
   - Run tests for the component in which changes are made. Merge allowed only when these tests pass.
2. Push/Merge changes to main branch
   - Run all the tests in all the services and exit if any fails.
   - Setup google cloud sdk in a job
   - Set a service account key decrypted using the passphrase secret (key is encrypted using the `gpg --symmetric --cipher-algo AES256 eventhive-gke-service-account-key.json ` command and passphare).
   - Authenticate the service account inside the project and get cluster credentials
   - Install skaffold.
   - Run the skaffold.yaml file that exists in the root directory for deployment in the GKE cluster.
       - It reads the infrastructure/k8s directory and watches for any changes in there.
       - It pulls the code and pushes it to us.gcr.io and builds images out of it in the cloud project.
       - Then it deploys the images into the defined pods.


