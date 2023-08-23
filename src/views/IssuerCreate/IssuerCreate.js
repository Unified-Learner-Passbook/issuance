import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

//json file
import SampleCredentialsSchema from "../../assets/json/SampleCredentialsSchema.json";

//components
import Header from "../../components/Header/Header";

function IssuerCreate() {
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");
  //issuer details
  const [name, setName] = useState("");
  const [issuer_list, setissuer_list] = useState([]);

  const [temp_val] = useState([]);
  useEffect(() => {
    load_issuer_list();
  }, [temp_val]);

  const load_issuer_list = async () => {
    setissuer_list([]);
    set_button_status(false);
    set_process_status("Loading Issuer List");

    var config = {
      method: "get",
      url: bi_url + "bulk/v1/issuerlist",
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
    } else {
      set_button_status(true);
      if (
        response_result.data.result &&
        response_result.data.result.length > 0
      ) {
        setissuer_list(response_result.data.result);
      }
    }
  };

  const create_issuer = async () => {
    if (name === "") {
      alert("Enter Issuer Name");
    } else {
      set_button_status(false);
      set_process_status("Getting Client Token");
      var data = JSON.stringify({
        password: "test@4321",
      });
      var config = {
        method: "post",
        url: bi_url + "bulk/v1/clienttoken",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      let response_result_token = null;
      await axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          response_result_token = { data: response.data };
        })
        .catch(function (error) {
          console.log(error);
          response_result_token = { error: error };
        });
      if (response_result_token?.error) {
        alert("Error in Getting Token");
        set_button_status(true);
      } else {
        let token = response_result_token.data.token;
        set_process_status("DID Generating");
        var data = JSON.stringify({
          uniquetext: "issuer_credentials_schema",
        });
        var config = {
          method: "post",
          url: bi_url + "bulk/v1/getdid",
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
          alert("Error in generating DID ");
          set_button_status(true);
        } else {
          set_process_status("Issuer Creating");
          let id = response_result.data.result;
          let username = Math.floor(100000 + Math.random() * 900000);
          let issuer_object = {
            name: name,
            did: id,
            username: username.toString(),
            password: "1234",
          };
          var data = JSON.stringify(issuer_object);
          var config = {
            method: "post",
            url: bi_url + "bulk/v1/issuerregister",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            data: data,
          };

          let response_result_1 = null;
          await axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
              response_result_1 = { data: response.data };
            })
            .catch(function (error) {
              console.log(error);
              response_result_1 = { error: error };
            });

          if (response_result_1?.error) {
            alert("Error in creating issuer");
            set_button_status(true);
          } else {
            alert(issuer_object.name + " Created");
            set_button_status(true);
            setName("");
            load_issuer_list();
          }
        }
      }
    }
  };
  function showIssuerCreate() {
    return (
      <>
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">Create New Issuer</font>
                <hr />
                <br />
              </div>
              {button_status ? (
                <>
                  <div className="col s12 center">
                    <div className="row">
                      <div className="col s12 m12 l12 center">
                        <font className="date_input_text">Issuer Name</font>
                        <br />
                        <input
                          type="text"
                          value={name}
                          className="date_input_pass"
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s12 m3 l4 center"></div>
                      <div className="col s12 m6 l4 center">
                        <button
                          className="issue_but"
                          onClick={() => create_issuer()}
                          enabled={button_status}
                        >
                          Create Issuer
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col s12 m12 l12 center">
                    <br />
                    <ClipLoader
                      color="#ff0000"
                      loading={true}
                      size={70}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                    <br />
                    <br />
                    <div className="status_div">
                      <center>
                        <font className="status_text">{process_status}</font>
                      </center>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="row">
              <div className="col s12 m12 l12 status_div">
                <center>
                  <font className="status_text">List Of Issuer</font>
                </center>
              </div>
              <div className="col s12 m12 l12">
                <center>
                  {issuer_list.length != 0 ? (
                    <>
                      <br />
                      <table className="custom_table">
                        <tr>
                          <th>Name</th>
                          <th>DID</th>
                        </tr>
                        {issuer_list ? (
                          <>
                            {issuer_list.map((item, index) => {
                              return (
                                <tr>
                                  <td>{item.name}</td>
                                  <td>{item.did}</td>
                                </tr>
                              );
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
        </div>
      </>
    );
  }
  return <React.Fragment>{showIssuerCreate()}</React.Fragment>;
}

export default IssuerCreate;
