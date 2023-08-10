import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

//json file
import SampleCredentialsSchema from "../../assets/json/SampleCredentialsSchema.json";

//components
import Header from "../../components/Header/Header";

function SchemaCreate() {
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");
  //json file states
  const [file, setFile] = useState(null);
  const [json, setJSON] = useState(null);
  const fileReader = new FileReader();
  const handleOnChange = (e) => {
    setFile(e.target.files[0], "UTF-8");
  };
  useEffect(() => {
    if (file) {
      fileReader.readAsText(file);
      fileReader.onload = function (event) {
        const text = event.target.result;
        let text_json = JSON.parse(text);
        text_json.tags.push("issuer");
        setJSON(text_json);
      };
    }
  }, [file]);

  const create_schema = async () => {
    set_button_status(false);
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
      set_process_status("Schema Creating");
      let id = response_result.data.result;
      let schema_object = json;
      schema_object.schema.id = id;
      setJSON(schema_object);
      var data = JSON.stringify(schema_object);
      var config = {
        method: "post",
        url: bi_url + "bulk/v1/credential/schema/create",
        headers: {
          "Content-Type": "application/json",
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
        alert("Error in creating schema");
        set_button_status(true);
      } else {
        alert(json.schema.name + " Created");
        set_button_status(true);
        setFile(null);
        setJSON(null);
      }
    }
  };
  function showSchemaCreate() {
    return (
      <>
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">Create Credentials Schema</font>
                <hr />
                <br />
              </div>
              {button_status ? (
                <>
                  <div className="col s12 center">
                    <br />
                    <font
                      onClick={() =>
                        document.getElementById("jsonFileInput").click()
                      }
                      className="file_choose"
                    >
                      Choose Credentials Schema JSON File
                    </font>
                    <input
                      type={"file"}
                      id={"jsonFileInput"}
                      accept={".json"}
                      onChange={handleOnChange}
                      className="hide"
                    />
                    <br />
                    <br />
                    <font className="download_text">
                      <u>
                        <b>
                          {document.getElementById("jsonFileInput")
                            ? document
                                .getElementById("jsonFileInput")
                                ?.files?.item(0)
                              ? " " +
                                document
                                  .getElementById("jsonFileInput")
                                  .files.item(0).name
                              : ""
                            : ""}
                        </b>
                      </u>
                    </font>
                  </div>
                  <div className="col s12">
                    {json?.schema?.name ? (
                      <>
                        <hr />
                        <center>{JSON.stringify(json?.schema?.name)}</center>
                        <pre style={{ textAlign: "left" }}>
                          {JSON.stringify(json, undefined, 2)}
                        </pre>
                        <button
                          className="issue_but"
                          onClick={() => create_schema()}
                        >
                          Create {json?.schema?.name}
                          Schema
                        </button>
                      </>
                    ) : (
                      <>
                        <center>
                          Select Valid Credentials Schema JSON File.
                        </center>
                      </>
                    )}
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
          </div>
        </div>
      </>
    );
  }
  return <React.Fragment>{showSchemaCreate()}</React.Fragment>;
}

export default SchemaCreate;
