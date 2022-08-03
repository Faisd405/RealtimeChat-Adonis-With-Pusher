import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('avatar').nullable()
      table
        .integer('role_id')
        .unsigned()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE')
        .notNullable()

      table.string('remember_me_token').nullable()
      table.text('verification_code').nullable()
      table.boolean('is_verified').defaultTo(false)
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
