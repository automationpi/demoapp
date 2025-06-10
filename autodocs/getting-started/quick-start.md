---
title: Quick Start
description: Quick Start
---

# Quick Start

### Basic Examples

#### Viewing Airline Database
Navigate to `Airline.php` to view airline data, which lists details of 5888 airlines. The page includes autocomplete for airline names using `airlinesearch.php`.

#### Searching for Flights
On the home page (`Home.php`), use the search form to input origin and destination cities with autocomplete support, then submit to `main.php` for processing.

```html
<form method="post" action="main.php" id="searchform">
  <label>Origin</label><input id="origin" name="origincity" required />
  <label>Destination</label><input id="destination" name="destinationcity" required />
  <button type="submit">Search Flights</button>
</form>
```

#### Viewing Airport Data
Access `Airport.php` or `Airportdisplay.php` to explore airport details, with autocomplete support for airport searches.

#### Analytical Operations
Navigate to `Analytical.php` to perform advanced data analysis such as Drill, Pivot, Slice, and Dice.

```html
<button onclick="location.href='drill.php'">Drill operations</button>
<button onclick="location.href='pivot.php'">Pivot</button>
<button onclick="location.href='slice.php'">Slice</button>
<button onclick="location.href='dice.php'">Dice</button>
```

### Configuration & Options

- **Autocomplete Data Sources:** Implemented via PHP scripts (`airlinesearch.php`, `airportsearch.php`, `autocomplete.php`, `images/autocomplete.php`) that fetch distinct names from the database and encode as JSON for jQuery UI Autocomplete.
- **Database Credentials:** Located in PHP scripts, primarily in connection setup lines (`new PDO(...)`). Update as necessary for your environment.
- **Analytical Tools:** Located in `drill.php`, `drillup.php`, `pivot.php`, `slice.php`, `dice.php`, which generate HTML forms and display data tables.

---
