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

function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
