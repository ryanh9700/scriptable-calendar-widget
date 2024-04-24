// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: pink;
// icon-glyph: magic;

//*****set prereqs
const scriptName = Script.name();
let current_date = new Date();
let df = new DateFormatter();
const fm = FileManager.iCloud();
const folderPath = fm.documentsDirectory() + "/EventWeatherWidget";
const visibility = false;
//*****set prereqs


//*****location (must manually update location by running /getLocationInfo)
const locationFilePath = fm.joinPath(folderPath, "locationInfo.txt");
const locationJSON = JSON.parse(fm.readString(locationFilePath))

const city_name = locationJSON.city;
const region_name = locationJSON.state;
const country_iso = locationJSON.countryISO;
//*****location

//*****weather
//emoji weather
let weatherEmoji = {
  //**daytime
  //all cloud types
  "few clouds": "cloud.sun.fill",
  "scattered clouds": "cloud.sun.fill",
  "broken clouds": "cloud.fill",
  "overcast clouds": "smoke.fill",
  //variance weather
  "clear": "sun.max.fill",
  "shower rain": "cloud.rain.fill",
  "rain": "cloud.heavyrain.fill",
  "thunderstorm": "cloud.bolt.rain.fill",
  "snow": "snowflake",
  "drizzle": "cloud.drizzle.fill",

  //extra weather
  "mist": "cloud.fog.fill",
  "smoke": "eye.trianglebadge.exclamationmark.fill",
  "haze": "sun.haze.fill",
  "dust": "sun.dust.fill",
  "fog": "cloud.fog.fill",
  "sand": "allergens",
  "dust": "allergens",
  "ash": "flame.circle.fill",
  "squall": "wind",
  "tornado": "tornado",

  //**nighttime
  //all cloud types
  "few cloudsN": "cloud.moon",
  "scattered cloudsN": "cloud.moon",
  "broken cloudsN": "cloud",
  "overcast cloudsN": "smoke",
  //variance weather
  "clearN": "moon.stars",
  "shower rainN": "cloud.rain",
  "rainN": "cloud.heavyrain",
  "thunderstormN": "cloud.bolt.rain",
  "snowN": "snowflake",
  "drizzleN": "cloud.drizzle",

  //extra weather
  "mistN": "cloud.fog",
  "smokeN": "eye.trianglebadge.exclamationmark",
  "hazeN": "sun.haze",
  "dustN": "sun.dust",
  "fogN": "cloud.fog",
  "sandN": "allergens",
  "dustN": "allergens",
  "ashN": "flame.circle",
  "squallN": "wind",
  "tornadoN": "tornado",
}


//configure OpenWeatherMap API Link
const part = "alerts,minutely";
const apiKey = "YOUR_KEY";
const lat = locationJSON.latitude;
const long = locationJSON.longitude;

let apiLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=${part}&units=imperial&appid=${apiKey}`;

//get weather information
let Requests = new Request(apiLink);
let weatherJSON = await Requests.loadJSON();

const weather_results_array = testMode("off");

//assign resultant weather values to respective variable
const current_low = weather_results_array[0];
const current_high = weather_results_array[1];
const current_temp = weather_results_array[2];
const current_wind_speed = weather_results_array[3];
const current_humidity = weather_results_array[4];
const weatherTypeEmoji = weather_results_array[5];
const next_hour_temp_icon = weather_results_array[6];
const next_hour_temp_color = weather_results_array[7];
const weatherTypeEmojiColor = weather_results_array[8];
//*****weather


//*****fonts
const weatherInfoFont = Font.lightRoundedSystemFont(15);
const eventInfoFont = Font.regularRoundedSystemFont(14);
const eventDateTitleFont = Font.semiboldMonospacedSystemFont(14);
//*****fonts

//*****days until event colors
const todayColor = "ff3000";
const tomoColor = "cbcbff";
const threeDaysColor = "00bfff";
const otherColor = "white";
//*****days until event colors

//****after 2 events (which is the max), quantify "extra" events today, tomo., within 5 days, and >5 days
let numEventsToday = 0;
let numEventsTomo = 0;
let numEventsFiveDays = 0;
let numEventsOther = 0;
//


let final_widget = await createWidget();

//display widget
if (config.runsInWidget) {
  await Script.setWidget(final_widget);

} else {
  final_widget.presentLarge();
}

Script.complete();


//async function of creating widget
async function createWidget() {
  let widget = new ListWidget();

  //*****widget background	
  const imagePath = fm.joinPath(folderPath, "getWidgetImage.PNG");

  try {
    if (fm.isFileDownloaded(imagePath) === false) {
      await fm.downloadFileFromiCloud(imagePath);
    }
    widget.backgroundImage = fm.readImage(imagePath);

  } catch {
    Safari.open("scriptable:///run/getWidgetImage");
    widget.backgroundImage = fm.readImage(imagePath);
  }
  //*****widget background

  //*******Widget Design**********
  //title
  //LEFT - "[City Name]"
  let location_title = widget.addStack();
  location_title.setPadding(10, 0, 0, 0);
  location_title.url = "scriptable:///run/getLocation";
  createTextRow("none", location_title, `${city_name}`, "white", Font.boldRoundedSystemFont(22), 1, visibility, "red");


  //LEFT - "[State/Province Name] | [Country ISO Code]"
  let state_title = widget.addStack();
  createTextRow("none", state_title, `${region_name}`, "white", Font.boldRoundedSystemFont(18), 1, visibility, "blue");
  createTextRow("none", state_title, `${country_iso}`, "orange", Font.boldRoundedSystemFont(18), 1, visibility, "blue");

  //createTextRow(side, stack, text, textColor, font, lineLimitInput, visibility, visColor, textOp)
  //createImageRow(side, stack, sfName, imageColor, imgSize, font, visibility, visColor)
  //Left side - add spacer after text
  //Right side - add spacer before text
  let main_column = widget.addStack();
  widget.addSpacer();

  //divide widget into left/right halves
  let left_row = main_column.addStack();
  let right_row = main_column.addStack();

  left_row.layoutVertically();
  right_row.layoutVertically();

  //create left, right titles
  //LEFT - "[Day], [Date]\n[blank space]"
  let left_location_title = left_row.addStack();
  left_location_title.size = new Size(0, 115); //115
  left_location_title.setPadding(3, 0, 0, 0);
  left_location_title.url = "scriptable:///run/getWidgetImage";

  //format date
  df.dateFormat = "EEEE"
  currentDay = df.string(current_date);
  let dayTitle_text = createTextRow("none", left_location_title, currentDay, "orange", Font.semiboldMonospacedSystemFont(15), 0, visibility, "red");
  //dayTitle_text.shadowRadius = 0;

  df.dateFormat = ", MMM d";
  currentMonthAndDate = df.string(current_date);
  let dateTitle_text = createTextRow("left", left_location_title, currentMonthAndDate, "white", Font.lightMonospacedSystemFont(15), 0, visibility, "red");
  //dateTitle_text.shadowRadius = 0;


  // 			//LEFT - "{SFSymbol Calendar} Events"
  //MOVED TO FOR LOOP OF EVENTS

  ////////////////////////////

  //RIGHT - "Weather"
  let right_weather_title = right_row.addStack();
  right_weather_title.size = new Size(0, 30)

  createTextRow("right", right_weather_title, "Weather", "white", Font.boldRoundedSystemFont(18), 1, visibility, "red");


  //RIGHT - "[High]-[Low]"
  let right_weather_highlow = right_row.addStack();
  createTextRow("right", right_weather_highlow, `${current_low} - ${current_high}°F `, "white", weatherInfoFont, 1, visibility, "blue");


  //RIGHT - "{SFSymbol Current Weather} [Current Weather]°F {SFSymbol Up/Down Predicted Weather Arrow}"
  let right_weather_currentTemp = right_row.addStack();
  right_weather_currentTemp.size = new Size(0, 30);

  createImageRow("right", right_weather_currentTemp, weatherTypeEmoji, weatherTypeEmojiColor, new Size(20, 17.75), weatherInfoFont, visibility, "red");

  createTextRow("none", right_weather_currentTemp, ` ${current_temp}°F `, "orange", weatherInfoFont, 1, visibility, "red");

  createImageRow("none", right_weather_currentTemp, next_hour_temp_icon, next_hour_temp_color, new Size(10, 10), weatherInfoFont, visibility, "blue");


  //RIGHT - "H: [Humidity]%"
  let right_weather_currentHumidity = right_row.addStack();
  createTextRow("right", right_weather_currentHumidity, `H: ${current_humidity}%`, "white", weatherInfoFont, 1, visibility, "blue");


  //RIGHT - "W: [Wind Speed] mph"
  let right_weather_currentWindSpeed = right_row.addStack();
  createTextRow("right", right_weather_currentWindSpeed, `W: ${current_wind_speed} mph`, "white", weatherInfoFont, 1, visibility, "red");


  //RIGHT - "[Time Updated] {SFSymbol Clock}"
  let right_weather_lastUpdated = right_row.addStack();
  right_weather_lastUpdated.size = new Size(0, 25.5);
  right_weather_lastUpdated.url = "scriptable:///run/Events,%20Weather%20Widget";
  //time
  df.dateFormat = "h:mm a";
  const current_time = df.string(current_date);

  let right_weather_lastUpdated_text = createTextRow("right", right_weather_lastUpdated, `${current_time}  `, "white", Font.lightRoundedSystemFont(11), 1, visibility, "green", .1);
  right_weather_lastUpdated_text.textOpacity = .2;

  let right_weather_lastUpdated_image = createImageRow("none", right_weather_lastUpdated, "alarm", "orange", new Size(12, 12), Font.lightRoundedSystemFont(11), visibility, "blue");
  right_weather_lastUpdated_image.imageOpacity = .2;


  //*********Lower Events Portion********
  //find date next month
  const msInMonth = 2628000000 + 86400000;
  let nextMonthDate = new Date(Date.parse(current_date) + msInMonth);


  //get all events between (current date) and (current date + 30 days)
  let allEvents = await CalendarEvent.between(current_date, nextMonthDate, []);


  //Remove events from "US Holidays", "IGNORE", and "Siri Suggestions"
  for (let x = 0; x < allEvents.length; x++) {
    const calName = allEvents[x].calendar.title;

    if ((calName == "US Holidays") || (calName == "Siri Suggestions") || (calName == "IGNORE")) {
      allEvents.splice(x, 1)[0];
      x--;
    }
  } // end for

  //after 2 events (which is the max), quantify "extra" events today, tomo., within 5 days, and >5 days
  for (let x = 2; x < allEvents.length; x++) {
    const eventStartUnformatted = new Date(allEvents[x].startDate);
    const eventEndUnformatted = new Date(allEvents[x].endDate); //????

    //add # of "external" events into arrays (numEventsOther, numEventsToday, etc)
    daysUntil(eventStartUnformatted, eventEndUnformatted); //originanly didnt have endUnfort
  } //end for


  //console.log(numEventsOther)
  //If there's more than 2 upcoming events then reduce events array to 2 events and add onto external events variable
  let otherEvents = -1; //starts -1 instead of 0 because it's always +1 how many extra events. idk why
  if (allEvents.length > 2) {
    for (let x = allEvents.length; 1 < x; x--) {
      allEvents.splice(x, 1);
      otherEvents++;
    }
  }



  //////****LOWER EVENTS PORTION*****//////

  //LEFT - " Events"
  //show "Events" title if there are more than 0 events
  if (allEvents.length > 0) {

    //" Events"
    let left_events_title = left_row.addStack();
    left_events_title.size = new Size(0, 25); //0,30
    createImageRow("none", left_events_title, "calendar", "yellow", new Size(20, 20), Font.semiboldRoundedSystemFont(17), visibility, "blue");

    createTextRow("none", left_events_title, " Events", "ff9898", Font.semiboldRoundedSystemFont(17), 1, visibility, "red", .7);


    //LEFT - " | [# of events tomorrow] tmrw"
    //LEFT - " | [# of events in 5 days] more"
    //Left - " | [# of events tomorrow]T - [# of events in 5 days]M"
    if (otherEvents > 0) {

      //write " | " only if there's at least 1 event tomorrow or within 5 days
      if (((numEventsFiveDays > 0) || (numEventsTomo > 0))) {
        createTextRow("none", left_events_title, " | ", "ff9898", Font.semiboldRoundedSystemFont(17), 1, visibility, "red", .7); //otherDays
      }

      //if there are events tomorrow then display
      if (numEventsTomo != 0) {

        if (numEventsFiveDays != 0) {
          numEventsTomo = numEventsTomo + "T";
        } else {
          numEventsTomo = numEventsTomo + " tmrw";
        }

        createTextRow("none", left_events_title, `${numEventsTomo}`, tomoColor, Font.semiboldRoundedSystemFont(12), 1, visibility, "red", .7);
      }

      //if there are events in 3 days then display
      if (numEventsFiveDays != 0) {

        //write dash only if there's events tomorrow AND events in 5 days
        if (numEventsTomo != 0) {
          numEventsFiveDays = " - " + numEventsFiveDays + "M";
        } else {
          numEventsFiveDays = numEventsFiveDays + " more";
        }

        createTextRow("none", left_events_title, `${numEventsFiveDays}`, threeDaysColor, Font.semiboldRoundedSystemFont(12), 1, visibility, "red", .7);
      }


    } //end inner if
    left_events_title.centerAlignContent();

  } //end large if


  //Duplicate event name and time stacks for every new event; max 2 events
  for (let x = 0; x < allEvents.length; x++) {
    const eventName = allEvents[x].title;
    const eventStartUnformatted = new Date(allEvents[x].startDate);
    const eventEndUnformatted = new Date(allEvents[x].endDate);
    const eventColor = allEvents[x].calendar.color.hex;

    df.dateFormat = "EEEE d";
    let eventStartFormatted = df.string(eventStartUnformatted);


    //LEFT - "{SFSymbol Ver. Line} [Day [Date #]] (+[number of other events])" //// ex: | Wednesday 29

    //display event day and date only if there's no events on the same day
    //ONLY for events on the same day/date then write day/date once and then stop to avoid repeated days
    const eventsOnSameDay = sameDayCheck(allEvents);

    if (eventsOnSameDay === false) {
      writeStartDay();
    } else if ((eventsOnSameDay === true) && (x === 0)) { //writes only on first loop iteration, skips on second
      writeStartDay();
    }

    //write "[Day [Date #]]"
    function writeStartDay() {
      let left_events_dateTitle = left_row.addStack();
      //left_events_dateTitle.size = new Size(0,50);

      createImageRow("none", left_events_dateTitle, "poweron", "yellow", new Size(10, 16), eventDateTitleFont, visibility, "blue");

      let left_events_dateTitle_text = createTextRow("none", left_events_dateTitle, `${eventStartFormatted}`, "cbcbcb", eventDateTitleFont, 1, visibility, "red");
      left_events_dateTitle_text.shadowRadius = .7;

      //add "+ [num of extra events today]" if there are extra events today
      if (numEventsToday > 0) {
        let left_events_dateTitle_todayCounter = createTextRow("left", left_events_dateTitle, ` +${numEventsToday}`, "ff3000", eventDateTitleFont, 1, visibility, "red");
        left_events_dateTitle_todayCounter.shadowRadius = .7;
      }
    } // end writeStartDay function


    //LEFT - "{SFSymbol Double Chevron} [Event Name]" //// ex: >> Hotdog Event
    let left_events_individualName = left_row.addStack();
    left_events_individualName.size = new Size(0, 40); //y changes depending on line limit
    createImageRow("none", left_events_individualName, "chevron.right.2", eventColor, new Size(10, 16), weatherInfoFont, visibility, "blue");
    createTextRow("left", left_events_individualName, ` ${eventName}`, "white", eventInfoFont, 2, visibility, "blue");

    /////////////////////////////////

    //RIGHT - "- [# days until] -"
    //calling daysUntil now is negliglible because all calendar date work was done before. adding to the counters
    //now does nothing
    const daysUntilResults = daysUntil(eventStartUnformatted, eventEndUnformatted, true);
    const daysUntilEvent = daysUntilResults[0];
    const colorTime = daysUntilResults[1];

    if (eventsOnSameDay === false) {
      writeDaysUntil();
    } else if ((eventsOnSameDay === true) && (x === 0)) {
      writeDaysUntil();
    }

    function writeDaysUntil() {
      let right_events_daysUntil = right_row.addStack();
      right_events_daysUntil.size = new Size(0, 17.5);
      /*
      	
          let right_events_daysUntil_text = createTextRow("right", right_events_daysUntil, `— ${daysUntilEvent} —`,  `${colorTime}`, eventInfoFont, 1, visibility, "blue");
          right_events_daysUntil_text.shadowRadius = .7
      */

      let dcImage = tt();

      //createImageRow(side, stack, sfName, imageColor, imgSize, font, visibility, visColor)
      right_events_daysUntil.addSpacer(null);
      right_events_daysUntil.addImage(dcImage);


    } //end writeDaysUntil function

    function tt() {
      let path = new Path();
      let dc = new DrawContext();
      dc.respectScreenScale = true;
      dc.opaque = false;
      dc.size = new Size(100, 17.5);

      //(x-pos, y-pos, length, height)
      let defaultRect = new Rect(0, 0, 100, 17.5);

      //round the rectangle
      path.addRoundedRect(defaultRect, 10, 10);
      dc.addPath(path);

      //"draw" rectangle
      dc.setFillColor(Color.yellow());
      dc.fillPath();

      //add text into rectanlge
      //dc.setTextColor(checkColor(colorTime));
      dc.setTextColor(Color.black());
      dc.setTextAlignedCenter();
      dc.setFont(Font.regularRoundedSystemFont(14));
      dc.drawText(`— ${daysUntilEvent} —`, new Point(10, 0));


      let testImage = dc.getImage();

      return testImage;

    } //end tt




    //RIGHT - "[Time Event Starts]"
    //skip event start time if event is all day
    if (allEvents[x].isAllDay === false) {
      df.dateFormat = "h:mm a";
      let eventClockStartFormatted = df.string(eventStartUnformatted);

      let right_events_eventStart = right_row.addStack();
      let right_events_eventStart_text = createTextRow("right", right_events_eventStart, `${eventClockStartFormatted}`, "orange", eventInfoFont, 1, visibility, "red");
      right_events_eventStart_text.shadowRadius = 0;
    }

    //RIGHT - "[Event Duration]"
    //get duration of event
    let duration;
    if (allEvents[x].isAllDay === false) {
      duration = findDuration(eventStartUnformatted, eventEndUnformatted, daysUntilEvent);
    } else {
      duration = "all-day";
    }

    let right_events_eventDuration = right_row.addStack();
    let eventDurationSize;
    let test = 1;
    if (duration === "all-day") {
      eventDurationSize = 38 + test;
    } else {
      eventDurationSize = 22 + test;
    }

    right_events_eventDuration.size = new Size(0, eventDurationSize); //22 (one height box), 38 (2 box height)

    //if event is happening now (keyword: "now") then list how LONG IS LEFT, instead of total duration time
    if (daysUntilEvent == "now") {
      duration += " left";
    }

    let right_events_eventDuration_text = createTextRow("right", right_events_eventDuration, `${duration}`, "white", eventInfoFont, 1, visibility, "red");
    right_events_eventDuration_text.shadowRadius = 0;



  } // end for

  return widget;
}// end async


//***********functions***************
//outline stack border in color
function outline(stack, width, color) {
  let outline_color;

  if (color === undefined) {
    outline_color = Color.red();
  } else {
    outline_color = Color[color]();
  }

  stack.borderWidth = width;
  return stack.borderColor = outline_color;
}

//add text to a stack
function createTextRow(side, stack, text, textColor, font, lineLimitInput, visibility, visColor, textOp) {
  if (side == "right") {
    stack.addSpacer(null);
  }

  let stack_text = stack.addText(text);
  stack_text.textColor = checkColor(textColor);
  stack_text.font = font;
  stack_text.shadowRadius = 1;
  stack_text.shadowColor = Color.black();
  stack_text.lineLimit = lineLimitInput;

  if (visibility == true) {
    outline(stack, 1, visColor);
  }

  if (!textOp == undefined) {
    stack_text.textOpacity = textOp;
  }

  if (side == "left") {
    stack.addSpacer(null);
  }

  return stack_text;
} //end createText Row function

//add SFSymbol to stack
function createImageRow(side, stack, sfName, imageColor, imgSize, font, visibility, visColor) {
  if (side == "right") {
    stack.addSpacer(null);
  }

  let stack_image;
  try { //image is an SFSymbol
    stack_image = stack.addImage(getSF(sfName), font);
    stack_image.tintColor = checkColor(imageColor);
    stack_image.imageSize = imgSize;
  } catch { //image is a regular image
    stack_image = sfName;
    stack_image.tintColor = checkColor(imageColor);
    stack_image.imageSize = imgSize;
  }


  if (visibility == true) {
    outline(stack_image, 1, visColor);
  }

  if (side == "left") {
    stack.addSpacer(null);
  }

  return stack_image;
} //end function

//get SFSymbol and convert it to an image
function getSF(symbolName, font) {
  let symbol = SFSymbol.named(symbolName)
  symbol.applyFont(Font.lightRoundedSystemFont(15));
  symbol.applyBoldWeight();


  return symbol.image;
} //end function

//If input color is hex or a regular word then output correct type of color
function checkColor(colorInput) {
  let resultColor;

  try {
    resultColor = Color[colorInput]();
  } catch {
    resultColor = new Color(colorInput);
  }

  return resultColor;
}//end createImageRow function

//format duration into ex: 2h 30m/2 hrs/1 hr
//find duration of an event
function findDuration(start, end, daysUntilEvent) {
  //if the event is currently happening then list how much TIME IS LEFT instead of total event duration
  //formula: event time remaining = total event duration - transpired time
  let transpiredTime; //in MS
  if (daysUntilEvent == "now") {
    transpiredTime = current_date.getTime() - start.getTime();
  } else {
    transpiredTime = 0;
  }

  //find duration in minutes and hours
  let startMS = start.getTime();
  let endMS = end.getTime();
  let durationMin = (((endMS - startMS) - transpiredTime) / 1000 / 60); //in minutes
  let durationHour = (durationMin / 60); //in hours

  durationHour = Math.ceil(durationHour);
  durationMin = Math.ceil(durationMin);

  //less than 60 minutes
  if (durationMin < 60) {
    if (durationMin == 1) {
      return durationMin + " min";

    } else if (durationMin == 0) {
      return "Error: Set Duration";

    } else {
      return durationMin + " mins";
    }

    //greater than 60 minutes
  } else {
    let minutes = durationMin % 60;
    minutes += "m";

    let hours = durationHour.toString();
    const periodLocation = hours.indexOf(".");

    //time ex: 1.5 hours
    //find location of decimal >> seperate >> return hour and minutes
    if (periodLocation > 0) {
      let wholeHours = parseInt(hours.substring(0, periodLocation));
      wholeHours += "h ";

      return (wholeHours + minutes);

      //time ex: 2 hours
      //whole hour
    } else {
      if (durationHour == 1) {
        return durationHour + " hr";
      } else {
        return durationHour + " hrs";
      }
    }

  } //end else
} //end findDuration function

//check if two sequential events are on the same day
//line 278 for event sorting
function sameDayCheck(eventList) {
  for (let x = 0; x < eventList.length; x++) {
    //get first event starting time
    let fEventDate = new Date(eventList[x].startDate); //firstEventDate
    fEventDate = fEventDate.getMonth() + fEventDate.getDate();

    //get second event starting time
    let nEventDate;
    //x+1 inherently has undefined last array position. try/catch to set last undefined to known
    try {
      nEventDate = new Date(eventList[x + 1].startDate); //nextEventDate
      nEventDate = nEventDate.getMonth() + nEventDate.getDate();
    } catch {
      nEventDate = fEventDate;
    }

    //compare first, second event starting times
    if (fEventDate === nEventDate) {
      //return [fEventDate, nEventDate];
      return true;
    } else {
      return false;
    }

  } //end for


}
//end sameDayCheck


//find the # of days until an event based on the current date. record # of days, title color, and update arrays
//for # of "external" events ("E."e. = when >2 events)
function daysUntil(eventStartUnformatted, eventEndUnformatted, repeatTax) {
  const daysInMonthForEvent = new Date(eventStartUnformatted.getFullYear(), eventStartUnformatted.getMonth(), 0).getDate();

  let currentDate = current_date.getDate();
  let eventDate = eventStartUnformatted.getDate();

  //check if eventDate is next month & update
  if (eventDate < currentDate) {
    eventDate = (eventDate + daysInMonthForEvent);

    //if eventDate, currentDate have the same date, check if the dates are in the same month
  } else if (eventDate == currentDate) {

    //check if the event month and current month are the same
    if (eventStartUnformatted.getMonth() === current_date.getMonth()) {

    } else { //event is next month (has same date as the current date)
      eventDate = (eventDate + daysInMonthForEvent);
    }

  }


  let daysUntilEvent = eventDate - currentDate;
  let colorTime;

  //change today/tomorrow/# days and respective color
  if (daysUntilEvent == 0) {
    //event is today; check if event is currently ongoing or upcoming
    if ((eventStartUnformatted.getTime() < current_date.getTime()) && (eventEndUnformatted.getTime() > current_date.getTime())) {
      daysUntilEvent = "now";
    } else {

      //daysUntilEvent = "today";
      daysUntilEvent = `in ${findDuration(current_date, eventStartUnformatted)}`;
      numEventsToday++;
    }

    colorTime = todayColor;

  } else if (daysUntilEvent == 1) {
    daysUntilEvent = "tomorrow";
    colorTime = tomoColor;
    numEventsTomo++;

  } else if (daysUntilEvent < 4) {
    daysUntilEvent += " days";
    colorTime = threeDaysColor;
    numEventsFiveDays++;

  } else {
    daysUntilEvent += " days";
    colorTime = otherColor;
    numEventsOther++;
  }

  //repeatTax subtracts 1 from numEventsToday total
  //because in lower events for loop it gets called twice and falsely increases the count by 1
  if (repeatTax === true) {
    numEventsToday--;
  }

  return [daysUntilEvent, colorTime];

}//end daysUntl function



//****DEBUGING****

//either call API or use hardcoded weather values; "on" = testMode on
function testMode(input, apiLink) {
  //hardcoded weather values
  //get current high, low temperatures
  let current_low = "TE"
  let current_high = "ST"

  //get current temperature, wind speed, and humidity
  let current_temp = "—"
  let current_wind_speed = "—"
  let current_humidity = "—"

  //get current weather description (ex: rainy, cloudy, etc)
  let current_weather_description = "overcast clouds"
  let weatherTypeEmoji = weatherEmoji[current_weather_description];
  let weatherTypeEmojiColor = "white";

  //get next hour temperature SFSymbol and color
  let next_hour_temp_icon = "arrowtriangle.up.fill";
  let next_hour_temp_color = "red";



  if (!(input === "on")) {
    //get current high, low temperatures
    current_low = Math.round(weatherJSON.daily[0].temp.min);
    current_high = Math.round(weatherJSON.daily[0].temp.max);

    //get current temperature, wind speed, and humidity
    current_temp = Math.round(weatherJSON.current.temp);
    current_wind_speed = Math.round(weatherJSON.current.wind_speed);
    current_humidity = Math.round(weatherJSON.current.humidity);

    //get next hour temperature SFSymbol and color
    const nextHour_temp = weatherJSON.hourly[2].temp;

    if (current_temp < nextHour_temp) {
      next_hour_temp_icon = "arrowtriangle.down.fill";
      next_hour_temp_color = "blue";
    } else if (current_temp === nextHour_temp) {
      next_hour_temp_icon = "minus";
      next_hour_temp_color = "98ffcb";
    }

    //get current weather description (ex: rainy, cloudy, etc)
    current_weather_description = (weatherJSON.current.weather[0].main).toLowerCase();

    //if current weather is cloudy then specify type of cloudy
    if (current_weather_description === "clouds") {
      current_weather_description = weatherJSON.current.weather[0].description;
    }

    //find correct day/night weather emoji
    let sunsetTodayMS = weatherJSON.daily[0].sunset * 1000; //in ms; today
    let sunriseTodayMS = weatherJSON.daily[0].sunrise * 1000; //in ms; today
    let sunriseTomoMS = weatherJSON.daily[1].sunrise * 1000; //in ms; tomorrow
    let currentMS = current_date.getTime();

    //check if it's currently nighttime
    if ((currentMS > sunriseTodayMS) && (currentMS < sunsetTodayMS)) {
      //daytime
      //console.log("daytime");
      weatherTypeEmojiColor = "white";
      weatherTypeEmoji = weatherEmoji[current_weather_description];
    } else {
      //nighttime
      //console.log("nighttime");
      weatherTypeEmojiColor = "white";
      current_weather_description = current_weather_description + "N";
      weatherTypeEmoji = weatherEmoji[current_weather_description];
    }
  } //end if

  return [current_low, current_high, current_temp, current_wind_speed, current_humidity, weatherTypeEmoji, next_hour_temp_icon, next_hour_temp_color, weatherTypeEmojiColor];
}//end testMode function

//outputs things
function consoleFor(array) {
  console.error("//");
  array.forEach(element => console.warn(element.title));
  console.error("//");
}