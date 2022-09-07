import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import Database from '@ioc:Adonis/Lucid/Database'
import { schema } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'

import User from 'App/Models/User'
import UserValidator from 'App/Validators/UserValidator'
// import Role from 'App/Models/Role'
import Env from '@ioc:Adonis/Core/Env'

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    try {
      await request.validate(UserValidator)

      // const verificationCode: string =
      //   Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const user = await User.create({
        name: request.input('name'),
        email: request.input('email'),
        password: request.input('password'),
        role_id: 2,
        // verification_code: verificationCode,
        isVerified: true,
      })

      // const completeUrl = request.completeUrl()
      // const url = completeUrl.split('/')
      // const protocol = url[0]
      // const domain = url[2]

      // await Mail.send((message) => {
      //   message
      //     .from(Env.get('MAIL_FROM_ADDRESS'))
      //     .to(user.email)
      //     .subject('Verify your email')
      //     .htmlView('email/verification', {
      //       verificationCode: verificationCode,
      //       domain: domain,
      //       protocol: protocol,
      //     })
      // })

      response.created({
        message: 'Register Successfully',
        data: {
          name: user.name,
          email: user.email,
          is_verified: user.isVerified,
        },
      })
    } catch (error) {
      return response.status(422).json({ errors: error })
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string({ trim: true }),
      password: schema.string({ trim: true }),
    })
    try {
      await request.validate({ schema: userSchema })
      const { email, password } = request.all()

      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '720mins',
      })

      return response.json({
        message: 'Login Successfully',
        data: token,
      })
    } catch (error) {
      return response.status(422).json({ errors: error.messages })
    }
  }

  public async user({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    return response.json({
      message: 'Get User Successfully',
      data: user,
    })
  }

  public async verify({ response, params }: HttpContextContract) {
    const { verificationCode } = params
    const user = await User.findBy('verification_code', verificationCode)
    if (!user) {
      return response.status(422).json({ errors: ['Invalid verification code'] })
    }
    user.isVerified = true
    user.verification_code = ''
    await user.save()
    return response.json({
      message: 'Verification Successfully',
      data: user,
    })
  }

  public async resendVerification({ request, response }: HttpContextContract) {
    let email = request.input('email')

    try {
      const user = await User.findBy('email', email)

      if (!user) {
        return response.status(422).json({ errors: ['Invalid email'] })
      }

      if (user.isVerified) {
        return response.status(422).json({ errors: ['Email already verified'] })
      }

      const verificationCode: string =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      user.verification_code = verificationCode
      await user.save()

      const completeUrl = request.completeUrl()
      const url = completeUrl.split('/')
      const protocol = url[0]
      const domain = url[2]

      await Mail.send((message) => {
        message
          .from(Env.get('MAIL_FROM_ADDRESS'))
          .to(user.email)
          .subject('Verify your email')
          .htmlView('email/verification', {
            verificationCode: verificationCode,
            domain: domain,
            protocol: protocol,
          })
      })

      return response.ok({ message: 'Verification code sent successfully' })
    } catch (error) {
      return response.status(422).json({ errors: error })
    }
  }
}
