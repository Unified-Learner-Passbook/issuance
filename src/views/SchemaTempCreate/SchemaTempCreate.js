import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

//components
import Header from "../../components/Header/Header";

function SchemaTempCreate() {
  const { schema_id } = useParams();
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");

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
    } else {
      set_button_status(true);
      setSchemaDetail(response_result.data.result);
    }
  };

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
        text_json.schema = schema_id;
        setJSON(text_json);
      };
    }
  }, [file]);

  const create_schema_temp = async () => {
    set_button_status(false);
    set_process_status("Creating " + schemaDetail?.name + " Schema Template");
    let schema_object = json;
    setJSON(schema_object);
    var data = JSON.stringify(schema_object);
    var config = {
      method: "post",
      url: bi_url + "bulk/v1/credential/schema/template/create",
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
      alert("Error in creating schema template");
      set_button_status(true);
    } else {
      alert(schemaDetail?.name + " Schema Template Created");
      set_button_status(true);
      setFile(null);
      setJSON(null);
    }
  };
  function showSchemaTempCreate() {
    return (
      <>
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">
                  {schemaDetail?.name} Schema Template Create
                </font>
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
                      Choose Credentials Schema Template JSON File
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
                    {json?.schema ? (
                      <>
                        <hr />
                        <pre style={{ textAlign: "left" }}>
                          {JSON.stringify(json, undefined, 2)}
                        </pre>
                        <button
                          className="issue_but"
                          onClick={() => create_schema_temp()}
                        >
                          Create {schemaDetail?.name} Schema
                        </button>
                      </>
                    ) : (
                      <>
                        <center>
                          Select Valid Credentials Schema Template JSON File.
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
  return <React.Fragment>{showSchemaTempCreate()}</React.Fragment>;
}

export default SchemaTempCreate;
