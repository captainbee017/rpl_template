notifyPanel = function(message, type){
	alert("im here");
	$("#myModal").modal('show');
	// var opts = {
	//     type: type || 'info',
	//     placement: {from: "top", align: "center"}
	// };
	// $.notify({message: message}, opts);
}

{% for message in messages %}
    notifyPanel('{{ message }}', '{{ message.tags }}')
{% endfor %}

// flashNotify('hello', 'success');