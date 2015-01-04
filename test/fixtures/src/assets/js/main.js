/**
 * @title Client API
 * @name client-api
 */

var container = require('./core/container');

module.exports = container()
	/** Core */
	.set('Model', require('./core/model'))
	.set('Collection', require('./core/collection'))
	.set('Emitter', require('./core/emitter'))

	/** Services */
	.set('RoutesService', require('./routes/service'))

	/** Controllers */
	.set('TabsController', require('./tabs/controller'))

	/** Kickoff */
	.get('AppController')
	.start();
