'use strict';

var contabilidadController = require('../controllers/contabilidad.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	
	//cuotas
	app.post('/ingresos/cuotaUser', middleware.ensureAuthenticated, contabilidadController.addCuotaUser);
	app.post('/ingresos/cuotaAll', middleware.ensureAuthenticated, contabilidadController.addCuota);

	//ingresos + (cuota)
	app.get('/ingresos', middleware.ensureAuthenticated, contabilidadController.listIngresos);
	app.post('/ingresos/addIngreso',middleware.ensureAuthenticated, contabilidadController.addIngreso);
	//app.delete('/ingresos/:ingresoId',middleware.ensureAuthenticated, contabilidadController.deleteIngreso);

	//gastos
	app.get('/gastos', middleware.ensureAuthenticated, contabilidadController.listGastos);
	app.post('/gastos/addGasto',middleware.ensureAuthenticated, contabilidadController.addGasto);
	//app.delete('/gastos/:gastoId',middleware.ensureAuthenticated, contabilidadController.deleteGasto);

	//total
	app.get('/total',middleware.ensureAuthenticated, contabilidadController.listTotal);
	app.post('/total',middleware.ensureAuthenticated, contabilidadController.addTotal);

	//iva
	app.post('/cuentaIva',middleware.ensureAuthenticated, contabilidadController.cuentaIva);

	//IngresoId
	app.param('ingresoId', contabilidadController.ingresoByID);
	//gastoId
	app.param('gastoId', contabilidadController.gastoByID);
}