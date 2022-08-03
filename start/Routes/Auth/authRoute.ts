import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register').as('auth.register')
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.get('/user', 'AuthController.user').as('auth.user')
  Route.get('/verify/:verificationCode', 'AuthController.verify').as('auth.verify')
  Route.post('/resendverification', 'AuthController.resendVerification').as(
    'auth.resendVerification'
  )
}).prefix('/api/auth')
