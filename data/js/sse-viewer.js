var editor;

self.port.on('list-addon', function (data) {
	var contents = document.getElementById('contents');

	var listing = document.createElement('p');

 	listing.appendChild(document.createTextNode(data.name + ' '));
 	var a = document.createElement('a');
 	a.id = data.id;
 	a.href = '#';
 	a.addEventListener('click', function (e) {
 		self.port.emit('get-ss', {id: this.id});
		e.preventDefault();
	});

 	a.innerHTML = data.id;

 	listing.appendChild(a);

	contents.appendChild(listing);
});

self.port.on('get-json', function(data) {
	document.getElementById('contents').style.display = 'none';
	document.getElementById('editor').style.display = '';

	var container = document.getElementById("json-editor");

	if (!editor) {
		editor = new jsoneditor.JSONEditor(container);
	}

	editor.set(JSON.parse(data.json));

	document.getElementById('save-json').addEventListener('click', function (e) {
 		var json = editor.get();
 
 		// TODO

		e.preventDefault();
	});

	document.getElementById('cancel').addEventListener('click', function (e) {
		document.getElementById('editor').style.display = 'none';
 		document.getElementById('contents').style.display = '';

		e.preventDefault();
	});
});

self.port.on('no-addons', function (data) {
	var contents = document.getElementById('contents');
	contents.innerHTML = 'Looks like you do not have any addons that store data via simple storage';
});