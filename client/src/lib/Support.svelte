<script lang="ts">
  import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
  const browserSupport = browserSupportsWebAuthn();

  const message = browserSupport
    ? "Your browser supports passkeys."
    : "Your browser does not support passkeys";
</script>

<p>
	{message}
</p>
