import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

//components
import Header from "../../components/Header/Header";

function BulkIssuance() {
  function showBulkIssuance() {
    return (
      <>
        <div className="container_remove">
          <Header isback={false} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">Bulk Issuance API Source</font>
                <hr />
                <br />
              </div>
              <br />
              <div className="col s12 m6 l6">
                <Link to={"/bulk-issuance/schema/create"}>
                  <div className={`div_button center div_button_active`}>
                    Create New Credentials Schema
                  </div>
                </Link>
              </div>
              <div className="col s12 m6 l6">
                <Link to={"/bulk-issuance/schema/list"}>
                  <div className={`div_button center div_button_active`}>
                    Select From Existing Credentials Schema
                  </div>
                </Link>
              </div>
              <div className="col s12 m6 l6">
                <Link to={"/bulk-issuance/issuer/create"}>
                  <div className={`div_button center div_button_active`}>
                    Create New Issuer
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return <React.Fragment>{showBulkIssuance()}</React.Fragment>;
}

export default BulkIssuance;
