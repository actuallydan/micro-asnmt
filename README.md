# Propark Code Challenge

LaGuardia Airport Parking Availability tracker for ProPark Micro Assignment

[Running on Google App Engine](https://propark-code-challenge.appspot.com)

## Objective

1.  Harvest Parking Availability Data from https://laguardiaairport.com
2.  Stream data to BigQuery table with the Terminal A Parking, Terminal B Parking, and Terminal C/D Parking occupancies.
3.  A new row should be added each half hour with the latest data.
4.  Deploy the app on Google’s PaaS offering: App Engine.
5.  (Bonus) Also store the data in Google Datastore

## Installation

```
git clone https://github.com/actuallydan/propark-code-challenge.git
cd propark-code-challenge && npm install
```

I obviously don't want my gcloud keys public, so I omitted the iam-service-account generated JSON key file, but that will be essential to run the script.

```
npm start
```

#### Harvesting the data

My immediate thought was to use a similar web-scraper package I had used before, but I wanted to see if I could find a Google Cloud solution for it specifically. After a lot of frustration I decided to just roll my own until I figured out that LaGuardia Airport's website is client-side rendered so curl and normal web scrapers wouldn't capture any rendered HTML. This means I couldn't grab the capacity values with a Regex. The values in question are, however, piped in with an XHR request, so grabbing that endpoint revealed that we can ping it with http or your favorite networking library for a clean JSON response. The data then gets extracted and reformed to be submitted.

#### Streaming to BigTable

Not being too familiar with BigTable yet, I wanted to make sure that I wouldn't run into "table doesn't exist" errors so I did some simple validation before adding the data.

Once settled, the script gets the first batch of availability data and then initializes an interval upon which it will re-get the information and append it to the BigQuery table.

#### Deploying

Once everything is commited, the app can be deployed to gcloud App Engine with:

```
gcloud app deploy --project propark-code-challenge
```

#### Logging

Once deployed, logs can be viewed either through the GCloud Console or by typing

```
gcloud app logs tail -s default
```
