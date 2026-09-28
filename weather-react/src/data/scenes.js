// Sample scenes: major famous cities per kind of weather, frozen at a moment where that weather is happening.
import dubai from '../assets/photos/dubai.jpg';
import miami from '../assets/photos/miami.jpg';
import bangkok from '../assets/photos/bangkok.jpg';
import london from '../assets/photos/london.jpg';
import singapore from '../assets/photos/singapore.jpg';
import ushuaia from '../assets/photos/ushuaia.jpg';
import mcmurdo from '../assets/photos/mcmurdo.jpg';
import montreal from '../assets/photos/montreal.jpg';
import melbourne from '../assets/photos/melbourne.jpg';

import tokyo from '../assets/photos/tokyo.jpg';
import paris from '../assets/photos/paris.jpg';
import newyork from '../assets/photos/newyork.jpg';
import sydney from '../assets/photos/sydney.jpg';
import rio from '../assets/photos/rio.jpg';
import rome from '../assets/photos/rome.jpg';
import cairo from '../assets/photos/cairo.jpg';
import mumbai from '../assets/photos/mumbai.jpg';

const credit = (who, lic, url) => ({ who, lic, url });

export const SCENES = [
  { kind: 'sunny', name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai', off: 14400, abbr: 'GST',
    time: '12:05', temp: 38, feels: 41, hi: 40, lo: 30, wind: 12, hum: 38, pop: 0, code: 0, rise: '06:12', set: '18:08',
    trend: [38, 39, 40, 38, 36, 33], photo: dubai, pos: '100% 60%',
    credit: credit('Phil6007', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Sunset_of_Dubai_Jumeirah_beach.jpg') },

  { kind: 'clear', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo', off: 32400, abbr: 'JST',
    time: '21:15', temp: 19, feels: 18, hi: 22, lo: 15, wind: 10, hum: 62, pop: 5, code: 0, rise: '05:32', set: '17:42',
    trend: [19, 18, 17, 16, 17, 18], photo: tokyo, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'spring', name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris', off: 7200, abbr: 'CEST',
    time: '14:30', temp: 21, feels: 20, hi: 23, lo: 14, wind: 14, hum: 52, pop: 15, code: 1, rise: '06:45', set: '19:50',
    trend: [21, 22, 23, 21, 19, 17], photo: paris, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'cloudy', name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, tz: 'America/New_York', off: -14400, abbr: 'EDT',
    time: '11:20', temp: 22, feels: 21, hi: 24, lo: 17, wind: 15, hum: 65, pop: 30, code: 2, rise: '06:48', set: '18:55',
    trend: [22, 23, 24, 23, 21, 19], photo: newyork, pos: '50% 40%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'sunny', name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', off: 36000, abbr: 'AEST',
    time: '15:10', temp: 24, feels: 24, hi: 26, lo: 16, wind: 18, hum: 55, pop: 5, code: 0, rise: '06:10', set: '17:50',
    trend: [24, 25, 26, 24, 22, 20], photo: sydney, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'sunny', name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, tz: 'America/Sao_Paulo', off: -10800, abbr: 'BRT',
    time: '13:00', temp: 31, feels: 34, hi: 33, lo: 23, wind: 14, hum: 68, pop: 10, code: 0, rise: '06:02', set: '17:58',
    trend: [31, 32, 33, 31, 28, 26], photo: rio, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'clear', name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, tz: 'Europe/Rome', off: 7200, abbr: 'CEST',
    time: '16:40', temp: 25, feels: 25, hi: 27, lo: 18, wind: 11, hum: 48, pop: 0, code: 0, rise: '06:55', set: '19:25',
    trend: [25, 26, 27, 24, 22, 20], photo: rome, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'sunny', name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo', off: 10800, abbr: 'EEST',
    time: '14:00', temp: 36, feels: 37, hi: 38, lo: 25, wind: 16, hum: 30, pop: 0, code: 0, rise: '05:40', set: '18:15',
    trend: [36, 37, 38, 36, 33, 30], photo: cairo, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'rain', name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata', off: 19800, abbr: 'IST',
    time: '17:30', temp: 29, feels: 34, hi: 31, lo: 26, wind: 20, hum: 84, pop: 75, code: 61, rise: '06:25', set: '18:40',
    trend: [29, 29, 30, 29, 28, 27], photo: mumbai, pos: '50% 50%',
    credit: credit('Unsplash', 'Unsplash License', 'https://unsplash.com') },

  { kind: 'clear', name: 'Miami', country: 'United States', lat: 25.7617, lon: -80.1918, tz: 'America/New_York', off: -14400, abbr: 'EDT',
    time: '23:40', temp: 26, feels: 29, hi: 31, lo: 25, wind: 9, hum: 78, pop: 5, code: 0, rise: '07:13', set: '19:14',
    trend: [26, 26, 25, 25, 27, 29], photo: miami, pos: '50% 50%',
    credit: credit('Wilfredor', 'CC0', 'https://commons.wikimedia.org/wiki/File:Miami,_Florida_skyline.jpg') },

  { kind: 'cloudy', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok', off: 25200, abbr: 'ICT',
    time: '15:20', temp: 31, feels: 36, hi: 33, lo: 26, wind: 11, hum: 70, pop: 20, code: 3, rise: '06:07', set: '18:08',
    trend: [31, 32, 33, 31, 29, 28], photo: bangkok, pos: '50% 40%',
    credit: credit('Diliff', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Bangkok_skytrain_sunset.jpg') },

  { kind: 'rain', name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', off: 3600, abbr: 'BST',
    time: '09:30', temp: 14, feels: 12, hi: 16, lo: 10, wind: 19, hum: 86, pop: 80, code: 63, rise: '06:58', set: '18:47',
    trend: [14, 15, 16, 15, 13, 11], photo: london, pos: '60% 45%',
    credit: credit('Dietmar Rabich', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:London_(UK),_Westminster,_Elizabeth_Tower_--_2010_--_6.jpg') },

  { kind: 'storm', name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore', off: 28800, abbr: 'SGT',
    time: '16:10', temp: 27, feels: 31, hi: 31, lo: 25, wind: 24, hum: 90, pop: 95, code: 95, rise: '07:00', set: '19:04',
    trend: [27, 27, 26, 25, 24, 25], photo: singapore, pos: '55% 50%',
    credit: credit('Benh LIEU SONG', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Singapore_Marina_Bay_Dusk_2018-02-27.jpg') },

  { kind: 'snow', name: 'Ushuaia', country: 'Argentina', lat: -54.8019, lon: -68.3030, tz: 'America/Argentina/Ushuaia', off: -10800, abbr: 'ART',
    time: '13:15', temp: 1, feels: -4, hi: 3, lo: -2, wind: 26, hum: 88, pop: 70, code: 73, rise: '07:38', set: '20:02',
    trend: [1, 2, 3, 1, -1, -2], photo: ushuaia, pos: '50% 45%',
    credit: credit('benito roveran', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:Ushuaia_from_the_bay.jpg') },

  { kind: 'winter', name: 'McMurdo Station', country: 'Antarctica', lat: -77.8460, lon: 166.6760, tz: 'Antarctica/McMurdo', off: 46800, abbr: 'NZDT',
    time: '11:30', temp: -26, feels: -38, hi: -22, lo: -31, wind: 28, hum: 60, pop: 5, code: 1, rise: '06:40', set: '20:10',
    label: 'Bitter cold, clear sky', trend: [-26, -24, -22, -25, -28, -30], photo: mcmurdo, pos: '50% 50%',
    credit: credit('owamux', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:McMurdo_Station_From_The_Foot_Of_Observation_Hill.jpg') },

  { kind: 'autumn', name: 'Montréal', country: 'Canada', lat: 45.5017, lon: -73.5673, tz: 'America/Toronto', off: -14400, abbr: 'EDT',
    time: '16:45', temp: 12, feels: 10, hi: 15, lo: 6, wind: 17, hum: 66, pop: 10, code: 2, rise: '06:48', set: '18:41',
    label: 'Crisp and breezy', trend: [12, 13, 15, 14, 10, 8], photo: montreal, pos: '50% 40%',
    credit: credit('Jiaqian AirplaneFan', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:View_of_downtown_Montreal_and_Mount_Royal-panoramio.jpg') },

  { kind: 'spring', name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne', off: 36000, abbr: 'AEST',
    time: '10:20', temp: 18, feels: 17, hi: 20, lo: 10, wind: 15, hum: 58, pop: 20, code: 1, rise: '06:13', set: '18:32',
    label: 'Mild and bright', trend: [18, 19, 20, 18, 14, 12], photo: melbourne, pos: '50% 50%',
    credit: credit('Donaldytong', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Melbourne_Yarra_River.jpg') },
];

// Order used by the arrow keys
export const KIND_ORDER = ['sunny', 'clear', 'cloudy', 'rain', 'storm', 'snow', 'winter', 'autumn', 'spring'];
