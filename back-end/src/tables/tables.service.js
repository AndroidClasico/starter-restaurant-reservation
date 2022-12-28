const knex = require("../db/connection");
const tableName = "tables";

function list() {
  return knex(tableName).orderBy("table_name", "asc");
}

function create(table) {
  return knex(tableName)
    .insert(table, "*")
    .then((createdRecords) => createdRecords[0]);
}

function read(table_id) {
  return knex(tableName).where({ table_id: table_id }).first();
}

//i need to add 'status' column to the reservations table

function seat(table){
  return knex(tableName)
  .update(table, "*")
  .where({ table_id: table.table_id });
}


module.exports = {
  list,
  create,
  read,
  seat,
};
