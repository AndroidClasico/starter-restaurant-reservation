const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationsService = require("../reservations/reservations.service");

function bodyHasData(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: "body",
    });
  }
  next();
}

function hasCapacity(req, res, next) {
  const { capacity } = req.body.data;
  if (!capacity) {
    next({ status: 400, message: "capacity" });
  } else {
    next();
  }
}

function isValidCapacity(req, res, next) {
  const { capacity } = req.body.data;
  if (capacity === 0 || !Number.isInteger(capacity)) {
    next({ status: 400, message: "capacity" });
  }
  next();
}

function bodyHasReservationId(req, res, next) {
  const { reservation_id } = req.body.data;
  if (!reservation_id) {
    return next({
      status: 400,
      message: "reservation_id",
    });
  }
  res.locals.reservation_id = reservation_id;
  next();
}

function isValidName(req, res, next) {
  const { table_name } = req.body.data;
  if (!table_name || !table_name.length || table_name.length === 1) {
    return next({ status: 400, message: "table_name" });
  }
  next();
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  if (table) {
    res.locals.table = table;
    next();
  } else {
    next({
      status: 404,
      message: table_id,
    });
  }
}

function isTableLargeEnough(req, res, next) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;

  if (Number(people) > Number(capacity)) {
    return next({
      status: 400,
      message: `The number of people in this party exceeds the capacity of the table`,
    });
  }
  next();
}

// verifying that table is NOT occupied
function isAvailable(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next({
      status: 400,
      message: `The table you selected is currently occupied by another party. Please select a different table.`,
    });
  }
  next();
}

// verifying that table is occupied

async function reservationIdExists(req, res, next) {
  const reservation = await reservationsService.read(res.locals.reservation_id);
  if (!reservation) {
    return next({ status: 404, message: `${res.locals.reservation_id}` });
  } else {
    res.locals.reservation = reservation;
    next();
  }
}

async function create(req, res, next) {
  res.status(201).json({ data: await service.create(req.body.data) });
}

async function list(req, res, next) {
  res.json({ data: await service.list() });
}

async function seat(req, res, next) {
  const data = await service.seat(
    // res.locals.table.table_id,
    res.locals.table,
    res.locals.reservation_id
  );
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    bodyHasData,
    hasCapacity,
    isValidName,
    isValidCapacity,
    asyncErrorBoundary(create),
  ],
  seat: [
    bodyHasData,
    bodyHasReservationId,
    asyncErrorBoundary(reservationIdExists),
    isValidCapacity,
    // isReservationSeated,
    asyncErrorBoundary(tableExists),
    isTableLargeEnough,
    isAvailable,
    asyncErrorBoundary(seat),
  ],
};
