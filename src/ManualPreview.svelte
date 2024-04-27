<script lang="ts">
  const safecoderegex = [
    { source: /src\=\"((?!data\:)(?!https\:)[^"]+?)\"/gi, target: 'src="https://ktane.timwi.de/HTML/$1"' },
    { source: /xlink\:href\=\"((?!data\:)[^"]+?)\"/gi, target: 'xlink:href="https://ktane.timwi.de/HTML/$1"' },
    { source: /<link ([^ ]+?) href\=\"([^"])\">/gi, target: '<link $1 href="https://ktane.timwi.de/HTML/$2">' },
  ];

  export let source = "";

  let previewFrame: HTMLIFrameElement;

  let safeCode = "";
  $: {
    safeCode = convertToSafeCode(source);
    if (safeCode !== "") previewFrame.contentWindow?.postMessage("update-document::" + JSON.stringify({ text: safeCode }), "*");
  }

  function convertToSafeCode(code: string): string {
    for (let i = 0; i < safecoderegex.length; i++) {
      code = code.replace(safecoderegex[i].source, safecoderegex[i].target);
    }
    return code;
  }
</script>

<iframe src="/proxy.html" sandbox="allow-scripts" title="" class="preview-frame" bind:this={previewFrame}></iframe>

<style>
  .preview-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
