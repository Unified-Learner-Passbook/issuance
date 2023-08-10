import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import DatePicker from "react-datepicker";
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";

//components
import Header from "../../components/Header/Header";

function CredIssue() {
  const { schema_id } = useParams();
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
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

  const [issuer_did, set_issuer_did] = useState(
    process.env.REACT_APP_ISSUER_DID
  );
  const [data_type, set_data_type] = useState("CSV Data");

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
        alert("Select " + schemaDetail?.name + " CSV Data file");
      } else {
        set_response_data([]);
        set_button_status(false);
        set_process_status(`Getting ${schemaDetail?.name} Data...`);
        if (data_type === "CSV Data") {
          //alert(JSON.stringify(array));
          set_response_data(array);
          if (array.length != 0) {
            issueCred(array);
          }
        } else {
          //other than csv file data source
        }
      }
    } else {
      alert("You Entered Wrong Password");
    }
  };
  const issueCred = async (data) => {
    set_process_status(`Issuing ${schemaDetail?.name} Credentials...`);
    set_button_status(false);
    set_response([]);
    let credentialSubject = [];
    //alert(data.length);
    let limitcount = 25;
    if (data.length < limitcount) {
      limitcount = data.length;
    }
    for (let i = 0; i < limitcount; i++) {
      credentialSubject.push(data[i]);
    }
    var data = JSON.stringify({
      schema_id: schema_id,
      issuerDetail: {
        did: issuer_did,
      },
      vcData: {
        issuanceDate: issuanceDate_txt,
        expirationDate: expirationDate_txt,
      },
      credentialSubject: credentialSubject,
    });
    var config = {
      method: "post",
      url: bi_url + "bulk/v1/credential/issue",
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
      if (response_api?.iserror) {
        set_process_status(
          <pre style={{ textAlign: "left" }}>
            `Error in Issued {schemaDetail?.name}. Error Count{" "}
            {response_api?.error_count}
            <br />
            {JSON.stringify(response_api?.result, undefined, 2)}`
          </pre>
        );
      } else {
        set_process_status(`Issued ${schemaDetail?.name} Credentials.`);
      }
    }
    setFile(null);
    set_response(response_api);
    set_button_status(true);
  };

  //schema List states
  const [schemaDetail, setSchemaDetail] = useState(null);

  const [temp_val] = useState([]);
  useEffect(() => {
    load_schema_detail();
  }, [temp_val]);

  const load_schema_detail = async () => {
    set_button_status(false);
    set_process_status("Loading Schema Detail");

    var data = JSON.stringify({
      schema_id: schema_id,
    });

    var config = {
      method: "post",
      url: bi_url + "bulk/v1/credential/schema/fields",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    let response_result = null;
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        response_result = { data: response.data };
      })
      .catch(function (error) {
        console.log(error);
        response_result = { error: error };
      });
    if (response_result?.error) {
      set_button_status(true);
      set_process_status("Not Yet Started");
    } else {
      set_button_status(true);
      setSchemaDetail(response_result.data.result);
    }
  };

  function showCredIssue() {
    return (
      <>
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">Issue {schemaDetail?.name}</font>
                <hr />
                <br />
              </div>
              {button_status ? (
                <>
                  {schemaDetail?.name ? (
                    <>
                      <div className="row">
                        {data_type === "CSV Data" ? (
                          <>
                            <div className="col s12 m6 l6 center">
                              <font className="download_text">
                                Prepare your data based on the downloaded
                                template and upload it for issuing credentials :
                              </font>
                              <br />
                              <a
                                href="#"
                                download={true}
                                className="download_text_link"
                              >
                                Download Sample {schemaDetail?.name} CSV Data
                                File
                              </a>
                            </div>
                            <div className="col s12 m6 l6 center">
                              <font
                                onClick={() =>
                                  document
                                    .getElementById("csvFileInput")
                                    .click()
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
                          <div className="col s12 m12 l12 center">
                            <font className="date_input_text">
                              Enter Password
                            </font>
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
                              Issue {schemaDetail?.name}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
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
                      {schemaDetail?.name} Data
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
  return <React.Fragment>{showCredIssue()}</React.Fragment>;
}

export default CredIssue;
