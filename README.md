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

# Services and Common Module in detail

Lets discuss the detailed implementation of each service in this application, their implementation challenges and some other possible implementation approaches.

## Authenticaion

There are many ways to autherize any user into the application. All the approaches eventaully boil down to these 2 types of approaches.

- Rely on Auth service

  - In this basically each service will either communicate to the auth service to check autherisation of a user.
  - Other option could be the auth service will act as a gateway proxy for all the requests.
  - Disadvantage:
    - In the end both the approaches have the same downside that we add dependency of one service on all the other services. If Auth is down, then everything is down.

- Independent Autherization Mechanism
  - One approach is that the user will first autherize with the auth service and recieve a token. (JWT token with expiration)
  - It then uses this token in all other service requests to autherise it self.
  - All services will have this autherization mechanism code which we can easily de-duplicate in a shared common module.
  - Disadvantage:
    - If auth service bans a user, it will take some time to reflect into other services.
    - If the application is not tolerable to this then the gateway approach is the go to option.
    - Another solution to this could be to emit a user ban event in all ther services. Each service has a in memory cache like redis that holds the banned user details for a expiration window duration.
    - This way the user won't be able to access other services in the window duration and after that his token will become invalid.

### Implementation

- Tech Stack : `TypeScript`, `Node`, `MongoDB`, `Express`, `JsonWebToken (JWT)`, `Cookie Session`
- Testing: `JEST`, `supertest`, `mongo-in-memory-server`
- Deployments:

  - A pod running the typescript based express server
  - A pod running the mongo database that holds a user data.

- Routes

  - signup
    - validates the new user.
    - stores in the DB
    - generates a JWT token and stores in the cookie session of request.
  - signin
    - validates existing user.
    - generates a JWT token and stores in the cookie session of request.
  - currentuser
    - Returns null if not autherised
    - Returns user details
  - signout
    - clears the request token for the domain.

- Password encryption

  - stored password for user uses `crypto` library to encrypt and store it db.
  - supplied and stored password hashes are compared and verified for auth.
  - once encrypted the password cannot be visibly seen in the database.

- Model
  - User
    - email id
    - password

## Common NPM Module

This is a shared common library published on npmjs as a [package](https://www.npmjs.com/package/@eventhive/common). All the serices basically install this package and will use the reusable code that it holds.

- Note: written in `Typescript`, published as `JS` using `del-cli`.

- Tech Stack: `express`, `TypeScript`, `node-nats-streaming`, `JWT`, `cookie-session`

It holds majorly the following:

- Custom Errors: So that each service remains consistent with throwing errors and corresponding messages.

- Events:

  - All different types of events and their corresponding events to publish and listen to them.
  - Template Base Publisher and Listener to reduce boiler plate setup for all the services.

- Middlewares: A consistent middleware to re-ue in different services to maintain consistency for the responses, so that the client code is not cluttered to handle different types of responses.

There is a small assumption for event plublisher and listener interface is that the services need to support typescript. For Cross Platform support one can explore JSON Schema, Protobuf, Apache Avro. These interfaces were added in first place to ensure that services always publish valid data object for a particular type of event. And the Listeners take into account for that types of data objects in recieved messages.

## Tickets Service

This service is the responsible service that performs the CRUD operations on Tickets Model.

- Tech Stack: `Common`, `mongoose`, `TypeScript`, `Express`, `node-nats-streaming`, `mongoose-update-if-current`

- Testing: `JEST`, `supertest`, `mongoose-in-memory-server`

- Routes

  - Get all tickets: Returns all the tickets by all the users that are not associated to a valid order. ( Avoid concurrent purchase).
  - Get a ticket details: Returns Ticket model for given id.
  - Create a new ticket.
  - Update a existing ticket: Allowed only to owner of ticket.

- Models

  - Tickets
    - title
    - price
    - userId
    - version
    - orderId

- Events:
  - Publish
    - Ticket Created ( Ticket details sent to listeners )
    - Ticket Updated ( Ticket details sent to listeners )
  - Listen
    - Order Created ( Ticket associated with order Id )
    - Order Cancelled ( Ticket freed from the order Id )
