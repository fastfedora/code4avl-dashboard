Code for America Community Dashboard
=======================

A dashboard designed to be easy to configure and update using Google Spreadsheets.

Originally designed for the Hack 4 Food event held by [Code for Asheville](http://codeforasheville.org/), a [Code for America](http://codeforamerica.org/) brigade. Hack 4 Food was held on June 1st, 2013 as part of the [National Civic Day of Hacking](http://hackforchange.org/).

Usage
---------
Create a Google Spreadsheet with two tabs:

 - **Configuration:** Contains information on how to setup the dashboard
 - **Data:** Contains the data to be displayed

Publish the spreadsheet, then copy the key from the URL. Paste this key into the constructor of the GoogleDashboard object:

````
new GoogleDashboard("<spreadsheet key>").show();
````

See the ````index.html```` page as an example.
