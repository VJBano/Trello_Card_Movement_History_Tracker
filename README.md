# Trello Card Movement History Tracker

**Trello Card Movement History Tracker** is a Node.js application that tracks Trello card movements across different boards. The application logs these movements into Google Sheets and generates CSV files to store historical movement data. It leverages the Google Sheets API to append data to a Google Sheet and interacts with the Trello API to retrieve card movement information.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Clone the Repository](#1-clone-the-repository)
  - [Install Dependencies](#2-install-dependencies)
  - [Set Up Environment Variables](#3-set-up-environment-variables)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Dependencies](#dependencies)
- [Google Sheet](#google-sheet)
- [Trello](#trello-account)
- [Time Tracker](#time-tracker)

## Features

- Tracks movements of Trello cards between different boards.
- Appends movement data to a Google Sheet.
- Generates and handles CSV files for storing historical data.
- Unit tests with Jest to ensure the correctness of the program.
- include caching to third party API's

## Prerequisites

Before running this application, make sure you have the following:

- [**Node.js** version 14.x or higher ](https://nodejs.org/en/aboutprevious-releases).
- [NPM 10.9.2](https://github.com/nodejs/node/releases/tag/v22.13.0)
- **Trello API Key** and **API Token**.
- **Google Sheets API Service Account** credentials.

## Installation

#### Clone repository

```bash
git clone
```

#### Install Dependencies

```bash
  npm install
```

#### Set Up Environment Variables

- Create .env file in root directory

- For windows

```bash
    echo "SHEET_ID=1GSvt_Q1HgIi8vX5fwkpExixPPfMB_-6mhSFLebaHXec" > .env
    echo " API_KEY=dea79590ba31f2d838d68e018456e40a" >> .env
    echo "API_TOKEN=ATTAcc7f7c9eb9730880c9ee64d450f7f1b22db5fccf9a6e811f99cd4e76255ec20a68AE8EC2" >> .env
    echo "BOARD_ID=64mlHvhu" >> .env

```

- For Ubuntu

```bash
    touch .env
```

- Edit the .env File Using nano

```bash
nano .env
```

- Add Your Environment Variables

```bash
          API_KEY=dea79590ba31f2d838d68e018456e40a
          API_TOKEN=ATTAcc7f7c9eb9730880c9ee64d450f7f1b22db5fccf9a6e811f99cd4e76255ec20a68AE8EC2

          BOARD_ID=64mlHvhu

          SHEET_ID=1GSvt_Q1HgIi8vX5fwkpExixPPfMB_-6mhSFLebaHXec

```

- Save and Exit nano
  - After adding the required variables, press Ctrl + X to exit nano.
  - When prompted to save, press Y to confirm.
  - Finally, press Enter to save the file.

## Usage

#### Running the Application

- run without board ID

  ```bash
  node index

  ```

- run with board ID

  ```bash
    node index <board_id here>

  ```

#### Running the Test

```bash
   npm run test
```

or

```bash
    npm test
```

## Dependencies

#### Dependencies

- [axios](https://www.npmjs.com/package/axios)
- [csv-parser](https://www.npmjs.com/package/csv-parser)
- [csv-writer](https://www.npmjs.com/package/csv-writer)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [googleapis](https://www.npmjs.com/package/googleapis)

#### devDependencies

- [@babel/core](https://www.npmjs.com/package/@babel/core)
- [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env)
- [babel-jest](https://www.npmjs.com/package/babel-jest)
- [jest](https://www.npmjs.com/package/jest)

## Google Sheet

- google Sheets Intergration Link

```bash
https://docs.google.com/spreadsheets/d/1GSvt_Q1HgIi8vX5fwkpExixPPfMB_-6mhSFLebaHXec/edit?gid=0#gid=0
```

## Trello Account

- Trello Workspace Board

```bash
https://trello.com/b/64mlHvhu/trello-tracker
```

## Time Tracker

```bash
https://app.clockify.me/shared/678a5505ebf9ce23b4fadf97

```
