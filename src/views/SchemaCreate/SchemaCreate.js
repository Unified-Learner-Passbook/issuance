import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Checkbox from "react-custom-checkbox";
import Select from "react-select";

//json file
import SampleCredentialsSchema from "../../assets/json/SampleCredentialsSchema.json";
import { schemaObj } from "../../utils/const/SchemaObj";

//components
import Header from "../../components/Header/Header";

function SchemaCreate() {
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [ub_url, set_ub_url] = useState(process.env.REACT_APP_ULP_BFF);
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
    if (issuer_did === "") {
      alert("Select Issuer from List");
    } else if (JSON.stringify(json?.schema?.schema?.properties) === "{}") {
      alert("Add Schema Subject name, description");
    } else if (json?.tags.length === 0) {
      alert("Add Schema tags");
    } else {
      set_button_status(false);
      set_process_status("DID Generating");

      var data = JSON.stringify({
        uniquetext: "issuer_credentials_schema",
      });

      var config = {
        method: "post",
        url: ub_url + "v1/getdid",
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
          url: ub_url + "v1/credential/schema/create",
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
          //reset all values
          set_sch_version("1.0");
          set_sch_name("");
          set_sch_desc("");
          set_sch_required([]);
          set_sch_properties({});
          set_sch_taglist([]);
          set_sch_schema(schemaObj);
          set_sch_subject_name("");
          set_sch_subject_desc("");
          set_sch_subject_req(false);
          set_sch_subject([]);
          set_sch_taglist_txt("");
          set_tmp_cnt(0);
        }
      }
    }
  };

  //scheama create form objects
  const [sch_version, set_sch_version] = useState("1.0");
  const [sch_name, set_sch_name] = useState("");
  const [sch_desc, set_sch_desc] = useState("");
  const [sch_required, set_sch_required] = useState([]);
  const [sch_properties, set_sch_properties] = useState({});
  const [sch_taglist, set_sch_taglist] = useState([]);
  const [sch_schema, set_sch_schema] = useState(schemaObj);

  //extra variable forms required
  const [sch_subject_name, set_sch_subject_name] = useState("");
  const [sch_subject_desc, set_sch_subject_desc] = useState("");
  const [sch_subject_req, set_sch_subject_req] = useState(false);
  const [sch_subject, set_sch_subject] = useState([]);
  const [sch_taglist_txt, set_sch_taglist_txt] = useState("");
  const [tmp_cnt, set_tmp_cnt] = useState(0);

  //issuer details
  const [issuer_did, set_issuer_did] = useState("");
  const [issuer_list, setissuer_list] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (selectedOption) {
      set_issuer_did(selectedOption.value);
    }
  }, [selectedOption]);

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

  //create sch_schema object
  useEffect(() => {
    //create schema object
    let tmp_sch_schema = sch_schema;
    //issuer_did
    tmp_sch_schema.schema.author = issuer_did;
    //add version
    tmp_sch_schema.schema.version = sch_version;
    //add name
    tmp_sch_schema.schema.name = sch_name;
    //add desc
    tmp_sch_schema.schema.schema.description = sch_desc;
    //add $id
    let sch_$id = "";
    if (sch_name != "") {
      sch_$id += sch_name.replace(" ", "-");
    }
    if (sch_version != "") {
      sch_$id += "-" + sch_version.replace(" ", "-");
    }
    tmp_sch_schema.schema.schema.$id = sch_$id;
    //add taglist
    tmp_sch_schema.tags = sch_taglist;
    //add required
    tmp_sch_schema.schema.schema.required = sch_required;
    //add properties
    tmp_sch_schema.schema.schema.properties = sch_properties;
    //set schema object
    set_sch_schema(tmp_sch_schema);
    set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
  }, [
    issuer_did,
    sch_version,
    sch_name,
    sch_desc,
    sch_taglist_txt,
    sch_required,
    sch_properties,
  ]);
  //create sch_schema object add subject
  useEffect(() => {
    //add required and properties
    if (sch_subject.length > 0) {
      let req_filed = [];
      let properties_filed = new Object({});
      for (let i = 0; i < sch_subject.length; i++) {
        let item = sch_subject[i];
        if (item.req) {
          req_filed.push(item.name);
        }
        properties_filed[item.name] = {
          type: "string",
          description: item.desc,
        };
      }
      set_sch_required(req_filed);
      set_sch_properties(properties_filed);
    } else {
      set_sch_required([]);
      set_sch_properties({});
    }
  }, [tmp_cnt]);
  //set JSON
  useEffect(() => {
    //set set_JSON
    setJSON(sch_schema);
  }, [sch_schema]);
  const add_tags = () => {
    if (sch_taglist_txt === "") {
      alert("Enter schema tag then add in list");
    } else {
      let tmp_sch_taglist = sch_taglist;
      tmp_sch_taglist.push(sch_taglist_txt.replace(" ", "_").toString());
      set_sch_taglist(tmp_sch_taglist);
      set_sch_taglist_txt("");
      set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
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
  };
  const add_subject = () => {
    if (sch_subject_name === "") {
      alert("Enter schema subject name then add in list");
    } else if (sch_subject_desc === "") {
      alert("Enter schema subject description then add in list");
    } else {
      let tmp_sch_subject = sch_subject;
      tmp_sch_subject.push({
        name: sch_subject_name.replace(" ", "_").toString(),
        desc: sch_subject_desc.toString(),
        req: sch_subject_req,
      });
      set_sch_subject(tmp_sch_subject);
      set_sch_subject_name("");
      set_sch_subject_desc("");
      set_sch_subject_req(false);
      set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
    }
  };
  const remove_subject = (index) => {
    let tmp_sch_subject = sch_subject;
    if (index > -1) {
      // only splice array when item is found
      tmp_sch_subject.splice(index, 1); // 2nd parameter means remove one item only
    }
    set_sch_subject(tmp_sch_subject);
    set_sch_subject_name("");
    set_sch_subject_desc("");
    set_sch_subject_req(false);
    set_tmp_cnt((tmp_cnt) => tmp_cnt + 1);
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
              </div>
              {button_status ? (
                <>
                  <div className="col s12 center">
                    <div className="row">
                      <div className="row">
                        <div className="col s12 m12 l12 center">
                          <font className="date_input_text">
                            Select Issuer as Author for Schema
                          </font>
                          <Select
                            defaultValue={issuer_did}
                            onChange={setSelectedOption}
                            options={issuer_list}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col s12 m4 l4 center">
                          <font className="date_input_text">Name</font>
                          <br />
                          <input
                            type="text"
                            value={sch_name}
                            className="date_input_pass"
                            onChange={(e) => set_sch_name(e.target.value)}
                          />
                        </div>
                        <div className="col s12 m8 l8 center">
                          <font className="date_input_text">Description</font>
                          <br />
                          <input
                            type="text"
                            value={sch_desc}
                            className="date_input_pass"
                            onChange={(e) => set_sch_desc(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col s10 m4 l4 center">
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
                        <div className="col s2 m2 l2 center">
                          <button
                            className="issue_but_small"
                            onClick={() => add_tags()}
                          >
                            +
                          </button>
                        </div>
                        <div className="col s12 l6 m6">
                          {sch_taglist && sch_taglist.length > 0 ? (
                            <>
                              <font className="tag_title">Tag List</font>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Tag</th>
                                    <th>Remove</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sch_taglist.map((item, index) => {
                                    return (
                                      <tr key={"tag_index" + index}>
                                        <td>{item}</td>
                                        <td>
                                          <font
                                            className="but_tag_name"
                                            onClick={() => remove_tags(index)}
                                          >
                                            X
                                          </font>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col s12 m4 l4 center">
                          <font className="date_input_text">Subject Name</font>
                          <br />
                          <input
                            type="text"
                            value={sch_subject_name}
                            className="date_input_pass"
                            onChange={(e) => {
                              set_sch_subject_name(e.target.value);
                            }}
                          />
                        </div>
                        <div className="col s12 m4 l4 center">
                          <font className="date_input_text">
                            Subject Description
                          </font>
                          <br />
                          <input
                            type="text"
                            value={sch_subject_desc}
                            className="date_input_pass"
                            onChange={(e) => {
                              set_sch_subject_desc(e.target.value);
                            }}
                          />
                        </div>
                        <div className="col s12 m2 l2 center">
                          <br />
                          <Checkbox
                            checked={sch_subject_req}
                            onChange={(value, event) => {
                              set_sch_subject_req(value);
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
                            onClick={() => add_subject()}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col s12">
                          {sch_subject && sch_subject.length > 0 ? (
                            <>
                              <font className="tag_title">Subject Fields</font>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Required</th>
                                    <th>Remove</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sch_subject.map((item, index) => {
                                    return (
                                      <tr key={"subjuect_index_" + index}>
                                        <td>{item.name}</td>
                                        <td>{item.desc}</td>
                                        <td>{item.req ? "Yes" : ""}</td>
                                        <td>
                                          <font
                                            className="but_tag_name"
                                            onClick={() =>
                                              remove_subject(index)
                                            }
                                          >
                                            X
                                          </font>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                      <div className="col s12">
                        {sch_schema?.schema?.version &&
                        sch_schema?.schema?.name &&
                        sch_schema?.schema?.schema?.$id &&
                        sch_schema?.schema?.schema?.description ? (
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
