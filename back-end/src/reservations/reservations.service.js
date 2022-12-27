const knex = require("../db/connection");

function list() {
  return knex("reservations").select("*").orderBy("reservation_time").returning("*")
}

function listOnDate(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
    .orderBy("reservation_time");
}


function create(reservation) {
    return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0])
}

function read(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation_id })
    .first();
}

function update(reservation) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation.reservation_id })
    .update(reservation, "*")
    .then((record) => record[0])
    // .then(() => read(reservation.reservation_id));
}

module.exports = {
    list,
    listOnDate,
    create,
    update,
    read,
}