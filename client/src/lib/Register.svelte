<script lang="ts">
  import { startRegistration } from "@simplewebauthn/browser";

  // messages
  let successMsg = "";
  let errorMsg = "";

	let userName: string;

  // Start registration when the user clicks a button
  const register = async () => {
    // Reset success/error messages
    successMsg = "";
    errorMsg = "";

    // GET registration options from the endpoint that calls
    // @simplewebauthn/server -> generateRegistrationOptions()
		const options: RequestInit = {method: 'get'}

		const url = 'http://localhost:5001/wnuczek-testing/us-central1/generateRegistrationOptions?' + new URLSearchParams({userEmail: userName})

    const resp = await fetch(url,options);

    let attResp;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(await resp.json());
			console.log(attResp)
    } catch (error: any) {
      // Some basic error handling
      if (error.name === "InvalidStateError") {
        errorMsg =
          "Error: Authenticator was probably already registered by user";
      } else {
        errorMsg = error;
      }

      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyRegistrationResponse()
    const verificationResp = await fetch("http://localhost:5001/wnuczek-testing/us-central1/verifyRegistrationResponse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...attResp, userEmail: userName}),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      successMsg = "Success!";
    } else {
      errorMsg = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
        verificationJSON
      )}</pre>`;
    }
  };
</script>

<button on:click={register}> Register </button>
<label for="username">Username</label>
<input
  type="text"
  name="username"
  autocomplete="webauthn"
  bind:value={userName}
/>
{#if errorMsg}
  <div>
    {errorMsg}
  </div>
{/if}
{#if successMsg}
  <div>
    {successMsg}
  </div>
{/if}
