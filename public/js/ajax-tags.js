jQuery(function($) {

	function loadTags() {
		$.ajax({
			url: '/ajax/categories' + getQuery(),
			dataType: 'json',
			success: function(data) {
				data.forEach(function(item) {
					$('#tag-bar').append(renderTag(item));
				});
			}
		});
}

	function renderTag(data) {
		var li = $('<li>');
		if (data.active) {
			li.addClass('active')
		}
		li.append( `<a href="${data.url}">${data.name}</a>` );
		return li;
	}


	//------------------- main ---------------------
	loadTags();

});
