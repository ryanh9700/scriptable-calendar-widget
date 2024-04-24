# Scriptable Widget

iOS widget that displays upcoming events, and weather. 

### How to Use
1. Download "Scriptable" from the App Store
2. Create new script
3. Paste all .js files in this reposistory in own Scriptable files
4. Initalize location (for weather and displayed city) by running getLocation
5. Initalize weather by creating an OpenWeatherMap API key
6.  Set `apiKey` variable with your API Key
7. Initalize wallpaper by holding apps until wiggle, then scroll far right until no apps are on homepage (just wallpaper)
8. Take a screenshot then run getWidgeImage to select photo
9. Add large Scriptable widget to homescreen
10. Long hold and press "Edit 'Scriptable'" and add main widget

### Other Functionality
1. Press city name to automatically run getLocation to update location and weather
2. Clock icon under weather displays last time widget was updated. Tap on this to re-update widget (usually to update weather)

### Known Issues
1. Sometimes multiple events can cause an error with number of upcoming events