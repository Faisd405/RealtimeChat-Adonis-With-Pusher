import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('from').unsigned().references('id').inTable('users').onDelete('CASCADE')
        .notNullable
      table.integer('to').unsigned().references('id').inTable('users').onDelete('CASCADE')
        .notNullable
      table.text('message')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
