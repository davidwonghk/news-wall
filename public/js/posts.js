jQuery(function($) {

	const ITEM_PER_ROW = 4;

	function loadPosts(timestamp) {
			$.ajax({
				url: '/ajax/posts/' + timestamp,
				dataType: 'json',
				success: function(data) {
					data.forEach(function(item) {
						$('#posts').append(renderBlogItem(item));
					});
				}
			});
	}

	function renderBlogItem(data) {
		image = !(data.imageUrl) ? '' : `<img src="${data.imageUrl}" class="img-responsive">`
		from = !(data.from) ? '' : `
						<div class="post-from">From
								<a href="${data.from.url}">${data.from.text}</a>
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
	 $(window).scroll(function(){
		if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
			loadPosts();
		}
	});

	loadPosts(Date.now());

});
