import React, { useState, useEffect } from "react";

import axios from "axios";
import DatePicker from "react-datepicker";
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";

//csv files
import Enrollment from "../../assets/csv/Enrollment.csv";
import Assessment from "../../assets/csv/Assessment.csv";
import Benifits from "../../assets/csv/Benifits.csv";

//components
import Header from "../../components/Header/Header";

function ULPBFF() {
  console.log(process.env.REACT_APP_ENV);
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

  //enrollment credentials
  const [issuer, set_issuer] = useState("Department of Basic Education");
  const [nature_associate, set_nature_associate] = useState("Other");
  const [title_associate, set_title_associate] = useState("Student");

  //csv file states
  const [file, setFile] = useState(null);
  const [array, setArray] = useState([]);
  const fileReader = new FileReader();
  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };
      fileReader.readAsText(file);
    }
  }, [file]);

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });
    console.log(array.length);
    setArray(array);
  };

  const headerKeys = Object.keys(Object.assign({}, ...array));

  const [client_id, set_client_id] = useState(process.env.REACT_APP_CLIENT_ID);
  const [client_secret, set_client_secret] = useState(
    process.env.REACT_APP_CLIENT_SECRET
  );
  const [bff_url, set_bff_url] = useState(process.env.REACT_APP_ULP_BFF);
  const [issuer_did, set_issuer_did] = useState(
    process.env.REACT_APP_ISSUER_DID
  );
  const [credential_type, set_credential_type] = useState("Enrollment");
  const [data_type, set_data_type] = useState("CSV Data");

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
    //alert(response_data.length);
    /*if (response_data.length != 0) {
      issueCred(response_data);
    }*/
  }, [response_data]);

  const get_mock_data = async () => {
    if (password === "ULP@2023") {
      //alert(file);
      if (data_type === "CSV Data" && !file) {
        alert(
          "Select " + credential_type === "Benifits"
            ? "Benefits"
            : credential_type + " CSV Data file"
        );
      } else {
        set_response_data([]);
        set_button_status(false);
        set_process_status(
          `Getting ${
            credential_type === "Benifits" ? "Benefits" : credential_type
          } Data...`
        );
        if (data_type === "CSV Data") {
          //alert(JSON.stringify(array));
          set_response_data(array);
          if (array.length != 0) {
            issueCred(array);
          }
        } else {
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
          if (response_api.length != 0) {
            issueCred(response_api);
          }
        }
      }
    } else {
      alert("You Entered Wrong Password");
    }
  };
  const issueCred = async (data) => {
    set_process_status(
      `Issuing ${
        credential_type === "Benifits" ? "Benefits" : credential_type
      } Credentials...`
    );
    set_button_status(false);
    set_response([]);
    let credentialSubject = [];
    //alert(data.length);
    let limitcount = 25;
    if (data.length < limitcount) {
      limitcount = data.length;
    }
    for (let i = 0; i < limitcount; i++) {
      if (credential_type === "Enrollment") {
        data[i].natureOfAssociation = nature_associate;
        data[i].associationTitle = title_associate;
      }
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
    if (response_api?.error) {
      set_process_status(response_api?.error);
    } else {
      set_process_status(
        `Issued ${
          credential_type === "Benifits" ? "Benefits" : credential_type
        } Credentials.`
      );
    }
    setFile(null);
    set_response(response_api);
    set_button_status(true);
  };
  const get_mock_data_delete = async () => {
    if (password === "ULP@2023@delete") {
      //alert(file);
      if (data_type === "CSV Data" && !file) {
        alert(
          "Select CSV Data file for list of aadhaar id token to delete data"
        );
      } else {
        set_response_data([]);
        set_button_status(false);
        set_process_status(`Getting Data to Delete...`);
        if (data_type === "CSV Data") {
          //alert(JSON.stringify(array));
          set_response_data(array);
          if (array.length != 0) {
            deleteCred(array);
          }
        } else {
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
          if (response_api.length != 0) {
            deleteCred(response_api);
          }
        }
      }
    } else {
      alert("You Entered Wrong Password");
    }
  };
  const deleteCred = async (data) => {
    set_process_status(`Deleting Data and Credentials...`);
    set_button_status(false);
    set_response([]);
    let aadhaarTokenList = [];
    //alert(data.length);
    let limitcount = 25;
    if (data.length < limitcount) {
      limitcount = data.length;
    }
    for (let i = 0; i < limitcount; i++) {
      aadhaarTokenList.push(data[i].aadhar_token);
    }
    //get client token
    var data = JSON.stringify({
      password: "test@4321",
    });
    var config = {
      method: "post",
      url: bff_url + "v1/sbrc/token",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    let response_client = null;
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        response_client = response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
    if (response_client?.token) {
      let client_token = response_client.token;
      var data = JSON.stringify({
        aadhaar_list: aadhaarTokenList,
      });
      var config = {
        method: "post",
        url: bff_url + "v1/sbrc/accountdelete",
        headers: {
          Authorization: "Bearer " + client_token,
          "Content-Type": "application/json",
        },
        data: data,
      };
      let response_delete = null;
      await axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          response_delete = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
      if (response_delete != null) {
        set_process_status(
          <pre style={{ textAlign: "left" }}>
            `Deleted Credentials Data.
            {JSON.stringify(response_delete, undefined, 2)}`
          </pre>
        );
      } else {
        set_process_status(`Error in deleting credentials.`);
      }
    } else {
      set_process_status(`Error in getting client token.`);
    }
    setFile(null);
    set_response(response_client);
    set_button_status(true);
    //reset data array
    set_response_data([]);
  };

  function showULPBFF() {
    return (
      <>
        {" "}
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">ULP-BFF API Source</font>
                <hr />
                <br />
              </div>
              {button_status ? (
                <>
                  <div className="row">
                    <div className="col s12 m12 l6 center">
                      <div className="col s12">
                        <font className="date_input_text">
                          Select Credential Type
                        </font>
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
                            credential_type === "Benifits"
                              ? "div_button_active"
                              : ""
                          }`}
                          onClick={() => set_credential_type("Benifits")}
                        >
                          Benefits
                        </div>
                      </div>
                    </div>
                    <div className="col s12 m12 l6 center">
                      <div className="col s12">
                        <font className="date_input_text">
                          Select Data source
                        </font>
                      </div>
                      <div className="col s6 m6 l6">
                        <div
                          className={`div_button center ${
                            data_type === "CSV Data" ? "div_button_active" : ""
                          }`}
                          onClick={() => set_data_type("CSV Data")}
                        >
                          CSV File
                        </div>
                      </div>
                      <div className="col s6 m6 l6">
                        <div
                          className={`div_button center ${
                            data_type === "Dummy Data"
                              ? "div_button_active"
                              : ""
                          }`}
                          onClick={() => set_data_type("Dummy Data")}
                        >
                          Mock Prerana Portal Data
                        </div>
                      </div>
                    </div>
                    <div className="col s12 m12 l12 center">
                      <hr className="hr_line" />
                    </div>
                  </div>
                  <div className="row">
                    {data_type === "CSV Data" ? (
                      <>
                        <div className="col s12 m6 l6 center">
                          <font className="download_text">
                            Prepare your data based on the downloaded template
                            and upload it for issuing credentials :
                          </font>
                          <br />
                          <a
                            href={
                              credential_type === "Enrollment"
                                ? Enrollment
                                : credential_type === "Assessment"
                                ? Assessment
                                : Benifits
                            }
                            download={true}
                            className="download_text_link"
                          >
                            Download Sample{" "}
                            {credential_type === "Benifits"
                              ? "Benefits"
                              : credential_type}{" "}
                            CSV Data File
                          </a>
                        </div>
                        <div className="col s12 m6 l6 center">
                          <font
                            onClick={() =>
                              document.getElementById("csvFileInput").click()
                            }
                            className="file_choose"
                          >
                            Choose File
                          </font>
                          <input
                            type={"file"}
                            id={"csvFileInput"}
                            accept={".csv"}
                            onChange={handleOnChange}
                            className="hide"
                          />
                          <br />
                          <br />
                          <font className="download_text">
                            <u>
                              <b>
                                {document.getElementById("csvFileInput")
                                  ? document
                                      .getElementById("csvFileInput")
                                      ?.files?.item(0)
                                    ? " " +
                                      document
                                        .getElementById("csvFileInput")
                                        .files.item(0).name
                                    : ""
                                  : ""}
                              </b>
                            </u>
                          </font>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="row">
                    <div className="row">
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">
                          Enter Issuance Date
                        </font>
                        <br />
                        <DatePicker
                          selected={issuanceDate}
                          onChange={(date) => set_issuanceDate(date)}
                          className="date_input"
                          dateFormat="dd-MMM-yyyy"
                        />
                      </div>
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">
                          Enter Expiration Date
                        </font>
                        <br />
                        <DatePicker
                          selected={expirationDate}
                          onChange={(date) => set_expirationDate(date)}
                          className="date_input"
                          dateFormat="dd-MMM-yyyy"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">Issuer</font>
                        <br />
                        <input
                          type="text"
                          value={issuer}
                          className="date_input_pass"
                          readOnly={true}
                        />
                      </div>
                      {credential_type === "Enrollment" ? (
                        <>
                          <div className="col s12 m6 l6 center">
                            <font className="date_input_text">
                              Nature of Association
                            </font>
                            <br />
                            <input
                              type="text"
                              value={nature_associate}
                              className="date_input_pass"
                              readOnly={true}
                            />
                          </div>
                          <div className="col s12 m6 l6 center">
                            <font className="date_input_text">
                              Association Title
                            </font>
                            <br />
                            <input
                              type="text"
                              value={title_associate}
                              className="date_input_pass"
                              readOnly={true}
                            />
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">Enter Password</font>
                        <br />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => set_password(e.target.value)}
                          className="date_input_pass"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s12 m3 l4 center"></div>
                      <div className="col s12 m6 l4 center">
                        <button
                          className="issue_but"
                          onClick={() => get_mock_data()}
                          enabled={button_status}
                        >
                          Issue{" "}
                          {credential_type === "Benifits"
                            ? "Benefits"
                            : credential_type}
                        </button>
                        <font className="date_input_text">OR</font>
                        <button
                          className="delete_but"
                          onClick={() => get_mock_data_delete()}
                          enabled={button_status}
                        >
                          Delete All Credentials
                        </button>
                      </div>
                    </div>
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
          <br />
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
                    <font className="table_header">
                      {credential_type === "Benifits"
                        ? "Benefits"
                        : credential_type}{" "}
                      Data
                    </font>
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
                      {response_data ? (
                        <>
                          {response_data.map((item, index) => {
                            if (index < 25) {
                              return (
                                <tr>
                                  {Object.keys(item).map(function (itemIndex) {
                                    return <td>{item[itemIndex]}</td>;
                                  })}
                                </tr>
                              );
                            }
                          })}
                        </>
                      ) : (
                        <></>
                      )}
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
      </>
    );
  }
  return <React.Fragment>{showULPBFF()}</React.Fragment>;
}

export default ULPBFF;
