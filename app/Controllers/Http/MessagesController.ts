import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import EventServices from 'App/Services/EventServices'
import MessageValidator from 'App/Validators/MessageValidator'

export default class MessagesController {
  protected eventServices: EventServices

  constructor() {
    this.eventServices = new EventServices()
  }

  public async listMessage({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    try {
      // Remove Duplicates field 'from'
      const listMessage = await Message.query()
        .select('*')
        .max('message')
        .where('to', user.id)
        .groupBy('from')

      return response.status(200).json({
        status: 'success',
        message: 'List Message retrieved successfully',
        data: listMessage,
      })
    } catch (error) {
      return response.status(200).json({
        status: 'error',
        message: error,
        data: '',
      })
    }
  }

  public async showMessage({ response, auth, params }: HttpContextContract) {
    const user = await auth.authenticate()

    const toUserId = params.id
    const checkUser = await User.find(toUserId)

    if (!checkUser) {
      return response
        .status(404)
        .json({ status: 'error', message: 'User is not available', data: '' })
    }

    try {
      const showMessage = await Message.query()
        .where('from', user.id)
        .andWhere('to', toUserId)
        .orWhere('from', toUserId)
        .andWhere('to', user.id)
        .orderBy('created_at', 'desc')

      return response
        .status(201)
        .json({ status: 'success', message: 'Successfully retrieved a message', data: showMessage })
    } catch (error) {
      return response
        .status(422)
        .json({ status: 'error', message: 'User is not available', data: '' })
    }
  }

  public async sendMessage({ response, request, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    await request.validate(MessageValidator)

    const toUserId = request.input('to')
    const message = request.input('message')

    const checkUser = await User.find(toUserId)

    if (!checkUser) {
      return response
        .status(404)
        .json({ status: 'error', message: 'User is not available', data: '' })
    }
    try {
      const storeMessage = await Message.create({
        from: user.id,
        to: toUserId,
        message: message,
      })

      if (storeMessage) {
        this.eventServices.sendMessage(message, user.id, toUserId)
        this.eventServices.sendNotification(user.id, toUserId)
      }

      return response
        .status(201)
        .json({ status: 'success', message: 'Successfully send a message', data: storeMessage })
    } catch (error) {
      return response
        .status(422)
        .json({ status: 'error', message: 'User is not available', data: '' })
    }
  }
}
