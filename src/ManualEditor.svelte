<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import { html } from "@codemirror/lang-html";
  import { oneDark } from "@codemirror/theme-one-dark";

  export let source = "editor";
</script>

<div class="editor">
  <CodeMirror bind:value={source} lang={html()} theme={oneDark} tabSize={4} placeholder={"Enter a manual name into the box above.\nThen click the button to load the manual."} />
</div>

<style lang="scss">
  .editor {
    display: flex;
    height: 100%;

    > :global(.codemirror-wrapper) {
      width: 100%;
      height: 100%;

      > :global(.cm-editor) {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
