import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import gov_logo from "../../assets/images/gov_logo.png";

function Header(props) {
  let navigate = useNavigate();
  const { isback } = props;
  function showHeader() {
    return (
      <>
        <div className="container row">
          <div className="col s12 m12 l12">
            <center>
              <br />
              <Link to={"/home"}>
                <img src={gov_logo} className="logo_gov" />
              </Link>
              <br />
              {/*<img src={home_image} className="logo_home" />*/}
            </center>
          </div>
          {isback ? (
            <>
              <div className="col s2 back_arrow_div">
                <font
                  class="material-icons back_arrow"
                  onClick={() => navigate(-1)}
                >
                  arrow_back
                </font>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  }
  return <React.Fragment>{showHeader()}</React.Fragment>;
}

export default Header;
