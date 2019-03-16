# gRate API [Work in progress]

The server side of the gRate social network

## How to run

### Clone the repository

Using SSH: `git clone git@github.com:ardier16/grate-api.git`

or

Using HTTPS: `https://github.com/ardier16/grate-api.git`

### Prepare the environment

#### Install [Node.js & npm](https://nodejs.org)

#### Install [MongoDB](https://www.mongodb.com/)

#### Install Yarn
Run `npm install -g yarn`

#### Install all the dependencies
Go to the project folder and run `yarn` or `yarn install`

### Create the configuration file

Go to `/src` folder and create a file `config.js`:
````javascript
export default {
  // Secret key for encrypting the tokens
  secret: 'YOUR_SECRET_KEY',
  // MongoDB connection string
  dbConnectionString: 'mongodb://127.0.0.1:27017/grate_db',
  // Default application port
  port: 8080,
}
````

### Run the project

Run `yarn start`
