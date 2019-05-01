'use strict';

const redIcon = new L.Icon({
    iconUrl: './marker-icon-red.png',
    shadowUrl: './marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let mymap;
let marker;
let lastCity;
const citySelect = document.getElementById('citySelect');
const cities = new Map();

window.addEventListener('load', () => {
    ['london', 'paris', 'madrid', 'brussels', 'amsterdam', 'munich', 'zurich', 'roma'].forEach((city) => {
        getCityData(city);
    });
});

citySelect.addEventListener('change', citySelector);

class City {
    constructor(city) {
        this._coord = city.coord;
        this._name = city.name;
        this._updateTime = new Date();
        this._description = city.weather[0].description;
        this._icon = city.weather[0].icon;
        this._wind = `speed ${city.wind.speed}, degrees ${city.wind.deg}\xB0`;
        this._temperature = `${Math.round(city.main.temp)} &#8451`;
        this._humidity = `${city.main.humidity}%`;
    }
    set description(city) { this._description = city.weather[0].description; }
    set icon(city) { this._icon = city.weather[0].icon; }
    set wind(city) { this._wind = `speed ${city.wind.speed}, degrees ${city.wind.deg}\xB0`; }
    set temperature(city) { this._temperature = `${Math.round(city.main.temp)} &#8451`; }
    set humidity(city) { this._humidity = `${city.main.humidity}%`; }
    set updateTime(updateTime) { this._updateTime = updateTime; }
    set marker(marker) { this._marker = marker; }

    get lon() { return this._coord.lon; }
    get lat() { return this._coord.lat; }
    get description() { return this._description; }
    get icon() { return this._icon; }
    get wind() { return this._wind; }
    get temperature() { return this._temperature; }
    get humidity() { return this._humidity; }
    get updateTime() { return this._updateTime; }
    get marker() { return this._marker; }
    get name() { return this._name; }
}

function showWeather(city) {
    document.getElementById('description').innerHTML = city.description;
    document.getElementById('icon').innerHTML = `<img alt="" src="http://openweathermap.org/img/w/${city.icon}.png">`;
    document.getElementById('wind').innerHTML = city.wind;
    document.getElementById('temperature').innerHTML = city.temperature;
    document.getElementById('humidity').innerHTML = city.humidity;
}

function addMap(city) {
    mymap = L.map('mapid');

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYm9henJhbW90IiwiYSI6ImNqdWxpN29xbjExZnczeW5xZG81b3RsYWwifQ.SzkxgoG8ZgMtXFYTuSA1BA'
    }).addTo(mymap);

    marker = L.marker([city.lat, city.lon]).on('click', clickCitySelector).addTo(mymap);

    city.marker = marker;
}

function addLocation(city) {
    marker = L.marker([city.lat, city.lon]).on('click', clickCitySelector).addTo(mymap);
    city.marker = marker;
}

function getCityData(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&APPID=9de0b5dc4332f5818dd67f6cb4cdb06a`)
        .then(res => res.json())
        .then(myJson => {
            cities.set(cityName, new City(myJson));

            if (cities.size === 1) {
                addMap(cities.get(cityName));
            } else {
                addLocation(cities.get(cityName));
            }

            if (cityName === 'london') {
                showWeather(cities.get(cityName));
                showLocation(cities.get(cityName));
            }

        });
}

function showLocation(city) {
    mymap.setView([city.lat, city.lon], 12);
    city.marker = L.marker([city.lat, city.lon], {icon: redIcon}).addTo(mymap);
    lastCity = city;
}

function weatherDataIsObsolete(selectedCity) {
    const lastUpdate = new Date() - cities.get(selectedCity).updateTime;
    return lastUpdate > 3600;
}

function updateWeatherData(selectedCity) {
    const city = cities.get(selectedCity);
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&units=metric&APPID=9de0b5dc4332f5818dd67f6cb4cdb06a`)
        .then(res => res.json())
        .then(myJson => {
            city.description = myJson;
            city.icon = myJson;
            city.wind = myJson;
            city.temperature = myJson;
            city.humidity = myJson;
            city.updateTime = new Date();
        });

}

function previousCity() {
    lastCity.marker = L.marker([lastCity.lat, lastCity.lon]).on('click', clickCitySelector).addTo(mymap);
}

function clickCitySelector() {
    const latLng = this.getLatLng();
    let name;

    cities.forEach(city => {
        if (city.lon === latLng.lng && city.lat === latLng.lat) {
            name = city.name;
        }
    });

    const cityArray = [...citySelect.options];
    cityArray.forEach(city => {
        if (city.text === name) {
            city.selected = true;
        }
    });

    citySelector();
}

function citySelector() {
    const selectedCity = citySelect.options[citySelect.selectedIndex].value;
    if (weatherDataIsObsolete(selectedCity)) {
        updateWeatherData(selectedCity);
    }
    showWeather(cities.get(selectedCity));
    previousCity();
    showLocation(cities.get(selectedCity));
}
