self.port.on('list-addon', function (data) {
	var contents = document.getElementById('contents');

	var listing = document.createElement('p');

 	listing.appendChild(document.createTextNode(data.name + ' '));
 	var a = document.createElement('a');
 	a.id = data.id;
 	a.href = '#';

 	a.innerHTML = data.id;

 	listing.appendChild(a);

	contents.appendChild(listing);
});

self.port.on('no-addons', function (data) {
	var contents = document.getElementById('contents');
	contents.innerHTML = 'Looks like you do not have any addons that store data via simple storage';
});