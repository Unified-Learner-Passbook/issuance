import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import DatePicker from "react-datepicker";
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";
import Select from "react-select";

//components
import Header from "../../components/Header/Header";

function CredIssue() {
  const { schema_id } = useParams();
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [ub_url, set_ub_url] = useState(process.env.REACT_APP_ULP_BFF);
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

  //issuer details
  const [issuer_did, set_issuer_did] = useState("");
  const [issuer_list, setissuer_list] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (selectedOption) {
      set_issuer_did(selectedOption.value);
    }
  }, [selectedOption]);

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
      if (issuer_did === "") {
        alert("Select Issuer from List");
      } else if (data_type === "CSV Data" && !file) {
        alert("Select " + schemaDetail?.name + " CSV Data file");
      } else {
        set_response_data([]);
        set_button_status(false);
        set_process_status(`Getting ${schemaDetail?.name} Data...`);
        if (data_type === "CSV Data") {
          //alert(JSON.stringify(array));
          //alert(array.length);
          if (array.length > 0) {
            if (array[0].dob && array[0].dob === "dob") {
              alert("You selected csv contain invalid data");
              set_button_status(true);
              set_process_status(`Not Yet Started`);
            } else {
              set_response_data(array);
              issueCred(array);
            }
          } else {
            alert("You selected csv contain no data");
            set_button_status(true);
            set_process_status(`Not Yet Started`);
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
  const [schemaField, setSchemaField] = useState([[]]);

  const [temp_val] = useState([]);
  useEffect(() => {
    load_schema_detail();
    load_issuer_list();
  }, [temp_val]);

  const load_schema_detail = async () => {
    set_button_status(false);
    set_process_status("Loading Schema Detail");

    var data = JSON.stringify({
      schema_id: schema_id,
    });

    var config = {
      method: "post",
      url: ub_url + "v1/credential/schema/fields",
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
      set_process_status("Not Yet Started");
      setSchemaDetail(response_result.data.result);
      let fieldarray = response_result.data.result.required.concat(
        response_result.data.result.optional
      );
      setSchemaField(fieldarray);
    }
  };

  const load_issuer_list = async () => {
    setissuer_list([]);
    set_button_status(false);
    set_process_status("Loading Issuer List");

    var config = {
      method: "get",
      url: ub_url + "v1/issuerlist",
      headers: {
        "Content-Type": "application/json",
      },
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
      set_process_status("Not Yet Started");
      if (
        response_result.data.result &&
        response_result.data.result.length > 0
      ) {
        let options = [];
        for (let i = 0; i < response_result.data.result.length; i++) {
          options.push({
            value: response_result.data.result[i].did,
            label: response_result.data.result[i].name,
          });
        }
        setissuer_list(options);
      }
    }
  };
  const download_csv_file = () => {
    //define the heading for each row of the data
    let csv = "";
    for (let i = 0; i < schemaField.length; i++) {
      if (i === 0) {
        csv = csv + schemaField[i];
      } else {
        csv = csv + "," + schemaField[i];
      }
    }
    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    hiddenElement.target = "_blank";

    //provide the name for the CSV file to be downloaded
    hiddenElement.download = schemaDetail?.name + ".csv";
    hiddenElement.click();
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
                        <div className="col s12 m12 l12 center">
                          <font className="date_input_text">Select Issuer</font>
                          <Select
                            defaultValue={issuer_did}
                            onChange={setSelectedOption}
                            options={issuer_list}
                          />
                        </div>
                      </div>
                      <div className="row">
                        {data_type === "CSV Data" ? (
                          <>
                            <div className="col s12 m6 l6 center">
                              <font className="download_text">
                                Prepare your data based on the downloaded
                                template and upload it for issuing credentials :
                              </font>
                              <br />
                              <font
                                onClick={() => download_csv_file()}
                                className="download_text_link"
                                style={{ cursor: "pointer" }}
                              >
                                Download Sample {schemaDetail?.name} CSV Data
                                File{" "}
                              </font>
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
