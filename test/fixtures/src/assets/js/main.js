/**
 * # Client API
 *
 * The client api is exposed in the form of a controller.
 *
 * @title Client API
 * @name client-api
 */

'use strict';

var container = require('./core/container');

module.exports = container()
	/** Core classes. */
	.set('Model', require('./core/model'))
	.set('Collection', require('./core/collection'))
	.set('Emitter', require('./core/emitter'))

	/** Services. */
	.set('RoutesService', require('./routes/service'))

	/** Controllers. */
	.set('TabsController', require('./tabs/controller'))

	/** Kickoff application. */
	.get('AppController')
	.start();
