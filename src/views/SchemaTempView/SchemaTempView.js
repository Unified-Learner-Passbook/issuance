import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

//components
import Header from "../../components/Header/Header";

function SchemaTempView() {
  const { schema_id } = useParams();
  const { schema_temp_id } = useParams();
  const [bi_url, set_bi_url] = useState(process.env.REACT_APP_BULK_ISSUANCE);
  const [ub_url, set_ub_url] = useState(process.env.REACT_APP_ULP_BFF);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");
  //schema List states
  const [schemaDetail, setSchemaDetail] = useState(null);
  const [schemaTempDetail, setSchemaTempDetail] = useState([]);

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
      let schema_temp_detail = [];
      if (
        response_result.data.result &&
        response_result.data.result.length > 0
      ) {
        for (let i = 0; i < response_result.data.result.length; i++) {
          if (response_result.data.result[i].templateId === schema_temp_id) {
            schema_temp_detail.push(response_result.data.result[i]);
            break;
          }
        }
        setSchemaTempDetail(schema_temp_detail);
      }

      //load schema template
    }
  };
  function showSchemaTempView() {
    return (
      <>
        {button_status ? (
          <></>
        ) : (
          <>
            <div className="row">
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
            </div>
          </>
        )}
        <div
          className="sample_template"
          dangerouslySetInnerHTML={{
            __html: schemaTempDetail[0]?.template,
          }}
        ></div>
      </>
    );
  }
  return <React.Fragment>{showSchemaTempView()}</React.Fragment>;
}

export default SchemaTempView;
