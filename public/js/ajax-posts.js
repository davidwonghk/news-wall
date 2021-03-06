	jQuery(function($) {

	const ITEM_PER_ROW = 4;

	function loadPosts(state) {
		var timestamp = state.timestamp;
		if (!timestamp) timestamp = '';

		$.ajax({
			url: '/ajax/posts/' + timestamp + getQuery(),
			dataType: 'json',
			success: function(data) {
				state.timestamp = data.last;
				data.posts.forEach(function(item) {
					$('#posts').append(renderBlogItem(item));
				});
			}
		});
	}

	function renderBlogItem(data) {
		image = !(data.imageUrl) ? '' : `<img src="${data.imageUrl}" class="img-responsive">`
		from = !(data.from) ? '' : `
						<div class="post-from">
								<span class="author">${data.from.author}</span> 分享於 <a href="${data.from.url}">${data.from.site}</a> 
						</div>
		`;

		col = 12/ITEM_PER_ROW

		return 	`
					<div class="col-md-${col} post-item" id="">
						<a href="${data.postUrl}">
								${image}
								<span class="title">${data.title}</span>
						</a>
						${from}

						<hr>
					</div>
					`;
	}


	//------------------- main ---------------------
	var state = {"timestamp": Date.now()};

	 $(window).scroll(function(){
		if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
			loadPosts(state);
		}
	});

	loadPosts(state);

});
