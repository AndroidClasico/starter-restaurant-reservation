import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "./Reservation";
import Table from "./Table";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables().then(setTables);
    return () => abortController.abort();
  }

  const finishHandler = async (table) => {
    const abortController = new AbortController();
    try {
      if (
        window.confirm(
          "Is this table ready to seat new guests? This cannot be undone."
        )
      ) {
        await finishTable(table.table_id, abortController.signal);
        await loadDashboard();
      }
      await loadDashboard();
    } catch (error) {
      if (reservationsError.name === "AbortError") {
        console.log("aborted");
      }
      setReservationsError(error);
    }
    return () => abortController.abort();
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
        <ErrorAlert error={reservationsError} />
        {/* {JSON.stringify(reservations)} */}
        <ReservationList reservations={reservations} />
        <Table tables={tables} finishHandler={finishHandler} />
      </div>
    </main>
  );
}

export default Dashboard;
