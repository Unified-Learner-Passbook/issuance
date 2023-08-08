import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

//components
import Header from "../../components/Header/Header";

function Home() {
  function showHome() {
    return (
      <>
        <div className="container_remove">
          <Header isback={false} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">Choose API Source</font>
                <hr />
                <br />
              </div>
              <br />
              <div className="col s12 m6 l6">
                <Link to={"/ulp-bff"}>
                  <div className={`div_button center div_button_active`}>
                    ULP BFF
                  </div>
                </Link>
              </div>
              <div className="col s12 m6 l6">
                <Link to={"/bulk-issuance"}>
                  <div className={`div_button center div_button_active`}>
                    Bulk Issuance
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return <React.Fragment>{showHome()}</React.Fragment>;
}

export default Home;
