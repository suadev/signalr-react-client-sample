
import './App.css';
import React, { Component } from 'react';
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@aspnet/signalr';
import * as protocols from '@aspnet/signalr-protocol-msgpack';

let hubConnectionOptions = {
  transport: HttpTransportType.WebSockets,
  logging: LogLevel.Trace,
  accessTokenFactory: function () {
    // access_token here
    return 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzYjY5OWVlODg3NjMxNDViZjM1MGVjN2M0MzQyOTZjIiwidHlwIjoiSldUIn0.eyJuYmYiOjE1NzYxMzUyMDgsImV4cCI6MTU3NjE3MTIwOCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAwIiwiYXVkIjpbImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZXNvdXJjZXMiLCJwbXMuYXBpLnJlc291cmNlIl0sImNsaWVudF9pZCI6InBtcy5hcGkuY2xpZW50Iiwic3ViIjoiOWJkZDEyZDEtZTZiOC00NDQ2LWJhNjctZmI3ZDRjNjdhMTI5IiwiYXV0aF90aW1lIjoxNTc2MTM1MjA3LCJpZHAiOiJsb2NhbCIsInRlbmFudElkIjoiNThlNGExOTctNjI4Yi00ZDFhLTg4NjgtNmZhMDIxZmI3MzU3IiwidGVuYW50Q29kZSI6InByb3RlbCIsInByb3BlcnR5SWQiOiIyZDg1MmIzZi1kZDFhLTRkMWYtOGU2Zi01ZTQwODkyY2IzZjIiLCJPV05FUiI6IiIsInNjb3BlIjpbInBtcy5hcGkucmVzb3VyY2UiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.q3DNo2_EHVtitvt_PBD1AIUUEqcQ4b3a7-6miSs73F51Z4LX-b0ygxfrAejJJio-vmx0OqG21IwfaaPKldhdG6Tqu_PoWM6yOfBcXMD6DAzLNFWdo67BJKrw2CCnWvsNiWelq4gWE97SrAj8luSjOYmhLB9pncPVgQk6ej0X0IQXcNFlTDNOF7M3Mv5qL9MnVEJWgHMSWhsCKKAXrQXxhrDP3rMJ5YDCHT9bgc0dBSpBKMwqvkCWNJbHarhBnZWKkhc3owugcn4WNxdrUk-Z8_n0VZJx5c4HqzsS5pRdhi7bmHyPYjD1MwtfSlDMY3lwPTBLmtIgyIHku_4KlidDtQ';
  }
};

const hubConnection = new HubConnectionBuilder()
  .withUrl(`http://localhost:5000/hubs/update-tracker`, hubConnectionOptions)
  // .withHubProtocol(new protocols.MessagePackHubProtocol())
  .configureLogging(LogLevel.Debug) // set loggingg level here
  .build();

let connectionRetryAttempt = 0;
hubConnection.onclose(() => {
  starthub();
});

function starthub() {

  hubConnection.start()
    .catch(function () {
      connectionRetryAttempt++;
      let sleepDuration = 1000 * (connectionRetryAttempt > 5 ? 60 : Math.pow(2, connectionRetryAttempt));
      setTimeout(() => starthub(), sleepDuration);
    }).then(() => {
      hubConnection.invoke('JoinGroup', 'ResourceTrackers');
    });
}

hubConnection.on("ResourceUpdated", data => {
  alert(JSON.stringify(data));
});

class App extends Component {
  constructor(props) {
    super(props);
    starthub();
  }

  handleEvent() {
    hubConnection.invoke("ResourceUpdated",
      {
        ResourceId: "ef832457-e24a-4bc7-b769-e5d3bc36e254",
        ResourceType: "Type"
      }
    );
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.handleEvent}>Invoke Hub Method called 'ResourceUpdated'</button>
      </div>
    );
  }
}

export default App;