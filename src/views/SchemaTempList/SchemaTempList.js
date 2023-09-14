import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

//components
import Header from "../../components/Header/Header";

function SchemaTempList() {
  const { schema_id } = useParams();
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [ub_url, set_ub_url] = useState(process.env.REACT_APP_ULP_BFF);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");
  //schema List states
  const [schemaDetail, setSchemaDetail] = useState(null);
  const [schemaTempList, setSchemaTempList] = useState([]);

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
    } else {
      set_button_status(true);
      setSchemaDetail(response_result.data.result);
      //load schema template
      load_schema_temp_list();
    }
  };
  const load_schema_temp_list = async () => {
    setSchemaTempList([]);
    set_button_status(false);
    set_process_status("Loading Schema Template Details");

    var data = JSON.stringify({
      schema_id: schema_id,
    });

    var config = {
      method: "post",
      url: ub_url + "v1/credential/schema/template/list",
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
      setSchemaTempList(response_result.data.result);
      //load schema template
    }
  };
  function showSchemaTempList() {
    return (
      <>
        <div className="container_remove">
          <Header isback={true} />
          <div className="container div_cred_type div_back">
            <div className="row">
              <div className="col s12 center">
                <font className="page_title">
                  {schemaDetail?.name} Schema Template List
                </font>
                <hr />
                <br />
              </div>
              {button_status ? (
                <>
                  {schemaTempList.length === 0 ? (
                    <>
                      <center>No Schema Template Found.</center>
                    </>
                  ) : (
                    <></>
                  )}
                  {schemaTempList.map((item, index) => {
                    return (
                      <div className="col s12 m6 l6">
                        <Link
                          to={
                            "/bulk-issuance/schema/" +
                            schema_id +
                            "/template/" +
                            item.templateId+"/view"
                          }
                        >
                          <div
                            className={`div_button center div_button_active`}
                          >
                            {item.type} {item.templateId}
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
  return <React.Fragment>{showSchemaTempList()}</React.Fragment>;
}

export default SchemaTempList;
