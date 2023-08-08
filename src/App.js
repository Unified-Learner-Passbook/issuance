import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

//view
import Home from "./views/Home/Home";
import ULPBFF from "./views/ULPBFF/ULPBFF";
import BulkIssuance from "./views/BulkIssuance/BulkIssuance";
import SchemaCreate from "./views/SchemaCreate/SchemaCreate";
import SchemaList from "./views/SchemaList/SchemaList";
import SchemaDetail from "./views/SchemaDetail/SchemaDetail";
import SchemaTempCreate from "./views/SchemaTempCreate/SchemaTempCreate";
import SchemaTempList from "./views/SchemaTempList/SchemaTempList";
import SchemaTemp from "./views/SchemaTemp/SchemaTemp";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={"/*"} element={<Home />} />
        <Route path={"/ulp-bff"} element={<ULPBFF />} />
        <Route path={"/bulk-issuance"} element={<BulkIssuance />} />
        <Route
          path={"/bulk-issuance/schema/create"}
          element={<SchemaCreate />}
        />
        <Route path={"/bulk-issuance/schema/list"} element={<SchemaList />} />
        <Route
          path={"/bulk-issuance/schema/:schema_id"}
          element={<SchemaDetail />}
        />
        <Route
          path={"/bulk-issuance/schema/:schema_id/template/create"}
          element={<SchemaTempCreate />}
        />
        <Route
          path={"/bulk-issuance/schema/:schema_id/template/list"}
          element={<SchemaTempList />}
        />
        <Route
          path={"/bulk-issuance/schema/:schema_id/template/:schema_temp_id"}
          element={<SchemaTemp />}
        />
      </Routes>
      <br />
      <br />
    </div>
  );
}

export default App;
