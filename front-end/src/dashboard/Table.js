import React from "react";

function Table({ tables = [] }) {

  const rows = tables.length ? (
    tables.map((table) => {
      return (
        <div className="form-group row" key={table.table_id}>
          <div className="col-sm-2">{table.table_name}</div>
          <div className="col-sm-2">{table.capacity}</div>
          <div className="col-sm-1" data-table-id-status={table.table_id}>{table.reservation_id ? "Occupied" : "Free"}</div>
          <div className="col-sm-1">
          </div>
        </div>
      );
    })
    ) : (
    <div>No results</div>
  );
  return (
      <div className="table">
      {rows}
      </div>
  )
}

export default Table;