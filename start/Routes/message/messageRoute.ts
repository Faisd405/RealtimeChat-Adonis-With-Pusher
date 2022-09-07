import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'MessagesController.listMessage').as('message.listMessage')
  Route.post('/send-message', 'MessagesController.sendMessage').as('message.sendMessage')
  Route.get('/:id/show-message', 'MessagesController.showMessage').as('message.showMessage')
}).prefix('/api/message')
