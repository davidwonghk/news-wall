module.exports = function(name, local, messages) {
	return function (req, res){
		if (local) {
			local.query = req.query;
		}
		if (messages) {
			local.messages = {};
			for(var k in messages) {
				local.messages[k] = []
				local.messages[k].push(messages[k]);
			}
		}
		res.render(name, local);
	}
}
