'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('users', 'UserController.store')
Route.post('sessions', 'SessionController.store')

Route.post('reset', 'ForgotPasswordController.store')
Route.put('reset', 'ForgotPasswordController.update')

Route.post('files', 'FileController.store')
Route.get('files/:id', 'FileController.show')
