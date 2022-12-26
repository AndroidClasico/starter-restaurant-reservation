const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

async function list(req, res, _next) {
  const { date } = req.query;
  if (date) {
    return res.json({ data: await reservationsService.listOnDate(date) });
  } else {
    data = await reservationsService.list();
    return res.json({ data });
  }
}

function hasBodyData(req, res, next) {
  const { data } = req.body;
  if (!data)
    next({
      status: 400,
    });
  next();
}

function peopleIsValid(req, res, next) {
  const { people } = req.body.data;
  if (!people || !Number.isInteger(people) || people <= 0) {
    return next({
      status: 400,
      message: `people`,
    });
  }
  next();
}

// Validate the name
function nameIsValid(req, res, next) {
  const { first_name, last_name } = req.body.data;
  const error = { status: 400 };
  if (!first_name || !first_name.length) {
    error.message = `first_name`;
    return next(error);
  }
  if (!last_name || !last_name.length) {
    error.message = `last_name`;
    return next(error);
  }

  next();
}

// Validate mobile
function mobileNumberIsValid(req, res, next) {
  const { mobile_number } = req.body.data;
  if (!mobile_number)
    return next({
      status: 400,
      message: "mobile_number",
    });
  next();
}

// Validate reservation date
function dateIsValid(req, res, next) {
  const { reservation_date } = req.body.data;
  if (!reservation_date || new Date(reservation_date) == "Invalid Date")
    return next({
      status: 400,
      message: "reservation_date",
    });
  next();
}

// Validate reservation time
function timeIsValid(req, res, next) {
  let { reservation_time } = req.body.data;

  const error = {
    status: 400,
    message: "reservation_time",
  };
  if (!reservation_time) return next(error);
  if (reservation_time[2] === ":") {
    reservation_time = reservation_time.replace(":", "");
    reservation_time = reservation_time.substring(0, 4);
  }
  res.locals.hour = reservation_time.substring(0, 2);
  res.locals.mins = reservation_time.substring(2, 4);
  if (Number.isInteger(Number(reservation_time))) {
    next();
  } else {
    next(error);
  }
}

function dateIsNotTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const newDate = new Date(reservation_date);
  const UTCDay = newDate.getUTCDay();

  if (UTCDay === 2) {
    return next({
      status: 400,
      message: `The restaurant is closed on Tuesdays. Please enter a date that is not a Tuesday for your reservation`,
    });
  }
  next();
}

function dateIsNotInFuture(req, res, next) {
  const { reservation_date } = req.body.data;
  const { reservation_time } = req.body.data;
  const resDate = new Date(`${reservation_date} ${reservation_time} UTC`);
  const todaysDateUnformatted = new Date();
  const userTimeZoneOffset = todaysDateUnformatted.getTimezoneOffset() * 60000;
  const todaysDate = new Date(
    todaysDateUnformatted.getTime() - userTimeZoneOffset
  );

  if (resDate - todaysDate > 0) {
    return next();
  }
  next({
    status: 400,
    message: `The reservation_date must be in the future`,
  });
}

function duringOpenHours(req, res, next) {
  const { reservation_time } = req.body.data;
  const hoursString = reservation_time.slice(0, 2);
  const minutesString = reservation_time.slice(3, 5);
  const hour = Number(hoursString);
  const minutes = Number(minutesString);

  if ((hour == 10 && minutes <= 30) || hour < 10) {
    return next({
      status: 400,
      message: `Reservations can only be made between 10:30 AM until 9:30 PM`,
    });
  } else if ((hour == 21 && minutes >= 30) || (hour == 22 && minutes < 30)) {
    return next({
      status: 400,
      message: `Reservations can only be made between 10:30 AM until 9:30 PM`,
    });
  } else if ((hour == 22 && minutes >= 30) || hour > 22) {
    return next({
      status: 400,
      message: `Reservations can only be made between 10:30 AM until 9:30 PM`,
    });
  }
  next();
}

async function create(req, res, next) {
  res
    .status(201)
    .json({ data: await reservationsService.create(req.body.data) })
    .catch(next);
}


async function reservationExists(req, res, next) {
  const { reservation_id } = req.params
  const reservation = await reservationsService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found.`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.reservation });
}

async function update(req, res, _next) {
  const updatedReservation = {...req.body.data,
  reservation_id: updatedReservation.reservation_id}

  const data = await reservationsService.update(updatedReservation);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExists), read],
  create: [
    hasRequiredProperties,
    peopleIsValid,
    hasBodyData,
    nameIsValid,
    mobileNumberIsValid,
    dateIsValid,
    timeIsValid,
    dateIsNotTuesday,
    dateIsNotInFuture,
    duringOpenHours,
    asyncErrorBoundary(create),
  ],
  update: [
    reservationExists,
    hasBodyData,
    nameIsValid,
    mobileNumberIsValid,
    dateIsValid,
    timeIsValid,
    peopleIsValid,
    dateIsNotTuesday,
    dateIsNotInFuture,
    duringOpenHours,
    asyncErrorBoundary(update),
  ],
};