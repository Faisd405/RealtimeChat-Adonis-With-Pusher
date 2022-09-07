import Pusher from 'pusher'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'

export default class EventServices {
  protected pusherApi: Pusher

  constructor() {
    this.pusherApi = new Pusher({
      appId: Env.get('PUSHER_APP_ID'),
      key: Env.get('PUSHER_APP_KEY'),
      secret: Env.get('PUSHER_APP_SECRET'),
      cluster: Env.get('PUSHER_APP_CLUSTER'),
      useTLS: true,
    })
  }

  protected pusherTrigger(channel: string, event: string, message: string) {
    const pusher = this.pusherApi

    pusher.trigger(channel, event, {
      message: message,
    })
  }

  public sendMessage(message: string, from: number, to: number) {
    return this.pusherTrigger('message-' + from + '-' + to, 'send-message', message)
  }

  public async sendNotification(from: number, to: number) {
    const fromUser = await User.query().where('id', from).first()

    return this.pusherTrigger(
      'bloom-notification-' + to,
      'send-notification',
      fromUser?.name + 'Send You a Message'
    )
  }
}
