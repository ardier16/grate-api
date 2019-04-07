# gRate API 
![GitHub repo size](https://img.shields.io/github/repo-size/ardier16/grate-api.svg?label=size)
![David](https://img.shields.io/david/ardier16/grate-api.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ardier16/grate-api.svg?style=popout)

The server side of the gRate social network

## How to run

### Clone the repository

Using SSH: `git clone git@github.com:ardier16/grate-api.git`

or

Using HTTPS: `git clone https://github.com/ardier16/grate-api.git`

### Prepare the environment

#### Install [Node.js & npm](https://nodejs.org)

#### Install [MongoDB](https://www.mongodb.com/)

#### Install Yarn
Run `npm install -g yarn`

#### Install all the dependencies
Go to the project folder and run `yarn` or `yarn install`

### Create the configuration file

Go to `/src` folder and create a file `config.js`:
````js
export default {
  // Secret key for encrypting the tokens
  secret: 'YOUR_SECRET_KEY',
  // MongoDB connection string
  dbConnectionString: 'mongodb://127.0.0.1:27017/grate_db',
  // Default application port
  port: 8080,
}
````

### Start the project

Run `yarn start`
