<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import { StreamLanguage } from "@codemirror/language";
  import { diff } from "./diff";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { diffLines, type Change } from "diff";

  interface Props {
    source: string;
    originalSource: string;
  }

  let { source, originalSource }: Props = $props();
  let diffValue: string = $derived(getDiff(originalSource.replaceAll("\r\n", "\n"), source.replaceAll("\r\n", "\n")));


  function getDiff(text1: string, text2: string): string {
    let d = diffLines(text1, text2, { stripTrailingCr: true });
    return d
      .flatMap((x: Change) => {
        let a = x.value.split("\n");
        if (a.length > 0 && a[a.length - 1] === "") a = a.slice(0, -1);
        a = a.map((y) => (x.added ? "+ " + y : x.removed ? "- " + y : "  " + y));
        return a;
      })
      .join("\n");
  }
</script>

<div class="diff">
  <CodeMirror value={diffValue} readonly={true} extensions={[StreamLanguage.define(diff)]} theme={oneDark} tabSize={4} />
</div>

<style lang="scss">
  .diff {
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
