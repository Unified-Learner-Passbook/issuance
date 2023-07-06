import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import gov_logo from "./images/gov_logo.png";
import home_image from "./images/home_image.png";
import DatePicker from "react-datepicker";
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";

function App() {
  const [response, set_response] = useState([]);
  const [response_data, set_response_data] = useState([]);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");

  const [issuanceDate, set_issuanceDate] = useState(new Date());
  const [expirationDate, set_expirationDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 6))
  );

  const [issuanceDate_txt, set_issuanceDate_txt] = useState(null);
  const [expirationDate_txt, set_expirationDate_txt] = useState(null);
  const [password, set_password] = useState("");

  const [client_id, set_client_id] = useState("BPIB61138");
  const [client_secret, set_client_secret] = useState(
    "2c0310fc89417ecc52bbb812b664d06d"
  );
  const [bff_url, set_bff_url] = useState(
    "https://dev-ulp.uniteframework.io/ulp-bff/"
  );
  const [issuer_did, set_issuer_did] = useState(
    "did:ulp:8fa91809-a8e7-402c-aca6-0541ae36415f"
  );
  const [credential_type, set_credential_type] = useState("Enrollment");
  const [data_type, set_data_type] = useState("Dummy Data");

  //"2023-12-06T11:56:27.259Z"
  useEffect(() => {
    if (issuanceDate != null) {
      let isoDate = moment(issuanceDate).toISOString();
      set_issuanceDate_txt(isoDate);
    }
  }, [issuanceDate]);
  useEffect(() => {
    if (expirationDate != null) {
      let isoDate = moment(expirationDate).toISOString();
      set_expirationDate_txt(isoDate);
    }
  }, [expirationDate]);

  useEffect(() => {
    if (response_data.length != 0) {
      issueCred(response_data);
    }
  }, [response_data]);

  const get_mock_data = async () => {
    if (password === "ULP@2023") {
      set_response_data([]);
      set_button_status(false);
      set_process_status(`Getting ${credential_type} Data...`);
      var data = JSON.stringify({
        clientId: client_id,
        clientSecret: client_secret,
      });

      var config = {
        method: "post",
        url: bff_url + "v1/client/bulk/getdata/proofOf" + credential_type,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      let response_api = [];
      await axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          response_api = response.data.result;
        })
        .catch(function (error) {
          console.log(error);
          response_api = error;
        });
      set_response_data(response_api);
    } else {
      alert("You Entered Wrong Password");
    }
  };
  const issueCred = async (data) => {
    set_process_status(`Issuing ${credential_type} Credentials...`);
    set_button_status(false);
    set_response([]);
    let credentialSubject = [];
    //alert(data.length);
    for (let i = 0; i < 25; i++) {
      credentialSubject.push(data[i]);
    }
    var data = JSON.stringify({
      clientId: client_id,
      clientSecret: client_secret,
      issuerDetail: {
        did: issuer_did,
        udise: "09580413502",
        schoolName: "CENTRAL PUBLIC ACEDEMY",
      },
      vcData: {
        issuanceDate: issuanceDate_txt,
        expirationDate: expirationDate_txt,
      },
      credentialSubject: credentialSubject,
    });
    var config = {
      method: "post",
      url: bff_url + "v1/client/bulk/uploadv2/proofOf" + credential_type,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    let response_api = [];
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        response_api = response.data;
      })
      .catch(function (error) {
        console.log(error);
        response_api = { error: error };
      });
    set_response(response_api);
    set_process_status(`Issued ${credential_type} Credentials.`);
    set_button_status(true);
  };

  return (
    <div className="App">
      <div className="container_remove">
        <div className="row">
          <div className="col s12 m12 l12">
            <center>
              <br />
              <img src={gov_logo} className="logo_gov" />
              <br />
              <font className="logo_text">Credentials Issue Example</font>
              <br />
              <img src={home_image} className="logo_home" />
            </center>
          </div>
        </div>
        <div className="container">
          <div className="row">
            {button_status ? (
              <>
                <div className="col s12 m12 l12 center">
                  <font className="date_input_text">Credential Type</font>
                </div>
                <div className="col s6 m4 l4">
                  <div
                    className={`div_button center ${
                      credential_type === "Enrollment"
                        ? "div_button_active"
                        : ""
                    }`}
                    onClick={() => set_credential_type("Enrollment")}
                  >
                    Enrollment
                  </div>
                </div>
                <div className="col s6 m4 l4">
                  <div
                    className={`div_button center ${
                      credential_type === "Assessment"
                        ? "div_button_active"
                        : ""
                    }`}
                    onClick={() => set_credential_type("Assessment")}
                  >
                    Assessment
                  </div>
                </div>
                <div className="col s6 m4 l4">
                  <div
                    className={`div_button center ${
                      credential_type === "Benifits" ? "div_button_active" : ""
                    }`}
                    onClick={() => set_credential_type("Benifits")}
                  >
                    Benifits
                  </div>
                </div>
                <div className="col s12 m12 l12 center">
                  <font className="date_input_text">Data Source</font>
                </div>
                <div className="col s6 m6 l6">
                  <div
                    className={`div_button center ${
                      data_type === "Dummy Data" ? "div_button_active" : ""
                    }`}
                    onClick={() => set_data_type("Dummy Data")}
                  >
                    Dummy Data
                  </div>
                </div>
                <div className="col s6 m6 l6">
                  <div
                    className={`div_button center ${
                      data_type === "CSV Data" ? "div_button_active" : ""
                    }`}
                    onClick={() => set_data_type("CSV Data")}
                  >
                    CSV Data
                  </div>
                </div>
                <div className="col s12 m4 l4 center">
                  <font className="date_input_text">Issuance Date</font>
                  <br />
                  <DatePicker
                    selected={issuanceDate}
                    onChange={(date) => set_issuanceDate(date)}
                    className="date_input"
                    dateFormat="dd-MMM-yyyy"
                  />
                </div>
                <div className="col s12 m4 l4 center">
                  <font className="date_input_text">Expiration Date</font>
                  <br />
                  <DatePicker
                    selected={expirationDate}
                    onChange={(date) => set_expirationDate(date)}
                    className="date_input"
                    dateFormat="dd-MMM-yyyy"
                  />
                </div>
                <div className="col s12 m4 l4 center">
                  <font className="date_input_text">Password</font>
                  <br />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => set_password(e.target.value)}
                    className="date_input_pass"
                  />
                </div>
                <div className="col s12 m12 l12 center">
                  <br />
                  <button
                    className="issue_but"
                    onClick={() => get_mock_data()}
                    enabled={button_status}
                  >
                    Issue {credential_type}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col s12 m12 l12 center">
                  <ClipLoader
                    color="#ff0000"
                    loading={true}
                    size={70}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col s12 m12 l12 status_div">
            <center>
              <font className="status_text">{process_status}</font>
            </center>
          </div>
          <div className="col s12 m12 l12">
            <center>
              {response_data.length != 0 ? (
                <>
                  <br />
                  <font className="table_header">{credential_type} Data</font>
                  <br />
                  <table className="custom_table">
                    <tr>
                      {(() => {
                        const item_keys = Object.keys(response_data[0]);
                        let return_text = [];
                        for (let i = 0; i < item_keys.length; i++) {
                          return_text.push(<th>{item_keys[i]}</th>);
                        }
                        return return_text;
                      })()}
                    </tr>
                    {response_data.map((item, index) => {
                      return (
                        <tr>
                          {Object.keys(item).map(function (itemIndex) {
                            return <td>{item[itemIndex]}</td>;
                          })}
                        </tr>
                      );
                    })}
                  </table>
                </>
              ) : (
                <></>
              )}
            </center>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}

export default App;
