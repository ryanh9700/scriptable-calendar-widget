try {
  Location.setAccuracyToThreeKilometers();
  const currentCoordinates = await Location.current();
  const currentLat = currentCoordinates.latitude;
  const currentLong = currentCoordinates.longitude;

  // Random location in UK for location testing
  // const currentLat = 51.5072178
  // const currentLong = -0.1275862


  let locationJSON = await Location.reverseGeocode(currentLat, currentLong);

  const countryISO = locationJSON[0].isoCountryCode;
  let cityName = locationJSON[0].locality;
  let regionName = locationJSON[0].administrativeArea;

  // Location error handling
  if (cityName == null) {
    cityName = locationJSON[0].country;
    regionName = "";
  } else if (regionName == null) {
    regionName = "";
  } else {
    regionName += " | ";
  }

  // File manager
  let fm = FileManager.iCloud();
  const path = fm.joinPath(fm.documentsDirectory() + "/EventWeatherWidget", "locationInfo.txt");

  let locInfo = {
    "city": cityName,
    "state": regionName,
    "countryISO": countryISO,
    "latitude": currentLat,
    "longitude": currentLong,
  }

  // Overwrite location info to locationInfo.txt
  locInfo = JSON.stringify(locInfo)
  fm.writeString(path, locInfo);
  Safari.open("scriptable:///run/Events,%20Weather%20Widget");

} catch (error) {
  let alert = new Alert();
  alert.title = Script.name() + " Error";
  alert.message = error.toString();
  alert.addCancelAction("Ok");

  alert.present();
}
