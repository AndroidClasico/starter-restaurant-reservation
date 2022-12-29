exports.up = function (knex) {
  return knex.schema.createTable("reservations", (table) => {
    table.increments("reservation_id").primary();
    table.string("first_name").notNullable();
    table.string("last_name", null).notNullable();
    table.string("mobile_number", null).notNullable();
    table.date("reservation_date").notNullable();
    table.time("reservation_time").notNullable();
    table.integer("people", null).unsigned().notNullable();
    table.timestamps(true, true);
  });
};
//is there a reservation id in the tables table for validation

exports.down = function (knex) {
  return knex.schema.dropTable("reservations");
};

// exports.up = function (knex) {
//   return knex.schema.createTable("reservations", (table) => {
//     table.increments("reservation_id").primary();
//     table.string("first_name").notNullable();
//     table.string("last_name").notNullable();
//     table.string("mobile_number").notNullable();
//     table.date("date_of_reservation").notNullable();
//     table.time("time_of_reservation").notNullable();
//     table.integer("people").unsigned().notNullable();
//     table.timestamps(true, true);
//   });
// };

// exports.down = function (knex) {
//   return knex.schema.dropTable("reservations");
// };
