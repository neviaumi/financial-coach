import { css, type CSSResultGroup, unsafeCSS } from "lit";
import nativeCSS from "@wa/styles/native.css?inline";
import utilitiesCSS from "@wa/styles/utilities.css?inline";
import themeCSS from "@wa/styles/themes/awesome.css?inline";
export const nativeStyles = css`
  ${unsafeCSS(nativeCSS)};
`;
export const utilitiesStyles = css`
  ${unsafeCSS(utilitiesCSS)};
`;
export const themeStyles = css`
  ${unsafeCSS(themeCSS)};
`;

export function withWAStyles(styles: CSSResultGroup = []): CSSResultGroup {
  return [nativeStyles, utilitiesStyles, ...(Array.isArray(styles) ? styles : [styles])];
}
