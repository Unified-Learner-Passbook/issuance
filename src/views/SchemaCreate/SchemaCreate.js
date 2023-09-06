import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Checkbox from "react-custom-checkbox";

//json file
import SampleCredentialsSchema from "../../assets/json/SampleCredentialsSchema.json";
import { schemaObj } from "../../utils/const/SchemaObj";

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

  //scheama create form objects
  const [sch_version, set_sch_version] = useState("");
  const [sch_name, set_sch_name] = useState("");
  const [sch_desc, set_sch_desc] = useState("");
  const [sch_properties_name, set_sch_properties_name] = useState("");
  const [sch_properties_desc, set_sch_properties_desc] = useState("");
  const [sch_properties_req, set_sch_properties_req] = useState(false);
  const [sch_properties, set_sch_properties] = useState([]);
  const [sch_taglist_txt, set_sch_taglist_txt] = useState("");
  const [sch_taglist, set_sch_taglist] = useState([]);
  const [sch_schema, set_sch_schema] = useState(schemaObj);
  const [tmp_cnt, set_tmp_cnt] = useState(0);

  //create sch_schema object
  useEffect(() => {
    //create schema object
    let tmp_sch_schema = sch_schema;
    tmp_sch_schema.schema.version = sch_version;
    tmp_sch_schema.schema.name = sch_name;
    tmp_sch_schema.schema.schema.description = sch_desc;
    let sch_$id = "";
    if (sch_name != "") {
      sch_$id += sch_name.replace(" ", "-");
    }
    if (sch_version != "") {
      sch_$id += "-" + sch_version.replace(" ", "-");
    }
    tmp_sch_schema.schema.schema.$id = sch_$id;
    tmp_sch_schema.tags = sch_taglist;
    //add properties
    if (sch_properties.length > 0) {
      //alert(JSON.stringify(sch_properties));
      let req_filed = [];
      for (let i = 0; i < sch_properties.length; i++) {
        let item = sch_properties[i];
        if (item.req) {
          req_filed.push(item.name);
        }
      }
      tmp_sch_schema.schema.schema.required = req_filed;
      tmp_sch_schema.schema.schema.properties = {};
    } else {
      tmp_sch_schema.schema.schema.required = [];
      tmp_sch_schema.schema.schema.properties = {};
    }
    set_sch_schema(tmp_sch_schema);
    set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
  }, [
    sch_version,
    sch_name,
    sch_desc,
    sch_properties_name,
    sch_properties_desc,
    sch_properties_req,
    sch_properties,
    sch_taglist_txt,
    sch_taglist,
  ]);
  const add_tags = () => {
    if (sch_taglist_txt === "") {
      alert("Enter schema tag then add in list");
    } else {
      let tmp_sch_taglist = sch_taglist;
      tmp_sch_taglist.push(sch_taglist_txt);
      set_sch_taglist(tmp_sch_taglist);
      set_sch_taglist_txt("");
      set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
      set_sch_taglist_txt("test");
      set_sch_taglist_txt("");
    }
  };
  const remove_tags = (index) => {
    let tmp_sch_taglist = sch_taglist;
    if (index > -1) {
      // only splice array when item is found
      tmp_sch_taglist.splice(index, 1); // 2nd parameter means remove one item only
    }
    set_sch_taglist(tmp_sch_taglist);
    set_sch_taglist_txt("");
    set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
    set_sch_taglist_txt("test");
    set_sch_taglist_txt("");
  };
  const add_properties = () => {
    if (sch_properties_name === "") {
      alert("Enter schema properties name then add in list");
    } else if (sch_properties_desc === "") {
      alert("Enter schema properties description then add in list");
    } else {
      let tmp_sch_properties = sch_properties;
      tmp_sch_properties.push({
        name: sch_properties_name,
        desc: sch_properties_desc,
        req: sch_properties_req,
      });
      set_sch_properties(tmp_sch_properties);
      set_sch_properties_name("");
      set_sch_properties_desc("");
      set_sch_properties_req(false);
      set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
      set_sch_properties_name("test");
      set_sch_properties_name("");
    }
  };
  const remove_properties = (index) => {
    let tmp_sch_properties = sch_properties;
    if (index > -1) {
      // only splice array when item is found
      tmp_sch_properties.splice(index, 1); // 2nd parameter means remove one item only
    }
    set_sch_properties(tmp_sch_properties);
    set_sch_properties_name("");
    set_sch_properties_desc("");
    set_sch_properties_req(false);
    set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
    set_sch_properties_name("test");
    set_sch_properties_name("");
    alert("hi");
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
                    <div className="row">
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">Version</font>
                        <br />
                        <input
                          type="text"
                          value={sch_version}
                          className="date_input_pass"
                          onChange={(e) => set_sch_version(e.target.value)}
                        />
                      </div>
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">Name</font>
                        <br />
                        <input
                          type="text"
                          value={sch_name}
                          className="date_input_pass"
                          onChange={(e) => set_sch_name(e.target.value)}
                        />
                      </div>
                      <div className="col s12 m6 l6 center">
                        <font className="date_input_text">Description</font>
                        <br />
                        <input
                          type="text"
                          value={sch_desc}
                          className="date_input_pass"
                          onChange={(e) => set_sch_desc(e.target.value)}
                        />
                      </div>
                      <div className="col s12 m6 l6 center">
                        <div className="col s10">
                          <font className="date_input_text">Tag</font>
                          <br />
                          <input
                            type="text"
                            value={sch_taglist_txt}
                            className="date_input_pass"
                            onChange={(e) => {
                              set_sch_taglist_txt(e.target.value);
                            }}
                          />
                        </div>
                        <div className="col s2">
                          <button
                            className="issue_but_small"
                            onClick={() => add_tags()}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col s12">
                        {sch_taglist && sch_taglist.length > 0 ? (
                          <>
                            <font className="tag_title">Tag List</font>
                            {sch_taglist.map((item, index) => {
                              return (
                                <font className="tag_name">
                                  <font className="">{item}</font>
                                  <font
                                    className="but_tag_name"
                                    onClick={() => remove_tags(index)}
                                  >
                                    X
                                  </font>
                                </font>
                              );
                            })}
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="col s12 m4 l4 center">
                        <font className="date_input_text">Properties Name</font>
                        <br />
                        <input
                          type="text"
                          value={sch_properties_name}
                          className="date_input_pass"
                          onChange={(e) => {
                            set_sch_properties_name(e.target.value);
                          }}
                        />
                      </div>
                      <div className="col s12 m4 l4 center">
                        <font className="date_input_text">
                          Properties Description
                        </font>
                        <br />
                        <input
                          type="text"
                          value={sch_properties_desc}
                          className="date_input_pass"
                          onChange={(e) => {
                            set_sch_properties_desc(e.target.value);
                          }}
                        />
                      </div>
                      <div className="col s12 m2 l2 center">
                        <br />
                        <Checkbox
                          checked={sch_properties_req}
                          onChange={(value, event) => {
                            set_sch_properties_req(value);
                          }}
                          borderColor="#000000"
                          style={{ cursor: "pointer" }}
                          labelStyle={{ marginLeft: 5, userSelect: "none" }}
                          label="Required"
                        />
                      </div>
                      <div className="col s12 m2 l2 center">
                        <button
                          className="issue_but_small"
                          onClick={() => add_properties()}
                        >
                          +
                        </button>
                      </div>
                      <div className="col s12"></div>
                      <div className="col s12">
                        {sch_properties && sch_properties.length > 0 ? (
                          <>
                            <font className="tag_title">Properties List</font>
                            <table>
                              <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Required</th>
                                <th>Remove</th>
                              </tr>
                              {sch_properties.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{item.name}</td>
                                    <td>{item.desc}</td>
                                    <td>{item.req ? "Yes" : ""}</td>
                                    <td>
                                      <font
                                        className="but_tag_name"
                                        onClick={() => remove_properties(index)}
                                      >
                                        X
                                      </font>
                                    </td>
                                  </tr>
                                );
                              })}
                            </table>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="col s12">
                        {sch_schema?.schema?.name ? (
                          <>
                            <hr />
                            <center>
                              <b>{JSON.stringify(sch_schema?.schema?.name)}</b>{" "}
                              JSON
                            </center>
                            <pre style={{ textAlign: "left" }}>
                              {JSON.stringify(sch_schema, undefined, 2)}
                            </pre>
                            <button
                              className="issue_but"
                              onClick={() => create_schema()}
                            >
                              Create {sch_schema?.schema?.name} Schema
                            </button>
                          </>
                        ) : (
                          <>
                            <hr />
                            <center>
                              <b>Invalid Credentials Schema JSON Object.</b>
                            </center>
                          </>
                        )}
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
              {/*button_status ? (
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
              )*/}
            </div>
          </div>
        </div>
      </>
    );
  }
  return <React.Fragment>{showSchemaCreate()}</React.Fragment>;
}

export default SchemaCreate;
