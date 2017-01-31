function getQuery() {
  const url = window.location.href
  var query = url.substring();
  var i = url.indexOf('?');
  return i==-1 ? '' : url.substring(i);
}

function isSharedOnFacebook(link, imageUrl, description) {
  FB.ui(
    {
      method        : 'feed',
      display       : 'iframe',
      name          : 'news wall',
      link          : link,
      picture       : imageUrl,
      description   : description,
    },
    function(response) {
      if (response && response.post_id) {

        // HERE YOU CAN DO WHAT YOU NEED
        console.log('shared')

      } else {
        //alert('Post was not published.');
        console.log('not shared')
      }
    }
  );
}
