'use strict'
const { parseISO, isBefore, subHours } = require('date-fns')
const crypto = require('crypto')

const Mail = use('Mail')
const Env = use('Env')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      const resetPasswordUrl = `${Env.get('FRONT_URL')}/reset?token=${
        user.token
      }`

      await Mail.send(
        ['emails.forgotpassword'],
        { email, token: user.token, link: resetPasswordUrl },
        message => {
          message
            .to(user.email)
            .from('test@test.com', 'Test | wawa')
            .subject('Recuperação de senha')
        }
      )
    } catch (err) {
      return response.status(err.status).send({
        error: { message: 'Algo não deu certo, esse e-mail existe?' }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      if (isBefore(parseISO(user.token_created_at), subHours(new Date(), 2))) {
        return response
          .status(400)
          .json({ error: 'Invalid date range, place try again.' })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (err) {
      return response.status(err.status).send({
        error: { message: 'Algo deu errado ao resetar sua senha!' }
      })
    }
  }
}

module.exports = ForgotPasswordController
