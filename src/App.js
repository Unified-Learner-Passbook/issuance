import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import gov_logo from "./images/gov_logo.png";
import home_image from "./images/home_image.png";
import DatePicker from "react-datepicker";
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";

function App() {
  const [response, setresponse] = useState([]);
  const [response_data_assessment, setresponse_data_assessment] = useState([]);
  const [response_data_enrollment, setresponse_data_enrollment] = useState([]);
  const [button_status, set_button_status] = useState(true);
  const [process_status, set_process_status] = useState("Not Yet Started");

  const [issuanceDate, set_issuanceDate] = useState(new Date());
  const [expirationDate, set_expirationDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 6))
  );

  const [issuanceDate_txt, set_issuanceDate_txt] = useState(null);
  const [expirationDate_txt, set_expirationDate_txt] = useState(null);
  const [password, set_password] = useState("");
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
    if (response_data_enrollment.length != 0) {
      issueCredEnrollment(response_data_enrollment);
    }
  }, [response_data_enrollment]);

  useEffect(() => {
    if (response_data_assessment.length != 0) {
      issueCredAssessment(response_data_assessment);
    }
  }, [response_data_assessment]);

  const enrollment_data = async () => {
    if (password === "ULP@2023") {
      set_button_status(false);
      set_process_status("Getting Enrollment Data...");
      var data = JSON.stringify({
        clientId: "GY1K14868",
        clientSecret: "0c3cbdba425f5db1fce7fa47bfa78563",
      });

      var config = {
        method: "post",
        url: "https://ulp.uniteframework.io/ulp-bff/v1/client/bulk/getdata/proofOfEnrollment",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      let response_api = [];
      await axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          response_api = response.data.result;
        })
        .catch(function (error) {
          console.log(error);
          response_api = error;
        });
      setresponse_data_enrollment(response_api);
      asssesment_data();
    } else {
      alert("You Entered Wrong Password");
    }
  };
  const asssesment_data = async () => {
    set_process_status("Getting Assessment Data...");
    var data = JSON.stringify({
      clientId: "GY1K14868",
      clientSecret: "0c3cbdba425f5db1fce7fa47bfa78563",
    });

    var config = {
      method: "post",
      url: "https://ulp.uniteframework.io/ulp-bff/v1/client/bulk/getdata/proofOfAssessment",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    let response_api = [];
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        response_api = response.data.result;
      })
      .catch(function (error) {
        console.log(error);
        response_api = error;
      });
    setresponse_data_assessment(response_api);
    //issueCredEnrollment(response_data_enrollment);
  };

  const issueCredEnrollment = async (data) => {
    set_process_status("Issuing Enrollment and Assessment Credentials...");
    set_button_status(false);
    setresponse([]);
    let credentialSubjectEnrollment = [];
    //alert(data.length);
    for (let i = 0; i < 25; i++) {
      credentialSubjectEnrollment.push({
        student_id: data[i].student_id,
        student_name: data[i].student_name,
        dob: data[i].dob,
        reference_id: data[i].reference_id,
        aadhar_token: data[i].aadhar_token,
        guardian_name: data[i].guardian_name,
        enrolled_on: data[i].enrolled_on,
      });
      /*[
      {
        student_id: "1234",
        student_name: "Rushi Gawali",
        dob: "31/01/1992",
        reference_id: "6399001506",
        aadhar_token: "23a136624c39ac2942fdffdcd9a6ae0b",
        guardian_name: "Guardian Name",
        enrolled_on: "2021-07-08",
      },
    ]*/
    }
    var data = JSON.stringify({
      clientId: "GY1K14868",
      clientSecret: "0c3cbdba425f5db1fce7fa47bfa78563",
      issuerDetail: {
        did: "did:ulp:f0c63323-7c59-4db5-94c6-7a9886934680",
        udise: "09580413502",
        schoolName: "CENTRAL PUBLIC ACEDEMY",
      },
      vcData: {
        issuanceDate: issuanceDate_txt,
        expirationDate: expirationDate_txt,
      },
      credentialSubjectCommon: {
        grade: "class-7",
        academic_year: "2023-2024",
        stateCode: "09",
        stateName: "Uttar Pradesh",
        districtCode: "0913",
        districtName: "HATHRAS",
        blockCode: "091306",
        blockName: "SADABAD",
      },
      credentialSubject: credentialSubjectEnrollment,
    });
    var config = {
      method: "post",
      url: "https://ulp.uniteframework.io/ulp-bff/v1/client/bulk/uploadv2/proofOfEnrollment",
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
    setresponse(response_api);
    //issueCredAssessment(response_data_assessment);
  };

  const issueCredAssessment = async (data) => {
    set_process_status("Issuing Enrollment and Assessment Credentials...");
    set_button_status(false);
    setresponse([]);
    let credentialSubjectEnrollment = [];
    for (let i = 0; i < 25; i++) {
      credentialSubjectEnrollment.push({
        student_id: data[i].student_id,
        student_name: data[i].student_name,
        dob: data[i].dob,
        reference_id: data[i].reference_id,
        aadhar_token: data[i].aadhar_token,
        marks: data[i].marks,
      });
      /*[
      {
        student_id: "1234",
        student_name: "Rushi Gawali",
        dob: "31/01/1992",
        reference_id: "6399001506",
        aadhar_token: "23a136624c39ac2942fdffdcd9a6ae0b",
        guardian_name: "Guardian Name",
        enrolled_on: "2021-07-08",
      },
    ]*/
    }
    var data = JSON.stringify({
      clientId: "GY1K14868",
      clientSecret: "0c3cbdba425f5db1fce7fa47bfa78563",
      issuerDetail: {
        did: "did:ulp:f0c63323-7c59-4db5-94c6-7a9886934680",
        udise: "09580413502",
        schoolName: "CENTRAL PUBLIC ACEDEMY",
      },
      vcData: {
        issuanceDate: issuanceDate_txt,
        expirationDate: expirationDate_txt,
      },
      credentialSubjectCommon: {
        grade: "class-7",
        academic_year: "2023-2024",
        stateCode: "09",
        stateName: "Uttar Pradesh",
        districtCode: "0913",
        districtName: "HATHRAS",
        blockCode: "091306",
        blockName: "SADABAD",
        assessment: "NAT assessment Lucknow mandal",
        total: "300",
        quarterlyAssessment: "3",
      },
      credentialSubject: credentialSubjectEnrollment,
    });
    var config = {
      method: "post",
      url: "https://ulp.uniteframework.io/ulp-bff/v1/client/bulk/uploadv2/proofOfAssessment",
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
    setresponse(response_api);
    set_process_status("Issued Enrollment and Assessment Credentials.");
    set_button_status(true);
  };
  return (
    <div className="App">
      <div style={{ width: "100%" }}>
        <center>
          <br />
          <br />
          <img src={gov_logo} className="logo_gov" />
          <br />
          <br />
          <font className="logo_text">Credentials Issue Example</font>
          <br />
          <br />
          <img src={home_image} className="logo_home" />
          {button_status ? (
            <>
              <br />
              <br />
              <font className="date_input_text">Issuance Date</font>
              <br />
              <DatePicker
                selected={issuanceDate}
                onChange={(date) => set_issuanceDate(date)}
                className="date_input"
              />
              <br />
              <br />
              <font className="date_input_text">Expiration Date</font>
              <br />
              <DatePicker
                selected={expirationDate}
                onChange={(date) => set_expirationDate(date)}
                className="date_input"
              />
              <br />
              <br />
              <font className="date_input_text">Password</font>
              <br />
              <input
                type="password"
                value={password}
                onChange={(e) => set_password(e.target.value)}
                className="date_input"
              />
              <br />
              <br />
              <button
                className="issue_but"
                onClick={() => enrollment_data()}
                enabled={button_status}
              >
                Issue
              </button>
            </>
          ) : (
            <>
              <br />
              <ClipLoader
                color="#ff0000"
                loading={true}
                size={100}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </>
          )}
          <br />
          <br />
        </center>
        <div className="status_div">
          <center>
            <font className="status_text">{process_status}</font>
          </center>
        </div>
        <div>
          <center>
            {response_data_enrollment.length != 0 ? (
              <>
                <br />
                <font className="table_header">Enrollment data</font>
                <table>
                  <tr>
                    {(() => {
                      const item_keys = Object.keys(
                        response_data_enrollment[0]
                      );
                      let return_text = [];
                      for (let i = 0; i < item_keys.length; i++) {
                        return_text.push(<th>{item_keys[i]}</th>);
                      }
                      return return_text;
                    })()}
                  </tr>
                  {response_data_enrollment.map((item, index) => {
                    return (
                      <tr>
                        {Object.keys(item).map(function (itemIndex) {
                          return <td>{item[itemIndex]}</td>;
                        })}
                      </tr>
                    );
                  })}
                </table>
              </>
            ) : (
              <></>
            )}
            {response_data_assessment.length != 0 ? (
              <>
                <br />
                <font className="table_header">Assessment data</font>
                <table>
                  <tr>
                    {(() => {
                      const item_keys = Object.keys(
                        response_data_assessment[0]
                      );
                      let return_text = [];
                      for (let i = 0; i < item_keys.length; i++) {
                        return_text.push(<th>{item_keys[i]}</th>);
                      }
                      return return_text;
                    })()}
                  </tr>
                  {response_data_assessment.map((item, index) => {
                    return (
                      <tr>
                        {Object.keys(item).map(function (itemIndex) {
                          return <td>{item[itemIndex]}</td>;
                        })}
                      </tr>
                    );
                  })}
                </table>
              </>
            ) : (
              <></>
            )}
          </center>
        </div>
        <br />
        {/*JSON.stringify(response, <br />, 2)*/}
      </div>
    </div>
  );
}

export default App;
