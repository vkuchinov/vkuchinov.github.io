//GLOBAL VARIABLES

var width = window.innerWidth;
var height = window.innerHeight;

var scene;
var currentFrame = 0;

var mode = 0; //by default automous

var system, tags, particles, HUD, next;
var nodes = [];

var palette = {
    pink: "#F59DAE",
    red: "#D43D31",
    brown: "#815A3D",
    green: "#92CA70",
    orange: "#F19436",
    purple: "#925E8E",
    teal: "#6AC5B3",
    blue: "#397BA3",
    yellow: "#ECBE42",
    lime: "#E4FC3F", 
    black: "#241F1F"
};


var bleachingA = {
    pink: "#D7C3DA",
    red : "#C46A8C",
    brown : "#897398",
    green : "#C8CEE7",
    orange : "#D3B6D0",
    purple : "#8C83AE",
    teal : "#9ED1EE",
    blue : "#6294C6",
    yellow : "#E1D1E1",
    lime : "#EFF5CA",
    black : "#362F4A", 
};

var bleachingB = {
    pink: "#F8E6E9",
    red : "#EBCBC9",
    brown : "#D6CEC8 ",
    green : "#DFEBD8 ",
    orange : "#F3DFCB ",
    purple : "#DCD1DC ",
    teal : "#D6EAE6 ",
    blue : "#C8D6DF",
    yellow : "#F2E8CE",
    lime : "#EFF5CA",
    black : "#362F4A", 
};

var colors = Object.values(palette).slice(0, Object.values(palette).length - 1);
var foam = Object.values(bleachingB).slice(0, Object.values(bleachingB).length - 1);

var categories = [
    
    //there are 10 categories as well as there are 10 colors, so I could suggest
    //that I should keep the same order Inclusivity<>pink ... Personal<>black
    
    {"id": 1, "en": "Inclusivity & Accessibility", "fr": "Inclusivité et accessibilite"},
    {"id": 3, "en": "Cultural & Historical Conservation", "fr": "Conservation culturelle et historique"},
    {"id": 5, "en": "Environmental Sustainability", "fr": "Viabilité de l’environnement"},
    {"id": 7, "en": "Human Rights", "fr": "Droits humains"},
    {"id": 9, "en": "Physical & Mental Health", "fr": "Santé physique et mentale"},
    {"id": 11, "en": "LGBTQ2A Rights", "fr": "Droits LGBTQ2A"},
    {"id": 13, "en": "Political Representation", "fr": "Représentation politique"},
    {"id": 15, "en": "New Canadian & Immigration Integration", "fr": "Intégration canadienne et immigration"},
    {"id": 17, "en": "Indigenous Rights", "fr": "Droits autochtones"},
    {"id": 19, "en": "Personal & Community Development", "fr": "Développement de soi et de la communauté"}
    
];


var dataset;