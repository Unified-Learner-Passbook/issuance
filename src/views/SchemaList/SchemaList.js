import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

//components
import Header from "../../components/Header/Header";

function SchemaList() {
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");
  //schema List states
  const [schemaList, setSchemaList] = useState([]);
  const [tagList, setTagList] = useState(
    localStorage.getItem("tagList") ? localStorage.getItem("tagList") : "issuer"
  );

  useEffect(() => {
    localStorage.setItem("tagList", tagList);
  }, [tagList]);

  const [temp_val] = useState([]);
  useEffect(() => {
    load_schema_list();
  }, [temp_val]);

  const load_schema_list = async () => {
    setSchemaList([]);
    set_button_status(false);
    set_process_status("Loading Schema List");

    var data = JSON.stringify({
      taglist: tagList,
    });

    var config = {
      method: "post",
      url: bi_url + "bulk/v1/credential/schema/list",
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
      if (
        response_result.data.result &&
        response_result.data.result.length > 0
      ) {
        setSchemaList(response_result.data.result);
      }
    }
  };
  function showSchemaList() {
    return (
      <>
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">Credentials Schema List</font>
                <hr />
              </div>
              <div className="col s12 center">
                <font className="date_input_text">
                  TagList (multiple values enter using comma)
                </font>
                <br />
                <input
                  type="text"
                  value={tagList}
                  className="date_input_pass"
                  onChange={(e) => setTagList(e.target.value)}
                />
                <br />
                <font
                  class="material-icons search_arrow"
                  onClick={() => load_schema_list()}
                >
                  search
                </font>
              </div>
              {button_status ? (
                <>
                  {schemaList.length === 0 ? (
                    <>
                      <center>No Credentials Schema Found.</center>
                    </>
                  ) : (
                    <></>
                  )}
                  {schemaList.map((item, index) => {
                    return (
                      <div className="col s12 m6 l6">
                        <Link to={"/bulk-issuance/schema/" + item.schema_id}>
                          <div
                            className={`div_button center div_button_active`}
                          >
                            {item.schema_name}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
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
  return <React.Fragment>{showSchemaList()}</React.Fragment>;
}

export default SchemaList;
