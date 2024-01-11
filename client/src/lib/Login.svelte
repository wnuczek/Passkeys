<script lang="ts">
  import { startAuthentication } from "@simplewebauthn/browser";

  let userName: string;

  // messages
  let successMsg = "";
  let errorMsg = "";

  // Start authentication when the user clicks a button
  const login = async () => {
    // Reset success/error messages
    successMsg = "";
    errorMsg = "";

    // GET authentication options from the endpoint that calls
    // @simplewebauthn/server -> generateAuthenticationOptions()

    const url =
      "http://localhost:5001/wnuczek-testing/us-central1/generateAuthenticationOptions?" +
      new URLSearchParams({ userEmail: userName });

    const options: RequestInit = { method: "get" };

    const resp = await fetch(url, options);

		

		const json = await resp.json()
		console.log(json)

    let asseResp;
    try {
      // Pass the options to the authenticator and wait for a response
      asseResp = await startAuthentication(json, false);
			console.log(asseResp)
    } catch (error: any) {
      // Some basic error handling
      errorMsg = error;
      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyAuthenticationResponse()
    const verificationResp = await fetch(
      "http://localhost:5001/wnuczek-testing/us-central1/verifyAuthenticationResponse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
				body: JSON.stringify({...asseResp, userEmail: userName}),
      }
    );

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

<button on:click={login}> Login </button>
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
