jQuery(function($) {

	function loadTags() {
		console.log(getCurrentTag())

		$.ajax({
			url: '/ajax/tags' + getQuery(),
			dataType: 'json',
			success: function(data) {
				data.forEach(function(item) {
					var view = renderTag(item);
					if(view.hasClass('active')) {
						$('#tags-dropdown').parent().prepend(view);
					} else {
						$('#all-tags').append(view);
					}
				});
			}
		});
	}

	function renderTag(data) {
		var li = $('<li>');
		li.append( `<a href="${data.url}">${data.name}</a>` );
		if (data.name == getCurrentTag()) {
			li.addClass('active');
		}
		return li;
	}

	function getCurrentTag() {
		return decodeURIComponent(getQuery().substring(5));
	}


	//------------------- main ---------------------
	loadTags();

});
