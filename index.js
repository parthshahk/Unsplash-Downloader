require('es6-promise').polyfill();
require('isomorphic-fetch');
const Unsplash = require('unsplash-js').default;
const fs = require('fs');
const request = require('request');
const path = require('path');
const keys = require('./keys');

/*
	keys.js Format:

const keys = {
    applicationId: "",
    secret: ""
}
module.exports = keys;

*/

const unsplash = new Unsplash({
  	applicationId: keys.applicationId,
  	secret: keys.secret
});

var collection = 3516782;
var totalPhotos;
unsplash.collections.getCollection(collection)
  	.then(response=>{
		return response.json();
	  })
  	.then(json => {
		totalPhotos = json.total_photos
		fetchPhotos(json.total_photos)
	});

var photos = [];
function fetchPhotos(total){

	for(var i=0; i<Math.ceil(total/10); i++){

		unsplash.collections.getCollectionPhotos(collection, i)
		.then(response=>{
			return response.json();
		  })
		  .then(json => {
			json.forEach(el => {
				photos.push(el.urls.thumb);			// raw || full || regular || small || thumb
			});
			if(photos.length == totalPhotos){
				startDownloading();
			}
		});

	}
}

var index = 0;
function startDownloading(){
	console.log("Total Photos: " + totalPhotos);
	downloadPhoto(index);
}

function startNext(){
	setTimeout(()=>downloadPhoto(++index), 10);
	return;
}

function downloadPhoto(index){
	console.log("Starting: " + index);
	download(photos[index], index + ".jpg", function(){
		console.log("Complete: " + index);
		startNext();
	});	
}

function download(uri, filename, callback){
	request.head(uri, function(err, res, body){
	  	request(uri).pipe(fs.createWriteStream(path.join(__dirname, "downloads", filename))).on('close', callback);
	});
};