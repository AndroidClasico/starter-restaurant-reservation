import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import ReservationCreate from "../reservation/ReservationCreate";
import SeatReservations from "../reservation/SeatReservations";
import TableCreate from "../tables/TableCreate";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery"

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {

  const query = useQuery();
  const date = query.get("date")
  
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date || today()} />
      </Route>
      <Route path="/reservations/new">
        <ReservationCreate />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/seat">
        <SeatReservations />
      </Route>
      <Route path="/tables/new">
        <TableCreate />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
